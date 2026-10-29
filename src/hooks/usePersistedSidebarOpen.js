import { useEffect, useRef, useState } from "react";

const MOBILE_BREAKPOINT = 768;

const initialValue = (storageKey) => {
  if (typeof window === "undefined") return true;
  const saved = window.sessionStorage.getItem(storageKey);
  if (saved !== null) return saved === "true";
  return window.innerWidth >= MOBILE_BREAKPOINT;
};

export default function usePersistedSidebarOpen(scope) {
  const storageKey = `alacademeya:sidebar-open:${scope}`;
  const [isOpen, setIsOpen] = useState(() => initialValue(storageKey));
  const wasAboveBreakpoint = useRef(
    typeof window === "undefined" || window.innerWidth >= MOBILE_BREAKPOINT,
  );

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

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, String(isOpen));
  }, [isOpen, storageKey]);

  return [isOpen, setIsOpen];
}
