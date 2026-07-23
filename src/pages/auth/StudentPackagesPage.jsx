import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";

const PLANS = [
  { key: "month", label: "شهر", price: 120 },
  { key: "twoMonths", label: "شهرين", price: 200 },
  { key: "threeMonths", label: "3 شهور", price: 250 },
];

const StudentPackagesPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const subjects = state?.selectedSubjects || [];
  const [selections, setSelections] = useState(() =>
    Object.fromEntries(subjects.map((subject) => [subject.id, PLANS[0]])),
  );
  const [coupon, setCoupon] = useState("");

  const selectedCount = useMemo(() => Object.keys(selections).length, [selections]);

  const removeSubject = (id) => {
    setSelections((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const handleNext = () => {
    if (!selectedCount) {
      toast.error("يجب اختيار مادة واحدة على الأقل");
      return;
    }
    navigate("/register/order-summary", {
      state: { ...state, packageSelections: selections, coupon: coupon.trim() },
    });
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-[660px] mx-auto p-5" dir="rtl">
        <img src={logo} alt="الأكاديمية" className="w-40 h-9 mx-auto mb-6" />
        <div className="bg-white border border-[#DCE8F7] rounded-2xl p-6 shadow-sm">
          <button onClick={() => navigate(-1)} className="text-[#123C91] text-sm mb-2">رجوع</button>
          <h1 className="text-[22px] font-bold text-[#1F2937]">اختر باقتك التعليمية</h1>
          <p className="text-sm text-gray-400 mb-5">اختر الباقة المناسبة لكل مادة تريد الاشتراك بها</p>

          <div className="space-y-4">
            {subjects.filter((subject) => selections[subject.id]).map((subject) => (
              <div key={subject.id} className="relative border border-gray-200 rounded-xl p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => removeSubject(subject.id)}
                  className="absolute left-3 top-3 w-7 h-7 rounded-full bg-gray-300 text-white flex items-center justify-center"
                >
                  <X size={15} />
                </button>
                <div className="font-medium text-sm mb-4">
                  <span className="text-[#123C91] ml-2">•</span>{subject.name}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {PLANS.map((plan) => {
                    const active = selections[subject.id]?.key === plan.key;
                    return (
                      <button
                        key={plan.key}
                        type="button"
                        onClick={() => setSelections((current) => ({ ...current, [subject.id]: plan }))}
                        className={`rounded-lg border p-3 text-center transition-colors ${active ? "border-[#123C91] bg-blue-50" : "border-gray-200 bg-white"}`}
                      >
                        <span className="block text-sm text-gray-700">{plan.label}</span>
                        <strong className="text-[#123C91]">{plan.price}</strong>
                        <span className="text-xs text-gray-500 mr-1">ج.م</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border border-gray-200 rounded-xl p-4">
            <label className="block text-sm mb-2">كود الخصم (اختياري)</label>
            <div className="flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="ادخل كود الخصم هنا" className="flex-1 h-11 px-4 rounded-lg border border-gray-200 outline-none focus:border-[#123C91]" />
              <button type="button" className="px-5 rounded-lg bg-[#123C91] text-white">تطبيق</button>
            </div>
          </div>

          <button onClick={handleNext} className="w-full h-12 mt-5 rounded-lg bg-[#123C91] text-white font-medium">
            التالي
          </button>
          <p className="text-center text-sm mt-4">لديك حساب؟ <button onClick={() => navigate("/login")} className="text-[#123C91] underline">تسجيل دخول</button></p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StudentPackagesPage;
