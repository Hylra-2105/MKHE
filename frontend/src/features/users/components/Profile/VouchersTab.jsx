import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Gift, Loader2 } from "lucide-react";
import { getPublicVouchersApi, getUserWalletApi, collectVoucherApi } from "@/api/voucherApi";
import VoucherCard from "@/features/vouchers/components/VoucherCard";
import toast from "react-hot-toast";

const VouchersTab = () => {
  const { t } = useTranslation(["user", "cart"]);
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectingId, setCollectingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [publicRes, walletRes] = await Promise.all([
        getPublicVouchersApi(),
        getUserWalletApi()
      ]);

      const walletData = walletRes.data;
      const publicData = publicRes.data;

      if (walletData.success && walletData.data) {
        setWallet(walletData.data);
      }
      
      if (publicData.success && publicData.data) {
        const walletVoucherIds = walletData.data?.map(uv => uv.voucher?._id) || [];
        // Lọc bỏ những public voucher đã có trong ví
        const availablePublic = publicData.data.filter(v => !walletVoucherIds.includes(v._id));
        setPublicVouchers(availablePublic);
      }
    } catch (error) {
      console.error("Lỗi khi tải voucher:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCollect = async (voucherId) => {
    try {
      setCollectingId(voucherId);
      const res = await collectVoucherApi(voucherId);
      const responseData = res.data;
      if (responseData.success) {
        toast.success(t("cart:voucher_saved", { defaultValue: "Đã lưu mã giảm giá thành công" }));
        fetchData(); // Tải lại để cập nhật danh sách
      } else {
        toast.error(responseData.message || "Lỗi khi lưu mã");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu mã");
    } finally {
      setCollectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-mkhe-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 h-full flex flex-col overflow-y-auto custom-scrollbar bg-[var(--color-mkhe-bg)]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-mkhe-primary/10 flex items-center justify-center">
          <Gift className="w-6 h-6 text-mkhe-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-logo text-gradient-gold">
            {t("profile.vouchers", { defaultValue: "Ví Voucher" })}
          </h2>
          <p className="text-sm text-mkhe-text/60 mt-1">
            {t("profile.vouchers_desc", { defaultValue: "Quản lý và thu thập các mã giảm giá của bạn" })}
          </p>
        </div>
      </div>

      {publicVouchers.length > 0 && (
        <div className="mb-10">
          <h3 className="text-lg font-bold text-mkhe-text mb-4 border-l-4 border-mkhe-primary pl-3">
            {t("profile.public_vouchers", { defaultValue: "Mã Ưu Đãi Mới" })}
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {publicVouchers.map((voucher) => (
              <VoucherCard
                key={voucher._id}
                voucher={voucher}
                isEligible={true}
                mode="public"
                onCollect={handleCollect}
                isCollecting={collectingId === voucher._id}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-mkhe-text mb-4 border-l-4 border-mkhe-primary pl-3">
          {t("profile.my_wallet", { defaultValue: "Ví của tôi" })}
        </h3>
        {wallet.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-mkhe-text/50 bg-mkhe-card rounded-2xl border border-mkhe-border/20">
            <Gift className="w-16 h-16 opacity-20 mb-4" />
            <p>{t("profile.empty_wallet", { defaultValue: "Ví voucher đang trống" })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {wallet.map((userVoucher) => (
              <div key={userVoucher._id} className="relative">
                <VoucherCard
                  voucher={userVoucher.voucher}
                  userVoucherId={userVoucher._id}
                  isEligible={userVoucher.status === "AVAILABLE"}
                  mode="wallet"
                />
                {userVoucher.status === "USED" && (
                  <div className="absolute inset-0 bg-mkhe-bg/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                    <span className="font-bold text-mkhe-text text-lg px-4 py-1 bg-mkhe-card/80 border border-mkhe-border/50 rounded-lg shadow-sm transform -rotate-12">
                      {t("profile.voucher_used", { defaultValue: "ĐÃ SỬ DỤNG" })}
                    </span>
                  </div>
                )}
                {userVoucher.status === "EXPIRED" && (
                  <div className="absolute inset-0 bg-mkhe-bg/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                    <span className="font-bold text-red-500/80 text-lg px-4 py-1 bg-mkhe-card/80 border border-red-500/20 rounded-lg shadow-sm transform -rotate-12">
                      {t("profile.voucher_expired", { defaultValue: "ĐÃ HẾT HẠN" })}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VouchersTab;
