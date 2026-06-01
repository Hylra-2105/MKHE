import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/ui/Dropdown";

const ProductFilter = ({
  searchInput,
  setSearchInput,
  categoryFilter,
  handleCategoryChange,
  handleSearch,
}) => {
  const { t } = useTranslation("product");

  const categoryOptions = [
    { value: "", label: t("filter.all_categories") },
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];

  return (
    <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col md:flex-row md:items-center gap-4 border border-mkhe-border/30">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder={t("filter.search_placeholder")}
          className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="h-10 w-40 bg-mkhe-primary text-white px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold"
        >
          {t("filter.search_btn")}
        </button>
      </form>

      <Dropdown
        value={categoryFilter}
        options={categoryOptions}
        onChange={(val) => handleCategoryChange({ target: { value: val } })}
        placeholder={t("filter.all_categories")}
        className="w-full md:w-80"
        triggerClassName="h-10 px-3 rounded"
        optionClassName="text-sm"
      />
    </div>
  );
};

export default ProductFilter;
