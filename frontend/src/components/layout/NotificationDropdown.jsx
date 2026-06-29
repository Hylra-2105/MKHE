import React, { useEffect, useRef, useState } from "react";
import { Bell, Check, Package, X, Gift, MoreHorizontal, Trash2 } from "lucide-react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

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
    "Chúc mừng trúng thưởng!": "notifications.title.lucky_wheel_won",
    "FLASH_SALE_TITLE": "notifications.title.flash_sale",
    "Sản phẩm Sale Khủng!": "notifications.title.flash_sale",
    "VOUCHER_PUBLISHED_TITLE": "notifications.title.voucher_published",
    "Bạn có mã ưu đãi mới!": "notifications.title.voucher_published",
    "Đơn hàng mới": "notifications.title.admin_order_new",
    "ADMIN_ORDER_NEW": "notifications.title.admin_order_new",
    "Đơn hàng đã thanh toán": "notifications.title.admin_order_paid",
    "ADMIN_ORDER_PAID": "notifications.title.admin_order_paid",
    "Đơn hàng hoàn tất": "notifications.title.admin_order_completed",
    "ADMIN_ORDER_COMPLETED": "notifications.title.admin_order_completed",
    "Cảnh báo tồn kho": "notifications.title.admin_stock_alert",
    "ADMIN_STOCK_ALERT": "notifications.title.admin_stock_alert"
  };
  return map[title] ? t(map[title], { defaultValue: title }) : title;
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

  if (title === "Cảnh báo tồn kho" || title === "ADMIN_STOCK_ALERT") {
     if (message.startsWith("ADMIN_STOCK_ALERT::")) {
       const parts = message.split("::");
       return t("notifications.message.admin_stock_alert", { productName: parts[1], currentStock: parts[2], defaultValue: message });
     }
     const productMatch = message.match(/Sản phẩm (.*?) sắp hết hàng/);
     const stockMatch = message.match(/còn (\d+) cái/);
     const productName = productMatch ? productMatch[1] : "";
     const currentStock = stockMatch ? stockMatch[1] : "";
     return t("notifications.message.admin_stock_alert", { productName, currentStock, defaultValue: message });
  }

  if (title === "FLASH_SALE_TITLE" || title === "Sản phẩm Sale Khủng!" || message.startsWith("FLASH_SALE_MESSAGE::")) {
    const parts = message.split("::");
    const saleMatch = message.match(/Sản phẩm (.*?) đang có chương trình Sale hấp dẫn/);
    let productName = "";
    if (parts.length > 1) {
      productName = parts[1];
    } else if (saleMatch) {
      productName = saleMatch[1];
    }
    return t("notifications.message.flash_sale", { productName, defaultValue: `Sản phẩm ${productName} đang có chương trình Sale hấp dẫn. Đừng bỏ lỡ!` });
  }

  if (title === "VOUCHER_PUBLISHED_TITLE" || title === "Bạn có mã ưu đãi mới!" || message.startsWith("VOUCHER_PUBLISHED_MESSAGE::")) {
    const parts = message.split("::");
    const voucherMatch = message.match(/Mã giảm giá (.*?) đã có sẵn/);
    let voucherCode = "";
    if (parts.length > 1) {
      voucherCode = parts[1];
    } else if (voucherMatch) {
      voucherCode = voucherMatch[1];
    }
    return t("notifications.message.voucher_published", { code: voucherCode, defaultValue: `Mã giảm giá ${voucherCode} đã có sẵn trong ví của bạn.` });
  }

  const map = {
    "Đặt hàng thành công": "notifications.message.order_placed",
    "Thanh toán thành công": "notifications.message.payment_success",
    "Đơn hàng đã được xác nhận": "notifications.message.order_confirmed",
    "Đơn hàng đang giao": "notifications.message.order_delivering",
    "Giao hàng thành công": "notifications.message.order_completed",
    "Đơn hàng đã hủy": "notifications.message.order_cancelled",
    "Đơn hàng mới": "notifications.message.admin_order_new",
    "ADMIN_ORDER_NEW": "notifications.message.admin_order_new",
    "Đơn hàng đã thanh toán": "notifications.message.admin_order_paid",
    "ADMIN_ORDER_PAID": "notifications.message.admin_order_paid",
    "Đơn hàng hoàn tất": "notifications.message.admin_order_completed",
    "ADMIN_ORDER_COMPLETED": "notifications.message.admin_order_completed"
  };

  if (map[title]) {
    let resolvedOrderCode = orderCode;
    if (message.includes("::")) {
      resolvedOrderCode = message.split("::")[1];
    }
    return t(map[title], { orderCode: resolvedOrderCode, defaultValue: message });
  }

  return message;
};

export default function NotificationDropdown() {
  const { t, i18n } = useTranslation("header");
  const { notifications, unreadCount, systemUnreadCount, fetchUnreadCounts, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, optimisticDelete, undoDelete, page, hasMore, loading, tab, setTab } = useNotificationStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showGlobalMenu, setShowGlobalMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();
      if ((user.role === "Admin" || user.role === "Staff") && tab === "all") {
        useNotificationStore.setState({ tab: "system" });
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && isOpen) {
      fetchNotifications({ page: 1, tab });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore clicks inside the dropdown or inside our custom undo toast
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('.undo-toast-container')
      ) {
        setIsOpen(false);
        setActiveMenuId(null);
        setShowGlobalMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveMenuId(null);
      setShowGlobalMenu(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
    }
    setIsOpen(false);
    if (notif.title === "Lưu mã giảm giá thành công" || notif.title === "VOUCHER_PUBLISHED_TITLE" || (notif.message && notif.message.startsWith("VOUCHER_PUBLISHED_MESSAGE::"))) {
      useCartStore.getState().setCartOpen(true);
      return;
    }
    
    if (notif.link) {
      if (notif.isAdmin && notif.orderId && notif.link.includes("/admin/orders")) {
        navigate(notif.link, { state: { openOrderId: notif.orderId } });
      } else if (notif.isAdmin && notif.productId && notif.link.includes("/admin/products")) {
        navigate(notif.link, { state: { openProductId: notif.productId } });
      } else {
        navigate(notif.link);
      }
    } else if (notif.orderId || notif.type === "ORDER_STATUS_UPDATE") {
      if (notif.isAdmin) {
        navigate("/admin/orders", { state: { openOrderId: notif.orderId } });
      } else {
        navigate("/profile?tab=orders");
      }
    } else if (notif.type === "MARKETING") {
      navigate("/shop");
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchNotifications({ page: page + 1, tab });
    }
  };

  const handleDeleteNotification = (notif) => {
    optimisticDelete(notif._id);
    setActiveMenuId(null);

    let isUndone = false;
    toast((tToast) => (
      <div className="flex items-center justify-between w-full gap-4 undo-toast-container">
        <span>{t("notifications.deleted_success", "Đã xóa thông báo")}</span>
        <button 
          onClick={() => {
            isUndone = true;
            toast.dismiss(tToast.id);
            undoDelete(notif);
          }}
          className="text-mkhe-primary font-bold hover:underline cursor-pointer"
        >
          {t("notifications.undo", "Hoàn tác")}
        </button>
      </div>
    ), { duration: 5000, position: 'bottom-left' });

    setTimeout(() => {
      if (!isUndone) {
        deleteNotification(notif._id);
      }
    }, 5000);
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
        {(unreadCount + systemUnreadCount) > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-mkhe-primary text-[#1a110a] text-[10px] font-bold rounded-full flex items-center justify-center">
            {(unreadCount + systemUnreadCount) > 99 ? "99+" : (unreadCount + systemUnreadCount)}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[360px] sm:w-[400px] bg-mkhe-bg border border-mkhe-border rounded-xl shadow-2xl z-50 overflow-visible origin-top-right animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="font-bold text-2xl text-mkhe-text">{t("notifications.header_title", "Thông báo")}</h3>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowGlobalMenu(!showGlobalMenu); setActiveMenuId(null); }}
                className="p-2 hover:bg-mkhe-border/30 rounded-full transition-colors cursor-pointer"
              >
                <MoreHorizontal className="w-5 h-5 text-mkhe-text" />
              </button>
              {/* Global Menu */}
              {showGlobalMenu && (
                <div className="absolute right-0 top-full mt-1 w-max min-w-[200px] bg-mkhe-bg border border-mkhe-border rounded-lg shadow-lg p-1 z-[60]" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => { markAllAsRead(); setShowGlobalMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-mkhe-border/30 text-mkhe-text flex items-center gap-3 cursor-pointer rounded-md transition-colors whitespace-nowrap"
                  >
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{t("notifications.mark_all_read", "Đánh dấu tất cả là đã đọc")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 pb-2 border-b border-mkhe-border/50 overflow-x-auto no-scrollbar whitespace-nowrap">
            {(user.role === "Admin" || user.role === "Staff") && (
              <button 
                onClick={() => setTab("system")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${tab === "system" ? "bg-mkhe-primary/20 text-mkhe-primary" : "hover:bg-mkhe-border/30 text-mkhe-text"}`}
              >
                {t("notifications.tab_system", "Hệ thống")}
                {systemUnreadCount > 0 && (
                  <span className="bg-mkhe-primary text-[#1a110a] text-[10px] px-1.5 py-0.5 rounded-full">
                    {systemUnreadCount}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={() => setTab("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 ${tab === "all" ? "bg-mkhe-primary/20 text-mkhe-primary" : "hover:bg-mkhe-border/30 text-mkhe-text"}`}
            >
              {t("notifications.tab_all", "Tất cả")}
              {unreadCount > 0 && tab !== "system" && (
                <span className="bg-mkhe-primary text-[#1a110a] text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setTab("unread")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors cursor-pointer ${tab === "unread" ? "bg-mkhe-primary/20 text-mkhe-primary" : "hover:bg-mkhe-border/30 text-mkhe-text"}`}
            >
              {t("notifications.tab_unread", "Chưa đọc")}
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[450px] overflow-y-auto pb-4 custom-scrollbar">
            {loading && page === 1 ? (
              <div className="py-10 text-center text-mkhe-text/60 flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-mkhe-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center opacity-60 flex flex-col items-center justify-center text-mkhe-text">
                <Bell className="w-10 h-10 mb-2" />
                <p className="text-sm">{t("notifications.empty", "Bạn chưa có thông báo nào")}</p>
              </div>
            ) : (
              <div className="px-2">
                <div className="flex justify-between items-center px-2 py-2">
                   <span className="font-semibold text-sm text-mkhe-text">{t("notifications.recent", "Trước đó")}</span>
                </div>
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className="relative group flex gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-mkhe-border/20"
                  >
                    {/* Icon */}
                    <div className="relative mt-0.5 flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-mkhe-border/30 text-mkhe-text">
                      {notif.type === "ORDER_STATUS_UPDATE" ? <Package className="w-6 h-6" /> : notif.type === "MARKETING" ? <Gift className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
                      {!notif.isRead && (
                         <div className="absolute -bottom-1 -right-1 bg-mkhe-bg rounded-full p-0.5">
                           <div className="w-3.5 h-3.5 bg-mkhe-primary rounded-full"></div>
                         </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-[15px] text-mkhe-text leading-tight line-clamp-3">
                         {!notif.isRead ? (
                           <strong>{translateNotificationTitle(notif.title, t)}</strong>
                         ) : (
                           <span>{translateNotificationTitle(notif.title, t)}</span>
                         )}
                         <span className="opacity-90 ml-1">
                           {translateNotificationMessage(notif.message, notif.title, t)}
                         </span>
                      </p>
                      <p className={`text-xs mt-1 font-medium ${!notif.isRead ? 'text-mkhe-primary' : 'text-mkhe-text opacity-60'}`}>
                        {getRelativeTime(notif.createdAt, i18n.language || 'vi', t)}
                      </p>
                    </div>

                    {/* Right side interactions */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8 relative">
                       {/* Unread Dot (Right Side) */}
                       {!notif.isRead && (
                         <div className={`w-3 h-3 bg-mkhe-primary rounded-full transition-opacity ${activeMenuId === notif._id ? 'opacity-0' : 'group-hover:opacity-0'}`}></div>
                       )}

                       {/* Options Button */}
                       <button 
                         onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === notif._id ? null : notif._id); setShowGlobalMenu(false); }}
                         className={`absolute p-1.5 hover:bg-mkhe-border/40 bg-mkhe-bg border border-mkhe-border/50 rounded-full transition-opacity shadow-sm cursor-pointer ${activeMenuId === notif._id ? 'opacity-100 z-10' : 'opacity-0 group-hover:opacity-100 z-10'}`}
                       >
                         <MoreHorizontal className="w-4 h-4 text-mkhe-text" />
                       </button>

                       {/* Individual Menu Popover */}
                       {activeMenuId === notif._id && (
                          <div className="absolute right-8 top-0 w-max min-w-[200px] bg-mkhe-bg border border-mkhe-border rounded-lg shadow-lg p-1 z-[60]" onClick={(e) => e.stopPropagation()}>
                            {!notif.isRead && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-mkhe-border/30 text-mkhe-text flex items-center gap-3 cursor-pointer rounded-md transition-colors whitespace-nowrap"
                              >
                                <Check className="w-4 h-4 flex-shrink-0" />
                                <span>{t("notifications.mark_read", "Đánh dấu là đã đọc")}</span>
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-mkhe-border/30 text-mkhe-text flex items-center gap-3 cursor-pointer rounded-md transition-colors whitespace-nowrap"
                            >
                              <Trash2 className="w-4 h-4 flex-shrink-0" />
                              <span>{t("notifications.delete", "Xóa thông báo này")}</span>
                            </button>
                          </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="px-4 mt-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleLoadMore(); }}
                  disabled={loading}
                  className="w-full py-2 bg-mkhe-border/20 hover:bg-mkhe-border/40 text-mkhe-text rounded-lg text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-mkhe-text/30 border-t-mkhe-text rounded-full animate-spin"></div>
                  ) : t("notifications.load_more", "Xem thông báo trước đó")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
