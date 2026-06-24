import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Image as ImageIcon, X, Check, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getBlogBySlugApi, createBlogApi, updateBlogApi, uploadBlogImageApi } from "@/api/blogApi";
import axiosClient from "@/api/axiosClient";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Dropdown from "@/components/ui/Dropdown";

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "",
    category: "Ký sự",
    status: "DRAFT",
    tags: []
  });

  const fileInputRef = useRef(null);

  // For selecting products
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation("blog");

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchBlog();
    } else {
      const savedDraft = localStorage.getItem('mkhe_blog_draft_new');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed);
          toast.success("Đã khôi phục bản nháp tự động lưu", { id: 'draft-restore-toast' });
        } catch(e) {}
      }
    }
  }, [id]);

  // Auto-save to localStorage
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      if (formData.title || (formData.content && formData.content !== "<p></p>")) {
        localStorage.setItem(`mkhe_blog_draft_${id || 'new'}`, JSON.stringify(formData));
      }
    }, 1500);
    return () => clearTimeout(autosaveTimer);
  }, [formData, id]);

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get("/products?limit=100");
      if (res.data && res.data.success) {
        setProducts(res.data.data?.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Fetch products failed", error);
    }
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/blogs/${id}`);
      if (res.data && res.data.success) {
        const blogData = res.data.data;
        setFormData({
          title: blogData.title || "",
          content: blogData.content || "",
          thumbnail: blogData.thumbnail || "",
          category: blogData.category || "Ký sự",
          status: blogData.status || "DRAFT",
          tags: blogData.tags ? blogData.tags.map(t => t._id) : []
        });
      }
    } catch (error) {
      toast.error("Không tìm thấy bài viết");
      navigate("/admin/blogs");
    } finally {
      setLoading(false);
    }
  };

  const uploadThumbnailFile = async (file) => {
    try {
      toast.loading("Đang tải ảnh lên...", { id: "uploadThumbnail" });
      const url = await uploadBlogImageApi(file);
      if (url) {
        setFormData(prev => ({ ...prev, thumbnail: url }));
        toast.success("Tải ảnh lên thành công", { id: "uploadThumbnail" });
      } else {
        throw new Error("Không lấy được URL ảnh");
      }
    } catch (error) {
      toast.error("Lỗi khi tải ảnh", { id: "uploadThumbnail" });
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadThumbnailFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadThumbnailFile(file);
    } else {
      if (file) toast.error("Vui lòng chọn file hình ảnh hợp lệ");
    }
  };

  const handleEditorImageUpload = async (file) => {
    try {
      const url = await uploadBlogImageApi(file);
      return url;
    } catch (error) {
      toast.error("Lỗi khi tải ảnh vào bài viết");
      return null;
    }
  };

  const toggleTag = (productId) => {
    setFormData(prev => {
      const isSelected = prev.tags.includes(productId);
      if (isSelected) {
        return { ...prev, tags: prev.tags.filter(id => id !== productId) };
      } else {
        if (prev.tags.length >= 4) {
          toast.error(t("admin.editor.form.max_products"));
          return prev;
        }
        return { ...prev, tags: [...prev.tags, productId] };
      }
    });
  };

  const handleSubmit = async (status) => {
    if (!formData.title.trim()) {
      return toast.error("Vui lòng nhập tiêu đề bài viết");
    }
    if (!formData.content.trim() || formData.content === "<p></p>") {
      return toast.error("Vui lòng nhập nội dung bài viết");
    }
    
    try {
      setSaving(true);
      const payload = { ...formData, status };
      
      if (id) {
        await updateBlogApi(id, payload);
        toast.success("Cập nhật bài viết thành công");
      } else {
        await createBlogApi(payload);
        toast.success("Tạo bài viết thành công");
      }
      localStorage.removeItem(`mkhe_blog_draft_${id || 'new'}`);
      navigate("/admin/blogs");
    } catch (error) {
      toast.error("Lỗi khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const filteredProducts = products.filter(p => {
    const searchNormalized = removeAccents(searchTerm);
    const nameNormalized = removeAccents(p.name || "");
    const skuNormalized = removeAccents(p.sku || "");
    return nameNormalized.includes(searchNormalized) || skuNormalized.includes(searchNormalized);
  });

  if (loading) {
    return <div className="p-6 text-center">{t("common:loading", { defaultValue: "Đang tải dữ liệu..." })}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <button 
          onClick={() => navigate("/admin/blogs")}
          className="group inline-flex items-center gap-1 text-mkhe-text/80 hover:text-mkhe-primary transition-colors text-sm font-medium uppercase tracking-wider w-fit cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>{t("admin.editor.btn_back")}</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {id ? t("admin.editor.edit_title") : t("admin.editor.create_title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {id ? t("admin.editor.edit_subtitle", { defaultValue: "Cập nhật nội dung bài viết hiện tại" }) : t("admin.editor.create_subtitle", { defaultValue: "Sáng tạo nội dung bài viết mới" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái (70%) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm">
            <input
              type="text"
              placeholder={t("admin.editor.form.title_placeholder")}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full text-2xl font-bold bg-transparent border-none text-mkhe-text focus:outline-none placeholder:text-mkhe-text/30 mb-6"
            />
            
            <div className="min-h-[500px]">
              <RichTextEditor 
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder={t("admin.editor.form.content")}
                onImageUpload={handleEditorImageUpload}
              />
            </div>
          </div>
        </div>

        {/* Cột phải (30%) */}
        <div className="space-y-6">
          {/* Nút hành động */}
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-mkhe-text mb-2">
              {!id ? t("admin.editor.publish_title") : t("admin.editor.update_publish_title")}
            </h3>
            <p className="text-xs text-mkhe-text/60 mb-2">
              {t("admin.editor.publish_desc")}
            </p>
            
            <Button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={saving}
              className="w-full py-3"
            >
              {saving ? t("common:loading", { defaultValue: "Đang xử lý..." }) : (!id ? t("admin.editor.btn_publish_now") : t("admin.editor.btn_update_publish"))}
            </Button>
            
            <button
              onClick={() => handleSubmit("DRAFT")}
              disabled={saving}
              className="w-full py-3 rounded-md font-bold text-mkhe-text/80 uppercase tracking-wide border border-mkhe-primary/30 bg-mkhe-primary/5 hover:bg-mkhe-primary/10 hover:text-mkhe-primary cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? t("common:loading", { defaultValue: "Đang xử lý..." }) : t("admin.editor.btn_save_draft")}
            </button>
          </div>

          {/* Ảnh bìa */}
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-4">{t("admin.editor.thumbnail_title")}</h3>
            <div className="text-xs text-mkhe-text/60 mb-3">{t("admin.editor.thumbnail_ratio")}</div>
            
            <div className="relative">
              {formData.thumbnail ? (
                <div 
                  className={`relative rounded-xl overflow-hidden group aspect-video bg-mkhe-bg/50 border-2 transition-colors ${isDragging ? 'border-mkhe-primary border-dashed' : 'border-transparent'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <img 
                    src={formData.thumbnail} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 transition-opacity flex items-center justify-center ${isDragging ? 'bg-mkhe-primary/20 opacity-100' : 'bg-black/50 opacity-0 group-hover:opacity-100'}`}>
                    {isDragging ? (
                      <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-lg">{t("admin.editor.thumbnail_drop")}</span>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="border-white text-white hover:bg-white hover:text-black"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t("admin.editor.thumbnail_change")}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors aspect-video flex flex-col items-center justify-center ${isDragging ? 'border-mkhe-primary bg-mkhe-primary/10' : 'border-mkhe-border hover:border-mkhe-primary hover:bg-mkhe-primary/5'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <ImageIcon className={`w-8 h-8 mb-3 transition-colors ${isDragging ? 'text-mkhe-primary' : 'text-mkhe-text/40'}`} />
                  <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-mkhe-primary' : 'text-mkhe-text/60'}`}>
                    {isDragging ? t("admin.editor.thumbnail_drop") : t("admin.editor.thumbnail_drag")}
                  </p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleThumbnailUpload}
            />
          </div>

          {/* Danh mục */}
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-4">{t("admin.editor.form.category")}</h3>
            <Dropdown
              value={formData.category}
              options={[
                { value: "Ký sự", label: t("admin.editor.categories.Ký sự") },
                { value: "Sự kiện", label: t("admin.editor.categories.Sự kiện") },
                { value: "Cẩm nang", label: t("admin.editor.categories.Cẩm nang") },
              ]}
              onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              placeholder={t("admin.editor.category_placeholder")}
              className="w-full"
              triggerClassName="w-full px-4 py-3 bg-mkhe-input/50 border border-mkhe-border rounded-lg text-mkhe-text focus:outline-none focus:border-mkhe-primary outline-none transition-colors"
              optionClassName="text-sm"
            />
          </div>

          {/* Gắn thẻ sản phẩm */}
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-mkhe-text mb-1">{t("admin.editor.form.linked_products")}</h3>
            <p className="text-xs text-mkhe-text/60 mb-4">{t("admin.editor.form.linked_products_desc")}</p>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder={t("admin.editor.form.search_product")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-mkhe-input/30 border border-mkhe-border rounded-lg text-sm text-mkhe-text focus:outline-none focus:border-mkhe-primary"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mkhe-text/40" />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredProducts.map(product => {
                const isSelected = formData.tags.includes(product._id);
                return (
                  <div 
                    key={product._id}
                    onClick={() => toggleTag(product._id)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${isSelected ? "border-mkhe-primary bg-mkhe-primary/5" : "border-transparent hover:bg-mkhe-border/10"}`}
                  >
                    <div className="w-10 h-10 rounded overflow-hidden bg-mkhe-border/20 flex-shrink-0">
                      {product.images?.[0] && <img src={product.images[0]} alt="" loading="lazy" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mkhe-text truncate">{product.name}</p>
                      <p className="text-xs text-mkhe-text/60">{product.sku}</p>
                    </div>
                    <div className="flex-shrink-0 pointer-events-none">
                      <input 
                        type="checkbox" 
                        id={`cb-${product._id}`}
                        className="magic-cb-input"
                        checked={isSelected}
                        readOnly
                      />
                      <label htmlFor={`cb-${product._id}`} className="magic-cb-label m-0">
                        <span></span>
                      </label>
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="text-center py-4 text-sm text-mkhe-text/40">{t("common:empty", { defaultValue: "Không tìm thấy sản phẩm" })}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
