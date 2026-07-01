import React from "react";

const CalendarStrip = ({ weekDates, selectedIndex, onSelectDay }) => {
  return (
    <div dir="rtl" className="mb-6 sm:mb-8 lg:mb-10">
      <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto md:overflow-visible pb-2 scrollbar-hide">
        {weekDates.map((item, i) => {
          const isActive = i === selectedIndex;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectDay(i)}
              className={`
                min-w-22.5 sm:min-w-25 md:min-w-0 h-22 sm:h-24 rounded-xl border
                flex flex-col items-center justify-center transition-all duration-200
                shadow-sm hover:shadow-md hover:-translate-y-0.5
                ${isActive ? "bg-[#EAF4FF] border-[#123C91]" : "bg-white border-[#E5E7EB] hover:border-[#123C91]/30"}
              `}
            >
              <span
                className={`font-normal text-[13px] sm:text-[14px] mb-2 ${isActive ? "text-[#123C91]" : "text-[#6B7280]"}`}
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {item.name}
              </span>
              <span
                className={`font-bold text-[18px] sm:text-[20px] ${isActive ? "text-[#123C91]" : "text-[#1F2937]"}`}
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {item.dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarStrip;