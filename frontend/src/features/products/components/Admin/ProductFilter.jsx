import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/ui/Dropdown";

const ProductFilter = ({
  searchInput,
  setSearchInput,
  categoryFilter,
  handleCategoryChange,
  handleSearch,
  dnaFilter, // Thêm prop mới
  handleDnaChange, // Thêm prop mới
  vendorFilter,
  handleVendorChange,
}) => {
  const { t } = useTranslation("product");

  const categoryOptions = [
    { value: "", label: t("filter.all_categories") },
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];

  // Khai báo thêm option cho Mã gen Văn hóa
  const dnaOptions = [
    { value: "", label: t("filter.all_dna", "Tất cả Mã gen") },
    { value: "CHAM", label: t("culturalDNA.CHAM", "Mã gen Chăm") },
    { value: "KHMER", label: t("culturalDNA.KHMER", "Mã gen Khmer") },
    { value: "KINH", label: t("culturalDNA.KINH", "Mã gen Kinh") },
    { value: "OTHER", label: t("culturalDNA.OTHER", "Khác / Đa bản sắc") },
  ];

  const vendorOptions = [
    { value: "", label: "Tất cả Đối tác" },
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
    { value: "Khác", label: "Khác" },
  ];

  return (
    <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col xl:flex-row xl:items-center gap-4 border border-mkhe-border/30">
      {/* Khối Search */}
      <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
        <input
          type="text"
          placeholder={t("filter.search_placeholder")}
          className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="h-10 w-28 md:w-40 bg-mkhe-primary text-white px-4 md:px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold whitespace-nowrap"
        >
          {t("filter.search_btn")}
        </button>
      </form>

      {/* Khối Dropdown Filters */}
      <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
        <Dropdown
          value={categoryFilter}
          options={categoryOptions}
          // Do component Dropdown Custom của cha trả về thẳng giá trị (value),
          // nên phải gói nó lại thành event giả { target: { value: val } } để khớp hàm cũ
          onChange={(val) => handleCategoryChange({ target: { value: val } })}
          placeholder={t("filter.all_categories")}
          className="w-full md:w-36 lg:w-44"
          triggerClassName="h-10 px-3 rounded"
          optionClassName="text-sm"
        />

        <Dropdown
          value={dnaFilter}
          options={dnaOptions}
          onChange={(val) => handleDnaChange({ target: { value: val } })}
          placeholder={t("filter.all_dna", "Tất cả Mã gen")}
          className="w-full md:w-36 lg:w-44"
          triggerClassName="h-10 px-3 rounded"
          optionClassName="text-sm"
        />

        <Dropdown
          value={vendorFilter}
          options={vendorOptions}
          onChange={(val) => handleVendorChange({ target: { value: val } })}
          placeholder="Tất cả Đối tác"
          className="w-full md:w-40 lg:w-48"
          triggerClassName="h-10 px-3 rounded"
          optionClassName="text-sm"
        />
      </div>
    </div>
  );
};

export default ProductFilter;
