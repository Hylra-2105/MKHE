import React, { useState, useEffect } from "react";
import { Filter, X, Check } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";

const ShopFilters = ({ filters, onFilterChange, onCloseMobile }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation(["common", "product"]);
  const isEnterprise = user?.role === "Enterprise";

  // Local state for debounced inputs
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [craftVillageValue, setCraftVillageValue] = useState(filters.craftVillage || "");

  // Sync from props
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setCraftVillageValue(filters.craftVillage || "");
  }, [filters.craftVillage]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (filters.search || "")) {
        onFilterChange("search", searchValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (craftVillageValue !== (filters.craftVillage || "")) {
        onFilterChange("craftVillage", craftVillageValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [craftVillageValue]);

  const categories = !isEnterprise ? [
    { value: "B2C_Premium", label: t("product:categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("product:categories.B2C_Mass_Premium") },
  ] : [
    { value: "B2C_Premium", label: t("product:categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("product:categories.B2C_Mass_Premium") },
    { value: "B2B_Luxury", label: t("product:categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("product:categories.B2B_Standard") },
  ];

  const culturalDNAs = [
    { value: "CHAM", label: t("product:culturalDNA.CHAM") },
    { value: "KHMER", label: t("product:culturalDNA.KHMER") },
    { value: "KINH", label: t("product:culturalDNA.KINH") },
    { value: "OTHER", label: t("product:culturalDNA.OTHER") },
  ];

  const predefinedMaterials = [
    { key: "brocade", value: "Thổ cẩm" },
    { key: "silk", value: "Lụa" },
    { key: "ceramic", value: "Gốm" },
    { key: "leather", value: "Da bò" },
    { key: "copper", value: "Khóa đồng" },
    { key: "silver", value: "Bạc" },
    { key: "wood", value: "Gỗ" }
  ];

  const handleMaterialChange = (mat) => {
    let currentMaterials = filters.material || [];
    if (typeof currentMaterials === "string") currentMaterials = [currentMaterials];
    
    let newMaterials;
    if (currentMaterials.includes(mat)) {
      newMaterials = currentMaterials.filter(m => m !== mat);
    } else {
      newMaterials = [...currentMaterials, mat];
    }
    
    onFilterChange("material", newMaterials.length > 0 ? newMaterials : null);
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar font-sans">
      <div 
        className="flex items-center justify-between p-6 border-b border-mkhe-border/30 lg:hidden sticky top-0 z-10 bg-mkhe-bg"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-mkhe-text" />
          <h2 className="font-serif text-xl text-mkhe-text">{t("product:shop.filters.title")}</h2>
        </div>
        <button 
          onClick={onCloseMobile}
          className="p-2 bg-mkhe-border/10 rounded-full text-mkhe-text hover:bg-mkhe-border/20 transition-colors cursor-pointer"
          title={t("common:close")}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 lg:p-2 space-y-10 pb-12">
        
        {/* TÌM KIẾM CHUNG */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-mkhe-text uppercase tracking-[0.2em]">{t("product:shop.filters.search_title")}</h3>
          <input 
            type="text" 
            placeholder={t("product:shop.filters.search_placeholder")} 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full p-3 bg-transparent border-b border-mkhe-border/20 text-mkhe-text focus:outline-none focus:border-mkhe-primary transition-colors text-sm placeholder:text-mkhe-text/40 placeholder:font-light"
          />
        </div>

        {/* Ưu đãi */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-mkhe-text uppercase tracking-[0.2em]">{t("product:shop.filters.offers_title", { defaultValue: "Ưu đãi" })}</h3>
          <div className="flex items-center mt-1">
            <input 
              id="filterOnSale"
              type="checkbox" 
              className="magic-cb-input"
              checked={filters.onSale || false}
              onChange={(e) => onFilterChange("onSale", e.target.checked ? "true" : null)}
            />
            <label htmlFor="filterOnSale" className="magic-cb-label text-sm text-mkhe-text">
              <span></span> {t("product:shop.filters.on_sale", { defaultValue: "Đang giảm giá" })}
            </label>
          </div>
        </div>

        {/* Làng nghề */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-mkhe-text uppercase tracking-[0.2em]">{t("product:shop.filters.craft_village_title")}</h3>
          <input 
            type="text" 
            placeholder={t("product:shop.filters.craft_village_placeholder")} 
            value={craftVillageValue}
            onChange={(e) => setCraftVillageValue(e.target.value)}
            className="w-full p-3 bg-transparent border-b border-mkhe-border/20 text-mkhe-text focus:outline-none focus:border-mkhe-primary transition-colors text-sm placeholder:text-mkhe-text/40 placeholder:font-light"
          />
        </div>

        {/* Chất liệu */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-mkhe-text uppercase tracking-[0.2em]">{t("product:shop.filters.material_title")}</h3>
          <div className="flex flex-wrap gap-2">
            {predefinedMaterials.map(mat => {
              const isActive = filters.material && (
                Array.isArray(filters.material) 
                  ? filters.material.includes(mat.value) 
                  : filters.material === mat.value
              );
              return (
                <button
                  key={mat.key}
                  onClick={() => handleMaterialChange(mat.value)}
                  className={`px-4 py-2 rounded-full border text-[11px] cursor-pointer uppercase tracking-wider font-medium transition-all duration-300 ${
                    isActive 
                      ? "bg-mkhe-text border-mkhe-text text-mkhe-bg shadow-md transform scale-105" 
                      : "bg-transparent border-mkhe-border/20 text-mkhe-text/70 hover:border-mkhe-text hover:text-mkhe-text"
                  }`}
                >
                  {t(`product:materials.${mat.key}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mã Gen (Cultural DNA) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-mkhe-text uppercase tracking-[0.2em]">{t("product:shop.filters.cultural_dna_title")}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${!filters.culturalDNA ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-mkhe-border/30'}`}>
                {!filters.culturalDNA && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
              </div>
              <input 
                type="radio" 
                checked={!filters.culturalDNA}
                onChange={() => onFilterChange("culturalDNA", null)}
                className="hidden"
              />
              <span className={`text-sm transition-colors ${!filters.culturalDNA ? 'text-mkhe-text font-medium' : 'text-mkhe-text/70 group-hover:text-mkhe-text'}`}>{t("product:shop.filters.all")}</span>
            </label>
            {culturalDNAs.map(dna => (
              <label key={dna.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.culturalDNA === dna.value ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-mkhe-border/30'}`}>
                  {filters.culturalDNA === dna.value && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
                </div>
                <input 
                  type="radio" 
                  checked={filters.culturalDNA === dna.value}
                  onChange={() => onFilterChange("culturalDNA", dna.value)}
                  className="hidden"
                />
                <span className={`text-sm transition-colors ${filters.culturalDNA === dna.value ? 'text-mkhe-text font-medium' : 'text-mkhe-text/70 group-hover:text-mkhe-text'}`}>{dna.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phân khúc */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-mkhe-text uppercase tracking-[0.2em]">{t("product:shop.filters.category_title")}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${!filters.category ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-mkhe-border/30'}`}>
                {!filters.category && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
              </div>
              <input 
                type="radio" 
                checked={!filters.category}
                onChange={() => onFilterChange("category", null)}
                className="hidden"
              />
              <span className={`text-sm transition-colors ${!filters.category ? 'text-mkhe-text font-medium' : 'text-mkhe-text/70 group-hover:text-mkhe-text'}`}>{t("product:shop.filters.all")}</span>
            </label>
            {categories.map(cat => (
              <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.category === cat.value ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-mkhe-border/30'}`}>
                  {filters.category === cat.value && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
                </div>
                <input 
                  type="radio" 
                  checked={filters.category === cat.value}
                  onChange={() => onFilterChange("category", cat.value)}
                  className="hidden"
                />
                <span className={`text-sm transition-colors ${filters.category === cat.value ? 'text-mkhe-text font-medium' : 'text-mkhe-text/70 group-hover:text-mkhe-text'}`}>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={() => {
            onFilterChange("search", null);
            onFilterChange("craftVillage", null);
            onFilterChange("material", null);
            onFilterChange("culturalDNA", null);
            onFilterChange("category", null);
          }}
          className="w-full py-4 mt-8 bg-transparent cursor-pointer border border-mkhe-text hover:bg-mkhe-text text-mkhe-text hover:text-mkhe-bg font-medium rounded-full transition-colors text-xs uppercase tracking-widest"
        >
          {t("product:shop.filters.clear_filters")}
        </button>
      </div>
    </div>
  );
};

export default ShopFilters;
