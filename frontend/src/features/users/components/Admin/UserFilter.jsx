import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/ui/Dropdown";
import { LayoutGrid, List as ListIcon } from "lucide-react";

const UserFilter = ({
  searchInput,
  setSearchInput,
  roleFilter,
  handleRoleChange,
  statusFilter,
  handleStatusChange,
  handleSearch,
  viewMode,
  setViewMode,
}) => {
  const { t } = useTranslation("admin");

  const roles = ["Customer", "Enterprise", "Staff", "Admin"];
  const roleOptions = [
    { value: "", label: t("roles.all") },
    ...roles.map((role) => ({
      value: role,
      label: t(`roles.${role.toLowerCase()}`),
    })),
  ];

  const statusOptions = [
    { value: "", label: t("filter.all_status", { defaultValue: "Tất cả trạng thái" }) },
    { value: "active", label: t("filter.active", { defaultValue: "Hoạt động" }) },
    { value: "blocked", label: t("filter.blocked", { defaultValue: "Bị khóa" }) },
  ];

  return (
    <div className="bg-mkhe-bg p-3 md:p-4 rounded shadow mb-6 flex flex-col md:flex-row md:items-center gap-4 border border-mkhe-border/30">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
        <input
          type="text"
          placeholder={t("filter.placeholder")}
          className="w-full h-10 px-3 bg-transparent border border-mkhe-border/50 text-mkhe-text rounded focus:outline-none focus:border-mkhe-primary transition-colors"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button
          type="submit"
          className="h-10 w-40 bg-mkhe-primary text-white px-6 cursor-pointer rounded hover:opacity-90 transition-opacity font-semibold"
        >
          {t("filter.search")}
        </button>
      </form>

      <Dropdown
        value={roleFilter}
        options={roleOptions}
        onChange={(val) => handleRoleChange({ target: { value: val } })}
        placeholder={t("roles.all")}
        className="w-full md:w-48"
        triggerClassName="h-10 px-3 rounded"
        optionClassName="text-sm"
      />

      <Dropdown
        value={statusFilter}
        options={statusOptions}
        onChange={(val) => handleStatusChange({ target: { value: val } })}
        placeholder={t("filter.all_status", { defaultValue: "Tất cả trạng thái" })}
        className="w-full md:w-48"
        triggerClassName="h-10 px-3 rounded"
        optionClassName="text-sm"
      />

      {/* View Mode Toggle */}
      <div className="flex items-center border border-mkhe-border/50 rounded h-10 overflow-hidden shrink-0 ml-auto md:ml-0">
        <button
          onClick={() => setViewMode("list")}
          className={`px-3 h-full flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-mkhe-primary/20 text-mkhe-primary" : "text-mkhe-text/60 hover:bg-mkhe-border/30 hover:text-mkhe-text"}`}
          title="Danh sách"
        >
          <ListIcon className="w-5 h-5" />
        </button>
        <div className="w-[1px] h-full bg-mkhe-border/50"></div>
        <button
          onClick={() => setViewMode("grid")}
          className={`px-3 h-full flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-mkhe-primary/20 text-mkhe-primary" : "text-mkhe-text/60 hover:bg-mkhe-border/30 hover:text-mkhe-text"}`}
          title="Lưới"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default UserFilter;
