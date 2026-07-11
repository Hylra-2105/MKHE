import { useTranslation } from "react-i18next";

export default function Pagination({ page, setPage, totalPages, loading }) {
  const { t } = useTranslation("admin");

  if (totalPages <= 0) return null;

  return (
    <>
      <div className="h-px bg-mkhe-border/30 my-7 w-full"></div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-mkhe-text/60">
          {t("pagination.showing_page")}{" "}
          <span className="font-bold text-mkhe-primary">{page}</span> / {totalPages}
        </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1 || loading}
          className={`px-2 py-1 rounded transition-colors mr-2 ${
            page === 1
              ? "invisible"
              : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          &lt;
        </button>

        {[page - 1, page, page + 1].map((pageNum) => {
          const isValid = pageNum >= 1 && pageNum <= totalPages;
          const isActive = page === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => isValid && setPage(pageNum)}
              disabled={loading || !isValid}
              className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                !isValid
                  ? "invisible w-8"
                  : isActive
                    ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
                    : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
              } bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || loading}
          className={`px-2 py-1 rounded transition-colors font-bold ml-2 ${
            page === totalPages
              ? "invisible"
              : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          &gt;
        </button>
      </div>
      </div>
    </>
  );
}
