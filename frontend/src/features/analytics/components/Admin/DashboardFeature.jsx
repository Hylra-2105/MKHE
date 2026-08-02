import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { 
  TrendingUp, AlertTriangle, Package, Coins, Calendar, RefreshCcw, X,
  Users, Ticket, Ban, Award
} from "lucide-react";
import toast from "react-hot-toast";
import analyticsApi from "../../../../api/analyticsApi";
import UserDetailModal from "@/features/users/components/Admin/UserDetailModal";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import Dropdown from "@/components/ui/Dropdown";
import { useSocketStore } from "@/stores/useSocketStore";

const flatpickrOptions = {
  locale: Vietnamese,
  dateFormat: "Y-m-d",
};

const formatFlatpickrDate = (dateObj) => {
  if (!dateObj) return "";
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const fillMissingDates = (data, startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr || !Array.isArray(data)) return data;
  const result = [];
  
  const [y1, m1, d1] = startDateStr.split('-');
  const [y2, m2, d2] = endDateStr.split('-');
  
  let current = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);
  
  if (isNaN(current.getTime()) || isNaN(end.getTime())) return data;

  const dataMap = new Map();
  data.forEach(item => dataMap.set(item.date, item.revenue));

  while (current <= end) {
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
    
    result.push({
      date: dateStr,
      revenue: dataMap.get(dateStr) || 0
    });
    
    current.setDate(current.getDate() + 1);
  }
  return result;
};

