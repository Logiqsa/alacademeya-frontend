const ERROR_MESSAGES = {
  NOT_LOGGED_IN: "يرجى تسجيل الدخول مرة أخرى",
  ACTION_DENIED: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
  STUDENT_NOT_FOUND: "تعذر العثور على الطالب",
  SUBJECT_NOT_FOUND: "تعذر العثور على المادة",
  PACKAGE_NOT_FOUND: "تعذر العثور على الباقة",
  TEACHER_NOT_FOUND: "تعذر العثور على المعلم",
  TEACHER_DOES_NOT_SUPPORT_SUBJECT: "المعلم المحدد لا يدرّس هذه المادة",
  CLASSROOM_NOT_FOUND: "تعذر العثور على المجموعة",
  INVALID_CLASSROOM_TYPE: "نوع المجموعة لا يطابق نوع الاشتراك",
  INVALID_PRICE: "سعر الاشتراك غير صالح",
  INVALID_DISCOUNT: "قيمة الخصم غير صالحة",
  INVALID_FINAL_PRICE: "السعر النهائي غير صالح",
  INVALID_TOTAL_SESSIONS: "عدد الجلسات غير صالح",
  USERNAME_ALREADY_EXISTS: "اسم المستخدم مستخدم بالفعل",
  EMAIL_ALREADY_EXISTS: "البريد الإلكتروني مستخدم بالفعل",
  PHONE_ALREADY_EXISTS: "رقم الهاتف مستخدم بالفعل",
};

export const idOf = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";

export const nameOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name?.ar || value.name?.en || value.name || value.fullName || value.user?.fullName || "";
};

export const apiList = (response, keys = []) => {
  let value = response?.data ?? response;
  for (let depth = 0; depth < 5 && value && !Array.isArray(value); depth += 1) {
    const found = keys.map((key) => value?.[key]).find(Array.isArray);
    if (found) return found;
    value = value.data;
  }
  return Array.isArray(value) ? value : [];
};

export const adminApiErrorMessage = (error, fallback = "تعذر إتمام العملية") => {
  const body = error?.response?.data || {};
  const code = body.code || body.message;
  if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (body.errors && typeof body.errors === "object") {
    const first = Object.values(body.errors).flat().find(Boolean);
    if (first) return String(first);
  }
  return typeof body.message === "string" && !/^[A-Z0-9_]+$/.test(body.message)
    ? body.message
    : fallback;
};

export const buildManualSubscriptionPayload = (studentId, items) => ({
  student: studentId,
  items: items.map(({ subject, package: packageId, teacher, classroom, type, discount }) => ({
    subject,
    package: packageId,
    teacher,
    classroom,
    type,
    discount: Number(discount) || 0,
  })),
});

export const buildRenewalPayload = (items, confirmed = false) => ({
  items: items.map(({ subject, package: packageId, teacher, classroom, type, discount }) => ({
    subject,
    package: packageId,
    teacher,
    classroom,
    type,
    discount: Number(discount) || 0,
  })),
  ...(confirmed ? { confirmReplaceActive: true } : {}),
});
