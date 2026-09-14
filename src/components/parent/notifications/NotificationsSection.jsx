import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellRing,
  GraduationCap,
  LoaderCircle,
  Settings,
  Trash2,
} from "lucide-react";
import NotificationCard from "./NotificationCard";
import {
  getNotifications,
  setNotificationReadStatus,
  markAllNotificationsRead,
  deleteNotification,
} from "../../../services/APIService";
import {
  getNotificationChatState,
  getNotificationTarget,
} from "../../../utils/notificationTarget";
import {
  getNotificationPresentation,
  extractNotificationList,
  NOTIFICATION_RECEIVED_EVENT,
} from "../../../utils/notificationTypes";

const tabs = [
  { key: "all", label: "الكل", icon: Bell },
  { key: "unread", label: "غير مقروءة", icon: BellRing },
  { key: "academic", label: "الأكاديمية", icon: GraduationCap },
  { key: "system", label: "النظام والإدارة", icon: Settings },
];

const NotificationsSection = ({ onStatsUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingRead, setDeletingRead] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      const list = extractNotificationList(res.data);
      setNotifications(list);
      onStatsUpdate?.(list);
    } catch {
      setError("فشل في تحميل الإشعارات");
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
      await setNotificationReadStatus(notification._id ?? notification.id, nextRead);
      const updated = notifications.map((n) =>
        (n._id ?? n.id) === (notification._id ?? notification.id)
          ? { ...n, isRead: nextRead }
          : n,
      );
      setNotifications(updated);
      onStatsUpdate?.(updated);
    } catch {
      setError("فشل في تحديث حالة الإشعار");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      onStatsUpdate?.(updated);
    } catch {
      setError("فشل في تعليم الكل كمقروء");
    }
  };

  const handleOpen = async (notification) => {
    if (!notification.isRead) await handleToggleRead(notification);
    const target = getNotificationTarget(notification, "parent");
    if (target) {
      navigate(target, { state: getNotificationChatState(notification) });
    }
  };

  const handleDelete = async (notification) => {
    try {
      await deleteNotification(notification._id ?? notification.id);
      const id = notification._id ?? notification.id;
      const updated = notifications.filter((n) => (n._id ?? n.id) !== id);
      setNotifications(updated);
      onStatsUpdate?.(updated);
    } catch {
      setError("فشل في حذف الإشعار");
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
        deleteNotification(notification._id ?? notification.id),
      ),
    );
    const deletedIds = new Set(
      readNotifications
        .filter((_, index) => results[index].status === "fulfilled")
        .map((notification) => notification._id ?? notification.id),
    );
    const updated = notifications.filter(
      (notification) => !deletedIds.has(notification._id ?? notification.id),
    );
    setNotifications(updated);
    onStatsUpdate?.(updated);
    if (deletedIds.size !== readNotifications.length)
      setError("تعذر حذف بعض الإشعارات المقروءة");
    setDeletingRead(false);
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "academic") return n.type === "academic";
    if (activeTab === "system") return n.type !== "academic";
    return true;
  });

  return (
    <div
      dir="rtl"
      className="w-full bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E5E5]"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[16px] font-medium text-[#1F2937]">
          جميع الإشعارات
        </h2>
        <div className="flex items-center gap-3">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="text-[13px] text-[#123C91] hover:underline"
            >
              تعليم الكل كمقروء
            </button>
          )}
          {notifications.some((n) => n.isRead) && (
            <button
              type="button"
              onClick={handleDeleteRead}
              disabled={deletingRead}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-[13px] font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
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

      <p className="text-[14px] sm:text-[16px] text-[#6B7280] mb-5">
        تصفية وإدارة الإشعارات حسب النوع
      </p>

      <div className="w-full bg-[#EAF4FF] rounded-full p-1 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-1">
        {tabs.map(({ icon: Icon, key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-center gap-1 py-2 px-2 rounded-full text-[12px] sm:text-[14px] font-medium transition-all ${
              activeTab === key
                ? "bg-white text-[#123C91] shadow-sm"
                : "text-[#1F2937]"
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-[#6B7280]">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-[#6B7280]">لا توجد إشعارات</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const presentation = getNotificationPresentation(n, "ar");
            return (
            <NotificationCard
              key={n._id ?? n.id}
              title={presentation.title}
              description={presentation.description}
              time={new Date(n.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              type={presentation.category}
              kind={presentation.kind}
              isRead={n.isRead}
              onToggleRead={() => handleToggleRead(n)}
              onOpen={
                getNotificationTarget(n, "parent")
                  ? () => handleOpen(n)
                  : undefined
              }
              onDelete={() => handleDelete(n)}
            />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
