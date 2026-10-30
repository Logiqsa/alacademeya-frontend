import { DEFAULT_DESCRIPTION } from "./seoCore.js";

const STATIC_INDEXABLE = {
  "/": { description: "منصة واحدة لإدارة تعليمية متكاملة تشمل الدورات والحصص والاختبارات والتواصل الآمن." },
  "/courses": { title: "الدورات التعليمية", description: "استكشف الدورات التعليمية المنشورة واختر الدورة المناسبة لرحلتك التعليمية." },
  "/blogs": { title: "المدونة", description: "مقالات ونصائح تعليمية من خبراء الأكاديمية." },
  "/policies/instructor-agreement": { title: "اتفاقية المحاضر" },
  "/policies/course-publishing": { title: "سياسة نشر الدورات" },
  "/policies/revenue-share": { title: "اتفاقية مشاركة الإيرادات" },
  "/policies/course-terms": { title: "شروط شراء والالتحاق بالدورات" },
};

const PRIVATE_ROUTE_TITLES = [
  ["/admin/course-finances/withdrawals", "طلبات السحب"],
  ["/admin/course-finances", "مالية الدورات"],
  ["/admin/course-categories", "تصنيفات الدورات"],
  ["/admin/teacher-salaries", "رواتب المعلمين"],
  ["/admin/subscription", "الاشتراكات"],
  ["/admin/notifications", "الإشعارات"],
  ["/admin/supervisors", "المشرفون"],
  ["/admin/instructors", "المحاضرون"],
  ["/admin/learners", "طلاب الدورات"],
  ["/admin/teachers", "المعلمون"],
  ["/admin/students", "الطلاب"],
  ["/admin/parents", "أولياء الأمور"],
  ["/admin/groups", "المجموعات"],
  ["/admin/schedule", "جدول الحصص"],
  ["/admin/records", "التسجيلات"],
  ["/admin/courses", "الدورات"],
  ["/admin/course-policies", "السياسات القانونية"],
  ["/admin/payments", "المدفوعات"],
  ["/admin/security/media", "أمان الوسائط"],
  ["/admin/messages", "الرسائل"],
  ["/admin/blogs", "المدونة"],
  ["/admin/settings", "الإعدادات"],
  ["/admin-dashboard", "لوحة التحكم"],
];

const privateRouteTitle = (path) =>
  PRIVATE_ROUTE_TITLES.find(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`),
  )?.[1];

export const STATIC_INDEXABLE_PATHS = Object.freeze(Object.keys(STATIC_INDEXABLE));

const isDynamicIndexable = (path) =>
  /^\/courses\/[^/]+$/.test(path) ||
  /^\/blog\/[^/]+$/.test(path) ||
  /^\/instructors\/[^/]+$/.test(path);

export const routeSeoFor = (pathname) => {
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  const staticMetadata = STATIC_INDEXABLE[normalizedPath];
  const indexable = Boolean(staticMetadata) || isDynamicIndexable(normalizedPath);
  return {
    ...staticMetadata,
    description: staticMetadata?.description || DEFAULT_DESCRIPTION,
    path: normalizedPath,
    noindex: !indexable,
    title:
      staticMetadata?.title ||
      (indexable ? undefined : privateRouteTitle(normalizedPath) || "الأكاديمية"),
    lang: normalizedPath.startsWith("/certificates/verify") ? "en" : "ar",
  };
};
