export const NOTIFICATION_RECEIVED_EVENT = "alacademeya:notification-received";

export const NOTIFICATION_TYPES = Object.freeze([
  "COURSE_PURCHASE_SUCCESS",
  "NEW_COURSE_SALE",
  "COURSE_ACCESS_GRANT_FAILED",
  "WITHDRAWAL_REQUEST_CREATED",
  "NEW_WITHDRAWAL_REQUEST",
  "WITHDRAWAL_APPROVED",
  "WITHDRAWAL_REJECTED",
  "WITHDRAWAL_PAID",
  "CERTIFICATE_ISSUED",
  "QUIZ_PASSED",
  "QUIZ_ATTEMPTS_EXHAUSTED",
  "COURSE_COMPLETED",
  "NEW_COURSE_REVIEW",
  "COURSE_APPROVED",
  "COURSE_REJECTED",
]);

const TYPE_META = {
  COURSE_PURCHASE_SUCCESS: { ar: "تم شراء الدورة بنجاح", en: "Course purchase successful", category: "academic", kind: "course" },
  NEW_COURSE_SALE: { ar: "عملية بيع جديدة لدورة", en: "New course sale", category: "system", kind: "sale" },
  COURSE_ACCESS_GRANT_FAILED: { ar: "تعذر منح الوصول إلى الدورة", en: "Course access grant failed", category: "system", kind: "warning" },
  WITHDRAWAL_REQUEST_CREATED: { ar: "تم إنشاء طلب السحب", en: "Withdrawal request created", category: "system", kind: "withdrawal" },
  NEW_WITHDRAWAL_REQUEST: { ar: "طلب سحب جديد", en: "New withdrawal request", category: "system", kind: "withdrawal" },
  WITHDRAWAL_APPROVED: { ar: "تمت الموافقة على طلب السحب", en: "Withdrawal approved", category: "system", kind: "withdrawal" },
  WITHDRAWAL_REJECTED: { ar: "تم رفض طلب السحب", en: "Withdrawal rejected", category: "system", kind: "withdrawal" },
  WITHDRAWAL_PAID: { ar: "تم دفع طلب السحب", en: "Withdrawal paid", category: "system", kind: "withdrawal" },
  CERTIFICATE_ISSUED: { ar: "تم إصدار الشهادة", en: "Certificate issued", category: "academic", kind: "certificate" },
  QUIZ_PASSED: { ar: "تم اجتياز الاختبار", en: "Quiz passed", category: "academic", kind: "quiz" },
  QUIZ_ATTEMPTS_EXHAUSTED: { ar: "تم استنفاد محاولات الاختبار", en: "Quiz attempts exhausted", category: "academic", kind: "quiz" },
  COURSE_COMPLETED: { ar: "تم إكمال الدورة", en: "Course completed", category: "academic", kind: "course" },
  NEW_COURSE_REVIEW: { ar: "تقييم جديد للدورة", en: "New course review", category: "academic", kind: "review" },
  COURSE_APPROVED: { ar: "تمت الموافقة على الدورة", en: "Course approved", category: "academic", kind: "course" },
  COURSE_REJECTED: { ar: "تحتاج الدورة إلى تعديلات", en: "Course changes required", category: "academic", kind: "course" },
};

const normalizeType = (value) =>
  String(value || "").trim().toUpperCase().replaceAll("-", "_");

export const notificationTypeOf = (notification = {}) => {
  const candidates = [notification.type, notification.key, notification.eventType, notification.event]
    .map(normalizeType)
    .filter(Boolean);
  return candidates.find((candidate) => NOTIFICATION_TYPES.includes(candidate)) || candidates[0] || "";
};

export const localizedNotificationText = (value, locale = "ar") => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[locale] || value[locale === "ar" ? "en" : "ar"] || value.text || value.message || "";
};

export const getNotificationTypeLabel = (type, locale = "ar") => {
  const normalized = notificationTypeOf({ type });
  const meta = TYPE_META[normalized];
  return meta?.[locale] || meta?.ar || (locale === "en" ? "New notification" : "إشعار جديد");
};

export const getNotificationPresentation = (notification = {}, locale = "ar") => {
  const type = notificationTypeOf(notification);
  const meta = TYPE_META[type];
  const title = localizedNotificationText(notification.title, locale) || getNotificationTypeLabel(type, locale);
  const description = [
    notification.body,
    notification.description,
    notification.message,
    notification.content,
    notification.data?.body,
    notification.data?.description,
    notification.data?.message,
  ].map((value) => localizedNotificationText(value, locale)).find(Boolean);

  return {
    type,
    title,
    description: description || (locale === "en" ? "Open the notification for available details." : "افتح الإشعار لعرض التفاصيل المتاحة."),
    category: meta?.category || "system",
    kind: meta?.kind || "unknown",
  };
};

export const isNotificationRead = (notification = {}) =>
  Boolean(notification.isRead ?? notification.read ?? notification.status === "read");

export const extractNotificationList = (payload) => {
  let value = payload;
  for (let depth = 0; depth < 4 && value && !Array.isArray(value); depth += 1) {
    for (const key of ["notifications", "items", "results", "docs"]) {
      if (Array.isArray(value[key])) return value[key];
    }
    value = value.data;
  }
  return Array.isArray(value) ? value : [];
};
