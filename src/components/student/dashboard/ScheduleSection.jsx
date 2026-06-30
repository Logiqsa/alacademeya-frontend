import React, { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import CalendarStrip from "./CalendarStrip";

const ScheduleSection = ({ weekLabel = "22 يونيو 2026" }) => {
  const [selectedDay, setSelectedDay] = useState(1);

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5 mb-5 sm:mb-6"
    >
      <div className="mb-1">
        <h3
          className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          جدول حصصك
        </h3>
        <p
          className="text-[#9CA3AF] text-[11.5px] sm:text-[12px] mt-1"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          حصصك ودروسك المجدولة للأسبوع الحالي
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 my-4 flex-wrap sm:flex-nowrap">
        <button className="flex items-center gap-1 text-[#6B7280] text-[12px] sm:text-[13px] hover:text-[#123C91] transition-colors whitespace-nowrap">
          <ChevronRight size={16} />
          <span className="hidden xs:inline">الأسبوع التالي</span>
        </button>

        <span
          className="text-[#1F2937] font-medium text-[13px] sm:text-[14px] order-first sm:order-none w-full sm:w-auto text-center"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {weekLabel}
        </span>

        <button className="flex items-center gap-1 text-[#6B7280] text-[12px] sm:text-[13px] hover:text-[#123C91] transition-colors whitespace-nowrap">
          <span className="hidden xs:inline">الأسبوع الماضي</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      <CalendarStrip selectedDay={selectedDay} onSelectDay={setSelectedDay} />
    </div>
  );
};

export default ScheduleSection;