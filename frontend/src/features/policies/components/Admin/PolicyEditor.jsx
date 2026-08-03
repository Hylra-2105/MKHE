import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Check } from "lucide-react";
import toast from "react-hot-toast";
import policyApi from "@/api/policyApi";
import Button from "@/components/ui/Button";
import RichTextEditor from "@/components/ui/RichTextEditor";
import Dropdown from "@/components/ui/Dropdown";

const PolicyEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialData = {
    title: "",
    slug: "",
    category: "Chính sách",
    content: "",
    isActive: true,
  };
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (id) {
      fetchPolicy();
    }
  }, [id]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await policyApi.getAll(); // Fetch all then find, or better use getById. But we only have getBySlug or getAll. Since Admin fetches all, we can just fetch all and find by id for simplicity, or we can add getById. Let's just fetch all.
      const allPolicies = res.data?.data || [];
      const policyData = allPolicies.find(p => p._id === id);
      if (policyData) {
        setFormData({
          title: policyData.title || "",
          slug: policyData.slug || "",
          category: policyData.category || "Chính sách",
          content: policyData.content || "",
          isActive: policyData.isActive,
        });
      } else {
        toast.error("Không tìm thấy trang chính sách");
        navigate("/admin/policies");
      }
    } catch (error) {
      toast.error("Lỗi khi tải trang");
      navigate("/admin/policies");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      return toast.error("Vui lòng nhập tiêu đề");
    }
    if (!formData.slug.trim()) {
      return toast.error("Vui lòng nhập đường dẫn (slug)");
    }
    if (!formData.content || formData.content === "<p><br></p>") {
      return toast.error("Vui lòng nhập nội dung");
    }

    try {
      setSaving(true);
      if (id) {
        await policyApi.update(id, formData);
        toast.success("Cập nhật thành công");
      } else {
        await policyApi.create(formData);
        toast.success("Tạo mới thành công");
      }
      navigate("/admin/policies");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu trang");
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => {
      const newData = { ...prev, title };
      if (!id) { // Auto generate slug only when creating
        newData.slug = title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9 -]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      return newData;
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-mkhe-text/60">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 mb-6">
        <button 
          onClick={() => navigate("/admin/policies")}
          className="group inline-flex items-center gap-1 text-mkhe-text/80 hover:text-mkhe-primary transition-colors text-sm font-medium uppercase tracking-wider w-fit cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>BACK</span>
        </button>
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {id ? "Chỉnh sửa Trang" : "Tạo Trang mới"}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {id ? "Cập nhật nội dung trang chính sách hiện tại" : "Tạo nội dung trang chính sách mới"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="Nhập tiêu đề trang..."
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-mkhe-text/30 text-mkhe-text mb-4"
            />
            
            <div className="flex items-center gap-2 text-sm mb-6">
              <span className="text-mkhe-text/50">Đường dẫn:</span>
              <span className="text-mkhe-text/40">/policy/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 bg-transparent border-b border-mkhe-border/30 outline-none text-mkhe-primary"
              />
            </div>

            <div className="min-h-[400px]">
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Nhập nội dung bài viết ở đây..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-mkhe-text mb-2">Đăng bài viết</h3>
            <p className="text-xs text-mkhe-text/60 mb-2">
              Hệ thống sẽ cập nhật trạng thái hiển thị của bài viết dựa trên lựa chọn dưới đây.
            </p>
            <Button onClick={handleSave} disabled={saving} className="w-full py-3">
              {saving ? "ĐANG LƯU..." : "LƯU BÀI VIẾT"}
            </Button>
          </div>

          <div className="bg-mkhe-bg border border-mkhe-border p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Phân loại</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Chuyên mục</label>
              <Dropdown
                options={[
                  { value: "Chính sách", label: "Chính sách" },
                  { value: "Hướng dẫn sử dụng", label: "Hướng dẫn sử dụng" },
                  { value: "Dịch vụ B2B", label: "Dịch vụ B2B" },
                  { value: "FAQ", label: "Câu hỏi thường gặp (FAQ)" },
                ]}
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trạng thái</label>
              <Dropdown
                options={[
                  { value: "true", label: "Hiển thị (Public)" },
                  { value: "false", label: "Ẩn (Draft)" },
                ]}
                value={formData.isActive.toString()}
                onChange={(val) => setFormData({ ...formData, isActive: val === "true" })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyEditor;
