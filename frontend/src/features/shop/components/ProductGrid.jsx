import React, { useState } from "react";
import { formatNumber, getImageUrl } from "@/utils/formatters";
import { Fingerprint, Star, ArrowUpRight, PlayCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Import hàm kiểm tra video từ validators đã có sẵn
import { isVideoMedia } from "@/utils/validators";

const ProductGrid = ({ products, loading, isDesktopFilterOpen }) => {
  const { t } = useTranslation("product");
  const navigate = useNavigate();

  const gridColsClass = isDesktopFilterOpen 
    ? 'min-[1024px]:grid-cols-3 min-[1200px]:grid-cols-4' 
    : 'min-[900px]:grid-cols-4';

  if (loading && (!products || products.length === 0)) {
    return (
      <div className={`grid grid-cols-2 min-[600px]:grid-cols-3 ${gridColsClass} gap-4 sm:gap-6 pb-12`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse bg-mkhe-border/10 rounded-3xl aspect-[4/5]"></div>
        ))}
      </div>
    );
  }

  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-mkhe-text/50">
        <Star className="w-16 h-16 mb-6 opacity-20 animate-pulse" />
        <p className="text-xl font-light tracking-widest uppercase">{t("shop.not_found")}</p>
      </div>
    );
  }

  return (
    <div className="relative pb-12 min-h-[400px]">
      {/* Lớp phủ loading mượt mà, giữ nguyên layout */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-[2px] rounded-3xl transition-all">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
          </div>
        </div>
      )}
      
      <div className={`grid grid-cols-2 min-[600px]:grid-cols-3 ${gridColsClass} gap-4 sm:gap-8 transition-opacity duration-300 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      {products.map((product) => {
        const mainMedia = product.images && product.images.length > 0 ? product.images[0] : null;
        const mediaUrl = getImageUrl(mainMedia);
        const isVideo = mainMedia ? isVideoMedia(mainMedia) : false;

        return (
          <div 
            key={product._id}
            onClick={() => navigate(`/shop/${product._id}`)}
            className="group relative flex flex-col gap-4 cursor-pointer transform transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 hover:z-10"
          >
            {/* Image/Video container */}
            <div className={`relative w-full overflow-hidden rounded-3xl bg-mkhe-border/10 shadow-sm transition-shadow duration-500 aspect-[4/5] ${product.status !== 'OUT_OF_STOCK' ? 'group-hover:shadow-xl' : ''}`}>
              {mediaUrl ? (
                isVideo ? (
                  <video 
                    src={mediaUrl}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ease-out ${product.status === 'OUT_OF_STOCK' ? 'opacity-80' : ''}`}
                  />
                ) : (
                  <img 
                    src={mediaUrl} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=600&q=80"; 
                    }}
                    className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ease-out ${product.status === 'OUT_OF_STOCK' ? 'opacity-80' : ''}`}
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-mkhe-primary/5">
                  <Star className="w-12 h-12 text-mkhe-text/20" />
                </div>
              )}



              {/* Central Badge for OUT_OF_STOCK */}
              {product.status === "OUT_OF_STOCK" && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-gray-800/90 text-white px-6 py-2 shadow-2xl backdrop-blur-md text-xs md:text-sm font-black uppercase tracking-[0.2em] border border-white/20 transform -rotate-12">
                    {t("shop.detail.out_of_stock", { defaultValue: "Tạm hết" })}
                  </div>
                </div>
              )}

              {/* Badges TOP LEFT */}
              <div className="absolute top-4 left-4 flex flex-col gap-3 items-start">

                {product.hasDPP && (
                  <div className="bg-mkhe-primary/90 text-white p-2 rounded-full shadow-lg backdrop-blur-md transform transition-transform group-hover:rotate-12" title={t("shop.digital_passport")}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                )}
                {isVideo && (
                  <div className="bg-black/50 text-white p-2 rounded-full shadow-lg backdrop-blur-md" title={t("shop.video")}>
                    <PlayCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Vendor & Category TOP RIGHT */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                {product.vendor && (
                  <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-[10px] font-bold text-white tracking-[0.1em]">{product.vendor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info BLOCK - Outside */}
            <div className="flex flex-col gap-1 px-1">
              <h3 className="text-base md:text-lg font-medium text-mkhe-text line-clamp-1 h-6 transition-colors group-hover:text-mkhe-primary leading-snug" title={product.name}>
                {product.name}
              </h3>
              <p className="text-lg font-bold text-mkhe-primary mt-1">
                {formatNumber(product.price)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
};

export default ProductGrid;
