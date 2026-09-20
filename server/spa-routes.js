export const SPA_ROUTE_KIND = Object.freeze({
  STATIC_APP_ROUTE: "STATIC_APP_ROUTE",
  DYNAMIC_COURSE: "DYNAMIC_COURSE",
  DYNAMIC_BLOG: "DYNAMIC_BLOG",
  DYNAMIC_INSTRUCTOR: "DYNAMIC_INSTRUCTOR",
  UNKNOWN: "UNKNOWN",
  EXCLUDED: "EXCLUDED",
});

const STATIC_APP_PATHS = new Set([
  "/", "/courses", "/blogs", "/certificates/verify",
  "/policies/instructor-agreement", "/policies/course-publishing",
  "/policies/revenue-share", "/policies/course-terms",
  "/login", "/forgot-password", "/select-account-type", "/register",
  "/check-email", "/verify-email", "/register/student-details",
  "/register/subjects", "/register/packages", "/register/order-summary",
  "/payment/success", "/register/success", "/register/teacher-details",
  "/pending", "/account-state", "/parent-dashboard",
  "/parent-dashboard/add-child", "/parent/schedule", "/parent/children",
  "/parent/notifications", "/parent/subscription", "/parent/messages",
  "/parent/settings", "/learner-dashboard", "/student-dashboard",
  "/student/settings", "/student/notifications", "/student/subscription",
  "/student/messages", "/student/assignments", "/student/schedule",
  "/student/groups", "/student/payments", "/student-dashboard/courses",
  "/my-certificates", "/teacher-dashboard", "/teacher/groups",
  "/teacher/tasks", "/teacher/schedule", "/assignments/new",
  "/teacher/notifications", "/teacher/messages", "/teacher/settings",
  "/teacher/earnings", "/teacher/earnings/commission-rates",
  "/teacher/my-courses", "/teacher/courses", "/teacher/courses/new",
  "/teacher/instructor-profile", "/admin/courses", "/admin/courses/new",
  "/admin/course-categories", "/admin/course-finances",
  "/admin/course-finances/commission-settings",
  "/admin/course-finances/withdrawals", "/admin/course-policies",
  "/admin-dashboard", "/admin/settings", "/admin/security/media",
  "/admin/notifications", "/admin/users", "/admin/students/new",
  "/admin/groups", "/admin/groups/new", "/admin/schedule",
  "/admin/supervisors", "/admin/teachers", "/admin/records",
  "/admin/messages", "/admin/subscription", "/admin/subscriptions/requests",
  "/admin/payments", "/admin/teacher-salaries", "/admin/blogs",
  "/admin/blogs/add", "/admin/curriculum/create", "/admin/subscriptions/add",
  "/instructor-dashboard", "/instructor/onboarding",
]);

