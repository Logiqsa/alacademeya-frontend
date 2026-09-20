import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeo } from "./seoCore";
import { routeSeoFor } from "./seoRoutes";

export default function RouteSeo() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    applySeo(routeSeoFor(pathname));
  }, [pathname]);

  return null;
}
