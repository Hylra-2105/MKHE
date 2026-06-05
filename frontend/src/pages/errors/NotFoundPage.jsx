import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import notFoundImg from "@/assets/images/404-mkhe.png";

export default function NotFoundPage() {
  const { t } = useTranslation("errors");

  return (
    <div className="min-h-screen bg-mkhe-bg flex flex-col items-center justify-center text-mkhe-text px-6 transition-colors duration-300">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-8 relative">
          <img
            src={notFoundImg}
            alt="MKHE Not Found"
            className="w-56 h-auto object-contain"
          />
        </div>

        <h1 className="text-6xl font-logo font-bold text-gradient-gold mb-4 tracking-wider">
          {t("404")}
        </h1>

        <h2 className="text-2xl font-semibold mb-2 text-mkhe-text/90">
          {t("404_title")}
        </h2>

        <p className="text-mkhe-text/60 mb-10 text-sm leading-relaxed max-w-md mx-auto italic">
          {t("404_desc")}
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
