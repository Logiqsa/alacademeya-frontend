import { useContext, useEffect, useRef, useState } from "react";
import TeacherSidebar from "./TeacherSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";
import { AuthContext } from "../../../context/AuthContext";
import { getDashboardPathByRole } from "../../../utils/roles";

const MOBILE_BREAKPOINT = 768;

const getInitialSidebarState = () => {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
};

const TeacherLayout = ({ children, breadcrumbLabels, breadcrumbCurrentLabel }) => {
  const { user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(getInitialSidebarState);


  const wasAboveBreakpoint = useRef(getInitialSidebarState());

  useEffect(() => {
    const handleResize = () => {
      const isAboveBreakpoint = window.innerWidth >= MOBILE_BREAKPOINT;
      if (isAboveBreakpoint !== wasAboveBreakpoint.current) {
        wasAboveBreakpoint.current = isAboveBreakpoint;
        setIsOpen(isAboveBreakpoint);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen flex bg-[#F5F7FB] overflow-hidden">
     
      <div className="h-full shrink-0">
        <TeacherSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
      <main data-route-scroll className="flex-1 h-full overflow-y-auto p-3 md:p-6">
         <Breadcrumbs
           homeTo={getDashboardPathByRole(user, "/teacher-dashboard")}
           dynamicLabels={breadcrumbLabels}
           currentPageLabel={breadcrumbCurrentLabel}
         />

        <AccountStatusNotice />

        {children}
      </main>

    </div>
  );
};

export default TeacherLayout;
