import { useEffect } from "react";
import { applySeo } from "./seoCore";

export default function Seo({ title, description, path, image, type, noindex, lang, structuredData }) {
  useEffect(() => {
    applySeo({ title, description, path, image, type, noindex, lang, structuredData });
  }, [title, description, path, image, type, noindex, lang, structuredData]);
  return null;
}
