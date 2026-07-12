import React, { useState } from "react";
import { Plus, X, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const ProductColorsInput = ({ colors = [], onChange, galleryImages = [], error }) => {
  const { t } = useTranslation("product");
  
  // State for image picker modal
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddColor = () => {
    const newColors = [...colors, { name: "", stock: 0, image: "" }];
    onChange(newColors);
    setIsExpanded(true); // Always expand when adding a new color
  };

  const handleRemoveColor = (index) => {
    const newColors = colors.filter((_, i) => i !== index);
    onChange(newColors);
  };

  const handleChange = (index, field, value) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    onChange(newColors);
  };

  const openImagePicker = (index) => {
    setActiveColorIndex(index);
    setIsImagePickerOpen(true);
  };

  const handleSelectImage = (imgUrl) => {
    if (activeColorIndex !== null) {
      handleChange(activeColorIndex, "image", imgUrl);
    }
    setIsImagePickerOpen(false);
    setActiveColorIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div 
          className="flex-1 cursor-pointer flex items-center gap-3" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="p-1.5 bg-mkhe-border/10 rounded-full hover:bg-mkhe-border/20 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-mkhe-text/60" /> : <ChevronDown className="w-4 h-4 text-mkhe-text/60" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-mkhe-text">{t("form.colors.title")} {colors.length > 0 && <span className="text-mkhe-primary font-bold">({colors.length})</span>}</h3>
            <p className="text-[11px] text-mkhe-text/70">{t("form.colors.subtitle")}</p>
          </div>
        </div>
        <Button type="button" onClick={handleAddColor} variant="outline" size="sm" className="!w-auto gap-2 shrink-0 px-4 py-2 text-xs">
          <Plus className="w-4 h-4" /> {t("form.colors.add_color")}
        </Button>
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {isExpanded && (
        <div className="space-y-3 max-h-[380px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
          {colors.map((color, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 p-5 bg-mkhe-bg border border-mkhe-border/40 rounded-2xl relative group shadow-sm hover:border-mkhe-border transition-colors">
            <button 
              type="button"
              onClick={() => handleRemoveColor(index)}
              className="absolute top-3 right-3 p-1.5 bg-rose-50 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white shadow-sm border border-rose-100 cursor-pointer z-10"
              title={t("form.colors.remove_color")}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label={t("form.colors.color_name")}
                placeholder={t("form.colors.color_name_placeholder")}
                value={color.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                required
              />
              
              <InputField
                type="number"
                label={t("form.colors.stock")}
                placeholder={t("form.colors.stock_placeholder")}
                value={color.stock}
                onChange={(e) => handleChange(index, "stock", parseInt(e.target.value) || 0)}
                required
              />
              
              <InputField
                type="text"
                label={t("form.colors.price_override")}
                placeholder={t("form.colors.price_override_placeholder")}
                value={color.priceOverride ? color.priceOverride.toLocaleString('vi-VN') : ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  handleChange(index, "priceOverride", val ? parseInt(val, 10) : "");
                }}
              />
            </div>

            <div className="w-full md:w-32 flex flex-col items-center justify-center shrink-0 border border-dashed border-mkhe-border/60 hover:border-mkhe-primary/50 transition-colors rounded-xl p-2 bg-mkhe-border/5">
              <span className="text-[10px] font-bold text-mkhe-text/50 uppercase mb-2">{t("form.colors.image")}</span>
              {color.image ? (
                <div className="relative group/img cursor-pointer w-full" onClick={() => openImagePicker(index)}>
                  <img src={color.image} alt={color.name} className="w-full h-16 object-cover rounded-lg border border-mkhe-border/30" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center rounded-lg transition-opacity">
                    <ImageIcon className="w-4 h-4 text-white mb-1" />
                    <span className="text-white text-[10px] font-medium">{t("form.colors.change_image")}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openImagePicker(index)}
                  className="w-full h-16 flex flex-col items-center justify-center gap-1.5 text-mkhe-primary hover:bg-mkhe-primary/10 rounded-lg transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t("form.colors.choose_image")}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {colors.length === 0 && (
          <div className="text-center py-6 bg-mkhe-border/5 border border-dashed border-mkhe-border rounded-xl">
            <p className="text-sm text-mkhe-text/60">{t("form.colors.no_colors")}</p>
          </div>
        )}
        </div>
      )}

      {/* Image Picker Modal */}
      {isImagePickerOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsImagePickerOpen(false)}>
          <div className="bg-mkhe-bg w-full max-w-2xl rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-mkhe-text">{t("form.colors.picker_title")}</h3>
              <button type="button" onClick={() => setIsImagePickerOpen(false)} className="p-2 bg-mkhe-border/20 rounded-full hover:bg-mkhe-border/50">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {galleryImages.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-mkhe-text/60">{t("form.colors.picker_empty")}</p>
                <p className="text-xs text-mkhe-text/40 mt-1">{t("form.colors.picker_empty_desc")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
                {galleryImages.map((img, idx) => {
                  const url = typeof img === 'string' ? img : img.url;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectImage(url)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-mkhe-primary transition-all group relative"
                    >
                      <img src={url} alt={`gallery-${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductColorsInput;