const PARAMETERIZED_APP_ROUTES = [
  "/certificates/verify/:certificateNumber",
  "/subscription-orders/:orderId/status",
  "/parent/classrooms/:classroomId/sessions/:sessionId",
  "/parent/subscriptions/:id/renew",
  "/parent/subscriptions/:id/add-subject",
  "/parent/students/:studentId/subscription/packages",
  "/student/subscriptions/:id/renew",
  "/student/subscriptions/:id/add-subject",
  "/student/groups/:groupId/lessons",
  "/student/groups/:groupId/lessons/:lessonId",
  "/student/groups/:groupId/lessons/:lessonId/files",
  "/my-courses/:slug", "/payment/courses/:slug", "/learn/:courseId",
  "/exam/:courseId", "/exam-result/:courseId", "/certificate/:courseId",
  "/teacher/groups/:groupId/lessons",
  "/teacher/groups/:groupId/students",
  "/teacher/groups/:groupId/students/:studentId",
  "/teacher/groups/:groupId/lessons/new",
  "/teacher/groups/:groupId/lessons/:lessonId",
  "/teacher/groups/:groupId/lessons/schedule/new",
  "/teacher/assignments/:assignmentId",
  "/teacher/groups/:groupId/lessons/:lessonId/attendance",
  "/teacher/courses/:courseId", "/teacher/courses/:courseId/edit",
  "/teacher/courses/:courseId/quizzes/:lessonId",
  "/admin/courses/:courseId", "/admin/courses/:courseId/edit",
  "/admin/courses/:courseId/quizzes/:lessonId",
  "/admin/course-categories/:categoryId/courses",
  "/admin/groups/:groupId/lessons", "/admin/groups/:groupId/lessons/new",
  "/admin/groups/:groupId/schedule", "/admin/groups/:groupId/attendance",
  "/admin/classrooms/:classroomId/sessions/:sessionId",
  "/admin/teachers/:teacherId/sessions/:sessionStatus",
  "/admin/subscription-orders/:id", "/admin/payments/:id",
  "/admin/subscriptions/:id", "/admin/subscriptions/:id/renew",
  "/admin/blogs/:id/edit", "/admin/subscriptions/requests/:id/activate",
  "/admin/curriculum/:curriculumId/edit",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const routePattern = (template) => new RegExp(`^${template.split("/").map((part) => (
  part.startsWith(":") ? "[^/]+" : escapeRegex(part)
)).join("/")}$`);
const APP_ROUTE_PATTERNS = PARAMETERIZED_APP_ROUTES.map(routePattern);

const EXCLUDED_PREFIX = /^\/(?:api|assets)(?:\/|$)/i;
const EXCLUDED_EXACT = /^\/(?:index\.html|robots\.txt|sitemap\.xml|favicon[^/]*)$/i;
const EXCLUDED_SITEMAP = /^\/sitemaps(?:\/|$)/i;
const STATIC_EXTENSION = /\.(?:js|css|map|png|jpe?g|webp|gif|avif|svg|ico|woff2?|ttf|otf|eot|json|webmanifest|xml|txt)$/i;

export const normalizeSpaPath = (pathname) => {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) return null;
  const withoutQuery = pathname.split(/[?#]/, 1)[0];
  return withoutQuery === "/" ? "/" : withoutQuery.replace(/\/+$/, "");
};

const entityMatch = (path, prefix) => {
  const match = path.match(new RegExp(`^/${prefix}/([^/]+)$`));
  if (!match) return null;
  try {
    const value = decodeURIComponent(match[1]);
    return !value || value === "." || value === ".." || /[\\/]/.test(value) ? null : value;
  } catch {
    return null;
  }
};

export const classifySpaPath = (pathname) => {
  const path = normalizeSpaPath(pathname);
  if (!path) return { kind: SPA_ROUTE_KIND.UNKNOWN, path: pathname };
  if (EXCLUDED_PREFIX.test(path) || EXCLUDED_EXACT.test(path) || EXCLUDED_SITEMAP.test(path) || STATIC_EXTENSION.test(path)) {
    return { kind: SPA_ROUTE_KIND.EXCLUDED, path };
  }
  const courseSlug = entityMatch(path, "courses");
  if (courseSlug) return { kind: SPA_ROUTE_KIND.DYNAMIC_COURSE, path, parameter: courseSlug };
  const blogSlug = entityMatch(path, "blog");
  if (blogSlug) return { kind: SPA_ROUTE_KIND.DYNAMIC_BLOG, path, parameter: blogSlug };
  const instructorId = entityMatch(path, "instructors");
  if (instructorId) return { kind: SPA_ROUTE_KIND.DYNAMIC_INSTRUCTOR, path, parameter: instructorId };
  if (STATIC_APP_PATHS.has(path) || APP_ROUTE_PATTERNS.some((pattern) => pattern.test(path))) {
    return { kind: SPA_ROUTE_KIND.STATIC_APP_ROUTE, path };
  }
  return { kind: SPA_ROUTE_KIND.UNKNOWN, path };
};

