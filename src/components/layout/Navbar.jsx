import { useEffect, useRef, useState, useContext } from "react";
import logo from "../../assets/icons/logo.svg";
import { ChevronDown, GraduationCap, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { canHaveInstructorProfile, getDashboardPathByRole, isInstructor } from "../../utils/roles";

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
  navigate(getDashboardPathByRole(user));
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const showBecomeInstructor =
    canHaveInstructorProfile(user) && !isInstructor(user);

  const links = [
    { title: "الرئيسية", id: "home" },
    { title: "الدورات", id: "courses" },
    { title: "الباقات", id: "pricing" },
    { title: "عن الأكاديمية", id: "features" },
    { title: "المميزات", id: "services" },
    { title: "المدونه", id: "blog" },
    { title: "الأسئلة الشائعة", id: "faq" },
  ];
  const policyLinks = [
    { title: "اتفاقية المحاضر", to: "/policies/instructor-agreement" },
    { title: "سياسة نشر الدورات", to: "/policies/course-publishing" },
    { title: "اتفاقية مشاركة الإيرادات", to: "/policies/revenue-share" },
    { title: "شروط شراء والالتحاق بالدورات", to: "/policies/course-terms" },
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

  useEffect(() => {
    const closeAccountMenu = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeAccountMenu);
    return () => document.removeEventListener("pointerdown", closeAccountMenu);
  }, []);

  const handleDashboardClick = () => {
    setAccountMenuOpen(false);
    goToDashboard(user, navigate);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setAccountMenuOpen(false);
    setMobileAccountOpen(false);
    navigate("/", { replace: true });
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
            <div className="group relative">
              <button type="button" className="relative inline-flex items-center gap-1 text-[16px] font-medium text-primary transition-all duration-300 hover:text-[#12C6B0]! group-focus-within:text-[#12C6B0]">
                الاتفاقيات <ChevronDown size={16} className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" />
              </button>
              <div className="invisible absolute right-0 top-[calc(100%+12px)] z-60 w-64 translate-y-2 rounded-xl border border-[#E1E7EF] bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {policyLinks.map((item) => (
                  <Link key={item.to} to={item.to} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#EEF4FF] hover:text-[#123C91]">
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* DESKTOP BUTTONS */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  aria-expanded={accountMenuOpen}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-[#D8E1EF] bg-white px-3 py-2 text-right shadow-sm transition hover:border-[#123C91] hover:bg-[#F8FBFF]"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#123C91] font-bold text-white">{(user.fullName || user.name || "م").trim().charAt(0)}</span>
                  <span className="min-w-0 max-w-40 text-right"><span className="block text-[11px] text-[#7B8490]">مرحبًا،</span><strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-start text-sm text-[#123C91]" dir="auto" title={user.fullName || user.name || "عزيزي المستخدم"}>{user.fullName || user.name || "عزيزي المستخدم"}</strong></span>
                  <ChevronDown size={17} className={`mr-1 text-[#667085] transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {accountMenuOpen && <div className="absolute left-0 top-[calc(100%+8px)] z-60 w-56 overflow-hidden rounded-xl border border-[#E1E7EF] bg-white p-1.5 shadow-xl">
                  <button type="button" onClick={handleDashboardClick} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#344054] transition hover:bg-[#F2F6FC]"><LayoutDashboard size={18} className="text-[#123C91]" />لوحة التحكم</button>
                  {showBecomeInstructor && <button type="button" onClick={() => { setAccountMenuOpen(false); navigate("/instructor/onboarding"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#123C91] transition hover:bg-[#EEF4FF]"><GraduationCap size={18} />كن محاضرًا</button>}
                  <div className="my-1 border-t border-[#EEF1F5]" />
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut size={18} />تسجيل الخروج</button>
                </div>}
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
          <div className="border-t border-[#E6ECF3] pt-5">
            <p className="mb-3 text-sm font-bold text-[#667085]">الاتفاقيات والسياسات</p>
            <div className="flex flex-col gap-3">
              {policyLinks.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-[#123C91] hover:text-[#12C6B0]">
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-auto p-6 border-t border-(--border-light) flex flex-col gap-3">
          {user ? (
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => setMobileAccountOpen((open) => !open)} className="flex items-center justify-between rounded-xl border border-[#D8E1EF] bg-[#F8FBFF] px-4 py-3 text-[#123C91]">
                <span className="min-w-0 max-w-[210px] text-right"><span className="block text-xs text-[#7B8490]">مرحبًا،</span><strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-start text-sm" dir="auto" title={user.fullName || user.name || "عزيزي المستخدم"}>{user.fullName || user.name || "عزيزي المستخدم"}</strong></span>
                <ChevronDown size={18} className={`transition-transform ${mobileAccountOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileAccountOpen && <>
              <button
                onClick={() => { handleDashboardClick(); setMenuOpen(false); }}
                className="h-10 w-full rounded-lg bg-[#123C91] text-white [&_svg]:text-white text-[16px] font-medium"
              >
                لوحة التحكم
              </button>
              {showBecomeInstructor && <button onClick={() => { navigate("/instructor/onboarding"); setMenuOpen(false); setMobileAccountOpen(false); }} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#123C91] bg-white text-[16px] font-medium text-[#123C91]"><GraduationCap size={18} />كن محاضرًا</button>}
              <button
                onClick={handleLogout}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white text-[16px] font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} />
                تسجيل الخروج
              </button>
              </>}
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
