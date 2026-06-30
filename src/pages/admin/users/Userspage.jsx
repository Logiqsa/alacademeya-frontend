import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import UsersStatsBar from "../../../components/admin/users/Usersstatsbar";
import UsersFilters from "../../../components/admin/users/Usersfilters";
import UsersTable from "../../../components/admin/users/Userstable";
import { getUsers, deleteUser as deleteUserApi, updateUser } from "../../../services/authService";

const PAGE_SIZE = 6;

// ─── Mapping helpers ──────────────────────────────────────────────────────────
const ROLE_MAP = { student: "طالب", teacher: "معلم", parent: "ولي أمر" };

const statusOf = (u) => {
  if (u.isDeleted) return "محذوف";
  if (!u.isActive) return "موقوف";
  if (u.registrationStatus === "pending") return "معلق";
  return "نشط";
};

const mapUser = (u) => ({
  id: u.id || u._id,
  name: u.fullName || u.name || "—",
  username: u.username,
  email: u.email,
  phone: u.phone,
  role: ROLE_MAP[u.role] || u.role,
  rawRole: u.role,
  country: u.country,
  isVerified: u.isVerified,
  isDeleted: !!u.isDeleted,
  isActive: !!u.isActive,
  registrationStatus: u.registrationStatus,
  status: statusOf(u),
  joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-CA") : "—",
});

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("جميع المستخدمين");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers()
      .then((res) => {
        const list = res.data?.data || [];
        setUsers(Array.isArray(list) ? list.map(mapUser) : []);
      })
      .catch(() => toast.error("تعذر تحميل المستخدمين"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // استبعد أي مستخدم متعمله soft-delete من كل الحسابات والعرض
  const activeUsers = users.filter((u) => !u.isDeleted);

  const filtered = activeUsers.filter(
    (u) =>
      (u.name?.includes(search) || u.email?.includes(search)) &&
      (filterRole === "جميع المستخدمين" || u.role === filterRole) &&
      (filterStatus === "جميع الحالات" || u.status === filterStatus)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // لو الصفحة الحالية بقت برّه النطاق (بعد حذف/فلترة) رجّعها لآخر صفحة متاحة
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    admins: activeUsers.filter((u) => u.role === "ولي أمر").length,
    teachers: activeUsers.filter((u) => u.role === "معلم").length,
    students: activeUsers.filter((u) => u.role === "طالب").length,
    total: activeUsers.length,
  };

  const handleView = (id) => navigate(`/admin/users/${id}`);
  const handleEdit = (id) => navigate(`/admin/users/${id}/edit`);

  const handleToggleStatus = async (user) => {
    const willActivate = user.status === "موقوف" || user.status === "معلق";
    try {
      await updateUser(user.id, { isActive: willActivate });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isActive: willActivate, status: willActivate ? "نشط" : "موقوف" }
            : u
        )
      );
      toast.success(willActivate ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر تحديث حالة المستخدم");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      // شيل المستخدم فورًا من القائمة (الجدول والـ stats بتتحدث تلقائيًا لإنهم بيقروا من نفس الـ state)
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("تم حذف المستخدم");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر حذف المستخدم");
    }
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
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69] font-['IBM_Plex_Sans_Arabic']">
              جاري التحميل...
            </div>
          ) : (
            <UsersTable
              users={paginatedUsers}
              onView={handleView}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}
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