import { getUsers } from "../services/APIService.js";

// ⚠️ "مشرف" = admin (صلاحيات محدودة)، "مشرف عام" = super-admin (صلاحيات كاملة)
export const ROLE_MAP = {
  user: "متعلم",
  student: "طالب",
  teacher: "معلم",
  parent: "ولي أمر",
  admin: "مشرف",
  "super-admin": "مشرف عام",
};

export const adminAccountTypeLabel = (user = {}) => {
  const hasInstructorProfile = Boolean(
    user.capabilities?.hasInstructorProfile ||
      user.instructorId ||
      user.instructorProfileSlug ||
      user.accountType === "instructor",
  );
  if (hasInstructorProfile) return "محاضر";
  return ROLE_MAP[user.role] || user.role || "غير محدد";
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
  role: adminAccountTypeLabel(u),
  rawRole: u.role,
  capabilities: u.capabilities,
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

const extractUsersPage = (response) => {
  const body = response?.data ?? response ?? {};
  const containers = [body, body?.data, body?.data?.data].filter(Boolean);
  const listKeys = ["users", "items", "results", "docs"];
  let list = [];

  for (const container of containers) {
    if (Array.isArray(container)) {
      list = container;
      break;
    }
    const nestedList = listKeys
      .map((key) => container?.[key])
      .find(Array.isArray);
    if (nestedList) {
      list = nestedList;
      break;
    }
  }

  const metadata = containers.find(
    (container) => !Array.isArray(container) && container?.pagination,
  ) || containers.find(
    (container) =>
      !Array.isArray(container) &&
      (container?.meta ||
        container?.totalPages != null ||
        container?.total != null ||
        container?.count != null),
  ) || {};
  const pagination = metadata.pagination || metadata.meta || {};
  const total =
    pagination.total ?? metadata.total ?? metadata.count ?? pagination.count;
  const totalPages =
    pagination.totalPages ??
    pagination.pages ??
    metadata.totalPages ??
    metadata.pages ??
    (Number(total) > 0
      ? Math.ceil(Number(total) / FETCH_ALL_USERS_LIMIT)
      : null);

  return {
    list,
    totalPages: Number.isFinite(Number(totalPages))
      ? Number(totalPages)
      : null,
  };
};

const adminUserIdentity = (user) => {
  const id = user?.id || user?._id;
  if (id) return `id:${String(id)}`;

  // لا يُستخدم إلا لو الاستجابة القديمة لا تحتوي على id.
  const email = String(user?.email || "").trim().toLowerCase();
  return email ? `email:${email}` : "";
};

// يجلب كل الصفحات ويمنع تكرار المستخدم إذا أعاد السيرفر صفحات متداخلة.
export const fetchAllAdminUsers = async () => {
  const usersByIdentity = new Map();
  let page = 1;

  while (true) {
    const res = await getUsers({ page, limit: FETCH_ALL_USERS_LIMIT });
    const { list, totalPages } = extractUsersPage(res);
    const sizeBeforePage = usersByIdentity.size;

    list.forEach((user, index) => {
      const identity = adminUserIdentity(user);
      // نحافظ على العناصر النادرة التي لا تحتوي على id أو email دون دمجها خطأً.
      usersByIdentity.set(identity || `page:${page}:row:${index}`, user);
    });
    const addedUsers = usersByIdentity.size - sizeBeforePage;

    if (totalPages) {
      if (page >= totalPages) break;
    } else if (list.length < FETCH_ALL_USERS_LIMIT) {
      break;
    }

    // حماية من API يتجاهل page ويعيد نفس النتائج في كل طلب.
    if (list.length > 0 && addedUsers === 0) break;

    page += 1;
    if (page > 100) break; // حماية من infinite loop
  }

  return [...usersByIdentity.values()];
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
