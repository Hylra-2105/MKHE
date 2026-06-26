import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { 
  TrendingUp, AlertTriangle, Package, Coins, Calendar, RefreshCcw
} from "lucide-react";
import toast from "react-hot-toast";
import analyticsApi from "../../../../api/analyticsApi";

const DashboardFeature = () => {
  const { t } = useTranslation("admin");
  const [period, setPeriod] = useState("month");
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
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
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const [revenueRes, productsRes, advancedRes] = await Promise.all([
        analyticsApi.getRevenue(period),
        analyticsApi.getProductsReport(),
        analyticsApi.getAdvancedAnalytics(period)
      ]);

      setRevenueData(revenueRes || []);
      setTopProducts(productsRes?.topProducts || []);
      setLowStockProducts(productsRes?.lowStockProducts || []);
      setCategoryData(advancedRes?.categoryRevenue || []);
      setOrderStatusData(advancedRes?.orderStatusCounts || []);
      
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      if (!isBackground) toast.error(t("dashboard.fetch_error", { defaultValue: "Lỗi tải dữ liệu báo cáo" }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto refresh every 10 seconds (background)
    const interval = setInterval(() => {
      fetchData(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [period]);

  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const totalRevenue = safeRevenueData.reduce((sum, item) => sum + (Number(item?.revenue) || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mkhe-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-mkhe-text flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-mkhe-primary" />
            {t("dashboard.title", { defaultValue: "Thống kê Tổng quan" })}
          </h1>
          <p className="text-mkhe-text/60 mt-1">
            {t("dashboard.subtitle", { defaultValue: "Theo dõi doanh thu và rủi ro chuỗi cung ứng" })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {refreshing && (
            <span className="flex items-center text-xs text-mkhe-primary animate-pulse mr-2">
              <RefreshCcw className="w-3 h-3 mr-1 animate-spin" /> 
              {t("dashboard.syncing", { defaultValue: "Đang đồng bộ..." })}
            </span>
          )}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white border border-mkhe-border/50 text-mkhe-text rounded-full pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-mkhe-primary shadow-sm"
            >
              <option value="week">{t("dashboard.period_week", { defaultValue: "7 Ngày qua" })}</option>
              <option value="month">{t("dashboard.period_month", { defaultValue: "30 Ngày qua" })}</option>
              <option value="year">{t("dashboard.period_year", { defaultValue: "1 Năm qua" })}</option>
            </select>
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mkhe-text/50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-mkhe-border/50 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-mkhe-text/60 font-medium">{t("dashboard.total_revenue", { defaultValue: "Tổng doanh thu" })}</p>
            <h3 className="text-2xl font-bold text-mkhe-text mt-1">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0"></div>
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 z-10">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-sm text-red-600/80 font-medium">{t("dashboard.low_stock_alert", { defaultValue: "Cảnh báo hết hàng" })}</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">
              {lowStockProducts.length} <span className="text-sm font-normal text-red-500">{t("dashboard.products", { defaultValue: "sản phẩm" })}</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
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
                name={t("dashboard.revenue", { defaultValue: "Doanh thu" })} 
                stroke="#C6A87C" 
                strokeWidth={3}
                activeDot={{ r: 8, fill: "#C6A87C", stroke: "#fff", strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Products */}
        <div className="bg-white rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-mkhe-text mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-mkhe-primary" />
            {t("dashboard.top_products", { defaultValue: "Top 5 Bán chạy nhất" })}
          </h2>
          
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 p-3 hover:bg-mkhe-border/10 rounded-xl transition-colors">
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
        <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t("dashboard.low_stock_list", { defaultValue: "Cần nhập hàng khẩn cấp (< 10)" })}
          </h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="flex items-center gap-4 p-3 bg-red-50/50 hover:bg-red-50 rounded-xl transition-colors border border-red-100">
                <img 
                  src={getImageUrl(product.images?.[0])} 
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-red-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-red-900 truncate">{product.name}</p>
                  <p className="text-xs text-red-600/70">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 shadow-sm">
                    {t("dashboard.stock", { defaultValue: "Tồn:" })} {product.stock}
                  </div>
                </div>
              </div>
            ))}
            
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-red-600/50 text-sm">
                {t("dashboard.no_data", { defaultValue: "Chưa có dữ liệu" })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart: Revenue by Category */}
        <div className="bg-white rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-mkhe-text mb-6">Cơ cấu Doanh thu (Làng nghề)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
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
        <div className="bg-white rounded-2xl p-6 border border-mkhe-border/50 shadow-sm">
          <h2 className="text-lg font-bold text-mkhe-text mb-6">Tình trạng Đơn hàng</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderStatusData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#888', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" name="Số đơn hàng" radius={[6, 6, 0, 0]}>
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFeature;
