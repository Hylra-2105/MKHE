import React, { useState } from "react";
import { Filter } from "lucide-react";
import ShopFilters from "./ShopFilters";
import { useTranslation } from "react-i18next";

const ShopLayout = ({ children, filters, onFilterChange }) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDesktopFilterOpen, setIsDesktopFilterOpen] = useState(true);
  const { t } = useTranslation("product");

  return (
    <div className="min-h-screen bg-mkhe-bg flex flex-col font-sans text-mkhe-text transition-colors duration-300">
      {/* HEADER SECTION */}
      <div className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1400px] w-full mx-auto text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-serif text-mkhe-primary mb-4 font-light tracking-wide">
          {t("shop.layout.header_title")}
        </h1>
        <p className="text-sm md:text-base text-mkhe-text/60 max-w-2xl font-light tracking-wide">
          {t("shop.layout.header_subtitle")}
        </p>
      </div>

      {/* CỘT BỘ LỌC (DESKTOP) & GRID (ALL) */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex items-start gap-12 transition-all duration-300">
        
        {/* SIDEBAR DESKTOP */}
        {isDesktopFilterOpen && (
          <aside className="hidden lg:block w-72 shrink-0 sticky top-24 h-[calc(100vh-8rem)] bg-transparent border-r border-mkhe-border/10 pr-4 animate-in slide-in-from-left-4 fade-in duration-300">
            <ShopFilters filters={filters} onFilterChange={onFilterChange} onCloseMobile={() => setIsDesktopFilterOpen(false)} />
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full flex flex-col min-h-0">
          {/* HEADER FILTER BUTTONS */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif text-mkhe-primary lg:hidden">{t("shop.layout.mobile_products")}</h2>
            {/* Dành không gian trống cho Desktop nếu cần */}
            <div className="hidden lg:block"></div>
            <button 
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsDesktopFilterOpen(!isDesktopFilterOpen);
                } else {
                  setIsMobileFilterOpen(true);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-mkhe-primary text-white rounded-full text-sm font-medium transition-transform active:scale-95 shadow-md cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>{t("shop.layout.mobile_filter")}</span>
            </button>
          </div>

          {/* GRID */}
          <div className="flex-1">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { isDesktopFilterOpen });
              }
              return child;
            })}
          </div>
        </main>
      </div>

      {/* DRAWER MOBILE FILTER (MOBILE ONLY) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileFilterOpen(false)}
          ></div>
          <div className="relative w-4/5 max-w-sm bg-mkhe-bg h-full shadow-2xl animate-in slide-in-from-left duration-300">
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
