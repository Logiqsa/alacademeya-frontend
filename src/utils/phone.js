export const buildInternationalPhone = (phoneCode, phone) => {
  const localPhone = String(phone || "").trim().replace(/[^\d+]/g, "");

  if (!localPhone) return "";
  if (localPhone.startsWith("+")) return localPhone;

  const normalizedCode = String(phoneCode || "").trim();
  if (!normalizedCode) return localPhone;

  // الصفر الأول خاص بالاتصال المحلي ولا يُرسل بعد إضافة كود الدولة.
  return `${normalizedCode}${localPhone.replace(/^0+/, "")}`;
};
