import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { reviewApi } from "@/api/reviewApi";
import Pagination from "@/components/ui/Pagination";
import { getImageUrl } from "@/utils/formatters";

const ReviewManagementFeature = () => {
  const { t } = useTranslation(["admin", "common", "reviews"]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async (currentPage = page) => {
    try {
      setLoading(true);
      const res = await reviewApi.getAllReviews({ page: currentPage, limit: 10 });
      if (res && res.data?.success) {
        setReviews(res.data.data.reviews || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (error) {
      toast.error(t("reviews:fetch_error", { defaultValue: "Lỗi tải danh sách đánh giá" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const handleToggleVisibility = async (id, currentStatus) => {
    try {
      const res = await reviewApi.toggleVisibility(id);
      if (res && res.data?.success) {
        toast.success(t("reviews:toggle_success", { defaultValue: "Đã cập nhật trạng thái hiển thị" }));
        setReviews(reviews.map((r) => r._id === id ? { ...r, isHidden: !currentStatus } : r));
      }
    } catch (error) {
      toast.error(t("reviews:toggle_error", { defaultValue: "Lỗi cập nhật trạng thái" }));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-mkhe-text">
          {t("reviews:management_title", { defaultValue: "Quản lý Đánh giá" })}
        </h1>
      </div>

      <div className="bg-[var(--color-mkhe-bg)] rounded-xl border border-[var(--color-mkhe-border)]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--color-mkhe-text)]">
            <thead className="bg-[var(--color-mkhe-input)]/50 text-[var(--color-mkhe-text)]/70 uppercase font-medium">
              <tr>
                <th className="px-4 py-3">{t("reviews:product", { defaultValue: "Sản phẩm" })}</th>
                <th className="px-4 py-3">{t("reviews:user", { defaultValue: "Khách hàng" })}</th>
                <th className="px-4 py-3">{t("reviews:rating", { defaultValue: "Đánh giá" })}</th>
                <th className="px-4 py-3">{t("reviews:comment", { defaultValue: "Bình luận" })}</th>
                <th className="px-4 py-3 text-center">{t("reviews:status", { defaultValue: "Trạng thái" })}</th>
                <th className="px-4 py-3 text-right">{t("common:actions", { defaultValue: "Thao tác" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-mkhe-border)]/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-mkhe-primary" />
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-[var(--color-mkhe-text)]/50">
                    {t("reviews:no_data", { defaultValue: "Không có đánh giá nào." })}
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-[var(--color-mkhe-input)]/20">
                    <td className="px-4 py-3">
                      <div className="font-semibold line-clamp-2">{review.product?.name || "-"}</div>
                      <div className="text-xs text-[var(--color-mkhe-text)]/50">{review.product?.sku || "-"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{review.user?.name || "-"}</div>
                      <div className="text-xs text-[var(--color-mkhe-text)]/50">{review.user?.email || "-"}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-500">
                      {review.rating} / 5
                    </td>
                    <td className="px-4 py-3">
                      <div className="line-clamp-2">{review.comment || "-"}</div>
                      {review.images?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {review.images.map((img, idx) => (
                            <a href={getImageUrl(img)} target="_blank" rel="noreferrer" key={idx}>
                              <img src={getImageUrl(img)} className="w-8 h-8 object-cover border border-mkhe-border/30 rounded" alt="Review" />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${review.isHidden ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                        {review.isHidden ? t("reviews:hidden", { defaultValue: "Bị Ẩn" }) : t("reviews:visible", { defaultValue: "Hiển thị" })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleVisibility(review._id, review.isHidden)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          review.isHidden 
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
                            : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                        }`}
                        title={review.isHidden ? t("reviews:show", { defaultValue: "Hiện đánh giá" }) : t("reviews:hide", { defaultValue: "Ẩn đánh giá" })}
                      >
                        {review.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-[var(--color-mkhe-border)]/10">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewManagementFeature;
