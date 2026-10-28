import { approveRegistration } from "../services/APIService";

// المسار الوحيد لقبول طلبات التسجيل؛ تستخدمه الجداول وكل الـ popups حتى
// ينفذ الباك نفس hooks والإيميل بغض النظر عن مكان ضغط الأدمن.
export const approveRegistrationRequest = async ({ userId }) => {
  if (!userId) throw new Error("معرّف المستخدم غير موجود");
  return approveRegistration(userId);
};
