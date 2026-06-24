import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";

const MESSAGES = {
  student: {
    title: "تم إنشاء حسابك!",
    desc: "حسابك قيد المراجعة، سيتم إعلامك بالموافقة عبر البريد الإلكتروني.",
    steps: [
      { label: "تم إنشاء الحساب", done: true },
      { label: "مراجعة البيانات", done: false },
      { label: "تفعيل الحساب", done: false },
    ],
  },
  teacher: {
    title: "تم إرسال طلبك!",
    desc: "طلبك قيد المراجعة من قِبل الإدارة، سيتم التواصل معك خلال 24-48 ساعة.",
    steps: [
      { label: "تم إنشاء الحساب", done: true },
      { label: "مراجعة الإدارة", done: false },
      { label: "تفعيل الحساب", done: false },
    ],
  },
};

const PendingPage = () => {
  const navigate = useNavigate();
  const role = new URLSearchParams(window.location.search).get("role") || "student";
  const content = MESSAGES[role] || MESSAGES.student;

  return (
    <AuthLayout>
      <div
        className="w-full max-w-md mx-auto p-8 flex flex-col items-center"
        dir="rtl"
      >
        <img src={logo} alt="logo" className="w-44 h-8 mb-8 cursor-pointer" />

        <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-[#059669]" />
        </div>

        <h2
          className="text-[22px] font-bold text-[#1F2937] mb-2 text-center"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {content.title}
        </h2>
        <p className="text-[14px] text-[#6B7280] text-center mb-8">
          {content.desc}
        </p>

        {/* Steps */}
        <div className="w-full bg-[#F9FAFA] rounded-xl border border-[#1F293733] p-5 mb-8">
          {content.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-[#059669]"
                    : "border-2 border-[#D1D5DB] bg-white"
                }`}
              >
                {step.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className={`text-[14px] ${
                  step.done ? "text-[#059669] font-medium" : "text-[#9CA3AF]"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full h-14 rounded-xl bg-[#123C91] text-white font-medium text-[16px]"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          العودة لتسجيل الدخول
        </button>

        <button
          onClick={() => navigate("/account-state")}
          className="mt-3 text-[14px] text-[#123C91] underline"
        >
          متابعة حالة الحساب
        </button>
      </div>
    </AuthLayout>
  );
};

export default PendingPage;