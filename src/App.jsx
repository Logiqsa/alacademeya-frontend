import { Routes, Route } from "react-router-dom";
import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";

function App() {
  return (
    <>
      <Routes>
        {/* 1. الصفحات التي تحتاج Navbar و Footer */}
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
        </Route>

        {/* 2. صفحات الـ Auth المستقلة (بدون Navbar و Footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* يمكنك إضافة Register أو أي صفحة أخرى هنا بنفس الطريقة */}
      </Routes>
    </>
  );
}

export default App;