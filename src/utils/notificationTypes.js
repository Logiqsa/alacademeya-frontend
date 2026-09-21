export const NOTIFICATION_RECEIVED_EVENT = "alacademeya:notification-received";

export const NOTIFICATION_TYPES = Object.freeze([
  "COURSE_PURCHASE_SUCCESS",
  "COURSE_PURCHASE_SUCCEEDED",
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
  "COURSE_SUBMITTED_FOR_REVIEW",
]);

const TYPE_META = {
  COURSE_PURCHASE_SUCCESS: { ar: "تم شراء الدورة بنجاح", en: "Course purchase successful", category: "academic", kind: "course" },
  COURSE_PURCHASE_SUCCEEDED: { ar: "عملية شراء دورة جديدة", en: "New course purchase", category: "system", kind: "sale" },
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
  COURSE_SUBMITTED_FOR_REVIEW: { ar: "طلب مراجعة دورة جديد", en: "New course review request", category: "system", kind: "course" },
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

const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z/g;

const humanizeNotificationDates = (text, locale = "ar") => {
  if (!text) return text;
  const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return text.replace(ISO_DATE_PATTERN, (value) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : formatter.format(parsed);
  });
};

const notificationValue = (value, locale = "ar") => {
  if (value == null || value === "") return "";
  if (typeof value === "object") return localizedNotificationText(value, locale);
  return String(value);
};

const describeNotificationData = (type, data = {}, locale = "ar") => {
  const course = notificationValue(data.courseTitle, locale);
  const quiz = notificationValue(data.quizTitle, locale);
  const currency = notificationValue(data.currency, locale);
  const amount = data.amount == null ? "" : `${Number(data.amount).toLocaleString(locale === "ar" ? "ar-EG" : "en")} ${currency}`.trim();
  const reason = notificationValue(data.rejectionReason || data.failureReason, locale);
  const ar = locale === "ar";
  if (!ar) {
    const details = [course && `Course: ${course}`, quiz && `Quiz: ${quiz}`, amount && `Amount: ${amount}`, reason && `Reason: ${reason}`].filter(Boolean);
    return details.length ? `${details.join(". ")}.` : "Open the notification to view its details.";
  }

  const descriptions = {
    COURSE_PURCHASE_SUCCESS: course ? `أصبح بإمكانك الآن بدء دورة «${course}».` : "تم تأكيد الدفع وإتاحة الدورة في مكتبتك.",
    COURSE_PURCHASE_SUCCEEDED: course ? `تم شراء دورة «${course}»${amount ? ` بقيمة ${amount}` : ""}.` : amount ? `تم تسجيل شراء جديد بقيمة ${amount}.` : "تم تسجيل عملية شراء دورة جديدة.",
    NEW_COURSE_SALE: course ? `تم بيع دورة «${course}»${amount ? ` بقيمة ${amount}` : ""}.` : "تم تسجيل عملية بيع جديدة لإحدى دوراتك.",
    COURSE_ACCESS_GRANT_FAILED: reason ? `لم يكتمل منح الوصول إلى الدورة: ${reason}` : "تم الدفع، لكن تعذر منح المتعلم صلاحية دخول الدورة.",
    WITHDRAWAL_REQUEST_CREATED: currency ? `تم استلام طلب سحب رصيدك بعملة ${currency} وهو قيد المراجعة.` : "تم استلام طلب السحب وهو قيد المراجعة.",
    NEW_WITHDRAWAL_REQUEST: currency ? `يوجد طلب سحب جديد بعملة ${currency} يحتاج إلى المراجعة.` : "يوجد طلب سحب جديد يحتاج إلى المراجعة.",
    WITHDRAWAL_APPROVED: data.expectedTransferAt ? `تم قبول الطلب، والتحويل المتوقع في ${notificationValue(data.expectedTransferAt, locale)}.` : "تم قبول طلب السحب وسيتم تحويل الرصيد.",
    WITHDRAWAL_REJECTED: reason ? `سبب الرفض: ${reason}` : "تم رفض طلب السحب. افتح الإشعار لمراجعة التفاصيل.",
    WITHDRAWAL_PAID: currency ? `تم تحويل رصيد طلب السحب بعملة ${currency}.` : "تم تحويل قيمة طلب السحب بنجاح.",
    CERTIFICATE_ISSUED: course ? `شهادتك في دورة «${course}» أصبحت جاهزة.` : "شهادة إتمام الدورة أصبحت جاهزة للعرض والتنزيل.",
    QUIZ_PASSED: quiz ? `نجحت في اختبار «${quiz}».` : "تم تسجيل اجتيازك للاختبار بنجاح.",
    QUIZ_ATTEMPTS_EXHAUSTED: quiz ? `استخدمت كل المحاولات المتاحة لاختبار «${quiz}».` : "استخدمت كل المحاولات المتاحة لهذا الاختبار.",
    COURSE_COMPLETED: course ? `أكملت جميع متطلبات دورة «${course}».` : "أكملت جميع متطلبات الدورة.",
    NEW_COURSE_REVIEW: course ? `أضاف متعلم تقييمًا جديدًا لدورة «${course}».` : "أضاف متعلم تقييمًا جديدًا لإحدى دوراتك.",
    COURSE_APPROVED: course ? `وافقت الإدارة على دورة «${course}» وأصبحت منشورة.` : "وافقت الإدارة على الدورة وأصبحت منشورة.",
    COURSE_REJECTED: course ? `تحتاج دورة «${course}» إلى تعديلات${reason ? `: ${reason}` : "."}` : reason ? `سبب طلب التعديل: ${reason}` : "تحتاج الدورة إلى تعديلات قبل إعادة إرسالها.",
    COURSE_SUBMITTED_FOR_REVIEW: course ? `أرسل المحاضر دورة «${course}» للمراجعة${data.submissionNumber ? ` — الجولة ${data.submissionNumber}` : ""}.` : "أرسل محاضر دورة جديدة لمراجعتها.",
  };
  if (descriptions[type]) return descriptions[type];
  return course ? `يتعلق هذا الإشعار بدورة «${course}».` : quiz ? `يتعلق هذا الإشعار باختبار «${quiz}».` : "اضغط على الإشعار لعرض التفاصيل.";
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
    description: humanizeNotificationDates(description, locale) || humanizeNotificationDates(describeNotificationData(type, notification.data, locale), locale),
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
