import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import UsersStatsBar from "../../../components/admin/users/Usersstatsbar";
import UsersFilters from "../../../components/admin/users/Usersfilters";
import UsersTable from "../../../components/admin/users/Userstable";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 1, name: "محمد أحمد", email: "mohamed@gmail.com", role: "معلم", status: "نشط", joinDate: "2024-09-01" },
  { id: 2, name: "محمد أحمد", email: "mohamed@gmail.com", role: "طالب", status: "نشط", joinDate: "2024-09-01" },
  { id: 3, name: "محمد أحمد", email: "mohamed@gmail.com", role: "طالب", status: "معلق", joinDate: "2024-09-01" },
  { id: 4, name: "محمد أحمد", email: "mohamed@gmail.com", role: "ولي أمر", status: "نشط", joinDate: "2024-09-01" },
  { id: 5, name: "محمد أحمد", email: "mohamed@gmail.com", role: "معلم", status: "موقوف", joinDate: "2024-09-01" },
  { id: 6, name: "محمد أحمد", email: "mohamed@gmail.com", role: "ولي أمر", status: "نشط", joinDate: "2024-09-01" },
  { id: 7, name: "محمد أحمد", email: "mohamed@gmail.com", role: "طالب", status: "نشط", joinDate: "2024-09-02" },
  { id: 8, name: "محمد أحمد", email: "mohamed@gmail.com", role: "معلم", status: "نشط", joinDate: "2024-09-02" },
  { id: 9, name: "محمد أحمد", email: "mohamed@gmail.com", role: "طالب", status: "معلق", joinDate: "2024-09-02" },
  { id: 10, name: "محمد أحمد", email: "mohamed@gmail.com", role: "ولي أمر", status: "نشط", joinDate: "2024-09-02" },
  { id: 11, name: "محمد أحمد", email: "mohamed@gmail.com", role: "طالب", status: "نشط", joinDate: "2024-09-03" },
  { id: 12, name: "محمد أحمد", email: "mohamed@gmail.com", role: "معلم", status: "نشط", joinDate: "2024-09-03" },
];

const PAGE_SIZE = 6;

const UsersPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("جميع المستخدمين");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const filtered = MOCK_USERS.filter(
    (u) =>
      (u.name.includes(search) || u.email.includes(search)) &&
      (filterRole === "جميع المستخدمين" || u.role === filterRole) &&
      (filterStatus === "جميع الحالات" || u.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    admins: MOCK_USERS.filter((u) => u.role === "ولي أمر").length,
    teachers: MOCK_USERS.filter((u) => u.role === "معلم").length,
    students: MOCK_USERS.filter((u) => u.role === "طالب").length,
    total: MOCK_USERS.length,
  };

  const handleView = (id) => navigate(`/admin/users/${id}`);
  const handleEdit = (id) => navigate(`/admin/users/${id}/edit`);
  const handleToggleStatus = (id) => {
    // Wire up to real API call as needed
    console.log("toggle status for", id);
  };
  const handleDelete = (id) => {
    // Wire up to real API call / confirmation modal as needed
    console.log("delete user", id);
  };

  return (
    <AdminLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            إدارة المستخدمين
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            إدارة جميع حسابات المنصة.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <UsersStatsBar {...stats} />
        </div>

        {/* Filters */}
        <div className="bg-white mt-6 border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <UsersFilters
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            filterRole={filterRole}
            onFilterRoleChange={(v) => {
              setFilterRole(v);
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
          <UsersTable
            users={paginatedUsers}
            onView={handleView}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        </div>

        {/* Pagination */}
        <Paginationn
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filtered.length}
          displayedCount={paginatedUsers.length}
          unitLabel="مستخدم"
        />
      </div>
    </AdminLayout>
  );
};

export default UsersPage;