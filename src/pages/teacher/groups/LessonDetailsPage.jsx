import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonRecordings from "../../../components/teacher/groups/lessons/LessonRecordings";
import LessonQuizzes from "../../../components/teacher/groups/lessons/LessonQuizzes";
import LessonAssignments from "../../../components/teacher/groups/lessons/LessonAssignments";
import LessonFiles from "../../../components/teacher/groups/lessons/LessonFiles";
import LiveLessonLink from "../../../components/teacher/groups/lessons/LiveLessonLink";
import LessonStats from "../../../components/teacher/groups/lessons/LessonStats";
import {
  getClassroom,
  getClassroomSessions,
  getSessionAttendance,
} from "../../../services/authService"; // عدّل المسار حسب مكان ملفك

const resolveName = (val) => (typeof val === "string" ? val : val?.ar || val?.en || "--");

const STATUS_LABELS = {
  scheduled: "قادمة",
  upcoming: "قادمة",
  live: "مباشر الآن",
  completed: "منتهية",
  cancelled: "ملغية",
};

// حالة الحضور بتاعة كل طالب (مش حالة الحصة)
const ATTENDANCE_STATUS_LABELS = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
};

// ─── Status Badge (حالة الحصة) ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    قادمة: "bg-[#EAF4FF] text-[#123C91]",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E]",
    منتهية: "bg-[#D32F2F26] text-[#D32F2F]",
    ملغية: "bg-[#1F293726] text-[#1F2937]",
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

// ─── Attendance Badge (حالة كل طالب) ───────────────────────────────────────────
const AttendanceBadge = ({ status }) => {
  const styles = {
    حاضر: "bg-[#E6F9EE] text-[#00A63E]",
    غائب: "bg-[#FDECEA] text-[#D32F2F]",
    متأخر: "bg-[#FFF6E5] text-[#B45309]",
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

// ─── جدول تفاصيل الحضور والغياب ────────────────────────────────────────────────
const AttendanceDetailsTable = ({ records = [] }) => {
  if (records.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-10 text-center text-sm text-[#575F69]"
      >
        لا توجد بيانات حضور مسجلة لهذه الحصة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3
          className="text-[18px] font-semibold text-[#1F2937]"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
        >
          تفاصيل الحضور والغياب
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-150 text-right">
          <thead>
            <tr style={{ backgroundColor: "#F9FAFA" }}>
              {["الطالب", "الصف", "الحالة", "ملاحظات"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-[#575F69] text-[13px] font-medium text-right whitespace-nowrap"
                  style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                <td
                  className="px-5 py-3 text-[#1F2937] font-medium"
                  style={{ fontFamily: "Tajawal, sans-serif" }}
                >
                  {r.studentName}
                </td>
                <td
                  className="px-5 py-3 text-[#575F69] whitespace-nowrap"
                  style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px" }}
                >
                  {r.gradeName}
                </td>
                <td className="px-5 py-3">
                  <AttendanceBadge status={r.statusLabel} />
                </td>
                <td
                  className="px-5 py-3 text-[#575F69]"
                  style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px" }}
                >
                  {r.notes || "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const LessonDetailsPage = () => {
  const { groupId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      // بنجيب الـ classroom والـ sessions الأول عشان نعرف الحصة المطلوبة موجودة
      const [classroomResult, sessionsResult] = await Promise.allSettled([
        getClassroom(groupId),
        getClassroomSessions(groupId),
      ]);

      if (cancelled) return;

      if (sessionsResult.status === "rejected") {
        console.error("getClassroomSessions failed:", sessionsResult.reason);
        setError("حدث خطأ أثناء تحميل بيانات الحصة");
        setLoading(false);
        return;
      }

      const classroom =
        classroomResult.status === "fulfilled" ? classroomResult.value.data?.data || {} : {};
      if (classroomResult.status === "rejected") {
        console.error("getClassroom failed:", classroomResult.reason);
      }

      const sessions = sessionsResult.value.data?.data || [];
      // ⚠️ مفيش endpoint مخصص لجلب حصة واحدة بالـ id (زي /sessions/{id})
      // فبنجيب القائمة كاملة ونلاقي فيها الحصة المطلوبة محليًا
      const s = sessions.find((x) => x.id === lessonId);

      if (!s) {
        setError("لم يتم العثور على هذه الحصة");
        setLoading(false);
        return;
      }

      // ─── حضور وغياب الحصة دي — من GET /sessions/:id/attendance ─────────────
      let records = [];
      try {
        const attendanceRes = await getSessionAttendance(lessonId);
        const rawAttendance = attendanceRes.data?.data || [];
        records = rawAttendance.map((a) => ({
          id: a.id,
          studentName: a.student?.user?.fullName || "--",
          gradeName: resolveName(a.student?.grade?.name),
          status: a.status,
          statusLabel: ATTENDANCE_STATUS_LABELS[a.status] || a.status || "--",
          notes: a.notes,
        }));
      } catch (err) {
        // مش هنوقف الصفحة كلها لو الحضور فشل، بس هنسيب القوائم فاضية
        console.error("getSessionAttendance failed:", err);
      }

      if (cancelled) return;

      const presentCount = records.filter((r) => r.status === "present").length;
      const absentCount = records.filter((r) => r.status === "absent").length;

      setAttendanceRecords(records);
      setLesson({
        id: s.id,
        title: s.title || "حصة",
        groupName: resolveName(classroom.name) || "مجموعة",
        date: s.scheduledDate
          ? new Date(s.scheduledDate).toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "--",
        time: s.scheduledDate
          ? new Date(s.scheduledDate).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
          : "--",
        duration: typeof s.duration === "number" ? `${s.duration} دقيقة` : s.duration ?? "--",
        status: STATUS_LABELS[s.status] || s.status || "--",
        // إجمالي الطلاب = عدد سجلات الحضور (كل طالب مسجل في الحصة)، أو عدد طلاب المجموعة لو مفيش سجلات
        totalStudents: records.length || classroom.students?.length || 0,
        attendance: presentCount,
        absence: absentCount,
        lessonUrl: s.meetingLink || classroom.meetingLink || "",
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
      <TeacherLayout>
        <div className="text-center py-16 text-[#575F69]">جاري التحميل...</div>
      </TeacherLayout>
    );
  }

  if (error || !lesson) {
    return (
      <TeacherLayout>
        <div className="text-center py-16 text-red-500">{error || "لم يتم العثور على الحصة"}</div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="w-full p-1 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        <div className="mx-auto space-y-5">
          <PageHeader lesson={lesson} />

          <LessonStats totalStudents={lesson.totalStudents} attendance={lesson.attendance} absence={lesson.absence} />

          <LiveLessonLink lessonUrl={lesson.lessonUrl} isLive={lesson.status === "مباشر الآن"} />

          <AttendanceDetailsTable records={attendanceRecords} />

          {/* ⚠️ المكونات دي (الملفات/الواجبات/الاختبارات/التسجيلات) لسه بتعرض
              بيانات افتراضية جوّاها لأنه مفيش endpoints مخصصة لها في api.js
              الحالي. لما تتضاف، هنوصلها بنفس الطريقة اللي وصلنا بيها الحضور. */}
          <LessonFiles />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <LessonAssignments />
            <LessonQuizzes />
          </div>
          <LessonRecordings />
        </div>
      </div>
    </TeacherLayout>
  );
};

export default LessonDetailsPage;