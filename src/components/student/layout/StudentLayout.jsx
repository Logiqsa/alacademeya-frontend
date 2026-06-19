import { useState } from "react";
import StudentSidebar from "./StudentSidebar";


const StudentLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen flex bg-[#F5F7FB] overflow-hidden">
      <div className="h-full shrink-0">
        <StudentSidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>

      <main className="flex-1 h-full overflow-y-auto p-6">
        {children}
      </main>
      
    </div>
  );
};

export default StudentLayout;