import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { getMySubscriptions, getSubscriptionOrder, startSubscriptionOrderCheckout } from "../../services/APIService";

const responseData = (response) => response?.data?.data ?? response?.data;
const terminalPayments = new Set(["paid", "failed", "refunded"]);

const SubscriptionOrderStatusPage = () => {
  const { orderId: pathOrderId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = pathOrderId || searchParams.get("orderId");
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [pollingExpired, setPollingExpired] = useState(false);

  const refresh = useCallback(async (quiet = false) => {
    if (!orderId) {
      if (!quiet) {
        setLoading(false);
        toast.error("رقم طلب الاشتراك غير موجود في رابط العودة");
      }
      return null;
    }
    if (!quiet) setLoading(true);
    try {
      const response = await getSubscriptionOrder(orderId);
      const current = responseData(response);
      setOrder(current);
      if (current.paymentStatus === "paid" && current.approvalStatus === "approved") {
        await getMySubscriptions();
        navigate("/student-dashboard", { replace: true });
      }
      return current;
    } catch (error) {
      if (!quiet) toast.error(error.response?.data?.message || "تعذر تحميل حالة الطلب");
      return null;
    } finally { if (!quiet) setLoading(false); }
  }, [navigate, orderId]);

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => refresh(), 0);
    const startedAt = Date.now();
    const timer = window.setInterval(async () => {
      if (Date.now() - startedAt >= 120000) {
        window.clearInterval(timer);
        setPollingExpired(true);
        return;
      }
      const current = await refresh(true);
      if (current && terminalPayments.has(current.paymentStatus)) window.clearInterval(timer);
    }, 4000);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [refresh]);

  const continuePayment = async () => {
    if (!orderId) return;
    setPaying(true);
    try {
      const response = await startSubscriptionOrderCheckout(orderId);
      const purchaseUrl = responseData(response)?.purchaseUrl;
      if (!purchaseUrl) throw new Error("Missing checkout URL");
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error.response?.status === 409) await refresh();
      else toast.error(error.response?.data?.message || "تعذر متابعة الدفع");
      setPaying(false);
    }
  };

  const paid = order?.paymentStatus === "paid";
  const rejected = order?.approvalStatus === "rejected";
  const labels = [
    ["تم اختيار الباقة", true],
    ["الدفع قيد الانتظار", ["pending", "paid"].includes(order?.paymentStatus)],
    ["تم تأكيد الدفع", paid],
    ["مراجعة الإدارة", paid && ["waiting_admin", "approved"].includes(order?.approvalStatus)],
    ["تم تفعيل الاشتراك", order?.approvalStatus === "approved"],
  ];

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-6" dir="rtl">
        <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-7" />
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-center mb-4">{rejected ? <XCircle className="text-red-600" size={44} /> : paid ? <CheckCircle className="text-emerald-600" size={44} /> : <Clock className="text-amber-500" size={44} />}</div>
          <h1 className="text-xl font-bold text-center">حالة طلب الاشتراك</h1>
          <p className="text-sm text-gray-500 text-center mt-2 mb-6">{!orderId ? "رابط العودة لا يحتوي على رقم الطلب" : loading ? "جاري التحقق من الخادم..." : rejected ? "تم رفض الطلب" : paid ? order.approvalStatus === "waiting_admin" ? "تم استلام الدفع — بانتظار موافقة الأكاديمية" : "تم تأكيد الدفع" : "لم يتم تأكيد الدفع بعد"}</p>
          {!loading && orderId && <div className="space-y-4">{labels.map(([label, done]) => <div key={label} className="flex items-center gap-3"><span className={`w-5 h-5 rounded-full border-2 ${done ? "bg-[#123C91] border-[#123C91]" : "bg-white border-gray-300"}`} /><span className={done ? "font-medium text-[#123C91]" : "text-gray-400"}>{label}</span></div>)}</div>}
          {["created", "pending"].includes(order?.paymentStatus) && <button disabled={paying} onClick={continuePayment} className="w-full h-12 mt-6 rounded-lg bg-[#123C91] text-white disabled:opacity-60">{paying ? "جاري التحويل..." : order.paymentStatus === "pending" ? "متابعة الدفع" : "الدفع الآن"}</button>}
          {orderId && <button disabled={loading} onClick={() => refresh()} className="w-full h-11 mt-3 rounded-lg border border-[#123C91] text-[#123C91]">تحديث الحالة</button>}
          {pollingExpired && <p className="text-xs text-gray-500 text-center mt-3">توقف التحديث التلقائي. يمكنك تحديث الحالة يدوياً.</p>}
          {order?.paymentStatus === "refunded" && <p className="text-sm text-red-700 mt-4 text-center">تم رد المبلغ. يرجى التواصل مع الدعم.</p>}
          {order?.paymentStatus === "failed" && <p className="text-sm text-red-700 mt-4 text-center">تعذرت عملية الدفع. سياسة إعادة المحاولة غير متاحة حالياً.</p>}
        </div>
      </div>
    </AuthLayout>
  );
};

export default SubscriptionOrderStatusPage;
