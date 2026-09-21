import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useSidebarUnread } from "../../../api/useSidebarUnread";
import { getDashboardPathByRole, isInstructor, canHaveInstructorProfile } from "../../../utils/roles";
import { getMyInstructorProfile } from "../../../services/APIService";
import {
  Award,
  BadgeDollarSign,
  Bell,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  FilePlus2,
  GraduationCap,
  LayoutDashboard,
  Library,
  MessageSquare,
  ScrollText,
  Settings,
  UserRound,
  UsersRound,
} from "lucide-react";

import logo from "../../../assets/icons/loogo.svg";
import toggleIcon from "../../../assets/icons/sidebar-toggle.png";

import messagesIcon from "../../../assets/icons/messages.png";
import logoutIcon from "../../../assets/icons/logout.png";

const TeacherSidebar = ({ isOpen, setIsOpen }) => {
  const unread = useSidebarUnread();
  const { user, logout, updateUser } = useContext(AuthContext);
  const checkedInstructorUserRef = useRef(null);
  const instructor = isInstructor(user);
  const isTeacher = user?.role === "teacher";
  // Keep marketplace navigation stable while the profile identity request is
  // loading. Route guards remain the authority for the destination itself.
  const canAccessInstructorArea = instructor;
  const canBecomeInstructor = canHaveInstructorProfile(user) && !instructor;
  const dashboardPath = getDashboardPathByRole(user, "/instructor-dashboard");
  const location = useLocation();

  useEffect(() => {
    const userKey = user?.id || user?._id || user?.userId || user?.email || user?.username || user?.role;
    if (!canHaveInstructorProfile(user) || instructor || checkedInstructorUserRef.current === userKey) return;
    checkedInstructorUserRef.current = userKey;
    let active = true;
    const timers = [];
    const syncInstructor = (attempt = 0) => getMyInstructorProfile()
      .then((response) => {
        if (!active) return;
        const payload = response.data?.data || response.data;
        const profile = payload?.instructor || payload?.profile || payload;
        const instructorId = profile?.id || profile?._id;
        if (!instructorId) return;
        updateUser((current) => ({ ...current, accountType: "instructor", instructorId, instructorStatus: profile.status, instructorProfileSlug: profile.profileSlug || profile.slug || "" }));
      })
      .catch((error) => {
        if (!active) return;
        const missingProfile = error.response?.status === 404;
        if (!missingProfile && attempt < 2) {
          timers.push(window.setTimeout(() => syncInstructor(attempt + 1), 700 * (attempt + 1)));
        }
      });
    syncInstructor();
    return () => { active = false; timers.forEach((timer) => window.clearTimeout(timer)); };
  }, [instructor, updateUser, user]);
  const menuSections = [
    {
      label: "رئيسي",
      items: [
        ...(canBecomeInstructor
          ? [{ title: "كن محاضرًا", icon: GraduationCap, path: "/instructor/onboarding" }]
          : []),
        {
          title: "لوحة التحكم",
          icon: LayoutDashboard,
          path: dashboardPath,
        },
      ],
    },
    {
      label: "التدريس",
      items: isTeacher ? [
        { title: "المجموعات", icon: UsersRound, path: "/teacher/groups" },
        { title: "الجدول", icon: CalendarDays, path: "/teacher/schedule" },
        { title: "الواجبات", icon: ClipboardList, path: "/teacher/tasks" },
      ] : [],
    },
    {
      label: "المحتوى والأرباح",
      items: [
        { title: "شهاداتي", icon: Award, path: "/my-certificates" },
        ...(canAccessInstructorArea
          ? [
              {
                title: "إنشاء دورة",
                icon: FilePlus2,
                path: "/teacher/courses/new",
              },
              {
                title: "ملفي الشخصي",
                icon: UserRound,
                path: "/teacher/instructor-profile",
              },
            ]
          : []),
        ...(isTeacher ? [{ title: "الدورات المسجل بها", icon: Library, path: "/teacher/my-courses" }] : []),
        ...(canAccessInstructorArea && !isTeacher ? [{ title: "دوراتي كمتعلم", icon: Library, path: "/teacher/learning" }] : []),
        ...(canAccessInstructorArea
          ? [
              {
                title: "دوراتي كمحاضر",
                icon: BookOpenCheck,
                path: "/teacher/courses",
              },
            ]
          : []),
        ...(canAccessInstructorArea
          ? [
              {
                title: "الأرباح والسحوبات",
                icon: BadgeDollarSign,
                path: "/teacher/earnings",
              },
              {
                title: "الاتفاقيات",
                icon: ScrollText,
                path: "/policies/instructor-agreement",
              },
            ]
          : []),
      ],
    },
    {
      label: "التواصل",
      items: isTeacher || canAccessInstructorArea ? [
        { title: "الرسائل", icon: MessageSquare, path: "/teacher/messages" },
        {
          title: "الإشعارات",
          icon: Bell,
          path: "/teacher/notifications",
        },
        ...(isTeacher ? [{ title: "الإعدادات", icon: Settings, path: "/teacher/settings" }] : []),
      ] : [],
    },
  ];

  const navigate = useNavigate();

  // Note: the initial open/closed state is decided once in the parent
  // (TeacherLayout) via a lazy useState initializer, based on screen
  // width at first render. That avoids a flash of the sidebar being
  // open-then-closing on mobile. From here on, isOpen is just controlled
  // by the toggle button below.

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const openAdminChat = () => {
    navigate("/teacher/messages", {
      state: { openSupportConversation: true },
    });
  };

  return (
    <aside
      className={`
        relative
        flex
        flex-col
        h-full
        justify-between
        bg-[#1F2937]
        border-l
        border-white/8
        shadow-[0px_0px_2px_0px_#00000040]
        text-white
        pb-6
        transition-all
        duration-300
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between px-6 border-b border-[#FFFFFF14]">
        {isOpen && (
          <Link to="/" aria-label="الذهاب إلى الصفحة الرئيسية">
            <img
              src={logo}
              alt="الأكاديمية"
              className="object-contain w-36 h-8"
            />
          </Link>
        )}

        {isTeacher && <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-16
            h-16
            -ml-5
            flex
            items-center
            justify-center
            rounded-full
            transition
          "
        >
          <img
            src={toggleIcon}
            alt="toggle"
            className="object-contain w-7 h-7"
          />
        </button>}
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 mt-4 overflow-y-auto">
        {menuSections.filter((section) => section.items.length).map((section) => (
          <div key={section.label} className="mb-3">
            {isOpen && (
              <p className="mb-1 px-3 text-[11px] font-semibold text-white/45">
                {section.label}
              </p>
            )}
            {!isOpen && <div className="mx-2 mb-2 border-t border-white/10" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isCourseListWhileCreating = item.path === "/teacher/courses" && location.pathname.startsWith("/teacher/courses/new");
              return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.endsWith("-dashboard")}
                className={({ isActive }) => `
              flex
              items-center
              ${isOpen ? "gap-2 px-3 justify-start" : "justify-center"}
              py-2
              mb-1
              rounded-xl
              transition-all
              font-['IBM_Plex_Sans_Arabic']
              font-medium
              text-[16px]
              ${
                isActive && !isCourseListWhileCreating
                  ? "bg-[#FFFFFF] text-primary border-r-4 border-[#12C6B0] shadow-sm"
                  : "text-white hover:bg-white/10"
              }
            `}
              >
                {({ isActive }) => (
                  <>
                    <span className="relative shrink-0">
                      <Icon
                        size={20}
                        aria-hidden="true"
                        className={isActive && !isCourseListWhileCreating ? "text-[#123C91]" : "text-white"}
                      />
                      {((item.path === "/teacher/messages" &&
                        unread.messages) ||
                        (item.path === "/teacher/notifications" &&
                          unread.notifications)) && (
                        <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-[#1F2937] bg-red-500" />
                      )}
                    </span>

                    {isOpen && <span>{item.title}</span>}
                  </>
                )}
              </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[#FFFFFF14]">
        <button
          type="button"
          onClick={openAdminChat}
          title="تواصل مع الإدارة"
          className={`mb-2 flex w-full items-center rounded-lg bg-[#123C91] px-3 py-2.5 font-['IBM_Plex_Sans_Arabic'] text-sm font-semibold text-white transition-colors hover:bg-[#1649A8] ${isOpen ? "gap-3 justify-start" : "justify-center"}`}
        >
          <img src={messagesIcon} alt="" className="h-5 w-5" />
          {isOpen && <span>تواصل مع الإدارة</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg bg-[#991B1B] px-3 py-2.5 font-['IBM_Plex_Sans_Arabic'] text-[16px] font-semibold leading-4 text-white transition-all hover:bg-[#7F1D1D] ${
            isOpen ? "gap-3 justify-start" : "justify-center"
          }`}
        >
          <img
            src={logoutIcon}
            alt="logout"
            className="h-5 w-5 brightness-0 invert"
          />

          {isOpen && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
