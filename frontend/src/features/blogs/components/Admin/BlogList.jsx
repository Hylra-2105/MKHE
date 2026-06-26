import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Eye, LayoutGrid, List as ListIcon, Calendar } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getBlogsApi, deleteBlogApi } from "@/api/blogApi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Dropdown from "@/components/ui/Dropdown";
import { useTranslation } from "react-i18next";

const BlogList = () => {
  const { t } = useTranslation("blog");
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // grid | list
  const [filter, setFilter] = useState({
    search: "",
    category: "",
    status: "",
  });
  
  // Xóa blog
  const [deleteId, setDeleteId] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getBlogsApi({
        ...filter,
        limit: 100, // Load all for simplicity
      });
      setBlogs(res.blogs || []);
    } catch (error) {
      toast.error(t("admin.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filter.category, filter.status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBlogApi(deleteId);
      toast.success(t("admin.delete_success"));
      setDeleteId(null);
      fetchBlogs();
    } catch (error) {
      toast.error(t("admin.delete_error"));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("admin.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("admin.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate("/admin/blogs/create")}
            className="bg-mkhe-primary text-white px-5 py-2.5 rounded shadow hover:opacity-90 transition font-semibold cursor-pointer whitespace-nowrap"
          >
            {t("admin.add_new")}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col xl:flex-row xl:items-center gap-4 border border-mkhe-border/30">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
          <input
            type="text"
            placeholder={t("admin.search_placeholder")}
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          />
          <button
            type="submit"
            className="h-10 w-28 md:w-40 bg-mkhe-primary text-white px-4 md:px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold whitespace-nowrap"
          >
            {t("admin.btn_search")}
          </button>
        </form>
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto items-center">
          <Dropdown
            value={filter.category}
            options={[
              { value: "", label: t("admin.filter_category") },
              { value: "Ký sự", label: t("admin.editor.categories.Ký sự") },
              { value: "Sự kiện", label: t("admin.editor.categories.Sự kiện") },
              { value: "Cẩm nang", label: t("admin.editor.categories.Cẩm nang") },
            ]}
            onChange={(val) => setFilter(prev => ({ ...prev, category: val }))}
            placeholder={t("admin.filter_category")}
            className="w-full md:w-36 lg:w-44"
            triggerClassName="h-10 px-3 rounded bg-transparent border border-mkhe-border/50 focus:border-mkhe-primary focus:outline-none transition-colors"
            optionClassName="text-sm"
          />

          <Dropdown
            value={filter.status}
            options={[
              { value: "", label: t("admin.filter_status") },
              { value: "PUBLISHED", label: t("admin.status.PUBLISHED") },
              { value: "DRAFT", label: t("admin.status.DRAFT") },
            ]}
            onChange={(val) => setFilter(prev => ({ ...prev, status: val }))}
            placeholder={t("admin.filter_status")}
            className="w-full md:w-36 lg:w-44"
            triggerClassName="h-10 px-3 rounded bg-transparent border border-mkhe-border/50 focus:border-mkhe-primary focus:outline-none transition-colors"
            optionClassName="text-sm"
          />

          <div className="flex items-center border border-mkhe-border/50 rounded h-10 overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 h-full flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-mkhe-primary/20 text-mkhe-primary" : "text-mkhe-text/60 hover:bg-mkhe-border/30 hover:text-mkhe-text"}`}
              title="Danh sách"
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <div className="w-[1px] h-full bg-mkhe-border/50"></div>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 h-full flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-mkhe-primary/20 text-mkhe-primary" : "text-mkhe-text/60 hover:bg-mkhe-border/30 hover:text-mkhe-text"}`}
              title="Dạng lưới"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-mkhe-text/60">Đang tải danh sách...</div>
      ) : blogs.length === 0 ? (
        <div className="bg-mkhe-bg border border-mkhe-border/50 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-mkhe-border/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-8 h-8 text-mkhe-text/40" />
          </div>
          <h3 className="text-lg font-bold text-mkhe-text mb-2">{t("admin.empty_title")}</h3>
          <p className="text-mkhe-text/60 mb-6 max-w-sm mx-auto">
            Hãy tạo bài viết đầu tiên để kể những câu chuyện di sản đầy tự hào của MKHE.
          </p>
          <button 
            onClick={() => navigate("/admin/blogs/create")}
            className="bg-mkhe-primary text-white px-5 py-2.5 rounded shadow hover:opacity-90 transition font-semibold cursor-pointer"
          >
            Thêm bài viết mới
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {blogs.map(blog => (
            <div key={blog._id} className="bg-mkhe-bg border border-mkhe-border/50 rounded-xl overflow-hidden hover:border-mkhe-primary transition-all group shadow-sm flex flex-col">
              <div className="relative aspect-[16/9] bg-mkhe-border/10 overflow-hidden">
                {blog.thumbnail ? (
                  <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-mkhe-text/30">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider backdrop-blur-md ${blog.status === "PUBLISHED" ? "bg-green-500/80 text-white" : "bg-mkhe-border/80 text-mkhe-text"}`}>
                    {blog.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-medium text-mkhe-primary bg-mkhe-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {blog.category}
                  </span>
                  <span className="text-xs text-mkhe-text/50 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-mkhe-text line-clamp-2 mb-2 group-hover:text-mkhe-primary transition-colors">
                  {blog.title}
                </h3>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-mkhe-border/50">
                  <div className="text-xs text-mkhe-text/60">
                    {blog.tags?.length || 0} {t("admin.editor.form.linked_products")}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)} className="p-1.5 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-colors cursor-pointer" title={t("admin.actions.edit")}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {blog.status === "PUBLISHED" && (
                      <button onClick={() => window.open(`/blogs/${blog.slug}`, "_blank")} className="p-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-full transition-colors cursor-pointer" title={t("admin.actions.view")}>
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setDeleteId(blog._id)} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full transition-colors cursor-pointer" title={t("admin.actions.delete")}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-mkhe-bg border border-mkhe-border/50 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-mkhe-input/30 border-b border-mkhe-border/50">
                  <th className="px-4 py-3 font-medium text-xs text-mkhe-text/60 uppercase tracking-wider">{t("admin.table.article")}</th>
                  <th className="px-4 py-3 font-medium text-xs text-mkhe-text/60 uppercase tracking-wider">{t("admin.table.category")}</th>
                  <th className="px-4 py-3 font-medium text-xs text-mkhe-text/60 uppercase tracking-wider">{t("admin.table.status")}</th>
                  <th className="px-4 py-3 font-medium text-xs text-mkhe-text/60 uppercase tracking-wider">{t("admin.table.created_at")}</th>
                  <th className="px-4 py-3 font-medium text-xs text-mkhe-text/60 uppercase tracking-wider text-center">{t("admin.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mkhe-border/50">
                {blogs.map(blog => (
                  <tr key={blog._id} className="hover:bg-mkhe-border/10 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded overflow-hidden bg-mkhe-border/20 flex-shrink-0">
                          {blog.thumbnail && <img src={blog.thumbnail} alt={blog.title} className="w-full h-full object-cover" />}
                        </div>
                        <p className="text-sm font-bold text-mkhe-text group-hover:text-mkhe-primary transition-colors line-clamp-1">{blog.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium text-mkhe-primary bg-mkhe-primary/10 px-2 py-1 rounded-full uppercase tracking-wide">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${blog.status === "PUBLISHED" ? "bg-green-500/10 text-green-500" : "bg-mkhe-border/30 text-mkhe-text/70"}`}>
                        {blog.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-mkhe-text/80">
                      {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 transition-opacity">
                        <button onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)} className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-all duration-300 cursor-pointer" title={t("admin.actions.edit")}>
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {blog.status === "PUBLISHED" && (
                          <button onClick={() => window.open(`/blogs/${blog.slug}`, "_blank")} className="p-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-full transition-all duration-300 cursor-pointer" title={t("admin.actions.view")}>
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(blog._id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full transition-all duration-300 cursor-pointer" title={t("admin.actions.delete")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("admin.delete_modal.title")}
        message={t("admin.delete_modal.message")}
        confirmText={t("admin.delete_modal.btn_delete")}
        cancelText={t("admin.delete_modal.btn_cancel")}
        type="danger"
      />
    </div>
  );
};

export default BlogList;
