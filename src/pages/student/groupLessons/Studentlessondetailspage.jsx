import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonStats from "../../../components/student/groupLesson/Lessonstats";
import LiveLessonLink from "../../../components/student/groupLesson/Livelessonlink";
import LessonAssignments from "../../../components/student/groupLesson/Lessonassignments";
import LessonQuizzes from "../../../components/student/groupLesson/Lessonquizzes";
import LessonRecordings from "../../../components/student/groupLesson/Lessonrecordings";
import LessonFiles from "../../../components/student/groupLesson/Lessonfiles";
import { getClassroom, getClassroomSchedule, getSessionAttendance } from "../../../services/authService";
import { generateLessonInstances, computeLessonStatus, DEFAULT_LESSON_DURATION_MIN } from "../../../utils/scheduleWeek";

const resolveName = (val) => (typeof val === "string" ? val : val?.ar || val?.en || "--");

const STATUS_LABELS = {
  upcoming: "قادمة",
  live: "مباشر الآن",
  ended: "منتهية",
};

const StatusBadge = ({ status }) => {
  const styles = {
    قادمة: "bg-[#EAF4FF] text-[#123C91]",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E]",
    منتهية: "bg-[#D32F2F26] text-[#D32F2F]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

const PageHeader = ({ lesson }) => (
  <div dir="rtl" className="flex items-center justify-between gap-3 flex-wrap">
    <div className="flex items-center gap-3 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">{lesson.title}</h1>
          <StatusBadge status={lesson.status} />
        </div>
        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
          {lesson.groupName} • {lesson.date} • {lesson.time} • {lesson.duration}
        </p>
      </div>
    </div>
  </div>
);

const StudentLessonDetailsPage = () => {
  const { groupId, lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      const [classroomResult, scheduleResult] = await Promise.allSettled([
        getClassroom(groupId),
        getClassroomSchedule(groupId),
      ]);

      if (cancelled) return;

      if (scheduleResult.status === "rejected") {
        console.error("getClassroomSchedule failed:", scheduleResult.reason);
        setError("حدث خطأ أثناء تحميل بيانات الحصة");
        setLoading(false);
        return;
      }

      const classroomData =
        classroomResult.status === "fulfilled"
          ? classroomResult.value.data?.data?.classroom ?? classroomResult.value.data?.data ?? {}
          : {};
      if (classroomResult.status === "rejected") {
        console.error("getClassroom failed:", classroomResult.reason);
      }

      const schedule = scheduleResult.value.data?.data?.schedule ?? [];
      const instances = generateLessonInstances(schedule, { weeksBack: 8, weeksForward: 4 });
      const inst = instances.find((x) => x.id === lessonId);

      if (!inst) {
        setError("لم يتم العثور على هذه الحصة");
        setLoading(false);
        return;
      }

      // ⚠️ الـ id بتاع الحصة هنا مولّد محليًا مش id حقيقي لسيشن في الباك إند،
      // فمحاولة جلب الحضور دي على الأغلب هترجع فاضية أو تفشل لحد ما يتضاف
      // endpoint حقيقي لسجل الحصص الفعلية
      let presentCount = 0;
      let absentCount = 0;
      let totalRecords = 0;
      try {
        const attendanceRes = await getSessionAttendance(lessonId);
        const records = attendanceRes.data?.data || [];
        totalRecords = records.length;
        presentCount = records.filter((r) => r.status === "present").length;
        absentCount = records.filter((r) => r.status === "absent").length;
      } catch (err) {
        console.error("getSessionAttendance failed (متوقع طالما الـ id مش سيشن حقيقي):", err);
      }

      if (cancelled) return;

      const status = computeLessonStatus(inst.date);

      setLesson({
        id: inst.id,
        title: "حصة",
        groupName: resolveName(classroomData.name) || "مجموعة",
        date: inst.date.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        time: inst.date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        duration: `${DEFAULT_LESSON_DURATION_MIN} دقيقة`,
        status: STATUS_LABELS[status] || status,
        totalStudents: totalRecords || classroomData.students?.length || 0,
        attendance: presentCount,
        absence: absentCount,
        lessonUrl: classroomData.meetingLink || "",
      });
      setLoading(false);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [groupId, lessonId]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="text-center py-16 text-[#575F69]">جاري التحميل...</div>
      </StudentLayout>
    );
  }

  if (error || !lesson) {
    return (
      <StudentLayout>
        <div className="text-center py-16 text-red-500">{error || "لم يتم العثور على الحصة"}</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="w-full p-1 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        <div className="mx-auto space-y-5">
          <PageHeader lesson={lesson} />

          <LessonStats totalStudents={lesson.totalStudents} attendance={lesson.attendance} absence={lesson.absence} />

          <LiveLessonLink
            lessonUrl={lesson.lessonUrl}
            isLive={lesson.status === "مباشر الآن"}
            onJoin={(url) => window.open(url, "_blank")}
          />

          {/* ⚠️ لسه بتعرض بيانات افتراضية جوّاها لأنه مفيش endpoints مخصصة لها */}
          <LessonFiles />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LessonAssignments />
            <LessonQuizzes />
          </div>

          <LessonRecordings />
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentLessonDetailsPage;