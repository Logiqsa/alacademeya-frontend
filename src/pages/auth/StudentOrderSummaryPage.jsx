import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { completeStudentProfile, createSubscriptionOrder, startSubscriptionOrderCheckout } from "../../services/APIService";

const money = (value, currency = "EGP") =>
  `${Number(value || 0).toLocaleString("ar-EG")} ${currency}`;
const responseData = (response) => response?.data?.data ?? response?.data;
const isExistingProfileError = (error) => {
  const message = String(error.response?.data?.message || "").toLowerCase();
  return message.includes("profile") && message.includes("already exists");
};

const StudentOrderSummaryPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [order, setOrder] = useState(state?.order || null);
  const items = useMemo(() => state?.orderItems || [], [state]);

  useEffect(() => {
    if (order) return;
    if (!items.length) {
      navigate("/register/subjects", { replace: true });
      return;
    }

    let active = true;
    const createOrder = async () => {
      setLoading(true);
      try {
        if (!state?.renewal && !state?.skipProfileCreation) {
          try {
            await completeStudentProfile({
              birthDate: state.birthDate, studyLanguage: state.studyLanguage,
              curriculum: state.curriculumId, stage: state.stageId, grade: state.gradeId,
              studentType: state.studentType || "school", preferredSubjects: state.preferredSubjects,
            });
          } catch (error) {
            if (!isExistingProfileError(error)) throw error;
          }
        }
        const response = await createSubscriptionOrder(
          items.map(({ subject, package: packageId }) => ({
            subject,
            package: packageId,
          })),
          state?.studentId,
          state?.currency,
        );
        const created = responseData(response);
        if (!active) return;
        setOrder(created);
        localStorage.setItem("lastSubscriptionOrderId", created.id);
      } catch (error) {
        if (active) {
          const message = error.response?.status === 404
            ? "خدمة إنشاء طلب الاشتراك غير متاحة من الخادم حالياً"
            : error.response?.data?.message || "تعذر إنشاء طلب الاشتراك";
          toast.error(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    const timer = window.setTimeout(createOrder, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [items, navigate, order, state]);

  const checkout = async () => {
    setCheckoutLoading(true);
    try {
      const response = await startSubscriptionOrderCheckout(order.id);
      const purchaseUrl = responseData(response)?.purchaseUrl;
      if (!purchaseUrl) throw new Error("Missing checkout URL");
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error.response?.status === 409) {
        navigate(`/subscription-orders/${order.id}/status`, { replace: true });
      } else {
        toast.error(error.response?.data?.message || "تعذر بدء عملية الدفع");
      }
      setCheckoutLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[650px] mx-auto p-5" dir="rtl">
        <Link to="/">
          <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-6" />
        </Link>
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-[#123C91] text-sm mb-2">رجوع</button>
          <h1 className="text-[22px] font-bold">ملخص طلبك</h1>
          <p className="text-sm text-gray-400 mb-5">{order ? "راجع تفاصيل اشتراكك قبل الدفع" : "جاري تجهيز تفاصيل طلبك..."}</p>

          {loading && !order && <div className="flex items-center justify-center gap-3 py-10 text-gray-500"><span className="w-5 h-5 border-2 border-[#123C91] border-t-transparent rounded-full animate-spin" />جاري إنشاء الطلب وحساب السعر...</div>}
          {order && <>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {(order.items || []).map((item) => (
                <div key={item.id || `${item.subject}-${item.package}`} className="px-4 py-3 border-b last:border-b-0 border-gray-100">
                  <div className="flex justify-between gap-3"><div><strong>{item.subjectName}</strong><small className="block text-gray-500">{item.packageName} · {item.sessions} حصة</small></div><strong className="text-[#123C91]">{money(item.finalPrice, order.currency || state?.currency)}</strong></div>
                  {(item.discount || 0) > 0 && <div className="text-xs text-gray-500 mt-1">السعر الأصلي {money(item.originalPrice, order.currency || state?.currency)} — الخصم {money(item.discount, order.currency || state?.currency)}</div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between border border-gray-200 rounded-xl p-4 mt-5 text-lg font-bold"><span>الإجمالي</span><strong className="text-[#123C91]">{money(order.totalAmount, order.currency || state?.currency)}</strong></div>
          </>}

          {order && (
            <button disabled={checkoutLoading} onClick={checkout} className="w-full h-12 mt-5 rounded-lg bg-[#123C91] text-white disabled:opacity-60">{checkoutLoading ? "جاري التحويل للدفع..." : order.paymentStatus === "pending" ? "متابعة الدفع" : "الدفع الآن"}</button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentOrderSummaryPage;
