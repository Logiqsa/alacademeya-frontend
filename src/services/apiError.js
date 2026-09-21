export const AUTH_EXPIRED_EVENT = "alacademeya:auth-expired";

const fallbackMessage = "حدث خطأ غير متوقع";

export const normalizeApiError = (error) => {
  if (error?.apiError) return error.apiError;

  const response = error?.response;
  const body = response?.data && typeof response.data === "object"
    ? response.data
    : {};

  return Object.freeze({
    code: typeof body.code === "string" && body.code
      ? body.code
      : "UNKNOWN_ERROR",
    message: typeof body.message === "string" && body.message
      ? body.message
      : error?.message || fallbackMessage,
    field: typeof body.field === "string" ? body.field : undefined,
    errors: body.errors && typeof body.errors === "object"
      ? body.errors
      : undefined,
    status: Number.isInteger(response?.status) ? response.status : 0,
  });
};

export const getApiErrorCode = (error) => normalizeApiError(error).code;

export const hasApiErrorCode = (error, ...codes) =>
  codes.includes(getApiErrorCode(error));

export const getApiErrorMessage = (error, fallback = fallbackMessage) => {
  const normalized = normalizeApiError(error);
  if (normalized.code === "ATTACHMENT_VIEW_ONLY_FORMAT_UNSUPPORTED") {
    return "لا يمكن عرض صيغة هذا المرفق داخل المتصفح. غيّر إعداد المرفق إلى «قابل للتنزيل» أو استخدم PDF أو صورة للعرض فقط.";
  }
  const message = normalized.message;
  return message === fallbackMessage ? fallback : message;
};
