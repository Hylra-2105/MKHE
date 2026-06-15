import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTranslation } from "react-i18next";

const ShopFilters = ({ filters, onFilterChange, onCloseMobile }) => {
  const { user } = useAuthStore();
  const { t } = useTranslation("common");
  const isGuest = !user || user.role === "Guest";

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

  const categories = isGuest ? [
    { value: "B2C_Premium", label: "B2C Premium" },
    { value: "B2C_Mass_Premium", label: "B2C Mass Premium" },
  ] : [
    { value: "B2C_Premium", label: "B2C Premium" },
    { value: "B2C_Mass_Premium", label: "B2C Mass Premium" },
    { value: "B2B_Luxury", label: "B2B Luxury" },
    { value: "B2B_Standard", label: "B2B Standard" },
  ];

  const culturalDNAs = [
    { value: "CHAM", label: "Chăm" },
    { value: "KHMER", label: "Khmer" },
    { value: "KINH", label: "Kinh" },
    { value: "OTHER", label: "Khác" },
  ];

  const predefinedMaterials = [
    "Thổ cẩm",
    "Lụa",
    "Gốm",
    "Da bò",
    "Khóa đồng",
    "Bạc",
    "Gỗ"
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
      <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]/10 lg:hidden">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#2A2A2A]" />
          <h2 className="font-serif text-xl text-[#2A2A2A]">Bộ lọc</h2>
        </div>
        <button onClick={onCloseMobile} className="p-2 bg-[#2A2A2A]/5 rounded-full text-[#2A2A2A] hover:bg-[#2A2A2A]/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 lg:p-2 space-y-10 pb-12">
        
        {/* TÌM KIẾM CHUNG */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#2A2A2A] uppercase tracking-[0.2em]">Tìm kiếm sản phẩm</h3>
          <input 
            type="text" 
            placeholder="Tên sản phẩm, mã SKU..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full p-3 bg-transparent border-b border-[#2A2A2A]/20 text-[#2A2A2A] focus:outline-none focus:border-mkhe-primary transition-colors text-sm placeholder:text-[#2A2A2A]/40 placeholder:font-light"
          />
        </div>

        {/* Làng nghề */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#2A2A2A] uppercase tracking-[0.2em]">Làng nghề / Xuất xứ</h3>
          <input 
            type="text" 
            placeholder="Tìm theo làng nghề..." 
            value={craftVillageValue}
            onChange={(e) => setCraftVillageValue(e.target.value)}
            className="w-full p-3 bg-transparent border-b border-[#2A2A2A]/20 text-[#2A2A2A] focus:outline-none focus:border-mkhe-primary transition-colors text-sm placeholder:text-[#2A2A2A]/40 placeholder:font-light"
          />
        </div>

        {/* Chất liệu */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#2A2A2A] uppercase tracking-[0.2em]">Chất liệu</h3>
          <div className="flex flex-wrap gap-2">
            {predefinedMaterials.map(mat => {
              const isActive = filters.material && (
                Array.isArray(filters.material) 
                  ? filters.material.includes(mat) 
                  : filters.material === mat
              );
              return (
                <button
                  key={mat}
                  onClick={() => handleMaterialChange(mat)}
                  className={`px-4 py-2 rounded-full border text-[11px] uppercase tracking-wider font-medium transition-all duration-300 ${
                    isActive 
                      ? "bg-[#2A2A2A] border-[#2A2A2A] text-white shadow-md transform scale-105" 
                      : "bg-transparent border-[#2A2A2A]/20 text-[#2A2A2A]/70 hover:border-[#2A2A2A] hover:text-[#2A2A2A]"
                  }`}
                >
                  {mat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mã Gen (Cultural DNA) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#2A2A2A] uppercase tracking-[0.2em]">Mã gen văn hóa</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${!filters.culturalDNA ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-[#2A2A2A]/30'}`}>
                {!filters.culturalDNA && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
              </div>
              <input 
                type="radio" 
                checked={!filters.culturalDNA}
                onChange={() => onFilterChange("culturalDNA", null)}
                className="hidden"
              />
              <span className={`text-sm transition-colors ${!filters.culturalDNA ? 'text-[#2A2A2A] font-medium' : 'text-[#2A2A2A]/70 group-hover:text-[#2A2A2A]'}`}>Tất cả</span>
            </label>
            {culturalDNAs.map(dna => (
              <label key={dna.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.culturalDNA === dna.value ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-[#2A2A2A]/30'}`}>
                  {filters.culturalDNA === dna.value && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
                </div>
                <input 
                  type="radio" 
                  checked={filters.culturalDNA === dna.value}
                  onChange={() => onFilterChange("culturalDNA", dna.value)}
                  className="hidden"
                />
                <span className={`text-sm transition-colors ${filters.culturalDNA === dna.value ? 'text-[#2A2A2A] font-medium' : 'text-[#2A2A2A]/70 group-hover:text-[#2A2A2A]'}`}>{dna.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Phân khúc */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#2A2A2A] uppercase tracking-[0.2em]">Phân khúc</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${!filters.category ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-[#2A2A2A]/30'}`}>
                {!filters.category && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
              </div>
              <input 
                type="radio" 
                checked={!filters.category}
                onChange={() => onFilterChange("category", null)}
                className="hidden"
              />
              <span className={`text-sm transition-colors ${!filters.category ? 'text-[#2A2A2A] font-medium' : 'text-[#2A2A2A]/70 group-hover:text-[#2A2A2A]'}`}>Tất cả</span>
            </label>
            {categories.map(cat => (
              <label key={cat.value} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${filters.category === cat.value ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-[#2A2A2A]/30'}`}>
                  {filters.category === cat.value && <div className="w-2 h-2 rounded-full bg-mkhe-primary"></div>}
                </div>
                <input 
                  type="radio" 
                  checked={filters.category === cat.value}
                  onChange={() => onFilterChange("category", cat.value)}
                  className="hidden"
                />
                <span className={`text-sm transition-colors ${filters.category === cat.value ? 'text-[#2A2A2A] font-medium' : 'text-[#2A2A2A]/70 group-hover:text-[#2A2A2A]'}`}>{cat.label}</span>
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
          className="w-full py-4 mt-8 bg-transparent border border-[#2A2A2A] hover:bg-[#2A2A2A] text-[#2A2A2A] hover:text-white font-medium rounded-full transition-colors text-xs uppercase tracking-widest"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default ShopFilters;