const DashboardFeature = () => {
  const { t } = useTranslation("admin");
  const { socket } = useSocketStore();
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generalStats, setGeneralStats] = useState({ totalRevenue: 0, totalOrders: 0, uniqueUsersCount: 0, aov: 0, cancelRate: 0, totalAllOrders: 0 });
  const [voucherStats, setVoucherStats] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);
  const initialFetch = useRef(true);
  
  // Custom colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF8', '#F88CA2'];
  const STATUS_COLORS = {
    PENDING: '#FFBB28',
    CONFIRMED: '#0088FE',
    DELIVERING: '#A28CF8',
    COMPLETED: '#00C49F',
    CANCELLED: '#FF8042'
  };

  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=100&q=80";
    if (path.startsWith("http")) return path;
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000";
    return `${baseUrl}${path}`;
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const fetchData = async (isBackground = false) => {
    try {
      if (initialFetch.current) {
        setLoading(true);
        initialFetch.current = false;
      }

      let params = { period };
      let currentStartDate = startDate;
      let currentEndDate = endDate;

      if (period === "custom") {
        if (!startDate || !endDate) {
          setLoading(false);
          setRefreshing(false);
          return;
        }
        params = { period, startDate, endDate };
      } else {
        const now = new Date();
        currentEndDate = formatFlatpickrDate(now);
        const start = new Date();
        if (period === "week") start.setDate(now.getDate() - 7);
        else if (period === "month") start.setDate(now.getDate() - 30);
        else if (period === "quarter") start.setMonth(now.getMonth() - 3);
        else if (period === "year") start.setFullYear(now.getFullYear() - 1);
        currentStartDate = formatFlatpickrDate(start);
      }

      const [revenueRes, productsRes, advancedRes] = await Promise.all([
        analyticsApi.getRevenue(params),
        analyticsApi.getProductsReport(params),
        analyticsApi.getAdvancedAnalytics(params)
      ]);

      const paddedRevenue = fillMissingDates(revenueRes || [], currentStartDate, currentEndDate);
      
      setRevenueData(prev => JSON.stringify(prev) === JSON.stringify(paddedRevenue) ? prev : paddedRevenue);
      
      setTopProducts(prev => {
        const next = productsRes?.topProducts || [];
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
      setLowStockProducts(prev => {
        const next = productsRes?.lowStockProducts || [];
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
      setCategoryData(prev => {
        const next = advancedRes?.categoryRevenue || [];
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
      setOrderStatusData(prev => {
        const next = advancedRes?.orderStatusCounts || [];
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
      setGeneralStats(prev => {
        const next = advancedRes?.stats || { totalRevenue: 0, totalOrders: 0, uniqueUsersCount: 0, aov: 0, cancelRate: 0, totalAllOrders: 0 };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
      setVoucherStats(prev => {
        const next = advancedRes?.voucherStats || [];
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
      setTopCustomers(prev => {
        const next = advancedRes?.topCustomers || [];
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });
      
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      if (!isBackground) toast.error(t("dashboard.fetch_error", { defaultValue: "Lỗi tải dữ liệu báo cáo" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period === "custom" && (!startDate || !endDate)) return;
    
    fetchData();
    
    if (socket) {
      const handleUpdate = () => fetchData(true);
      socket.on("admin_order_updated", handleUpdate);
      socket.on("admin_product_updated", handleUpdate);
      return () => {
        socket.off("admin_order_updated", handleUpdate);
        socket.off("admin_product_updated", handleUpdate);
      };
    }
  }, [period, startDate, endDate, socket]);

  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const totalRevenue = safeRevenueData.reduce((sum, item) => sum + (Number(item?.revenue) || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mkhe-primary"></div>
      </div>
    );
  }

  const periodOptions = [
    { value: "week", label: t("dashboard.period_week", { defaultValue: "7 Ngày qua" }) },
    { value: "month", label: t("dashboard.period_month", { defaultValue: "30 Ngày qua" }) },
    { value: "quarter", label: t("dashboard.period_quarter", { defaultValue: "1 Quý qua" }) },
    { value: "year", label: t("dashboard.period_year", { defaultValue: "1 Năm qua" }) },
    { value: "custom", label: t("dashboard.period_custom", { defaultValue: "Tùy chỉnh..." }) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-logo text-gradient-gold mb-1">
            {t("dashboard.title", { defaultValue: "Thống kê Tổng quan" })}
          </h1>
          <p className="text-sm text-mkhe-text/60 italic">
            {t("dashboard.subtitle", { defaultValue: "Theo dõi doanh thu và rủi ro chuỗi cung ứng" })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">

          {period === "custom" && (
            <div className="flex items-center gap-2 mr-2">
              <div className="relative">
                <Flatpickr
                  value={formatFlatpickrDate(startDate)}
                  onChange={([date]) => setStartDate(formatFlatpickrDate(date))}
                  options={{ ...flatpickrOptions }}
                  className="h-10 pl-3 pr-8 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors w-32 cursor-pointer text-sm"
                  placeholder={t("dashboard.date_from", { defaultValue: "Từ ngày" })}
                />
                {startDate && (
                  <X
                    className="absolute right-2 top-3 w-4 h-4 text-mkhe-text/40 hover:text-mkhe-text/80 cursor-pointer transition-colors"
                    onClick={() => setStartDate("")}
                  />
                )}
              </div>
              <span className="text-mkhe-text/60">-</span>
              <div className="relative">
                <Flatpickr
                  value={formatFlatpickrDate(endDate)}
                  onChange={([date]) => setEndDate(formatFlatpickrDate(date))}
                  options={{ ...flatpickrOptions, minDate: startDate || undefined }}
                  className="h-10 pl-3 pr-8 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors w-32 cursor-pointer text-sm"
                  placeholder={t("dashboard.date_to", { defaultValue: "Đến ngày" })}
                />
                {endDate && (
                  <X
                    className="absolute right-2 top-3 w-4 h-4 text-mkhe-text/40 hover:text-mkhe-text/80 cursor-pointer transition-colors"
                    onClick={() => setEndDate("")}
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-mkhe-text/50 mr-2" />
            <Dropdown
              value={period}
              options={periodOptions}
              onChange={(val) => {
                setPeriod(val);
                if (val !== "custom") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
              className="w-40 shrink-0"
              triggerClassName="h-10 px-4 rounded-full border-mkhe-border/50 text-sm bg-transparent hover:bg-mkhe-primary/5 transition-colors"
              optionClassName="text-sm"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex shrink-0 items-center justify-center text-emerald-500">
            <Coins className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-mkhe-text/60 font-medium truncate">{t("dashboard.total_revenue", { defaultValue: "Tổng doanh thu" })}</p>
            <h3 className="text-lg font-bold text-mkhe-text mt-1 truncate">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex shrink-0 items-center justify-center text-blue-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-mkhe-text/60 font-medium truncate">{t("dashboard.aov")}</p>
            <h3 className="text-lg font-bold text-mkhe-text mt-1 truncate">{formatCurrency(generalStats.aov)}</h3>
          </div>
        </div>

        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex shrink-0 items-center justify-center text-purple-500">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-mkhe-text/60 font-medium truncate">{t("dashboard.customers")}</p>
            <h3 className="text-lg font-bold text-mkhe-text mt-1 truncate">{generalStats.uniqueUsersCount} <span className="text-xs font-normal text-mkhe-text/60 ml-1">{t("dashboard.users")}</span></h3>
          </div>
        </div>

        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -z-0"></div>
          <div className="w-12 h-12 rounded-full bg-rose-500/20 flex shrink-0 items-center justify-center text-rose-500 z-10">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="z-10 min-w-0">
            <p className="text-xs text-rose-500/80 font-medium truncate">{t("dashboard.low_stock_alert", { defaultValue: "Cảnh báo hết hàng" })}</p>
            <h3 className="text-lg font-bold text-rose-500 mt-1 truncate">
              {lowStockProducts.length} <span className="text-xs font-normal text-rose-500/70">{t("dashboard.products", { defaultValue: "sản phẩm" })}</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
        <h2 className="text-lg font-bold text-mkhe-text mb-6">{t("dashboard.revenue_chart", { defaultValue: "Biểu đồ dòng tiền (Đã thanh toán)" })}</h2>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={safeRevenueData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 12 }} tickMargin={10} />
              <YAxis 
                tickFormatter={(value) => `${value / 1000000}M`} 
                tick={{ fill: '#888', fontSize: 12 }} 
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), t("dashboard.revenue", { defaultValue: "Doanh thu" })]} 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name={t("dashboard.revenue")} 
                stroke="#C6A87C" 
                strokeWidth={3}
                isAnimationActive={false}
                activeDot={{ r: 8, fill: "#C6A87C", stroke: "#fff", strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Three Columns: Top Products, Low Stock, Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top 5 Products */}
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-mkhe-text mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-mkhe-primary" />
            {t("dashboard.top_products")}
          </h2>
          
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-3 hover:bg-mkhe-primary/5 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-mkhe-primary/10 text-mkhe-primary flex items-center justify-center font-bold text-sm">
                  #{index + 1}
                </div>
                <img 
                  src={getImageUrl(product.images?.[0])} 
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-mkhe-border/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-mkhe-text truncate">{product.name}</p>
                  <p className="text-xs text-mkhe-text/50">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-mkhe-primary">{product.sold} {t("dashboard.sold", { defaultValue: "đã bán" })}</p>
                  <p className="text-xs text-mkhe-text/50">{formatCurrency(product.price)}</p>
                </div>
              </div>
            ))}
            
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-mkhe-text/40 text-sm">
                {t("dashboard.no_data", { defaultValue: "Chưa có dữ liệu" })}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-rose-500 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t("dashboard.low_stock_list", { defaultValue: "Cần nhập hàng khẩn cấp (< 10)" })}
          </h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 p-3 bg-mkhe-primary/5 hover:bg-mkhe-primary/10 rounded-xl transition-colors border border-mkhe-primary/10">
                <img 
                  src={getImageUrl(product.images?.[0])} 
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-mkhe-border/30"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-mkhe-text truncate">{product.name}</p>
                  <p className="text-xs text-mkhe-text/50">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20 shadow-sm">
                    {t("dashboard.stock", { defaultValue: "Tồn:" })} {product.stock}
                  </div>
                </div>
              </div>
            ))}
            
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-rose-500/50 text-sm h-full flex items-center justify-center">
                {t("dashboard.no_data", { defaultValue: "Chưa có dữ liệu" })}
              </div>
            )}
          </div>
        </div>

        {/* Top Customers (VIP) */}
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-mkhe-text mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            {t("dashboard.top_customers")}
          </h2>
          
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {topCustomers.map((customer, index) => (
              <div key={customer.userId} className="flex flex-col gap-1 p-3 bg-mkhe-primary/5 hover:bg-mkhe-primary/10 rounded-xl border border-mkhe-primary/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span 
                      className="font-bold text-mkhe-primary text-sm truncate max-w-[120px] cursor-pointer hover:underline"
                      onClick={() => {
                        if (customer.userDetails) setSelectedUserForModal(customer.userDetails);
                        else toast.error(t("dashboard.user_detail_not_found"));
                      }}
                      title={t("dashboard.view_user_detail")}
                    >
                      {customer.name}
                    </span>
                  </div>
                  <span className="text-xs text-mkhe-text/50">{customer.phone?.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2')}</span>
                </div>
                <div className="flex justify-between text-xs text-mkhe-text/60 mt-1">
                  <span>{t("dashboard.orders")}: <span className="font-medium text-mkhe-text">{customer.orderCount}</span></span>
                  <span>{t("dashboard.spent")}: <span className="text-mkhe-primary font-bold">{formatCurrency(customer.totalSpent)}</span></span>
                </div>
              </div>
            ))}
            
            {topCustomers.length === 0 && (
              <div className="text-center py-8 text-mkhe-text/40 text-sm h-full flex items-center justify-center">
                {t("dashboard.no_customer_data")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart: Revenue by Category */}
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-mkhe-text mb-6">{t("dashboard.revenue_by_category")}</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Order Status */}
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-mkhe-text mb-6">{t("dashboard.order_status_chart", { defaultValue: "Tình trạng Đơn hàng" })}</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderStatusData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#888', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name={t("dashboard.orders")} radius={[6, 6, 0, 0]} isAnimationActive={false}>
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Voucher Performance */}
        <div className="bg-mkhe-input/50 backdrop-blur-md rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-mkhe-text mb-4 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-mkhe-primary" />
            {t("dashboard.top_vouchers")}
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2">
            {voucherStats.map((voucher) => {
              const displayCode = voucher.code ? voucher.code : t("dashboard.auto_code");
              const isAuto = !voucher.code;
              
              return (
              <div key={voucher.code || 'auto'} className="flex flex-col gap-1.5 p-3.5 bg-mkhe-primary/5 hover:bg-mkhe-primary/10 rounded-xl border border-mkhe-primary/10 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-mkhe-primary" />
                    <span className={`font-bold text-[11px] uppercase px-2 py-0.5 rounded border ${isAuto ? 'bg-mkhe-text/5 text-mkhe-text/60 border-mkhe-border/50' : 'bg-mkhe-primary/10 text-mkhe-primary border-mkhe-primary/30'}`}>
                      {displayCode}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-mkhe-text">{voucher.usageCount} <span className="font-normal text-mkhe-text/60">{t("dashboard.uses")}</span></span>
                </div>
                
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-mkhe-text/60">
                    {t("dashboard.revenue")}: <span className="font-semibold text-mkhe-text">{formatCurrency(voucher.revenueGenerated)}</span>
                  </span>
                  <span className="text-mkhe-text/60">
                    {t("dashboard.discount_cost")}: <span className="font-semibold text-rose-500">-{formatCurrency(voucher.totalDiscount)}</span>
                  </span>
                </div>
              </div>
            )})}
            {voucherStats.length === 0 && (
              <div className="text-center py-8 text-mkhe-text/40 text-sm h-full flex items-center justify-center">
                {t("dashboard.no_voucher_data")}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUserForModal && (
        <UserDetailModal
          isOpen={!!selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          user={selectedUserForModal}
          viewOnly={true}
        />
      )}
    </div>
  );
};

export default DashboardFeature;
