import { useState, useEffect, useRef } from "react";
import StudentSidebar from "./StudentSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";

const MOBILE_BREAKPOINT = 768;

const getInitialSidebarState = () => {
  if (typeof window === "undefined") return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
};

const StudentLayout = ({ children, breadcrumbLabels, breadcrumbCurrentLabel, marketplaceOnly = false, showBreadcrumbs = true }) => {

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
        <StudentSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          marketplaceOnly={marketplaceOnly}
        />
      </div>

      <main data-route-scroll className="flex-1 h-full overflow-y-auto p-3 md:p-6">
         {showBreadcrumbs && <Breadcrumbs
           homeTo={marketplaceOnly ? "/learner-dashboard" : "/student-dashboard"}
           dynamicLabels={breadcrumbLabels}
           currentPageLabel={breadcrumbCurrentLabel}
         />}
        <AccountStatusNotice />
        {children}
      </main>

    </div>
  );
};

export default StudentLayout;
