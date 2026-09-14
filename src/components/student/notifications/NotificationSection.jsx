import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Trash2 } from "lucide-react";
import NotificationCard from "./NotificationCard";
import {
  getNotificationPresentation,
  extractNotificationList,
  NOTIFICATION_RECEIVED_EVENT,
} from "../../../utils/notificationTypes";
import {
  getNotificationChatState,
  getNotificationTarget,
} from "../../../utils/notificationTarget";
import {
  getNotifications,
  setNotificationReadStatus,
  markAllNotificationsRead,
  deleteNotification,
} from "../../../services/APIService"; // عدّل المسار حسب مكانه عندك

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return date.toLocaleDateString("ar-EG");
};

const mapNotification = (n) => {
  const presentation = getNotificationPresentation(n, "ar");
  return {
    id: n._id ?? n.id,
    title: presentation.title,
    description: presentation.description,
    time: formatRelativeTime(n.createdAt),
    type: presentation.category,
    kind: presentation.kind,
    isRead: !!n.isRead,
    raw: n,
  };
};

const NotificationsSection = ({ onStatsUpdate }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deletingRead, setDeletingRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getNotifications();
      const mapped = extractNotificationList(data).map(mapNotification);
      setNotifications(mapped);
      onStatsUpdate?.(mapped);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [onStatsUpdate]);

  useEffect(() => {
    const timer = window.setTimeout(fetchNotifications, 0);
    return () => window.clearTimeout(timer);
  }, [fetchNotifications]);

  useEffect(() => {
    window.addEventListener(NOTIFICATION_RECEIVED_EVENT, fetchNotifications);
    return () => window.removeEventListener(NOTIFICATION_RECEIVED_EVENT, fetchNotifications);
  }, [fetchNotifications]);

  const handleToggleRead = async (notification) => {
    const nextRead = !notification.isRead;
    try {
      await setNotificationReadStatus(notification.id, nextRead);
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: nextRead } : n,
        );
        onStatsUpdate?.(updated);
        return updated;
      });
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.isRead) await handleToggleRead(notification);
    const target = getNotificationTarget(notification.raw, "student");
    if (target) {
      navigate(target, { state: getNotificationChatState(notification.raw) });
    }
  };

  const handleDelete = async (notification) => {
    try {
      await deleteNotification(notification.id);
      setNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== notification.id);
        onStatsUpdate?.(updated);
        return updated;
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setError(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, isRead: true }));
        onStatsUpdate?.(updated);
        return updated;
      });
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleDeleteRead = async () => {
    const readNotifications = notifications.filter(
      (notification) => notification.isRead,
    );
    if (!readNotifications.length || deletingRead) return;
    setDeletingRead(true);
    const results = await Promise.allSettled(
      readNotifications.map((notification) =>
        deleteNotification(notification.id),
      ),
    );
    const deletedIds = new Set(
      readNotifications
        .filter((_, index) => results[index].status === "fulfilled")
        .map((notification) => notification.id),
    );
    setNotifications((prev) => {
      const updated = prev.filter(
        (notification) => !deletedIds.has(notification.id),
      );
      onStatsUpdate?.(updated);
      return updated;
    });
    if (deletedIds.size !== readNotifications.length)
      setError(new Error("تعذر حذف بعض الإشعارات المقروءة"));
    setDeletingRead(false);
  };

  const filters = [
    { id: "all", label: "الكل" },
    { id: "unread", label: "غير مقروءة" },
    { id: "academic", label: "أكاديمية" },
    { id: "system", label: "عامة" },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                px-3 py-1.5 rounded-lg text-[12.5px] sm:text-[13px] font-medium transition-colors
                ${
                  filter === f.id
                    ? "bg-[#123C91] text-white [&_svg]:text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="text-[12.5px] sm:text-[13px] text-[#123C91] font-medium hover:underline"
          >
            تحديد الكل كمقروء
          </button>
          {notifications.some((notification) => notification.isRead) && (
            <button
              type="button"
              onClick={handleDeleteRead}
              disabled={deletingRead}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[12.5px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              {deletingRead ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              حذف المقروءة
            </button>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-center text-[#9CA3AF] text-[13px] py-8">
          جاري التحميل...
        </p>
      )}

      {!loading && error && (
        <p className="text-center text-[#E54848] text-[13px] py-8">
          حدث خطأ أثناء تحميل الإشعارات
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {filtered.length ? (
            filtered.map((n) => (
              <NotificationCard
                key={n.id}
                title={n.title}
                description={n.description}
                time={n.time}
                type={n.type}
                kind={n.kind}
                isRead={n.isRead}
                onToggleRead={() => handleToggleRead(n)}
                onOpen={
                  getNotificationTarget(n.raw, "student")
                    ? () => handleOpen(n)
                    : undefined
                }
                onDelete={() => handleDelete(n)}
              />
            ))
          ) : (
            <p className="text-center text-[#9CA3AF] text-[13px] py-8">
              لا توجد إشعارات لعرضها
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
