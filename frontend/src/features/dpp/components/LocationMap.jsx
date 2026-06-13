import React from "react";
import { MapPin, Navigation, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const LocationMap = ({ gpsLocation }) => {
  const { t } = useTranslation("dpp");
  
  if (!gpsLocation) return null;

  const handleOpenGoogleMaps = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(gpsLocation)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group relative p-8 bg-mkhe-bg/60 backdrop-blur-2xl border border-mkhe-border/50 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:bg-mkhe-bg/80 hover:border-mkhe-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-mkhe-text/5 rounded-full border border-mkhe-border/20 group-hover:bg-mkhe-text/10 transition-colors">
            <Globe className="w-5 h-5 text-mkhe-primary" />
          </div>
          <h3 className="text-[10px] font-bold text-mkhe-text/60 uppercase tracking-[0.2em]">
            {t("map.title")}
          </h3>
        </div>
        
        {/* Nút Khám phá ở góc phải */}
        <button 
          onClick={handleOpenGoogleMaps}
          className="flex items-center gap-1.5 px-4 py-2 cursor-pointer bg-mkhe-text/5 hover:bg-mkhe-primary hover:text-mkhe-bg border border-mkhe-border/20 hover:border-mkhe-primary rounded-full transition-all duration-300 text-mkhe-text/80"
          title={t("map.openAppTooltip")}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline-block">{t("map.openApp")}</span>
        </button>
      </div>

      <div className="flex items-start gap-3 mb-6">
        <MapPin className="w-4 h-4 text-mkhe-primary mt-1 flex-shrink-0" />
        <p className="text-sm text-mkhe-text/80 leading-relaxed font-light">
          {gpsLocation}
        </p>
      </div>

      {/* Map Interactive Area */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-mkhe-border/20">
        <iframe
          title={t("map.mapTitle")}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(gpsLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full" 
        />
      </div>
    </div>
  );
};

export default LocationMap;