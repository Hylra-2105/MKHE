import { create } from "zustand";
import axiosInstance from "@/api/axiosClient";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const res = await axiosInstance.get("/notifications");
      if (res.data?.success) {
        set({
          notifications: res.data.data.data,
          unreadCount: res.data.data.unreadCount,
          loading: false,
        });
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
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
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
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      }
    } catch (error) {
      console.error("Lỗi mark all as read:", error);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
