import React from "react";
import {  useState, useRef, useEffect  } from "react";
import toast from "react-hot-toast";
import {
  X,
  Package,
  Fingerprint,
  AlertCircle,
  ChevronDown,
  Tag,
  Edit3,
  Trash2,
  RotateCcw,
  Box,
  ExternalLink,
  Cpu,
  Briefcase
} from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Dropdown from "@/components/ui/Dropdown";
import NFCManagement from "./NFCManagement";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { isVideoMedia } from "@/utils/validators";
import { formatNumber, parseNumber } from "@/utils/formatters";
import { compressGLB } from "@/utils/glbCompressor";
import { compressImage } from "@/utils/imageCompressor";
import ImageGalleryUploader from "./ImageGalleryUploader";
import Model3DUploader from "./Model3DUploader";
import B2BTiersInput from "./B2BTiersInput";
import { getBlogsApi } from "@/api/blogApi";
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

const MAX_IMAGES = 10;

const EditProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const { t } = useTranslation("product");
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // "info" | "nfc"

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    vendor: "",
    craftVillage: "",
    material: [],
    description: "",
    categoryMatrix: "B2B_Luxury",
    culturalDNA: "OTHER",
    price: "",
    salePrice: "",
    saleStartDate: "",
    saleEndDate: "",
    stock: "",
    status: "DRAFT",
    hasDPP: false,
    artisanName: "",
    gpsLocation: "",
    storyBlogId: "",
    isPublicEvent: false,
    hasSale: false,
    b2bTiers: [],
  });

  // --- DEBOUNCE CHO BẢN ĐỒ ---
  const [debouncedGpsLocation, setDebouncedGpsLocation] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [isMaterialDropdownOpen, setIsMaterialDropdownOpen] = useState(false);
  const materialDropdownRef = useRef(null);

  const minStartDate = React.useMemo(() => {
    if (product && product.saleStartDate) {
      const pStartDate = new Date(product.saleStartDate);
      if (pStartDate < new Date()) {
        return pStartDate;
      }
    }
    return new Date();
  }, [product]);

  const saleStartDateOptions = React.useMemo(() => {
    const d = new Date(minStartDate);
    d.setHours(0,0,0,0);

    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);

    return {
      ...flatpickrOptions,
      minDate: d,
      defaultHour: now.getHours(),
      defaultMinute: now.getMinutes(),
    };
  }, [minStartDate]);

  const saleEndDateOptions = React.useMemo(() => {
    let minD;
    if (formData.saleStartDate) {
      minD = new Date(formData.saleStartDate);
      minD.setHours(0,0,0,0);
    } else {
      minD = new Date(minStartDate);
      minD.setHours(0,0,0,0);
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() + 65);

    return {
      ...flatpickrOptions,
      minDate: minD,
      defaultHour: formData.saleStartDate ? new Date(formData.saleStartDate).getHours() : now.getHours(),
      defaultMinute: formData.saleStartDate ? new Date(formData.saleStartDate).getMinutes() : now.getMinutes(),
    };
  }, [formData.saleStartDate, minStartDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(event.target)) {
        setIsMaterialDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedGpsLocation(formData.gpsLocation);
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.gpsLocation]);

  // --- BLOGS CHO KÝ SỰ ---
  const [storyBlogs, setStoryBlogs] = useState([]);
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogsApi({ category: "Ký sự", status: "PUBLISHED", limit: 100 });
        if (res.blogs) {
          setStoryBlogs(res.blogs);
        }
      } catch (error) {
        console.error("Fetch blogs error", error);
      }
    };
    if (isOpen) fetchBlogs();
  }, [isOpen]);

  // --- CÁC MẢNG DỮ LIỆU DROPDOWN ---
  const fileInputRef = useRef(null);
  const fileInput3DRef = useRef(null);

  const [initialFormData, setInitialFormData] = useState(null);

  const [keptImages, setKeptImages] = useState([]); // Ảnh cũ giữ lại
  const [deletedImages, setDeletedImages] = useState([]); // Ảnh cũ đánh dấu xóa
  const [newImageFiles, setNewImageFiles] = useState([]); // Ảnh mới từ máy (File)
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Link preview ảnh mới

  const [isDragging, setIsDragging] = useState(false);
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);

  const [file3D, setFile3D] = useState(null);
  const [isDragging3D, setIsDragging3D] = useState(false);
  const [isCompressing3D, setIsCompressing3D] = useState(false);
  const [isDeleted3D, setIsDeleted3D] = useState(false);

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

  const statuses = [
    { value: "DRAFT", label: t("statuses.DRAFT") },
    { value: "PUBLISHED", label: t("statuses.PUBLISHED") },
    { value: "OUT_OF_STOCK", label: t("statuses.OUT_OF_STOCK") },
  ];

  const baseVendors = [
    { value: "HTX Châu Giang", label: "HTX Châu Giang" },
    { value: "HTX Văn Giáo", label: "HTX Văn Giáo" },
    { value: "Cô Ba Khăn Rằn", label: "Cô Ba Khăn Rằn" },
    { value: "Gốm Phnôm Pi", label: "Gốm Phnôm Pi" },
    { value: "Hanhsilk", label: "Hanhsilk" },
    { value: "Mộc Chợ Thủ", label: "Mộc Chợ Thủ" },
    { value: "MKHE", label: "MKHE" }
  ];

  const vendors = React.useMemo(() => {
    if (formData.vendor && !baseVendors.find(v => v.value === formData.vendor)) {
      return [...baseVendors, { value: formData.vendor, label: formData.vendor }];
    }
    return baseVendors;
  }, [formData.vendor]);

  const predefinedMaterials = [
    { value: "Thổ cẩm", label: t("materials.brocade", "Thổ cẩm") },
    { value: "Lụa", label: t("materials.silk", "Lụa") },
    { value: "Gốm", label: t("materials.ceramic", "Gốm") },
    { value: "Da bò", label: t("materials.leather", "Da bò") },
    { value: "Khóa đồng", label: t("materials.copper", "Khóa đồng") },
    { value: "Bạc", label: t("materials.silver", "Bạc") },
    { value: "Gỗ", label: t("materials.wood", "Gỗ") }
  ];

  // Xử lý thay đổi material (checkbox)
  const toggleMaterial = (mat) => {
    setFormData((prev) => {
      const current = prev.material || [];
      if (current.includes(mat)) {
        return { ...prev, material: current.filter((m) => m !== mat) };
      }
      return { ...prev, material: [...current, mat] };
    });
  };

  useEffect(() => {
    if (product && isOpen) {
      const initData = {
        name: product.name || "",
        sku: product.sku || "",
        vendor: product.vendor || "",
        craftVillage: product.craftVillage || "",
        material: product.material || [],
        story: product.story || "",
        categoryMatrix: product.categoryMatrix || "B2B_Luxury",
        culturalDNA: product.culturalDNA || "OTHER",
        price: product.price || "",
        salePrice: product.salePrice || "",
        saleStartDate: product.saleStartDate || "",
        saleEndDate: product.saleEndDate || "",
        stock: product.stock || "",
        status: product?.status || "DRAFT",
        hasDPP: product?.hasDPP || false,
        artisanName: product?.artisanName || "",
        gpsLocation: product?.gpsLocation || "",
        storyBlogId: product?.storyBlogId || "",
        isPublicEvent: product?.isPublicEvent || false,
        isService: product?.isService || false,
        hasSale: !!product.salePrice || !!product.saleStartDate,
        b2bTiers: product.b2bTiers || [],
      };
      setFormData(initData);
      setInitialFormData(initData);
      // Load ảnh có sẵn
      setKeptImages(product.images || []);
      setDeletedImages([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setFile3D(null);
      setIsDeleted3D(false);
      setShowDeleteConfirm(false);
      setActiveTab("info");
      setFormErrors({});
    }
  }, [product, isOpen]);

  const hasChanges = React.useMemo(() => {
    if (!initialFormData) return false;
    
    const isFormChanged = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    const hasNewImages = newImageFiles.length > 0;
    const hasDeletedImgs = deletedImages.length > 0;
    const hasNew3D = file3D !== null;
    const hasDel3D = isDeleted3D;

    return isFormChanged || hasNewImages || hasDeletedImgs || hasNew3D || hasDel3D;
  }, [formData, initialFormData, newImageFiles, deletedImages, file3D, isDeleted3D]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateField = (name, value) => {
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      return toast.error(t("messages.file_3d_too_large"));
    }

    setIsCompressing3D(true);
    const toastId = toast.loading(t("messages.optimizing_3d", { size: (file.size / (1024 * 1024)).toFixed(1) }), { duration: 30000 });

    try {
      // Chạy thuật toán nén Draco + WebP trực tiếp trên web
      const compressedFile = await compressGLB(file);
      setFile3D(compressedFile);
      toast.success(t("messages.optimize_3d_success", { size: (compressedFile.size / (1024 * 1024)).toFixed(2) }), { id: toastId, duration: 3000 });
    } catch (error) {
      console.error(error);
      toast.error(t("messages.optimize_3d_error", { error: error.message || t("errors.file_structure") }), { id: toastId, duration: 4000 });
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

  // ================= QUẢN LÝ ẢNH =================
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const handleFileInput = (e) => processFiles(e.target.files);

  const processFiles = async (files) => {
    const fileArray = Array.from(files);
    const totalImages = keptImages.length + newImagePreviews.length + fileArray.length;

    if (totalImages > MAX_IMAGES) {
      return toast.error(
        t("messages.max_images_error", {
          max: MAX_IMAGES,
          current: keptImages.length + newImagePreviews.length,
        }),
      );
    }

    const validFiles = [];
    const newPreviews = [];
    const toastId = toast.loading(t("messages.processing_images"));

    try {
      for (const file of fileArray) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
          toast.error(t("messages.invalid_file_type"));
          continue;
        }

        let processedFile = file;

        if (file.type.startsWith("image/")) {
          processedFile = await compressImage(file);
        } else if (file.size > 100 * 1024 * 1024) {
          toast.error(t("messages.video_too_large", { name: file.name }));
          continue;
        }

        validFiles.push(processedFile);
        newPreviews.push({ url: URL.createObjectURL(processedFile), type: processedFile.type });
      }

      setNewImageFiles((prev) => [...prev, ...validFiles]);
      setNewImagePreviews((prev) => [...prev, ...newPreviews]);
      
      if (validFiles.length > 0) toast.success(t("messages.processing_images_success"), { id: toastId, duration: 3000 });
      else toast.dismiss(toastId);
    } catch (error) {
      console.error(error);
      toast.error(t("messages.processing_images_error"), { id: toastId, duration: 4000 });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 1. Đánh dấu xóa ảnh cũ
  const markImageForDeletion = (imageUrl) => {
    setKeptImages((prev) => prev.filter((img) => img !== imageUrl));
    setDeletedImages((prev) => [...prev, imageUrl]);
  };

  // 2. Hoàn tác xóa ảnh cũ
  const undoDeleteImage = (imageUrl) => {
    setDeletedImages((prev) => prev.filter((img) => img !== imageUrl));
    setKeptImages((prev) => [...prev, imageUrl]);
  };

  // 3. Xóa ảnh mới vừa chọn
  const removeNewImage = (indexToRemove) => {
    URL.revokeObjectURL(newImagePreviews[indexToRemove].url);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    if (!formData.name) errors.name = t("products.errors.name_required", "Vui lòng điền tên sản phẩm");
    if (!formData.sku) errors.sku = t("products.errors.sku_required", "Vui lòng điền mã SKU");
    if (!formData.vendor) errors.vendor = t("products.errors.vendor_required", "Vui lòng chọn nhà cung cấp");
    if (!formData.isService && (!formData.price || Number(formData.price) <= 0)) {
      errors.price = t("products.errors.price_required", "Vui lòng điền giá bán");
    } else if (formData.isService && (formData.price === "" || formData.price === null || formData.price === undefined)) {
      errors.price = t("products.errors.price_required", "Vui lòng điền giá bán");
    }

    if (formData.hasDPP) {
      if (!formData.artisanName) errors.artisanName = t("products.errors.artisan_required", "Vui lòng điền tên nghệ nhân");
      if (!formData.gpsLocation) errors.gpsLocation = t("products.errors.gps_required", "Vui lòng điền vị trí GPS");
    }

    if (formData.hasSale && formData.salePrice && Number(formData.salePrice) > 0) {
      if (Number(formData.salePrice) >= Number(formData.price)) {
        errors.salePrice = t("products.errors.sale_price_invalid", "Giá Sale phải nhỏ hơn giá gốc");
      }
      if (!formData.saleStartDate) {
        errors.saleStartDate = t("products.errors.sale_start_required", "Vui lòng chọn ngày bắt đầu Sale");
      }
      if (!formData.saleEndDate) {
        errors.saleEndDate = t("products.errors.sale_end_required", "Vui lòng chọn ngày kết thúc Sale");
      }
      if (formData.saleStartDate && formData.saleEndDate) {
        if (new Date(formData.saleEndDate) <= new Date(formData.saleStartDate)) {
          errors.saleEndDate = t("products.errors.sale_end_invalid", "Kết thúc phải sau thời gian bắt đầu");
        }
        if (new Date(formData.saleEndDate) <= new Date()) {
          errors.saleEndDate = t("products.errors.sale_end_future", "Kết thúc phải ở tương lai");
        }
        
        const start = new Date(formData.saleStartDate);
        start.setSeconds(0, 0);
        const now = new Date();
        now.setSeconds(0, 0);
        
        const isUnchanged = product && new Date(product.saleStartDate).getTime() === start.getTime();

        if (!isUnchanged && start < now) {
          errors.saleStartDate = t("products.errors.sale_start_past", "Thời gian bắt đầu không được trong quá khứ");
        }
      }
    }

    if (!formData.isService && (formData.categoryMatrix === "B2B_Luxury" || formData.categoryMatrix === "B2B_Standard")) {
      if (!formData.b2bTiers || formData.b2bTiers.length === 0) {
        errors.b2bTiers = t("products.errors.b2b_min_tiers", "Vui lòng cấu hình ít nhất 1 mốc chiết khấu cho sản phẩm B2B.");
      } else {
        for (let i = 0; i < formData.b2bTiers.length; i++) {
          const q = parseInt(formData.b2bTiers[i].minQuantity);
          const d = parseInt(formData.b2bTiers[i].discountPercent);

          if (!formData.b2bTiers[i].minQuantity || !formData.b2bTiers[i].discountPercent) {
            errors.b2bTiers = t("products.errors.b2b_missing_fields", "Vui lòng nhập đầy đủ Số lượng và % Giảm giá cho tất cả các mốc.");
            break;
          }
          if (q <= 0 || d < 0 || d > 100) {
            errors.b2bTiers = t("products.errors.b2b_invalid_values", "Số lượng phải > 0 và % giảm giá từ 0 - 100.");
            break;
          }
          
          if (i > 0) {
            const prevQ = parseInt(formData.b2bTiers[i - 1].minQuantity);
            const prevD = parseInt(formData.b2bTiers[i - 1].discountPercent);
            if (q <= prevQ) {
              errors.b2bTiers = t("products.errors.b2b_quantity_order", { current: i + 1, prev: i, prevQ });
              break;
            }
            if (d <= prevD) {
              errors.b2bTiers = t("products.errors.b2b_discount_order", { current: i + 1, prev: i, prevD });
              break;
            }
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (formData.status === "PUBLISHED" && (!formData.stock || Number(formData.stock) <= 0)) {
      return toast.error(t("messages.public_stock_error"));
    }

    setLoading(true);
    try {
      const updatePayload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.hasSale && formData.salePrice ? Number(formData.salePrice) : 0,
        stock: Number(formData.stock) || 0,
      };

      if (!updatePayload.hasSale) {
        updatePayload.saleStartDate = null;
        updatePayload.saleEndDate = null;
        updatePayload.isPublicEvent = false;
      }

      if (!updatePayload.hasDPP) {
        updatePayload.artisanName = "";
        updatePayload.gpsLocation = "";
        updatePayload.storyBlogId = null;
        // Optionally handle file3D if you want to wipe it too, but maybe leave it alone.
      } else if (!updatePayload.storyBlogId) {
        updatePayload.storyBlogId = null;
      }

      if (isDeleted3D && !file3D) {
        updatePayload.file3D = "";
      }

      const response = await productApi.updateProduct(product._id, updatePayload);

      if (!response.success) {
        throw new Error("Product update failed");
      }

      // 2. UPLOAD ẢNH & 3D MỚI NẾU CÓ
      const uploadPromises = [];

      if (newImageFiles.length > 0) {
        const uploadData = new FormData();
        newImageFiles.forEach((file) => uploadData.append("images", file));
        uploadPromises.push(productApi.uploadProductGallery(product._id, uploadData));
      }

      if (formData.hasDPP && file3D) {
        const upload3DData = new FormData();
        upload3DData.append("file3D", file3D);
        uploadPromises.push(productApi.uploadProduct3D(product._id, upload3DData));
      }

      if (uploadPromises.length > 0) {
        try {
          await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error("[EditProduct] Upload error:", uploadError);
          toast.error(t("modal.3d_file.error_upload_both"));
        }
      }

      // 3. GỌI API XÓA ẢNH CŨ NẾU CÓ ĐÁNH DẤU XÓA
      if (deletedImages.length > 0) {
        try {
          const deleteResponse = await productApi.deleteProductImages(
            product._id,
            deletedImages,
          );
          if (!deleteResponse.success) {
            throw new Error("Image deletion failed");
          }
        } catch (deleteError) {
          console.error("[EditProduct] Delete error:", deleteError);
          toast.error(t("messages.gallery_delete_error"));
          throw deleteError;
        }
      }

      toast.success(t("messages.update_success"));
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setDeletedImages([]);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("[EditProduct] Submit error:", error);
      const errorMsg = error.response?.data?.message;
      if (errorMsg === "SKU_ALREADY_EXISTS") {
        toast.error(t("messages.sku_exists"));
      } else if (error.message?.includes("Image")) {
        // Already handled above
      } else {
        toast.error(t("messages.update_error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      const res = await productApi.deleteProduct(product._id);
      if (res.success) {
        toast.success(t("messages.delete_success"));
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(t("messages.delete_error"));
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    // Reset all image states when canceling
    newImagePreviews.forEach(p => URL.revokeObjectURL(p.url));
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setDeletedImages([]);
    setKeptImages(product.images || []);
    setFile3D(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative bg-[var(--color-mkhe-bg)] w-full max-w-6xl rounded-2xl shadow-2xl overflow-visible border border-[var(--color-mkhe-border)]/30 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between mx-6 pt-6 pb-5 border-b border-[var(--color-mkhe-border)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 mb-1 text-mkhe-primary" />
            <h2 className="text-lg font-bold text-gradient-gold">
              {t("modal.edit_title")} - {product.sku}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mkhe-primary/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-mkhe-text/70" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* CỘT TRÁI: QUẢN LÝ ẢNH */}
          <div className="md:w-[35%] bg-mkhe-primary/5 p-6 border-b md:border-b-0 md:border-r border-[var(--color-mkhe-border)]/20 overflow-y-auto custom-scrollbar">
            <ImageGalleryUploader
              maxImages={MAX_IMAGES}
              keptImages={keptImages}
              newImagePreviews={newImagePreviews}
              deletedImages={deletedImages}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileInputClick={() => fileInputRef.current?.click()}
              onFileInputChange={handleFileInput}
              onSetActiveLightboxUrl={setActiveLightboxUrl}
              onMarkImageForDeletion={markImageForDeletion}
              onUndoDeleteImage={undoDeleteImage}
              onRemoveNewImage={removeNewImage}
            />
          </div>

          {/* CỘT PHẢI: FORM THÔNG TIN & NFC */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* TABS */}
            <div className="flex border-b border-[var(--color-mkhe-border)]/20 px-6 pt-2 shrink-0">
              <button
                type="button"
                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "info"
                    ? "border-mkhe-primary text-mkhe-primary"
                    : "border-transparent text-mkhe-text/60 hover:text-mkhe-text"
                }`}
                onClick={() => setActiveTab("info")}
              >
                {t("modal.tab_general", "Thông tin chung")}
              </button>
              {formData.hasDPP && (
                <button
                  type="button"
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "nfc"
                      ? "border-mkhe-primary text-mkhe-primary"
                      : "border-transparent text-mkhe-text/60 hover:text-mkhe-text"
                  }`}
                  onClick={() => setActiveTab("nfc")}
                >
                  <Cpu className="w-4 h-4" />
                  {t("modal.tab_nfc", "Hộ chiếu số (NFC)")}
                </button>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
              <div className={activeTab === "info" ? "block" : "hidden"}>
                <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
              
              {formData.salePrice > 0 && formData.saleStartDate && new Date(formData.saleStartDate) > new Date() && (
                <div className="bg-blue-500/10 text-blue-500 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-500/20">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">Sản phẩm này đang được lên lịch Sale. Bạn có thể chỉnh sửa thời gian hoặc đưa giá Sale về 0 để hủy lên lịch.</p>
                </div>
              )}

              {/* KHỐI 1: THÔNG TIN CƠ BẢN */}
              <div className="space-y-4">
                
                {/* DÒNG 1: TÊN SẢN PHẨM & SKU */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-8">
                    <InputField type="text" name="name" value={formData.name} onChange={handleChange} label={t("modal.name")} required error={formErrors.name ? formErrors.name : null} />
                  </div>
                  <div className="col-span-4">
                    <InputField type="text" name="sku" value={formData.sku} disabled label={t("modal.sku")} required error={formErrors.sku ? formErrors.sku : null} className="uppercase cursor-not-allowed opacity-50 bg-mkhe-text/5" />
                  </div>
                </div>

                {/* DÒNG 2: PHÂN LOẠI, MÃ GEN & TRẠNG THÁI */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-1 col-span-4">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.category")} <span className="text-rose-500">*</span></label>
                    <Dropdown value={formData.categoryMatrix} options={categories} onChange={(val) => handleChange({ target: { name: "categoryMatrix", value: val } })} className="w-full" triggerClassName="p-3.5 rounded-xl text-sm" optionClassName="text-sm truncate" />
                  </div>
                  <div className="space-y-1 col-span-4">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.cultural_dna", "Mã gen")} <span className="text-rose-500">*</span></label>
                    <Dropdown value={formData.culturalDNA} options={culturalDNAs} onChange={(val) => handleChange({ target: { name: "culturalDNA", value: val } })} className="w-full" triggerClassName="p-3.5 rounded-xl text-sm" optionClassName="text-sm truncate" />
                  </div>
                  <div className="space-y-1 col-span-4">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.status")}</label>
                    <Dropdown value={formData.status} options={statuses} onChange={(val) => handleChange({ target: { name: "status", value: val } })} className="w-full" triggerClassName="p-3.5 rounded-xl text-sm" optionClassName="text-sm truncate" />
                  </div>
                </div>

                {/* DÒNG 3: NHÀ CUNG CẤP & LÀNG NGHỀ */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-1 col-span-6">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.vendor")} <span className="text-rose-500">*</span></label>
                    <Dropdown value={formData.vendor} options={vendors} onChange={(val) => { updateField("vendor", val); }} placeholder={t("modal.select_vendor")} className="w-full" triggerClassName={`p-3.5 rounded-xl text-sm ${formErrors.vendor ? "border-rose-500" : ""}`} optionClassName="text-sm truncate" />
                    {formErrors.vendor && (
                      <div className="flex items-start gap-1.5 mt-1.5 ml-1 text-rose-500">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
                        <p className="text-xs font-medium">{formErrors.vendor}</p>
                      </div>
                    )}
                  </div>
                  <div className="col-span-6">
                    <InputField type="text" name="craftVillage" value={formData.craftVillage} onChange={handleChange} label={t("modal.craft_village", "Làng nghề")} placeholder={t("modal.craft_village_placeholder", "VD: Làng dệt Châu Phong...")} />
                  </div>
                </div>

                {/* DÒNG 4: GIÁ BÁN, TỒN KHO & CHẤT LIỆU */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="space-y-1 col-span-6">
                    <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t("modal.material", "Chất liệu")}</label>
                    <div className="relative" ref={materialDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsMaterialDropdownOpen(!isMaterialDropdownOpen)}
                        className="w-full bg-transparent border border-mkhe-border/50 text-mkhe-text focus:outline-none focus:border-mkhe-primary transition-colors flex justify-between items-center hover:border-mkhe-border p-3.5 rounded-xl text-sm cursor-pointer"
                      >
                        <span className="truncate">
                          {formData.material?.length > 0
                            ? formData.material.map(val => predefinedMaterials.find(m => m.value === val)?.label || val).join(", ")
                            : t("modal.select_material", "Chọn chất liệu")}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 shrink-0 ${isMaterialDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isMaterialDropdownOpen && (
                        <div className="absolute left-0 top-full mt-1 w-full bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                          {predefinedMaterials.map((mat) => {
                            const isSelected = formData.material?.includes(mat.value);
                            return (
                              <div
                                key={mat.value}
                                onClick={() => toggleMaterial(mat.value)}
                                className={`flex items-center gap-3 p-2.5 mx-2 mb-1.5 last:mb-0 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-mkhe-primary/10" : "hover:bg-mkhe-border/10"}`}
                              >
                                <div className="flex-shrink-0 pointer-events-none">
                                  <input 
                                    type="checkbox" 
                                    className="magic-cb-input"
                                    checked={isSelected}
                                    readOnly
                                  />
                                  <label className="magic-cb-label m-0">
                                    <span></span>
                                  </label>
                                </div>
                                <span className="text-sm font-medium text-mkhe-text">{mat.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <InputField type="text" name="price" value={formatNumber(formData.price)} onChange={(e) => updateField("price", parseNumber(e.target.value))} label={t("modal.price")} required error={formErrors.price ? formErrors.price : null} />
                  </div>
                  <div className="col-span-3">
                    <InputField type="text" name="stock" value={formatNumber(formData.stock)} onChange={(e) => handleChange({ target: { name: "stock", value: parseNumber(e.target.value) } })} label={t("modal.stock")} />
                  </div>
                </div>

                {/* KHỐI MỚI: CHƯƠNG TRÌNH SALE (VỚI TOGGLE) */}
                <div className="p-5 border border-yellow-500/30 bg-yellow-500/5 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-500/20 rounded-md">
                        <Tag className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-yellow-700">{t("form.sale.title", "Chương trình Sale")}</h3>
                        <p className="text-[11px] text-yellow-600/70">{t("form.sale.subtitle", "Thiết lập giá khuyến mãi và thời gian")}</p>
                      </div>
                    </div>
                    {/* NÚT GẠT TOGGLE CHO HAS SALE */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="hasSale" 
                        checked={formData.hasSale} 
                        onChange={(e) => {
                          handleChange(e);
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, hasSale: true, isPublicEvent: true }));
                          }
                        }} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-yellow-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>

                  <div className={`transition-all duration-300 origin-top overflow-hidden ${formData.hasSale ? "max-h-[700px] mt-5 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <InputField type="text" name="salePrice" value={formatNumber(formData.salePrice)} onChange={(e) => updateField("salePrice", parseNumber(e.target.value))} label={t("form.sale.salePrice", "Giá Sale")} placeholder={t("form.sale.salePricePlaceholder", "Nhập giá Sale...")} error={formErrors.salePrice ? formErrors.salePrice : null} />
                      </div>
                      <div className="space-y-1 col-span-4">
                        <label className="text-[10px] font-bold text-yellow-600 uppercase ml-1 block">{t("form.sale.startSale", "Bắt đầu Sale")}</label>
                        <Flatpickr
                          value={formatFlatpickrDate(formData.saleStartDate)}
                          onChange={([date]) => updateField("saleStartDate", date)}
                          options={saleStartDateOptions}
                          className={`w-full p-3.5 bg-yellow-500/5 border ${formErrors.saleStartDate ? 'border-rose-500' : 'border-yellow-500/30 focus:border-yellow-500'} text-[var(--color-mkhe-text)] rounded-xl focus:outline-none transition-colors text-sm`}
                          placeholder="dd/mm/yyyy --:--"
                        />
                        {formErrors.saleStartDate && (
                          <div className="flex items-start gap-1.5 mt-1.5 ml-1 text-rose-500">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
                            <p className="text-xs font-medium">{formErrors.saleStartDate}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 col-span-4">
                        <label className="text-[10px] font-bold text-yellow-600 uppercase ml-1 block">{t("form.sale.endSale", "Kết thúc Sale")}</label>
                        <Flatpickr
                          value={formatFlatpickrDate(formData.saleEndDate)}
                          onChange={([date]) => updateField("saleEndDate", date)}
                          options={saleEndDateOptions}
                          className={`w-full p-3.5 bg-yellow-500/5 border ${formErrors.saleEndDate ? 'border-rose-500' : 'border-yellow-500/30 focus:border-yellow-500'} text-[var(--color-mkhe-text)] rounded-xl focus:outline-none transition-colors text-sm`}
                          placeholder="dd/mm/yyyy --:--"
                        />
                        {formErrors.saleEndDate && (
                          <div className="flex items-start gap-1.5 mt-1.5 ml-1 text-rose-500">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
                            <p className="text-xs font-medium">{formErrors.saleEndDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* TOGGLE GỬI THÔNG BÁO PUSH */}
                    <div className="flex items-center justify-between mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-yellow-700">{t("form.sale.sendPush", "Gửi thông báo")}</span>
                        <span className="text-[11px] text-yellow-700/70">{t("form.sale.sendPushDesc", "Hệ thống sẽ tự động gửi thông báo đến TẤT CẢ người dùng khi phát hành")}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="isPublicEvent" 
                          checked={formData.isPublicEvent} 
                          onChange={handleChange} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-yellow-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* BẢNG GIÁ SỈ (CHỈ HIỂN THỊ NẾU LÀ SẢN PHẨM B2B) */}
                {(formData.categoryMatrix === "B2B_Luxury" || formData.categoryMatrix === "B2B_Standard") && (
                  <div className="space-y-4">
                    <div className="p-5 border border-mkhe-primary/30 bg-mkhe-primary/5 rounded-2xl relative">
                      <B2BTiersInput
                        tiers={formData.b2bTiers}
                        onChange={(newTiers) => setFormData(prev => ({ ...prev, b2bTiers: newTiers }))}
                        error={formErrors.b2bTiers}
                      />
                    </div>
                    
                    {/* B2B SERVICE TOGGLE */}
                    <div className="p-5 border border-mkhe-primary/30 bg-mkhe-primary/5 rounded-2xl relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-mkhe-primary/20 rounded-lg text-mkhe-primary">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-mkhe-text text-sm">{t("modal.isService.title", "Gói Dịch Vụ B2B")}</h4>
                            <p className="text-[11px] text-mkhe-text/60 mt-0.5">{t("modal.isService.desc", "Bật tính năng này nếu đây là Gói Dịch Vụ (Tư vấn, gia công...).")}</p>
                            <p className="text-[11px] text-rose-500/80 italic mt-0.5">{t("modal.isService.note", "Lưu ý: Gói dịch vụ sẽ bị ẩn hoàn toàn khỏi trang Cửa Hàng.")}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.isService}
                            onChange={(e) => setFormData(prev => ({ ...prev, isService: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-mkhe-border/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mkhe-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block mb-2">{t("modal.story")}</label>
                  <RichTextEditor 
                    value={formData.story} 
                    onChange={(content) => setFormData(prev => ({ ...prev, story: content }))}
                    placeholder={t("modal.story_placeholder")}
                  />
                </div>
              </div>

              {/* KHỐI 2: HỆ SINH THÁI HỘ CHIẾU SỐ (DPP) */}
              <div className="p-5 border border-mkhe-primary/30 bg-mkhe-primary/5 rounded-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-mkhe-primary" />
                    <div>
                      <h3 className="text-sm font-bold text-mkhe-text">{t("modal.dpp.update_title")}</h3>
                      <p className="text-[11px] text-mkhe-text/60">{t("modal.dpp.desc")}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="hasDPP" checked={formData.hasDPP} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-mkhe-border/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mkhe-primary"></div>
                  </label>
                </div>

                <div className={`transition-all duration-300 origin-top overflow-hidden ${formData.hasDPP ? "max-h-[700px] mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <InputField type="text" name="artisanName" value={formData.artisanName} onChange={handleChange} label={t("modal.dpp.artisan_name")} placeholder={t("modal.dpp.artisan_placeholder_edit")} required error={formErrors.artisanName ? formErrors.artisanName : null} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-mkhe-text/70 uppercase ml-1">{t("modal.dpp.location")} <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        name="gpsLocation" 
                        value={formData.gpsLocation} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.includes("http://") || val.includes("https://") || val.includes("maps.")) {
                            toast.error(t("messages.no_link_allowed"));
                            return;
                          }
                          handleChange(e);
                        }} 
                        className={`w-full p-2.5 bg-transparent border text-mkhe-text rounded-xl focus:outline-none transition-colors text-sm ${formErrors.gpsLocation ? "border-rose-500" : "border-mkhe-border/50 focus:border-mkhe-primary"}`} 
                        placeholder={t("modal.dpp.location_placeholder_edit")} 
                      />
                      {formErrors.gpsLocation && (
                        <div className="flex items-start gap-1.5 mt-1.5 ml-1 text-rose-500">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
                          <p className="text-xs font-medium">{formErrors.gpsLocation}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-mkhe-text/70 uppercase ml-1">{t("modal.dpp.story_link")}</label>
                      <Dropdown
                        value={formData.storyBlogId}
                        options={[
                          { value: "", label: t("products.no_linked_story", "-- Không liên kết Ký sự --") },
                          ...storyBlogs.map(blog => ({ value: blog._id, label: blog.title }))
                        ]}
                        onChange={(val) => handleChange({ target: { name: "storyBlogId", value: val } })}
                        placeholder={t("products.no_linked_story", "-- Không liên kết Ký sự --")}
                        className="w-full"
                        triggerClassName="p-2.5 rounded-xl text-sm bg-transparent border border-mkhe-border/50 text-mkhe-text cursor-pointer"
                        optionClassName="text-sm truncate"
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
                  <Model3DUploader
                    hasDPP={formData.hasDPP}
                    file3D={file3D}
                    isDragging3D={isDragging3D}
                    isCompressing3D={isCompressing3D}
                    isDeleted3D={isDeleted3D}
                    onDragOver={handleDragOver3D}
                    onDragLeave={handleDragLeave3D}
                    onDrop={handleDrop3D}
                    onFileInputChange={handleFileInput3D}
                    onRemove3DFile={remove3DFile}
                    fileInput3DRef={fileInput3DRef}
                  />

                    {/* HIỂN THỊ FILE 3D HIỆN TẠI (LÀM MỜ NẾU BỊ ĐÁNH DẤU XÓA HOẶC BỊ GHI ĐÈ BỞI FILE MỚI) */}
                    {product?.file3D && (
                      <div className={`mt-3 border rounded-lg p-3 flex items-center justify-between shadow-sm transition-all duration-300
                        ${(isDeleted3D || file3D) ? 'bg-gray-50 border-gray-200 opacity-60 grayscale' : 'bg-emerald-50 border-emerald-200'}
                      `}>
                        <div className="flex items-center gap-3 text-mkhe-text">
                          <div className={`p-2 rounded-md ${(isDeleted3D || file3D) ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Box className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${(isDeleted3D || file3D) ? 'text-gray-500 line-through' : 'text-emerald-700'}`}>
                              {t("modal.3d_file.has_file")}
                            </span>
                            <a href={product.file3D} target="_blank" rel="noopener noreferrer" className={`text-[11px] hover:underline flex items-center gap-1 mt-0.5 pointer-events-auto ${(isDeleted3D || file3D) ? 'text-gray-400' : 'text-emerald-600 hover:text-emerald-800'}`}>
                              {t("modal.3d_file.click_view")} <ExternalLink className="w-3 h-3"/>
                            </a>
                          </div>
                        </div>
                        
                        {!file3D && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setIsDeleted3D(!isDeleted3D); }}
                            className={`p-1.5 rounded-md transition-colors pointer-events-auto cursor-pointer
                              ${isDeleted3D ? 'text-mkhe-primary hover:bg-mkhe-primary/10' : 'text-rose-500 hover:-rose-100'}
                            `}
                            title={isDeleted3D ? t("modal.3d_file.restore_btn") : t("modal.3d_file.delete_btn")}
                          >
                            {isDeleted3D ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* TAB NFC */}
            {activeTab === "nfc" && formData.hasDPP && (
              <div className="animate-in fade-in duration-200">
                <NFCManagement productId={product._id} />
              </div>
            )}
            
          </div>
        </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="p-5 border-t border-[var(--color-mkhe-border)]/20 flex justify-between items-center bg-[var(--color-mkhe-border)]/10 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-lg font-bold text-sm hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> {t("table.delete")}
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2.5 bg-[var(--color-mkhe-border)]/40 text-[var(--color-mkhe-text)] font-bold rounded-lg hover:bg-[var(--color-mkhe-border)]/50 transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {t("modal.cancel")}
            </button>
            <Button
              type="submit"
              form="edit-product-form"
              disabled={loading || !hasChanges}
              className={`!w-auto px-8 py-2.5 rounded-xl text-sm whitespace-nowrap ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? t("modal.processing") : t("modal.save")}
            </Button>
          </div>
        </div>

        {/* ================= LIGHTBOX ================= */}
        {activeLightboxUrl && (
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/85 p-4 animate-in fade-in duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setActiveLightboxUrl(null);
            }}
          >
            <div
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveLightboxUrl(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
              >
                <X className="w-6 h-6" />
              </button>
              {(activeLightboxUrl.type?.startsWith("video/") || (typeof activeLightboxUrl === 'string' && isVideoMedia(activeLightboxUrl))) ? (
                <video
                  src={activeLightboxUrl.url || activeLightboxUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] rounded-lg"
                />
              ) : (
                <img
                  src={activeLightboxUrl.url || activeLightboxUrl}
                  alt="Zoomed Product"
                  loading="lazy"
                  className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
                />
              )}
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onConfirm={executeDelete}
          onCancel={() => setShowDeleteConfirm(false)}
          title={t("messages.delete_confirm_title")}
          message={t("messages.delete_confirm_desc")}
          confirmText={t("modal.confirm_delete")}
          loadingText={t("modal.deleting")}
          cancelText={t("modal.cancel")}
          loading={loading}
          icon="trash"
          isDanger={true}
        />
      </div>
    </div>
  );
};

export default EditProductModal;
