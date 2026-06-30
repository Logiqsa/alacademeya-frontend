import React from "react";
import { Clock, Video } from "lucide-react";

const LessonCard = ({ title, location, duration, time, status, actionLabel }) => {
  const isEnded = status === "ended";

  const badgeLabel = isEnded ? "منتهية" : status === "live" ? "تبدأ الآن" : "قادمة";
  const badgeClasses = isEnded
    ? "bg-[#00A63E1A] text-[#00A63E]"
    : "bg-[#EAF4FF] text-[#123C91]";

  return (
    <div
      dir="rtl"
      className="
        bg-white border border-[#E5E5E5] rounded-2xl
        shadow-sm hover:shadow-md transition-all duration-300
        p-4 w-full min-w-0
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
        <h3
          className="text-[#1F2937] font-semibold text-[14.5px] sm:text-[16px] leading-6 flex-1 min-w-0 truncate"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          title={title}
        >
          {title}
        </h3>

        <span
          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-[12px] font-medium whitespace-nowrap shrink-0 ${badgeClasses}`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Location */}
      <div
        className="flex items-center text-[#6B7280] text-[12.5px] sm:text-[13px] mb-4 min-w-0"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <Video size={16} className="ml-2 shrink-0" />
        <span className="truncate">{location}</span>
      </div>

      <div className="border-t border-[#F1F1F1] mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap xs:flex-nowrap">
        <div className="flex items-center gap-1.5 text-[#8C9198] text-[12.5px] sm:text-[14px] order-2 xs:order-1">
          <Clock size={16} className="text-[#9CA3AF] shrink-0" />
          <span className="whitespace-nowrap">{time}</span>
          <span className="whitespace-nowrap">{duration} د</span>
        </div>

        {isEnded ? (
          <button
            className="
              order-1 xs:order-2
              border border-[#E5E7EB] text-[#6B7280]
              text-[12.5px] sm:text-[13px] font-medium
              px-4 sm:px-5 py-2 rounded-lg
              hover:bg-[#F9FAFB] transition-colors
              w-full xs:w-auto
            "
          >
            {actionLabel || "التسجيل"}
          </button>
        ) : (
          <button
            className="
              order-1 xs:order-2
              bg-[#123C91] text-white
              text-[12.5px] sm:text-[13px] font-medium
              px-4 sm:px-5 py-2 rounded-lg
              hover:bg-[#0F2F73] transition-colors
              w-full xs:w-auto
            "
          >
            {actionLabel || "انضم الآن"}
          </button>
        )}
      </div>
    </div>
  );
};

const LessonsList = ({ lessons }) => {
  const defaultLessons = [
    {
      title: "مجموعة الفيزياء A",
      location: "اللحث الكهرومغناطيسي",
      duration: "60",
      time: "12:00 ص",
      status: "live",
      actionLabel: "انضم الآن",
    },
    {
      title: "مجموعة الرياضيات A",
      location: "المثلثات",
      duration: "45",
      time: "10:00 ص",
      status: "ended",
      actionLabel: "التسجيل",
    },
  ];

  const data = lessons && lessons.length ? lessons : defaultLessons;

  return (
    <div className="w-full" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((lesson, index) => (
          <LessonCard key={index} {...lesson} />
        ))}
      </div>
    </div>
  );
};

export default LessonsList;