import StudentSidebar from "./StudentSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";
import LayoutSidebarContext from "../../../context/LayoutSidebarContext";
import usePersistedSidebarOpen from "../../../hooks/usePersistedSidebarOpen";

const StudentLayout = ({ children, breadcrumbLabels, breadcrumbCurrentLabel, marketplaceOnly = false, showBreadcrumbs = true }) => {

  const [isOpen, setIsOpen] = usePersistedSidebarOpen("student");

  return (
    <LayoutSidebarContext.Provider value={isOpen}>
    <div className="h-screen flex bg-[#F5F7FB] overflow-hidden">
      <div className="h-full shrink-0">
        <StudentSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          marketplaceOnly={marketplaceOnly}
        />
      </div>

      <main data-route-scroll className="min-w-0 flex-1 h-full overflow-x-hidden overflow-y-auto p-3 md:p-6">
         {showBreadcrumbs && <Breadcrumbs
           homeTo={marketplaceOnly ? "/learner-dashboard" : "/student-dashboard"}
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

export default StudentLayout;
