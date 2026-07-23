import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { completeStudentProfile, getAccountState } from "../../services/APIService";

const extractStatus = (res) => String(
  res?.data?.status ?? res?.data?.data?.status ?? res?.data?.registrationStatus ?? res?.data?.data?.registrationStatus ?? "",
).toLowerCase();

const StudentOrderSummaryPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const subjects = state?.selectedSubjects || [];
  const selections = state?.packageSelections || {};

  const rows = subjects.filter((subject) => selections[subject.id]).map((subject) => ({
    ...subject,
    plan: selections[subject.id],
  }));
  const subtotal = useMemo(() => rows.reduce((sum, row) => sum + row.plan.price, 0), [rows]);
  const discount = state?.coupon ? 20 : 0;
  const total = Math.max(0, subtotal - discount);

  const finishRegistration = async () => {
    setLoading(true);
    try {
      await completeStudentProfile({
        birthDate: state.birthDate,
        studyLanguage: state.studyLanguage,
        curriculum: state.curriculumId,
        stage: state.stageId,
        grade: state.gradeId,
        studentType: state.studentType || "school",
        preferredSubjects: state.preferredSubjects,
      });
      let approved = false;
      try {
        const response = await getAccountState();
        approved = ["approved", "active", "accepted"].includes(extractStatus(response));
      } catch {
        approved = false;
      }
      toast.success("تم إنشاء الحساب بنجاح!");
      navigate(approved ? "/student-dashboard" : "/register/success", {
        state: { role: "student", order: { rows, subtotal, discount, total } },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[650px] mx-auto p-5" dir="rtl">
        <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-6" />
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-[#123C91] text-sm mb-2">رجوع</button>
          <h1 className="text-[22px] font-bold">ملخص طلبك</h1>
          <p className="text-sm text-gray-400 mb-5">راجع تفاصيل اشتراكك قبل المتابعة</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 font-medium"><span className="text-[#123C91] ml-2">•</span>باقة المواد</div>
            {rows.map((row) => (
              <div key={row.id} className="flex justify-between px-4 py-3 border-t border-gray-100">
                <div><div>{row.name}</div><small className="text-gray-400">{row.plan.label}</small></div>
                <strong className="text-[#123C91]">{row.plan.price} ج.م</strong>
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-xl p-4 mt-5 space-y-3">
            <div className="flex justify-between"><span>المجموع الفرعي</span><strong>{subtotal} ج.م</strong></div>
            <div className="flex justify-between"><span>الخصم</span><strong className="text-[#123C91]">{discount} ج.م</strong></div>
            <div className="flex justify-between border-t pt-3 text-lg font-bold"><span>الإجمالي</span><strong className="text-[#123C91]">{total} ج.م</strong></div>
          </div>
          <button disabled={loading} onClick={finishRegistration} className="w-full h-12 mt-5 rounded-lg bg-[#123C91] text-white disabled:opacity-60">
            {loading ? "جاري إنشاء الحساب..." : "التالي"}
          </button>
          <p className="text-center text-sm mt-4">لديك حساب؟ <button onClick={() => navigate("/login")} className="text-[#123C91] underline">تسجيل دخول</button></p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentOrderSummaryPage;
