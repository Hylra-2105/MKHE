import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ShopLayout from "@/features/shop/components/ShopLayout";
import ProductGrid from "@/features/shop/components/ProductGrid";
import Pagination from "@/components/ui/Pagination";
import { shopService } from "@/features/shop/shop.service";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const ShopPage = () => {
  const { t } = useTranslation("product");
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  // Chuyển URL Search Params thành Object để dễ quản lý
  const currentFilters = {
    search: searchParams.get("search") || null,
    category: searchParams.get("category") || null,
    culturalDNA: searchParams.get("culturalDNA") || null,
    craftVillage: searchParams.get("craftVillage") || null,
    material: searchParams.getAll("material").length > 0 ? searchParams.getAll("material") : null,
    page: parseInt(searchParams.get("page")) || 1,
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Nếu thay đổi bộ lọc, reset về trang 1
    if (key !== "page") {
      newParams.set("page", "1");
    }

    if (value === null || value === undefined || value === "") {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.delete(key);
      value.forEach(v => newParams.append(key, v));
    } else {
      newParams.set(key, value);
    }

    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    handleFilterChange("page", newPage);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Build param object cho axios
      const params = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.category) params.category = currentFilters.category;
      if (currentFilters.culturalDNA) params.culturalDNA = currentFilters.culturalDNA;
      if (currentFilters.craftVillage) params.craftVillage = currentFilters.craftVillage;
      if (currentFilters.material) params.material = currentFilters.material.join(",");
      params.page = currentFilters.page;
      params.limit = 12; // 12 item mỗi trang phù hợp với grid 3/4

      const response = await shopService.getProducts(params);
      if (response.success) {
        setProducts(response.data.data);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
        });
      }
    } catch (error) {
      toast.error(t("shop.fetch_error"));
    } finally {
      setLoading(false);
    }
  }, [currentFilters.search, currentFilters.category, currentFilters.culturalDNA, currentFilters.craftVillage, currentFilters.page, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
    // Scroll to top when page/filters change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts, searchParams]);

  return (
    <ShopLayout filters={currentFilters} onFilterChange={handleFilterChange}>
      <ProductGrid products={products} loading={loading} />
      
      {pagination.totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            setPage={handlePageChange}
            loading={loading}
          />
        </div>
      )}
    </ShopLayout>
  );
};

export default ShopPage;
