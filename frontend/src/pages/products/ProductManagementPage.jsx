import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react"; 

import { productApi } from "@/api/productApi";
import ProductTable from "@/features/products/components/Admin/ProductTable";
import AddProductModal from "@/features/products/components/Admin/AddProductModal";
import EditProductModal from "@/features/products/components/Admin/EditProductModal";
import TrashProductModal from "@/features/products/components/Admin/TrashProductModal";
import ProductFilter from "@/features/products/components/Admin/ProductFilter";

const ProductManagementPage = () => {
  const { t } = useTranslation("product");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false); // State cho Thùng rác
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productApi.getAllProducts(
        page,
        limit,
        appliedSearch,
        categoryFilter,
      );

      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error(t("messages.fetch_error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, appliedSearch, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput);
  };

  const handleCategoryChange = (e) => {
    setPage(1);
    setCategoryFilter(e.target.value);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const pageNumbers = [page - 1, page, page + 1];

  return (
    <div className="p-6 bg-mkhe-bg min-h-screen text-mkhe-text flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("page.title")}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("page.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          {/* NÚT THÙNG RÁC */}
          <button
            onClick={() => setIsTrashModalOpen(true)}
            className="flex items-center gap-2 bg-mkhe-primary text-white px-4 py-2.5 rounded shadow hover:opacity-90 transition font-semibold cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-white" />
            {t("page.trash_btn")}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-mkhe-primary text-white px-5 py-2.5 rounded shadow hover:opacity-90 transition font-semibold cursor-pointer"
          >
            {t("page.add_btn")}
          </button>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <ProductFilter
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        categoryFilter={categoryFilter}
        handleCategoryChange={handleCategoryChange}
        handleSearch={handleSearch}
      />

      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleEditProduct}
      />

      {/* DIVIDER */}
      <div className="h-px bg-mkhe-border/30 my-7"></div>

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
