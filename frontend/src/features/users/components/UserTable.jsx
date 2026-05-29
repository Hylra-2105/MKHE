import React from "react";
import { useTranslation } from "react-i18next";
import { getLastNameInitial } from "@/utils/validators";
import { Eye } from "lucide-react";

const UserTable = ({ users, loading, onViewUser }) => {
  const { t } = useTranslation("admin");

  return (
    <div
      className={`bg-mkhe-bg rounded shadow overflow-x-auto border border-mkhe-border/30 min-h-[420px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}
    >
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-mkhe-border/30 text-mkhe-text/70 uppercase text-sm bg-mkhe-primary/5">
            <th className="p-4 font-semibold w-50">{t("table.avatar")}</th>
            <th className="p-4 font-semibold w-1/6">{t("table.name")}</th>
            <th className="p-4 font-semibold w-1/6">{t("table.email")}</th>
            <th className="p-4 font-semibold text-center w-1/4">
              {t("table.role")}
            </th>
            <th className="p-4 font-semibold w-1/6">{t("table.status")}</th>
            <th className="p-4 font-semibold text-center">
              {t("table.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="text-mkhe-text relative">
          {loading && (
            <tr className="absolute inset-0 h-full flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
              <td colSpan="6" className="text-center">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
                </div>
              </td>
            </tr>
          )}
          {!loading && users.length === 0 ? (
            <tr>
              <td colSpan="5" className="p-8 text-center text-mkhe-text/60">
                {t("table.no_user")}
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-mkhe-border/20 hover:bg-mkhe-primary/5 transition-colors"
              >
                <td className="p-4">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${getLastNameInitial(user.name)}&background=random`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-mkhe-border/50 shadow-sm"
                  />
                </td>
                <td className="p-4 font-medium">{user.name}</td>
                <td className="p-4 text-mkhe-text/80 ">{user.email}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === "Admin"
                        ? "bg-red-500/20 text-red-500"
                        : user.role === "Staff"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-blue-500/20 text-blue-500"
                    }`}
                  >
                    {t(`roles.${user.role.toLowerCase()}`)}
                  </span>
                </td>
                <td className="p-4">
                  {user.isBlocked ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-500 border border-gray-500/30">
                      {t("table.status_blocked")}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/30">
                      {t("table.status_active")}
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    <button
                      title={t("table.view")}
                      onClick={() => onViewUser(user)}
                      className="p-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary/20 rounded-full transition-all duration-300 cursor-pointer"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
