import { motion } from "framer-motion";
import bannerVideo from "@/assets/videos/video-banner-mkhe.mp4";
import { useTranslation } from "react-i18next";

const HeroBanner = () => {
  const { t } = useTranslation("home");

  return (
    <section className="relative w-full h-screen overflow-hidden bg-mkhe-bg">
      <video
        src={bannerVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80"
      />
      
      {/* Cinematic Vignette Shadow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>
      
      {/* Top Gradient for navbar contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

    </section>
  );
};

export default HeroBanner;