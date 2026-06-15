import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { dppApi } from "@/api/dppApi";
import { Loader2, AlertCircle, Hexagon, Sparkles, Box, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import ModelViewer3D from "./ModelViewer3D";
import ArtisanCertificate from "./ArtisanCertificate";
import LocationMap from "./LocationMap";
import { isVideoMedia } from "@/utils/validators";
import { useAuthStore } from "@/stores/useAuthStore";
import toast from "react-hot-toast";
import AuthBottomSheet from "./AuthBottomSheet";
import WelcomeToast from "./WelcomeToast";

const DPPContainer = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("dpp");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("3d");
  const [verificationFailed, setVerificationFailed] = useState(false);

  // Thêm state xử lý Auth & Voucher
  const user = useAuthStore((state) => state.user);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [isClaimed, setIsClaimed] = useState(() => {
    return localStorage.getItem("claimed_welcome_mkhe") === "true";
  });
  
  const ctaRef = React.useRef(null);
  const scrollToCTA = () => {
    if (ctaRef.current) {
      ctaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // uid comes from params, hash from searchParams
  const hash = searchParams.get("hash");

  // Gom nhóm video lên đầu khi xem
  const sortedImages = useMemo(() => {
    if (!product || !product.images) return [];
    const videos = product.images.filter(isVideoMedia);
    const photos = product.images.filter((img) => !isVideoMedia(img));
    return [...videos, ...photos];
  }, [product]);
  
  // Custom Slider State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragStart(clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragOffset(clientX - dragStart);
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 30) {
      if (dragOffset > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1); // vuốt phải -> ảnh trước
      } else if (dragOffset < 0 && currentIndex < (sortedImages.length || 1) - 1) {
        setCurrentIndex(prev => prev + 1); // vuốt trái -> ảnh tiếp
      }
    }
    setDragOffset(0);
  };

  const handleClaimVoucher = () => {
    if (isClaimed) return;
    
    if (user) {
      // User is already logged in
      setIsClaimed(true);
      localStorage.setItem("claimed_welcome_mkhe", "true");
      toast.success(t("o2o.msg_new_user"), { duration: 4000 });
    } else {
      // User is not logged in, open bottom sheet
      setBottomSheetOpen(true);
    }
  };

  const handleAuthSuccess = (isNewUser) => {
    setBottomSheetOpen(false);
    setIsClaimed(true);
    localStorage.setItem("claimed_welcome_mkhe", "true");
    
    if (isNewUser) {
      toast.success(t("o2o.msg_new_user"), { duration: 4000 });
    } else {
      toast.success(t("o2o.msg_returning_user"), { duration: 4000 });
    }
  };

  useEffect(() => {
    const fetchDPPData = async () => {
      try {
        setLoading(true);

        if (!uid || !hash) {
          setVerificationFailed(true);
          setLoading(false);
          return;
        }

        const verifyRes = await dppApi.verifyDPP(uid, hash);
        
        if (!verifyRes.success) {
          setVerificationFailed(true);
          setLoading(false);
          return;
        }

        if (verifyRes.data) {
          setProduct(verifyRes.data);
          setViewMode(verifyRes.data.file3D ? "3d" : "2d");
        } else {
          setError(t("container.errorNoDPP"));
        }
      } catch (err) {
        console.error("Lỗi tải Hộ chiếu số:", err);
        setError(t("container.errorFetch"));
      } finally {
        setLoading(false);
      }
    };
    if (uid) fetchDPPData();
  }, [uid, hash, t]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="relative">
          <Hexagon className="w-16 h-16 text-mkhe-primary/20 animate-pulse absolute" />
          <Loader2 className="w-16 h-16 text-mkhe-primary animate-spin" />
        </div>
        <p className="text-mkhe-primary font-bold tracking-[0.3em] uppercase text-xs animate-pulse">
          {t("container.authenticating")}
        </p>
      </div>
    );
  }

  // HIỂN THỊ MÀN HÌNH CẢNH BÁO NẾU XÁC THỰC NFC THẤT BẠI
  if (verificationFailed) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-mkhe-bg transition-colors duration-300">
        <div className="flex justify-center mb-6 relative">
          <AlertCircle className="w-20 h-20 text-mkhe-primary opacity-80" strokeWidth={1.2} />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-logo font-bold text-gradient-gold mb-3 tracking-wider py-2">
          {t("container.warningTitle")}
        </h1>
        
        <h2 className="text-lg md:text-xl font-semibold mb-3 text-mkhe-text/90 uppercase tracking-widest">
          {t("container.warningSubtitle")}
        </h2>
        
        <p className="text-mkhe-text/60 mb-8 text-sm leading-relaxed max-w-md mx-auto italic">
          {t("container.warningDesc")}
        </p>
        
        <button 
          onClick={() => navigate("/")} 
          className="inline-flex items-center justify-center bg-mkhe-primary text-white px-8 py-3 rounded-md hover:opacity-90 transition-opacity font-semibold tracking-wider text-xs md:text-sm uppercase shadow-lg cursor-pointer"
        >
          {t("container.backHome")}
        </button>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center bg-mkhe-bg transition-colors duration-300">
        <div className="flex justify-center mb-6 relative">
          <AlertCircle className="w-16 h-16 text-mkhe-primary opacity-60" strokeWidth={1.5} />
        </div>
        
        <h2 className="text-2xl font-bold text-mkhe-text/90 tracking-wider mb-2 py-1">
          {t("container.errorTitle")}
        </h2>
        
        <p className="text-mkhe-text/60 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
          {error}
        </p>
        
        <button 
          onClick={() => navigate("/")} 
          className="inline-flex items-center justify-center bg-mkhe-primary text-white px-8 py-3 rounded-md hover:opacity-90 transition-opacity font-semibold tracking-wider text-xs md:text-sm uppercase shadow-lg cursor-pointer"
        >
          {t("container.backHome")}
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-68px)] text-mkhe-text overflow-hidden font-sans pb-24 selection:bg-mkhe-primary/30">
      {!isClaimed && <WelcomeToast onToastClick={scrollToCTA} />}
      
      {/* 1. DYNAMIC AMBIENT BACKGROUND */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] md:w-[100%] h-[70vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mkhe-primary/15 via-mkhe-bg/40 to-transparent pointer-events-none opacity-80" />
      
      {/* Nút Back Nổi */}
      <div className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
        <button 
          onClick={() => navigate("/")} 
          className="p-3 bg-mkhe-bg/50 backdrop-blur-md cursor-pointer rounded-full border border-mkhe-border hover:bg-mkhe-bg hover:scale-105 transition-all duration-300 shadow-xl group"
        >
          <ArrowLeft className="w-5 h-5 text-mkhe-text/70 group-hover:text-mkhe-primary transition-colors" />
        </button>
        
        <div className="flex items-center gap-2 px-5 py-2.5 bg-mkhe-bg/50 backdrop-blur-md border border-mkhe-border rounded-full shadow-xl">
           <div className="w-2 h-2 rounded-full bg-mkhe-primary animate-pulse" />
           <span className="text-[10px] font-bold text-mkhe-text/90 uppercase tracking-[0.2em]">{t("container.passport")}</span>
           <span className="text-mkhe-text/30 px-1">|</span>
           <span className="text-[10px] text-mkhe-text/60 font-mono tracking-wider">{t("container.id")}: {product.sku || product.productId || uid}</span>
        </div>
      </div>

      {/* 2. MAIN 3D / 2D STAGE */}
      <main className="relative z-10 w-full h-[55vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
         <AnimatePresence mode="wait">
           {viewMode === "3d" && product.file3D && (
             <motion.div 
               key="3d-viewer"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
               className="w-full h-full absolute inset-0 pb-20 pt-16"
             >
               <ModelViewer3D src={product.file3D} alt={product.name} />
             </motion.div>
           )}

           {viewMode === "2d" && product.images && product.images.length > 0 && (
             <motion.div
               key="2d-viewer"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
               className="w-full h-full absolute inset-0"
             >
               {/* Silder Ảnh kéo thả (Drag/Swipe) giống Home */}
               <div 
                 className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
                 onMouseDown={handleDragStart}
                 onMouseMove={handleDragMove}
                 onMouseUp={handleDragEnd}
                 onMouseLeave={handleDragEnd}
                 onTouchStart={handleDragStart}
                 onTouchMove={handleDragMove}
                 onTouchEnd={handleDragEnd}
               >
                 <div 
                   className="w-full h-full flex"
                   style={{
                     transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                     transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                     willChange: "transform"
                   }}
                 >
                   {sortedImages.map((img, idx) => {
                     // Lazy load: Chỉ render ảnh hiện tại và 2 ảnh hai bên cạnh
                     const isVisible = Math.abs(idx - currentIndex) <= 1;

                     return (
                       <div key={idx} className="w-full h-full flex-shrink-0 relative flex items-center justify-center p-8 pb-24 pt-20 md:p-16 md:pb-28">
                         {isVisible && (
                           isVideoMedia(img) ? (
                             <video 
                               src={img} 
                               controls
                               playsInline
                               preload="metadata"
                               muted
                               loop
                               className="w-full h-full object-contain drop-shadow-2xl"
                             />
                           ) : (
                             <img 
                               src={img} 
                               alt={`${product.name} - ${idx + 1}`} 
                               loading="lazy"
                               draggable="false"
                               className="w-full h-full object-contain drop-shadow-2xl pointer-events-none"
                             />
                           )
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               {/* Chỉ báo số lượng ảnh nếu có nhiều hơn 1 */}
               {sortedImages.length > 1 && (
                 <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
                   {sortedImages.map((_, i) => (
                     <div 
                       key={i} 
                       className={`h-1.5 rounded-full transition-all duration-300 ${
                         i === currentIndex 
                           ? "w-4 bg-mkhe-primary opacity-100" 
                           : "w-1.5 bg-mkhe-text opacity-40"
                       }`} 
                     />
                   ))}
                 </div>
               )}
             </motion.div>
           )}
         </AnimatePresence>

         {/* NÚT TOGGLE CHUYỂN ĐỔI 3D/2D (Chỉ hiện khi có CẢ HAI) */}
         {product.file3D && product.images && product.images.length > 0 && (
           <button
             onClick={() => setViewMode(prev => prev === "3d" ? "2d" : "3d")}
             className="absolute bottom-4 md:bottom-8 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-mkhe-bg/40 backdrop-blur-xl border border-mkhe-border/40 rounded-full shadow-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest text-mkhe-text hover:bg-mkhe-primary/20 hover:text-mkhe-primary hover:border-mkhe-primary/50 transition-all duration-300 cursor-pointer group"
           >
             {viewMode === "3d" ? (
               <>
                 <ImageIcon className="w-4 h-4 text-mkhe-text/70 group-hover:text-mkhe-primary transition-colors" />
                 {t("container.viewImage")}
               </>
             ) : (
               <>
                 <Box className="w-4 h-4 text-mkhe-text/70 group-hover:text-mkhe-primary transition-colors" />
                 {t("container.view3D")}
               </>
             )}
           </button>
         )}
      </main>

      {/* 3. CONTENT SECTION - GLASSMORPHISM PULL-UP */}
      <section className="relative z-20 px-6 max-w-lg mx-auto space-y-6">
        
        {/* Product Identity Card */}
        <div className="relative bg-mkhe-bg/60 backdrop-blur-3xl p-8 rounded-[2.5rem] shadow-2xl border border-mkhe-border/50 overflow-hidden transform transition-all duration-500 hover:border-mkhe-primary/50 hover:bg-mkhe-bg/80">
          {/* Subtle gold top border glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mkhe-primary/70 to-transparent opacity-50" />
          
          <div className="flex items-center justify-between mb-5">
             <p className="text-[9px] font-bold text-mkhe-primary uppercase tracking-[0.3em] opacity-90">
               {t("container.id")}: {product.sku || product.productId || uid}
             </p>
             <Sparkles className="w-4 h-4 text-mkhe-primary/60" />
          </div>
          
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-mkhe-text via-mkhe-text/90 to-mkhe-primary/60 leading-[1.1] font-logo mb-5">
            {product.name?.normalize("NFC")}
          </h1>
          
          {product.description && (
            <p className="text-sm text-mkhe-text/60 leading-relaxed font-light">
              {product.description.normalize("NFC")}
            </p>
          )}
        </div>

        {/* Khối Chứng nhận Nghệ nhân */}
        <ArtisanCertificate 
          artisanName={product.artisanName} 
          culturalDNA={product.culturalDNA} 
          categoryMatrix={product.categoryMatrix} 
        />

        {/* Khối Bản đồ */}
        <LocationMap gpsLocation={product.gpsLocation} />
        
        {/* CTA Banner: Nhận ưu đãi O2O */}
        <div className="mt-8 mb-4" ref={ctaRef}>
          <div className="relative bg-mkhe-bg/40 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-mkhe-border/30 overflow-hidden text-center transition-all duration-500 hover:border-mkhe-primary/40">
            <div className="absolute inset-0 bg-gradient-to-br from-mkhe-primary/10 to-transparent opacity-50 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-center">
                <Sparkles className={`w-8 h-8 ${isClaimed ? 'text-mkhe-text/40' : 'text-mkhe-primary'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold uppercase tracking-widest font-logo mb-1 ${isClaimed ? 'text-mkhe-text/60' : 'text-mkhe-text'}`}>
                  {t("o2o.new_member")}
                </h3>
                <p className="text-sm text-mkhe-text/70">
                  {t("o2o.cta_subtitle")}
                </p>
              </div>
              <button
                onClick={handleClaimVoucher}
                disabled={isClaimed}
                className={`w-full py-4 px-6 rounded-full cursor-pointer font-bold uppercase tracking-widest text-xs transition-all duration-500 flex items-center justify-center gap-2 ${
                  isClaimed 
                    ? "bg-mkhe-text/5 text-mkhe-text/50 border border-mkhe-border/30 shadow-inner"
                    : "bg-mkhe-primary text-[#1a110a] hover:shadow-[0_0_20px_rgba(217,197,178,0.3)] hover:scale-[1.02]"
                }`}
              >
                {isClaimed ? t("o2o.voucher_saved") : t("o2o.get_voucher")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Bottom Sheet */}
      <AuthBottomSheet 
        isOpen={isBottomSheetOpen} 
        onClose={() => setBottomSheetOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
    </div>
  );
};

export default DPPContainer;
