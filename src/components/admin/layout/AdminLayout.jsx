import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import LayoutSidebarContext from "../../../context/LayoutSidebarContext";
import usePersistedSidebarOpen from "../../../hooks/usePersistedSidebarOpen";

const AdminLayout = ({ children }) => {
  const [isOpen, setIsOpen] = usePersistedSidebarOpen("admin");

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <LayoutSidebarContext.Provider value={isOpen}>
    <div className="flex h-dvh min-h-0 w-full overflow-hidden bg-[#F5F7FB]">
      <div className="h-full min-h-0 shrink-0 overflow-hidden">
        <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      <main data-route-scroll className="admin-main-scroll h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6">
        {children}
      </main>
    </div>
    </LayoutSidebarContext.Provider>
  );
};

export default AdminLayout;
