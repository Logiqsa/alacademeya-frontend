import { useState, useEffect, useRef } from "react";
import ParentSidebar from "./ParentSidebar";

// Breakpoint matching Tailwind's `md` (768px). Below this, the sidebar
// should start closed; at or above it, it should start open.
const MOBILE_BREAKPOINT = 768;

const getInitialSidebarState = () => {
  // Guard for SSR/non-browser environments where `window` isn't defined.
  if (typeof window === "undefined") return true;
  return window.innerWidth >= MOBILE_BREAKPOINT;
};

const ParentLayout = ({ children }) => {
  // Lazy initializer runs once, synchronously, before the first paint —
  // so the sidebar renders correctly-sized from frame one, no open-then-
  // close flash on mobile.
  const [isOpen, setIsOpen] = useState(getInitialSidebarState);

  // Tracks which side of the breakpoint we were on last, so the resize
  // handler only forces isOpen when we actually CROSS the breakpoint —
  // not on every resize pixel. This means a manual toggle by the user
  // while staying on the same side (e.g. resizing a bit on desktop)
  // won't get overridden.
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
        <ParentSidebar
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

export default ParentLayout;