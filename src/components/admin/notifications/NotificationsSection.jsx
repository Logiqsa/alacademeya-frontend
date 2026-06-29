import React, { useState } from "react";
import {
  Bell,
  BellRing,
  GraduationCap,
  Settings,
} from "lucide-react";
import NotificationCard from "./NotificationCard";

const allNotifications = [
  {
    id: 1,
    title: "غياب طالب",
    desc: "تغيب الطالب أحمد محمد عن درس الرياضيات اليوم. يُرجى متابعة حالته الدراسية.",
    time: "منذ 5 دقائق",
    type: "academic",
    read: false,
  },
  {
    id: 2,
    title: "تحويل مستحقات مالية",
    desc: "تم تحويل مبلغ 1,250 جنيه مصري إلى رصيدك بنجاح. يُرجى مراجعة محفظتك للاطلاع على تفاصيل العملية.",
    time: "منذ ساعة",
    type: "system",
    read: true,
  },
  {
    id: 3,
    title: "تنبيه بخصوص مجموعة متوقفة",
    desc: "تم إيقاف إحدى مجموعاتك التعليمية مؤقتًا لحين مراجعة بعض البيانات من قبل الإدارة.",
    time: "منذ 3 أيام",
    type: "system",
    read: false,
  },
  {
    id: 4,
    title: "درس قادم",
    desc: "لديك درس رياضيات غداً الساعة 2:00 م مع مجموعة الصف الثالث الإعدادي.",
    time: "منذ 5 أيام",
    type: "academic",
    read: true,
  },
];

const tabs = [
  { key: "all", label: "الكل", icon: Bell },
  { key: "unread", label: "غير مقروءة", icon: BellRing },
  { key: "academic", label: "الأكاديمية", icon: GraduationCap },
  { key: "system", label: "النظام والإدارة", icon: Settings },
];

const NotificationsSection = () => {
  const [activeTab, setActiveTab] = useState("all");

  const [readState, setReadState] = useState(() =>
    Object.fromEntries(allNotifications.map((n) => [n.id, n.read]))
  );

  const filtered = allNotifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !readState[n.id];
    if (activeTab === "academic") return n.type === "academic";
    if (activeTab === "system") return n.type === "system";
    return true;
  });

  const toggleRead = (id) => {
    setReadState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      <h2 className="text-[16px] font-medium text-[#1F2937] mb-2">
        جميع الإشعارات
      </h2>

      <p className="text-[14px] sm:text-[16px] text-[#6B7280] mb-5">
        تصفية وإدارة الإشعارات حسب النوع
      </p>

      <div
        className="
          w-full
          bg-[#EAF4FF]
          rounded-full
          p-1
          mb-5
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

      <div className="space-y-3">
        {filtered.map((n) => (
          <NotificationCard
            key={n.id}
            title={n.title}
            description={n.desc}
            time={n.time}
            type={n.type}
            isRead={readState[n.id]}
            onToggleRead={() => toggleRead(n.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationsSection;