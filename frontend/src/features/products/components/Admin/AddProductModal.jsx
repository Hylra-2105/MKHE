import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { X, Package, UploadCloud, ImageIcon, Fingerprint, Box } from "lucide-react";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import { formatNumber, parseNumber } from "@/utils/formatters";
import { draftDB } from "@/utils/db";
import { compressGLB } from "@/utils/glbCompressor";
import { compressImage } from "@/utils/imageCompressor";

const MAX_IMAGES = 10;
const LOCAL_STORAGE_KEY = "mkhe_add_product_draft";
const AUTO_SAVE_DELAY = 5000;

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation("product");
  const [loading, setLoading] = useState(false);
  const autoSaveTimeoutRef = useRef(null);

  // --- STATE CƠ BẢN + MVP ---
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    vendor: "", // Sử dụng Dropdown có sẵn
    description: "",
    categoryMatrix: "B2C_Mass_Premium",
    culturalDNA: "OTHER",
    price: "",
    stock: "",
    hasDPP: false,
    artisanName: "",
    gpsLocation: "",
  });

  // --- STATE CHO ẢNH & FILE 3D ---
  const fileInputRef = useRef(null);
  const fileInput3DRef = useRef(null); 
  
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [file3D, setFile3D] = useState(null);
  const [isDragging3D, setIsDragging3D] = useState(false); 
  const [isCompressing3D, setIsCompressing3D] = useState(false);

  // --- STATE CHO LIGHTBOX ---
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);

  // --- DEBOUNCE CHO BẢN ĐỒ ---
  const [debouncedGpsLocation, setDebouncedGpsLocation] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGpsLocation(formData.gpsLocation);
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.gpsLocation]);

  // --- CÁC MẢNG DỮ LIỆU DROPDOWN ---
  const categories = [
    { value: "B2B_Luxury", label: t("categories.B2B_Luxury") },
    { value: "B2B_Standard", label: t("categories.B2B_Standard") },
    { value: "B2C_Premium", label: t("categories.B2C_Premium") },
    { value: "B2C_Mass_Premium", label: t("categories.B2C_Mass_Premium") },
  ];

  const culturalDNAs = [
    { value: "CHAM", label: t("culturalDNA.CHAM") },
    { value: "KHMER", label: t("culturalDNA.KHMER") },
    { value: "KINH", label: t("culturalDNA.KINH") },
    { value: "OTHER", label: t("culturalDNA.OTHER") },
  ];

  const vendors = [
    { value: "MKHE", label: "MKHE" },
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
  ];

  // ================= LOAD DRAFT TỪ INDEXEDDB =================
  useEffect(() => {
    if (!isOpen) return;
    const loadDraft = async () => {
      try {
        const saved = await draftDB.getItem(LOCAL_STORAGE_KEY);
        if (saved && saved.formData) {
          setFormData(saved.formData);
          setImageFiles(saved.imageFiles || []);
          if (saved.file3D) setFile3D(saved.file3D);

          if (saved.imageFiles && saved.imageFiles.length > 0) {
            const urls = saved.imageFiles.map((file) => ({
              url: URL.createObjectURL(file),
              type: file.type
            }));
            setPreviewUrls(urls);
          }
        }
      } catch (e) {
        console.error("Lỗi load bản nháp:", e);
      }
    };
    loadDraft();
  }, [isOpen]);

  useEffect(() => {
    return () => previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previewUrls]);

  // ================= AUTO-SAVE LOGIC =================
  useEffect(() => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await draftDB.setItem(LOCAL_STORAGE_KEY, { formData, imageFiles, file3D });
      } catch (e) {
        console.error("Lỗi khi lưu bản nháp:", e);
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [formData, imageFiles, file3D]);

  if (!isOpen) return null;

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  // ================= DRAG & DROP ẢNH LOGIC =================
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
  const handleFileInput = (e) => processFiles(e.target.files);

  const processFiles = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const newPreviews = [];

    if (imageFiles.length + fileArray.length > MAX_IMAGES) {
      return toast.error(t("messages.max_images_error", { max: MAX_IMAGES, current: imageFiles.length }));
    }

    const toastId = toast.loading("Đang xử lý và tối ưu ảnh...");

    try {
      for (const file of fileArray) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          toast.error(t("errors.invalid_file_type", "Định dạng file không hợp lệ! Chỉ chấp nhận ảnh và video."));
          continue;
        }

        let processedFile = file;

        if (file.type.startsWith("image/")) {
          processedFile = await compressImage(file);
        } else if (file.size > 100 * 1024 * 1024) {
          // Video giới hạn 100MB
          toast.error(`Video ${file.name} quá lớn (>100MB).`);
          continue;
        }

        validFiles.push(processedFile);
        newPreviews.push({ url: URL.createObjectURL(processedFile), type: processedFile.type });
      }

      setImageFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
      
      if (validFiles.length > 0) toast.success("Xử lý file thành công!", { id: toastId });
      else toast.dismiss(toastId);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xử lý file", { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    URL.revokeObjectURL(previewUrls[indexToRemove].url);
    setImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // ================= KÉO THẢ & XỬ LÝ FILE 3D (.GLB) =================
  const handleDragOver3D = (e) => { e.preventDefault(); setIsDragging3D(true); };
  const handleDragLeave3D = (e) => { e.preventDefault(); setIsDragging3D(false); };
  const handleDrop3D = (e) => {
    e.preventDefault();
    setIsDragging3D(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      process3DFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput3D = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      process3DFile(e.target.files[0]);
    }
  };

  const process3DFile = async (file) => {
    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      return toast.error(t("errors.error_3d_format", { ns: "admin" }));
    }
    
    // Cảnh báo nếu file quá khủng khiếp (>150MB) có thể crash trình duyệt
    if (file.size > 150 * 1024 * 1024) {
      return toast.error("File 3D quá lớn (>150MB), có thể làm đứng trình duyệt. Vui lòng giảm bớt từ phần mềm 3D trước.");
    }

    setIsCompressing3D(true);
    const toastId = toast.loading(`Đang tối ưu file 3D (${(file.size / (1024 * 1024)).toFixed(1)}MB)... Quá trình này dùng CPU máy bạn, vui lòng không tắt trang!`, { duration: 30000 });

    try {
      // Chạy thuật toán nén Draco + WebP trực tiếp trên web
      const compressedFile = await compressGLB(file);
      setFile3D(compressedFile);
      toast.success(`Tối ưu 3D thành công! Dung lượng giảm còn: ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(`Tối ưu 3D thất bại: ${error.message || "Lỗi cấu trúc file"}. Sẽ sử dụng file gốc.`, { id: toastId });
      setFile3D(file);
    } finally {
      setIsCompressing3D(false);
      if (fileInput3DRef.current) fileInput3DRef.current.value = "";
    }
  };

  const remove3DFile = (e) => {
    e.stopPropagation(); 
    setFile3D(null);
  };

  // ================= SUBMIT & ACTIONS =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.sku || !formData.price || !formData.vendor) {
      return toast.error("Vui lòng điền đủ Tên, SKU, Giá và Nhà cung cấp.");
    }
    if (formData.hasDPP) {
      if (!formData.artisanName || !formData.gpsLocation) {
        return toast.error("Hộ chiếu số yêu cầu Tên nghệ nhân và Vị trí / Địa chỉ Làng nghề.");
      }
    }

    setLoading(true);
    try {
      const response = await productApi.createProduct({
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
      });

      if (!response.success || !response.data?._id) throw new Error("No product ID returned");
      const newProductId = response.data._id;

      const uploadPromises = [];

      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach((file) => uploadData.append("images", file));
        uploadPromises.push(productApi.uploadProductGallery(newProductId, uploadData));
      }

      if (formData.hasDPP && file3D) {
        const upload3DData = new FormData();
        upload3DData.append("file3D", file3D);
        uploadPromises.push(productApi.uploadProduct3D(newProductId, upload3DData));
      }

      if (uploadPromises.length > 0) {
        try {
          await Promise.all(uploadPromises);
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(t("modal.3d_file.error_upload_both"));
        }
      }

      toast.success(t("messages.add_success"));

      try { await draftDB.removeItem(LOCAL_STORAGE_KEY); } catch (e) {}
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "SKU_ALREADY_EXISTS") toast.error(t("messages.sku_exists"));
      else toast.error(t("messages.add_error"));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", sku: "", vendor: "", description: "", categoryMatrix: "B2C_Mass_Premium",
      culturalDNA: "OTHER", price: "", stock: "", hasDPP: false, artisanName: "", gpsLocation: "",
    });
    setImageFiles([]); setFile3D(null);
    previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviewUrls([]);
  };

  const handleCancel = async () => {
    resetForm();
    try { await draftDB.removeItem(LOCAL_STORAGE_KEY); } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-5xl rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 mb-1 text-mkhe-primary" />
            <h2 className="text-lg font-bold text-gradient-gold">{t("modal.add_title")}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-mkhe-primary/10 cursor-pointer rounded-full transition-colors">
            <X className="w-5 h-5 text-mkhe-text/70" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI: UPLOAD ẢNH */}
          <div className="md:w-[35%] bg-mkhe-primary/5 p-6 border-b md:border-b-0 md:border-r border-[var(--color-mkhe-border)]/20 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-mkhe-primary" />
              <label className="text-xs font-bold text-mkhe-text/70 uppercase">{t("modal.images_label")} ({previewUrls.length}/{MAX_IMAGES})</label>
            </div>
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 origin-center ${isDragging ? "border-mkhe-primary bg-mkhe-primary/10 scale-100 shadow-lg" : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-mkhe-primary/5 scale-[0.98]"}`}>
              <div className="pointer-events-none flex flex-col items-center">
                <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? "text-mkhe-primary" : "text-mkhe-text/40"}`} />
                <p className="text-sm text-center font-semibold text-mkhe-text/80">{t("modal.drag_drop_text")}</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileInput} accept="image/*,video/*" multiple className="hidden" />
            </div>
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-6">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-mkhe-border/30 aspect-square cursor-pointer hover:border-mkhe-primary transition-colors" onClick={() => setActiveLightboxUrl(preview)}>
                    {preview.type.startsWith("video/") ? (
                      <video src={preview.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={preview.url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="absolute top-1 right-1 p-1 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10 shadow-md"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
            <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
              <div className="space-y-4">
                
                {/* DÒNG 1: TÊN SẢN PHẨM & SKU */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-1 col-span-8">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.name")} <span className="text-red-500">*</span></label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm" placeholder={t("modal.name_placeholder")} />
                  </div>
                  <div className="space-y-1 col-span-4">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.sku")} <span className="text-red-500">*</span></label>
                    <input type="text" name="sku" required value={formData.sku} onChange={handleChange} className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm uppercase" placeholder={t("modal.sku_placeholder")} />
                  </div>
                </div>

                {/* DÒNG 2: PHÂN LOẠI & MÃ GEN */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-1 col-span-6">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.category")} <span className="text-red-500">*</span></label>
                    <Dropdown value={formData.categoryMatrix} options={categories} onChange={(val) => updateField("categoryMatrix", val)} className="w-full" triggerClassName="p-3.5 rounded-xl text-sm" optionClassName="text-sm truncate" />
                  </div>
                  <div className="space-y-1 col-span-6">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.cultural_dna", "Mã gen")} <span className="text-red-500">*</span></label>
                    <Dropdown value={formData.culturalDNA} options={culturalDNAs} onChange={(val) => updateField("culturalDNA", val)} className="w-full" triggerClassName="p-3.5 rounded-xl text-sm" optionClassName="text-sm truncate" />
                  </div>
                </div>

                {/* DÒNG 3: NHÀ CUNG CẤP, GIÁ BÁN, TỒN KHO */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-1 col-span-6">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.vendor")} <span className="text-red-500">*</span></label>
                    <Dropdown value={formData.vendor} options={vendors} onChange={(val) => updateField("vendor", val)} placeholder={t("modal.select_vendor")} className="w-full" triggerClassName="p-3.5 rounded-xl text-sm" optionClassName="text-sm truncate" />
                  </div>
                  <div className="space-y-1 col-span-3">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.price")} <span className="text-red-500">*</span></label>
                    <input type="text" name="price" value={formatNumber(formData.price)} onChange={(e) => updateField("price", parseNumber(e.target.value))} className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm" placeholder={t("modal.price_placeholder")} />
                  </div>
                  <div className="space-y-1 col-span-3">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.stock")}</label>
                    <input type="text" name="stock" value={formatNumber(formData.stock)} onChange={(e) => updateField("stock", parseNumber(e.target.value))} className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm" placeholder={t("modal.stock_placeholder")} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.description")}</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full p-3.5 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded-xl focus:outline-none focus:border-mkhe-primary transition-colors text-sm resize-none" placeholder={t("modal.description_placeholder")} />
                </div>
              </div>

              {/* KHỐI 2: HỆ SINH THÁI HỘ CHIẾU SỐ (DPP) */}
              <div className="p-5 border border-mkhe-primary/30 bg-mkhe-primary/5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-mkhe-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-mkhe-text">{t("modal.dpp.create_title")}</h3>
                      <p className="text-[11px] text-mkhe-text/60">{t("modal.dpp.desc")}</p>
                    </div>
                  </div>
                  {/* NÚT GẠT TOGGLE */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="hasDPP" checked={formData.hasDPP} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-mkhe-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mkhe-primary"></div>
                  </label>
                </div>

                {/* FORM NHẬP LIỆU DPP */}
                <div className={`transition-all duration-300 origin-top overflow-hidden ${formData.hasDPP ? "max-h-[700px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-mkhe-text/70 uppercase ml-1">{t("modal.dpp.artisan_name")} <span className="text-red-500">*</span></label>
                      <input type="text" name="artisanName" value={formData.artisanName} onChange={handleChange} required={formData.hasDPP} className="w-full p-3 bg-white/50 dark:bg-black/20 border border-mkhe-border/50 rounded-xl text-sm focus:border-mkhe-primary" placeholder={t("modal.dpp.artisan_placeholder_add")} />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-mkhe-text/70 uppercase ml-1">{t("modal.dpp.location")} <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        name="gpsLocation" 
                        value={formData.gpsLocation} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes("http://") || val.includes("https://") || val.includes("maps.")) {
                            toast.error("Không được dán link! Vui lòng chỉ nhập tên địa điểm hoặc địa chỉ bằng chữ.");
                            return;
                          }
                          updateField("gpsLocation", val);
                        }} 
                        required={formData.hasDPP} 
                        className="w-full p-3 bg-white/50 dark:bg-black/20 border border-mkhe-border/50 rounded-xl text-sm focus:border-mkhe-primary" 
                        placeholder={t("modal.dpp.location_placeholder")} 
                      />
                    </div>
                  </div>

                  {/* MVP PREMIUM FEATURE: XEM TRƯỚC BẢN ĐỒ LÀNG NGHỀ */}
                  {formData.hasDPP && debouncedGpsLocation && (
                    <div className="mb-4 space-y-2 animate-in fade-in duration-300">
                      <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 flex items-center gap-2">
                        {t("modal.dpp.map_title")}
                      </label>
                      <div className="w-full h-64 rounded-xl overflow-hidden border border-mkhe-border/50 bg-mkhe-primary/5 shadow-inner relative">
                        <iframe
                          title="Admin GPS Preview"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight="0"
                          marginWidth="0"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(debouncedGpsLocation)}&hl=vi&z=14&output=embed`}
                          className="w-full h-full"
                        />
                      </div>
                      <p className="text-[10px] text-mkhe-text/50 italic ml-1">{t("modal.dpp.map_desc")}</p>
                    </div>
                  )}
                  
                  {/* KÉO THẢ FILE 3D XỊN XÒ */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-mkhe-text/70 uppercase ml-1 flex items-center gap-1">
                      <Box className="w-3 h-3" /> {t("modal.3d_file.label")}
                    </label>
                    <div
                      onDragOver={handleDragOver3D}
                      onDragLeave={handleDragLeave3D}
                      onDrop={handleDrop3D}
                      onClick={() => fileInput3DRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 origin-center ${
                        isDragging3D
                          ? "border-mkhe-primary bg-mkhe-primary/10 scale-100 shadow-lg"
                          : "border-[var(--color-mkhe-border)]/50 hover:border-mkhe-primary hover:bg-mkhe-primary/5 scale-[0.98]"
                      }`}
                    >
                      <input type="file" ref={fileInput3DRef} onChange={handleFileInput3D} accept=".glb,.gltf" className="hidden" />
                      
                      {isCompressing3D ? (
                        <div className="flex flex-col items-center gap-3 py-4 pointer-events-none">
                          <div className="w-8 h-8 border-4 border-mkhe-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-mkhe-primary animate-pulse text-center">
                            {t("modal.3d_file.compressing").split(' (')[0]}<br/>({t("modal.3d_file.compressing").split(' (')[1]}
                          </span>
                        </div>
                      ) : file3D ? (
                        <div className="flex items-center gap-3 w-full justify-between bg-mkhe-primary/10 p-2.5 rounded-lg border border-mkhe-primary/30">
                          <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                            <Box className="w-5 h-5 text-mkhe-primary shrink-0" />
                            <span className="text-sm text-mkhe-text font-medium truncate">{file3D.name}</span>
                            <span className="text-xs font-bold text-green-500 shrink-0">({(file3D.size / (1024 * 1024)).toFixed(2)} MB)</span>
                          </div>
                          <button type="button" onClick={remove3DFile} className="p-1.5 cursor-pointer hover:bg-red-500/20 text-red-500 rounded-md transition-colors z-10 relative">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 py-3 pointer-events-none">
                          <UploadCloud className={`w-8 h-8 mb-1 ${isDragging3D ? "text-mkhe-primary" : "text-mkhe-text/40"}`} />
                          <span className="text-xs font-medium text-mkhe-text/70 text-center px-4">
                            {isDragging3D ? "Thả file 3D vào đây" : t("modal.3d_file.drag_drop")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-end items-center gap-3 bg-[var(--color-mkhe-border)]/10 shrink-0 rounded-b-2xl z-20">
          <button type="button" onClick={handleCancel} disabled={loading} className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm">
            {t("modal.cancel")}
          </button>
          <Button type="submit" form="add-product-form" disabled={loading} className="!w-auto px-8 py-2.5 rounded-xl text-sm">
            {loading ? t("modal.processing") : t("modal.create")}
          </Button>
        </div>
      </div>

      {/* LIGHTBOX CODE GIỮ NGUYÊN */}
      {activeLightboxUrl && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200" onClick={() => setActiveLightboxUrl(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActiveLightboxUrl(null)} className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"><X className="w-6 h-6" /></button>
            {activeLightboxUrl.type && activeLightboxUrl.type.startsWith("video/") ? (
              <video src={activeLightboxUrl.url || activeLightboxUrl} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            ) : (
              <img src={activeLightboxUrl.url || activeLightboxUrl} alt="Zoomed Product" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductModal;