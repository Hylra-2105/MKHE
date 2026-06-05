import React from "react";
import { useTranslation } from "react-i18next";

const BoardGameTeaser = () => {
  const { t } = useTranslation("home");

  return (
    <section className="py-20 px-6 bg-mkhe-bg">
      <div className="max-w-7xl mx-auto text-center relative overflow-hidden rounded-2xl border border-mkhe-border/30 bg-mkhe-input/30 p-12 md:p-24 theme-shadow">
        {/* Badge "Coming Soon" có hiệu ứng chớp tắt nhẹ */}
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-mkhe-primary text-mkhe-primary text-sm font-semibold uppercase tracking-widest animate-pulse">
          {t("boardgame.badge")}
        </div>

        {/* Tiêu đề chính */}
        <h2 className="text-4xl md:text-5xl font-logo font-bold mb-6 text-mkhe-text">
          {t("boardgame.title")}
        </h2>

        {/* Đoạn mô tả mồi chài */}
        <p className="max-w-2xl mx-auto text-mkhe-text/70 leading-relaxed text-lg">
          {t("boardgame.desc")}
        </p>
      </div>
    </section>
  );
};

export default BoardGameTeaser;
