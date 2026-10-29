import { useCallback, useLayoutEffect, useRef } from "react";

export default function usePersistentSidebarScroll(scope) {
  const scrollRef = useRef(null);
  const storageKey = `alacademeya:sidebar-scroll:${scope}`;

  const savePosition = useCallback(() => {
    const position = scrollRef.current?.scrollTop;
    if (typeof position === "number") {
      window.sessionStorage.setItem(storageKey, String(position));
    }
  }, [storageKey]);

  useLayoutEffect(() => {
    const savedPosition = Number(window.sessionStorage.getItem(storageKey));
    if (Number.isFinite(savedPosition) && savedPosition > 0) {
      scrollRef.current.scrollTop = savedPosition;
    }

    return savePosition;
  }, [savePosition, storageKey]);

  return { scrollRef, savePosition };
}
