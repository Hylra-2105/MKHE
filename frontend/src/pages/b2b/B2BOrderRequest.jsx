import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getB2BProductsApi, createB2BOrderApi } from "@/api/b2bApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatNumber, parseNumber } from "@/utils/formatters";
import { Upload, Calendar, Building2, Package, Coins, ChevronLeft, X, FileText, Box, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";

export default function B2BOrderRequest() {
  const { t } = useTranslation(["common", "b2b"]);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const fpRef = useRef(null);

  const [formData, setFormData] = useState({
    productOrService: "",
    quantity: "",
    budget: "",
    deliveryDate: null,
    packagingRequirement: "STANDARD_BOX",
    note: "",
  });
  const [designFiles, setDesignFiles] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getB2BProductsApi({ limit: 100 });
        setProducts(data?.data || []);
      } catch (error) {
        toast.error(t("b2b:messages.fetchProductsError"));
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (designFiles.length + newFiles.length > 5) {
        toast.error(t("b2b:messages.maxFiles"));
        return;
      }
      setDesignFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setDesignFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      if (designFiles.length + newFiles.length > 5) {
        toast.error(t("b2b:messages.maxFiles"));
        return;
      }
      setDesignFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom Validation
    const errors = {};
    if (!formData.productOrService) errors.productOrService = "b2b:validation.productRequired";
    if (!formData.quantity) errors.quantity = "b2b:validation.quantityRequired";
    if (!formData.deliveryDate) errors.deliveryDate = "b2b:validation.deliveryDateRequired";
    
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("productOrService", formData.productOrService);
      data.append("quantity", formData.quantity);
      data.append("budget", formData.budget || 0);
      data.append("deliveryDate", formData.deliveryDate.toISOString());
      data.append("note", formData.note);
      data.append("packagingRequirement", formData.packagingRequirement);
      if (designFiles.length > 0) {
        designFiles.forEach(file => data.append("designFiles", file));
      }

      await createB2BOrderApi(data);
      toast.success(t("b2b:messages.success"));
      
      // Reset form
      setFormData({
        productOrService: "",
        quantity: "",
        budget: "",
        deliveryDate: null,
        packagingRequirement: "STANDARD_BOX",
        note: "",
      });
      setFormErrors({});
      setDesignFiles([]);
    } catch (error) {
      toast.error(error.response?.data?.message || t("b2b:messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-mkhe-bg p-4 md:p-8 flex flex-col items-center text-mkhe-text">
      <div className="max-w-3xl w-full">
        <button
          onClick={() => navigate("/b2b/dashboard")}
          className="flex items-center gap-2 text-sm text-mkhe-text/60 hover:text-mkhe-primary transition-colors mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 cursor-pointer" /> {t("b2b:buttons.back")}
        </button>
      </div>

      <div className="max-w-3xl w-full bg-mkhe-bg border border-mkhe-border rounded-xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1 text-center">
          {t("b2b:title")}
        </h1>
        <p className="text-sm text-mkhe-text/60 italic text-center mb-6">
          {t("b2b:subtitle")}
        </p>

        <div className="bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-lg p-4 mb-8 flex items-start gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="Logo" className="w-12 h-12 rounded-full object-cover shrink-0 border border-mkhe-border shadow-sm mt-1" />
          ) : (
            <Building2 className="w-10 h-10 p-2 bg-mkhe-primary/10 rounded-full text-mkhe-primary shrink-0 mt-1" />
          )}
          <div>
            <h3 className="font-semibold text-mkhe-primary mb-1">
              {t("b2b:companyInfo.title")}
            </h3>
            <p className="text-sm text-mkhe-text/80 mb-2">
              {t("b2b:companyInfo.desc1")} ({t("b2b:companyInfo.company")}: <span className="font-semibold">{user?.companyName || t("b2b:companyInfo.notUpdated")}</span>, {t("b2b:companyInfo.taxCode")}: <span className="font-semibold">{user?.taxCode || t("b2b:companyInfo.notUpdated")}</span>).
            </p>
            <p className="text-xs text-yellow-600/80 italic">
              {t("b2b:companyInfo.note")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Gói dịch vụ - Full width */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
              {t("b2b:fields.product")} <span className="ml-1 text-red-500">*</span>
            </label>
            <Dropdown
              value={formData.productOrService}
              onChange={(val) => {
                handleChange({ target: { name: "productOrService", value: val } });
                if (formErrors.productOrService) setFormErrors(prev => ({ ...prev, productOrService: '' }));
              }}
              options={products.map((p) => ({ 
                value: p._id, 
                label: p.name === "Gói Tư Vấn & Thiết Kế Sản Phẩm Theo Yêu Cầu" ? t("b2b:consultingPackage") : p.name 
              }))}
              placeholder={t("b2b:fields.productPlaceholder")}
              triggerClassName={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm cursor-pointer ${formErrors.productOrService ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
              disabled={isLoadingProducts}
            />
            {formErrors.productOrService && (
              <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="text-xs font-medium">{t(formErrors.productOrService)}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("b2b:fields.quantity")} <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={(e) => {
                  handleChange(e);
                  if (formErrors.quantity) setFormErrors(prev => ({ ...prev, quantity: '' }));
                }}
                className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.quantity ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
              />
              {formErrors.quantity && (
                <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-medium">{t(formErrors.quantity)}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("b2b:fields.budget")}
              </label>
              <input
                type="text"
                name="budget"
                value={formatNumber(formData.budget)}
                onChange={(e) => {
                  const rawValue = parseNumber(e.target.value);
                  handleChange({ target: { name: "budget", value: rawValue || "" } });
                }}
                placeholder={t("b2b:fields.budgetPlaceholder")}
                className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("b2b:fields.deliveryDate")} <span className="ml-1 text-red-500">*</span>
              </label>
              <Flatpickr
                ref={fpRef}
                value={formData.deliveryDate}
                onChange={([date]) => {
                  setFormData((prev) => ({ ...prev, deliveryDate: date }));
                  if (formErrors.deliveryDate) setFormErrors(prev => ({ ...prev, deliveryDate: '' }));
                }}
                options={{ 
                  locale: Vietnamese, 
                  minDate: "today", 
                  dateFormat: "d-m-Y",
                  clickOpens: false
                }}
                placeholder={t("b2b:fields.deliveryDatePlaceholder")}
                className={`w-full p-3.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm cursor-pointer ${formErrors.deliveryDate ? "border-red-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`}
                onClick={() => {
                  if (fpRef.current?.flatpickr) {
                    fpRef.current.flatpickr.toggle();
                  }
                }}
              />
              {formErrors.deliveryDate && (
                <div className="flex items-center gap-1.5 mt-1.5 ml-1 text-red-500">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-medium">{t(formErrors.deliveryDate)}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
                {t("b2b:fields.packaging")}
              </label>
              <Dropdown
                value={formData.packagingRequirement}
                onChange={(val) => handleChange({ target: { name: "packagingRequirement", value: val } })}
                options={[
                  { value: "STANDARD_BOX", label: t("b2b:fields.packagingOptions.STANDARD_BOX") },
                  { value: "NO_PACKAGING", label: t("b2b:fields.packagingOptions.NO_PACKAGING") },
                ]}
                placeholder={t("b2b:fields.packagingPlaceholder")}
                triggerClassName="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">
              {t("b2b:fields.note")}
            </label>
            <textarea
              name="note"
              rows="3"
              value={formData.note}
              onChange={handleChange}
              placeholder={t("b2b:fields.notePlaceholder")}
              className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm resize-y min-h-[120px]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 mb-2">
              {t("b2b:fields.designFiles")}
            </label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-mkhe-border/50 rounded-xl p-6 text-center hover:bg-mkhe-primary/5 transition-colors group relative"
            >
              <input
                type="file"
                id="designFiles"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.ai,.png,.jpg,.jpeg"
                multiple
              />
              <label
                htmlFor="designFiles"
                className="cursor-pointer flex flex-col items-center gap-3 w-full h-full"
              >
                <div className="w-12 h-12 bg-mkhe-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-mkhe-primary" />
                </div>
                <div>
                  <p className="font-medium text-mkhe-text">
                    {t("b2b:fields.dragDrop")}
                  </p>
                  <p className="text-sm text-mkhe-text/50 mt-1">
                    {t("b2b:fields.fileHint")}
                  </p>
                  <p className="text-xs text-yellow-600/80 italic mt-2">
                    {t("b2b:fields.fileNote")}
                  </p>
                </div>
              </label>
            </div>

            {/* Gallery thu nhỏ */}
            {designFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {designFiles.map((file, index) => (
                  <div key={index} className="relative group bg-mkhe-input rounded-lg border border-mkhe-border p-2 flex flex-col items-center justify-center aspect-square shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Xóa file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <FileText className="w-10 h-10 text-mkhe-text/40 mb-2" />
                    )}
                    <span className="text-[10px] text-center text-mkhe-text/80 truncate w-full px-1 absolute bottom-1 bg-mkhe-bg/90 py-0.5 rounded">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? t("b2b:buttons.submitting") : t("b2b:buttons.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
