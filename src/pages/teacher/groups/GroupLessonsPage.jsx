import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LessonStatsBar from "../../../components/teacher/groups/lessons/LessonStatsBar";
import LessonsTable from "../../../components/teacher/groups/lessons/LessonsTable";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import LessonFilters from "../../../components/teacher/groups/lessons/LessonFilter";
import Pagination from "../../../components/teacher/groups/lessons/Paginationn";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_LESSONS = [
  { id: 1, title: "المصفوفات_2", date: "السبت 21 يونيو 2026", time: "06:00 PM", duration: 45, attendance: null, absence: null, status: "قادمة" },
  { id: 2, title: "المصفوفات_1", date: "غداً 18 يونيو 2026", time: "08:30 PM", duration: 40, attendance: null, absence: null, status: "قادمة" },
  { id: 3, title: "التبادليل والتوافيق", date: "اليوم 17 يونيو 2026", time: "06:00 PM", duration: 60, attendance: 21, absence: 1, status: "مباشر الآن" },
  { id: 4, title: "المتتاليات", date: "السبت 24 مايو 2026", time: "05:30 PM", duration: 50, attendance: null, absence: null, status: "ملغية" },
  { id: 5, title: "العدد الأولى", date: "السبت 24 مايو 2026", time: "11:00 AM", duration: 40, attendance: 19, absence: 3, status: "منتهية" },
  { id: 6, title: "القيل الحسابي", date: "السبت 24 مايو 2026", time: "06:00 PM", duration: 60, attendance: 22, absence: 0, status: "منتهية" },
];

const ITEMS_PER_PAGE = 5;

// ─── Page ─────────────────────────────────────────────────────────────────────
const GroupLessonsPage = () => {
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
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
              مجموعة الرياضيات A
            </h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة كاملة لحصص هذه المجموعة: الجدول، الواجبات، والتقييمات في مكان واحد.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-new-lesson")}
            className="w-full sm:w-40 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center font-['Tajawal'] font-medium text-[16px] leading-5.5 shrink-0"
          >
            إنشاء حصة جديدة
          </button>
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
            onView={(id) => console.log("view", id)}
            onEdit={(id) => console.log("edit", id)}
            onDelete={(id) => console.log("delete", id)}
          />
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
    </TeacherLayout>
  );
};

export default GroupLessonsPage;