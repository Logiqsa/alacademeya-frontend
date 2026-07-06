import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import UsersStatsBar from "../../../components/admin/users/Usersstatsbar";
import UsersFilters from "../../../components/admin/users/Usersfilters";
import UsersTable from "../../../components/admin/users/Userstable";
import {
  getUsers,
  deleteUser as deleteUserApi,
  getAllStudents,
  getTeachers,
  updateUser,
  updateStudentProfile,
  updateTeacherProfile,
} from "../../../services/APIService";

const PAGE_SIZE = 6;
const FETCH_LIMIT = 100; // حجم كل صفحة وإحنا بنجيب البيانات من السيرفر

// ─── Mapping helpers ──────────────────────────────────────────────────────────
const ROLE_MAP = {
  student: "طالب",
  teacher: "معلم",
  parent: "ولي أمر",
  admin: "مشرف",
};

const statusOf = (u) => {
  if (u.isDeleted) return "محذوف";
  if (!u.isActive) return "موقوف";
  if (u.registrationStatus?.startsWith("pending")) return "معلق";
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
  joinDate: u.createdAt
    ? new Date(u.createdAt).toLocaleDateString("en-CA")
    : "—",
});

// ─── يجيب كل اليوزرز من كل الصفحات (بيتعامل مع أي شكل pagination من السيرفر) ──
const fetchAllUsers = async () => {
  let all = [];
  let page = 1;

  while (true) {
    const res = await getUsers({ page, limit: FETCH_LIMIT });
    const body = res.data || {};
    const list = body.data || body.users || (Array.isArray(body) ? body : []);

    all = all.concat(list);

    // نحاول نلاقي معلومات الـ pagination بأي شكل شائع
    const total =
      body.total ?? body.count ?? body.pagination?.total ?? body.meta?.total;
    const totalPages =
      body.totalPages ??
      body.pagination?.totalPages ??
      (total ? Math.ceil(total / FETCH_LIMIT) : null);

    if (totalPages) {
      if (page >= totalPages) break;
    } else {
      // مفيش معلومات pagination واضحة → لو الصفحة رجعت أقل من الـ limit يبقى خلصنا
      if (list.length < FETCH_LIMIT) break;
    }

    page += 1;
    if (page > 100) break; // حماية من infinite loop
  }

  return all;
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("جميع المستخدمين");
  const [filterStatus, setFilterStatus] = useState("جميع الحالات");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAllUsers();
      setUsers(Array.isArray(list) ? list.map(mapUser) : []);
    } catch (err) {
      console.error(err);
      toast.error("تعذر تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // استبعد أي مستخدم متعمله soft-delete من الجدول والإحصائيات
  const visibleUsers = users.filter((u) => !u.isDeleted);

  const filtered = visibleUsers.filter(
    (u) =>
      (u.name?.includes(search) || u.email?.includes(search)) &&
      (filterRole === "جميع المستخدمين" || u.role === filterRole) &&
      (filterStatus === "جميع الحالات" || u.status === filterStatus),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paginatedUsers = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // ⚠️ الأرقام دي بتحسب من كل اليوزرز اللي جم من السيرفر (visibleUsers) مش
  // من الصفحة المعروضة بس، وكل رول بياخد عدّاده الصح
  const stats = {
    parents: visibleUsers.filter((u) => u.role === "ولي أمر").length,
    admins: visibleUsers.filter((u) => u.role === "مشرف").length,
    teachers: visibleUsers.filter((u) => u.role === "معلم").length,
    students: visibleUsers.filter((u) => u.role === "طالب").length,
    total: visibleUsers.length,
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
            ? {
                ...u,
                isActive: willActivate,
                status: statusOf({ ...u, isActive: willActivate }),
              }
            : u,
        ),
      );
      toast.success(willActivate ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر تحديث حالة المستخدم");
    }
  };

  const handleApprove = async (user) => {
    try {
      if (user.rawRole === "student" || user.rawRole === "teacher") {
        const profileResponse = user.rawRole === "student"
          ? await getAllStudents({ user: user.id })
          : await getTeachers({ user: user.id });
        const responseData = profileResponse.data?.data ?? profileResponse.data;
        const profiles = Array.isArray(responseData)
          ? responseData
          : responseData?.students || responseData?.teachers || [responseData];
        const profile = profiles.find(Boolean);
        const profileId = profile?.id || profile?._id;

        if (!profileId) {
          throw new Error(
            user.rawRole === "teacher"
              ? "ملف المعلم غير موجود"
              : "ملف الطالب غير موجود",
          );
        }

        if (user.rawRole === "teacher") {
          await updateTeacherProfile(profileId, { status: "approved" });
        } else {
          await updateStudentProfile(profileId, { status: "approved" });
        }
      }

      await updateUser(user.id, {
        registrationStatus: "active",
        isActive: true,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                registrationStatus: "active",
                isActive: true,
                status: statusOf({
                  ...u,
                  registrationStatus: "active",
                  isActive: true,
                }),
              }
            : u,
        ),
      );
      toast.success("تم قبول الطلب وتفعيل الحساب");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("هذا المستخدم لم يعد موجودًا، جاري تحديث القائمة");
        fetchUsers(); // إعادة تحميل كامل بدل الحذف المحلي فقط
      } else {
        toast.error(err.response?.data?.message || err.message || "تعذر قبول الطلب");
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("تم حذف المستخدم");
    } catch (err) {
      toast.error(err.response?.data?.message || "تعذر حذف المستخدم");
    }
  };

  return (
    <AdminLayout>
      <div
        className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-[24px] font-semibold leading-8 text-[#123C91] mb-2 sm:mb-3">
            إدارة المستخدمين
          </h3>
          <p className="text-sm sm:text-[16px] font-normal leading-6 text-[#575F69]">
            إدارة جميع حسابات المنصة.
          </p>
        </div>

        <div className="mb-6">
          <UsersStatsBar {...stats} />
        </div>

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
              onApprove={handleApprove}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          )}
        </div>

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
