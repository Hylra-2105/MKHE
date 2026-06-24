import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Eye, Edit2 } from "lucide-react";

const isVideoMedia = (url) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg)$/i) || url.includes("video");
};

const getLastNameInitial = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
};

const UserGrid = ({ users, loading, onViewUser, currentUser }) => {
  const { t } = useTranslation("admin");

  return (
    <div className={`relative min-h-[420px] transition-opacity ${loading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-mkhe-bg/50 backdrop-blur-sm pointer-events-none">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-mkhe-primary/20 border-t-mkhe-primary rounded-full"></div>
          </div>
        </div>
      )}

      {!loading && (!users || users.length === 0) ? (
        <div className="flex flex-col justify-center items-center h-48 bg-mkhe-border/5 rounded border border-mkhe-border/30">
          <Users className="w-12 h-12 mb-2 text-mkhe-text/30" />
          <span className="text-mkhe-text/60">{t("table.empty", { defaultValue: "Không có người dùng nào." })}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <div key={user._id} className="bg-mkhe-bg border border-mkhe-primary/40 rounded-xl shadow-[0_0_10px_rgba(197,160,89,0.1)] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(197,160,89,0.25)] relative p-6 items-center text-center">
          
          {/* Badge Trạng Thái */}
          <div className="absolute top-3 left-3">
            {user.isBlocked ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-600 border border-orange-500/30">
                {t("table.status_blocked")}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/30">
                {t("table.status_active")}
              </span>
            )}
          </div>

          {/* Badge Vai trò */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                user.role === "Admin"
                  ? "bg-red-500/10 text-red-600 border-red-500/30"
                  : user.role === "Staff"
                    ? "bg-green-500/10 text-green-600 border-green-500/30"
                    : "bg-blue-500/10 text-blue-600 border-blue-500/30"
              }`}
            >
              {t(`roles.${user.role.toLowerCase()}`)}
            </span>
          </div>

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-mkhe-primary/30 shadow-md mt-4 mb-3">
            {user.avatar && isVideoMedia(user.avatar) ? (
              <video
                src={user.avatar}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${getLastNameInitial(user.name)}&background=random`
                }
                alt="avatar"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <h3 className="font-semibold text-lg text-mkhe-primary line-clamp-1 mb-1">
            {user.name} {currentUser?._id === user._id && <span className="text-mkhe-text/50 text-sm font-normal">({t("table.you", { defaultValue: "Bạn" })})</span>}
          </h3>
          <p className="text-sm text-mkhe-text/70 mb-5 break-all">
            {user.email}
          </p>

          {/* Actions */}
          <div className="mt-auto w-full pt-4 border-t border-mkhe-border/20 flex justify-center">
            <button
              onClick={() => onViewUser(user)}
              className="flex items-center justify-center gap-2 w-full py-2 bg-mkhe-primary/10 text-mkhe-primary hover:bg-mkhe-primary hover:text-white rounded transition-all duration-300 cursor-pointer font-medium text-sm"
            >
              <Eye className="w-4 h-4" />
              {t("table.actions", { defaultValue: "Hành động" })}
            </button>
          </div>

        </div>
      ))}
    </div>
    )}
    </div>
  );
};

export default UserGrid;
