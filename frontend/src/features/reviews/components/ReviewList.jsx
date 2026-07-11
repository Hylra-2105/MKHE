import {  useState, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import { Star, User, ChevronDown } from "lucide-react";
import { reviewApi } from "@/api/reviewApi";

const ReviewList = ({ productId }) => {
  const { t } = useTranslation(["common", "reviews"]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewApi.getReviewsByProduct(productId);
        if (response && response.data?.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-[var(--color-mkhe-border)]/20 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-[var(--color-mkhe-border)]/20 rounded"></div><div className="h-4 bg-[var(--color-mkhe-border)]/20 rounded w-5/6"></div></div></div></div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--color-mkhe-input)]/20 rounded-2xl border border-[var(--color-mkhe-border)]/10">
        <p className="text-[var(--color-mkhe-text)]/60">
          {t("reviews:no_reviews")}
        </p>
      </div>
    );
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-serif text-[var(--color-mkhe-text)]">
        {t("reviews:customer_reviews")} ({reviews.length})
      </h3>
      
      <div className="space-y-4">
        {visibleReviews.map((review) => (
          <div key={review._id} className="p-6 bg-[var(--color-mkhe-input)]/30 rounded-2xl border border-[var(--color-mkhe-border)]/10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/20 flex items-center justify-center overflow-hidden">
                  {review.user?.avatar ? (
                    <img src={review.user.avatar} alt={review.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-[var(--color-mkhe-text)]/40" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--color-mkhe-text)]">{review.user?.name || "Khách hàng"}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-[var(--color-mkhe-border)]/30 fill-[var(--color-mkhe-input)]"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--color-mkhe-text)]/40">
                      {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {review.comment && (
              <p className="text-sm text-[var(--color-mkhe-text)]/80 leading-relaxed mb-4">
                {review.comment}
              </p>
            )}

            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.images.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-mkhe-border)]/20 cursor-pointer hover:opacity-90 transition-opacity">
                    <img src={img} alt="Review" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length > 2 && (
        <div className="pt-2 flex justify-center">
          <button 
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-6 py-2 border border-[var(--color-mkhe-border)]/20 rounded-full text-sm font-medium hover:bg-[var(--color-mkhe-input)] transition-colors text-[var(--color-mkhe-text)]/80 cursor-pointer"
          >
            {showAll 
              ? t("reviews:show_less") 
              : t("reviews:view_all", { count: reviews.length })
            }
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
