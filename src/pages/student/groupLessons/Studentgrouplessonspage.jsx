import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonStatsBar from "../../../components/student/groupLesson/Lessonstatsbar";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import LessonsTable from "../../../components/student/groupLesson/Lessonstable";
import Paginationn from "../../../components/teacher/groups/lessons/Paginationn";
import {
  getMyClassrooms,
  getClassroomSessions,
} from "../../../services/APIService";

const ITEMS_PER_PAGE = 5;

const STATUS_LABELS = {
  upcoming: "قادمة",
  live: "مباشر الآن",
  ended: "منتهية",
  cancelled: "ملغاة",
  missed: "فائتة",
};

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "--";

// بيحسب حالة العرض اعتمادًا على status الحقيقي من الباك إند، وعلى التوقيت لو لسه "scheduled"
const computeDisplayStatus = (session) => {
  if (session.status === "completed") return "ended";
  if (session.status === "cancelled") return "cancelled";
  if (["live", "active"].includes(session.status)) return "live";

  const start = new Date(session.scheduledDate || session.startAt);
  const now = new Date();

  if (now < start) return "upcoming";
  return "missed";
};

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

    const [classroomsResult, sessionsResult] = await Promise.allSettled([
      getMyClassrooms(),
      getClassroomSessions(groupId),
    ]);

    if (classroomsResult.status === "fulfilled") {
      const classrooms = classroomsResult.value.data?.data ?? [];
      const classroomData = classrooms.find((c) => (c.id ?? c._id) === groupId);
      setGroupName(resolveName(classroomData?.name) || "مجموعة");
    } else {
      console.error("getMyClassrooms failed:", classroomsResult.reason);
      setGroupName("مجموعة");
    }

    if (sessionsResult.status === "rejected") {
      console.error("getClassroomSessions failed:", sessionsResult.reason);
      setError("حدث خطأ أثناء تحميل جدول الحصص");
      setLoading(false);
      return;
    }

    try {
      const sessions = sessionsResult.value.data?.data ?? [];

      const mapped = sessions
        .map((s) => {
          const date = new Date(s.scheduledDate || s.startAt);
          const status = computeDisplayStatus(s);
          return {
            id: s.id ?? s._id,
            title: s.title || "حصة",
            date: date.toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            time: date.toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            duration: s.duration || 45,
            status: STATUS_LABELS[status] || status,
            _sortDate: date,
          };
        })
        .sort((a, b) => b._sortDate - a._sortDate);

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
    cancelled: lessons.filter((l) => l.status === "ملغاة").length,
  };

  return (
    <StudentLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            {groupName || "مجموعة"}
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            تابع كل حصصك: الجدول، الواجبات، والتسجيلات في مكان واحد.
          </p>
        </div>

        <div className="mb-6">
          <LessonStatsBar
            total={stats.total}
            upcoming={stats.upcoming}
            completed={stats.completed}
            cancelled={stats.cancelled}
          />
        </div>

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
              onView={(id) =>
                navigate(`/student/groups/${groupId}/lessons/${id}`)
              }
            />
          )}
        </div>

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
