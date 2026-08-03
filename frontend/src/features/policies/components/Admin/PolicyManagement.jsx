import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import policyApi from "@/api/policyApi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";

const PolicyManagement = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await policyApi.getAll();
      if (res.data && res.data.success) {
        setPolicies(res.data.data || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách chính sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await policyApi.delete(deleteId);
      toast.success("Xóa chính sách thành công");
      setDeleteId(null);
      fetchPolicies();
    } catch (error) {
      toast.error("Lỗi khi xóa chính sách");
    }
  };

  const handleToggleActive = async (policy) => {
    try {
      await policyApi.update(policy._id, { isActive: !policy.isActive });
      toast.success("Cập nhật trạng thái thành công");
      fetchPolicies();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            Chính sách & FAQ
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            Quản lý các trang chính sách, trung tâm trợ giúp và các câu hỏi thường gặp
          </p>
        </div>
        <Button onClick={() => navigate("/admin/policies/create")} className="!w-auto">
          <Plus size={18} className="mr-2" />
          Tạo trang mới
        </Button>
      </div>

      <div className="bg-white dark:bg-mkhe-bg border border-mkhe-border/30 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-mkhe-primary/5 border-b border-mkhe-border/30 text-mkhe-text font-semibold">
              <tr>
                <th className="p-4">Tiêu đề</th>
                <th className="p-4">Đường dẫn (Slug)</th>
                <th className="p-4">Chuyên mục</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mkhe-border/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-mkhe-text/50">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-mkhe-text/50">
                    Chưa có trang chính sách nào
                  </td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy._id} className="hover:bg-mkhe-primary/5 transition-colors">
                    <td className="p-4 font-medium text-mkhe-text">{policy.title}</td>
                    <td className="p-4 text-mkhe-text/70">{policy.slug}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-mkhe-primary/10 text-mkhe-primary rounded-md text-xs font-bold">
                        {policy.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(policy)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          policy.isActive
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                        }`}
                      >
                        {policy.isActive ? (
                          <>
                            <CheckCircle2 size={14} /> Hiển thị
                          </>
                        ) : (
                          <>
                            <XCircle size={14} /> Ẩn
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/policies/${policy._id}/edit`)}
                          className="w-8 h-8 rounded-full bg-mkhe-primary/10 text-mkhe-primary flex items-center justify-center hover:bg-mkhe-primary/20 transition-all duration-300 cursor-pointer"
                          title="Sửa bài viết"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(policy._id)}
                          className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center hover:bg-rose-500/20 transition-all duration-300 cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Xóa trang chính sách"
        message="Bạn có chắc chắn muốn xóa trang này? Hành động này không thể hoàn tác."
        confirmText="Xóa trang"
        cancelText="Hủy"
        icon="trash"
        isDanger={true}
      />
    </div>
  );
};

export default PolicyManagement;
