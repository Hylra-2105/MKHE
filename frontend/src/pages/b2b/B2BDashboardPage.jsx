import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

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

      <div className="mb-6 flex justify-end">
        <Link
          to="/b2b/order-request"
          className="flex items-center gap-2 bg-mkhe-primary text-mkhe-bg px-6 py-2.5 rounded-lg font-semibold hover:bg-mkhe-primary/90 transition-colors shadow-lg hover:shadow-mkhe-primary/30"
        >
          <PlusCircle className="w-5 h-5" />
          Tạo Yêu cầu Đặt hàng
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-mkhe-border/50 rounded-2xl bg-mkhe-bg/50">
        <p className="text-mkhe-text/50">Nội dung mua sắm B2B đang được xây dựng...</p>
      </div>
    </div>
  );
}
