import { useState } from "react";
import toast from "react-hot-toast";
import { Bell, BellRing, GraduationCap, Settings, Loader2 } from "lucide-react";
import NotificationCard from "./NotificationCard";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "../../../services/APIService";
import {
  markAdminLocalNotificationRead,
  markAllAdminLocalNotificationsRead,
} from "../../../utils/adminLocalNotifications";

// ─── Helpers ────────────────────────────────────────────────────────────────

// تصنيف كل إشعار كـ "academic" أو "system" حسب نوعه
// زوّد هنا أي key/type جديد يوصل من الباك إند
const ACADEMIC_TYPES = ["lesson", "absence", "attendance", "academic"];
const categoryOf = (n) => {
  if (ACADEMIC_TYPES.includes(n.type) || ACADEMIC_TYPES.includes(n.key)) {
    return "academic";
  }
  return "system";
};

// تحويل الـ key لعنوان عربي مفهوم
const KEY_TITLES = {
  SUBSCRIPTION_APPROVED: "تمت الموافقة على الاشتراك",
  SUBSCRIPTION_REJECTED: "تم رفض طلب الاشتراك",
  SUBSCRIPTION_PENDING: "طلب اشتراك جديد",
};
const titleOf = (n) =>
  KEY_TITLES[n.key] || n.title || n.key?.replaceAll("_", " ") || "إشعار جديد";

const descOf = (n) => {
  if (n.description || n.desc) return n.description || n.desc;
  if (n.data?.studentName) {
    return `بخصوص الطالب: ${n.data.studentName}`;
  }
  return "";
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const tabs = [
  { key: "all", label: "الكل", icon: Bell },
  { key: "unread", label: "غير مقروءة", icon: BellRing },
  { key: "academic", label: "الأكاديمية", icon: GraduationCap },
  { key: "system", label: "النظام والإدارة", icon: Settings },
];

/**
 * notifications: المصفوفة الراجعة من GET /notifications
 * loading / loadError: حالة التحميل (تتولّد من الصفحة الأب)
 * onChange: callback يستقبل المصفوفة الجديدة بعد أي تحديث محلي (علشان StatsCards يتحدث برضه)
 */
const NotificationsSection = ({
  notifications = [],
  loading = false,
  loadError = "",
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState("all");
  const [markingAll, setMarkingAll] = useState(false);

  const filtered = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return categoryOf(n) === activeTab;
  });

  const toggleRead = async (n) => {
    const id = n._id || n.id;
    const prevState = notifications;

    if (n.isRead) {
      // السيرفر مفيهوش endpoint لإلغاء القراءة، فده تحديث محلي بس
      onChange?.(
        notifications.map((x) =>
          (x._id || x.id) === id ? { ...x, isRead: false } : x,
        ),
      );
      return;
    }

    onChange?.(
      notifications.map((x) =>
        (x._id || x.id) === id ? { ...x, isRead: true } : x,
      ),
    );

    if (n._local) {
      markAdminLocalNotificationRead(id);
      return;
    }

    try {
      await markNotificationRead(id);
    } catch (err) {
      onChange?.(prevState); // rollback
      toast.error(err.response?.data?.message || "تعذر تحديث حالة الإشعار");
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    const prevState = notifications;
    onChange?.(notifications.map((n) => ({ ...n, isRead: true })));
    markAllAdminLocalNotificationsRead();
    try {
      await markAllNotificationsRead();
      toast.success("تم تحديد جميع الإشعارات كمقروءة");
    } catch (err) {
      onChange?.(prevState);
      toast.error(err.response?.data?.message || "تعذر تحديث الإشعارات");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="
        w-full
        bg-white
        p-4
        sm:p-6
        rounded-2xl
        border
        border-[#E5E5E5]
      "
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h2 className="text-[16px] font-medium text-[#1F2937]">
            جميع الإشعارات
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[#6B7280]">
            تصفية وإدارة الإشعارات حسب النوع
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="shrink-0 flex items-center gap-1.5 text-[13px] text-[#123C91] hover:underline disabled:opacity-60"
          >
            {markingAll && <Loader2 size={14} className="animate-spin" />}
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      <div
        className="
          w-full
          bg-[#EAF4FF]
          rounded-full
          p-1
          mb-5
          mt-4
          grid
          grid-cols-2
          sm:grid-cols-4
          gap-1
        "
      >
        {tabs.map(({ icon: Icon, key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`
              flex
              items-center
              justify-center
              gap-1
              py-2
              px-2
              rounded-full
              text-[12px]
              sm:text-[14px]
              font-medium
              transition-all
              ${
                activeTab === key
                  ? "bg-white text-[#123C91] shadow-sm"
                  : "text-[#1F2937]"
              }
            `}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={22} className="animate-spin text-[#123C91]" />
        </div>
      )}

      {!loading && loadError && (
        <div className="py-10 text-center">
          <p className="text-[14px] text-red-500">{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <div className="space-y-3">
          {filtered.map((n) => {
            const id = n._id || n.id;
            return (
              <NotificationCard
                key={id}
                title={titleOf(n)}
                description={descOf(n)}
                time={timeAgo(n.createdAt)}
                type={categoryOf(n)}
                isRead={n.isRead}
                onToggleRead={() => toggleRead(n)}
              />
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-[14px] text-[#8C9198] py-10">
              لا توجد إشعارات لعرضها.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
