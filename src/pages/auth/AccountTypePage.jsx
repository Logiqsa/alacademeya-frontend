// ─── AccountTypePage.jsx ───────────────────────────────────────────────────
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";

const TYPES = [
  {
    id: "parent",
    title: "ولي أمر",
    desc: "تابع تقدم الأبناء واطلع على إنجازاتهم.",
  },
  {
    id: "student",
    title: "طالب جامعي / خريج",
    desc: "طور مهاراتك وتابع رحلتك التعليمية.",
  },
  {
    id: "teacher",
    title: "معلم",
    desc: "أنشئ المحتوى التعليمي وتابع طلابك.",
  },
];

export const AccountTypePage = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 flex flex-col" dir="rtl">
        <img src={logo} alt="logo" className="w-44 h-8 mb-6 cursor-pointer" />
        <h2
          className="font-bold text-[24px] text-[#1F2937] mb-1"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          مرحباً بك...
        </h2>
        <p className="text-[14px] text-[#6B7280] mb-6">اختر نوع الحساب</p>

        <div className="flex flex-col gap-3 w-full">
          {TYPES.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                navigate("/register", { state: { accountType: item.id } })
              }
              className="w-full px-5 py-4 border border-[#1F293733] bg-white rounded-xl text-right hover:border-[#123C91] hover:bg-[#F0F4FC] transition-colors"
            >
              <h3 className="text-[15px] font-semibold text-[#1F2937]">
                {item.title}
              </h3>
              <p className="text-[13px] text-[#6B7280] mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1 pt-6">
          <span className="text-[14px] text-[#1F2937]">لديك حساب بالفعل؟</span>
          <button
            onClick={() => navigate("/login")}
            className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};