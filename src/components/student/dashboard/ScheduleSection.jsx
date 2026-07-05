import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import CalendarStrip from "./CalendarStrip";
import LessonsList from "./LessonsList";
import {
  getMyClassrooms,
  getClassroomSessions,
} from "../../../services/APIService";
import {
  buildWeekDates,
  formatArabicMonthYear,
} from "../../../utils/scheduleWeek";

const DEFAULT_DURATION_MIN = 45;

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "مجموعة";

// بيحسب الحالة اعتمادًا على status الحقيقي من الباك إند، وعلى التوقيت لو لسه "scheduled"
const computeStatus = (session) => {
  if (session.status === "completed") return "ended";
  if (session.status === "cancelled") return "cancelled";

  const start = new Date(session.scheduledDate || session.startAt);
  const end = session.endAt
    ? new Date(session.endAt)
    : new Date(
        start.getTime() + (session.duration || DEFAULT_DURATION_MIN) * 60000,
      );
  const now = new Date();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
};

const ScheduleSection = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [classroomSessions, setClassroomSessions] = useState([]); // [{classroom, sessions}]
  const [loading, setLoading] = useState(true);

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
    let cancelled = false;

    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data } = await getMyClassrooms();
        const classrooms = data?.data ?? [];

        const results = await Promise.all(
          classrooms.map(async (classroom) => {
            const id = classroom.id ?? classroom._id;
            try {
              const res = await getClassroomSessions(id);
              const sessions = res.data?.data ?? [];
              return { classroom, sessions };
            } catch (err) {
              console.error(
                `getClassroomSessions FAILED for ${id}:`,
                err.response?.status,
                err.response?.data,
              );
              return { classroom, sessions: [] };
            }
          }),
        );

        if (!cancelled) setClassroomSessions(results);
      } catch (err) {
        console.error("Failed to load classroom sessions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSessions();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDay = weekDates[selectedIndex];

  const lessonsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const items = [];

    classroomSessions.forEach(({ classroom, sessions }) => {
      sessions
        .filter((s) => {
          const d = new Date(s.scheduledDate || s.startAt);
          return d.toDateString() === selectedDay.date.toDateString();
        })
        .forEach((s) => {
          const status = computeStatus(s);
          const start = new Date(s.scheduledDate || s.startAt);

          items.push({
            id: s.id ?? s._id,
            title: s.title || resolveName(classroom.name),
            location: classroom.subject?.name?.ar || "حصة أونلاين",
            time: start.toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            duration: s.duration || DEFAULT_DURATION_MIN,
            status,
            actionLabel:
              status === "ended"
                ? "التفاصيل"
                : status === "live"
                  ? "انضم الآن"
                  : "قادمة",
            onAction: () => {
              if (status === "live" && classroom.meetingLink) {
                window.open(
                  classroom.meetingLink,
                  "_blank",
                  "noopener,noreferrer",
                );
              }
            },
          });
        });
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [classroomSessions, selectedDay]);

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

      <CalendarStrip
        weekDates={weekDates}
        selectedIndex={selectedIndex}
        onSelectDay={setSelectedIndex}
      />

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
