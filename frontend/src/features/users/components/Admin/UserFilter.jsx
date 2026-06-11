import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/ui/Dropdown";

const UserFilter = ({
  searchInput,
  setSearchInput,
  roleFilter,
  handleRoleChange,
  handleSearch,
}) => {
  const { t } = useTranslation("admin");

  const roles = ["Customer", "Staff", "Admin"];
  const roleOptions = [
    { value: "", label: t("roles.all") },
    ...roles.map((role) => ({
      value: role,
      label: t(`roles.${role.toLowerCase()}`),
    })),
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
        className="w-full md:w-80"
        triggerClassName="h-10 px-3 rounded"
        optionClassName="text-sm"
      />
    </div>
  );
};

export default UserFilter;
