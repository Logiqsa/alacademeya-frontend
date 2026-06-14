import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";

import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import RegisterPage from "./pages/auth/RegisterPage";
import AccountTypePage from "./pages/auth/AccountTypePage";
import Home from "./pages/parent/Home";

import { AuthContext } from "./context/AuthContext";

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
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
        </Route>

        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/select-account-type" element={<AccountTypePage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/parent-dashboard"
          element={user ? <Home /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>


  );
}

export default App;
