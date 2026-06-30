import { useState } from "react";
import StudentLayout from "../../../components/student/layout/StudentLayout";
import ExamStatsBar from "../../../components/student/exam/Examstatsbar";
import ExamFilters from "../../../components/student/exam/Examfilters";
import ExamsTable from "../../../components/student/exam/Examstable";


// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EXAMS = [
  { id: 1, title: "حل المعادلات", group: "الرياضيات A", lesson: "المعادلات التربيعية", date: "2026 يونيو 21", status: "نشط", remainingTime: "الوقت المتبقي 2 ساعة", grade: null },
  { id: 2, title: "مسائل تطبيقية", group: "الرياضيات A", lesson: "الهندسة", date: "2026 يونيو 21", status: "مكتمل", grade: "28/30" },
  { id: 3, title: "حل المعادلات", group: "الرياضيات C", lesson: "الجبر", date: "2026 يونيو 21", status: "مكتمل", grade: "25/25" },
  { id: 4, title: "مراجعة شاملة", group: "الرياضيات A", lesson: "--", date: "2026 يونيو 21", status: "مكتمل", grade: "25/30" },
  { id: 5, title: "حل المعادلات", group: "الرياضيات B", lesson: "المعادلات التربيعية", date: "2026 يونيو 21", status: "نشط", remainingTime: "الوقت المتبقي 2 ساعة", grade: null },
  { id: 6, title: "مسائل تطبيقية", group: "الرياضيات C", lesson: "المعادلات التربيعية_2", date: "2026 يونيو 21", status: "مكتمل", grade: "25/25" },
];

const StudentExamsPage = () => {
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");

  const filtered = MOCK_EXAMS.filter(
    (e) =>
      e.title.includes(search) &&
      (filterGroup === "جميع المجموعات" || e.group === filterGroup.replace("مجموعة ", "")) &&
      (filterStatus === "جميع الحالات" || e.status === filterStatus)
  );

  const stats = {
    total: MOCK_EXAMS.length,
    active: MOCK_EXAMS.filter((e) => e.status === "نشط").length,
    completed: MOCK_EXAMS.filter((e) => e.status === "مكتمل").length,
    incomplete: MOCK_EXAMS.filter((e) => e.status === "نشط").length,
  };

  return (
    <StudentLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            إدارة الاختبارات
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            إنشاء اختبارات MCQ ومكتوبة مع تحديد المجموعة والحصة
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <ExamStatsBar
            total={stats.total}
            active={stats.active}
            completed={stats.completed}
            incomplete={stats.incomplete}
          />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ExamFilters
            search={search}
            onSearchChange={setSearch}
            filterGroup={filterGroup}
            onFilterGroupChange={setFilterGroup}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <ExamsTable exams={filtered} />
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentExamsPage;