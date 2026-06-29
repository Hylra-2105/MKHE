import { create } from "zustand";
import axiosInstance from "@/api/axiosClient";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  page: 1,
  hasMore: true,
  tab: "all", // "all" | "unread"

  setTab: (tab) => {
    set({ tab });
    get().fetchNotifications({ page: 1, tab });
  },

  fetchNotifications: async ({ page = 1, tab = get().tab } = {}) => {
    try {
      set({ loading: true });
      const limit = 5;
      const unreadOnly = tab === "unread";
      const res = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
      
      if (res.data?.success) {
        const newNotifications = res.data.data.data;
        const totalPages = res.data.data.pagination.totalPages;
        const currentUnreadCount = res.data.data.unreadCount;

        set((state) => ({
          notifications: page === 1 ? newNotifications : [...state.notifications, ...newNotifications],
          unreadCount: currentUnreadCount,
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
          // Remove from list if in "unread" tab
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
    set((state) => ({
      notifications: state.tab === "all" || !notification.isRead ? [notification, ...state.notifications] : state.notifications,
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
