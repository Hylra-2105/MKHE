import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Check } from "lucide-react";

const UserFilter = ({
  searchInput,
  setSearchInput,
  roleFilter,
  handleRoleChange,
  handleSearch,
}) => {
  const { t } = useTranslation("admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mảng roles để map cho gọn
  const roles = ["Customer", "Staff", "Admin"];

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedRoleLabel = roleFilter
    ? t(`roles.${roleFilter.toLowerCase()}`)
    : t("roles.all");

  return (
    <div className="bg-mkhe-bg p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-4 border border-mkhe-border/30">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder={t("filter.placeholder")}
          className="w-full bg-transparent border border-mkhe-border/50 text-mkhe-text p-2 rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-mkhe-primary text-white px-6 py-2 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold"
        >
          {t("filter.search")}
        </button>
      </form>

      {/* Custom Dropdown */}
      <div className="relative w-80" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-transparent border border-mkhe-border/50 text-mkhe-text p-2 cursor-pointer rounded focus:outline-none focus:border-mkhe-primary transition-colors flex justify-between items-center hover:border-mkhe-border"
        >
          <span>{selectedRoleLabel}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-full bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl py-2 z-50">
            <button
              onClick={() => {
                handleRoleChange({ target: { value: "" } });
                setIsDropdownOpen(false);
              }}
              className={`w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-sm text-left flex justify-between items-center cursor-pointer transition-colors ${
                roleFilter === ""
                  ? "text-mkhe-primary hover:bg-mkhe-primary/10 font-semibold"
                  : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
              }`}
            >
              <span>{t("roles.all")}</span>
              {roleFilter === "" && <Check className="w-4 h-4" />}
            </button>

            {roles.map((role) => (
              <button
                key={role}
                onClick={() => {
                  handleRoleChange({ target: { value: role } });
                  setIsDropdownOpen(false);
                }}
                className={`w-[calc(100%-16px)] mx-2 px-3 py-2 rounded-md text-sm text-left flex justify-between items-center cursor-pointer transition-colors ${
                  roleFilter === role
                    ? "text-mkhe-primary hover:bg-mkhe-primary/10 font-semibold"
                    : "opacity-80 hover:opacity-100 hover:bg-mkhe-primary/10"
                }`}
              >
                <span>{t(`roles.${role.toLowerCase()}`)}</span>
                {roleFilter === role && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFilter;
