export default function CourseReviewActions({ user, access, myReview, loading, onAdd, onEdit, onDelete, deleting }) {
  if (!user) return <p className="rounded-xl bg-[#F7F9FC] p-4 text-sm text-[#667085]">سجّل الدخول لإضافة تقييم. يمكنك قراءة جميع التقييمات بدون تسجيل الدخول.</p>;
  if (["admin", "super-admin"].includes(user.role)) return null;
  if (loading) return <p className="rounded-xl bg-[#F7F9FC] p-4 text-sm text-[#667085]">جاري التحقق من حالة تقييمك...</p>;
  const reason = access?.reason || "none";
  if (reason === "instructor") return <p className="rounded-xl bg-[#F7F9FC] p-4 text-sm text-[#667085]">لا يمكن لمالك الدورة تقييم دورته.</p>;
  if (reason === "revoked") return myReview ? <div className="rounded-xl border border-red-100 bg-red-50 p-4"><p className="text-sm text-red-700">تم سحب الوصول إلى الدورة. يمكنك حذف تقييمك الحالي، لكن لا يمكنك تعديله.</p><button type="button" disabled={deleting} onClick={onDelete} className="mt-3 rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">{deleting ? "جاري الحذف..." : "حذف تقييمي"}</button></div> : null;
  if (reason !== "enrollment") return null;
  return <div className="flex flex-col gap-3 rounded-xl border border-[#D7E2F3] bg-[#F4F7FF] p-4 sm:flex-row sm:items-center sm:justify-between"><div><strong className="text-[#1F2937]">{myReview ? "تقييمك للدورة" : "شارك تجربتك"}</strong><p className="mt-1 text-sm text-[#667085]">{myReview ? "يمكنك تعديل تقييمك أو حذفه." : "يمكنك إضافة تقييم بعد بدء درس واحد على الأقل."}</p></div><div className="flex gap-2"><button type="button" onClick={myReview ? onEdit : onAdd} className="rounded-lg bg-[#123C91] px-4 py-2 text-sm font-bold text-white">{myReview ? "تعديل" : "إضافة تقييم"}</button>{myReview && <button type="button" disabled={deleting} onClick={onDelete} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-700 disabled:opacity-50">{deleting ? "جاري الحذف..." : "حذف"}</button>}</div></div>;
}
