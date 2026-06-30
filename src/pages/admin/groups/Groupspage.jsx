import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import GroupsFilters from "../../../components/admin/groups/GroupsFilters";
import GroupTable from "../../../components/admin/groups/Groupstable";
import GroupsStatsBar from "../../../components/admin/groups/Groupsstatsbar";

const MOCK_GROUPS = [
  { id: 1, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 25, capacity: 25, status: "مكتملة العدد" },
  { id: 2, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 18, capacity: 25, status: "نشطة" },
  { id: 3, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 25, capacity: 25, status: "مكتملة العدد" },
  { id: 4, name: "مجموعة الرياضيات A", teacher: null, subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 0, capacity: 0, status: "قيد التسجيل" },
  { id: 5, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 18, capacity: 25, status: "منتهية" },
  { id: 6, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 18, capacity: 20, status: "متوقفة" },
  { id: 7, name: "مجموعة الرياضيات B", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الثاني الثانوي", enrolled: 22, capacity: 25, status: "نشطة" },
  { id: 8, name: "مجموعة الرياضيات C", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الثالث الثانوي", enrolled: 25, capacity: 25, status: "مكتملة العدد" },
  { id: 9, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 10, capacity: 25, status: "نشطة" },
  { id: 10, name: "مجموعة الرياضيات B", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الثاني الثانوي", enrolled: 25, capacity: 25, status: "مكتملة العدد" },
  { id: 11, name: "مجموعة الرياضيات C", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الثالث الثانوي", enrolled: 5, capacity: 25, status: "متوقفة" },
  { id: 12, name: "مجموعة الرياضيات A", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الأول الثانوي", enrolled: 20, capacity: 25, status: "نشطة" },
  { id: 13, name: "مجموعة الرياضيات B", teacher: null, subject: "رياضيات", stage: "ثانوية", grade: "الثاني الثانوي", enrolled: 0, capacity: 0, status: "قيد التسجيل" },
  { id: 14, name: "مجموعة الرياضيات C", teacher: "محمد أحمد", subject: "رياضيات", stage: "ثانوية", grade: "الثالث الثانوي", enrolled: 18, capacity: 20, status: "منتهية" },
];

const PAGE_SIZE = 6;

const GroupsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("جميع المواد");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_GROUPS.filter(
    (g) =>
      (g.name.includes(search) || (g.teacher ?? "").includes(search) || g.subject.includes(search)) &&
      (filterSubject === "جميع المواد" || g.subject === filterSubject) &&
      (filterStatus === "جميع الحالات" || g.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedGroups = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    paused: MOCK_GROUPS.filter((g) => g.status === "متوقفة").length,
    active: MOCK_GROUPS.filter((g) => g.status === "نشطة").length,
    full: MOCK_GROUPS.filter((g) => g.status === "مكتملة العدد").length,
    total: MOCK_GROUPS.length,
  };

  return (
    <AdminLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="order-2 sm:order-1">
            <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">إدارة المجموعات</h3>
            <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
              مراقبة وإدارة المجموعات الدراسية على المنصة.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/groups/new")}
            className="order-1 sm:order-2 w-full sm:w-auto px-5 h-12 rounded-lg bg-[#123C91] text-white flex items-center justify-center gap-2 font-['Tajawal'] font-medium text-[16px] shrink-0"
          >
            <Plus size={18} />
            إنشاء مجموعة
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <GroupsStatsBar {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <GroupsFilters
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            filterSubject={filterSubject}
            onFilterSubjectChange={(v) => { setFilterSubject(v); setPage(1); }}
            filterStatus={filterStatus}
            onFilterStatusChange={(v) => { setFilterStatus(v); setPage(1); }}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          <GroupTable groups={paginatedGroups} />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedGroups.length}
          unitLabel="مجموعة"
        />
      </div>
    </AdminLayout>
  );
};

export default GroupsPage;