import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import LessonStatsBar from "../../../components/student/groupLesson/Lessonstatsbar";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import LessonsTable from "../../../components/student/groupLesson/Lessonstable";
import Paginationn from "../../../components/teacher/groups/lessons/Paginationn";



// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LESSONS = [
  { id: 1, title: "المصفوفات_2", date: "السبت 21 يونيو 2026", time: "06:00 PM", duration: 45, status: "قادمة" },
  { id: 2, title: "المصفوفات_1", date: "غداً 18 يونيو 2026", time: "08:30 PM", duration: 40, status: "قادمة" },
  { id: 3, title: "التبادليل والتوافيق", date: "اليوم 17 يونيو 2026", time: "06:00 PM", duration: 60, status: "مباشر الآن" },
  { id: 4, title: "المتتاليات", date: "السبت 24 مايو 2026", time: "05:30 PM", duration: 50, status: "ملغية" },
  { id: 5, title: "العدد الأولى", date: "السبت 24 مايو 2026", time: "11:00 AM", duration: 40, status: "منتهية" },
  { id: 6, title: "القيل الحسابي", date: "السبت 24 مايو 2026", time: "06:00 PM", duration: 60, status: "منتهية" },
];

const ITEMS_PER_PAGE = 5;

// ─── Page ─────────────────────────────────────────────────────────────────────
const StudentGroupLessonsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [filterTime, setFilterTime] = useState("جميع الاوقات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_LESSONS.filter(
    (l) => l.title.includes(search) && (filterStatus === "جميع الحالات" || l.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedLessons = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <StudentLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            مجموعة الرياضيات A
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            تابع كل حصصك: الجدول، الواجبات، والتسجيلات في مكان واحد.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <LessonStatsBar />
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
          <LessonsTable
            lessons={paginatedLessons}
            onView={(id) => navigate(`/student/groups/${groupId}/lessons/${id}`)}
          />
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