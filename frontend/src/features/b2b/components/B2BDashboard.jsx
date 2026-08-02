import {  useState, useEffect  } from "react";
import { useTranslation } from "react-i18next";
import { getMyB2BOrdersApi } from "@/api/b2bApi";
import B2BOrderDetails from "./B2BOrderDetails";
import { Loader2, PackageSearch, Plus, LayoutGrid, List, Search, Filter, Eye, Package, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import Dropdown from "@/components/ui/Dropdown";
import Pagination from "@/components/ui/Pagination";

const B2BDashboard = () => {
  const { t } = useTranslation(["b2b", "common"]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 8 : 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, viewMode]);

  const fetchOrders = async () => {
    try {
      const res = await getMyB2BOrdersApi();
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = (orderId, updatedData) => {
    setOrders(prev => prev.map(o => o._id === orderId ? updatedData : o));
    if (selectedOrder && selectedOrder._id === orderId) {
      setSelectedOrder(updatedData);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.productOrService?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-mkhe-primary" /></div>;
  }

  if (selectedOrder) {
    return (
      <B2BOrderDetails 
        order={selectedOrder} 
        onBack={() => setSelectedOrder(null)} 
        onUpdateOrder={handleUpdateOrder} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-mkhe-primary/10 flex items-center justify-center text-mkhe-primary shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-logo text-gradient-gold tracking-wider uppercase">
              {t("b2b:title")}
            </h1>
            <p className="text-mkhe-text/60 text-sm mt-1">
              Quản lý tiến độ và thương lượng hợp đồng B2B
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link 
            to="/b2b/request" 
            className="bg-mkhe-primary text-white px-5 py-2.5 rounded shadow hover:opacity-90 transition font-semibold cursor-pointer flex items-center gap-2"
          >
            <span className="font-bold text-lg leading-none mt-[-2px]">+</span>
            Tạo yêu cầu mới
          </Link>
        </div>
      </div>

      <div className="bg-mkhe-bg border border-mkhe-border/30 rounded p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 flex gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mkhe-text/40" />
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm/dịch vụ..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
              />
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <Dropdown
            value={statusFilter}
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "pending_quote", label: "Chờ báo giá" },
              { value: "negotiating", label: "Đang đàm phán" },
              { value: "confirmed", label: "Đã chốt" },
              { value: "in_production", label: "Đang sản xuất" },
              { value: "delivered", label: "Đã giao" },
            ]}
            onChange={(val) => setStatusFilter(val)}
            placeholder="Tất cả trạng thái"
            className="w-full md:w-48 shrink-0"
            triggerClassName="h-10 px-3 rounded"
            optionClassName="text-sm"
          />

          <div className="flex items-center bg-mkhe-border/20 rounded-lg p-1 shrink-0 h-10 ml-auto md:ml-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer h-full aspect-square flex items-center justify-center ${viewMode === "table" ? "bg-mkhe-input shadow-sm text-mkhe-primary" : "text-mkhe-text/50 hover:text-mkhe-text"}`}
              title="Danh sách"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors cursor-pointer h-full aspect-square flex items-center justify-center ${viewMode === "grid" ? "bg-mkhe-input shadow-sm text-mkhe-primary" : "text-mkhe-text/50 hover:text-mkhe-text"}`}
              title="Xem dạng lưới"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
{filteredOrders.length === 0 ? (
        <div className="bg-mkhe-bg rounded-xl border border-mkhe-border/30 p-12 flex flex-col items-center justify-center text-center">
          <PackageSearch className="w-12 h-12 text-mkhe-text/20 mb-4" />
          <h3 className="text-lg font-bold text-mkhe-text mb-2">{t("b2b:no_orders")}</h3>
          <p className="text-mkhe-text/60 mb-6 max-w-sm">
            Bạn chưa có yêu cầu hợp đồng B2B nào. Hãy tạo một yêu cầu mới để bắt đầu quá trình đàm phán với chúng tôi.
          </p>
        </div>
      ) : /* List/Grid View */
      viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[420px] content-start">
          {paginatedOrders.map((order) => (
            <div 
              key={order._id}
              onClick={() => setSelectedOrder(order)}
              className="bg-mkhe-bg border border-mkhe-primary/40 rounded shadow-[0_0_10px_rgba(197,160,89,0.1)] p-5 hover:shadow-[0_4px_20px_rgba(197,160,89,0.25)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-mkhe-primary group-hover:w-2 transition-all"></div>
              
              <div className="flex justify-between items-start mb-4 ml-2">
                <h3 className="font-bold text-mkhe-text text-lg line-clamp-2 pr-2">
                  {order.productOrService?.name}
                </h3>
                <span className="px-3 py-1 bg-mkhe-primary/10 text-mkhe-primary rounded-full text-xs font-bold whitespace-nowrap">
                  {t(`b2b:status.${order.status}`)}
                </span>
              </div>
              
              <div className="mt-auto ml-2 space-y-2 text-sm text-mkhe-text/70 mb-4">
                <p>Số lượng: <span className="font-medium text-mkhe-text">{order.quantity}</span></p>
                <p>Ngày giao: <span className="font-medium text-mkhe-text">{new Date(order.deliveryDate).toLocaleDateString()}</span></p>
                <p>Cập nhật: {new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="ml-2 mt-2 flex items-center text-mkhe-primary font-medium text-sm group-hover:underline">
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-mkhe-bg border border-mkhe-border/30 rounded overflow-hidden shadow-sm min-h-[440px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-mkhe-text border-collapse">
              <thead>
                <tr className="bg-mkhe-primary/5 border-b border-mkhe-border/30 text-mkhe-text/60 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-r border-mkhe-border/30">Sản phẩm / Dịch vụ</th>
                  <th className="p-4 font-bold border-b border-mkhe-border/30">Số lượng</th>
                  <th className="p-4 font-bold border-b border-mkhe-border/30">Ngày giao</th>
                  <th className="p-4 font-bold border-b border-mkhe-border/30">Trạng thái</th>
                  <th className="p-4 font-bold border-b border-mkhe-border/30 text-right">Cập nhật</th>
                  <th className="p-4 font-bold border-b border-mkhe-border/30 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mkhe-border/30">
                {paginatedOrders.map((order) => (
                  <tr 
                    key={order._id}
                    className="hover:bg-mkhe-primary/5 transition-colors"
                  >
                    <td className="p-4 max-w-[250px] border-r border-mkhe-border/30">
                      <div className="font-bold text-mkhe-text line-clamp-2 transition-colors">
                        {order.productOrService?.name}
                      </div>
                      <div className="text-[11px] text-mkhe-text/60 mt-1 flex items-center gap-1 font-medium">
                        <Package className="w-3 h-3" />
                        <span>MKHE B2B</span>
                      </div>
                    </td>
                    <td className="p-4 text-mkhe-text font-medium">{order.quantity}</td>
                    <td className="p-4 text-mkhe-text/80 text-sm">{new Date(order.deliveryDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-mkhe-primary/10 text-mkhe-primary rounded-full text-xs font-bold whitespace-nowrap">
                        {t(`b2b:status.${order.status}`)}
                      </span>
                    </td>
                    <td className="p-4 text-mkhe-text/80 text-sm text-right">{new Date(order.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-all duration-300 cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
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

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <Pagination
          page={currentPage}
          setPage={setCurrentPage}
          totalPages={totalPages}
          loading={loading}
        />
      )}
    </div>
  );
};

export default B2BDashboard;
