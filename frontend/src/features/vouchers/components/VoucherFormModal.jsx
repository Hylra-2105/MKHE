import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { X, Save, AlertCircle } from "lucide-react";
import { getVoucherOptionsApi, createVoucherApi, updateVoucherApi } from "@/api/voucherApi";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";

const flatpickrOptions = {
  locale: Vietnamese,
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
};

const formatFlatpickrDate = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const VoucherFormModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const { t } = useTranslation(["admin"]);
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    discountValue: "",
    maxDiscount: "",
    minOrderValue: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    applicableVillages: [],
    applicableCategories: [],
    isO2O: false,
    dropRate: 0,
    status: "DRAFT",
  });

  // Chỉ khóa các trường (isPublished = true) khi voucher ĐÃ CHẠY (startDate <= now)
  const isPublished = editData?.status === "PUBLISHED" && new Date(editData?.startDate) <= new Date();
  const isScheduled = editData?.status === "PUBLISHED" && new Date(editData?.startDate) > new Date();
  const [options, setOptions] = useState({ categories: [], villages: [] });
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  const startDateOptions = useMemo(() => ({
    ...flatpickrOptions,
    minDate: new Date(),
  }), []);

  const endDateOptions = useMemo(() => ({
    ...flatpickrOptions,
    minDate: formData.startDate || undefined,
  }), [formData.startDate]);

  const voucherTypes = [
    { value: "PERCENTAGE", label: t("voucher.type_percentage") },
    { value: "FIXED_AMOUNT", label: t("voucher.type_fixed") },
    { value: "FREE_SHIP", label: t("voucher.type_freeship") },
  ];

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          code: editData.code || "",
          type: editData.type || "PERCENTAGE",
          discountValue: editData.discountValue?.toString() || "",
          maxDiscount: editData.maxDiscount?.toString() || "",
          minOrderValue: editData.minOrderValue?.toString() || "",
          startDate: editData.startDate || "",
          endDate: editData.endDate || "",
          usageLimit: editData.usageLimit?.toString() || "",
          applicableVillages: editData.applicableVillages || [],
          applicableCategories: editData.applicableCategories || [],
          isO2O: editData.isO2O || false,
          dropRate: editData.dropRate || 0,
          status: editData.status || "DRAFT",
        });
      } else {
        // Load draft or reset form
      const draft = localStorage.getItem("mkhe_voucher_draft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData(parsedDraft);
          
          const isDraftEmpty = 
            (!parsedDraft.code) &&
            (parsedDraft.type === "PERCENTAGE" || !parsedDraft.type) &&
            (!parsedDraft.discountValue) &&
            (!parsedDraft.maxDiscount) &&
            (!parsedDraft.minOrderValue) &&
            (!parsedDraft.usageLimit) &&
            (!parsedDraft.gachaDropRate) &&
            (!parsedDraft.applicableCategories || parsedDraft.applicableCategories.length === 0) &&
            (!parsedDraft.applicableVillages || parsedDraft.applicableVillages.length === 0) &&
            (!parsedDraft.startDate) &&
            (!parsedDraft.endDate) &&
            (!parsedDraft.title);

          if (!isDraftEmpty) {
            toast.success(t("voucher.restore_success"));
          }
        } catch (e) {
          localStorage.removeItem("mkhe_voucher_draft");
        }
      } else {
        setFormData({
          code: "",
          type: "PERCENTAGE",
          discountValue: "",
          maxDiscount: "",
          minOrderValue: "",
          startDate: "",
          endDate: "",
          usageLimit: "",
          applicableVillages: [],
          applicableCategories: [],
          isO2O: false,
          dropRate: 0,
          status: "DRAFT",
        });
      }
      }

      // Fetch options
      const fetchOptions = async () => {
        try {
          setFetchingOptions(true);
          const res = await getVoucherOptionsApi();
          if (res.data && res.data.success && res.data.data) {
            setOptions({
              categories: res.data.data.categories || [],
              villages: res.data.data.villages || [],
            });
          } else if (res.data && !res.data.success) {
            setOptions({
              categories: res.data.categories || [],
              villages: res.data.villages || [],
            });
          }
        } catch (error) {
          toast.error(t("voucher.load_options_error"));
        } finally {
          setFetchingOptions(false);
        }
      };

      fetchOptions();
    }
  }, [isOpen, editData]);

  
  useEffect(() => {
    if (!isOpen || editData) return;

    const isFormEmpty = !formData.code && !formData.discountValue && !formData.startDate && !formData.endDate;
    if (isFormEmpty) return;

    const timer = setTimeout(() => {
      localStorage.setItem("mkhe_voucher_draft", JSON.stringify(formData));
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => {
      let nextValue = type === "checkbox" ? checked : value;
      let nextState = { ...prev, [name]: nextValue };

      
      if (name === "type" && nextValue === "PERCENTAGE" && nextState.discountValue) {
        if (Number(nextState.discountValue) > 100) {
          nextState.discountValue = "100";
        }
      }

      
      if (name === "type" && nextValue !== "PERCENTAGE") {
        nextState.maxDiscount = "";
      }

      return nextState;
    });
  };

  const formatMoney = (val) => {
    if (!val && val !== 0 && val !== "0") return "";
    return Number(val).toLocaleString("vi-VN");
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    let rawValue = value.replace(/\D/g, "");
    
    if (name === "discountValue" && formData.type === "PERCENTAGE" && rawValue !== "") {
      if (Number(rawValue) > 100) rawValue = "100";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: rawValue,
    }));
  };

  const toggleArrayItem = (field, item) => {
    setFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        return { ...prev, [field]: current.filter(i => i !== item) };
      }
      return { ...prev, [field]: [...current, item] };
    });
  };

  const handleSubmit = async (e, submitStatus = null) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      return toast.error(t("voucher.time_empty_error"));
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return toast.error(t("voucher.time_invalid_error"));
    }

    if (submitStatus === "PUBLISHED" && new Date(formData.startDate) < new Date()) {
      return toast.error(t("voucher.publish_time_passed", { defaultValue: "Thời gian bắt đầu đã qua. Vui lòng chọn lại thời gian từ hiện tại trở đi để phát hành." }));
    }

    try {
      setLoading(true);
      // Data format
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        status: submitStatus || formData.status,
      };

      if (editData) {
        await updateVoucherApi(editData._id, payload);
        toast.success(t("voucher.update_success", { defaultValue: "Cập nhật thành công" }));
      } else {
        await createVoucherApi(payload);
        localStorage.removeItem("mkhe_voucher_draft");
        toast.success(t("voucher.create_success"));
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || (editData ? t("voucher.update_error", { defaultValue: "Lỗi cập nhật" }) : t("voucher.create_error_generic")));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-mkhe-border)]/30 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50 shrink-0">
          <h2 className="font-serif text-2xl text-gradient-gold font-bold">
            {editData ? t("voucher.edit_title", { defaultValue: "Cập nhật Voucher" }) : t("voucher.create_title")}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-mkhe-primary/10 cursor-pointer rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-mkhe-text/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-6">
            
            {isPublished && (
              <div className="bg-yellow-500/10 text-yellow-600 p-4 rounded-lg mb-6 flex items-start gap-3 border border-yellow-500/20">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">{t("voucher.edit_warning", { defaultValue: "Voucher đang chạy, bạn chỉ có thể sửa Hạn sử dụng và Số lượng (nếu cần cắt chiến dịch hoặc bơm thêm mã)." })}</p>
              </div>
            )}

            {isScheduled && (
              <div className="bg-blue-500/10 text-blue-500 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-500/20">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm">Voucher này đang được lên lịch. Bạn có thể chỉnh sửa toàn bộ thông tin hoặc Hủy lên lịch để đưa về Bản nháp.</p>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 border-[var(--color-mkhe-border)]/20 text-gradient-gold">{t("voucher.basic_info")}</h3>
              
              <div>
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.voucher_code_label")} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="code"
                  required
                  placeholder={t("voucher.voucher_code_placeholder")}
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isPublished}
                  className={`w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm uppercase ${isPublished ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.discount_type_label")} <span className="text-red-500">*</span></label>
                  <Dropdown 
                    value={formData.type} 
                    options={voucherTypes} 
                    onChange={(val) => !isPublished && handleChange({ target: { name: 'type', value: val }})} 
                    disabled={isPublished}
                    className="w-full" 
                    triggerClassName="p-3.5 rounded-xl text-sm" 
                    optionClassName="text-sm" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.discount_amount_label")} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="discountValue"
                      required
                      placeholder={formData.type === "PERCENTAGE" ? t("voucher.discount_percentage_placeholder") : t("voucher.discount_fixed_placeholder")}
                      value={formatMoney(formData.discountValue)}
                      onChange={handleMoneyChange}
                      disabled={isPublished}
                      className={`w-full p-3.5 pr-10 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm ${isPublished ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mkhe-text/50 font-medium">
                      {formData.type === "PERCENTAGE" ? "%" : t("voucher.currency_symbol")}
                    </span>
                  </div>
                </div>
              </div>

              {formData.type === "PERCENTAGE" && (
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.max_discount_label")}</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      name="maxDiscount"
                      placeholder={t("voucher.not_required")}
                      value={formatMoney(formData.maxDiscount)}
                      onChange={handleMoneyChange}
                      disabled={isPublished}
                      className={`w-full p-3.5 pr-10 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm ${isPublished ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""}`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mkhe-text/50 font-medium">{t("voucher.currency_symbol")}</span>
                  </div>
                  <p className="text-xs text-mkhe-text/50 mt-1.5 ml-1">{t("voucher.leave_empty_max_discount")}</p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.min_order")}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="minOrderValue"
                    placeholder={t("voucher.min_order_placeholder")}
                    value={formatMoney(formData.minOrderValue)}
                    onChange={handleMoneyChange}
                    disabled={isPublished}
                    className={`w-full p-3.5 pr-10 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm ${isPublished ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mkhe-text/50 font-medium">{t("voucher.currency_symbol")}</span>
                </div>
              </div>
            </div>

            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 border-[var(--color-mkhe-border)]/20 text-gradient-gold">{t("voucher.time_limit_config")}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.start_date_label")} <span className="text-red-500">*</span></label>
                  <Flatpickr
                    id="startDate"
                    value={formatFlatpickrDate(formData.startDate)}
                    onChange={([date]) => !isPublished && setFormData(prev => ({...prev, startDate: date}))}
                    options={startDateOptions}
                    disabled={isPublished}
                    className={`w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm ${isPublished ? "opacity-60 bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder={t("voucher.start_date_placeholder")}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.end_date_label")} <span className="text-red-500">*</span></label>
                  <Flatpickr
                    id="endDate"
                    value={formatFlatpickrDate(formData.endDate)}
                    onChange={([date]) => setFormData(prev => ({...prev, endDate: date}))}
                    options={endDateOptions}
                    className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                    placeholder={t("voucher.end_date_placeholder")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.usage_limit_label")}</label>
                  <input 
                    type="number" 
                    name="usageLimit"
                    min="1"
                    placeholder={t("voucher.leave_empty_for_unlimited")}
                    value={formData.usageLimit}
                    onChange={handleChange}
                    className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.gacha_drop_rate")}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="dropRate"
                      min="0"
                      max="100"
                      placeholder={t("voucher.drop_rate_placeholder")}
                      value={formData.dropRate}
                      onChange={handleChange}
                      className="w-full p-3.5 pr-10 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mkhe-text/50 font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 border-[var(--color-mkhe-border)]/20 text-gradient-gold">{t("voucher.conditions_channels")}</h3>

              {fetchingOptions ? (
                <p className="text-sm text-mkhe-text/60 animate-pulse">{t("voucher.loading_options")}</p>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1.5">{t("voucher.applicable_villages")}</label>
                    {options.villages.length === 0 ? (
                       <p className="text-xs text-mkhe-text/50 italic">{t("voucher.no_villages")}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {options.villages.map((v) => (
                          <label key={v} className="flex items-center gap-1.5 cursor-pointer bg-mkhe-primary/5 px-3 py-2 border border-mkhe-border/30 rounded-xl hover:bg-mkhe-primary/10 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={formData.applicableVillages.includes(v)}
                              onChange={() => toggleArrayItem("applicableVillages", v)}
                              className="accent-mkhe-primary w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs text-mkhe-text font-medium">{v}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1.5">{t("voucher.applicable_categories")}</label>
                    {options.categories.length === 0 ? (
                       <p className="text-xs text-mkhe-text/50 italic">{t("voucher.no_categories")}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {options.categories.map((c) => (
                          <label key={c} className="flex items-center gap-1.5 cursor-pointer bg-mkhe-primary/5 px-3 py-2 border border-mkhe-border/30 rounded-xl hover:bg-mkhe-primary/10 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={formData.applicableCategories.includes(c)}
                              onChange={() => toggleArrayItem("applicableCategories", c)}
                              className="accent-mkhe-primary w-4 h-4 cursor-pointer"
                            />
                            <span className="text-xs text-mkhe-text font-medium">{c}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center justify-between p-4 bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-2xl mt-4">
                <div>
                  <div className="font-semibold text-mkhe-primary text-sm">{t("voucher.apply_o2o")}</div>
                  <div className="text-xs text-mkhe-text/60 mt-0.5">{t("voucher.apply_o2o_desc")}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isO2O" checked={formData.isO2O} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-mkhe-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mkhe-primary"></div>
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-end items-center gap-3 bg-[var(--color-mkhe-border)]/10 shrink-0 z-20">
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem("mkhe_voucher_draft");
              onClose();
            }}
            className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
          >
            {t("common.cancel", { defaultValue: "Hủy" })}
          </button>
          {!editData ? (
            <Button 
              type="button"
              onClick={(e) => handleSubmit(e, "DRAFT")}
              disabled={loading}
              className="!w-auto px-8 py-2.5 rounded-xl text-sm"
            >
              {loading ? t("voucher.creating") : t("voucher.create_btn", { defaultValue: "Tạo Bản Nháp" })}
            </Button>
          ) : formData.status === "DRAFT" ? (
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={(e) => handleSubmit(e, "DRAFT")}
                disabled={loading}
                className="px-6 py-2.5 bg-transparent border border-mkhe-primary text-mkhe-primary rounded-xl hover:bg-mkhe-primary/10 text-sm font-bold cursor-pointer disabled:opacity-50 transition-colors"
              >
                {loading ? "..." : t("voucher.save_changes", { defaultValue: "Lưu Thay Đổi" })}
              </button>
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e, "PUBLISHED")}
                disabled={loading}
                className="!w-auto px-8 py-2.5 rounded-xl text-sm"
              >
                {loading ? t("voucher.updating") : t("voucher.publish_btn", { defaultValue: "Phát Hành" })}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isScheduled && (
                <button 
                  type="button"
                  onClick={(e) => handleSubmit(e, "DRAFT")}
                  disabled={loading}
                  className="px-6 py-2.5 bg-transparent border border-red-500/50 text-red-500 rounded-xl hover:bg-red-500/10 text-sm font-bold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {loading ? "..." : "Hủy Lên Lịch (Về Nháp)"}
                </button>
              )}
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e, formData.status)}
                disabled={loading}
                className="!w-auto px-8 py-2.5 rounded-xl text-sm"
              >
                {loading ? t("voucher.updating", { defaultValue: "Đang cập nhật..." }) : t("voucher.save_changes", { defaultValue: "Lưu thay đổi" })}
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VoucherFormModal;
