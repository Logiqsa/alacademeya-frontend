import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Bell, Loader2, Check } from "lucide-react";

import {
  getNotifications,
  markNotificationRead,
} from "../../../services/APIService";

const MAX_ITEMS = 4;

const extractList = (resData) => {
  if (!resData) return [];

  const root = resData?.data || resData;
  const raw = root?.data || root || [];

  return Array.isArray(raw) ? raw : [];
};

const getLocalizedText = (value, lang = "ar") => {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return value[lang] || value.ar || value.en || "";
  }

  return String(value);
};

const KEY_TITLES = {
  SUBSCRIPTION_APPROVED: "تمت الموافقة على الاشتراك",
  SUBSCRIPTION_REJECTED: "تم رفض طلب الاشتراك",
  SUBSCRIPTION_PENDING: "طلب اشتراك جديد",
  SUBSCRIPTION_EXPIRES_SOON: "الاشتراك يقترب من الانتهاء",
  SUBSCRIPTION_EXPIRED: "انتهى الاشتراك",

  NEW_USER_JOINED: "مستخدم جديد انضم للمنصة",

  NEW_MESSAGE: "رسالة جديدة",
  NEW_ASSIGNMENT: "واجب جديد",
  ASSIGNMENT_GRADED: "تم تصحيح الواجب",

  STUDENT_ABSENT: "غياب طالب",
  STUDENT_LATE: "تأخر طالب",
  STUDENT_EXCUSED: "غياب بعذر",

  CLASS_STARTED: "بدأت الحصة",
  CLASS_CANCELLED: "تم إلغاء الحصة",

  TEACHER_APPROVED: "تم قبول حساب المعلم",
  TEACHER_PARENT_ROOM_CREATED: "تم إنشاء محادثة",
  CERTIFICATE_ISSUED: "شهادة جديدة",
};

const titleOf = (notification, lang = "ar") => {
  return (
    KEY_TITLES[notification?.key] ||
    getLocalizedText(notification?.title, lang) ||
    notification?.key?.replaceAll("_", " ") ||
    "إشعار جديد"
  );
};

const bodyOf = (notification, lang = "ar") => {
  return getLocalizedText(notification?.body, lang);
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr).getTime();

  if (Number.isNaN(date)) return "";

  const diffMs = Date.now() - date;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `منذ ${hours} ساعة`;

  const days = Math.floor(hours / 24);

  return `منذ ${days} يوم`;
};

const NotificationsSection = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const res = await getNotifications();

      setNotifications(extractList(res.data));
    } catch (err) {
      setLoadError(err.response?.data?.message || "تعذر تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    if (!id) return;

    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.filter((notification) => {
          const notificationId = notification._id || notification.id;
          return notificationId !== id;
        }),
      );

      toast.success("تم تحديث الإشعار");
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    }
  };

  const recent = notifications.slice(0, MAX_ITEMS);

  return (
    <div
      className="bg-white border border-[#1F293726] rounded-2xl p-6 w-full h-full font-['Tajawal'] flex flex-col"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-medium text-[#1F2937]">
          الإشعارات الأخيرة
        </h3>

        <button
          type="button"
          onClick={() => navigate("/admin/notifications")}
          className="text-[16px] text-[#123C91] font-medium hover:underline"
        >
          عرض الكل
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#123C91]" />
        </div>
      ) : loadError ? (
        <p className="text-red-500 text-center py-8">{loadError}</p>
      ) : (
        <div className="flex-1 space-y-4">
          {recent.map((notif) => {
            const id = notif._id || notif.id;
            const title = titleOf(notif, "ar");
            const body = bodyOf(notif, "ar");
            const createdAt = timeAgo(notif.createdAt);

            return (
              <div
                key={id}
                className="flex items-center gap-3 p-4 border border-[#1F29371A] rounded-lg relative hover:bg-[#F9FAFA] transition-all"
              >
                <div className="p-2 bg-[#EAF4FF] rounded-lg text-[#123C91] shrink-0">
                  <Bell size={20} />
                </div>

                <div className="text-right flex-1 min-w-0">
                  <p className="text-[14px] text-[#1F2937] font-medium truncate">
                    {title}
                  </p>

                  {body && (
                    <p className="text-[13px] text-[#575F69] mt-1 line-clamp-1">
                      {body}
                    </p>
                  )}

                  {createdAt && (
                    <p className="text-[12px] text-[#8C9198] mt-1">
                      {createdAt}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleMarkAsRead(id)}
                  className="text-[#8C9198] hover:text-[#123C91] transition-colors shrink-0"
                  title="وضع علامة كمقروء"
                >
                  <Check size={18} />
                </button>
              </div>
            );
          })}

          {recent.length === 0 && (
            <p className="text-center text-[#8C9198] py-8">
              لا توجد إشعارات جديدة.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
