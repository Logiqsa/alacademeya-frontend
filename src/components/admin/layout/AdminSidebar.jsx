import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  CalendarClock,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Tags,
  Video,
  MessageSquare,
  CreditCard,
  WalletCards,
  Banknote,
  PiggyBank,
  Bell,
  Newspaper,
  Settings,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { useSidebarUnread } from "../../../api/useSidebarUnread";

import logo from "../../../assets/icons/loogo.svg";
import toggleIcon from "../../../assets/icons/sidebar-toggle.png";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const unread = useSidebarUnread();
  const menuSections = [
    {
      label: "رئيسي",
      items: [
        {
          title: "لوحة التحكم",
          icon: LayoutDashboard,
          path: "/admin-dashboard",
        },
      ],
    },
    {
      label: "المستخدمون",
      items: [
        { title: "المشرفين", icon: ShieldCheck, path: "/admin/supervisors" },
        { title: "المعلمون", icon: GraduationCap, path: "/admin/teachers" },
        { title: "المستخدمون", icon: Users, path: "/admin/users" },
      ],
    },
    {
      label: "التعليم",
      items: [
        { title: "المجموعات", icon: UsersRound, path: "/admin/groups" },
        { title: "جدول الحصص", icon: CalendarClock, path: "/admin/schedule" },
        { title: "التسجيلات", icon: Video, path: "/admin/records" },
      ],
    },
    {
      label: "الدورات",
      items: [
        { title: "الدورات", icon: BookOpen, path: "/admin/courses" },
        { title: "التصنيفات", icon: Tags, path: "/admin/course-categories" },
        { title: "السياسات القانونية", icon: ShieldCheck, path: "/admin/course-policies" },
        {
          title: "مالية الدورات",
          icon: PiggyBank,
          path: "/admin/course-finances",
        },
        { title: "طلبات السحب", icon: WalletCards, path: "/admin/course-finances/withdrawals" },
      ],
    },
    {
      label: "المالية",
      items: [
        { title: "الاشتراكات", icon: CreditCard, path: "/admin/subscription" },
        { title: "المدفوعات", icon: WalletCards, path: "/admin/payments" },
        {
          title: "رواتب المعلمين",
          icon: Banknote,
          path: "/admin/teacher-salaries",
        },
      ],
    },
    {
      label: "التواصل والنظام",
      items: [
        { title: "الرسائل", icon: MessageSquare, path: "/admin/messages" },
        { title: "الإشعارات", icon: Bell, path: "/admin/notifications" },
        { title: "المدونة", icon: Newspaper, path: "/admin/blogs" },
        { title: "الإعدادات", icon: Settings, path: "/admin/settings" },
      ],
    },
  ];

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  return (
    <aside
      className={`
        relative
        flex
        flex-col
        h-full
        bg-[#1F2937]
        border-l
        border-white/8
        shadow-[0px_0px_2px_0px_#00000040]
        text-white
        pb-2
        overflow-hidden
        transition-all
        duration-300
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      {/* Header */}
      <div className="relative flex shrink-0 items-center justify-between px-5 border-b border-[#FFFFFF14]">
        {isOpen && (
          <Link to="/" aria-label="الذهاب إلى الصفحة الرئيسية">
            <img
              src={logo}
              alt="الأكاديمية"
              className="object-contain w-36 h-8"
            />
          </Link>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            w-14
            h-14
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
        </button>
      </div>

      {/* Menu */}
      <div className="admin-sidebar-scroll mt-2 min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2">
        {menuSections.map((section) => (
          <div key={section.label} className="mb-2">
            {isOpen && (
              <p className="mb-1 px-3 pt-1 text-[10px] font-semibold text-white/45">
                {section.label}
              </p>
            )}
            {!isOpen && <div className="mx-2 mb-2 border-t border-white/10" />}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path.endsWith("-dashboard")}
                  className={({ isActive }) => `
                flex
                items-center
                ${isOpen ? "gap-2 px-3 justify-start" : "justify-center"}
                py-1.5
                mb-1
                rounded-lg
                transition-all
                font-['IBM_Plex_Sans_Arabic']
                font-medium
                text-[15px]
                ${
                  isActive
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
                          className={isActive ? "text-[#123C91]" : "text-white"}
                        />
                        {((item.path === "/admin/messages" &&
                          unread.messages) ||
                          (item.path === "/admin/notifications" &&
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
      <div className="shrink-0 px-2 pt-2 border-t border-[#FFFFFF14]">
        <button
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg bg-[#991B1B] px-3 py-2.5 font-['IBM_Plex_Sans_Arabic'] text-[15px] font-semibold leading-4 text-white transition-all hover:bg-[#7F1D1D] ${
            isOpen ? "gap-3 justify-start" : "justify-center"
          }`}
        >
          <LogOut size={20} />

          {isOpen && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
