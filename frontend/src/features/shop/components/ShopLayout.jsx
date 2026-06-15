import React, { useState } from "react";
import { Filter } from "lucide-react";
import ShopFilters from "./ShopFilters";

const ShopLayout = ({ children, filters, onFilterChange }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-[#2A2A2A]">
      {/* HEADER SECTION */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] w-full mx-auto text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-serif text-mkhe-primary mb-4 font-light tracking-wide">
          Bộ sưu tập Di sản
        </h1>
        <p className="text-sm md:text-base text-mkhe-text/60 max-w-2xl font-light tracking-wide">
          Mỗi tác phẩm là một câu chuyện văn hóa, được dệt nên từ đôi bàn tay nghệ nhân và linh hồn của những làng nghề trăm tuổi.
        </p>
      </div>

      {/* CỘT BỘ LỌC (DESKTOP) & GRID (ALL) */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex items-start gap-12">
        
        {/* SIDEBAR DESKTOP */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 h-[calc(100vh-8rem)] bg-transparent border-r border-mkhe-border/10 pr-4">
          <ShopFilters filters={filters} onFilterChange={onFilterChange} onCloseMobile={() => {}} />
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full flex flex-col min-h-0">
          {/* HEADER MOBILE FILTER */}
          <div className="flex items-center justify-between lg:hidden mb-8">
            <h2 className="text-xl font-serif text-mkhe-primary">Sản phẩm</h2>
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-mkhe-primary text-white rounded-full text-sm font-medium transition-transform active:scale-95 shadow-md"
            >
              <Filter className="w-4 h-4" />
              <span>Lọc</span>
            </button>
          </div>

          {/* GRID */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>

      {/* DRAWER MOBILE FILTER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="absolute inset-0 bg-[#2A2A2A]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          <div className="relative w-4/5 max-w-sm bg-[#FDFBF7] h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <ShopFilters 
              filters={filters} 
              onFilterChange={onFilterChange} 
              onCloseMobile={() => setIsMobileFilterOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopLayout;
