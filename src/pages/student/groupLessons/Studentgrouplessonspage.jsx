import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonStatsBar from "../../../components/student/groupLesson/Lessonstatsbar";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import LessonsTable from "../../../components/student/groupLesson/Lessonstable";
import Paginationn from "../../../components/teacher/groups/lessons/Paginationn";
import { getClassroom, getClassroomSessions } from "../../../services/authService";

const ITEMS_PER_PAGE = 5;

// status enum زي ما راجعة فعلاً من الـ API
const STATUS_LABELS = {
  scheduled: "قادمة",
  upcoming: "قادمة",
  live: "مباشر الآن",
  completed: "منتهية",
  cancelled: "ملغية",
};

const resolveName = (val) => (typeof val === "string" ? val : val?.ar || val?.en || "--");

// ─── Page ─────────────────────────────────────────────────────────────────────
const StudentGroupLessonsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الاوقات");
  const [page, setPage] = useState(1);

  const [groupName, setGroupName] = useState("");
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // بنستخدم allSettled عشان لو endpoint الـ classroom فشل، الصفحة تفضل تعرض الحصص عادي
    const [classroomResult, sessionsResult] = await Promise.allSettled([
      getClassroom(groupId),
      getClassroomSessions(groupId),
    ]);

    if (classroomResult.status === "fulfilled") {
      setGroupName(resolveName(classroomResult.value.data?.data?.name) || "مجموعة");
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
      const rawSessions = sessionsResult.value.data?.data || [];

      const mapped = rawSessions.map((s) => ({
        id: s.id,
        title: s.title || "حصة",
        date: s.scheduledDate
          ? new Date(s.scheduledDate).toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "--",
        time: s.scheduledDate
          ? new Date(s.scheduledDate).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--",
        duration: typeof s.duration === "number" ? s.duration : "--",
        status: STATUS_LABELS[s.status] || s.status || "--",
      }));

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
    (l) => l.title.includes(search) && (filterStatus === "جميع الحالات" || l.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedLessons = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = {
    total: lessons.length,
    upcoming: lessons.filter((l) => l.status === "قادمة").length,
    completed: lessons.filter((l) => l.status === "منتهية").length,
    cancelled: lessons.filter((l) => l.status === "ملغية").length,
  };

  return (
    <StudentLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            {groupName || "مجموعة"}
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            تابع كل حصصك: الجدول، الواجبات، والتسجيلات في مكان واحد.
          </p>
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
              onView={(id) => navigate(`/student/groups/${groupId}/lessons/${id}`)}
            />
          )}
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          totalItems={filtered.length}
          displayedCount={paginatedLessons.length}
          onChange={(p) => setPage(p)}
          unitLabel="حصة"
        />
      </div>
    </StudentLayout>
  );
};

export default StudentGroupLessonsPage;