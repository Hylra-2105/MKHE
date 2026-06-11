import React from "react";
import { Edit2, Dna } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProductTable = ({ products, loading, onEdit }) => {
  const { t } = useTranslation("product");

  return (
    <div
      className={`bg-mkhe-bg rounded shadow overflow-x-auto border border-mkhe-border/30 min-h-[420px] transition-opacity relative ${
        loading ? "opacity-60 pointer-events-none" : "opacity-100"
      }`}
    >
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
            <th className="p-4 font-semibold w-1/4">{t("table.name")}</th>
            <th className="p-4 font-semibold w-1/7">{t("table.sku")}</th>
            <th className="p-4 font-semibold w-1/7">{t("table.category")}</th>
            <th className="p-4 font-semibold text-center w-1/9">
              {t("table.price")}
            </th>
            <th className="p-4 font-semibold text-center w-1/11">
              {t("table.stock")}
            </th>
            <th className="p-4 font-semibold text-center w-1/6">
              {t("table.status")}
            </th>
            <th className="p-4 font-semibold text-center">
              {t("table.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="text-mkhe-text relative">
          {!loading && (!products || products.length === 0) ? (
            <tr>
              <td colSpan="7" className="p-8 text-center text-mkhe-text/60">
                {t("table.empty")}
              </td>
            </tr>
          ) : (
            products?.map((product) => (
              <tr
                key={product._id}
                className="border-b border-mkhe-border/20 hover:bg-mkhe-primary/5 transition-colors last:border-b-0"
              >
                <td className="p-4 font-medium text-mkhe-text">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className="text-base font-bold">{product.name}</span>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      {product.culturalDNA && product.culturalDNA !== "OTHER" && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-mkhe-primary bg-mkhe-primary/10 px-2 py-0.5 rounded border border-mkhe-primary/20">
                          <Dna className="w-3 h-3" />
                          {t(`culturalDNA.${product.culturalDNA}`, product.culturalDNA)}
                        </span>
                      )}
                      {product.vendor && (
                        <span className="text-[11px] text-mkhe-text/60 font-normal flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-mkhe-text/40"></span>
                          {product.vendor}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-mkhe-primary font-semibold">
                  {product.sku}
                </td>

                {/* CỘT CATEGORY */}
                <td className="p-4">
                  <span className="bg-mkhe-primary/10 text-mkhe-primary font-medium px-2.5 py-1 rounded text-[11px] border border-mkhe-primary/30 whitespace-nowrap">
                    {t(
                      `categories.${product.categoryMatrix}`,
                      product.categoryMatrix,
                    )}
                  </span>
                </td>

                <td className="p-4 text-center font-bold text-mkhe-primary">
                  {product.price?.toLocaleString("vi-VN") || 0} đ
                </td>
                <td className="p-4 text-center font-medium text-mkhe-text">
                  {product.stock || 0}
                </td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
                      product.status === "PUBLISHED"
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : product.status === "DRAFT"
                          ? "bg-gray-500/10 text-gray-600 border-gray-500/30"
                          : "bg-red-500/10 text-red-600 border-red-500/30"
                    }`}
                  >
                    {t(`statuses.${product.status}`, product.status)}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 rounded-full bg-mkhe-primary/10 hover:bg-mkhe-primary/20 text-mkhe-primary transition-all cursor-pointer"
                      title={t("table.edit")}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Loading Spinner mượt mà hơn */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-mkhe-bg/30 backdrop-blur-sm rounded z-10">
          <div className="animate-spin">
            <div className="w-10 h-10 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
