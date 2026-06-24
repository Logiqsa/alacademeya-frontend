import React from "react";

const CalendarStrip = () => {
  const days = [
    { dayName: "السبت", dayNum: "21" },
    { dayName: "الأحد", dayNum: "22" },
    { dayName: "الاثنين", dayNum: "23" },
    { dayName: "الثلاثاء", dayNum: "24" },
    { dayName: "الأربعاء", dayNum: "25" },
    { dayName: "الخميس", dayNum: "26" },
    { dayName: "الجمعة", dayNum: "27" },
  ];

  const selectedDay = 1;

  return (
    <div dir="rtl" className="mb-6 sm:mb-8 lg:mb-10">
      <div
        className="
          flex md:grid
          md:grid-cols-7
          gap-3
          overflow-x-auto
          md:overflow-visible
          pb-2
          scrollbar-hide
        "
      >
        {days.map((item, i) => {
          const isActive = i === selectedDay;

          return (
            <button
              key={i}
              type="button"
              className={`
                min-w-22.5
                sm:min-w-25
                md:min-w-0
                h-22
                sm:h-24
                rounded-xl
                border
                flex
                flex-col
                items-center
                justify-center
                transition-all
                duration-200
                shadow-sm
                hover:shadow-md
                hover:-translate-y-0.5
                ${
                  isActive
                    ? "bg-[#EAF4FF] border-[#123C91]"
                    : "bg-white border-[#E5E7EB] hover:border-[#123C91]/30"
                }
              `}
            >
              <span
                className={`
                  font-normal
                  text-[13px]
                  sm:text-[14px]
                  mb-2
                  ${
                    isActive
                      ? "text-[#123C91]"
                      : "text-[#6B7280]"
                  }
                `}
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                }}
              >
                {item.dayName}
              </span>

              <span
                className={`
                  font-bold
                  text-[18px]
                  sm:text-[20px]
                  ${
                    isActive
                      ? "text-[#123C91]"
                      : "text-[#1F2937]"
                  }
                `}
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                }}
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