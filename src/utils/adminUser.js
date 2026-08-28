import { getUsers } from "../services/APIService";

// ⚠️ "مشرف" = admin (صلاحيات محدودة)، "مشرف عام" = super-admin (صلاحيات كاملة)
export const ROLE_MAP = {
  student: "طالب",
  teacher: "معلم",
  parent: "ولي أمر",
  admin: "مشرف",
  "super-admin": "مشرف عام",
};

export const statusOf = (u) => {
  if (u.isDeleted) return "محذوف";
  if (!u.isActive) return "موقوف";
  if (u.registrationStatus?.startsWith("pending")) return "معلق";
  return "نشط";
};

// يحول يوزر خام من الـ API لنفس الشكل اللي بتستخدمه جداول ومودالات الأدمن
// (Userstable / UserDetailsModal) — علشان أي مكان في لوحة الأدمن يقدر يعرض
// نفس بيانات المستخدم وبنفس التسميات العربية.
export const mapAdminUser = (u) => ({
  id: u.id || u._id,
  name: u.fullName || u.name || "—",
  username: u.username,
  email: u.email,
  phone: u.phone,
  avatarUrl: u.avatarUrl,
  role: ROLE_MAP[u.role] || u.role,
  rawRole: u.role,
  country: u.country,
  isVerified: u.isVerified,
  isDeleted: !!u.isDeleted,
  isActive: !!u.isActive,
  registrationStatus: u.registrationStatus,
  createdAt: u.createdAt,
  lastLoginAt:
    u.lastLoginAt ||
    u.lastLogin ||
    u.lastLoggedInAt ||
    u.lastSeenAt ||
    u.lastActiveAt ||
    u.loginAt ||
    null,
  status: statusOf(u),
  joinDate: u.createdAt
    ? new Date(u.createdAt).toLocaleDateString("en-CA")
    : "—",
});

const FETCH_ALL_USERS_LIMIT = 100;

// يجيب كل اليوزرز من كل الصفحات (بيتعامل مع أي شكل pagination من السيرفر)
export const fetchAllAdminUsers = async () => {
  let all = [];
  let page = 1;

  while (true) {
    const res = await getUsers({ page, limit: FETCH_ALL_USERS_LIMIT });
    const body = res.data || {};
    const list = body.data || body.users || (Array.isArray(body) ? body : []);

    all = all.concat(list);

    const total =
      body.total ?? body.count ?? body.pagination?.total ?? body.meta?.total;
    const totalPages =
      body.totalPages ??
      body.pagination?.totalPages ??
      (total ? Math.ceil(total / FETCH_ALL_USERS_LIMIT) : null);

    if (totalPages) {
      if (page >= totalPages) break;
    } else if (list.length < FETCH_ALL_USERS_LIMIT) {
      break;
    }

    page += 1;
    if (page > 100) break; // حماية من infinite loop
  }

  return all;
};

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

// الـ /chats/rooms بترجع displayName بس من غير أي id أو role للمستخدم التاني
// في المحادثة، فبنستخدم اسم المستخدم كمفتاح مطابقة مع دليل المستخدمين. لو أكتر
// من مستخدم بنفس الاسم بنرجع null عشان منربطش محادثة بيوزر غلط.
export const buildUserNameIndex = (users) => {
  const map = new Map();
  users.forEach((user) => {
    const key = normalizeName(user.name);
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(user);
  });
  return map;
};

export const resolveUserByName = (nameIndex, name) => {
  const matches = nameIndex.get(normalizeName(name));
  return matches && matches.length === 1 ? matches[0] : null;
};
