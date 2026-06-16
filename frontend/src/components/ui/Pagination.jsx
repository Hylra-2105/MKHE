import React from "react";
import { useTranslation } from "react-i18next";

export default function Pagination({ page, setPage, totalPages, loading }) {
  const { t } = useTranslation("admin");

  if (totalPages <= 0) return null;

  return (
    <div className="flex justify-between items-center mt-auto pt-6 h-14 border-t border-mkhe-border/20">
      <span className="text-sm text-mkhe-text/60">
        {t("pagination.showing_page")}{" "}
        <span className="font-bold text-mkhe-primary">{page}</span> /{" "}
        {totalPages}
      </span>

      {/* KHUNG CỐ ĐỊNH: Chiều rộng không đổi, chống giật tuyệt đối */}
      <div className="flex items-center justify-end w-[200px] gap-1">
        {/* Nút Previous (<) - Ẩn khi ở trang 1 để gọn giao diện theo ý user */}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || loading}
          className={`w-8 h-8 flex items-center justify-center rounded font-medium text-mkhe-primary hover:bg-mkhe-primary/20 cursor-pointer transition-colors disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent ${page === 1 ? "invisible" : ""}`}
        >
          &lt;
        </button>

        {/* CÁC SỐ TRANG */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => {
            // Trang 1: chỉ hiện 1 và 2
            if (page === 1) return p === 1 || p === 2;

            // Trang cuối: chỉ hiện (cuối - 1) và cuối
            if (page === totalPages)
              return p === totalPages - 1 || p === totalPages;

            // Các trang giữa: hiện 3 số (trước, hiện tại, sau)
            return p >= page - 1 && p <= page + 1;
          })
          .map((p) => {
            const isActive = page === p;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                disabled={loading}
                className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "text-base font-semibold text-mkhe-primary"
                    : "text-base font-normal text-mkhe-text/50 hover:text-mkhe-primary cursor-pointer hover:-translate-y-0.5"
                } bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {p}
              </button>
            );
          })}

        {/* Nút Next (>) - Ẩn khi ở trang cuối để gọn giao diện */}
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || loading}
          className={`w-8 h-8 flex items-center justify-center rounded font-medium text-mkhe-primary hover:bg-mkhe-primary/20 cursor-pointer transition-colors disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent ${page === totalPages ? "invisible" : ""}`}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
