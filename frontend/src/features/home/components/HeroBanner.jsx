import React from "react";
import bannerVideo from "@/assets/videos/video-banner-mkhe.mp4";

const HeroBanner = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <video
        src={bannerVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Lớp overlay đen nhẹ để làm nổi bật thanh Header trong suốt */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
    </section>
  );
};

export default HeroBanner;