import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTopOnNavigate() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
    document.querySelectorAll('[data-route-scroll]').forEach((container) => {
      container.scrollTop = 0;
    });
  }, [pathname, search, hash]);

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  return null;
}
