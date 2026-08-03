import {  useState, useEffect, useRef  } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { productApi } from "@/api/productApi";
import { useCartStore } from "@/stores/useCartStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { getImageUrl, formatNumber, DEFAULT_FALLBACK_IMAGE } from "@/utils/formatters";
import { ChevronLeft, ShoppingCart, Info, Plus, Minus, ShieldCheck, MapPin, Layers, Hash, X, ChevronDown, CreditCard, Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, EffectFade } from "swiper/modules";
import ReviewList from "@/features/reviews/components/ReviewList";
import DOMPurify from "dompurify";
import Button from "@/components/ui/Button";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";

import { useAuthStore } from "@/stores/useAuthStore";

export default function ShopDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["product"]);
  
  const { user } = useAuthStore();
  const isEnterprise = user?.role === "Enterprise";

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isColorsExpanded, setIsColorsExpanded] = useState(false);
  
  const { socket } = useSocketStore();
  const storyRef = useRef(null);
  
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productApi.getShopProductById(id);
        setProduct(res.data);
      } catch (err) {
        setError(t("shop.fetch_error"));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, t]);

  useEffect(() => {
    if (product && storyRef.current) {
      setTimeout(() => {
        if (storyRef.current && storyRef.current.scrollHeight > 200) {
          setShowExpandButton(true);
        }
      }, 100);
    }
  }, [product]);

  // Listen to real-time product updates
  useEffect(() => {
    if (socket && product) {
      const handleProductUpdate = (updatedProduct) => {
        if (updatedProduct._id === product._id) {
          setProduct(updatedProduct);
          setSelectedColor((prevSelected) => {
            if (prevSelected) {
              const updatedColor = updatedProduct.colors?.find(c => c.name === prevSelected.name);
              return updatedColor || prevSelected;
            }
            return prevSelected;
          });
        }
      };
      
      socket.on("product_updated", handleProductUpdate);
      return () => {
        socket.off("product_updated", handleProductUpdate);
      };
    }
  }, [socket, product]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    if (product.colors?.length > 0 && !selectedColor) {
      // Need a toast here but simple validation is fine
      return;
    }
    
    // Check if selected color is out of stock
    if (selectedColor && selectedColor.stock <= 0) return;
    
    addToCart(product, quantity, { 
      color: selectedColor?.name, 
      colorImage: selectedColor?.image,
      addOns: selectedAddOns
    });
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    if (product.colors?.length > 0 && !selectedColor) {
      return;
    }
    
    if (selectedColor && selectedColor.stock <= 0) return;

    navigate("/checkout", { 
      state: { 
        buyNowItem: { 
          product, 
          quantity, 
          color: selectedColor?.name, 
          colorImage: selectedColor?.image,
          addOns: selectedAddOns
        } 
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mkhe-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-mkhe-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mkhe-bg">
        <p className="text-xl text-mkhe-text opacity-70">{error || t("common.not_found")}</p>
        <Button 
          onClick={() => navigate("/shop")}
          className="mt-6 px-8 py-3 rounded-full"
        >
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || (selectedColor ? selectedColor.stock === 0 : false);

  const now = new Date();
  const isSaleValid = product && product.salePrice > 0 && product.saleStartDate && product.saleEndDate 
                      && new Date(product.saleStartDate) <= now && new Date(product.saleEndDate) >= now;

  const isB2BProduct = product?.categoryMatrix === "B2B_Luxury" || product?.categoryMatrix === "B2B_Standard";
  const hasB2BTiers = isB2BProduct && product?.b2bTiers?.length > 0;

  let currentDiscountPercent = 0;
  let nextTier = null;

  if (isEnterprise && hasB2BTiers) {
    const sortedTiers = [...product.b2bTiers].sort((a, b) => a.minQuantity - b.minQuantity);
    
    for (let i = 0; i < sortedTiers.length; i++) {
      if (quantity >= sortedTiers[i].minQuantity) {
        currentDiscountPercent = sortedTiers[i].discountPercent;
      } else {
        if (!nextTier) {
          nextTier = sortedTiers[i];
        }
      }
    }
    
    if (currentDiscountPercent === 0 && sortedTiers.length > 0 && quantity < sortedTiers[0].minQuantity) {
      nextTier = sortedTiers[0];
    }
  }

  // Pricing Logic
  let productBasePrice = product.price;
  if (selectedColor && selectedColor.priceOverride) {
    productBasePrice = selectedColor.priceOverride;
  }

  let finalBasePrice = productBasePrice;
  if (isSaleValid) {
    const salePercentage = (product.price - product.salePrice) / product.price;
    finalBasePrice = Math.round(productBasePrice * (1 - salePercentage));
  }

  // Calculate Add-ons cost
  let addOnsCost = 0;
  if (selectedAddOns.length > 0) {
    addOnsCost = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  }

  const finalPrice = ((isEnterprise && hasB2BTiers) 
    ? finalBasePrice * (1 - currentDiscountPercent / 100) 
    : finalBasePrice) + addOnsCost;

  return (
    <div className="min-h-screen bg-mkhe-bg font-sans pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Back button */}
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="!p-0 flex items-center gap-2 text-mkhe-text/60 hover:text-mkhe-primary mb-8 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{t("shop.detail.back", "Trở về")}</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* CỘT TRÁI: Gallery Hình ảnh */}
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl overflow-hidden bg-mkhe-border/5 border border-mkhe-border/10 relative">
              {(!product.images || product.images.length === 0) ? (
                <div className="w-full aspect-square">
                  <img 
                    src={DEFAULT_FALLBACK_IMAGE} 
                    alt={product.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              ) : (
                <Swiper
                  onSwiper={setMainSwiper}
                  modules={[Pagination, Thumbs, EffectFade]}
                effect="fade"
                pagination={{ clickable: true }}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                className="w-full aspect-square"
                style={{ 
                  '--swiper-pagination-color': 'var(--color-mkhe-primary)',
                  '--swiper-pagination-bullet-inactive-color': 'var(--color-mkhe-text)',
                  '--swiper-pagination-bullet-inactive-opacity': '0.3'
                }}
              >
                {product.images?.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="w-full h-full overflow-hidden cursor-pointer" onClick={() => { setLightboxIndex(index); setIsLightboxOpen(true); }}>
                      <img 
                        src={getImageUrl(img)} 
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              )}
            </div>

            {/* Thumbnail Slider */}
            {product.images?.length > 1 && (
              <div className="mt-2">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={12}
                  slidesPerView={4}
                  breakpoints={{
                    640: { slidesPerView: 5, spaceBetween: 16 }
                  }}
                  watchSlidesProgress
                  className="w-full"
                >
                  {product.images?.map((img, index) => (
                    <SwiperSlide key={index} className="cursor-pointer opacity-50 [&.swiper-slide-thumb-active]:opacity-100 transition-opacity">
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-mkhe-border/5 border border-mkhe-border/10">
                        <img 
                          src={getImageUrl(img)} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Thông tin Sản phẩm */}
          <div className="flex flex-col">
            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-sans text-mkhe-text font-light leading-tight mb-3">
                {product.name?.normalize('NFC').replace(/Trắ[\s´́]*c/gi, 'Trắc')}
              </h1>
              
              {product.ratingCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 w-fit text-amber-600 rounded-full text-sm font-bold mb-4">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.ratingAverage}</span>
                  <span className="text-mkhe-text/40 font-normal ml-1">({product.ratingCount} {t("reviews:customer_reviews", { defaultValue: "Đánh giá" })})</span>
                </div>
              )}

              <div className="flex flex-wrap items-end gap-3 mb-4">
                <p className="text-2xl md:text-3xl text-mkhe-primary font-medium tracking-wide">
                  {formatNumber(finalPrice)} đ
                </p>
                {(isSaleValid || currentDiscountPercent > 0) && (
                  <p className="text-lg text-mkhe-text/50 line-through mb-0.5">
                    {formatNumber(product.price)} đ
                  </p>
                )}
                {isSaleValid && currentDiscountPercent === 0 && (
                  <div className="bg-red-600/90 text-white px-2 py-0.5 rounded-lg shadow-lg border border-red-500/50 text-sm font-bold mb-0.5">
                    -{Math.round((1 - product.salePrice / product.price) * 100)}%
                  </div>
                )}
                {currentDiscountPercent > 0 && (
                  <div className="bg-mkhe-primary text-white px-2 py-0.5 rounded-lg shadow-lg border border-mkhe-primary/50 text-sm font-bold mb-0.5">
                    Sỉ -{currentDiscountPercent}%
                  </div>
                )}
              </div>

              {/* Bảng giá sỉ (Chỉ dành cho Doanh nghiệp) */}
              {isEnterprise && hasB2BTiers && (
                <div className="mb-6 p-4 bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-mkhe-primary mb-3">{t('product:shop.detail.b2b_wholesale_title')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {product.b2bTiers
                      .slice()
                      .sort((a, b) => a.minQuantity - b.minQuantity)
                      .map((tier, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-2 rounded-lg ${quantity >= tier.minQuantity ? (idx === product.b2bTiers.length - 1 || quantity < [...product.b2bTiers].sort((a,b) => a.minQuantity - b.minQuantity)[idx + 1].minQuantity ? "bg-mkhe-primary/20 font-bold" : "bg-mkhe-primary/10") : "bg-mkhe-border/5 text-mkhe-text/70"}`}>
                        <span>{t('product:shop.detail.b2b_from_quantity', { quantity: tier.minQuantity })}</span>
                        <span className="text-mkhe-primary">- {tier.discountPercent}%</span>
                      </div>
                    ))}
                  </div>
                  {nextTier && (
                    <p className="text-xs text-mkhe-primary/80 mt-3 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {t('product:shop.detail.b2b_buy_more', { count: nextTier.minQuantity - quantity, discount: nextTier.discountPercent })}
                    </p>
                  )}
                  {!nextTier && (
                    <p className="text-xs text-mkhe-primary/80 mt-3 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {t('product:shop.detail.b2b_max_discount')}
                    </p>
                  )}
                </div>
              )}
              {product.hasDPP && (
                <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-mkhe-primary/10 border border-mkhe-primary/20 text-mkhe-primary rounded-full text-sm font-medium shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t("shop.detail.nfc_badge", "Sản phẩm tích hợp Hộ chiếu số NFC")}</span>
                </div>
              )}
            </div>

            {/* Thông tin nhanh */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-mkhe-border/5 rounded-2xl border border-mkhe-border/10">
              {product.category && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-mkhe-border/10 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-mkhe-primary/80 uppercase tracking-wider mb-0.5">{t("shop.detail.category", "Danh mục")}</p>
                    <p className="text-mkhe-text font-medium">{product.category}</p>
                  </div>
                </div>
              )}
              {product.material && product.material.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-mkhe-border/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-mkhe-primary/80 uppercase tracking-wider mb-0.5">{t("shop.detail.material", "Chất liệu")}</p>
                    <p className="text-mkhe-text font-medium">{product.material.join(", ")}</p>
                  </div>
                </div>
              )}
              {product.craftVillage && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-mkhe-border/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-mkhe-primary/80 uppercase tracking-wider mb-0.5">{t("shop.detail.village", "Làng nghề")}</p>
                    <p className="text-mkhe-text font-medium line-clamp-1">{product.craftVillage}</p>
                  </div>
                </div>
              )}
              {product.sku && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-mkhe-border/10 flex items-center justify-center shrink-0">
                    <Hash className="w-4 h-4 text-mkhe-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-mkhe-primary/80 uppercase tracking-wider mb-0.5">{t("shop.detail.sku", "Mã SKU")}</p>
                    <p className="text-mkhe-text font-medium">{product.sku}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Màu sắc */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="text-mkhe-text/80 font-medium mb-3 block">{t("shop.detail.color", "Màu sắc:")}</span>
                <div className="flex flex-wrap gap-3">
                  {(() => {
                    const visibleColors = isColorsExpanded ? product.colors : product.colors.slice(0, 5);
                    const hasMore = product.colors.length > 5;
                    return (
                      <>
                        {visibleColors.map((color, idx) => {
                          const isSelected = selectedColor?.name === color.name;
                          const isColorOutOfStock = color.stock <= 0;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (!isColorOutOfStock) {
                                  setSelectedColor(color);
                                  // Cập nhật quantity nếu lớn hơn stock của màu
                                  if (quantity > color.stock) {
                                    setQuantity(color.stock);
                                  }
                                  
                                  // Đổi ảnh chính (nếu có swiper và color có ảnh)
                                  if (color.image) {
                                    const imgIndex = product.images?.findIndex(img => getImageUrl(img) === getImageUrl(color.image));
                                    if (imgIndex !== -1 && mainSwiper && !mainSwiper.destroyed) {
                                      mainSwiper.slideTo(imgIndex);
                                    }
                                  }
                                }
                              }}
                              disabled={isColorOutOfStock}
                              className={`relative flex flex-col items-center gap-1 p-1.5 sm:p-2 border rounded-xl transition-all ${
                                isSelected ? "border-mkhe-primary bg-mkhe-primary/5 shadow-md" : "border-transparent hover:border-mkhe-border bg-mkhe-border/5"
                              } ${isColorOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} min-w-[50px] sm:min-w-[60px]`}
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                {color.image ? (
                                  <img src={getImageUrl(color.image)} alt={color.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-mkhe-border/30 shadow-sm" />
                                ) : (
                                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-mkhe-border/30 shadow-sm bg-mkhe-border/10 flex items-center justify-center text-[10px] text-mkhe-text/40 font-bold uppercase">{color.name.charAt(0)}</span>
                                )}
                                <div className="flex flex-col">
                                  <span className="text-xs sm:text-sm font-medium text-mkhe-text">{t(`colors.${color.name.toLowerCase().replace(/\s+/g, '_')}`, color.name)}</span>
                                  {color.priceOverride > 0 && (
                                    <span className="text-[10px] sm:text-xs text-mkhe-primary font-bold">
                                      {formatNumber(
                                        isSaleValid 
                                          ? Math.round(color.priceOverride * (1 - ((product.price - product.salePrice) / product.price))) 
                                          : color.priceOverride
                                      )}đ
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-mkhe-text/60">{isColorOutOfStock ? t("shop.detail.out_of_stock_short", "Hết") : `${color.stock} sẵn`}</span>
                            </button>
                          )
                        })}
                        {hasMore && (
                          <button
                            onClick={() => setIsColorsExpanded(!isColorsExpanded)}
                            className="flex items-center justify-center px-4 py-2 border border-mkhe-primary/30 rounded-xl text-[11px] sm:text-xs font-medium text-mkhe-primary hover:bg-mkhe-primary/5 transition-colors cursor-pointer min-h-[50px] sm:min-h-[60px]"
                          >
                            {isColorsExpanded ? t("shop.detail.show_less", "Thu gọn") : `+${product.colors.length - 5} ${t("shop.detail.more_colors", "màu khác")}`}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Phụ kiện mua kèm (Add-ons) */}
            {product.addOns && product.addOns.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-mkhe-border/5 border border-mkhe-border/10">
                <span className="text-mkhe-text/80 font-medium mb-3 block">{t("shop.detail.addons", "Phụ kiện mua kèm (Tùy chọn):")}</span>
                <div className="flex flex-col gap-3">
                  {product.addOns.map((addOn, idx) => {
                    const isSelected = selectedAddOns.some(a => a.name === addOn.name);
                    return (
                      <label 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                          isSelected ? "border-mkhe-primary bg-mkhe-primary/5" : "border-transparent hover:border-mkhe-border bg-mkhe-bg"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-mkhe-border text-mkhe-primary focus:ring-mkhe-primary cursor-pointer accent-mkhe-primary"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddOns(prev => [...prev, addOn]);
                              } else {
                                setSelectedAddOns(prev => prev.filter(a => a.name !== addOn.name));
                              }
                            }}
                          />
                          {addOn.image && (
                            <img src={getImageUrl(addOn.image)} alt={addOn.name} className="w-10 h-10 rounded-lg object-cover border border-mkhe-border/20" />
                          )}
                          <span className="font-medium text-sm text-mkhe-text">{t(`addons.${addOn.name.toLowerCase().replace(/\s+/g, '_')}`, addOn.name)}</span>
                        </div>
                        <span className="text-sm font-bold text-mkhe-primary">+{formatNumber(addOn.price)}đ</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nút hành động */}
            <div className="space-y-6 mb-12">
              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-mkhe-text/80">{t("shop.detail.quantity", "Số lượng:")}</span>
                <div className="flex items-center gap-3 bg-mkhe-bg rounded-full p-1.5 border border-mkhe-border/20">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-2 rounded-full text-mkhe-text/60 hover:text-mkhe-text hover:bg-mkhe-border/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(selectedColor ? selectedColor.stock : product.stock, quantity + 1))}
                    disabled={quantity >= (selectedColor ? selectedColor.stock : product.stock) || isOutOfStock}
                    className="p-2 rounded-full text-mkhe-text/60 hover:text-mkhe-text hover:bg-mkhe-border/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-mkhe-text/50 ml-2">
                  {selectedColor 
                    ? (selectedColor.stock > 0 ? t("shop.detail.in_stock", { count: selectedColor.stock, defaultValue: `${selectedColor.stock} sản phẩm có sẵn` }) : t("shop.detail.sold_out", { defaultValue: "Đã bán hết" }))
                    : (product.stock > 0 ? t("shop.detail.in_stock", { count: product.stock, defaultValue: `${product.stock} sản phẩm có sẵn` }) : t("shop.detail.sold_out", { defaultValue: "Đã bán hết" }))
                  }
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant={isOutOfStock ? "ghost" : "outline"}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 md:py-5 rounded-full font-medium text-lg border-2 transition-all ${
                    isOutOfStock 
                      ? "!bg-mkhe-primary/5 !border-mkhe-primary/20 !text-mkhe-primary/40 cursor-not-allowed" 
                      : "!border-mkhe-primary !text-mkhe-primary hover:!bg-mkhe-primary/10 active:scale-[0.99]"
                  }`}
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  <span>{isOutOfStock ? t("shop.detail.sold_out", { defaultValue: "Tạm hết" }) : t("shop.detail.add_to_cart", { defaultValue: "Thêm vào giỏ" })}</span>
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 py-4 md:py-5 rounded-full font-medium text-lg shadow-lg transition-all ${
                    isOutOfStock 
                      ? "!bg-mkhe-primary/10 !text-mkhe-primary/40 cursor-not-allowed shadow-none" 
                      : "shadow-mkhe-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <CreditCard className="w-6 h-6 mr-3" />
                  <span>{isOutOfStock ? t("shop.detail.sold_out", { defaultValue: "Tạm hết" }) : t("shop.detail.buy_now", { defaultValue: "Mua ngay" })}</span>
                </Button>
              </div>
              
              {product.colors?.length > 0 && !selectedColor && !isOutOfStock && (
                <p className="text-sm text-amber-500 font-medium text-center md:text-left mt-2">
                  {t("shop.detail.select_color_first", "Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng")}
                </p>
              )}
            </div>

            {/* Mô tả chi tiết */}
            {(product.story || product.description) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-serif text-mkhe-text">
                  <Info className="w-5 h-5 text-mkhe-primary" />
                  <h2>{t("shop.detail.story", "Câu chuyện di sản")}</h2>
                </div>
                
                <div className="relative">
                  <div 
                    ref={storyRef}
                    className={`prose prose-sm md:prose-base max-w-none prose-p:text-mkhe-text/80 prose-headings:text-mkhe-text prose-a:text-mkhe-primary prose-strong:text-mkhe-text prose-li:text-mkhe-text/80 prose-ul:text-mkhe-text/80 prose-ol:text-mkhe-text/80 marker:text-mkhe-primary/50 prose-blockquote:text-mkhe-text/80 prose-blockquote:border-mkhe-primary overflow-hidden transition-all duration-700 ease-in-out ${isStoryExpanded ? 'max-h-[5000px]' : 'max-h-[200px]'}`}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.story || product.description) }}
                  />
                  
                  {/* Gradient Fade */}
                  {!isStoryExpanded && showExpandButton && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-mkhe-bg to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Read More Button */}
                {showExpandButton && (
                  <button 
                    onClick={() => setIsStoryExpanded(!isStoryExpanded)}
                    className="flex items-center gap-2 text-mkhe-primary font-medium hover:text-mkhe-primary-hover transition-colors mt-2 cursor-pointer"
                  >
                    <span>{isStoryExpanded ? t("shop.detail.show_less", "Thu gọn") : t("shop.detail.read_more", "Đọc tiếp câu chuyện")}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isStoryExpanded ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            )}

            <div className="mt-16 pt-12 border-t border-mkhe-border/10">
              <ReviewList productId={product._id} />
            </div>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full h-full pt-16 pb-8">
            <style>{`
              .swiper-button-disabled {
                opacity: 0 !important;
                visibility: hidden;
              }
            `}</style>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true, dynamicBullets: true }}
              initialSlide={lightboxIndex}
              className="w-full h-full"
              style={{ 
                '--swiper-navigation-color': 'white', 
                '--swiper-pagination-color': 'var(--color-mkhe-primary)',
                '--swiper-pagination-bullet-inactive-color': 'white',
                '--swiper-pagination-bullet-inactive-opacity': '0.3'
              }}
            >
              {product.images?.map((img, idx) => (
                <SwiperSlide key={idx} className="flex items-center justify-center p-4">
                  <img 
                    src={getImageUrl(img)} 
                    className="max-w-full max-h-full object-contain mx-auto select-none drop-shadow-2xl"
                    alt={`Zoomed ${idx + 1}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
}
