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

import StudentSubjectsPage from "./pages/auth/StudentSubjectsPages";
import RegisterSuccessPage from "./pages/auth/RegisterSuccessPage";
import TeacherHome from "./pages/teacher/TeacherHome";
import StudentHome from "./pages/student/StudentHome";
import StudentDetailsPages from "./pages/auth/StudentDetailsPages";
import StudentSubjectsPages from "./pages/auth/StudentSubjectsPages";


function App() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Toaster
        position="top-left"
        reverseOrder={false}
        toastOptions={{
          style: {
            direction: "ltr",
          },
        }}
      />

      <Routes>
        {/* Landing */}
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
        </Route>

        {/* Auth — guests only */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/select-account-type" element={<AccountTypePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/register/student-details" element={<StudentDetailsPages />} />
        <Route path="/register/subjects" element={<StudentSubjectsPages />} />
        <Route path="/register/success" element={<RegisterSuccessPage />} />
        {/* <Route path="/register/interests" element={<StudentInterestsPage />} /> */}
        <Route path="/register/teacher-details" element={<TeacherDetailsPage />} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/account-state" element={<AccountStatePage />} />

        {/* Parent — authenticated only */}
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
          element={user ? <LessonsSchedule /> : <Navigate to="/login" replace />}
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
          element={user ? <SubscriptionPage /> : <Navigate to="/login" replace />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Teacher */}

        <Route
          path="/teacher-dashboard"
          element={user ? <TeacherHome /> : <Navigate to="/login" replace />}
        />

        {/* Students */}
        <Route
          path="/student-dashboard"
          element={user ? <StudentHome /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default App;