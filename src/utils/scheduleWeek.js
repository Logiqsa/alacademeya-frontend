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

// ⚠️ الـ backend حاليًا مفيهوش endpoint فعلي لـ "حصص محددة بتواريخ وحالات"
// المصدر الوحيد المؤكد هو /classrooms/:id/schedule اللي بيرجّع نمط أسبوعي
// متكرر (يوم + وقت بداية) بس. الدالة دي بتولّد "حصص" بتواريخ حقيقية من
// النمط ده على مدى عدد أسابيع معين، وده تقريب مش بيانات فعلية.
export const DEFAULT_LESSON_DURATION_MIN = 45;

export const generateLessonInstances = (
  schedule = [],
  { weeksBack = 8, weeksForward = 4 } = {}
) => {
  const instances = [];
  const currentWeekStart = getWeekStart(new Date());

  for (let w = -weeksBack; w <= weeksForward; w += 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() + w * 7);

    schedule.forEach((slot) => {
      const dayIndex = WEEK_DAYS.findIndex((d) => d.key === slot.day);
      if (dayIndex === -1 || !slot.startTime) return;

      const date = new Date(weekStart);
      date.setDate(date.getDate() + dayIndex);

      const [h, m] = slot.startTime.split(":").map(Number);
      date.setHours(h, m, 0, 0);

      const scheduleId = slot.id ?? slot._id;
      instances.push({
        id: `${scheduleId}_${date.toISOString().slice(0, 10)}`,
        scheduleId,
        day: slot.day,
        startTime: slot.startTime,
        date,
      });
    });
  }

  return instances.sort((a, b) => a.date - b.date);
};

export const computeLessonStatus = (date, durationMinutes = DEFAULT_LESSON_DURATION_MIN) => {
  const start = new Date(date);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const now = new Date();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
};