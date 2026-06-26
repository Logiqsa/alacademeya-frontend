import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import AssignmentStatsBar from "../../../components/teacher/assignments/AssignmentStatsBar";
import AssignmentFilters from "../../../components/teacher/assignments/AssignmentFilters";
import AssignmentsTable from "../../../components/teacher/assignments/AssignmentsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ASSIGNMENTS = [
  { id: 1, title: "حل المعادلات", group: "الرياضيات A", lesson: "المعادلات التربيعية", dueDate: "2026 يونيو 21", submitted: 24, totalStudents: 28, status: "نشط", correctionStatus: "قيد التصحيح" },
  { id: 2, title: "مسائل تطبيقية", group: "الرياضيات A", lesson: "الهندسة", dueDate: "2026 يونيو 21", submitted: 28, totalStudents: 28, status: "منتهي", correctionStatus: "تم التصحيح" },
  { id: 3, title: "حل المعادلات", group: "الرياضيات C", lesson: "الجبر", dueDate: "2026 يونيو 21", submitted: 28, totalStudents: 28, status: "منتهي", correctionStatus: "لم يبدأ التصحيح" },
  { id: 4, title: "مراجعة شاملة", group: "الرياضيات A", lesson: "--", dueDate: "2026 يونيو 21", submitted: 24, totalStudents: 28, status: "منتهي", correctionStatus: "قيد التصحيح" },
  { id: 5, title: "حل المعادلات", group: "الرياضيات B", lesson: "المعادلات التربيعية", dueDate: "2026 يونيو 21", submitted: 24, totalStudents: 28, status: "نشط", correctionStatus: "لم يبدأ التصحيح" },
  { id: 6, title: "مسائل تطبيقية", group: "الرياضيات C", lesson: "المعادلات التربيعية_2", dueDate: "2026 يونيو 21", submitted: 20, totalStudents: 28, status: "منتهي", correctionStatus: "تم التصحيح" },
];

const PAGE_SIZE = 6;

const AssignmentsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("جميع المجموعات");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_ASSIGNMENTS.filter(
    (a) =>
      a.title.includes(search) &&
      (filterGroup === "جميع المجموعات" || a.group === filterGroup.replace("مجموعة ", "")) &&
      (filterStatus === "جميع الحالات" || a.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedAssignments = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    pendingCorrection: MOCK_ASSIGNMENTS.filter((a) => a.correctionStatus === "قيد التصحيح").length,
    corrected: MOCK_ASSIGNMENTS.filter((a) => a.correctionStatus === "تم التصحيح").length,
    active: MOCK_ASSIGNMENTS.filter((a) => a.status === "نشط").length,
    total: MOCK_ASSIGNMENTS.length,
  };

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">الواجبات</h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة ومتابعة جميع الواجبات في جميع المجموعات.
            </p>
          </div>
          <button
            onClick={() => navigate("/assignments/new")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إضافة واجب
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <AssignmentStatsBar {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <AssignmentFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterGroup={filterGroup}
            onFilterGroupChange={(v) => {
              setFilterGroup(v);
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
          <AssignmentsTable
            assignments={paginatedAssignments}
            onView={(id) => navigate(`/teacher/assignments/${id}`)}
          />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedAssignments.length}
          unitLabel="واجب"
        />
      </div>
    </TeacherLayout>
  );
};

export default AssignmentsPage;