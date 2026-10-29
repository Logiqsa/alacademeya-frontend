import { useContext } from "react";
import TeacherSidebar from "./TeacherSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";
import { AuthContext } from "../../../context/AuthContext";
import { getDashboardPathByRole } from "../../../utils/roles";
import LayoutSidebarContext from "../../../context/LayoutSidebarContext";
import usePersistedSidebarOpen from "../../../hooks/usePersistedSidebarOpen";

const TeacherLayout = ({ children, breadcrumbLabels, breadcrumbCurrentLabel, showBreadcrumbs = true }) => {
  const { user } = useContext(AuthContext);

  const [isOpen, setIsOpen] = usePersistedSidebarOpen("teacher");

  return (
    <LayoutSidebarContext.Provider value={isOpen}>
    <div className="h-screen flex bg-[#F5F7FB] overflow-hidden">
     
      <div className="h-full shrink-0">
        <TeacherSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
      <main data-route-scroll className="h-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6">
         {showBreadcrumbs && <Breadcrumbs
           homeTo={getDashboardPathByRole(user, "/teacher-dashboard")}
           dynamicLabels={breadcrumbLabels}
           currentPageLabel={breadcrumbCurrentLabel}
         />}

        <AccountStatusNotice />

        {children}
      </main>

    </div>
    </LayoutSidebarContext.Provider>
  );
};

export default TeacherLayout;
