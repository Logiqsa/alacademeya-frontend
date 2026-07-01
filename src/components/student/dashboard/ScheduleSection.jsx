import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import CalendarStrip from "./CalendarStrip";
import LessonsList from "./LessonsList";
import { getMyClassrooms, getClassroomSchedule } from "../../../services/authService";
import { buildWeekDates, formatArabicMonthYear } from "../../../utils/scheduleWeek";

// ⚠️ الـ API الحالي (/classrooms/:id/schedule) بيرجّع بس day + startTime،
// من غير مدة الحصة أو تاريخ نهايتها، فاستخدمت قيمة افتراضية لحد ما تتضاف من الباك إند
const DEFAULT_DURATION_MIN = 45;

const computeStatus = (dateObj, startTime) => {
  const [h, m] = startTime.split(":").map(Number);
  const start = new Date(dateObj);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MIN * 60000);
  const now = new Date();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
};

const resolveName = (val) => (typeof val === "string" ? val : val?.ar || val?.en || "مجموعة");

const ScheduleSection = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [classroomSchedules, setClassroomSchedules] = useState([]); // [{classroom, schedule}]
  const [loading, setLoading] = useState(true);

  const referenceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(() => buildWeekDates(referenceDate), [referenceDate]);

  // تحديد اليوم النهاردة تلقائيًا لما تفتح الصفحة أو تتنقل للأسبوع الحالي
  useEffect(() => {
    const todayKey = new Date().toDateString();
    const idx = weekDates.findIndex((d) => d.date.toDateString() === todayKey);
    setSelectedIndex(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

useEffect(() => {
    let cancelled = false;

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const { data } = await getMyClassrooms();
        const classrooms = data?.data ?? [];

        // 🔍 تشخيص مؤقت
        console.log("Classrooms fetched:", classrooms);

        const results = await Promise.all(
          classrooms.map(async (classroom) => {
            const id = classroom.id ?? classroom._id;
            console.log("Fetching schedule for classroom:", id, classroom.name);
            try {
              const res = await getClassroomSchedule(id);
              const schedule = res.data?.data?.schedule ?? [];
              console.log(`Schedule for ${classroom.name}:`, schedule);
              return { classroom, schedule };
            } catch (err) {
              console.error(`getClassroomSchedule FAILED for ${id}:`, err.response?.status, err.response?.data);
              return { classroom, schedule: [] };
            }
          })
        );

        if (!cancelled) setClassroomSchedules(results);
      } catch (err) {
        console.error("Failed to load classroom schedules:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSchedules();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDay = weekDates[selectedIndex];

  const lessonsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const items = [];

    classroomSchedules.forEach(({ classroom, schedule }) => {
      schedule
        .filter((slot) => slot.day === selectedDay.key)
        .forEach((slot) => {
          const status = computeStatus(selectedDay.date, slot.startTime);
          items.push({
            id: slot.id ?? slot._id,
            title: resolveName(classroom.name),
            location: classroom.subject?.name?.ar || "حصة أونلاين",
            time: slot.startTime,
            duration: DEFAULT_DURATION_MIN,
            status,
            actionLabel: status === "ended" ? "التسجيل" : status === "live" ? "انضم الآن" : "قادمة",
            onAction: () => {
              if (status === "live" && classroom.meetingLink) {
                window.open(classroom.meetingLink, "_blank", "noopener,noreferrer");
              }
            },
          });
        });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [classroomSchedules, selectedDay]);

  const goPrevWeek = useCallback(() => setWeekOffset((w) => w - 1), []);
  const goNextWeek = useCallback(() => setWeekOffset((w) => w + 1), []);

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
        <button
          onClick={goNextWeek}
          className="flex items-center gap-1 text-[#6B7280] text-[12px] sm:text-[13px] hover:text-[#123C91] transition-colors whitespace-nowrap"
        >
          <ChevronRight size={16} />
          <span className="hidden xs:inline">الأسبوع التالي</span>
        </button>

        <span
          className="text-[#1F2937] font-medium text-[13px] sm:text-[14px] order-first sm:order-none w-full sm:w-auto text-center"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {formatArabicMonthYear(referenceDate)}
        </span>

        <button
          onClick={goPrevWeek}
          className="flex items-center gap-1 text-[#6B7280] text-[12px] sm:text-[13px] hover:text-[#123C91] transition-colors whitespace-nowrap"
        >
          <span className="hidden xs:inline">الأسبوع الماضي</span>
          <ChevronLeft size={16} />
        </button>
      </div>

      <CalendarStrip weekDates={weekDates} selectedIndex={selectedIndex} onSelectDay={setSelectedIndex} />

      <div className="mt-5">
        <h4
          className="text-[#1F2937] font-semibold text-[14px] sm:text-[15px] mb-3"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          حصص {selectedDay?.name}
        </h4>
        <LessonsList lessons={lessonsForSelectedDay} loading={loading} />
      </div>
    </div>
  );
};

export default ScheduleSection;