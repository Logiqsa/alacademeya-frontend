import ParentSidebar from "./ParentSidebar";
import Breadcrumbs from "../../../pages/shared/Breadcrumbs";
import { AccountStatusNotice } from "../../account-settings/AccountRegistrationStatus";
import LayoutSidebarContext from "../../../context/LayoutSidebarContext";
import usePersistedSidebarOpen from "../../../hooks/usePersistedSidebarOpen";

const ParentLayout = ({ children }) => {
  const [isOpen, setIsOpen] = usePersistedSidebarOpen("parent");

  return (
    <LayoutSidebarContext.Provider value={isOpen}>
    <div className="flex h-dvh min-w-0 bg-[#F5F7FB] overflow-hidden">
      <div className="h-full shrink-0">
        <ParentSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>

      <main data-route-scroll className="h-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
         <Breadcrumbs homeTo="/parent-dashboard" />
        <AccountStatusNotice />
        {children}
      </main>

    </div>
    </LayoutSidebarContext.Provider>
  );
};

export default ParentLayout;
