import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";

import LessonStatsBar from "../../../components/teacher/groups/lessons/LessonStatsBar";
import LessonsTable from "../../../components/teacher/groups/lessons/LessonsTable";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import Pagination from "../../../components/teacher/groups/lessons/Paginationn";
import EndSessionDetailsModal from "../../../components/teacher/groups/lessons/EndSessionDetailsModal";
import {
  getClassroomSessions,
  getClassroom,
  getSessionAttendance,
  getClassroomSchedule,
  endSession,
  updateClassroomSession,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك

const ITEMS_PER_PAGE = 5;

// status enum زي ما راجعة فعلاً من الـ API (شفتها من الـ response: "completed")
const STATUS_LABELS = {
  scheduled: "قادمة",
  upcoming: "قادمة",
  live: "مباشر الآن",
  completed: "منتهية",
  cancelled: "ملغية",
  missed: "فائتة",
};

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

// ─── Page ─────────────────────────────────────────────────────────────────────
const GroupLessonsPage = ({ role = "teacher" }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = role === "admin";
  const Layout = isAdmin ? AdminLayout : TeacherLayout;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الاوقات");
  const [page, setPage] = useState(1);

  const [groupName, setGroupName] = useState(location.state?.groupName || "");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSchedule, setHasSchedule] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("تم إنشاء الحصة بنجاح");

  // ─── إنهاء الحصة ────────────────────────────────────────────────────────────
  const [endTarget, setEndTarget] = useState(null); // { id, title }
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState(null);

  // ─── Toast نجاح إضافة الحصة/الجدول ─────────────────────────────────────────
  useEffect(() => {
    if (location.state?.showSuccessToast) {
      setToastMessage("تم إنشاء الحصة بنجاح");
      setShowToast(true);

      // بنشيل الـ state من الـ history عشان الرسالة متظهرش تاني لو المستخدم عمل refresh
      navigate(location.pathname, { replace: true, state: {} });

      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // بنستخدم allSettled عشان لو endpoint الـ classroom فشل، الصفحة تفضل تعرض الحصص عادي
    const [classroomResult, sessionsResult, scheduleResult] = await Promise.allSettled([
      getClassroom(groupId),
      getClassroomSessions(groupId),
      getClassroomSchedule(groupId),
    ]);

    setHasSchedule(
      scheduleResult.status === "fulfilled" &&
      scheduleResult.value.data?.data?.isActive !== false &&
      Array.isArray(scheduleResult.value.data?.data?.schedule),
    );

    if (classroomResult.status === "fulfilled") {
      const classroomData = classroomResult.value.data?.data ?? classroomResult.value.data ?? {};

      // ⚠️ مؤقت: بنطبع الـ response الخام هنا عشان تتأكد من شكل الحقل الفعلي لاسم
      // المجموعة من الـ Network tab/Console، وبعدين نقدر نشيل السطر ده
      console.log("Classroom API response:", classroomData);

      const candidates = [classroomData.name, classroomData.title, classroomData.groupName];
      const resolved = candidates
        .map(resolveName)
        .find((n) => n && n !== "--");

      // لو الـ API رجّع اسم فعلي بنستخدمه، غير كده بنسيب اللي جالنا من صفحة الجدول (location.state)
      // أو نرجع لـ "مجموعة" بس لو مفيش أي مصدر تاني للاسم
      setGroupName((prev) => resolved || prev || "مجموعة");
    } else {
      console.error("getClassroom failed:", classroomResult.reason);
      setGroupName((prev) => prev || "مجموعة");
    }

    if (sessionsResult.status === "rejected") {
      console.error("getClassroomSessions failed:", sessionsResult.reason);
      setError("حدث خطأ أثناء تحميل الحصص");
      setLoading(false);
      return;
    }

    try {
      const sessionsRes = sessionsResult.value;

      // شكل الـ response الحقيقي (من التست بتاعك):
      // { success, results, data: [ { classroom, title, description, attachments,
      //   scheduledDate, duration, recording, status, createdBy, startAt, endAt, id } ] }
      const rawSessions = sessionsRes.data?.data || [];

      // ─── بنجيب سجل الحضور لكل حصة على حدة (GET /sessions/:id/attendance) ───
      // بنستخدم allSettled عشان لو حصة معينة فشلت، الباقي يفضل يشتغل عادي
      const attendanceResults = await Promise.allSettled(
        rawSessions.map((s) => getSessionAttendance(s.id)),
      );

      const mapped = rawSessions.map((s, index) => {
        let attendance = null;
        let absence = null;

        const attResult = attendanceResults[index];
        if (attResult.status === "fulfilled") {
          const records = attResult.value.data?.data || [];
          attendance = records.filter((r) => r.status === "present" || r.status === "late").length;
          absence = records.filter((r) => r.status === "absent" || r.status === "excused").length;
        } else {
          console.error(
            `getSessionAttendance failed for session ${s.id}:`,
            attResult.reason,
          );
        }

        const isMissed = s.status === "scheduled" && s.scheduledDate && new Date(s.scheduledDate) < new Date();
        return {
          id: s.id,
          title: s.title || "حصة",
          rawStatus: s.status,
          date: s.scheduledDate
            ? new Date(s.scheduledDate).toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            : "--",
          time: s.startAt || s.scheduledDate
            ? new Date(s.startAt || s.scheduledDate).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Africa/Cairo",
            })
            : "--",
          duration:
            typeof s.duration === "number"
              ? `${s.duration} دقيقة`
              : (s.duration ?? "--"),
          attendance,
          absence,
          status: isMissed ? "فائتة" : STATUS_LABELS[s.status] || s.status || "--",
          // بيستخدم بس لحساب "أقرب حصة قادمة" في العنوان، مش بيتعرض في الجدول
          _sortDate: new Date(s.scheduledDate || s.startAt || 0),
        };
      });

      setLessons(mapped);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل الحصص");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = lessons.filter(
    (l) =>
      l.title.includes(search) &&
      (filterStatus === "جميع الحالات" || l.status === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedLessons = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const stats = {
    total: lessons.length,
    upcoming: lessons.filter((l) => l.status === "قادمة").length,
    completed: lessons.filter((l) => l.status === "منتهية").length,
    cancelled: lessons.filter((l) => l.status === "ملغية").length,
  };

  // العنوان بيفضّل عرض اسم حصة محددة بدل اسم المجموعة:
  // الأولوية للحصة اللي شغالة live دلوقتي، وبعدين أقرب حصة قادمة.
  // لو مفيش أي حصة live ولا قادمة، بيرجع يعرض اسم المجموعة كـ fallback.
  const liveLesson = lessons.find((l) => l.status === STATUS_LABELS.live);
  const nextUpcomingLesson = lessons
    .filter((l) => l.status === "قادمة")
    .sort((a, b) => a._sortDate - b._sortDate)[0];
  const highlightedLesson = liveLesson || nextUpcomingLesson || null;

  // ⚠️ افتراض: راوت عرض الحصة الواحدة مش متعرّف في الملف ده أصلاً — بنيت المسار
  // على نفس نمط باقي الروابط هنا (/teacher/groups/:id/lessons/... و/admin/groups/:id/lessons/...)
  // لازم تتأكد إن الراوت ده معرّف فعلاً في الـ router بتاعك.
  const highlightedLessonPath = highlightedLesson
    ? isAdmin
      ? `/admin/groups/${groupId}/lessons/${highlightedLesson.id}`
      : `/teacher/groups/${groupId}/lessons/${highlightedLesson.id}`
    : null;

  // ⚠️ مفيش endpoint لحذف/تعديل حصة منفردة في api.js الحالي (مفيش deleteSession/updateSession)
  // فالأزرار دي مؤقتًا بتعمل log بس لحد ما الـ endpoints دي تتضاف
  const handleEdit = (id) =>
    console.log("TODO: updateSession endpoint not available yet —", id);
  const handleDelete = (id) =>
    console.log("TODO: deleteSession endpoint not available yet —", id);

  // بيتفتح لما المعلم يدوس زرار "إنهاء الحصة" في الجدول (LessonsTable لازم يستدعي onEndSession(lesson))
  const handleEndRequest = (lesson) => {
    setEndError(null);
    setEndTarget(lesson);
  };

  const closeEndModal = () => {
    if (ending) return;
    setEndTarget(null);
    setEndError(null);
  };

  const handleConfirmEnd = async ({ title, description, files }) => {
    if (!endTarget) return;
    setEnding(true);
    setEndError(null);
    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description || "");
      files.forEach((file) => payload.append("attachments", file));

      await updateClassroomSession(endTarget.id, payload);
      await endSession(endTarget.id);
      setEndTarget(null);
      setToastMessage("تم حفظ تفاصيل الحصة وإنهاؤها بنجاح");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      fetchData();
    } catch (err) {
      console.error("endSession failed:", err.response?.data || err);
      setEndError(err.response?.data?.message || "حدث خطأ أثناء إنهاء الحصة");
    } finally {
      setEnding(false);
    }
  };

  return (
    <Layout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right relative"
        dir="rtl"
      >
        {/* Toast نجاح */}
        {showToast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white border border-[#D6E4C3] shadow-lg rounded-xl px-4 py-3 min-w-[280px]">
            <CheckCircle2 className="text-green-600 shrink-0" size={20} />
            <p className="text-sm text-[#1A1A1A] font-medium flex-1">
              {toastMessage}
            </p>
            <button
              onClick={() => setShowToast(false)}
              className="text-[#8C9198] hover:text-[#1A1A1A] shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            {highlightedLesson ? (
              <button
                type="button"
                onClick={() => navigate(highlightedLessonPath)}
                className="block text-right text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3 hover:underline"
              >
                {highlightedLesson.title}
              </button>
            ) : (
              <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
                {groupName || "مجموعة"}
              </h3>
            )}
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة كاملة لحصص هذه المجموعة: الجدول، الواجبات، والتقييمات في
              مكان واحد.
            </p>
          </div>
          {!isAdmin && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() =>
                  navigate(`/teacher/groups/${groupId}/lessons/schedule/new`)
                }
                className="w-full sm:w-40 h-12 rounded-lg bg-white border border-[#E5E5E5] text-[#1A1A1A] flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5"
              >
                {hasSchedule ? "تعديل الجدول" : "إنشاء جدول"}
              </button>
              <button
                onClick={() => navigate(`/teacher/groups/${groupId}/lessons/new`)}
                className="w-full sm:w-40 h-12 rounded-lg bg-[#123C91] text-white [&_svg]:text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5"
              >
                إنشاء حصة جديدة
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6">
          <LessonStatsBar
            total={stats.total}
            upcoming={stats.upcoming}
            completed={stats.completed}
            cancelled={stats.cancelled}
          />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <LessonFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
            filterTime={filterTime}
            onFilterTimeChange={setFilterTime}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]">
              جاري التحميل...
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <LessonsTable
              lessons={paginatedLessons}
              groupId={groupId}
              role={role}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onEndSession={handleEndRequest}
            />
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          displayedCount={paginatedLessons.length}
          onChange={(p) => setPage(p)}
          unitLabel="حصة"
        />
      </div>

      {endTarget && (
        <EndSessionDetailsModal
          open
          lesson={endTarget}
          loading={ending}
          error={endError}
          onConfirm={handleConfirmEnd}
          onClose={closeEndModal}
        />
      )}
    </Layout>
  );
};

export default GroupLessonsPage;