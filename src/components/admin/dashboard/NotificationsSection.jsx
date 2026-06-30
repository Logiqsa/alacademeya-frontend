import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Loader2 } from "lucide-react";
import { getNotifications } from "../../../services/authService";

const MAX_ITEMS = 4;

const extractList = (resData) => {
  if (!resData) return [];
  const root = resData?.data || resData;
  const raw = root?.data || root || [];
  return Array.isArray(raw) ? raw : [];
};

const KEY_TITLES = {
  SUBSCRIPTION_APPROVED: "تمت الموافقة على الاشتراك",
  SUBSCRIPTION_REJECTED: "تم رفض طلب الاشتراك",
  SUBSCRIPTION_PENDING: "طلب اشتراك جديد",
};
const titleOf = (n) =>
  KEY_TITLES[n.key] ||
  n.title ||
  n.key?.replaceAll("_", " ") ||
  "إشعار جديد";

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

const NotificationsSection = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setLoading(true);
    getNotifications()
      .then((res) => setNotifications(extractList(res.data)))
      .catch((err) =>
        setLoadError(err.response?.data?.message || "تعذر تحميل الإشعارات")
      )
      .finally(() => setLoading(false));
  }, []);

  const recent = notifications.slice(0, MAX_ITEMS);

  return (
    <div
      className="bg-white border border-[#1F293726] rounded-2xl p-4 sm:p-6 w-full h-full font-['Tajawal'] flex flex-col"
      dir="rtl"
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-[18px] font-medium text-[#1F2937]">الإشعارات الأخيرة</h3>
        <button
          onClick={() => navigate("/admin/notifications")}
          className="text-sm sm:text-[16px] text-[#123C91] font-medium hover:underline shrink-0"
        >
          عرض الكل
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[#123C91]" />
        </div>
      )}

      {!loading && loadError && (
        <p className="text-[13px] text-red-500 text-center py-8">{loadError}</p>
      )}

      {!loading && !loadError && (
        <div className="flex-1 space-y-3 sm:space-y-4">
          {recent.map((notif) => {
            const id = notif._id || notif.id;
            return (
              <div
                key={id}
                className="w-full min-h-18 flex items-center gap-3 p-3 sm:p-4 border border-[#1F29371A] rounded-lg relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#12C6B0]" />

                <div className="p-2 bg-[#EAF4FF] rounded-lg text-[#12C6B0] shrink-0">
                  <Bell size={20} />
                </div>

                <div className="text-right min-w-0">
                  <p className="font-['IBM_Plex_Sans_Arabic'] font-normal mb-1.5 sm:mb-2 text-[13px] sm:text-[14px] leading-4 text-[#1F2937]">
                    {titleOf(notif)}
                  </p>
                  <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[11px] sm:text-[12px] leading-4 text-[#8C9198] mt-1">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}

          {recent.length === 0 && (
            <p className="text-[13px] text-[#8C9198] text-center py-8">
              لا توجد إشعارات حاليًا.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;