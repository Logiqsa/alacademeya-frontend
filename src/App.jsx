import { Routes, Route, Navigate } from "react-router-dom";
import { Component, Suspense, lazy, useContext } from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { AlertTriangle, Copy, LayoutDashboard, RefreshCw } from "lucide-react";

import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";

import { AuthContext } from "./context/AuthContext";
import { getDashboardPathByRole } from "./utils/roles";


// ✅ Guards
import TeacherGuard from "./guards/TeacherGuard";
import InstructorGuard from "./guards/InstructorGuard";
import TeacherOrInstructorGuard from "./guards/TeacherOrInstructorGuard";
import StudentGuard from "./guards/StudentGuard";
import AdminGuard from "./guards/AdminGuard";
import * as LazyRoutes from "./lazyRoutes";

const AllBlogsPage = lazy(() => import("./components/landing/AllBlogsPage"));
const BlogPostPage = lazy(() => import("./components/landing/Blogpostpage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const InstructorPage = lazy(() => import("./pages/InstructorPage"));
const CourseDetailsPage = lazy(() => import("./pages/CourseDetailsPage"));
const CertificateVerificationPage = lazy(() => import("./pages/CertificateVerificationPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const InstructorAgreementPage = lazy(() => import("./pages/InstructorAgreementPage"));

const {
  LoginPage, ForgotPassword, RegisterPage, CheckEmailPage, VerifyEmailPage,
  TeacherDetailsPage, PendingPage, AccountTypePage, Home, AddChildPage,
  LessonsSchedule, Notifications, SubscriptionPage, ChildrenPage,
  RegisterSuccessPage, TeacherHome, StudentHome, StudentGroupsPage,
  StudentSchedulePage, StudentDetailsPages, StudentSubjectsPages,
  StudentPackagesPage, StudentOrderSummaryPage, SubscriptionOrderStatusPage,
  GroupsPage, GroupLessonsPage, GroupStudentsPage, StudentDetailsPage,
  CreateLessonPage, AssignmentsPage, Schedule, Messages, LessonDetailsPage,
  AddAssignmentPage, Notificationss, AssignmentDetailsPage, TeacherMessages,
  AccountSettingsPage, TeacherAccountSettingsPage, EarningsPage, AdminHome,
  AdminSchedulePage, AdminAccountSettingsPage, AdminNotificationss, UsersPage,
  GroupsPages, AttendancePage, CreateGroupPages, SupervisorsPage, TeachersPage,
  TeacherSessionsPage, RecordingsPages, AdminMessages, SubscriptionsPage,
  SubscriptionRequestsPage, ActivateSubscriptionPage, SubscriptionDetailsPage,
  SubscriptionOrderReviewPage, AdminPaymentsPage, PaymentDetailsPage,
  TeacherSalariesPage, CreateCurriculumPage, StudentAccountSettingsPage,
  StudentNotifications, StudentSubscriptionPage, RenewalPage, AddSubjectPage,
  StudentMessagess, StudentAssignmentsPage, StudentGroupLessonsPage,
  StudentLessonDetailsPage, LessonFilesPage, CreateSchedulePage,
  AttendanceRegistrationPage, SessionDetailsPage, AddSubscriptionPage,
  CreateStudentPage, RenewSubscriptionPage, BlogsPage, BlogFormPage,
  StudentPaymentsPage, StudentCoursesPage, MyCourseDetailsPage,
  CoursePlayerPage, CourseCheckoutPage, ExamPage, ExamResultPage,
  CourseCertificatePage, MyCertificatesPage, TeacherCoursesPage,
  TeacherCourseFormPage, TeacherCourseDetailsPage, AdminCoursesPage,
  AdminCourseDetailsPage, AdminQuizReviewPage, AdminCourseFormPage,
  CourseCategoriesPage, CategoryCoursesPage, CourseFinancesPage,
  CommissionSettingsPage, AdminWithdrawalsPage, AdminPoliciesPage,
  InstructorCommissionRatesPage, InstructorOnboardingPage,
  InstructorProfilePage, MediaSecurityEventsPage, InstructorDashboardPage,
} = LazyRoutes;

const RouteLoading = () => (
  <div className="flex min-h-[45vh] items-center justify-center bg-[#F5F7FB]" role="status" aria-label="جاري تحميل الصفحة" dir="rtl">
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#123C91] border-t-transparent" />
  </div>
);

const isStaleLazyChunkError = (error) => {
  const message = [error?.name, error?.message, error?.cause?.message]
    .filter(Boolean)
    .join(" ");
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|CSS_CHUNK_LOAD_FAILED/i.test(
    message,
  );
};

const reloadLatestApp = async () => {
  try {
    const registrations = await navigator.serviceWorker?.getRegistrations?.();
    await Promise.all((registrations || []).map((registration) => registration.unregister()));
    const cacheKeys = await window.caches?.keys?.();
    await Promise.all((cacheKeys || []).map((key) => window.caches.delete(key)));
  } catch {
    // A cache cleanup failure must not prevent the recovery reload.
  }
  const url = new URL(window.location.href);
  url.searchParams.set("__app_reload", Date.now().toString());
  window.location.replace(url.toString());
};

class LazyRouteBoundary extends Component {
  state = { failed: false, error: null };

  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }

  componentDidCatch(error) {
    if (!isStaleLazyChunkError(error)) return;

    const reloadKey = `alacademeya:chunk-reload:${window.location.pathname}`;
    const lastReload = Number(window.sessionStorage.getItem(reloadKey) || 0);
    if (Date.now() - lastReload < 15_000) return;

    window.sessionStorage.setItem(reloadKey, String(Date.now()));
    reloadLatestApp();
  }

  render() {
    if (this.state.failed) {
      const errorDetails = [
        `URL: ${window.location.href}`,
        `Name: ${this.state.error?.name || "UnknownError"}`,
        `Message: ${this.state.error?.message || "No error message"}`,
        this.state.error?.stack ? `Stack:\n${this.state.error.stack}` : "",
      ].filter(Boolean).join("\n\n");
      return (
        <main className="min-h-screen bg-[#F4F7FC] px-4 py-8 sm:px-6 sm:py-14" dir="rtl">
          <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-[#DCE5F3] bg-white shadow-[0_18px_55px_rgba(16,42,88,0.10)]">
            <header className="border-b border-[#E6ECF5] bg-gradient-to-l from-[#F3F7FF] to-white px-5 py-6 sm:px-8">
              <div className="flex items-start gap-4 text-right">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
                  <AlertTriangle size={24} />
                </span>
                <div>
                  <h1 className="text-xl font-bold text-[#123C91] sm:text-2xl">تعذر تحميل الصفحة</h1>
                  <p className="mt-1.5 text-sm leading-6 text-[#667085]">حدث خطأ داخل الصفحة. التفاصيل التقنية بالأسفل تساعد فريق التطوير على تحديد السبب بسرعة.</p>
                </div>
              </div>
            </header>

            <div className="p-5 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-right">
                  <p className="text-xs font-semibold text-red-500">نوع الخطأ</p>
                  <p className="mt-1 break-words font-mono text-sm font-bold text-red-800" dir="ltr">{this.state.error?.name || "UnknownError"}</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-right">
                  <p className="text-xs font-semibold text-red-500">رسالة الخطأ</p>
                  <p className="mt-1 break-words font-mono text-sm font-bold text-red-800" dir="ltr">{this.state.error?.message || "No error message"}</p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-[#26364F] bg-[#101828] shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-slate-300">
                  <span className="font-semibold">تفاصيل Debug</span>
                  <span dir="ltr">Runtime Error</span>
                </div>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap p-4 text-left font-mono text-xs leading-6 text-slate-200 sm:p-5" dir="ltr">{errorDetails}</pre>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={async () => { await navigator.clipboard?.writeText(errorDetails); toast.success("تم نسخ تفاصيل الخطأ"); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#B9C9E5] bg-white px-4 py-3 text-sm font-bold text-[#123C91] transition hover:bg-[#F4F7FC]">
                  <Copy size={17} />
                  نسخ التفاصيل
                </button>
                <button type="button" onClick={reloadLatestApp} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123C91] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0F327A]">
                  <RefreshCw size={17} />
                  تنظيف الكاش وإعادة التحميل
                </button>
                <button type="button" onClick={() => window.location.assign("/admin-dashboard")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-4 py-3 text-sm font-bold text-[#344054] transition hover:bg-gray-50">
                  <LayoutDashboard size={17} />
                  العودة للوحة التحكم
                </button>
              </div>
              <p className="mt-5 text-center text-xs leading-5 text-[#98A2B3]">يمكنك نسخ التفاصيل وإرسالها للمطور دون مشاركة أي كلمات مرور.</p>
            </div>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { user, checkingAccountState } = useContext(AuthContext);
  const superAdminOnly = (page) =>
    user?.role === "super-admin" ? page : <Navigate to="/forbidden" replace />;

  if (checkingAccountState) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#F5F7FB]"
        dir="rtl"
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#123C91] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-left"
        reverseOrder={false}
        toastOptions={{
          duration: 10000,
          style: { direction: "rtl" },
        }}
      >
        {(currentToast) => (
          <ToastBar toast={currentToast}>
            {({ icon, message }) => (
              <div className="relative -m-2 flex min-w-72 items-center gap-2 overflow-hidden p-2 pb-3">
                {icon}
                <div className="flex-1">{message}</div>
                <button
                  type="button"
                  onClick={() => toast.dismiss(currentToast.id)}
                  className="mr-2 flex size-6 shrink-0 items-center justify-center rounded-full text-lg leading-none text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  aria-label="إغلاق الرسالة"
                >
                  ×
                </button>
                <span
                  key={currentToast.id}
                  className="toast-countdown absolute inset-x-0 bottom-0 h-1 rounded-full bg-[#123C91]"
                  aria-hidden="true"
                />
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>

      <LazyRouteBoundary>
      <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Landing */}
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
          <Route path="/blogs" element={<AllBlogsPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:slug" element={<CourseDetailsPage />} />
          <Route path="/instructors/:id" element={<InstructorPage />} />
          <Route path="/certificates/verify" element={<CertificateVerificationPage />} />
          <Route path="/certificates/verify/:certificateNumber" element={<CertificateVerificationPage />} />
          <Route path="/policies/instructor-agreement" element={<InstructorAgreementPage />} />
          <Route path="/policies/course-publishing" element={<InstructorAgreementPage policyType="course_publishing_policy" />} />
          <Route path="/policies/revenue-share" element={<InstructorAgreementPage policyType="revenue_share_agreement" />} />
          <Route path="/policies/course-terms" element={<InstructorAgreementPage policyType="learner_course_terms" />} />
        </Route>
        {/* Auth */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/select-account-type"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <AccountTypePage />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={getDashboardPathByRole(user)} replace />
            ) : (
              <RegisterPage />
            )
          }
        />
        <Route path="/check-email" element={<CheckEmailPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/register/student-details"
          element={<StudentDetailsPages />}
        />
        <Route path="/register/subjects" element={<StudentSubjectsPages />} />
        <Route path="/register/packages" element={<StudentPackagesPage />} />
        <Route
          path="/register/order-summary"
          element={<StudentOrderSummaryPage />}
        />
        <Route
          path="/subscription-orders/:orderId/status"
          element={
            user ? (
              <SubscriptionOrderStatusPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/payment/success"
          element={
            user ? (
              <SubscriptionOrderStatusPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        <Route
          path="/register/teacher-details"
          element={<TeacherDetailsPage />}
        />
        <Route path="/pending" element={<PendingPage />} />
        <Route
          path="/account-state"
          element={<Navigate to="/pending" replace />}
        />
        {/* Parent */}
        <Route
          path="/parent-dashboard"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent-dashboard/add-child"
          element={user ? <AddChildPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/schedule"
          element={
            user ? <LessonsSchedule /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/classrooms/:classroomId/sessions/:sessionId"
          element={
            user ? (
              <SessionDetailsPage role="parent" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/parent/children"
          element={user ? <ChildrenPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/notifications"
          element={user ? <Notifications /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/subscription"
          element={
            user ? <SubscriptionPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/subscriptions/:id/renew"
          element={
            user ? (
              <RenewalPage role="parent" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/parent/subscriptions/:id/add-subject"
          element={
            user ? (
              <AddSubjectPage role="parent" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/parent/students/:studentId/subscription/packages"
          element={
            user ? <StudentPackagesPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/messages"
          element={user ? <Messages /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/parent/settings"
          element={
            user ? <AccountSettingsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/parent/payments"
          element={user ? <StudentPaymentsPage role="parent" /> : <Navigate to="/login" replace />}
        />
        {/* ✅ Student — محمي بـ StudentGuard */}
        <Route
          path="/learner-dashboard"
          element={
            <StudentGuard>
              <StudentCoursesPage dashboard="learner" />
            </StudentGuard>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <StudentGuard>
              <StudentHome />
            </StudentGuard>
          }
        />
        <Route
          path="/student/settings"
          element={
            <StudentGuard>
              <StudentAccountSettingsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <StudentGuard>
              <StudentNotifications />
            </StudentGuard>
          }
        />
        <Route
          path="/student/subscription"
          element={
            <StudentGuard>
              <StudentSubscriptionPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/subscriptions/:id/renew"
          element={
            <StudentGuard>
              <RenewalPage role="student" />
            </StudentGuard>
          }
        />
        <Route
          path="/student/subscriptions/:id/add-subject"
          element={
            <StudentGuard>
              <AddSubjectPage role="student" />
            </StudentGuard>
          }
        />
        <Route
          path="/student/messages"
          element={
            <StudentGuard>
              <StudentMessagess />
            </StudentGuard>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <StudentGuard>
              <StudentAssignmentsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/schedule"
          element={
            <StudentGuard>
              <StudentSchedulePage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups"
          element={
            <StudentGuard>
              <StudentGroupsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups/:groupId/lessons"
          element={
            <StudentGuard>
              <StudentGroupLessonsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups/:groupId/lessons/:lessonId"
          element={
            <StudentGuard>
              <StudentLessonDetailsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/groups/:groupId/lessons/:lessonId/files"
          element={
            <StudentGuard>
              <LessonFilesPage />
            </StudentGuard>
          }
        />
        <Route
          path="/student/payments"
          element={
            <StudentGuard>
              <StudentPaymentsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/learner/payments"
          element={
            <StudentGuard>
              <StudentPaymentsPage role="learner" />
            </StudentGuard>
          }
        />
        <Route
          path="/student-dashboard/courses"
          element={
            <StudentGuard>
              <StudentCoursesPage />
            </StudentGuard>
          }
        />
        <Route
          path="/my-courses/:slug"
          element={
            <StudentGuard>
              <MyCourseDetailsPage />
            </StudentGuard>
          }
        />
        <Route
          path="/payment/courses/:slug"
          element={
            <StudentGuard>
              <CourseCheckoutPage />
            </StudentGuard>
          }
        />
        <Route
          path="/learn/:courseId"
          element={
            <StudentGuard>
              <CoursePlayerPage />
            </StudentGuard>
          }
        />
        <Route
          path="/exam/:courseId"
          element={
            <StudentGuard>
              <ExamPage />
            </StudentGuard>
          }
        />
        <Route
          path="/exam-result/:courseId"
          element={
            <StudentGuard>
              <ExamResultPage />
            </StudentGuard>
          }
        />
        <Route
          path="/certificate/:courseId"
          element={
            <StudentGuard>
              <CourseCertificatePage />
            </StudentGuard>
          }
        />
        <Route path="/my-certificates" element={<StudentGuard><MyCertificatesPage /></StudentGuard>} />
        {/* ✅ Teacher — محمي بـ TeacherGuard */}
        <Route
          path="/teacher-dashboard"
          element={
            <TeacherGuard>
              <TeacherHome />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups"
          element={
            <TeacherGuard>
              <GroupsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons"
          element={
            <TeacherGuard>
              <GroupLessonsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/students"
          element={
            <TeacherGuard>
              <GroupStudentsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/students/:studentId"
          element={
            <TeacherGuard>
              <StudentDetailsPage />
            </TeacherGuard>
          }
        />
        {/* <Route path="/add-new-group" element={<TeacherGuard><CreateGroupPage /></TeacherGuard>} /> */}
        <Route
          path="/teacher/groups/:groupId/lessons/new"
          element={
            <TeacherGuard>
              <CreateLessonPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons/:lessonId"
          element={
            <TeacherGuard>
              <LessonDetailsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons/schedule/new"
          element={
            <TeacherGuard>
              <CreateSchedulePage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/tasks"
          element={
            <TeacherGuard>
              <AssignmentsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/schedule"
          element={
            <TeacherGuard>
              <Schedule />
            </TeacherGuard>
          }
        />
        <Route
          path="/assignments/new"
          element={
            <TeacherGuard>
              <AddAssignmentPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/notifications"
          element={
            <TeacherOrInstructorGuard>
              <Notificationss />
            </TeacherOrInstructorGuard>
          }
        />
        <Route
          path="/teacher/assignments/:assignmentId"
          element={
            <TeacherGuard>
              <AssignmentDetailsPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/messages"
          element={
            <TeacherOrInstructorGuard>
              <TeacherMessages />
            </TeacherOrInstructorGuard>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <TeacherOrInstructorGuard>
              <TeacherAccountSettingsPage />
            </TeacherOrInstructorGuard>
          }
        />
        <Route
          path="/teacher/earnings"
          element={
            <InstructorGuard allowSuspended>
              <EarningsPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/payments"
          element={
            <TeacherOrInstructorGuard>
              <StudentPaymentsPage role="teacher" />
            </TeacherOrInstructorGuard>
          }
        />
        <Route
          path="/teacher/groups/:groupId/lessons/:lessonId/attendance"
          element={
            <TeacherGuard>
              <AttendanceRegistrationPage />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/earnings/commission-rates"
          element={
            <InstructorGuard>
              <InstructorCommissionRatesPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/my-courses"
          element={
            <TeacherGuard>
              <StudentCoursesPage dashboard="teacher" />
            </TeacherGuard>
          }
        />
        <Route
          path="/teacher/learning"
          element={
            <InstructorGuard>
              <StudentCoursesPage dashboard="teacher" />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <InstructorGuard requireProfile={false}>
              <TeacherCoursesPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/courses/new"
          element={
            <InstructorGuard>
              <TeacherCourseFormPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/courses/:courseId"
          element={
            <InstructorGuard requireProfile={false}>
              <TeacherCourseDetailsPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/courses/:courseId/edit"
          element={
            <InstructorGuard>
              <TeacherCourseFormPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/courses/:courseId/quizzes/:lessonId"
          element={
            <InstructorGuard requireProfile={false}>
              <AdminQuizReviewPage mode="teacher" />
            </InstructorGuard>
          }
        />
        <Route
          path="/teacher/instructor-profile"
          element={
            <InstructorGuard>
              <InstructorProfilePage />
            </InstructorGuard>
          }
        />
        {/* Admin */}
        <Route element={<AdminGuard />}>
          <Route
            path="/admin/courses"
            element={
              user ? <AdminCoursesPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              user ? <AdminCourseFormPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/courses/:courseId"
            element={
              user ? (
                <AdminCourseDetailsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/courses/:courseId/edit"
            element={
              user ? <AdminCourseFormPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/courses/:courseId/quizzes/:lessonId"
            element={
              user ? <AdminQuizReviewPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/course-categories"
            element={
              user ? <CourseCategoriesPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/course-categories/:categoryId/courses"
            element={
              user ? <CategoryCoursesPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/course-finances"
            element={
              user ? <CourseFinancesPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/course-finances/commission-settings"
            element={
              user ? (
                <CommissionSettingsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/admin/course-finances/withdrawals" element={user ? <AdminWithdrawalsPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/course-policies"
            element={superAdminOnly(<AdminPoliciesPage />)}
          />
          <Route
            path="/admin-dashboard"
            element={user ? <AdminHome /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/settings"
            element={
              user ? (
                <AdminAccountSettingsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/admin/security/media" element={user ? <MediaSecurityEventsPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/notifications"
            element={
              user ? <AdminNotificationss /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/users"
            element={user ? <UsersPage key="all-users" /> : <Navigate to="/login" replace />}
          />
          <Route path="/admin/learners" element={user ? <UsersPage key="learners" fixedRole="طالب دورات" title="طلاب الدورات" description="إدارة حسابات طلاب الدورات المسجلين في المنصة." /> : <Navigate to="/login" replace />} />
          <Route path="/admin/instructors" element={user ? <UsersPage key="instructors" fixedRole="محاضر دورات" title="محاضرو الدورات" description="إدارة حسابات محاضري الدورات وملفاتهم على سوق الدورات." /> : <Navigate to="/login" replace />} />
          <Route path="/admin/students" element={user ? <UsersPage key="students" fixedRole="طالب أكاديمي" title="الطلاب الأكاديميون" description="إدارة حسابات الطلاب الأكاديميين وبياناتهم الدراسية." /> : <Navigate to="/login" replace />} />
          <Route path="/admin/parents" element={user ? <UsersPage key="parents" fixedRole="ولي أمر" title="أولياء الأمور" description="إدارة حسابات أولياء الأمور المرتبطة بالطلاب." /> : <Navigate to="/login" replace />} />
          <Route path="/admin/students/new" element={user ? <CreateStudentPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/groups"
            element={user ? <GroupsPages /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/groups/:groupId/lessons"
            element={
              user ? (
                <GroupLessonsPage role="admin" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/groups/:groupId/lessons/new"
            element={
              user ? (
                <CreateLessonPage role="admin" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/groups/:groupId/schedule"
            element={
              user ? (
                <CreateSchedulePage role="admin" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/schedule"
            element={
              user ? <AdminSchedulePage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/classrooms/:classroomId/sessions/:sessionId"
            element={
              user ? (
                <SessionDetailsPage role="admin" />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/groups/:groupId/attendance"
            element={
              user ? <AttendancePage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/groups/new"
            element={
              user ? <CreateGroupPages /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/supervisors"
            element={superAdminOnly(<SupervisorsPage />)}
          />
          <Route
            path="/admin/teachers"
            element={user ? <TeachersPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/teachers/:teacherId/sessions/:sessionStatus"
            element={
              user ? <TeacherSessionsPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/records"
            element={
              user ? <RecordingsPages /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/messages"
            element={
              user ? <AdminMessages /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/subscription"
            element={
              user ? (
                <Navigate
                  to="/admin/subscription/orders"
                  replace
                />
              ) : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/subscription/:tab"
            element={user ? <SubscriptionsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/subscriptions/requests"
            element={
              user ? (
                <SubscriptionRequestsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/subscription-orders/:id"
            element={
              user ? (
                <SubscriptionOrderReviewPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/payments"
            element={
              user ? <AdminPaymentsPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/payments/:id"
            element={
              user ? <PaymentDetailsPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/teacher-salaries"
            element={superAdminOnly(<TeacherSalariesPage />)}
          />
          <Route
            path="/admin/subscriptions/:id"
            element={
              user ? (
                <SubscriptionDetailsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/admin/subscriptions/:id/renew" element={user ? <RenewSubscriptionPage /> : <Navigate to="/login" replace />} />
          <Route
            path="/admin/blogs"
            element={superAdminOnly(<BlogsPage />)}
          />
          <Route
            path="/admin/blogs/add"
            element={superAdminOnly(<BlogFormPage />)}
          />
          <Route
            path="/admin/blogs/:id/edit"
            element={superAdminOnly(<BlogFormPage />)}
          />
          <Route
            path="/admin/subscriptions/requests/:id/activate"
            element={
              user ? (
                <ActivateSubscriptionPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin/curriculum/create"
            element={
              user ? <CreateCurriculumPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/curriculum/:curriculumId/edit"
            element={
              user ? <CreateCurriculumPage /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/admin/subscriptions/add"
            element={
              ["admin", "super-admin"].includes(user?.role) ? (
                <AddSubscriptionPage />
              ) : (
                <Navigate to="/admin-dashboard" replace />
              )
            }
          />
        </Route>
        <Route
          path="/instructor-dashboard"
          element={
            <InstructorGuard requireActiveStatus>
              <InstructorDashboardPage />
            </InstructorGuard>
          }
        />
        <Route
          path="/instructor/onboarding"
          element={
            <InstructorGuard requireProfile={false}>
              <InstructorOnboardingPage />
            </InstructorGuard>
          }
        />
        <Route path="/forbidden" element={<NotFoundPage status={403} />} />
        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      </LazyRouteBoundary>
    </>
  );
}

export default App;
