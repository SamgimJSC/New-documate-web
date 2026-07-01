import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, BellOff } from "lucide-react";
import {
  notificationService,
  type Notification,
} from "../../services/notificationService";
import "./NotificationPanel.css";

interface Props {
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 8) return `${d}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

const NotificationPanel: React.FC<Props> = ({ onClose, onUnreadCountChange }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const load = useCallback(async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
      onUnreadCountChange(data.filter((n) => !n.isRead).length);
    } catch {
      // 인증 안 된 상태 등 조용히 실패
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n.notificationId);
        setNotifications((prev) =>
          prev.map((item) =>
            item.notificationId === n.notificationId
              ? { ...item, isRead: true }
              : item,
          ),
        );
        onUnreadCountChange(unreadCount - 1);
      } catch {}
    }
    if (n.documentId) {
      onClose();
      navigate(`/documents/${n.documentId}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadCountChange(0);
    } catch {}
  };

  const handleDelete = async (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      const next = notifications.filter(
        (n) => n.notificationId !== notificationId,
      );
      setNotifications(next);
      onUnreadCountChange(next.filter((n) => !n.isRead).length);
    } catch {}
  };

  return (
    <>
      <div className="notif-overlay" onClick={onClose} />
      <div className="notif-panel" role="dialog" aria-label="알림">
        <div className="notif-panel__header">
          <span className="notif-panel__title">알림</span>
          <button
            className="notif-panel__read-all"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            전체 읽음
          </button>
        </div>

        <div className="notif-panel__list">
          {loading ? (
            <div className="notif-panel__empty">불러오는 중...</div>
          ) : notifications.length === 0 ? (
            <div className="notif-panel__empty">
              <BellOff size={32} strokeWidth={1.5} />
              알림이 없습니다
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.notificationId}
                className={`notif-item${n.isRead ? "" : " notif-item--unread"}`}
                onClick={() => handleNotificationClick(n)}
              >
                <span
                  className={`notif-item__dot${n.isRead ? " notif-item__dot--read" : ""}`}
                />
                <div className="notif-item__content">
                  <div className="notif-item__title">{n.title}</div>
                  {n.body && (
                    <div className="notif-item__body">{n.body}</div>
                  )}
                  <div className="notif-item__time">{timeAgo(n.sentAt)}</div>
                </div>
                <button
                  className="notif-item__delete"
                  aria-label="삭제"
                  onClick={(e) => handleDelete(e, n.notificationId)}
                >
                  <X size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
