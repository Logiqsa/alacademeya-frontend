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
  // Authentication and onboarding
  ["/forgot-password", "استعادة كلمة المرور"],
  ["/select-account-type", "اختيار نوع الحساب"],
  ["/register/student-details", "بيانات الطالب"],
  ["/register/teacher-details", "بيانات المعلم"],
  ["/register/subjects", "اختيار المواد"],
  ["/register/packages", "اختيار الباقة"],
  ["/register/order-summary", "ملخص الطلب"],
  ["/register/success", "تم التسجيل"],
  ["/register", "إنشاء حساب"],
  ["/check-email", "تحقق من بريدك الإلكتروني"],
  ["/verify-email", "تأكيد البريد الإلكتروني"],
  ["/login", "تسجيل الدخول"],
  ["/pending", "حالة الطلب"],
  ["/account-state", "حالة الحساب"],

  // Parent dashboard
  ["/parent-dashboard/add-child", "إضافة ابن"],
  ["/parent-dashboard", "لوحة تحكم ولي الأمر"],
  ["/parent/children", "الأبناء"],
  ["/parent/schedule", "جدول الحصص"],
  ["/parent/notifications", "الإشعارات"],
  ["/parent/subscription", "الاشتراكات"],
  ["/parent/subscriptions", "إدارة الاشتراك"],
  ["/parent/students", "باقات الطالب"],
  ["/parent/messages", "الرسائل"],
  ["/parent/settings", "إعدادات الحساب"],
  ["/parent/payments", "المدفوعات"],
  ["/parent/classrooms", "تفاصيل الحصة"],

  // Student and learner dashboards
  ["/learner-dashboard", "لوحة تحكم طالب الدورات"],
  ["/student-dashboard/courses", "دوراتي"],
  ["/student-dashboard", "لوحة تحكم الطالب"],
  ["/student/settings", "إعدادات الحساب"],
  ["/student/notifications", "الإشعارات"],
  ["/student/subscription", "الاشتراك"],
  ["/student/subscriptions", "إدارة الاشتراك"],
  ["/student/messages", "الرسائل"],
  ["/student/assignments", "الواجبات"],
  ["/student/schedule", "جدول الحصص"],
  ["/student/groups", "المجموعات"],
  ["/student/payments", "المدفوعات"],
  ["/learner/payments", "المدفوعات"],
  ["/my-courses", "تفاصيل الدورة"],
  ["/payment/courses", "إتمام شراء الدورة"],
  ["/learn", "مشاهدة الدورة"],
  ["/exam-result", "نتيجة الاختبار"],
  ["/exam", "الاختبار"],
  ["/certificate", "شهادة الدورة"],
  ["/my-certificates", "شهاداتي"],
  ["/subscription-orders", "حالة طلب الاشتراك"],
  ["/payment/success", "حالة الدفع"],
  ["/certificates/verify", "التحقق من الشهادة"],

  // Teacher and instructor dashboards
  ["/teacher-dashboard", "لوحة تحكم المعلم"],
  ["/teacher/groups", "المجموعات"],
  ["/add-new-group", "إنشاء مجموعة"],
  ["/teacher/tasks", "الواجبات"],
  ["/teacher/schedule", "جدول الحصص"],
  ["/assignments/new", "إضافة واجب"],
  ["/teacher/notifications", "الإشعارات"],
  ["/teacher/assignments", "تفاصيل الواجب"],
  ["/teacher/messages", "الرسائل"],
  ["/teacher/settings", "إعدادات الحساب"],
  ["/teacher/earnings/commission-rates", "نسب العمولة"],
  ["/teacher/earnings", "الأرباح"],
  ["/teacher/payments", "المدفوعات"],
  ["/teacher/my-courses", "دوراتي"],
  ["/teacher/learning", "التعلّم"],
  ["/teacher/courses", "إدارة الدورات"],
  ["/teacher/instructor-profile", "ملف المحاضر"],
  ["/instructor-dashboard", "لوحة تحكم المحاضر"],
  ["/instructor/onboarding", "استكمال ملف المحاضر"],
  ["/admin/course-finances/withdrawals", "طلبات السحب"],
  ["/admin/course-finances", "مالية الدورات"],
  ["/admin/course-categories", "تصنيفات الدورات"],
  ["/admin/teacher-salaries", "رواتب المعلمين"],
  ["/admin/subscription", "الاشتراكات"],
  ["/admin/notifications", "الإشعارات"],
  ["/admin/users", "المستخدمون"],
  ["/admin/supervisors", "المشرفون"],
  ["/admin/instructors", "المحاضرون"],
  ["/admin/learners", "طلاب الدورات"],
  ["/admin/teachers", "المعلمون"],
  ["/admin/students", "الطلاب"],
  ["/admin/parents", "أولياء الأمور"],
  ["/admin/groups", "المجموعات"],
  ["/admin/classrooms", "تفاصيل الحصة"],
  ["/admin/schedule", "جدول الحصص"],
  ["/admin/records", "التسجيلات"],
  ["/admin/courses", "الدورات"],
  ["/admin/course-policies", "السياسات القانونية"],
  ["/admin/payments", "المدفوعات"],
  ["/admin/security/media", "أمان الوسائط"],
  ["/admin/messages", "الرسائل"],
  ["/admin/blogs", "المدونة"],
  ["/admin/curriculum", "المناهج الدراسية"],
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
