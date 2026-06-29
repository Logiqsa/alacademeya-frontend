import { useState } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";

import AttendanceStatsBar from "../../../../components/admin/groups/attendance/AttendanceStatsBar";
import AttendanceTable from "../../../../components/admin/groups/attendance/AttendanceTable";
import Paginationn from "../../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../../components/admin/layout/AdminLayout";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RECORDS = [
  { id: 1, studentName: "محمد أحمد", attendanceCount: 18, absenceCount: 2 },
  { id: 2, studentName: "محمد أحمد", attendanceCount: 17, absenceCount: 3 },
  { id: 3, studentName: "محمد أحمد", attendanceCount: 18, absenceCount: 2 },
  { id: 4, studentName: "محمد أحمد", attendanceCount: 19, absenceCount: 1 },
  { id: 5, studentName: "محمد أحمد", attendanceCount: 20, absenceCount: 0 },
  { id: 6, studentName: "محمد أحمد", attendanceCount: 16, absenceCount: 4 },
  { id: 7, studentName: "محمد أحمد", attendanceCount: 18, absenceCount: 2 },
  { id: 8, studentName: "محمد أحمد", attendanceCount: 15, absenceCount: 5 },
  { id: 9, studentName: "محمد أحمد", attendanceCount: 20, absenceCount: 0 },
  { id: 10, studentName: "محمد أحمد", attendanceCount: 19, absenceCount: 1 },
  { id: 11, studentName: "محمد أحمد", attendanceCount: 17, absenceCount: 3 },
  { id: 12, studentName: "محمد أحمد", attendanceCount: 18, absenceCount: 2 },
];

const PAGE_SIZE = 6;

const AttendancePage = () => {
  const { groupId } = useParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_RECORDS.filter((r) => r.studentName.includes(search));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    absences: MOCK_RECORDS.reduce((sum, r) => sum + r.absenceCount, 0),
    attendances: MOCK_RECORDS.reduce((sum, r) => sum + r.attendanceCount, 0),
    students: MOCK_RECORDS.length,
    sessions: 20,
  };

  return (
    <AdminLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">سجل الحضور</h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            تابع حضور وغياب الطلاب{groupId ? ` لمجموعة رقم ${groupId}` : ""}.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <AttendanceStatsBar {...stats} />
        </div>

        {/* Search */}
        <div className="relative w-full mb-4" style={{ height: "48px" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="بحث باسم الطالب..."
            className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
        </div>

        {/* Table */}
        <AttendanceTable records={paginatedRecords} />

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedRecords.length}
          unitLabel="طالب"
        />
      </div>
    </AdminLayout>
  );
};

export default AttendancePage;