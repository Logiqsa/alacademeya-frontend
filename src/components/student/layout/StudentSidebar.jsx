import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

import logo from "../../../assets/icons/loogo.svg";
import toggleIcon from "../../../assets/icons/sidebar-toggle.png";

import dashboardIcon from "../../../assets/icons/dashboard.png";
import assignmentsIcon from "../../../assets/icons/children.png";
import examsIcon from "../../../assets/icons/schedule.png";
import messagesIcon from "../../../assets/icons/messages.png";
import notificationsIcon from "../../../assets/icons/notifications.png";
import settingsIcon from "../../../assets/icons/settings.png";
import logoutIcon from "../../../assets/icons/logout.png";

const StudentSidebar = ({ isOpen, setIsOpen }) => {
  const menu = [
    {
      title: "لوحة التحكم",
      icon: dashboardIcon,
      path: "/student-dashboard",
    },
    {
      title: "الواجبات",
      icon: assignmentsIcon,
      path: "/student/assignments",
    },
    {
      title: "الاختبارات",
      icon: examsIcon,
      path: "/student/exams",
    },
    {
      title: "الرسائل",
      icon: messagesIcon,
      path: "/student/messages",
    },
    {
      title: "الإشعارات",
      icon: notificationsIcon,
      path: "/student/notifications",
    },
    {
      title: "الإعدادات",
      icon: settingsIcon,
      path: "/student/settings",
    },
  ];

  const { logout } = useContext(AuthContext);
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
        {isOpen && <img src={logo} alt="logo" className="object-contain w-36 h-8" />}

        <button
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
          <img src={toggleIcon} alt="toggle" className="object-contain w-7 h-7" />
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 mt-4 overflow-y-auto">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `
              flex
              items-center
              ${isOpen ? "gap-2 px-3 justify-start" : "justify-center"}
              py-2
              mb-1
              rounded-lg
              transition-all
              font-['IBM_Plex_Sans_Arabic']
              font-medium
              text-[16px]
              ${isActive
                ? "bg-[#FFFFFF] text-primary border-r-4 border-[#12C6B0] shadow-sm"
                : "text-white hover:bg-white/10"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <img
                  src={item.icon}
                  alt={item.title}
                  className={`w-5 h-5 shrink-0 transition-all duration-200 ${
                    isActive ? "brightness-0 invert-20 sepia-90 saturate-5000 hue-rotate-200" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          filter:
                            "brightness(0) saturate(100%) invert(14%) sepia(87%) saturate(2768%) hue-rotate(218deg) brightness(93%) contrast(97%)",
                        }
                      : {}
                  }
                />

                {isOpen && <span>{item.title}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[#FFFFFF14]">
        <button
          onClick={handleLogout}
          className={`flex items-center mx-3 py-2 rounded-lg transition-all font-['IBM_Plex_Sans_Arabic'] font-medium text-[16px] leading-4 ${
            isOpen ? "gap-3 justify-start" : "justify-center"
          }`}
        >
          <img src={logoutIcon} alt="logout" className="w-5 h-5" />

          {isOpen && <span className="text-sm">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;