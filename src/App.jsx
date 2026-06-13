import { Routes, Route } from "react-router-dom";
import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import RegisterPage from "./pages/auth/RegisterPage";
import AccountTypePage from "./pages/auth/AccountTypePage";
import Home from "./pages/parent/Home";
// import AddChildPage from "./pages/parent/add-child/AddChildPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/select-account-type" element={<AccountTypePage />} />
        <Route path="/register" element={<RegisterPage />} />



        <Route path="/parent-dashboard" element={<Home />} />
        {/* <Route path="/add-child" element={<AddChildPage />} /> */}

      </Routes>
    </>
  );
}

export default App;