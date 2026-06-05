import React, { useState, useEffect, useTransition } from "react";
import toast from "react-hot-toast";
import { X, Trash2, RefreshCw } from "lucide-react";
import { productApi } from "@/api/productApi";
import { useTranslation } from "react-i18next";
import ConfirmModal from "@/components/ui/ConfirmModal";

const TrashProductModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation("product");
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger để buộc refetch

  // Confirm Modal State
  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });

  // Fetch danh sách sản phẩm đã xóa khi mở Modal hoặc khi refreshTrigger thay đổi
  useEffect(() => {
    if (isOpen) fetchDeletedProducts();
  }, [page, isOpen, refreshTrigger]);

  const fetchDeletedProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getDeletedProducts(page, 5);

      if (res.success) {
        // Flexible response handling - works with both {data: []} and {data: {data: []}}
        const productsData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        const paginationData = res.data?.pagination || { totalPages: 1 };

        setDeletedProducts(productsData);
        setTotalPages(paginationData.totalPages || 1);
      } else {
        throw new Error(res.message || "Lấy danh sách thất bại");
      }
    } catch (error) {
      toast.error(t("messages.fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    setActionLoading(id);
    try {
      const res = await productApi.restoreProduct(id);

      if (!res) {
        throw new Error("API không trả về response");
      }

      if (res.success || res.data) {
        toast.success(t("messages.restore_success"));

        if (onSuccess) onSuccess();

        // Buộc refetch danh sách trash bằng cách update refreshTrigger
        setRefreshTrigger((prev) => prev + 1);

        // Đóng confirm modal
        setConfirmData({ isOpen: false, productId: null, productName: "" });
      } else {
        const errorMsg = res.message || "Khôi phục thất bại";
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        t("messages.restore_error");

      toast.error(`❌ Lỗi khôi phục: ${errorMsg}`);
      // Keep modal open on error so user can retry
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreClick = (id, name) => {
    setConfirmData({
      isOpen: true,
      productId: id,
      productName: name,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[var(--color-mkhe-bg)] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-mkhe-border)]/50 shrink-0">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 mb-1 text-mkhe-primary" />
            <h2 className="text-lg font-bold text-gradient-gold">
              {t("modal.trash_title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mkhe-primary/10 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 text-mkhe-text/70" />
          </button>
        </div>

        {/* BODY (BẢNG DANH SÁCH RÁC) */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden bg-mkhe-primary/5">
          {deletedProducts.length === 0 && !loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-mkhe-text/50">
              <Trash2 className="w-10 h-10 mb-2 opacity-50" />
              <p>{t("modal.empty_trash")}</p>
            </div>
          ) : (
            <>
              {/* Gán min-height cho cái table wrapper để nó luôn cao cố định */}
              <div
                className={`bg-mkhe-bg rounded-xl border border-mkhe-border/30 overflow-hidden flex-1 min-h-[360px] transition-opacity duration-300 relative ${
                  loading || isPending
                    ? "opacity-60 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-mkhe-bg/30 backdrop-blur-sm z-10">
                    <div className="animate-spin">
                      <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                    </div>
                  </div>
                )}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-xs bg-mkhe-border/10">
                      <th className="p-4 font-semibold">{t("table.name")}</th>
                      <th className="p-4 font-semibold">{t("table.sku")}</th>
                      <th className="p-4 font-semibold text-center">
                        {t("table.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedProducts.map((prod) => (
                      <tr
                        key={prod._id}
                        className="border-b border-mkhe-border/10 hover:bg-mkhe-primary/5 transition-colors last:border-0"
                      >
                        <td className="p-4 font-medium text-sm text-mkhe-text opacity-70">
                          {prod.name}
                        </td>
                        <td className="p-4 font-mono text-sm text-mkhe-text/60">
                          {prod.sku}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() =>
                              handleRestoreClick(prod._id, prod.name)
                            }
                            className="px-4 py-1.5 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-500 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 mx-auto"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {t("modal.restore")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              {totalPages > 0 && (
                <div className="mt-6 flex justify-between items-center border-t border-mkhe-border/30 pt-4">
                  <span className="text-sm text-mkhe-text/60">
                    {t("page.page_text")}{" "}
                    <span className="font-bold text-mkhe-primary">{page}</span>{" "}
                    / {totalPages}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startTransition(() => setPage(page - 1))}
                      disabled={page === 1 || loading || isPending}
                      className={`px-2 py-1 rounded transition-colors mr-2 ${
                        page === 1
                          ? "invisible"
                          : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      &lt;
                    </button>

                    {[page - 1, page, page + 1].map((pageNum) => {
                      const isValid = pageNum >= 1 && pageNum <= totalPages;
                      const isActive = page === pageNum;
                      if (!isValid) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() =>
                            startTransition(() => setPage(pageNum))
                          }
                          disabled={loading || isPending}
                          className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                            isActive
                              ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
                              : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
                          } bg-transparent border-none focus:outline-none`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => startTransition(() => setPage(page + 1))}
                      disabled={page === totalPages || loading || isPending}
                      className={`px-2 py-1 rounded transition-colors font-bold ml-2 ${
                        page === totalPages
                          ? "invisible"
                          : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CONFIRM RESTORE MODAL */}
      <ConfirmModal
        isOpen={confirmData.isOpen}
        onConfirm={() => handleRestore(confirmData.productId)}
        onCancel={() =>
          setConfirmData({ isOpen: false, productId: null, productName: "" })
        }
        title={t("modal.confirm_restore_title")}
        message={t("modal.confirm_restore_desc", {
          name: confirmData.productName,
        })}
        confirmText={t("modal.confirm_restore_btn")}
        cancelText={t("modal.cancel")}
        loading={actionLoading === confirmData.productId}
        icon="shield"
      />
    </div>
  );
};

export default TrashProductModal;
