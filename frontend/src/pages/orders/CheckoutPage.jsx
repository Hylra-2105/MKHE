import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import orderApi from "@/api/orderApi";
import { userApi } from "@/api/userApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { ChevronLeft } from "lucide-react";

import CheckoutForm from "@/features/orders/components/Checkout/CheckoutForm";
import OrderSummary from "@/features/orders/components/Checkout/OrderSummary";
import OtpModal from "@/features/orders/components/Checkout/OtpModal";
import VoucherSelectorDrawer from "@/features/vouchers/components/VoucherSelectorDrawer";

export default function CheckoutPage() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  const { user, setUser } = useAuthStore();
  const { items, selectedItems, selectedVoucher, removeMultipleFromCart } = useCartStore();

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [shippingInfo, setShippingInfo] = useState({
    name: defaultAddress?.receiverName || user?.name || "",
    phone: defaultAddress?.receiverPhone || user?.phone || "",
    address: defaultAddress?.addressText || "",
    coordinates: defaultAddress?.coordinates || JSON.parse(localStorage.getItem("mkhe_saved_coordinates")) || null,
    isDefault: defaultAddress?.isDefault || false,
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSending, setOtpSending] = useState(false);

  const checkoutItems = buyNowItem 
    ? [buyNowItem] 
    : items.filter((item) => selectedItems.includes(item.product._id));
  const subtotal = checkoutItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  
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
        }
      } catch (err) {
        console.error("Lỗi fetch order stats:", err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (orderStats.cancelRate > 0.7 && orderStats.totalOrders >= 3 && paymentMethod === "COD") {
      setPaymentMethod("BANK_TRANSFER");
    }
  }, [orderStats, paymentMethod]);

  useEffect(() => {
    if (!buyNowItem && checkoutItems.length === 0 && !isSuccess) {
      toast.error(t("errors.no_items"));
      navigate("/cart"); // Or shop
    }
  }, [checkoutItems.length, navigate, isSuccess, buyNowItem]);


  const handleSendOtp = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      toast.error(t("errors.missing_info"));
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

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      toast.error(t("errors.missing_info"));
      return;
    }

    const isTrustedDevice = localStorage.getItem("is_trusted_device") === "true";

    if (paymentMethod === "COD" && !isTrustedDevice && !showOtpModal) {
      handleSendOtp();
      return;
    }

    if (paymentMethod === "COD" && !isTrustedDevice && otp.length !== 6) {
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
        otp: (paymentMethod === "COD" && !isTrustedDevice) ? otp : undefined,
        voucherId: selectedVoucher?._id,
        isTrustedDevice: paymentMethod === "COD" ? isTrustedDevice : undefined,
      };

      const res = await orderApi.checkout(payload);
      if (res.success) {
        if (paymentMethod === "COD" && !isTrustedDevice) {
           localStorage.setItem("is_trusted_device", "true");
        }
        setIsSuccess(true);
        if (!buyNowItem) {
          await removeMultipleFromCart(checkoutItems.map(i => i.product._id), true);
        }
        toast.success(t("success.order_placed"));
        setShowOtpModal(false);
        navigate("/checkout/success", { state: { order: res.data } });
      }
    } catch (error) {
      if (error.response?.data?.message === "VALIDATION_ERROR" && error.response.data.errors?.length > 0) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(error.response?.data?.message || t("errors.order_failed"));
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
