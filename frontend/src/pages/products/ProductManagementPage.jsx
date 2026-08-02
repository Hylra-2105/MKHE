import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { productApi } from "@/api/productApi";
import ProductTable from "@/features/products/components/Admin/ProductTable";
import ProductGrid from "@/features/products/components/Admin/ProductGrid";
import AddProductModal from "@/features/products/components/Admin/AddProductModal";
import EditProductModal from "@/features/products/components/Admin/EditProductModal";
import TrashProductModal from "@/features/products/components/Admin/TrashProductModal";
import ProductFilter from "@/features/products/components/Admin/ProductFilter";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";
import { useSocketStore } from "@/stores/useSocketStore";

const ProductManagementPage = () => {
  const { t } = useTranslation("product");
  const { socket } = useSocketStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // grid | list

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const limit = viewMode === "grid" ? 8 : 6;
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // State cho bộ lọc mã gen và nhà cung cấp
  const [dnaFilter, setDnaFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchProducts = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      // Lấy tất cả sản phẩm (kể cả DRAFT, HIDDEN)
      const res = await productApi.getAllProducts(
        page,
        limit,
        appliedSearch,
        categoryFilter,
        dnaFilter,
        statusFilter || "ADMIN_ALL",
        false, // inStock
        vendorFilter
      );

      if (res.success) {
        setProducts(prev => JSON.stringify(prev) === JSON.stringify(res.data.data) ? prev : res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error(t("messages.fetch_error"));
      console.error(error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [page, limit, appliedSearch, categoryFilter, dnaFilter, vendorFilter, statusFilter, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    
    if (socket) {
      const handleUpdate = () => fetchProducts(true);
      socket.on("admin_product_updated", handleUpdate);
      return () => {
        socket.off("admin_product_updated", handleUpdate);
      };
    }
  }, [fetchProducts, socket]);

  useEffect(() => {
    if (location.state?.openProductId && products.length > 0) {
      const productId = location.state.openProductId;
      const product = products.find(p => p._id === productId);
      
      if (product) {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
      }
      
      // Clear the state so it doesn't reopen on refresh
      navigate(".", { replace: true, state: {} });
    }
  }, [location.state?.openProductId, products, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput);
  };

  const handleCategoryChange = (e) => {
    setPage(1);
    setCategoryFilter(e.target.value);
  };

  // Xử lý khi đổi mã gen
  const handleDnaChange = (e) => {
    setPage(1);
    setDnaFilter(e.target.value);
  };

  const handleVendorChange = (e) => {
    setPage(1);
    setVendorFilter(e.target.value);
  };

  const handleStatusChange = (e) => {
    setPage(1);
    setStatusFilter(e.target.value);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const pageNumbers = [page - 1, page, page + 1];

  return (
    <div className="p-3 md:p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("page.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("page.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="danger"
            onClick={() => setIsTrashModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-white" />
            {t("page.trash_btn")}
          </Button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
          >
            {t("page.add_btn")}
          </Button>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <ProductFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        categoryFilter={categoryFilter}
        handleCategoryChange={handleCategoryChange}
        handleSearch={handleSearch}
        dnaFilter={dnaFilter}
        handleDnaChange={handleDnaChange}
        vendorFilter={vendorFilter}
        handleVendorChange={handleVendorChange}
        statusFilter={statusFilter}
        handleStatusChange={handleStatusChange}
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          setPage(1);
        }}
      />

      {viewMode === "list" ? (
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleEditProduct}
        />
      ) : (
        <ProductGrid
          products={products}
          loading={loading}
          onEdit={handleEditProduct}
        />
      )}<div className="h-px bg-mkhe-border/30 my-7"></div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-mkhe-text/60">
            {t("page.page_text")}{" "}
            <span className="font-bold text-mkhe-primary">{page}</span> /{" "}
            {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || loading}
              className={`px-2 py-1 rounded transition-colors mr-2 ${
                page === 1
                  ? "invisible"
                  : "text-mkhe-primary cursor-pointer hover:bg-mkhe-primary/20"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              &lt;
            </button>

            {pageNumbers.map((pageNum) => {
              const isValid = pageNum >= 1 && pageNum <= totalPages;
              const isActive = page === pageNum;

              return (
                <button
                  key={pageNum}
                  onClick={() => isValid && setPage(pageNum)}
                  disabled={loading || !isValid}
                  className={`w-10 h-10 flex justify-center items-center transition-all duration-300 mx-1 ${
                    !isValid
                      ? "invisible w-8"
                      : isActive
                        ? "text-2xl text-mkhe-primary scale-80 cursor-pointer"
                        : "text-base font-medium cursor-pointer text-mkhe-text/50 hover:text-mkhe-primary"
                  } bg-transparent border-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || loading}
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

      {/* MODALS */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchProducts}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />

      <TrashProductModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default ProductManagementPage;
