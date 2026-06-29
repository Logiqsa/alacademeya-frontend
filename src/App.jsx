import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";

import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import RegisterPage from "./pages/auth/RegisterPage";
import OtpPage from "./pages/auth/OtpPage";
import TeacherDetailsPage from "./pages/auth/TeacherDetailsPage";
import PendingPage from "./pages/auth/PendingPage";
import AccountStatePage from "./pages/auth/AccountStatePage";
import { AccountTypePage } from "./pages/auth/AccountTypePage";

import Home from "./pages/parent/Home";
import AddChildPage from "./pages/parent/add-child/AddChildPage";
import LessonsSchedule from "./pages/parent/LessonsSchedule";
import Notifications from "./pages/parent/Notifications";
import SubscriptionPage from "./pages/parent/SubscriptionPage";
import ChildrenPage from "./pages/parent/ChildrenPage";

import { AuthContext } from "./context/AuthContext";

import RegisterSuccessPage from "./pages/auth/RegisterSuccessPage";
import TeacherHome from "./pages/teacher/TeacherHome";
import StudentHome from "./pages/student/StudentHome";
import StudentDetailsPages from "./pages/auth/StudentDetailsPages";
import StudentSubjectsPages from "./pages/auth/StudentSubjectsPages";
import GroupsPage from "./pages/teacher/groups/GroupsPage";
import GroupLessonsPage from "./pages/teacher/groups/GroupLessonsPage";
import GroupStudentsPage from "./pages/teacher/groups/GroupStudentsPage";
import StudentDetailsPage from "./pages/teacher/groups/StudentDetailsPage";
import CreateGroupPage from "./components/teacher/groups/CreateGroupPage";
import CreateLessonPage from "./components/teacher/groups/lessons/CreateLessonPage";
import AssignmentsPage from "./pages/teacher/assignments/AssignmentsPage";
import ExamPage from "./pages/teacher/exam/ExamPage";
import Schedule from "./pages/teacher/schedule/Schedule";
import Messages from "./pages/parent/Messages";
import LessonDetailsPage from "./pages/teacher/groups/LessonDetailsPage";
import AddAssignmentPage from "./components/teacher/assignments/AddAssignmentPage";
import Notificationss from "./pages/teacher/notifications/Notifications";
import AssignmentDetailsPage from "./pages/teacher/assignments/AssignmentDetailsPage";
import TeacherMessages from "./pages/teacher/messages/Messages";
import AccountSettingsPage from "./pages/parent/AccountSettings";
import TeacherAccountSettingsPage from "./pages/teacher/TeacherAccountSettingsPage";
import EarningsPage from "./pages/teacher/EarningsPage";
import ExamDetailsPage from "./pages/teacher/exam/ExamDetailsPage";
import CreateExamPage from "./pages/teacher/exam/addExam/CreateExamPage";

// ✅ Guards
import TeacherGuard from "./guards/TeacherGuard";
import StudentGuard from "./guards/StudentGuard";
import AdminHome from "./pages/admin/AdminHome";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Toaster
        position="top-left"
        reverseOrder={false}
        toastOptions={{ style: { direction: "ltr" } }}
      />

      <Routes>
        {/* Landing */}
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/select-account-type" element={<AccountTypePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/register/student-details" element={<StudentDetailsPages />} />
        <Route path="/register/subjects" element={<StudentSubjectsPages />} />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        <Route path="/register/teacher-details" element={<TeacherDetailsPage />} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/account-state" element={<AccountStatePage />} />

        {/* Parent */}
        <Route path="/parent-dashboard" element={user ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/parent-dashboard/add-child" element={user ? <AddChildPage /> : <Navigate to="/login" replace />} />
        <Route path="/parent/schedule" element={user ? <LessonsSchedule /> : <Navigate to="/login" replace />} />
        <Route path="/parent/children" element={user ? <ChildrenPage /> : <Navigate to="/login" replace />} />
        <Route path="/parent/notifications" element={user ? <Notifications /> : <Navigate to="/login" replace />} />
        <Route path="/parent/subscription" element={user ? <SubscriptionPage /> : <Navigate to="/login" replace />} />
        <Route path="/parent/messages" element={user ? <Messages /> : <Navigate to="/login" replace />} />
        <Route path="/parent/settings" element={user ? <AccountSettingsPage /> : <Navigate to="/login" replace />} />

        {/* ✅ Student — محمي بـ StudentGuard */}
        <Route path="/student-dashboard" element={<StudentGuard><StudentHome /></StudentGuard>} />

        {/* ✅ Teacher — محمي بـ TeacherGuard */}
        <Route path="/teacher-dashboard" element={<TeacherGuard><TeacherHome /></TeacherGuard>} />
        <Route path="/teacher/groups" element={<TeacherGuard><GroupsPage /></TeacherGuard>} />
        <Route path="/teacher/groups/:groupId/lessons" element={<TeacherGuard><GroupLessonsPage /></TeacherGuard>} />
        <Route path="/teacher/groups/:groupId/students" element={<TeacherGuard><GroupStudentsPage /></TeacherGuard>} />
        <Route path="/teacher/groups/:groupId/students/:studentId" element={<TeacherGuard><StudentDetailsPage /></TeacherGuard>} />
        <Route path="/add-new-group" element={<TeacherGuard><CreateGroupPage /></TeacherGuard>} />
        <Route path="/add-new-lesson" element={<TeacherGuard><CreateLessonPage /></TeacherGuard>} />
        <Route path="/teacher/tasks" element={<TeacherGuard><AssignmentsPage /></TeacherGuard>} />
        <Route path="/teacher/exams" element={<TeacherGuard><ExamPage /></TeacherGuard>} />
        <Route path="/teacher/schedule" element={<TeacherGuard><Schedule /></TeacherGuard>} />
        <Route path="/lessons/:lessonId" element={<TeacherGuard><LessonDetailsPage /></TeacherGuard>} />
        <Route path="/assignments/new" element={<TeacherGuard><AddAssignmentPage /></TeacherGuard>} />
        <Route path="/teacher/notifications" element={<TeacherGuard><Notificationss /></TeacherGuard>} />
        <Route path="/teacher/assignments/:assignmentId" element={<TeacherGuard><AssignmentDetailsPage /></TeacherGuard>} />
        <Route path="/teacher/messages" element={<TeacherGuard><TeacherMessages /></TeacherGuard>} />
        <Route path="/teacher/settings" element={<TeacherGuard><TeacherAccountSettingsPage /></TeacherGuard>} />
        <Route path="/teacher/earnings" element={<TeacherGuard><EarningsPage /></TeacherGuard>} />
        <Route path="/teacher/exam/:examId" element={<TeacherGuard><ExamDetailsPage /></TeacherGuard>} />
        <Route path="/teacher/exams/new" element={<TeacherGuard><CreateExamPage /></TeacherGuard>} />

       
       {/* Admin */}
           <Route path="/admin-dashboard" element={user ? <AdminHome /> : <Navigate to="/login" replace />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;