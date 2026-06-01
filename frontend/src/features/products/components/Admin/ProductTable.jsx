import React from "react";
import { Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProductTable = ({ products, loading, onEdit }) => {
  const { t } = useTranslation("product");

  return (
    <div
      className={`bg-mkhe-bg rounded shadow overflow-x-auto border border-mkhe-border/30 min-h-[380px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
            <th className="p-4 font-semibold w-1/4">{t("table.name")}</th>
            <th className="p-4 font-semibold w-1/7">{t("table.sku")}</th>
            <th className="p-4 font-semibold w-1/7">{t("table.category")}</th>
            <th className="p-4 font-semibold text-center w-1/8">
              {t("table.price")}
            </th>
            <th className="p-4 font-semibold text-center w-1/10">
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
          {loading && (
            <tr className="absolute inset-0 h-full flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
              <td colSpan="7" className="text-center">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                </div>
              </td>
            </tr>
          )}
          {!loading && products.length === 0 ? (
            <tr>
              <td colSpan="7" className="p-8 text-center text-mkhe-text/60">
                {t("table.empty")}
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-mkhe-border/20 hover:bg-mkhe-primary/5 transition-colors last:border-b-0"
              >
                <td className="p-4 font-medium text-mkhe-text">
                  {product.name}
                </td>
                <td className="p-4 text-mkhe-primary font-semibold">
                  {product.sku}
                </td>
                <td className="p-4">
                  <span className="bg-mkhe-primary/10 text-mkhe-primary font-medium px-2.5 py-1 rounded text-xs border border-mkhe-primary/30">
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

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-mkhe-bg/30 backdrop-blur-sm rounded">
          <div className="animate-spin">
            <div className="w-12 h-12 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
