import { useState } from "react";
import { useParams } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import ExamDetailsStatsCards from "../../../components/teacher/exam/ExamDetailsStatsCards";
import ExamDetailsFilters from "../../../components/teacher/exam/ExamDetailsFilters";
import StudentExamSubmissionsTable from "../../../components/teacher/exam/StudentExamSubmissionsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_EXAM = {
  id: 1,
  title: "حل المعادلات",
  subtitle: "إدارة ومتابعة اختبارات الطلاب ونتائجهم.",
  stats: {
    notStarted: 2,
    completed: 7,
    totalSubmissions: 12,
  },
  students: [
    { id: 1, name: "ريم سعد",          initial: "ر", completed: true,  score: "20/25" },
    { id: 2, name: "محمد احمد",        initial: "م", completed: true,  score: "18/25" },
    { id: 3, name: "شهد عادل",         initial: "ش", completed: true,  score: "17/25" },
    { id: 4, name: "صلاح علي",         initial: "ص", completed: true,  score: "22/25" },
    { id: 5, name: "سمير السيد",       initial: "س", completed: false },
    { id: 6, name: "عبدالحميد محمد",   initial: "ع", completed: true,  score: "18/20" },
    { id: 7, name: "ملك محمد",         initial: "م", completed: false },
  ],
};

const PAGE_SIZE = 5;

// ─── Main Page ────────────────────────────────────────────────────────────────
const ExamDetailsPage = () => {
  const { examId } = useParams();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الطلاب");
  const [page, setPage] = useState(1);

  // In production, fetch exam by `examId` here.
  const exam = MOCK_EXAM;

  const filtered = exam.students.filter((s) => {
    const matchesSearch = s.name.includes(search);
    const matchesFilter =
      filterStatus === "جميع الطلاب" ||
      (filterStatus === "أكمل الاختبار" && s.completed) ||
      (filterStatus === "لم يؤد الاختبار" && !s.completed);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-1">{exam.title}</h3>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">{exam.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <ExamDetailsStatsCards stats={exam.stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ExamDetailsFilters
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
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <StudentExamSubmissionsTable students={paginatedStudents} />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedStudents.length}
          unitLabel="طالب"
        />
      </div>
    </TeacherLayout>
  );
};

export default ExamDetailsPage;