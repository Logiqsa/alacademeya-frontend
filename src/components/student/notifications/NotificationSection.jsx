import React, { useEffect, useState } from "react";
import { ClipboardList, FileCheck2, Bell, Users, Check } from "lucide-react";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "assignment",
    title: "واجب جديد: الرياضيات",
    message: "تم إضافة واجب جديد في مجموعة الرياضيات A، الموعد النهائي غداً.",
    time: "منذ ساعتين",
    read: false,
  },
  {
    id: 2,
    type: "exam",
    title: "اختبار قادم: الفيزياء",
    message: "اختبار الفيزياء سيبدأ يوم الأحد الساعة 10:00 صباحاً.",
    time: "منذ 5 ساعات",
    read: false,
  },
  {
    id: 3,
    type: "group",
    title: "تذكير بالحصة",
    message: "حصتك في مجموعة الفيزياء A تبدأ خلال 30 دقيقة.",
    time: "أمس",
    read: true,
  },
  {
    id: 4,
    type: "general",
    title: "تحديث في جدول الحصص",
    message: "تم تعديل موعد حصة يوم الثلاثاء، يرجى مراجعة الجدول.",
    time: "منذ يومين",
    read: true,
  },
];

const TYPE_CONFIG = {
  assignment: { icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
  exam: { icon: FileCheck2, color: "text-purple-600", bg: "bg-purple-50" },
  group: { icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
  general: { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" },
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;
  const Icon = config.icon;

  return (
    <div
      dir="rtl"
      className={`
        flex items-start gap-3 sm:gap-4 p-4 rounded-xl border transition-colors
        ${notification.read ? "bg-white border-gray-100" : "bg-[#EAF4FF]/40 border-[#123C91]/20"}
      `}
    >
      <div className={`shrink-0 p-2.5 rounded-lg ${config.bg}`}>
        <Icon size={20} className={config.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="text-[14px] sm:text-[15px] font-semibold text-[#1F2937] truncate"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-[#123C91] mt-1.5" />
          )}
        </div>

        <p
          className="text-[12.5px] sm:text-[13px] text-[#6B7280] mt-1 leading-5"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[11.5px] text-[#9CA3AF]">{notification.time}</span>

          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="flex items-center gap-1 text-[11.5px] text-[#123C91] hover:underline"
            >
              <Check size={13} />
              تحديد كمقروء
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = ({ onStatsUpdate }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    onStatsUpdate?.(notifications);
  }, [notifications, onStatsUpdate]);

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filters = [
    { id: "all", label: "الكل" },
    { id: "unread", label: "غير مقروءة" },
    { id: "assignment", label: "واجبات" },
    { id: "exam", label: "اختبارات" },
  ];

  const filtered = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  return (
    <div dir="rtl" className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`
                px-3 py-1.5 rounded-lg text-[12.5px] sm:text-[13px] font-medium transition-colors
                ${filter === f.id
                  ? "bg-[#123C91] text-white"
                  : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-[12.5px] sm:text-[13px] text-[#123C91] font-medium hover:underline"
        >
          تحديد الكل كمقروء
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length ? (
          filtered.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
          ))
        ) : (
          <p className="text-center text-[#9CA3AF] text-[13px] py-8">
            لا توجد إشعارات لعرضها
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsSection;