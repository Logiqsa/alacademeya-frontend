import axios from "axios";

const API = axios.create({
  baseURL: "https://api.alacademeya.com/api",
});

const ROOT_API = axios.create({
  baseURL: "https://api.alacademeya.com/api",
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

API.interceptors.request.use(attachToken);
ROOT_API.interceptors.request.use(attachToken);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (credentials) => API.post("/auth/login", credentials);
export const register = (userData) => API.post("/auth/register", userData);
export const resendOtp = (email) =>
  API.post("/auth/resendVerificationCode", { email });
export const verifyAccount = (data) => API.post("/auth/verifyAccount", data);

export const forgotPassword = (email) =>
  API.post("/auth/forgotPassword", { email });

export const verifyPasswordResetCode = (resetCode) =>
  API.post("/auth/verifyResetCode", {
    resetCode,
  });

export const resetPassword = ({ email, newPassword }) =>
  API.post("/auth/resetPassword", {
    email,

    newPassword,
  });

export const completeStudentProfile = (payload) =>
  API.post("/auth/completeStudentProfile", payload);

export const completeTeacherProfile = (payload) =>
  API.patch("/auth/completeTeacherProfile", payload, {
    headers:
      payload instanceof FormData
        ? { "Content-Type": "multipart/form-data" }
        : undefined,
  });

export const saveStudentInterests = (payload) =>
  API.post("/auth/student/interests", payload);

export const saveTeacherDetails = (payload) =>
  API.post("/auth/teacher/details", payload);

export const getAccountState = () => API.get("/auth/account-state");

export const getCountries = () => API.get("/countries");

// ─── Contact Settings ────────────────────────────────────────────────────────
export const getContactSettings = () => API.get("/contact-settings");
export const updateContactSettings = (payload) =>
  API.patch("/contact-settings", payload);

// ──────────────────────────────────────────────────────────────────────────────
// Curriculums
// ──────────────────────────────────────────────────────────────────────────────
export const getCurriculums = () => API.get("/curriculums/");
export const getCurriculum = (id) => API.get(`/curriculums/${id}`);
export const createCurriculum = (payload) => API.post("/curriculums/", payload);
export const updateCurriculum = (id, payload) =>
  API.patch(`/curriculums/${id}`, payload);
export const deleteCurriculum = (id) => API.delete(`/curriculums/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Stages
// ──────────────────────────────────────────────────────────────────────────────
export const getCurriculumStages = (curriculumId) =>
  API.get(`/stages/curriculum/${curriculumId}`);
export const getStage = (stageId) => API.get(`/stages/${stageId}`);
export const createStage = (payload) => API.post("/stages", payload);
export const updateStage = (stageId, payload) =>
  API.patch(`/stages/${stageId}`, payload);
export const deleteStage = (stageId) => API.delete(`/stages/${stageId}`);

// ──────────────────────────────────────────────────────────────────────────────
// Grades
// ──────────────────────────────────────────────────────────────────────────────
export const getStageGrades = (stageId) =>
  API.get("/grades", { params: { stage: stageId } });
export const getAllGrades = (params) => API.get("/grades", { params });
export const getGrade = (gradeId) => API.get(`/grades/${gradeId}`);
export const createGrade = (payload) => API.post("/grades", payload);
export const updateGrade = (gradeId, payload) =>
  API.patch(`/grades/${gradeId}`, payload);
export const deleteGrade = (gradeId) => API.delete(`/grades/${gradeId}`);

// ──────────────────────────────────────────────────────────────────────────────
// Subjects
// ──────────────────────────────────────────────────────────────────────────────
export const getSubjects = (params) => API.get("/subjects", { params });
export const getAllSubjects = (params) => API.get("/subjects", { params });
export const getSubject = (id) => API.get(`/subjects/${id}`);
export const createSubject = (payload) => API.post("/subjects", payload);
export const updateSubject = (id, payload) =>
  API.patch(`/subjects/${id}`, payload);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

// ─── Parent / Students ────────────────────────────────────────────────────────
export const removeStudent = (studentId) =>
  API.delete(`/parents/students/${studentId}`);
export const addStudent = (payload) =>
  API.post("/parents/students", payload, { headers: { lang: "ar" } });
export const getMyStudents = () => API.get("/parents/students");
export const getStudentsStatistics = () =>
  API.get("/parents/students/statistics");
export const updateStudent = (studentId, payload) =>
  API.patch(`/parents/students/${studentId}`, payload);

// ─── User Profile ─────────────────────────────────────────────────────────────
export const getMyProfile = () => API.get("/users/me");
export const updateMyProfile = (payload) => API.patch("/users/me", payload);
export const getUserTimezones = () => API.get("/users/timezones");
export const updateMyTimezone = (payload) =>
  API.patch("/users/me/timezone", payload);

// ──────────────────────────────────────────────────────────────────────────────
// Subscriptions
// ──────────────────────────────────────────────────────────────────────────────
export const createSubscription = (payload) =>
  API.post("/subscriptions", payload);
export const getAllSubscriptions = (params) =>
  API.get("/subscriptions/", { params });
export const getSubscription = (id) => API.get(`/subscriptions/${id}`);
export const getStudentSubscriptionOptions = (studentId) =>
  API.get(`/students/${studentId}/subscription-options`);
export const getPendingSubscriptionRequests = () =>
  API.get("/subscriptions/students/pending");
export const getMyStudentsSubscriptions = () =>
  API.get("/parents/students/subscriptions");
export const getMySubscriptions = (params) =>
  API.get("/subscriptions/my", { params });
export const getSubscriptionRenewOptions = (id) =>
  API.get(`/subscriptions/${id}/renew-options`);

// ─── Student subscription orders ─────────────────────────────────────────────
// Prices and totals are intentionally never accepted here. The backend is the
// authoritative source for all monetary values.
export const createSubscriptionOrder = (items, studentId, currency) =>
  API.post("/subscription-orders", {
    items,
    ...(studentId ? { studentId } : {}),
    ...(currency ? { currency } : {}),
  });
export const createRenewalSubscriptionOrder = (sourceSubscription, items) =>
  API.post("/subscription-orders", {
    orderType: "renewal",
    sourceSubscription,
    items,
  });
export const createAddSubjectSubscriptionOrder = (
  sourceSubscription,
  items,
) =>
  API.post("/subscription-orders", {
    orderType: "add_subject",
    sourceSubscription,
    items,
  });
export const getSubscriptionOrder = (id) =>
  API.get(`/subscription-orders/${id}`);
export const getMySubscriptionOrders = () =>
  API.get("/subscription-orders/my");
export const startSubscriptionOrderCheckout = (id) =>
  API.post(`/subscription-orders/${id}/checkout`);
export const getPendingSubscriptionOrders = (params) =>
  API.get("/subscription-orders/admin/pending", { params });
export const getAdminSubscriptionOrder = (id) =>
  API.get(`/subscription-orders/admin/${id}`);
export const approveSubscriptionOrder = (id, items) =>
  API.post(`/subscription-orders/admin/${id}/approve`, { items });

// ─── Admin payments ──────────────────────────────────────────────────────────
export const getAdminPayments = (params) =>
  API.get("/admin/payments", { params });
export const getAdminPaymentDetails = (id) =>
  API.get(`/admin/payments/${id}`);

// ─── Admin teacher salaries ─────────────────────────────────────────────────
export const getTeacherSalariesSummary = (params) =>
  API.get("/admin/teacher-salaries/summary", { params });
export const previewTeacherSalary = (payload) =>
  API.post("/admin/teacher-salaries/preview", payload);
export const payTeacherSalary = (payload) =>
  API.post("/admin/teacher-salaries", payload);
export const getTeacherSalaries = (params) =>
  API.get("/admin/teacher-salaries", { params });
export const getTeacherSalary = (id) =>
  API.get(`/admin/teacher-salaries/${id}`);
export const cancelTeacherSalary = (id, cancellationReason) =>
  API.patch(`/admin/teacher-salaries/${id}/cancel`, { cancellationReason });

// ──────────────────────────────────────────────────────────────────────────────
// Discounts  (NEW)
// ──────────────────────────────────────────────────────────────────────────────
// Response item shape (confirmed from Postman):
// { name, code, type: "percentage" | "fixed", value, usedCount, isActive, createdAt, updatedAt, id }
export const getAllDiscounts = (params) => API.get("/discounts/", { params });
export const getDiscount = (id) => API.get(`/discounts/${id}`);
export const createDiscount = (payload) => API.post("/discounts/", payload);
export const updateDiscount = (id, payload) =>
  API.patch(`/discounts/${id}`, payload);
export const deleteDiscount = (id) => API.delete(`/discounts/${id}`);
// body shape TBD — assumed { code } or { code, subjectId } for cart-style validation
export const validateDiscount = (payload) =>
  API.post("/discounts/validate", payload);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = () => API.get("/notifications");
export const markNotificationRead = (id) =>
  API.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  API.patch("/notifications/read-all");
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Users (Admin)
// ──────────────────────────────────────────────────────────────────────────────
export const getUsers = (params) => API.get("/users/", { params });
export const getUser = (id) => API.get(`/users/${id}`);
export const createUser = (payload) => API.post("/users/", payload); // ← جديد
export const updateUser = (id, payload) => API.patch(`/users/${id}`, payload);
export const deleteUser = (id) => API.delete(`/users/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Classrooms (Groups)
// ──────────────────────────────────────────────────────────────────────────────
export const getClassrooms = (params) => API.get("/classrooms/", { params });
export const getMyClassrooms = (params) =>
  API.get("/classrooms/my", { params });
export const getClassroom = (id) => API.get(`/classrooms/${id}`);
export const createClassroom = (payload) => API.post("/classrooms/", payload);
export const updateClassroom = (id, payload) =>
  API.patch(`/classrooms/${id}`, payload);
export const updateClassroomSubstituteTeacher = (id, substituteTeacher) =>
  API.patch(`/classrooms/${id}/substitute-teacher`, { substituteTeacher });
export const deleteClassroom = (id) => API.delete(`/classrooms/${id}`);
export const getAvailableClassrooms = (params) =>
  // params: { teacher, subject, type }
  API.get("/classrooms/available", { params });
export const getClassroomSessions = (classroomId, params) =>
  API.get(`/classrooms/${classroomId}/sessions/`, { params });
export const getClassroomStudents = (classroomId, params) =>
  API.get(`/classrooms/${classroomId}/students/`, { params });

// ─── Classroom Schedule ────────────────────────────────────────────────────────
export const getMonthlySchedule = ({ year, month } = {}) =>
  API.get("/schedule", {
    params: { year, month },
    headers: { lang: "ar" },
  });

// ✅ اتأكد من الـ Postman collection: الـ route مش /classrooms/:id/schedule
// الـ route الصح هو /schedule/:classroomId على طول (مش تحت /classrooms)
// PUT {{BASE_URL}}/schedule/:classroomId  body: { days: string[], time: "HH:mm" }
export const getClassroomSchedule = (classroomId) =>
  API.get(`/schedule/${classroomId}`, { headers: { lang: "ar" } });

export const createOrUpdateClassroomSchedule = (classroomId, payload) =>
  API.put(`/schedule/${classroomId}`, payload, { headers: { lang: "ar" } });
export const deleteClassroomSchedule = (classroomId) =>
  API.delete(`/schedule/${classroomId}`, { headers: { lang: "ar" } });

// ──────────────────────────────────────────────────────────────────────────────
// Students (Global / Admin)
// ──────────────────────────────────────────────────────────────────────────────
export const getAllStudents = (params) => API.get("/students", { params });
export const getStudent = (studentId) => API.get(`/students/${studentId}`);
export const updateStudentProfile = (studentId, payload) =>
  API.patch(`/students/${studentId}`, payload);

// ──────────────────────────────────────────────────────────────────────────────
// Teachers
// ──────────────────────────────────────────────────────────────────────────────
export const getAvailableTeachers = (params) =>
  API.get("/teachers/available", { params });
export const getTeachers = (params) => API.get("/teachers", { params });
export const getTeacher = (teacherId) => API.get(`/teachers/${teacherId}`);
export const getTeacherMonthlyReport = (teacherId, month) =>
  API.get(`/teachers/${teacherId}/monthly-report`, { params: { month } });
export const updateTeacherProfile = (teacherId, payload) =>
  API.patch(`/teachers/${teacherId}`, payload);

// ──────────────────────────────────────────────────────────────────────────────
// Sessions — Attendance
// ──────────────────────────────────────────────────────────────────────────────
export const getSessionAttendance = (sessionId) =>
  API.get(`/sessions/${sessionId}/attendance`);
export const saveSessionAttendance = (sessionId, payload) =>
  API.patch(`/sessions/${sessionId}/attendance`, payload);

export const createClassroomSession = (formData) =>
  API.post("/sessions/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateClassroomSession = (sessionId, formData) =>
  API.patch(`/sessions/${sessionId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const startSession = (sessionId) =>
  API.patch(`/sessions/${sessionId}/start`);
export const endSession = (sessionId) =>
  API.patch(`/sessions/${sessionId}/end`);
export const getNextSessions = () => API.get("/sessions/next");

export const getAllPackages = (params) => API.get("/packages", { params });
export const getPackage = (id) => API.get(`/packages/${id}`);
export const createPackage = (payload) => API.post("/packages", payload);
export const updatePackage = (id, payload) =>
  API.patch(`/packages/${id}`, payload);
export const deletePackage = (id) => API.delete(`/packages/${id}`);

// ──────────────────────────────────────────────────────────────────────────────
// Assignments (NEW)
// ──────────────────────────────────────────────────────────────────────────────
// GET /assignments/classroom/:classroomId → { success, results, data: [...] }
export const getAssignmentsByClassroom = (classroomId, params) =>
  API.get(`/assignments/classroom/${classroomId}`, { params });

// GET /assignments/:assignmentId → { success, data: {...} }
export const getAssignment = (assignmentId) =>
  API.get(`/assignments/${assignmentId}`);

// POST /assignments/ — expects multipart/form-data (attachments field for files)
// build the FormData in the caller, same pattern as createClassroomSession
export const createAssignment = (formData) =>
  API.post("/assignments/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAssignment = (assignmentId, payload) =>
  API.patch(`/assignments/${assignmentId}`, payload);

export const deleteAssignment = (assignmentId) =>
  API.delete(`/assignments/${assignmentId}`);

// ─── Recordings ──────────────────────────────────────────────────────────────
export const createRecording = (formData) =>
  API.post("/recordings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getSessionRecording = (sessionId) =>
  API.get(`/recordings/session/${sessionId}`);

// GET /assignments/:assignmentId/submissions → { success, results, data: [...] }
// كل عنصر: { assignment, student: {...}, attachments, score, feedback, status, submittedAt, id }
export const getAssignmentSubmissions = (assignmentId) =>
  API.get(`/assignments/${assignmentId}/submissions`);

export const gradeSubmission = (submissionId, payload) =>
  API.patch(`/assignments/submissions/${submissionId}/grade`, payload);

// ================= Student Assignments =================

export const getMyAssignments = () => API.get("/assignments/my");

export const getMySubmission = (assignmentId) =>
  API.get(`/assignments/${assignmentId}/my-submission`);

export const submitAssignment = (assignmentId, formData) =>
  API.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getBlogCategories = () => API.get("/blog-categories/");
export const createBlogCategory = (payload) =>
  API.post("/blog-categories/", payload); // body: { name }

export const getBlogPosts = (params) => API.get("/blog-posts/", { params });
export const getBlogPost = (id) => API.get(`/blog-posts/${id}`);

export const createBlogPost = (formData) =>
  API.post("/blog-posts/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateBlogPost = (id, formData) =>
  API.patch(`/blog-posts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteBlogPost = (id) => API.delete(`/blog-posts/${id}`);

// ════════════════════════════════════════════════════════════════════════════
// Public blog endpoints (no auth required) — published posts only
// ════════════════════════════════════════════════════════════════════════════

// GET /blog-posts/public              → { success, results, data: [ ...posts ] }
export const getPublicBlogPosts = (params) =>
  API.get("/blog-posts/public", { params });

// GET /blog-posts/public/:slug        → { success, data: { blogPost: {...} } }
export const getPublicBlogPostBySlug = (slug) =>
  API.get(`/blog-posts/public/${encodeURIComponent(slug)}`);

// GET /blog-posts/public/category/:categorySlug
//                                     → { success, results, data: { category, blogPosts: [...] } }
export const getPublicBlogPostsByCategory = (categorySlug, params) =>
  API.get(`/blog-posts/public/category/${encodeURIComponent(categorySlug)}`, {
    params,
  });

export const ASSET_BASE_URL = "https://api.alacademeya.com/api";

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // لو خلاص لينك كامل

  const cleanPath = String(path)
    .replace(/^\/+/, "")
    .replace(/^api\//, "");

  return `${ASSET_BASE_URL}/${cleanPath}`;
};
