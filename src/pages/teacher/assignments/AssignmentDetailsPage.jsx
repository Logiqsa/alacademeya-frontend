import { useState } from "react";
import { useParams } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import AssignmentDetailsStatsCards from "../../../components/teacher/assignments/AssignmentDetailsStatsCards";
import AssignmentDetailsFilters from "../../../components/teacher/assignments/AssignmentDetailsFilters";
import StudentSubmissionsTable from "../../../components/teacher/assignments/StudentSubmissionsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ASSIGNMENT = {
  id: 1,
  title: "حل المعادلات",
  subtitle: "إدارة ومتابعة واجبات الطلاب وتصحيحها.",
  stats: {
    pendingCorrection: 2,
    corrected: 22,
    totalSubmissions: 24,
  },
  students: [
    { id: 1, name: "ريم سعد", initial: "ر", submitted: true, submittedCount: "18/20", correctionStatus: "تم التصحيح" },
    { id: 2, name: "محمد احمد", initial: "م", submitted: true, submittedCount: "15/20", correctionStatus: "تم التصحيح" },
    { id: 3, name: "عبدالحميد محمد", initial: "ع", submitted: true, submittedCount: "—", correctionStatus: "قيد التصحيح" },
    { id: 4, name: "صلاح علي", initial: "ص", submitted: true, submittedCount: "—", correctionStatus: "قيد التصحيح" },
    { id: 5, name: "شهد عادل", initial: "ش", submitted: true, submittedCount: "—", correctionStatus: "قيد التصحيح" },
    { id: 6, name: "سمير السيد", initial: "س", submitted: false },
    { id: 7, name: "ملك محمد", initial: "م", submitted: false },
  ],
};

const PAGE_SIZE = 5;

// ─── Main Page ────────────────────────────────────────────────────────────────
const AssignmentDetailsPage = () => {
  const { assignmentId } = useParams();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الطلاب");
  const [page, setPage] = useState(1);

  // In production, fetch the assignment by `assignmentId` here.
  const assignment = MOCK_ASSIGNMENT;

  const filtered = assignment.students.filter((s) => {
    const matchesSearch = s.name.includes(search);
    const matchesFilter =
      filterStatus === "جميع الطلاب" ||
      (filterStatus === "تم التسليم" && s.submitted) ||
      (filterStatus === "لم يسلّم" && !s.submitted);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Assignment header */}
        <div className="mb-6">
          <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-1">{assignment.title}</h3>
          <p className="text-[16px] font-normal leading-6 text-[#575F69]">{assignment.subtitle}</p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <AssignmentDetailsStatsCards stats={assignment.stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <AssignmentDetailsFilters
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
          <StudentSubmissionsTable
            students={paginatedStudents}
            onAction={(student) =>
              console.log("correct/edit submission for", student.id, "in assignment", assignmentId)
            }
          />
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

export default AssignmentDetailsPage;