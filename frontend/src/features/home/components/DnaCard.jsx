import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { isVideoMedia } from "@/utils/validators";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const DnaCard = ({ 
  item, 
  idx, 
  itemsPerView, 
  isHoveredCard, 
  isDimmed,
  isMobile,
  onHover, 
  onLeave 
}) => {
  const { t, i18n } = useTranslation("home");
  const navigate = useNavigate();
  const dragStartPos = React.useRef({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e) => {
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    // Threshold of 5px to distinguish between click and drag
    if (dx > 5 || dy > 5) {
      e.preventDefault();
      return;
    }
    navigate(`/shop/${item._id}`);
  };

  // === TÍNH TOÁN HIỆU ỨNG 2D/3D ===
  // Vẫn giữ hiệu ứng cong/nghiêng 3D trên mobile để đẹp mắt
  const rotateY = isHoveredCard ? 0 : (idx % 2 === 0 ? -10 : 10);
  const skewAngle = isHoveredCard ? 0 : (idx % 2 === 0 ? -6 : 6);
  // NHƯNG Không phóng to (scale/translateZ) trên mobile để tránh vỡ layout ngang
  const cardScale = isHoveredCard && !isMobile ? 1.25 : 1; 
  const translateZ = isHoveredCard && !isMobile ? '100px' : '0';
  const cardZIndex = isHoveredCard ? 50 : 1;
  const cardOpacity = isDimmed && !isMobile ? 0.4 : 1;  

  return (
    <div
      className="flex-shrink-0 px-2 sm:px-3 lg:px-4 group cursor-pointer"
      style={{ 
        width: `${100 / itemsPerView}%`,
        zIndex: cardZIndex, 
        opacity: cardOpacity,
        transition: "opacity 0.4s ease, z-index 0.4s"
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <div
        className="max-w-[500px] mx-auto"
        style={{
          transform: `rotateY(${rotateY}deg) scale(${cardScale}) translateZ(${translateZ})`,
          transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        <div className="relative aspect-[9/13]">
          <div
            className={`absolute inset-0 rounded-2xl mb-6 md:mb-8 shadow-2xl border bg-gradient-to-br from-mkhe-bg/30 to-mkhe-bg/10 overflow-hidden transition-all duration-500
              ${isHoveredCard ? 'border-mkhe-primary shadow-[0_30px_60px_rgba(212,163,115,0.4)]' : 'border-[#D4A373]/30'}
            `}
            style={{
              transform: `skewY(${skewAngle}deg)`,
              transition: "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {/* ẢNH/VIDEO SẢN PHẨM SẠCH SẼ, TRƠN TRU */}
            {(() => {
              const srcUrl = item.image || item.thumbnail || (item.images && item.images.length > 0 ? item.images[0] : null);
              if (!srcUrl) return <div className="w-full h-full bg-gradient-to-br from-[#A6714A]/40 to-[#3B1F0C]/80" />;
              
              const isVideo = isVideoMedia(srcUrl);
              
              if (isVideo) {
                return (
                  <video
                    src={srcUrl}
                    className="w-full h-full object-cover transition-transform duration-700"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                );
              }
              return (
                <img
                  src={srcUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop if fallback also fails
                    const fallbackName = item.name ? encodeURIComponent(item.name.substring(0, 15)) : "No+Image";
                    e.target.src = `https://placehold.co/800x800/D4A373/FFFFFF.png?text=${fallbackName}`;
                  }}
                />
              );
            })()}

            {/* MINI POPUP PANEL (CHỈ HIỆN KHI HOVER TRÊN DESKTOP) */}
            {!isMobile && (
              <div 
                className={`absolute inset-0 flex flex-col justify-end p-4 z-20 transition-all duration-500
                  ${isHoveredCard ? 'bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-100 translate-y-0' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 translate-y-4 pointer-events-none'}
                `}
              >
                <div className="flex flex-col gap-2 transform transition-all duration-500 delay-100">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => {
                      const rating = item.ratingAverage || 0;
                      return (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 text-mkhe-primary ${i < Math.round(rating) ? "fill-mkhe-primary" : "fill-transparent"}`} 
                        />
                      );
                    })}
                    <span className="text-[10px] text-white/70 ml-1">({item.ratingCount || 0})</span>
                  </div>

                  {/* Tên & Giá bên trong Popup */}
                  <h4 className="font-bold text-white text-sm line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-mkhe-primary font-bold text-base drop-shadow-md">
                    {item.price?.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {i18n.language === 'vi' ? 'đ' : 'VND'}
                  </p>

                  {/* Nút Xem Chi Tiết */}
                  <div className="flex items-center mt-2 w-full">
                    <button 
                      onClick={() => navigate(`/shop/${item._id}`)}
                      className="w-full bg-mkhe-primary hover:bg-[#C38D64] text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      {t("dna.view_details", "Xem chi tiết")}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* THÔNG TIN SẢN PHẨM BÊN DƯỚI */}
        <div className="flex flex-col items-center mt-2">
          <h4 className="text-center font-bold text-mkhe-text text-xs italic line-clamp-2 transition-colors duration-300 group-hover:text-mkhe-primary h-7">
            {item.name}
          </h4>
          {isMobile && (
            <p className="text-mkhe-primary font-bold text-sm mt-0.5">
              {item.price?.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {i18n.language === 'vi' ? 'đ' : 'VND'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DnaCard;