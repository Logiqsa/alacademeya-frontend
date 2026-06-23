import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import StudentStatsBar from "../../../components/teacher/groups/students/StudentStatsBar";
import StudentFilters from "../../../components/teacher/groups/students/StudentFilters";
import StudentsTable from "../../../components/teacher/groups/students/StudentsTable";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STUDENTS = [
  { id: 1, name: "محمد أحمد", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "احمد علي", status: "نشط" },
  { id: 2, name: "احمد سامى", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "سامى علي", status: "مستبعد" },
  { id: 3, name: "سميرة شادي", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "شادي صلاح", status: "نشط" },
  { id: 4, name: "زين محمد", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "محمد كريف", status: "نشط" },
  { id: 5, name: "مليكه محمد", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "محمد علي", status: "نشط" },
  { id: 6, name: "محمد باسل", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "باسل احمد", status: "مستبعد" },
  { id: 7, name: "فاطمة عمر", joinDate: "السبت 21 يونيو 2026", phone: "01234569874", parent: "عمر حسن", status: "نشط" },
];

const PAGE_SIZE = 6;

// ─── Main Page ────────────────────────────────────────────────────────────────
const GroupStudentsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_STUDENTS.filter(
    (s) => s.name.includes(search) && (filterStatus === "جميع الحالات" || s.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <TeacherLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">مجموعة الرياضيات A</h3>
            <p className="text-[16px] font-normal leading-6 text-[#575F69]">
              إدارة طلاب هذه المجموعة: متابعة الحضور، الدرجات، والبيانات الشخصية.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StudentStatsBar />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <StudentFilters search={search} onSearchChange={setSearch} filterStatus={filterStatus} onFilterStatusChange={setFilterStatus} />
        </div>

        {/* Table */}
        <div className="mt-4">
          <StudentsTable students={paginatedStudents} onView={(id) => navigate(`/teacher/groups/${groupId}/students/${id}`)} />
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

export default GroupStudentsPage;