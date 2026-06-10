import { useState } from "react";
import ParentSidebar from "./ParentSidebar";

const ParentLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#F5F7FB]">
      <ParentSidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default ParentLayout;