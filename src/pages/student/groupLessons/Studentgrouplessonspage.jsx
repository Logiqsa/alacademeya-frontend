import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonStatsBar from "../../../components/student/groupLesson/Lessonstatsbar";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import LessonsTable from "../../../components/student/groupLesson/Lessonstable";
import Paginationn from "../../../components/teacher/groups/lessons/Paginationn";
import { getClassroom, getClassroomSchedule } from "../../../services/authService";
import { generateLessonInstances, computeLessonStatus, DEFAULT_LESSON_DURATION_MIN } from "../../../utils/scheduleWeek";

const ITEMS_PER_PAGE = 5;

const STATUS_LABELS = {
  upcoming: "قادمة",
  live: "مباشر الآن",
  ended: "منتهية",
};

const resolveName = (val) => (typeof val === "string" ? val : val?.ar || val?.en || "--");

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

    // ⚠️ endpoint الـ sessions مش شغال حاليًا، فبنستخدم /classrooms/:id/schedule
    // (النمط الأسبوعي المتكرر) وبنولّد منه حصص بتواريخ حقيقية
    const [classroomResult, scheduleResult] = await Promise.allSettled([
      getClassroom(groupId),
      getClassroomSchedule(groupId),
    ]);

    if (classroomResult.status === "fulfilled") {
      const classroomData = classroomResult.value.data?.data?.classroom ?? classroomResult.value.data?.data;
      setGroupName(resolveName(classroomData?.name) || "مجموعة");
    } else {
      console.error("getClassroom failed:", classroomResult.reason);
      setGroupName("مجموعة");
    }

    if (scheduleResult.status === "rejected") {
      console.error("getClassroomSchedule failed:", scheduleResult.reason);
      setError("حدث خطأ أثناء تحميل جدول الحصص");
      setLoading(false);
      return;
    }

    try {
      const schedule = scheduleResult.value.data?.data?.schedule ?? [];
      const instances = generateLessonInstances(schedule, { weeksBack: 8, weeksForward: 4 });

      const mapped = instances.map((inst) => {
        const status = computeLessonStatus(inst.date);
        return {
          id: inst.id,
          title: "حصة",
          date: inst.date.toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          time: inst.date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
          duration: DEFAULT_LESSON_DURATION_MIN,
          status: STATUS_LABELS[status] || status,
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
    (l) => l.title.includes(search) && (filterStatus === "جميع الحالات" || l.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedLessons = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = {
    total: lessons.length,
    upcoming: lessons.filter((l) => l.status === "قادمة").length,
    completed: lessons.filter((l) => l.status === "منتهية").length,
    cancelled: 0, // ⚠️ مفيش بيانات إلغاء متاحة من الجدول الأسبوعي
  };

  return (
    <StudentLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
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
              onView={(id) => navigate(`/student/groups/${groupId}/lessons/${id}`)}
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