import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import orderApi from "@/api/orderApi";
import { userApi } from "@/api/userApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { ChevronLeft } from "lucide-react";

import CheckoutForm from "@/features/orders/components/Checkout/CheckoutForm";
import OrderSummary from "@/features/orders/components/Checkout/OrderSummary";
import OtpModal from "@/features/orders/components/Checkout/OtpModal";
import VoucherSelectorDrawer from "@/features/vouchers/components/VoucherSelectorDrawer";

export default function CheckoutPage() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const location = useLocation();
  const initialBuyNowItem = location.state?.buyNowItem;
  const [localBuyNowItem, setLocalBuyNowItem] = useState(initialBuyNowItem);
  const { user, setUser } = useAuthStore();
  const { items, selectedItems, selectedVoucher, removeMultipleFromCart, updateProductInItems } = useCartStore();
  const { socket } = useSocketStore();

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [shippingInfo, setShippingInfo] = useState({
    name: defaultAddress?.receiverName || user?.name || "",
    phone: defaultAddress?.receiverPhone || user?.phone || "",
    address: defaultAddress?.addressText || "",
    coordinates: defaultAddress?.coordinates || JSON.parse(localStorage.getItem("mkhe_saved_coordinates")) || null,
    isDefault: defaultAddress?.isDefault || false,
    _id: defaultAddress?._id || null,
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  // Listen to product updates
  useEffect(() => {
    if (socket) {
      const handleProductUpdate = (updatedProduct) => {
        // Update local buyNowItem if it matches
        if (localBuyNowItem && localBuyNowItem.product._id === updatedProduct._id) {
          setLocalBuyNowItem({ ...localBuyNowItem, product: updatedProduct });
        }
        // Also update cart items in store if it exists there
        if (updateProductInItems) {
          updateProductInItems(updatedProduct);
        }
      };
      
      socket.on("product_updated", handleProductUpdate);
      return () => {
        socket.off("product_updated", handleProductUpdate);
      };
    }
  }, [socket, localBuyNowItem, updateProductInItems]);

  const checkoutItems = localBuyNowItem 
    ? [localBuyNowItem] 
    : items.filter((item) => selectedItems.includes(item.product._id));
  const subtotal = checkoutItems.reduce((total, item) => {
    const product = item.product;
    const now = new Date();
    const isSaleValid = product.salePrice > 0 && product.saleStartDate && product.saleEndDate 
                        && new Date(product.saleStartDate) <= now && new Date(product.saleEndDate) >= now;
    const effectivePrice = isSaleValid ? product.salePrice : product.price;
    return total + effectivePrice * item.quantity;
  }, 0);
  
  // Calculate discount logic again to display
  let discountAmount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.type === "FIXED_AMOUNT") {
      discountAmount = selectedVoucher.discountValue;
    } else if (selectedVoucher.type === "PERCENTAGE") {
      let calc = (subtotal * selectedVoucher.discountValue) / 100;
      if (selectedVoucher.maxDiscount) calc = Math.min(calc, selectedVoucher.maxDiscount);
      discountAmount = calc;
    }
  }
  
  const shippingFee = 0;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderStats, setOrderStats] = useState({ cancelRate: 0, totalOrders: 0, canceledOrders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await orderApi.getMyOrderStats();
        if (data.success) {
          setOrderStats(data.data);
          if (data.data.cancelRate > 0.7 && data.data.totalOrders >= 3 && paymentMethod === "COD") {
            setPaymentMethod("BANK_TRANSFER");
          }
        }
      } catch (err) {
        console.error("Lỗi fetch order stats:", err);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  useEffect(() => {
    if (!localBuyNowItem && checkoutItems.length === 0 && !isSuccess) {
      toast.error(t("errors.no_items"));
      navigate("/cart"); // Or shop
    }
  }, [checkoutItems.length, navigate, isSuccess, localBuyNowItem, t]);


  const handleSendOtp = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      toast.error(t("errors.missing_info"));
      return;
    }
    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast.error("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setOtpSending(true);
    try {
      const res = await orderApi.sendCheckoutOtp({ paymentMethod });
      if (res.success) {
        toast.success(t("success.otp_sent"));
        setShowOtpModal(true);
      }
    } catch (error) {
      if (error.response?.data?.message === "VALIDATION_ERROR" && error.response.data.errors?.length > 0) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(error.response?.data?.message || t("errors.otp_failed"));
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleCheckout = async (e, directOtp = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      toast.error(t("errors.missing_info"));
      return;
    }

    const phoneRegex = /^(0|\+84)[1-9][0-9]{8,9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast.error("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    const isTrustedDevice = localStorage.getItem("is_trusted_device") === "true";

    if (paymentMethod === "COD" && !isTrustedDevice && !showOtpModal) {
      handleSendOtp();
      return;
    }

    const finalOtp = directOtp || otp;

    if (paymentMethod === "COD" && !isTrustedDevice && finalOtp.length !== 6) {
      toast.error(t("errors.invalid_otp"));
      return;
    }

    setIsSubmitting(true);
    try {
      const hasAddresses = user?.addresses?.length > 0;
      if (!hasAddresses) {
        const payloadAddress = {
          receiverName: shippingInfo.name,
          receiverPhone: shippingInfo.phone,
          addressText: shippingInfo.address,
          coordinates: shippingInfo.coordinates,
          isDefault: true
        };
        const resAddress = await userApi.addAddress(payloadAddress);
        if (resAddress.success) {
          setUser(resAddress.data);
        }
      }

      const payload = {
        shippingInfo,
        items: checkoutItems.map(i => ({ productId: i.product._id, quantity: i.quantity })),
        paymentMethod,
        otp: (paymentMethod === "COD" && !isTrustedDevice) ? finalOtp : undefined,
        voucherId: selectedVoucher?._id,
        isTrustedDevice: paymentMethod === "COD" ? isTrustedDevice : undefined,
        note,
      };

      const res = await orderApi.checkout(payload);
      if (res.success) {
        if (paymentMethod === "COD" && !isTrustedDevice) {
           localStorage.setItem("is_trusted_device", "true");
        }
        setIsSuccess(true);
        if (!localBuyNowItem) {
          await removeMultipleFromCart(checkoutItems.map(i => i.product._id), true);
        }
        useCartStore.getState().setSelectedVoucher(null);
        setShowOtpModal(false);
        const orderData = res.data.order || res.data;
        
        if (res.data.payosData) {
          navigate("/checkout/success", { state: { orderData, payosData: res.data.payosData } });
        } else {
          navigate("/checkout/success", { state: { orderData } });
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      const backendErrorDetails = error.response?.data?.errors;
      
      if (errorMsg === "VALIDATION_ERROR" && error.response.data.errors?.length > 0) {
        toast.error(error.response.data.errors[0].message);
      } else if (errorMsg && errorMsg.startsWith("INSUFFICIENT_STOCK:")) {
        const productName = errorMsg.split(":")[1];
        toast.error(`${t("errors.insufficient_stock")} ${productName}`);
      } else {
        toast.error(typeof backendErrorDetails === 'string' ? backendErrorDetails : (errorMsg || t("errors.order_failed")));
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  if (checkoutItems.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button onClick={() => navigate(-1)} className="flex items-center text-mkhe-text/60 hover:text-mkhe-primary mb-6 transition-colors w-fit cursor-pointer group">
        <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
        {t("actions.back")}
      </button>
      
      <h1 className="text-3xl font-serif text-mkhe-primary mb-8">{t("title")}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <CheckoutForm 
          shippingInfo={shippingInfo}
          setShippingInfo={setShippingInfo}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          userEmail={user?.email}
          user={user}
          orderStats={orderStats}
          note={note}
          setNote={setNote}
        />

        <OrderSummary 
          checkoutItems={checkoutItems}
          subtotal={subtotal}
          shippingFee={shippingFee}
          discountAmount={discountAmount}
          totalAmount={totalAmount}
          handleCheckout={handleCheckout}
          isSubmitting={isSubmitting}
          otpSending={otpSending}
          selectedVoucher={selectedVoucher}
          onOpenVoucherDrawer={() => setIsVoucherDrawerOpen(true)}
        />
      </div>

      <VoucherSelectorDrawer 
        isOpen={isVoucherDrawerOpen}
        onClose={() => setIsVoucherDrawerOpen(false)}
        cartItems={checkoutItems}
        cartTotal={subtotal}
        selectedVoucherId={selectedVoucher?._id}
        onSelectVoucher={useCartStore.getState().setSelectedVoucher}
      />

      <OtpModal 
        user={user}
        setOtp={setOtp}
        showOtpModal={showOtpModal}
        setShowOtpModal={setShowOtpModal}
        handleCheckout={handleCheckout}
        handleSendOtp={handleSendOtp}
        isSubmitting={isSubmitting}
        otpSending={otpSending}
      />
    </div>
  );
}
