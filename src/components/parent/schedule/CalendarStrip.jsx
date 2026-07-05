import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WEEK_DAYS } from "../../../utils/scheduleWeek"; 


const pad2 = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// نفس المعادلة المستخدمة في LessonsSchedule.jsx: السبت = index 0
const weekdayIndex = (date) => (date.getDay() - 6 + 7) % 7;

const buildMonthGrid = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const leadingCount = weekdayIndex(firstOfMonth);
  const totalCells = Math.ceil((leadingCount + lastOfMonth.getDate()) / 7) * 7;

  const gridStart = new Date(year, month, 1 - leadingCount);

  return Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    return { date, isCurrentMonth: date.getMonth() === month };
  });
};

const CalendarStrip = ({
  selectedDayKey,
  onSelectDay,
  title = "جدول الحصص",
  eventDates = [], // ["2026-07-10", "2026-07-16", ...] اختياري
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const days = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const monthYearLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(
        viewDate,
      ),
    [viewDate],
  );

  // النص في النص: اليوم المختار بالكامل، مثال "4 يوليو 2026"
  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate),
    [selectedDate],
  );

  const goToPrevMonth = () =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const handlePick = (date) => {
    setSelectedDate(date);
    const key = WEEK_DAYS[weekdayIndex(date)]?.key;
    if (key) onSelectDay?.(key);
  };

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 lg:mb-10"
    >
      {/* الهيدر: عنوان الكارت يمين + تاريخ اليوم المختار في النص + تنقل الشهر شمال */}
      <div className="grid grid-cols-3 items-center mb-4 sm:mb-5">
        {/* يمين: عنوان الكارت */}
        <h3
          className="text-[14px] sm:text-[16px] font-semibold text-[#1F2937] justify-self-start truncate"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {title}
        </h3>

        {/* النص: تاريخ اليوم المختار بالكامل */}
        <span
          className="text-[14px] sm:text-[16px] font-semibold text-[#1F2937] justify-self-center text-center whitespace-nowrap"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {selectedDateLabel}
        </span>

        {/* شمال: التنقل بين الشهور */}
        <div className="flex items-center gap-1 sm:gap-2 justify-self-end">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="الشهر السابق"
            className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-[#F0F4FF] transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          <span
            className="text-[13px] sm:text-[14px] font-medium text-[#1F2937] whitespace-nowrap"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {monthYearLabel}
          </span>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="الشهر التالي"
            className="p-1.5 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-[#F0F4FF] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      </div>

      {/* أسماء الأيام */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
        {WEEK_DAYS.map((d) => (
          <span
            key={d.key}
            className="text-center text-[11px] sm:text-[13px] font-medium text-[#8C9198] py-1 sm:py-2 truncate"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            {d.name}
          </span>
        ))}
      </div>

      {/* شبكة الأيام */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map(({ date, isCurrentMonth }) => {
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);
          const hasEvent = eventDates.includes(toISODate(date));

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handlePick(date)}
              className="relative flex items-center justify-center py-1"
            >
              <span
                className={`
                  flex items-center justify-center
                  w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11
                  rounded-full text-[13px] sm:text-[14px] md:text-[15px]
                  transition-colors duration-150
                  ${
                    isSelected
                      ? "bg-[#123C91] text-white font-semibold shadow-[0_4px_10px_rgba(18,60,145,0.35)]"
                      : isCurrentMonth
                        ? isToday
                          ? "text-[#123C91] font-semibold border border-[#123C91]/40"
                          : "text-[#1F2937] hover:bg-[#F0F4FF]"
                        : "text-[#C7CBD1]"
                  }
                `}
                style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
              >
                {date.getDate()}
              </span>

              {hasEvent && (
                <span
                  className={`absolute bottom-0 w-1 h-1 rounded-full ${
                    isSelected ? "bg-white" : "bg-[#123C91]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarStrip;