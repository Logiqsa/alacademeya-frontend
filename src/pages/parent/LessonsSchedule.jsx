// pages/parent/LessonsSchedule.jsx
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // ✅ اتصلح المسار
import {
  WEEK_DAYS,
  getWeekStart,
  buildWeekDates,
  formatArabicMonthYear,
  computeLessonStatus,
  buildFamilyLessonInstances,
} from "../../utils/scheduleWeek"; // ⚠️ عدّل المسار حسب مكان الملف عندك
import { getMyClassrooms, getMyStudents } from "../../services/APIService"; // ⚠️ عدّل المسار حسب مكان السيرفس عندك
import ParentLayout from "../../components/parent/layout/ParentLayout";
import ScheduleFilters from "../../components/parent/schedule/ScheduleFilters";
import CalendarStrip from "../../components/parent/schedule/CalendarStrip";
import LessonsList from "../../components/parent/schedule/LessonCard";
import StatsCards from "../../components/parent/schedule/StatsCards";

const formatTime = (date) =>
  date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const todayKeyFromDate = (date) => {
  const idx = (date.getDay() - 6 + 7) % 7; // السبت = 0
  return WEEK_DAYS[idx].key;
};

const LessonsSchedule = () => {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [classrooms, setClassrooms] = useState([]);
  const [studentMap, setStudentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDayKey, setSelectedDayKey] = useState(() =>
    todayKeyFromDate(new Date()),
  );

  const weekStart = useMemo(() => getWeekStart(referenceDate), [referenceDate]);
  const weekDates = useMemo(
    () => buildWeekDates(referenceDate),
    [referenceDate],
  );

  // ✅ تحميل الفصول والأبناء الحقيقيين
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [classroomsRes, studentsRes] = await Promise.all([
          getMyClassrooms(),
          getMyStudents(),
        ]);
        if (cancelled) return;

        const classroomsData = classroomsRes?.data || classroomsRes || [];
        const studentsData = studentsRes?.data || studentsRes || [];

        const map = {};
        studentsData.forEach((s) => {
          map[s.id] = s.fullName || s.user?.fullName || "ابن/ابنة";
        });

        setClassrooms(classroomsData);
        setStudentMap(map);
      } catch (err) {
        console.error("فشل تحميل جدول الدروس:", err);
        if (!cancelled) {
          setClassrooms([]);
          setStudentMap({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ بناء كل حصص الأسبوع الحالي من الفصول الحقيقية
  const allLessons = useMemo(
    () => buildFamilyLessonInstances(classrooms, studentMap, weekStart),
    [classrooms, studentMap, weekStart],
  );

  // ✅ حساب الحالة (مكتمل/جارٍ/قادم) والوقت المعروض لكل حصة
  const lessonsWithStatus = useMemo(
    () =>
      allLessons.map((lesson) => ({
        ...lesson,
        status: computeLessonStatus(lesson.date, lesson.duration),
        time: formatTime(lesson.date),
      })),
    [allLessons],
  );

  // ✅ فلترة حصص اليوم المختار بس
  const selectedDayLessons = useMemo(
    () => lessonsWithStatus.filter((l) => l.day === selectedDayKey),
    [lessonsWithStatus, selectedDayKey],
  );

  const selectedDayInfo = WEEK_DAYS.find((d) => d.key === selectedDayKey);

  // ✅ إحصائيات حقيقية للأسبوع بدل الأرقام الثابتة
  const stats = useMemo(() => {
    const upcoming = lessonsWithStatus.filter(
      (l) => l.status === "upcoming",
    ).length;
    const completed = lessonsWithStatus.filter(
      (l) => l.status === "completed",
    ).length;
    const totalMinutes = lessonsWithStatus.reduce(
      (sum, l) => sum + (l.duration || 0),
      0,
    );
    return { upcoming, completed, totalHours: Math.round(totalMinutes / 60) };
  }, [lessonsWithStatus]);

  const goToPreviousWeek = () =>
    setReferenceDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });

  const goToNextWeek = () =>
    setReferenceDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });

  return (
    <ParentLayout>
      <div
        className="max-w-7xl mx-auto p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
          جدول دروس الأبناء
        </h1>
        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
          جدول دروس الأبناء وسجل الدروس السابقة
        </p>

        <StatsCards stats={stats} />

        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ScheduleFilters />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8 pb-4">
            <button
              onClick={goToPreviousWeek}
              className="flex items-center gap-1 text-[#1F293780] font-normal"
              style={{
                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              <ChevronRight size={20} /> الأسبوع السابق
            </button>

            <h3
              className="font-medium text-base leading-6 text-right text-[#1F2937] px-4 py-2 rounded-lg"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {formatArabicMonthYear(weekStart)}
            </h3>

            <button
              onClick={goToNextWeek}
              className="flex items-center gap-1 text-[#1F293780] font-normal"
              style={{
                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              الأسبوع التالي <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        <div>
          <CalendarStrip
            weekDates={weekDates}
            selectedDayKey={selectedDayKey}
            onSelectDay={setSelectedDayKey}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4" dir="rtl">
            <h3
              className="text-[16px] leading-6 text-[#1F2937] text-right"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 600,
                letterSpacing: "0px",
              }}
            >
              دروس {selectedDayInfo?.name || ""}
            </h3>
            <span
              className="text-[16px] leading-6 text-[#8C9198] text-right"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 400,
                letterSpacing: "0px",
              }}
            >
              {selectedDayLessons.length} درس
            </span>
          </div>

          <LessonsList lessons={selectedDayLessons} loading={loading} />
        </div>
      </div>
    </ParentLayout>
  );
};

export default LessonsSchedule;
