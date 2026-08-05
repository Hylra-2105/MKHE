import React from "react";
import {  useState, useEffect, useMemo  } from "react";
import { useTranslation } from "react-i18next";
import { X, Save, AlertCircle } from "lucide-react";
import { getVoucherOptionsApi, createVoucherApi, updateVoucherApi } from "@/api/voucherApi";
import toast from "react-hot-toast";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import ToggleField from "@/components/ui/ToggleField";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";

const flatpickrOptions = {
  locale: Vietnamese,
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  clickOpens: false,
};

const formatFlatpickrDate = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const MultiSelectDropdown = ({ options, value, onChange, placeholder, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const menuRef = React.useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optValue) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const selectedText = value.length > 0 
    ? t("voucher.selected_count", { count: value.length, defaultValue: `Đã chọn ${value.length}` })
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef} style={{ zIndex: isOpen ? 50 : "auto" }}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => {
              menuRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 100);
          }
        }}
        className="w-full p-3.5 bg-transparent border border-mkhe-border/50 rounded-xl text-sm text-mkhe-text flex justify-between items-center focus:outline-none focus:border-mkhe-primary hover:border-mkhe-primary transition-colors cursor-pointer"
      >
        <span className={value.length > 0 ? "text-mkhe-primary font-medium" : "text-mkhe-text/60"}>{selectedText}</span>
        <svg className={`w-4 h-4 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div ref={menuRef} className="absolute left-0 top-full mt-1 w-full bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
            <label key={opt.value} className="w-[calc(100%-16px)] mx-2 px-3 py-2.5 rounded-md flex items-center gap-3 cursor-pointer hover:bg-mkhe-primary/10 transition-colors">
              <input 
                type="checkbox" 
                checked={value.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
                className="accent-mkhe-primary w-4 h-4 cursor-pointer shrink-0"
              />
              <span className="text-sm text-mkhe-text font-medium truncate">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const VoucherFormModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const { t } = useTranslation(["admin"]);
  const startDateRef = React.useRef(null);
  const endDateRef = React.useRef(null);
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
    isPublicEvent: false,
    dropRate: 0,
    status: "DRAFT",
  });

  // Chỉ khóa các trường (isPublished = true) khi voucher ĐÃ CHẠY (startDate <= now)
  const isPublished = editData?.status === "PUBLISHED" && new Date(editData?.startDate) <= new Date();
  const isScheduled = editData?.status === "PUBLISHED" && new Date(editData?.startDate) > new Date();
  const [options, setOptions] = useState({ categories: [], villages: [] });
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
      setFormErrors({});
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
          isPublicEvent: editData.isPublicEvent || false,
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
          startDate: new Date(new Date().getTime() + 5 * 60000).toISOString(),
          endDate: "",
          usageLimit: "",
          applicableVillages: [],
          applicableCategories: [],
          isO2O: false,
          isPublicEvent: false,
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
    
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));

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

    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));

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

    setFormErrors({});
    let errors = {};

    if (!formData.code || !formData.code.trim()) {
      errors.code = t("voucher.code_required", { defaultValue: "Vui lòng nhập mã ưu đãi" });
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errors.discountValue = t("voucher.discount_required", { defaultValue: "Vui lòng nhập mức giảm hợp lệ" });
    }

    if (!formData.startDate) {
      errors.startDate = t("voucher.time_empty_error");
    }
    if (!formData.endDate) {
      errors.endDate = t("voucher.time_empty_error");
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = t("voucher.time_invalid_error");
    }

    if (formData.startDate) {
      const start = new Date(formData.startDate);
      start.setSeconds(0, 0);
      const now = new Date();
      now.setSeconds(0, 0);
      
      const isUnchanged = editData && new Date(editData.startDate).getTime() === start.getTime();

      if (!isUnchanged && start < now) {
        errors.startDate = t("voucher.publish_time_passed", { defaultValue: "Thời gian bắt đầu không được trong quá khứ" });
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
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
        toast.success(t("voucher.update_success"));
      } else {
        await createVoucherApi(payload);
        localStorage.removeItem("mkhe_voucher_draft");
        toast.success(t("voucher.create_success"));
      }
      onSuccess();
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg === "VOUCHER_CODE_EXISTS") {
        setFormErrors({ code: t("voucher.errors.VOUCHER_CODE_EXISTS", { defaultValue: "Mã giảm giá này đã tồn tại" }) });
      } else if (msg === "INVALID_PERCENTAGE") {
        setFormErrors({ discountValue: t("voucher.errors.INVALID_PERCENTAGE", { defaultValue: "Phần trăm giảm giá không hợp lệ" }) });
      } else if (msg === "INVALID_DATE_RANGE") {
        setFormErrors({ endDate: t("voucher.errors.INVALID_DATE_RANGE", { defaultValue: "Ngày kết thúc phải sau ngày bắt đầu" }) });
      } else if (msg === "MISSING_REQUIRED_FIELDS") {
        toast.error(t("voucher.errors.MISSING_REQUIRED_FIELDS", { defaultValue: "Vui lòng nhập đầy đủ các trường bắt buộc" }));
      } else {
        toast.error(msg ? t(`voucher.errors.${msg}`, { defaultValue: msg }) : (editData ? t("voucher.update_error") : t("voucher.create_error_generic")));
      }
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
                <InputField 
                  type="text" 
                  name="code"
                  label={t("voucher.voucher_code_label")}
                  placeholder={t("voucher.voucher_code_placeholder")}
                  value={formData.code}
                  onChange={handleChange}
                  disabled={isPublished}
                  required
                  error={formErrors.code ? formErrors.code : null}
                  className={`uppercase ${isPublished ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.discount_type_label")} <span className="text-rose-500">*</span></label>
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
                  <InputField 
                    type="text" 
                    name="discountValue"
                    label={t("voucher.discount_amount_label")}
                    placeholder={formData.type === "PERCENTAGE" ? t("voucher.discount_percentage_placeholder") : t("voucher.discount_fixed_placeholder")}
                    value={formatMoney(formData.discountValue)}
                    onChange={handleMoneyChange}
                    disabled={isPublished}
                    required
                    error={formErrors.discountValue ? formErrors.discountValue : null}
                    className={`pr-10 ${isPublished ? "opacity-50 cursor-not-allowed" : ""}`}
                    rightElement={<span className="font-medium">{formData.type === "PERCENTAGE" ? "%" : t("voucher.currency_symbol")}</span>}
                  />
                </div>
              </div>

              {formData.type === "PERCENTAGE" && (
                <div>
                  <InputField 
                    type="text" 
                    name="maxDiscount"
                    label={t("voucher.max_discount_label")}
                    placeholder={t("voucher.not_required")}
                    value={formatMoney(formData.maxDiscount)}
                    onChange={handleMoneyChange}
                    disabled={isPublished}
                    className={`pr-10 ${isPublished ? "opacity-50 cursor-not-allowed" : ""}`}
                    rightElement={<span className="font-medium">{t("voucher.currency_symbol")}</span>}
                  />
                  <p className="text-xs text-mkhe-text/50 mt-[-10px] ml-1 mb-4">{t("voucher.leave_empty_max_discount")}</p>
                </div>
              )}

              <div>
                <InputField 
                  type="text" 
                  name="minOrderValue"
                  label={t("voucher.min_order")}
                  placeholder={t("voucher.min_order_placeholder")}
                  value={formatMoney(formData.minOrderValue)}
                  onChange={handleMoneyChange}
                  disabled={isPublished}
                  className={`pr-10 ${isPublished ? "opacity-50 cursor-not-allowed" : ""}`}
                  rightElement={<span className="font-medium">{t("voucher.currency_symbol")}</span>}
                />
              </div>
            </div>

            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 border-[var(--color-mkhe-border)]/20 text-gradient-gold">{t("voucher.time_limit_config")}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.start_date_label")} <span className="text-rose-500">*</span></label>
                  <Flatpickr
                    ref={startDateRef}
                    onClick={() => {
                      if (!isPublished) startDateRef.current?.flatpickr?.toggle();
                    }}
                    value={formatFlatpickrDate(formData.startDate)}
                    onChange={([date]) => {
                      if (!isPublished) {
                        setFormData(prev => ({...prev, startDate: date}));
                        if (formErrors.startDate) setFormErrors(prev => ({ ...prev, startDate: null }));
                      }
                    }}
                    options={startDateOptions}
                    disabled={isPublished}
                    className={`w-full p-3.5 bg-transparent border ${formErrors.startDate ? 'border-rose-500' : `border-mkhe-border/50 focus:border-mkhe-primary ${!isPublished ? "hover:border-mkhe-primary" : ""}`} text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${isPublished ? "opacity-50 !cursor-not-allowed" : "cursor-pointer"}`}
                    placeholder={t("voucher.start_date_placeholder")}
                  />
                  {formErrors.startDate && (
                    <div className="flex items-start gap-1.5 mt-1.5 ml-1 text-rose-500">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
                      <p className="text-xs font-medium">{formErrors.startDate}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1">{t("voucher.end_date_label")} <span className="text-rose-500">*</span></label>
                  <Flatpickr
                    ref={endDateRef}
                    onClick={() => {
                      endDateRef.current?.flatpickr?.toggle();
                    }}
                    value={formatFlatpickrDate(formData.endDate)}
                    onChange={([date]) => {
                      setFormData(prev => ({...prev, endDate: date}));
                      if (formErrors.endDate) setFormErrors(prev => ({ ...prev, endDate: null }));
                    }}
                    options={endDateOptions}
                    className={`w-full p-3.5 bg-transparent border ${formErrors.endDate ? 'border-rose-500' : 'border-mkhe-border/50 focus:border-mkhe-primary hover:border-mkhe-primary'} text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm cursor-pointer`}
                    placeholder={t("voucher.end_date_placeholder")}
                  />
                  {formErrors.endDate && (
                    <div className="flex items-start gap-1.5 mt-1.5 ml-1 text-rose-500">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
                      <p className="text-xs font-medium">{formErrors.endDate}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputField 
                    type="number" 
                    name="usageLimit"
                    min="1"
                    label={t("voucher.usage_limit_label")}
                    placeholder={t("voucher.leave_empty_for_unlimited")}
                    value={formData.usageLimit}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <InputField 
                    type="number" 
                    name="dropRate"
                    min="0"
                    max="100"
                    label={t("voucher.gacha_drop_rate")}
                    placeholder={t("voucher.drop_rate_placeholder")}
                    value={formData.dropRate}
                    onChange={handleChange}
                    className="pr-10"
                    rightElement={<span className="font-bold">%</span>}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 border-[var(--color-mkhe-border)]/20 text-gradient-gold">{t("voucher.conditions_channels")}</h3>

              {fetchingOptions ? (
                <p className="text-sm text-mkhe-text/60 animate-pulse">{t("voucher.loading_options")}</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1.5">{t("voucher.applicable_villages")}</label>
                    {options.villages.length === 0 ? (
                       <p className="text-xs text-mkhe-text/50 italic">{t("voucher.no_villages")}</p>
                    ) : (
                      <MultiSelectDropdown 
                        options={options.villages.map(v => ({ value: v, label: v }))}
                        value={formData.applicableVillages}
                        onChange={(newVal) => setFormData(prev => ({ ...prev, applicableVillages: newVal }))}
                        placeholder={t("voucher.select_villages", { defaultValue: "Chọn làng nghề..." })}
                        t={t}
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-1.5">{t("voucher.applicable_categories")}</label>
                    {options.categories.length === 0 ? (
                       <p className="text-xs text-mkhe-text/50 italic">{t("voucher.no_categories")}</p>
                    ) : (
                      <Dropdown
                        value={formData.applicableCategories[0] || ""}
                        options={[
                          { value: "", label: t("voucher.all_categories", { defaultValue: "Tất cả phân khúc" }) },
                          ...options.categories.map(c => ({ value: c, label: c }))
                        ]}
                        onChange={(val) => setFormData(prev => ({ ...prev, applicableCategories: val ? [val] : [] }))}
                        placeholder={t("voucher.select_category", { defaultValue: "Chọn phân khúc..." })}
                        triggerClassName="w-full p-3.5 bg-transparent border border-mkhe-border/50 hover:border-mkhe-primary rounded-xl text-sm"
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-mkhe-primary/5 border border-mkhe-primary/20 rounded-2xl mt-4">
                <div>
                  <div className="font-semibold text-mkhe-primary text-sm">{t("voucher.apply_o2o")}</div>
                  <div className="text-xs text-mkhe-text/60 mt-0.5">{t("voucher.apply_o2o_desc")}</div>
                </div>
                <ToggleField name="isO2O" checked={formData.isO2O} onChange={handleChange} />
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl mt-4">
                <div>
                  <div className="font-semibold text-yellow-600 text-sm">{t("voucher.send_notification")}</div>
                  <div className="text-xs text-mkhe-text/60 mt-0.5">{t("voucher.send_notification_desc")}</div>
                </div>
                <ToggleField name="isPublicEvent" checked={formData.isPublicEvent} onChange={handleChange} />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-end items-center gap-3 bg-[var(--color-mkhe-border)]/10 shrink-0 z-20">
          <Button 
            type="button"
            onClick={() => {
              localStorage.removeItem("mkhe_voucher_draft");
              onClose();
            }}
            variant="outline"
            className="px-6 py-2.5 text-sm"
          >
            {t("common.cancel", { defaultValue: "Hủy" })}
          </Button>
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
              <Button 
                type="button"
                onClick={(e) => handleSubmit(e, "DRAFT")}
                disabled={loading}
                variant="outline"
                className="px-6 py-2.5 text-sm"
              >
                {loading ? "..." : t("voucher.save_changes", { defaultValue: "Lưu Thay Đổi" })}
              </Button>
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
                <Button 
                  type="button"
                  onClick={(e) => handleSubmit(e, "DRAFT")}
                  disabled={loading}
                  variant="outline"
                  className="px-6 py-2.5 text-sm border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                >
                  {loading ? "..." : "Hủy Lên Lịch (Về Nháp)"}
                </Button>
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
