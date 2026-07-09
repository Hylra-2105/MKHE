import React from "react";
import { useTranslation } from "react-i18next";
import { Nfc, ShieldCheck, Gem, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import useEffectsConfig from "@/hooks/useEffectsConfig";

const CoreTech = () => {
  const { enableEffects } = useEffectsConfig();
  const { t } = useTranslation("home");

  const features = [
    {
      icon: <Nfc className="w-5 h-5 text-mkhe-primary" />,
      title: t("core_tech.features.0.title"),
      desc: t("core_tech.features.0.desc"),
    },
    {
      icon: <Gem className="w-5 h-5 text-mkhe-primary" />,
      title: t("core_tech.features.1.title"),
      desc: t("core_tech.features.1.desc"),
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-mkhe-primary" />,
      title: t("core_tech.features.2.title"),
      desc: t("core_tech.features.2.desc"),
    },
  ];

  return (
    <section className="relative z-10 pt-24 pb-40 px-6 bg-gradient-to-b from-mkhe-primary/10 via-mkhe-bg to-mkhe-bg">
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-mkhe-primary/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center relative z-10">
        
        {/* LÊN: ILLUSTRATION (Đảo lên trái cho phá cách) */}
        <motion.div 
          initial={enableEffects ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
          whileInView={enableEffects ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          className="lg:col-span-5 relative flex justify-center lg:justify-start"
        >
          {/* Abstract 3D NFC Card */}
          <div className="relative w-72 h-96 lg:w-96 lg:h-[500px] rounded-2xl bg-mkhe-primary/5 border border-mkhe-border backdrop-blur-md shadow-2xl flex items-center justify-center group overflow-hidden">
            {/* Glowing inner orb */}
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-mkhe-primary)_0%,_transparent_70%)] opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-pulse mix-blend-screen`}></div>
            
            {/* Animated Scanning Line */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-mkhe-primary/80 shadow-[0_0_15px_var(--color-mkhe-primary)] animate-[scan_3s_ease-in-out_infinite]`}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <Nfc className="w-20 h-20 lg:w-24 lg:h-24 text-mkhe-text/80 group-hover:text-mkhe-text transition-colors duration-500 mb-6 drop-shadow-lg" />
              <div className="text-center">
                <p className="text-xs font-logo uppercase tracking-[0.2em] text-mkhe-primary font-bold mb-2">{t("core_tech.card_title")}</p>
                <p className="text-[10px] uppercase tracking-widest text-mkhe-text/50">{t("core_tech.card_subtitle")}</p>
              </div>
            </div>
          </div>

          {/* Keyframes custom directly in class using Tailwind arbitrary values or global CSS. 
              We'll just add a custom style block here to ensure it works without touching global css. */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 10%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 90%; opacity: 0; }
            }
          `}} />
        </motion.div>

        {/* PHẢI: EDITORIAL CONTENT */}
        <motion.div 
          initial={enableEffects ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 }}
          whileInView={enableEffects ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
          className="lg:col-span-7"
        >
          <div className="mb-16">
            <h2 className="text-sm font-bold text-mkhe-primary mb-4 tracking-[0.3em] uppercase flex items-center gap-4">
              <span className="w-8 h-[1px] bg-mkhe-primary"></span>
              {t("core_tech.tag")}
            </h2>
            <h3 className="text-4xl md:text-6xl font-logo font-light text-mkhe-text leading-tight">
              {t("core_tech.title_1")} <br/>
              <span className="text-mkhe-primary italic">{t("core_tech.title_2")}</span>
            </h3>
          </div>

          <div className="space-y-0 border-t border-mkhe-border">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="group border-b border-mkhe-border py-8 px-4 md:px-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 hover:bg-mkhe-primary/5 transition-colors"
              >
                {/* Numbered Index */}
                <div className="flex-shrink-0 w-12 text-center md:text-left">
                  <span className="text-3xl font-logo font-light text-mkhe-text/30 group-hover:text-mkhe-primary transition-colors">
                    0{idx + 1}
                  </span>
                </div>
                
                {/* Content */}
                <div>
                  <h4 className="text-xl font-bold text-mkhe-text mb-3 tracking-wide flex items-center gap-3">
                    {item.icon}
                    {item.title}
                  </h4>
                  <p className="text-mkhe-text/50 text-sm leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Digital Heritage Transition (Bottom to Footer) */}
      <div className="absolute bottom-0 left-0 w-full leading-[0] z-0 pointer-events-none translate-y-1/2">
        <svg
          className="relative block w-full h-[150px] md:h-[250px] overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 200"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Circuit traces flowing downwards */}
          <path d="M100,0 L100,50 L200,100 L200,200" className="stroke-mkhe-primary/20 stroke-[2] fill-transparent" />
          <circle cx="200" cy="200" r="4" className="fill-mkhe-primary" />
          
          <path d="M300,0 L300,80 L250,130 L250,200" className="stroke-mkhe-primary/10 stroke-[1] fill-transparent" />
          <circle cx="250" cy="200" r="3" className="fill-mkhe-primary/50" />
          
          <path d="M500,0 L500,100 L600,150 L600,200" className="stroke-mkhe-primary/40 stroke-[2] fill-transparent" />
          <circle cx="600" cy="200" r="5" className="fill-mkhe-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(212,163,115,0.8))' }} />
          
          <path d="M700,0 L700,40 L800,90 L800,160 L850,200" className="stroke-mkhe-primary/20 stroke-[1.5] fill-transparent" />
          <circle cx="850" cy="200" r="4" className="fill-mkhe-primary" />
          
          <path d="M900,0 L900,120 L950,170 L950,200" className="stroke-mkhe-primary/15 stroke-[1] fill-transparent" />
          <circle cx="950" cy="200" r="2" className="fill-mkhe-primary/70" />
          
          <path d="M1100,0 L1100,60 L1050,110 L1050,200" className="stroke-mkhe-primary/20 stroke-[2] fill-transparent" />
          <circle cx="1050" cy="200" r="4" className="fill-mkhe-primary" />

          {/* Horizontal intersecting data lines */}
          <path d="M0,100 L1200,100" className="stroke-mkhe-primary/5 stroke-[1] fill-transparent" strokeDasharray="10 5" />
          <path d="M0,150 L1200,150" className="stroke-mkhe-primary/10 stroke-[1] fill-transparent" />
        </svg>
      </div>
    </section>
  );
};

export default CoreTech;
