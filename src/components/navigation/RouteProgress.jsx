import { useEffect, useRef, useState } from "react";

const PROGRESS_DURATION = 550;

export default function RouteProgress() {
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const start = () => {
      window.clearTimeout(timerRef.current);
      setActive(true);
      timerRef.current = window.setTimeout(
        () => setActive(false),
        PROGRESS_DURATION,
      );
    };
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(...args) {
      start();
      return originalPushState.apply(this, args);
    };
    window.history.replaceState = function replaceState(...args) {
      start();
      return originalReplaceState.apply(this, args);
    };
    window.addEventListener("popstate", start);

    return () => {
      window.clearTimeout(timerRef.current);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", start);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="route-progress fixed inset-x-0 top-0 z-[200] h-1 overflow-hidden bg-[#123C91]/10"
      role="status"
      aria-label="جاري تحميل الصفحة"
    >
      <span className="route-progress-bar block h-full bg-[#123C91]" />
    </div>
  );
}
