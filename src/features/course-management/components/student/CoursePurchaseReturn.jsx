import { useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle, Clock, LoaderCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getCourseAccess, getCoursePurchase, getMyCoursePurchases } from "../../../../services/APIService";
import { AuthContext } from "../../../../context/AuthContext";
import { isInstructor } from "../../../../utils/roles";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const entityId = (value) => value?._id || value?.id || (typeof value === "string" ? value : "");

export default function CoursePurchaseReturn({ purchaseId }) {
  const { user } = useContext(AuthContext);
  const coursesPath = isInstructor(user) ? "/teacher/learning" : user?.role === "user" ? "/learner-dashboard" : "/student-dashboard/courses";
  const [state, setState] = useState({ kind: "loading", purchase: null, courseId: "" });
  const [pollingExpired, setPollingExpired] = useState(false);

  const refresh = useCallback(async () => {
    if (!purchaseId) {
      setState({ kind: "error", message: "رابط العودة لا يحتوي على رقم عملية الشراء." });
      return true;
    }
    try {
      const payload = unwrap(await getMyCoursePurchases());
      const purchases = Array.isArray(payload) ? payload : payload?.purchases || payload?.items || payload?.docs || [];
      const listed = purchases.find((item) => String(item.id || item._id) === String(purchaseId));
      if (!listed) {
        setState({ kind: "pending", message: "لم تظهر عملية الشراء في حسابك بعد. سنواصل التحقق." });
        return false;
      }
      const courseId = entityId(listed.course || listed.courseId);
      const purchase = courseId ? unwrap(await getCoursePurchase(courseId)) : listed;
      const paymentStatus = purchase?.paymentStatus || listed.paymentStatus;
      const failureReason = purchase?.accessGrantFailureReason || listed.accessGrantFailureReason;

      if (paymentStatus === "paid") {
        if (failureReason) {
          setState({ kind: "access_failed", purchase, courseId, message: failureReason });
          return true;
        }
        const access = courseId ? unwrap(await getCourseAccess(courseId)) : null;
        if (access?.hasAccess ?? access?.access ?? access?.enrolled) {
          setState({ kind: "granted", purchase, courseId });
          return true;
        }
        setState({ kind: "processing", purchase, courseId });
        return false;
      }
      if (["failed", "cancelled", "refunded"].includes(paymentStatus)) {
        setState({ kind: "error", purchase, courseId, message: "لم تكتمل عملية الدفع أو تم إلغاؤها." });
        return true;
      }
      setState({ kind: "pending", purchase, courseId });
      return false;
    } catch (error) {
      setState({ kind: "error", message: error?.response?.data?.message || "تعذر التحقق من حالة شراء الدورة." });
      return true;
    }
  }, [purchaseId]);

  useEffect(() => {
    let active = true;
    let attempts = 0;
    const initialRefresh = window.setTimeout(refresh, 0);
    const timer = window.setInterval(async () => {
      attempts += 1;
      const terminal = await refresh();
      if (!active || terminal) window.clearInterval(timer);
      if (attempts >= 30) {
        window.clearInterval(timer);
        if (active) setPollingExpired(true);
      }
    }, 4000);
    return () => { active = false; window.clearTimeout(initialRefresh); window.clearInterval(timer); };
  }, [refresh]);

  const granted = state.kind === "granted";
  const failed = ["access_failed", "error"].includes(state.kind);
  return <div className="w-full max-w-md mx-auto p-6" dir="rtl">
    <div className="rounded-2xl border border-[#DCE8F7] bg-white p-7 text-center shadow-sm">
      {state.kind === "loading" ? <LoaderCircle className="mx-auto animate-spin text-[#123C91]" size={44} /> : failed ? <XCircle className="mx-auto text-red-600" size={44} /> : granted ? <CheckCircle className="mx-auto text-emerald-600" size={44} /> : <Clock className="mx-auto text-amber-500" size={44} />}
      <h1 className="mt-4 text-xl font-bold">حالة شراء الدورة</h1>
      <p className="mt-3 text-sm leading-7 text-gray-600">
        {granted ? "تم تأكيد الدفع ومنحك الوصول إلى الدورة." : state.kind === "access_failed" ? "تم تأكيد الدفع، لكن تعذر منح الوصول إلى الدورة. يرجى التواصل مع الدعم." : state.kind === "processing" ? "تم تأكيد الدفع، وجارٍ الآن منح الوصول إلى الدورة." : state.kind === "pending" ? (state.message || "الدفع ما زال قيد المعالجة. سنواصل التحقق تلقائياً.") : state.message || "جاري التحقق من الدفع والوصول..."}
      </p>
      {state.kind === "access_failed" && state.message && <p className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">{state.message}</p>}
      {granted && <Link to={`/learn/${state.courseId}`} className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#123C91] px-6 font-bold !text-white">فتح الدورة</Link>}
      {!granted && <button type="button" onClick={refresh} className="mt-6 h-11 rounded-lg border border-[#123C91] px-6 font-bold text-[#123C91]">تحديث الحالة</button>}
      {pollingExpired && !granted && <p className="mt-3 text-xs text-gray-500">توقف التحديث التلقائي. يمكنك تحديث الحالة يدوياً.</p>}
      <Link to={coursesPath} className="mt-4 block text-sm font-semibold text-gray-600">العودة إلى دوراتي</Link>
    </div>
  </div>;
}
