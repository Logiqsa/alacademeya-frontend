import React, { useEffect, useState } from "react";
import WelcomeHeader from "../../components/student/dashboard/WelcomeHeader";
import StatsOverview from "../../components/student/dashboard/StatsOverview";
import SubscriptionsCard from "../../components/student/dashboard/SubscriptionsCard";
import GroupsCard from "../../components/student/dashboard/GroupsCard";
import ScheduleSection from "../../components/student/dashboard/ScheduleSection";
import LessonsList from "../../components/student/dashboard/LessonsList";
import StudentLayout from "../../components/student/layout/StudentLayout";
import { getMyClassrooms, getClassroomSessions } from "../../services/authService";

const resolveName = (val) => (typeof val === "string" ? val : val?.ar || val?.en || "--");

// بتحدد حالة الحصة "دلوقتي" مقارنة بالوقت الحالي (مش نفس status الحصة في الباك إند،
// ده حساب لحظي بناءً على scheduledDate + duration عشان زرار "انضم الآن" يظهر في وقته)
const computeLiveStatus = (scheduledDate, durationMinutes) => {
  if (!scheduledDate) return "upcoming";
  const start = new Date(scheduledDate);
  const end = new Date(start.getTime() + (durationMinutes || 0) * 60000);
  const now = new Date();

  if (now > end) return "ended";
  if (now >= start && now <= end) return "live";
  return "upcoming";
};

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const StudentHome = () => {
  const [stats, setStats] = useState({
    upcomingLessons: 0,
    activeGroups: 0,
    // ⚠️ مفيش endpoint حاليًا للاختبارات/الواجبات بتاعة الطالب في authService.js
    activeExams: null,
    activeAssignments: null,
  });
  const [todayLessons, setTodayLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      try {
        // GET /classrooms/my -> مجموعات الطالب النشطة
        const classroomsRes = await getMyClassrooms();
        const classrooms = classroomsRes.data?.data || [];

        if (cancelled) return;

        // بنجيب حصص كل مجموعة بالتوازي
        const sessionsResults = await Promise.allSettled(
          classrooms.map((c) => getClassroomSessions(c.id))
        );

        let upcomingCount = 0;
        const today = new Date();
        const todaysLessons = [];

        sessionsResults.forEach((result, idx) => {
          const classroom = classrooms[idx];
          if (result.status !== "fulfilled") {
            console.error(
              `getClassroomSessions failed for classroom ${classroom?.id}:`,
              result.reason
            );
            return;
          }

          const sessions = result.value.data?.data || [];

          sessions.forEach((s) => {
            if (s.status === "scheduled" || s.status === "upcoming") {
              upcomingCount += 1;
            }

            if (s.scheduledDate && isSameDay(new Date(s.scheduledDate), today)) {
              const liveStatus = computeLiveStatus(s.scheduledDate, s.duration);
              todaysLessons.push({
                title: resolveName(classroom?.name) || "مجموعة",
                location: s.title || s.description || "حصة",
                duration: typeof s.duration === "number" ? s.duration : "--",
                time: new Date(s.scheduledDate).toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: liveStatus,
                actionLabel: liveStatus === "ended" ? "التسجيل" : "انضم الآن",
                meetingUrl: s.meetingLink || classroom?.meetingLink || "",
              });
            }
          });
        });

        if (cancelled) return;

        setStats((prev) => ({
          ...prev,
          activeGroups: classrooms.length,
          upcomingLessons: upcomingCount,
        }));
        setTodayLessons(todaysLessons);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto" dir="rtl">
        <WelcomeHeader studentName="محمد" />

        {/* ⚠️ TODO: activeExams / activeAssignments لسه مفيش endpoint ليهم بتاعة الطالب */}
        <StatsOverview
          upcomingLessons={loading ? "--" : stats.upcomingLessons}
          activeGroups={loading ? "--" : stats.activeGroups}
          activeExams={stats.activeExams ?? "--"}
          activeAssignments={stats.activeAssignments ?? "--"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5 sm:mb-6">
          <div className="lg:col-span-2">
            <GroupsCard />
          </div>
          <div className="lg:col-span-1">
            <SubscriptionsCard />
          </div>
        </div>

        <ScheduleSection weekLabel="22 يونيو 2026" />

        <div className="mb-2">
          <h3
            className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px] mb-4"
            style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          >
            دروس اليوم
          </h3>
          {/* لو لسه بيحمّل أو مفيش حصص النهاردة، الكومبوننت بيرجع لـ defaultLessons بتاعته تلقائي */}
          <LessonsList lessons={loading ? [] : todayLessons} />
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentHome;