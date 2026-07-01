// src/utils/scheduleWeek.js
export const WEEK_DAYS = [
  { key: "saturday", name: "السبت" },
  { key: "sunday", name: "الأحد" },
  { key: "monday", name: "الاثنين" },
  { key: "tuesday", name: "الثلاثاء" },
  { key: "wednesday", name: "الأربعاء" },
  { key: "thursday", name: "الخميس" },
  { key: "friday", name: "الجمعة" },
];

// الأسبوع يبدأ يوم السبت
export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // Sun=0 ... Sat=6
  const diff = (day - 6 + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const buildWeekDates = (referenceDate) => {
  const start = getWeekStart(referenceDate);
  return WEEK_DAYS.map((wd, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return { ...wd, date, dayNum: date.getDate() };
  });
};

export const formatArabicMonthYear = (date) =>
  date.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });