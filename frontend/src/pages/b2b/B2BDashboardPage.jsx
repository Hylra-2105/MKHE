import React from "react";
import { useTranslation } from "react-i18next";

export default function B2BDashboardPage() {
  const { t } = useTranslation(["common"]);

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
          B2B Dashboard
        </h1>
        <p className="text-sm text-mkhe-text/60 italic">
          Khu vực dành riêng cho Đối tác Doanh nghiệp
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-mkhe-border/50 rounded-2xl bg-mkhe-bg/50">
        <p className="text-mkhe-text/50">Nội dung mua sắm B2B đang được xây dựng...</p>
      </div>
    </div>
  );
}
