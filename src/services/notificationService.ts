import { api } from "./api";

export interface Notification {
  notificationId: string;
  userId: string;
  documentId: string | null;
  category: "DOC" | "SPEND" | "ETC";
  title: string;
  body: string | null;
  isRead: boolean;
  sentAt: string;
}

interface ApiResponse<T> {
  data: T;
}

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>("/notifications");
    return res.data.data;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  },

  async registerDeviceToken(token: string, platform: "WEB" | "IOS" | "ANDROID" = "WEB") {
    const res = await api.post<ApiResponse<{ tokenId: string }>>("/notifications/device-tokens", {
      token,
      platform,
    });
    return res.data.data;
  },
};
