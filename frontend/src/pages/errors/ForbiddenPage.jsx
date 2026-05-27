import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

import forbidden from "@/assets/images/403-mkhe.png";

export default function ForbiddenPage() {
  const { t } = useTranslation("errors");

  return (
    <div className="min-h-screen bg-mkhe-bg flex flex-col items-center justify-center text-mkhe-text px-6 transition-colors duration-300">
      {/* ... (phần code bên trong giữ nguyên) ... */}
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-8 relative">
          <img
            src={forbidden}
            alt="MKHE Forbidden Guardian"
            className="w-56 h-auto object-contain"
          />
        </div>

        <h1 className="text-6xl font-logo font-bold text-gradient-gold mb-4 tracking-wider">
          {t("403")}
        </h1>

        <h2 className="text-2xl font-semibold mb-2 text-mkhe-text/90">
          {t("403_title")}
        </h2>

        <p className="text-mkhe-text/60 mb-10 text-sm leading-relaxed max-w-md mx-auto italic">
          {t("403_desc")}
        </p>

        <div className="flex justify-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-2.5 bg-mkhe-primary text-white px-7 py-3 rounded-md hover:opacity-90 transition-opacity font-semibold tracking-wider text-sm uppercase shadow-lg"
          >
            {t("back_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}
