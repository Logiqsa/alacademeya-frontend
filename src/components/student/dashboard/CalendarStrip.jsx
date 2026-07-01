import React from "react";

const CalendarStrip = ({ weekDates, selectedIndex, onSelectDay }) => {
  return (
    <div dir="rtl" className="mb-2">
      <div
        className="
          flex sm:grid sm:grid-cols-7
          gap-2 sm:gap-3
          overflow-x-auto sm:overflow-visible
          pb-2
          scrollbar-hide
          -mx-1 px-1 sm:mx-0 sm:px-0
        "
      >
        {weekDates.map((item, i) => {
          const isActive = i === selectedIndex;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectDay(i)}
              className={`
                shrink-0
                w-16 sm:w-auto
                h-18 sm:h-22 lg:h-24
                rounded-xl border
                flex flex-col items-center justify-center
                transition-all duration-200
                shadow-sm hover:shadow-md hover:-translate-y-0.5
                ${
                  isActive
                    ? "bg-[#EAF4FF] border-[#123C91]"
                    : "bg-white border-[#E5E7EB] hover:border-[#123C91]/30"
                }
              `}
            >
              <span
                className={`
                  font-normal text-[11.5px] sm:text-[13px] lg:text-[14px] mb-1.5 sm:mb-2
                  ${isActive ? "text-[#123C91]" : "text-[#6B7280]"}
                `}
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {item.name}
              </span>

              <span
                className={`
                  font-bold text-[16px] sm:text-[18px] lg:text-[20px]
                  ${isActive ? "text-[#123C91]" : "text-[#1F2937]"}
                `}
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