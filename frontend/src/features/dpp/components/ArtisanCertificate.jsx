import React from "react";
import { Fingerprint, Award, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const ArtisanCertificate = ({ artisanName, culturalDNA, categoryMatrix }) => {
  const { t } = useTranslation("dpp");
  
  return (
    <div className="group relative p-8 bg-mkhe-bg/80 backdrop-blur-2xl border border-mkhe-primary/20 rounded-[2.5rem] shadow-xl overflow-hidden transition-all duration-500 hover:border-mkhe-primary/40 hover:-translate-y-1">
      {/* Decorative Gold lines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-mkhe-primary/10 to-transparent pointer-events-none rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-mkhe-primary/10 to-transparent pointer-events-none rounded-tr-full" />
      
      {/* Ambient background glow inside card */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-mkhe-primary/5 rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:bg-mkhe-primary/15" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-mkhe-bg rounded-full border border-mkhe-border shadow-inner">
            <Fingerprint className="w-5 h-5 text-mkhe-primary" />
          </div>
          <h2 className="text-xs font-bold text-mkhe-primary uppercase tracking-[0.25em]">
            {t("certificate.title")}
          </h2>
        </div>
        <Award className="w-7 h-7 text-mkhe-primary/30" />
      </div>

      <div className="space-y-7 relative z-10">
        <div>
          <p className="text-[9px] font-bold text-mkhe-text/50 uppercase tracking-widest mb-2">
            {t("certificate.artisan")}
          </p>
          <p className="text-2xl font-serif text-mkhe-text/90 italic flex items-start gap-2">
            <Quote className="w-4 h-4 text-mkhe-primary/40 rotate-180 -mt-0.5 flex-shrink-0" />
            {artisanName || t("certificate.defaultArtisan")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-mkhe-border/50">
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-mkhe-text/50 uppercase tracking-widest">
              {t("certificate.culturalDNA")}
            </p>
            <p className="text-sm font-medium text-mkhe-text/80">{culturalDNA || t("certificate.updating")}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-mkhe-text/50 uppercase tracking-widest">
              {t("certificate.category")}
            </p>
            <p className="text-sm font-medium text-mkhe-primary/90">{categoryMatrix?.replace(/_/g, " ") || "B2C"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanCertificate;