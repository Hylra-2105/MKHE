import { create } from "zustand";
import axiosInstance from "@/api/axiosClient";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  systemUnreadCount: 0,
  loading: false,
  page: 1,
  hasMore: true,
  tab: "all", // "all" | "unread" | "system"

  setTab: (tab) => {
    set({ tab, notifications: [] });
    get().fetchNotifications({ page: 1, tab });
  },

  fetchUnreadCounts: async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread-count");
      if (res.data?.success) {
        set({ 
          unreadCount: res.data.data.userUnread,
          systemUnreadCount: res.data.data.systemUnread 
        });
      }
    } catch (error) {
      console.error("Lỗi fetch unread counts:", error);
    }
  },

  fetchNotifications: async ({ page = 1, tab = get().tab } = {}) => {
    try {
      set({ loading: true });
      const limit = 5;
      
      let endpoint = `/notifications?page=${page}&limit=${limit}`;
      if (tab === "unread") {
        endpoint += `&unreadOnly=true`;
      } else if (tab === "system") {
        endpoint = `/notifications/admin?page=${page}&limit=${limit}`;
      } else if (tab === "system_unread") {
        endpoint = `/notifications/admin?page=${page}&limit=${limit}&unreadOnly=true`;
      }

      const res = await axiosInstance.get(endpoint);

      // Prevent race conditions: if tab changed during fetch, ignore this response
      if (get().tab !== tab) return;
      
      if (res.data?.success) {
        const newNotifications = res.data.data.data;
        const totalPages = res.data.data.pagination.totalPages;
        const currentUnreadCount = res.data.data.unreadCount;

        set((state) => ({
          notifications: page === 1 ? newNotifications : [...state.notifications, ...newNotifications],
          ...(tab === "system" || tab === "system_unread" ? { systemUnreadCount: currentUnreadCount } : { unreadCount: currentUnreadCount }),
          page,
          hasMore: page < totalPages,
          loading: false,
          tab,
        }));
      }
    } catch (error) {
      console.error("Lỗi fetch notifications:", error);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      const res = await axiosInstance.put(`/notifications/${id}/read`);
      if (res.data?.success) {
        set((state) => {
          let updatedList = state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          );
          if (state.tab === "system" || state.tab === "system_unread") {
             // Admin notification
             let systemList = updatedList;
             if (state.tab === "system_unread") {
               systemList = systemList.filter(n => n._id !== id || !n.isRead);
             }
             return {
               notifications: systemList,
               systemUnreadCount: Math.max(0, state.systemUnreadCount - 1),
             };
          }

          if (state.tab === "unread") {
             updatedList = updatedList.filter(n => n._id !== id || !n.isRead);
          }
          return {
            notifications: updatedList,
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      }
    } catch (error) {
      console.error("Lỗi mark as read:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await axiosInstance.put("/notifications/read-all");
      if (res.data?.success) {
        set((state) => ({
          notifications: state.tab === "unread" ? [] : state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
          systemUnreadCount: 0,
        }));
      }
    } catch (error) {
      console.error("Lỗi mark all as read:", error);
    }
  },

  optimisticDelete: (id) => {
    set((state) => {
      const notifToHide = state.notifications.find(n => n._id === id);
      if (!notifToHide) return state;
      return {
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: !notifToHide.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  undoDelete: (notification) => {
    set((state) => {
      const newNotifs = [...state.notifications, notification].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return {
        notifications: newNotifs,
        unreadCount: !notification.isRead ? state.unreadCount + 1 : state.unreadCount,
      };
    });
  },

  deleteNotification: async (id) => {
    try {
      await axiosInstance.delete(`/notifications/${id}`);
    } catch (error) {
      console.error("Lỗi delete notification:", error);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      const isAdminNotif = notification.isAdmin;
      let newSystemCount = state.systemUnreadCount;
      let newUserCount = state.unreadCount;
      let newNotifs = [...state.notifications];

      if (isAdminNotif) {
        newSystemCount += 1;
        if (state.tab === "system") {
          newNotifs = [notification, ...state.notifications];
        }
      } else {
        newUserCount += 1;
        if (state.tab === "all" || (state.tab === "unread" && !notification.isRead)) {
          newNotifs = [notification, ...state.notifications];
        }
      }

      return {
        notifications: newNotifs,
        systemUnreadCount: newSystemCount,
        unreadCount: newUserCount,
      };
    });
  },
}));
