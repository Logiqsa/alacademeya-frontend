import { useEffect, useState, useContext } from "react";
import logo from "../../assets/icons/logo.svg";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { isAdminRole } from "../../utils/roles";

// ── الـ role بيحدد الداشبورد ──────────────────────────────────────────────
// admin / super-admin → /admin-dashboard
// teacher  → لو isActive=true يروح /teacher-dashboard، غير كده /account-state
// student  → لو isActive=true يروح /student-dashboard، غير كده /register/success
// parent   → /parent-dashboard (default)
//
// ملاحظة: زي الـ teacher بالظبط، بنعتمد على القيمة المخزّنة في الـ user
// (isActive / registrationStatus / status) جوه الـ AuthContext، من غير ما
// نضرب أي API إضافي (زي /auth/account-state اللي بترجع 404 حالياً).
const goToDashboard = (user, navigate) => {
  const role = user?.role;

  if (isAdminRole(role)) {
    navigate("/admin-dashboard");
    return;
  }

  // if (role === "teacher") {
  //   navigate(user?.registrationStatus === "approved" ? "/teacher-dashboard" : "/account-state");
  //   return;
  // }


  if (role === "teacher") {
    const isApproved =
      user?.isActive === true ||
      user?.registrationStatus === "active" ||
      user?.status === "approved";

    navigate(isApproved ? "/teacher-dashboard" : "/account-state");
    return;
  }

  if (role === "student") {
    const isApproved =
      user?.isActive === true ||
      user?.registrationStatus === "active" ||
      user?.status === "approved";

    navigate(isApproved ? "/student-dashboard" : "/account-state");
    return;
  }

  if (role === "parent") {
    navigate("/parent-dashboard");
    return;
  }

  const isPending =
    user?.status === "pending" ||
    String(user?.registrationStatus || "").startsWith("pending") ||
    user?.isActive === false;

  navigate(isPending || user ? "/account-state" : "/");
};

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { title: "الرئيسية", id: "home" },
    { title: "الباقات", id: "pricing" },
    { title: "عن الأكاديمية", id: "features" },
    { title: "المميزات", id: "services" },
    { title: "المدونه", id: "blog" },
    { title: "الأسئلة الشائعة", id: "faq" },
  ];

  const scrollToSection = (id, behavior = "smooth") => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior, block: "start" });
  };

  const handleNavLink = (id) => {
    setMenuOpen(false);

    if (location.pathname === "/") {
      scrollToSection(id);
      window.history.replaceState(null, "", `/#${id}`);
      return;
    }

    navigate({
      pathname: "/",
      hash: `#${id}`,
    });
  };

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const sectionId = decodeURIComponent(location.hash.slice(1));
    const frameId = window.requestAnimationFrame(() => {
      scrollToSection(sectionId);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname, location.hash]);

  const handleDashboardClick = () => {
    goToDashboard(user, navigate);
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        dir="rtl"
        className="
          relative top-0 left-0 w-full h-20
          px-4 md:px-10 lg:px-20
          bg-(--bg-light)/60 backdrop-blur-md
          border-b border-(--border-light) shadow-(--shadow)
          z-50
        "
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logo} alt="logo" className="w-35 md:w-44 h-8 object-contain" />
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {links.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavLink(item.id)}
                className="relative inline-flex items-center text-[16px] font-medium text-primary transition-all duration-300 hover:text-[#12C6B0]! hover:scale-105 after:content-[''] after:absolute after:right-0 after:-bottom-1 after:h-0.5 after:w-full after:scale-x-0 after:origin-right after:bg-[#12C6B0] after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-[#123C91] font-medium text-[16px]">
                  مرحباً، {user.fullName || "عزيزي المستخدم"}
                </span>
                <button
                  onClick={handleDashboardClick}
                  className="h-10 px-6 rounded-lg bg-[#123C91] text-white [&_svg]:text-white text-[16px] font-medium"
                >
                  لوحة التحكم
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate("/select-account-type")}
                  className="h-10 px-6 rounded-lg bg-[#123C91] text-white [&_svg]:text-white text-[16px] font-medium transition-none"
                >
                  إنشاء حساب
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="h-10 px-6 rounded-lg bg-[#F8FBFF] border border-[#1F293733] text-[#123C91] text-[16px] font-medium transition-all duration-300"
                >
                  تسجيل الدخول
                </button>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button onClick={() => setMenuOpen(true)} className="lg:hidden text-primary">
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* OVERLAY */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-70 sm:w-[320px]
          bg-white z-50 shadow-2xl flex flex-col
          transform transition-transform duration-300
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-(--border-light)">
          <img src={logo} alt="logo" className="h-9.5" />
          <button onClick={() => setMenuOpen(false)}>
            <X size={26} className="text-[#123C91]" />
          </button>
        </div>

        {/* LINKS */}
        <div className="flex flex-col gap-6 p-6">
          {links.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavLink(item.id)}
              className="text-primary hover:text-[#12C6B0]! text-[16px] font-medium transition-colors duration-300"
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="mt-auto p-6 border-t border-(--border-light) flex flex-col gap-3">
          {user ? (
            <div className="flex flex-col gap-4">
              <span className="text-[#123C91] font-medium text-[16px] text-center">
                مرحباً، {user.fullName || "عزيزي المستخدم"}
              </span>
              <button
                onClick={() => { handleDashboardClick(); setMenuOpen(false); }}
                className="h-10 w-full rounded-lg bg-[#123C91] text-white [&_svg]:text-white text-[16px] font-medium"
              >
                لوحة التحكم
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => { navigate("/select-account-type"); setMenuOpen(false); }}
                className="h-10 w-full rounded-lg bg-[#123C91] text-white [&_svg]:text-white text-[16px] font-medium transition-none"
              >
                إنشاء حساب
              </button>
              <button
                onClick={() => { navigate("/login"); setMenuOpen(false); }}
                className="h-10 w-full rounded-lg bg-[#F8FBFF] border border-[#1F293733] text-[#123C91] text-[16px] font-medium transition-all duration-300"
              >
                تسجيل الدخول
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navbar;
