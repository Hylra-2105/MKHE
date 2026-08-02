import {  useState, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import { Search, Loader2, Eye, EyeOff, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import toast from "react-hot-toast";
import { reviewApi } from "@/api/reviewApi";
import Pagination from "@/components/ui/Pagination";
import Dropdown from "@/components/ui/Dropdown";
import { getImageUrl } from "@/utils/formatters";
import { FiLock } from "react-icons/fi";
import UserDetailModal from "@/features/users/components/Admin/UserDetailModal";
import { useAuthStore } from "@/stores/useAuthStore";

const ReviewManagementFeature = () => {
  const { t } = useTranslation(["admin", "common", "reviews"]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  
  const { user } = useAuthStore();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const fetchReviews = async (currentPage = page) => {
    try {
      setLoading(true);
      const res = await reviewApi.getAllReviews({ 
        page: currentPage, 
        limit: 5,
        search: appliedSearch,
        rating: ratingFilter
      });
      if (res && res.data?.success) {
        setReviews(res.data.data.reviews || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (error) {
      toast.error(t("reviews:fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page, appliedSearch, ratingFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAppliedSearch(search);
    setPage(1);
  };

  const handleToggleVisibility = async (id, currentStatus) => {
    try {
      const res = await reviewApi.toggleVisibility(id);
      if (res && res.data?.success) {
        toast.success(t("reviews:toggle_success"));
        setReviews(reviews.map((r) => r._id === id ? { ...r, isHidden: !currentStatus } : r));
      }
    } catch (error) {
      toast.error(t("reviews:toggle_error"));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("reviews:management_title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("reviews:management_subtitle")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col xl:flex-row xl:items-center gap-4 border border-mkhe-border/30">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            placeholder={t("reviews:search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          />
          <button
            type="submit"
            className="h-10 w-28 md:w-40 bg-mkhe-primary text-white px-4 md:px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold whitespace-nowrap"
          >
            {t("common:search", { defaultValue: "Tìm kiếm" })}
          </button>
        </form>
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-center">
          <Dropdown
            value={ratingFilter}
            options={[
              { value: "", label: t("reviews:filter_rating") },
              { value: "5", label: t("reviews:stars_5") },
              { value: "4", label: t("reviews:stars_4") },
              { value: "3", label: t("reviews:stars_3") },
              { value: "2", label: t("reviews:stars_2") },
              { value: "1", label: t("reviews:stars_1") },
            ]}
            onChange={(val) => {
              setRatingFilter(val);
              setPage(1);
            }}
            placeholder={t("reviews:filter_rating", { defaultValue: "Tất cả số sao" })}
            className="w-full md:w-36 lg:w-44"
            triggerClassName="h-10 px-3 rounded bg-transparent border border-mkhe-border/50 focus:border-mkhe-primary focus:outline-none transition-colors"
            optionClassName="text-sm"
          />
        </div>
      </div>

      <div className={`bg-mkhe-bg rounded shadow overflow-y-hidden border border-mkhe-border/50 min-h-[430px] transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap text-sm">
            <thead>
              <tr className="border-b border-mkhe-border/50 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
              <th className="px-4 py-3 font-semibold">{t("reviews:product")}</th>
              <th className="px-4 py-3 font-semibold">{t("reviews:user")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("reviews:rating")}</th>
              <th className="px-4 py-3 font-semibold">{t("reviews:comment")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("reviews:status")}</th>
              <th className="px-4 py-3 font-semibold text-center">{t("common:actions")}</th>
            </tr>
          </thead>
          <tbody className="text-mkhe-text">
            {loading && reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-mkhe-primary" />
                </td>
              </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-[var(--color-mkhe-text)]/50">
                    {t("reviews:no_data")}
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="border-b border-mkhe-border/50 hover:bg-mkhe-primary/5 transition-colors last:border-b-0 group">
                    <td className="px-4 py-2.5">
                      {review.product ? (
                        <a 
                          href={`/shop/${review.product.slug || review.product._id}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-semibold line-clamp-2 hover:text-mkhe-primary hover:underline transition-colors"
                        >
                          {review.product.name}
                        </a>
                      ) : (
                        <div className="font-semibold line-clamp-2">-</div>
                      )}
                      <div className="text-xs text-[var(--color-mkhe-text)]/50 mt-1">{review.product?.sku || "-"}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{review.user?.name || "-"}</div>
                      <div className="text-xs text-[var(--color-mkhe-text)]/50">{review.user?.email || "-"}</div>
                      <div className="text-[10px] text-[var(--color-mkhe-text)]/40 mt-1 italic">
                        {review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN", {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }).replace(',', ' -') : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-amber-500 text-center">
                      {review.rating} / 5
                    </td>
                    <td className="px-4 py-2.5 max-w-[220px] whitespace-normal break-words">
                      <div className="line-clamp-2">{review.comment || "-"}</div>
                      <button 
                        onClick={() => setSelectedReview(review)}
                        className="text-mkhe-primary text-xs mt-1 hover:underline cursor-pointer font-semibold block"
                      >
                        {t("common:view_details", { defaultValue: "Xem chi tiết" })}
                      </button>
                      {review.images?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {review.images.map((img, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setSelectedImage(getImageUrl(img))}
                              className="focus:outline-none cursor-zoom-in hover:opacity-80 transition-opacity"
                            >
                              <img src={getImageUrl(img)} className="w-8 h-8 object-cover border border-mkhe-border/30 rounded" alt="Review" />
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${review.isHidden ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {review.isHidden ? t("reviews:hidden") : t("reviews:visible")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(review._id, review.isHidden)}
                          className={`p-2 rounded-full transition-colors cursor-pointer w-9 h-9 flex items-center justify-center shrink-0 ${
                            review.isHidden 
                              ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                          }`}
                          title={review.isHidden ? t("reviews:show") : t("reviews:hide")}
                        >
                          {review.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        {user?.role === "Admin" && review.user && (
                          <button 
                            onClick={() => { setSelectedUser(review.user); setIsUserModalOpen(true); }}
                            className={`p-2 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center w-9 h-9 shrink-0 ${review.user.isBlocked ? "text-emerald-600 hover:bg-emerald-500/20 bg-emerald-500/10" : "text-orange-500 hover:bg-orange-500/20 bg-orange-500/10"}`}
                            title={review.user.isBlocked ? t("common:unlock_account", { defaultValue: "Mở Khóa Tài Khoản" }) : t("common:lock_account", { defaultValue: "Khóa Tài Khoản" })}
                          >
                            <FiLock size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {totalPages > 1 && (
        <Pagination 
          page={page} 
          setPage={setPage} 
          totalPages={totalPages} 
          loading={loading} 
        />
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
            <button 
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <img 
              src={selectedImage} 
              alt="Review preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedReview(null)}
        >
          <div 
            className="bg-mkhe-bg p-5 md:p-6 rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto text-mkhe-text border border-mkhe-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4 border-b border-mkhe-border/50 pb-3">
              <div>
                <h3 className="font-bold text-lg text-gradient-gold">{t("reviews:modal_title")}</h3>
                <p className="text-sm opacity-70">
                  {new Date(selectedReview.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <button 
                className="p-1.5 hover:bg-mkhe-border/20 rounded-full transition-colors cursor-pointer"
                onClick={() => setSelectedReview(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="font-semibold opacity-70 text-xs uppercase tracking-wider">{t("reviews:modal_customer")}</span>
                <p className="font-medium mt-1">{selectedReview.user?.name} ({selectedReview.user?.email})</p>
              </div>
              
              <div>
                <span className="font-semibold opacity-70 text-xs uppercase tracking-wider">{t("reviews:modal_product")}</span>
                <p className="font-medium mt-1">{selectedReview.product?.name}</p>
              </div>
              
              <div>
                <span className="font-semibold opacity-70 text-xs uppercase tracking-wider">{t("reviews:modal_rating")}</span>
                <p className="font-bold text-amber-500 mt-1">{selectedReview.rating} / 5 {t("reviews:star")}</p>
              </div>
              
              <div>
                <span className="font-semibold opacity-70 text-xs uppercase tracking-wider">{t("reviews:modal_content")}</span>
                <div className="mt-2 p-3.5 bg-mkhe-border/10 rounded-md whitespace-pre-wrap break-words border border-mkhe-border/30 max-h-[250px] overflow-y-auto leading-relaxed">
                  {selectedReview.comment}
                </div>
              </div>
              
              {selectedReview.images?.length > 0 && (
                <div>
                  <span className="font-semibold opacity-70 text-xs uppercase tracking-wider">{t("reviews:modal_images", { defaultValue: "Hình ảnh đính kèm" })}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedReview.images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedImage(getImageUrl(img))}
                        className="focus:outline-none cursor-zoom-in hover:opacity-80 transition-opacity"
                      >
                        <img src={getImageUrl(img)} className="w-20 h-20 object-cover border border-mkhe-border/30 rounded-md shadow-sm" alt={`Review image ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isUserModalOpen}
        onClose={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
        user={selectedUser}
        onRefresh={fetchReviews}
        lockOnly={true}
      />
    </div>
  );
};

export default ReviewManagementFeature;
