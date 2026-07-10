const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'features', 'b2b', 'components', 'B2BDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add Search and Filter icon to lucide-react import
content = content.replace(/import { Loader2, PackageSearch, Plus, LayoutGrid, List } from "lucide-react";/, 'import { Loader2, PackageSearch, Plus, LayoutGrid, List, Search, Filter } from "lucide-react";');

// 2. Add states for search and filter
content = content.replace(/const \[viewMode, setViewMode\] = useState\("table"\);/, `const [viewMode, setViewMode] = useState("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");`);

// 3. Add filteredOrders calculation before return
content = content.replace(/  if \(loading\) {/, `  const filteredOrders = orders.filter(order => {
    const matchSearch = order.productOrService?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? order.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  if (loading) {`);

// 4. Update the render logic: add filter UI
content = content.replace(/      <div className="flex justify-between items-center">/, `      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mkhe-text/40" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm/dịch vụ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-mkhe-bg border border-mkhe-border/40 rounded-lg text-sm text-mkhe-text focus:outline-none focus:border-mkhe-primary transition-colors"
            />
          </div>
          <div className="relative min-w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-mkhe-bg border border-mkhe-border/40 rounded-lg text-sm text-mkhe-text focus:outline-none focus:border-mkhe-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending_quote">Chờ báo giá</option>
              <option value="negotiating">Đang đàm phán</option>
              <option value="confirmed">Đã chốt</option>
              <option value="in_production">Đang sản xuất</option>
              <option value="delivered">Đã giao</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mkhe-text/40 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="hidden sm:flex items-center bg-mkhe-border/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={\`p-1.5 rounded-md transition-colors cursor-pointer \${viewMode === "table" ? "bg-mkhe-input shadow-sm text-mkhe-primary" : "text-mkhe-text/50 hover:text-mkhe-text"}\`}
              title="Xem dạng bảng"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={\`p-1.5 rounded-md transition-colors cursor-pointer \${viewMode === "grid" ? "bg-mkhe-input shadow-sm text-mkhe-primary" : "text-mkhe-text/50 hover:text-mkhe-text"}\`}
              title="Xem dạng lưới"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
          <Link 
            to="/b2b/request" 
            className="flex items-center gap-2 bg-mkhe-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-mkhe-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Tạo yêu cầu mới</span>
          </Link>
        </div>
      </div>
      <div className="hidden">`);
// Remove the old header logic up to {orders.length
content = content.replace(/      <div className="hidden">[\s\S]*?\{orders\.length === 0 \? \(/, `{filteredOrders.length === 0 ? (`);

// 5. Replace orders.map with filteredOrders.map
content = content.replace(/\{orders\.map/g, '{filteredOrders.map');

// 6. Change bg-mkhe-bg to bg-mkhe-primary/5 for table and cards to stand out
content = content.replace(/<div className="bg-mkhe-bg rounded-xl border border-mkhe-border\/30 p-5 shadow-sm hover:shadow-md hover:border-mkhe-primary\/50 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden">/g, '<div className="bg-mkhe-primary/5 rounded-xl border border-mkhe-border/30 p-5 shadow-sm hover:shadow-md hover:border-mkhe-primary/50 transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden">');

content = content.replace(/<div className="bg-mkhe-bg border border-mkhe-border\/30 rounded-xl overflow-hidden shadow-sm">/g, '<div className="bg-mkhe-primary/5 border border-mkhe-border/30 rounded-xl overflow-hidden shadow-sm">');


fs.writeFileSync(filePath, content);
console.log("Updated B2BDashboard.jsx successfully!");
