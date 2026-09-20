import { DEFAULT_DESCRIPTION } from "./seoCore.js";

const STATIC_INDEXABLE = {
  "/": { description: "منصة واحدة لإدارة تعليمية متكاملة تشمل الدورات والحصص والاختبارات والتواصل الآمن." },
  "/courses": { title: "الدورات التعليمية", description: "استكشف الدورات التعليمية المنشورة واختر الدورة المناسبة لرحلتك التعليمية." },
  "/blogs": { title: "المدونة", description: "مقالات ونصائح تعليمية من خبراء الأكاديمية." },
  "/policies/instructor-agreement": { title: "اتفاقية المحاضر" },
  "/policies/course-publishing": { title: "سياسة نشر الدورات" },
  "/policies/revenue-share": { title: "اتفاقية مشاركة الإيرادات" },
  "/policies/course-terms": { title: "شروط شراء والالتحاق بالدورات" },
};

export const STATIC_INDEXABLE_PATHS = Object.freeze(Object.keys(STATIC_INDEXABLE));

const isDynamicIndexable = (path) =>
  /^\/courses\/[^/]+$/.test(path) ||
  /^\/blog\/[^/]+$/.test(path) ||
  /^\/instructors\/[^/]+$/.test(path);

export const routeSeoFor = (pathname) => {
  const normalizedPath = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  const staticMetadata = STATIC_INDEXABLE[normalizedPath];
  const indexable = Boolean(staticMetadata) || isDynamicIndexable(normalizedPath);
  return {
    ...staticMetadata,
    description: staticMetadata?.description || DEFAULT_DESCRIPTION,
    path: normalizedPath,
    noindex: !indexable,
    title: staticMetadata?.title || (indexable ? undefined : "لوحة التحكم"),
    lang: normalizedPath.startsWith("/certificates/verify") ? "en" : "ar",
  };
};
