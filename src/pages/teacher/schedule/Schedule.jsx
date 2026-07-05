import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import StatsCards from "../../../components/teacher/schedule/StatsCards";
import ScheduleFilters from "../../../components/teacher/schedule/ScheduleFilters";
import CalendarStrip from "../../../components/teacher/schedule/CalendarStrip";
import LessonsList from "../../../components/teacher/schedule/LessonCard";
import {
  getMyClassrooms,
  getClassroomSchedule,
} from "../../../services/APIService";
import {
  buildWeekDates,
  formatArabicMonthYear,
} from "../../../utils/scheduleWeek";

// الـ API مش بترجع مدة الحصة، فده افتراض مؤقت لحد ما يتضاف حقل duration في الـ backend
const DEFAULT_DURATION_MIN = 45;
const LIVE_WINDOW_MIN = DEFAULT_DURATION_MIN;

const getLevelLabel = (classroom) => classroom.subject?.name?.ar ?? "";

const computeStatus = (dateObj, startTime) => {
  const [h, m] = startTime.split(":").map(Number);
  const start = new Date(dateObj);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + LIVE_WINDOW_MIN * 60000);
  const now = new Date();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
};

const Schedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [classroomSchedules, setClassroomSchedules] = useState([]); // [{classroom, schedule}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const referenceDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDates = useMemo(
    () => buildWeekDates(referenceDate),
    [referenceDate],
  );

  useEffect(() => {
    const todayKey = new Date().toDateString();
    const idx = weekDates.findIndex((d) => d.date.toDateString() === todayKey);
    setSelectedIndex(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => {
    let isMounted = true;

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const { data } = await getMyClassrooms();
        const classrooms = data?.data ?? [];

        const results = await Promise.all(
          classrooms.map(async (classroom) => {
            const id = classroom.id ?? classroom._id;
            try {
              const res = await getClassroomSchedule(id);
              return { classroom, schedule: res.data?.data?.schedule ?? [] };
            } catch {
              return { classroom, schedule: [] };
            }
          }),
        );

        if (isMounted) setClassroomSchedules(results);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSchedules();
    return () => {
      isMounted = false;
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
            groupName: classroom.name,
            level: getLevelLabel(classroom),
            time: slot.startTime,
            duration: DEFAULT_DURATION_MIN,
            status,
            actionLabel:
              status === "live"
                ? "دخول"
                : status === "ended"
                  ? "التفاصيل"
                  : "قادمة",
            meetingLink: classroom.meetingLink,
          });
        });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [classroomSchedules, selectedDay]);

  const stats = useMemo(() => {
    const allSlots = classroomSchedules.flatMap(({ schedule }) => schedule);

    const countBy = (predicate) =>
      classroomSchedules.reduce(
        (count, { schedule }) =>
          count +
          weekDates.reduce(
            (wCount, day) =>
              wCount +
              schedule.filter(
                (slot) =>
                  slot.day === day.key &&
                  predicate(computeStatus(day.date, slot.startTime)),
              ).length,
            0,
          ),
        0,
      );

    return {
      upcoming: countBy((s) => s !== "ended"),
      completed: countBy((s) => s === "ended"),
      totalHours: Math.round((allSlots.length * DEFAULT_DURATION_MIN) / 60),
    };
  }, [classroomSchedules, weekDates]);

  const handleAction = (lesson) => {
    if (lesson.status === "live" && lesson.meetingLink) {
      window.open(lesson.meetingLink, "_blank", "noopener,noreferrer");
    }
  };

  const goPrevWeek = useCallback(() => setWeekOffset((w) => w - 1), []);
  const goNextWeek = useCallback(() => setWeekOffset((w) => w + 1), []);

  return (
    <TeacherLayout>
      <div
        className="max-w-7xl mx-auto p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
          جدول دروسك
        </h1>
        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
          متابعة دروسك القادمة وسجل دروسك السابقة.
        </p>

        <StatsCards
          upcoming={stats.upcoming}
          completed={stats.completed}
          totalHours={stats.totalHours}
        />

        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ScheduleFilters />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8 pb-4">
            <button
              onClick={goPrevWeek}
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
              {formatArabicMonthYear(referenceDate)}
            </h3>
            <button
              onClick={goNextWeek}
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

        <CalendarStrip
          weekDates={weekDates}
          selectedIndex={selectedIndex}
          onSelectDay={setSelectedIndex}
        />

        <div>
          <div className="flex justify-between items-center mb-4" dir="rtl">
            <h3
              className="text-[16px] leading-6 text-[#1F2937] text-right"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 600,
              }}
            >
              دروس {selectedDay?.name}
            </h3>
            <span
              className="text-[16px] leading-6 text-[#8C9198] text-right"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 400,
              }}
            >
              {lessonsForSelectedDay.length} درس
            </span>
          </div>

          <LessonsList
            lessons={lessonsForSelectedDay.map((l) => ({
              ...l,
              onAction: () => handleAction(l),
            }))}
            loading={loading}
          />
        </div>
      </div>
    </TeacherLayout>
  );
};

export default Schedule;
