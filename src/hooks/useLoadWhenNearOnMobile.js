import { useEffect, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

export default function useLoadWhenNearOnMobile() {
  const sectionRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(() =>
    typeof window === "undefined" ||
    !window.IntersectionObserver ||
    !window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    if (shouldLoad) return;

    const media = window.matchMedia(MOBILE_QUERY);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "600px 0px" },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);

    let active = true;
    const loadOnDesktop = () => {
      if (active && !media.matches) setShouldLoad(true);
    };
    media.addEventListener("change", loadOnDesktop);
    queueMicrotask(loadOnDesktop);

    return () => {
      active = false;
      observer.disconnect();
      media.removeEventListener("change", loadOnDesktop);
    };
  }, [shouldLoad]);

  return [sectionRef, shouldLoad];
}
