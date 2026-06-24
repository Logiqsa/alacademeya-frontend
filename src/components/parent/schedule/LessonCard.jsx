import React from "react";
import { Clock, BookOpen } from "lucide-react";

const LessonCard = ({
  title,
  teacher,
  duration,
  time,
  status,
  studentName,
}) => {
  const isCompleted = status === "completed";

  return (
    <div
      dir="rtl"
      className="
        bg-white
        border
        border-[#E5E5E5]
        rounded-2xl
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        border-r-[4px]
        border-r-[#123C91]
        p-4
        w-full
        min-h-[160px]
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3
          className="
            text-[#1F2937]
            font-semibold
            text-[15px]
            sm:text-[16px]
            leading-6
            flex-1
          "
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          {title}
        </h3>

        <span
          className={`
            px-3 py-1
            rounded-lg
            text-[12px]
            font-medium
            whitespace-nowrap
            ${
              isCompleted
                ? "bg-[#00A63E1A] text-[#00A63E]"
                : "bg-[#EAF4FF] text-[#123C91]"
            }
          `}
        >
          {isCompleted ? "مكتمل" : "قادم"}
        </span>
      </div>

      {/* Teacher */}
      <div
        className="
          flex
          items-center
          text-[#6B7280]
          text-[13px]
          mb-4
        "
        style={{
          fontFamily: "'IBM Plex Sans Arabic', sans-serif",
        }}
      >
        <BookOpen size={16} className="ml-2 shrink-0" />
        <span>{teacher}</span>
      </div>

      <div className="border-t border-[#F1F1F1] mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#8C9198] text-[13px] sm:text-[14px]">
          <Clock size={16} className="text-[#12C6B0]" />
          <span>{time}</span>
          <span>•</span>
          <span>{duration} د</span>
        </div>

        <span
          className="
            bg-[#F3F4F6]
            text-[#1F2937]
            text-[12px]
            px-3
            py-1
            rounded-lg
            font-medium
            whitespace-nowrap
          "
        >
          {studentName}
        </span>
      </div>
    </div>
  );
};

const LessonsList = () => {
  const lessons = [
    {
      title: "اللغة الفرنسية",
      teacher: "أ. علي محمد",
      duration: "45",
      time: "10:00 ص",
      status: "completed",
      studentName: "سلمى",
    },
    {
      title: "الرياضيات",
      teacher: "أ. فاطمة",
      duration: "60",
      time: "8:00 م",
      status: "upcoming",
      studentName: "أحمد",
    },
  ];

  return (
    <div className="w-full" dir="rtl">
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-2
          gap-4
        "
      >
        {lessons.map((lesson, index) => (
          <LessonCard key={index} {...lesson} />
        ))}
      </div>
    </div>
  );
};

export default LessonsList;