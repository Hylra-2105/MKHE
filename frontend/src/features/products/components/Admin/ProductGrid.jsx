import { useTranslation } from "react-i18next";
import { Edit2, Trash2, Dna, Package } from "lucide-react";
import { isVideoMedia } from "@/utils/validators";

const ProductGrid = ({ products, loading, onEdit }) => {
  const { t } = useTranslation("product");

  return (
    <div className={`relative min-h-[420px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
          </div>
        </div>
      )}

      {!loading && (!products || products.length === 0) ? (
        <div className="flex flex-col justify-center items-center h-48 bg-mkhe-border/5 rounded border border-mkhe-border/30">
          <Package className="w-12 h-12 mb-2 text-mkhe-text/30" />
          <span className="text-mkhe-text/60">{t("table.empty", { defaultValue: "Không có sản phẩm nào trong kho." })}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <div key={product._id} className="bg-mkhe-bg border border-mkhe-primary/40 rounded shadow-[0_0_10px_rgba(197,160,89,0.1)] overflow-hidden flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(197,160,89,0.25)]">
          <div className="relative aspect-square bg-mkhe-border/10 overflow-hidden cursor-pointer" onClick={() => onEdit(product)}>
            {product.images && product.images.length > 0 ? (
              isVideoMedia(product.images[0]) ? (
                <video
                  src={product.images[0]}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-mkhe-text/30">
                <Package className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-xs uppercase tracking-widest font-semibold">No Image</span>
              </div>
            )}

            {/* Trạng thái */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border ${
                  product.status === "PUBLISHED"
                    ? "bg-emerald-500/90 text-white border-emerald-500/30"
                    : product.status === "DRAFT"
                      ? "bg-gray-500/90 text-white border-gray-500/30"
                      : "bg-rose-500/90 text-white border-rose-500/30"
                } backdrop-blur-sm`}
              >
                {t(`statuses.${product.status}`, product.status)}
              </span>
            </div>

            {/* Actions overlay */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                className="w-8 h-8 rounded-full bg-mkhe-bg/90 backdrop-blur text-mkhe-primary hover:bg-mkhe-primary hover:text-white flex items-center justify-center shadow-md transition-all duration-300"
                title={t("table.edit")}
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-semibold text-lg text-mkhe-primary mb-1 line-clamp-1" title={product.name}>
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono bg-mkhe-border/30 px-2 py-0.5 rounded text-mkhe-text/80">
                {product.sku}
              </span>
              <span className="bg-mkhe-primary/10 text-mkhe-primary font-medium px-2 py-0.5 rounded text-[10px] border border-mkhe-primary/20 line-clamp-1">
                {t(`categories.${product.categoryMatrix}`, product.categoryMatrix)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-4">
              {product.culturalDNA && product.culturalDNA !== "OTHER" && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-mkhe-primary bg-mkhe-primary/5 px-2 py-0.5 rounded border border-mkhe-primary/20">
                  <Dna className="w-3 h-3" />
                  {t(`culturalDNA.${product.culturalDNA}`, product.culturalDNA)}
                </span>
              )}
              {product.vendor && (
                <span className="text-[10px] text-mkhe-text/70 bg-mkhe-border/20 px-2 py-0.5 rounded">
                  {product.vendor}
                </span>
              )}
            </div>

            <div className="mt-auto flex justify-between items-end">
              <div>
                <p className="text-xs text-mkhe-text/50 uppercase tracking-widest font-medium mb-1">{t("table.price")}</p>
                <p className="text-xl font-bold text-gradient-gold">
                  {product.price?.toLocaleString("vi-VN") || 0} đ
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-mkhe-text/50 uppercase tracking-widest font-medium mb-1">{t("table.stock")}</p>
                <p className={`text-base font-bold ${product.stock > 0 ? "text-mkhe-text" : "text-rose-500"}`}>
                  {product.stock || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    )}
    </div>
  );
};

export default ProductGrid;
