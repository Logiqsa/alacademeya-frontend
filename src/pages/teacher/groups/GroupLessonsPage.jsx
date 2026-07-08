import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CheckCircle2, X, AlertTriangle } from "lucide-react";

import LessonStatsBar from "../../../components/teacher/groups/lessons/LessonStatsBar";
import LessonsTable from "../../../components/teacher/groups/lessons/LessonsTable";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import Pagination from "../../../components/teacher/groups/lessons/Paginationn";
import {
  getClassroomSessions,
  getClassroom,
  getSessionAttendance,
  getClassroomSchedule,
  endSession,
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

// ─── End Session Confirm Modal ─────────────────────────────────────────────
const EndSessionModal = ({ open, lesson, loading, error, onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl" dir="rtl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-1">
              إنهاء الحصة
            </h3>
            <p className="text-sm text-[#575F69]">
              هل أنت متأكد من إنهاء حصة{" "}
              <strong className="text-[#1F2937]">"{lesson?.title}"</strong>؟ لن
              تتمكن من التراجع عن هذا الإجراء.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {loading ? "جاري الإنهاء..." : "إنهاء الحصة"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] font-['IBM_Plex_Sans_Arabic'] hover:border-[#123C91] transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const GroupLessonsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الاوقات");
  const [page, setPage] = useState(1);

  const [groupName, setGroupName] = useState("");
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
      setGroupName(
        resolveName(classroomResult.value.data?.data?.name) || "مجموعة",
      );
    } else {
      console.error("getClassroom failed:", classroomResult.reason);
      setGroupName("مجموعة");
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
          attendance = records.filter((r) => r.status === "present").length;
          absence = records.filter((r) => r.status === "absent").length;
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

  const handleConfirmEnd = async () => {
    if (!endTarget) return;
    setEnding(true);
    setEndError(null);
    try {
      await endSession(endTarget.id);
      setEndTarget(null);
      setToastMessage("تم إنهاء الحصة بنجاح");
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
    <TeacherLayout>
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
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              {groupName || "مجموعة"}
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة كاملة لحصص هذه المجموعة: الجدول، الواجبات، والتقييمات في
              مكان واحد.
            </p>
          </div>
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

      <EndSessionModal
        open={!!endTarget}
        lesson={endTarget}
        loading={ending}
        error={endError}
        onConfirm={handleConfirmEnd}
        onClose={closeEndModal}
      />
    </TeacherLayout>
  );
};

export default GroupLessonsPage;