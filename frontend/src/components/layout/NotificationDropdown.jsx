import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, Package, X } from "lucide-react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function getRelativeTime(date, lang, t) {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const daysDifference = Math.round((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const hoursDifference = Math.round((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60));
  const minutesDifference = Math.round((new Date(date).getTime() - new Date().getTime()) / (1000 * 60));

  if (Math.abs(daysDifference) > 0) return rtf.format(daysDifference, 'day');
  if (Math.abs(hoursDifference) > 0) return rtf.format(hoursDifference, 'hour');
  if (Math.abs(minutesDifference) > 0) return rtf.format(minutesDifference, 'minute');
  return t("notifications.time_just_now", { defaultValue: "vừa xong" });
}

const translateNotificationTitle = (title, t) => {
  const map = {
    "Đặt hàng thành công": "notifications.title.order_placed",
    "Thanh toán thành công": "notifications.title.payment_success",
    "Đơn hàng đã được xác nhận": "notifications.title.order_confirmed",
    "Đơn hàng đang giao": "notifications.title.order_delivering",
    "Giao hàng thành công": "notifications.title.order_completed",
    "Đơn hàng đã hủy": "notifications.title.order_cancelled",
    "Lưu mã giảm giá thành công": "notifications.title.voucher_saved",
    "Chúc mừng trúng thưởng!": "notifications.title.lucky_wheel_won"
  };
  return map[title] ? t(map[title]) : title;
};

const translateNotificationMessage = (message, title, t) => {
  const orderMatch = message.match(/((?:ORD-|MKHE-)[A-Z0-9]+)/);
  const orderCode = orderMatch ? orderMatch[1] : "";
  
  if (title === "Lưu mã giảm giá thành công") {
     const voucherMatch = message.match(/mã giảm giá ([\w\d]+)/);
     const voucherCode = voucherMatch ? voucherMatch[1] : "";
     return t("notifications.message.voucher_saved", { code: voucherCode, defaultValue: message });
  }

  if (title === "Chúc mừng trúng thưởng!") {
     const voucherMatch = message.match(/mã giảm giá ([\w\d]+)/);
     const voucherCode = voucherMatch ? voucherMatch[1] : "";
     return t("notifications.message.lucky_wheel_won", { code: voucherCode, defaultValue: message });
  }

  const map = {
    "Đặt hàng thành công": "notifications.message.order_placed",
    "Thanh toán thành công": "notifications.message.payment_success",
    "Đơn hàng đã được xác nhận": "notifications.message.order_confirmed",
    "Đơn hàng đang giao": "notifications.message.order_delivering",
    "Giao hàng thành công": "notifications.message.order_completed",
    "Đơn hàng đã hủy": "notifications.message.order_cancelled"
  };

  if (map[title] && orderCode) {
    return t(map[title], { orderCode, defaultValue: message });
  }

  return message;
};

export default function NotificationDropdown() {
  const { t, i18n } = useTranslation("header");
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);
    
    // Nếu là thông báo đơn hàng thì chuyển qua trang Đơn hàng
    if (notif.orderId || notif.type === "ORDER_STATUS_UPDATE") {
      navigate("/profile?tab=orders");
    }
  };

  if (!user) return null;

  return (
    <div className="relative flex items-center justify-center" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleToggle}
        className="opacity-80 hover:opacity-100 cursor-pointer hover:text-mkhe-primary transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-mkhe-primary text-[#1a110a] text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-80 sm:w-96 bg-mkhe-input border border-mkhe-border rounded-lg shadow-xl z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-mkhe-border">
            <h3 className="font-semibold text-mkhe-text">{t("notifications.header_title", "Thông báo")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-[#bc9c6a] hover:text-[#a08257] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                {t("notifications.mark_all_read", "Đánh dấu đã đọc")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center opacity-60 flex flex-col items-center justify-center text-mkhe-text">
                <Bell className="w-10 h-10 mb-2" />
                <p className="text-sm">{t("notifications.empty", "Bạn chưa có thông báo nào")}</p>
              </div>
            ) : (
              <div className="divide-y divide-mkhe-border/50">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex gap-3 p-4 cursor-pointer transition-colors hover:bg-mkhe-primary/10 ${
                      !notif.isRead ? "bg-mkhe-primary/20" : "bg-transparent"
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${!notif.isRead ? 'bg-mkhe-primary text-[#1a110a]' : 'bg-mkhe-border/30 text-mkhe-text opacity-70'}`}>
                      {notif.type === "ORDER_STATUS_UPDATE" ? <Package className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm text-mkhe-text ${!notif.isRead ? 'font-bold' : ''}`}>
                        {translateNotificationTitle(notif.title, t)}
                      </p>
                      <p className="text-xs text-mkhe-text opacity-70 mt-1 line-clamp-2 leading-relaxed">
                        {translateNotificationMessage(notif.message, notif.title, t)}
                      </p>
                      <p className="text-[11px] text-mkhe-primary mt-2 font-medium">
                        {getRelativeTime(notif.createdAt, i18n.language || 'vi', t)}
                      </p>
                    </div>

                    {/* Unread Dot */}
                    {!notif.isRead && (
                      <div className="flex-shrink-0 mt-2">
                        <div className="w-2 h-2 bg-mkhe-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
