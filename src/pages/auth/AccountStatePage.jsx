import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import logo from "../../assets/icons/logo.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import { getAccountState } from "../../services/authService";

const STATUS_CONFIG = {
  pending: {
    icon: <Clock size={32} className="text-[#D97706]" />,
    bg: "bg-[#FFFBEB]",
    title: "طلب قيد المراجعة",
    desc: "طلبك قيد المراجعة من قِبل الإدارة، يرجى الانتظار.",
    color: "text-[#D97706]",
  },
  approved: {
    icon: <CheckCircle size={32} className="text-[#059669]" />,
    bg: "bg-[#ECFDF5]",
    title: "تم قبول طلبك!",
    desc: "تم قبول حسابك، يمكنك الآن تسجيل الدخول والبدء.",
    color: "text-[#059669]",
  },
  rejected: {
    icon: <XCircle size={32} className="text-[#DC2626]" />,
    bg: "bg-[#FEF2F2]",
    title: "تم رفض الطلب",
    desc: "للأسف تم رفض طلبك. يرجى التواصل مع الدعم للمزيد من التفاصيل.",
    color: "text-[#DC2626]",
  },
  error: {
    icon: <AlertCircle size={32} className="text-[#D97706]" />,
    bg: "bg-[#FFFBEB]",
    title: "خطأ في تحميل الحالة",
    desc: "تعذر تحميل حالة حسابك، حاول مرة أخرى.",
    color: "text-[#D97706]",
  },
};

const AccountStatePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccountState()
      .then((data) => {
        setStatus(data?.status || "pending");
        setDetails(data);
      })
      .catch(() => setStatus("error"))
      .finally(() => setLoading(false));
  }, []);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <AuthLayout>
      <div
        className="w-full max-w-md mx-auto p-8 flex flex-col items-center"
        dir="rtl"
      >
        <img src={logo} alt="logo" className="w-44 h-8 mb-8 cursor-pointer" />

        <h2
          className="text-[22px] font-bold text-[#1F2937] mb-8 w-full"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          حالة الحساب
        </h2>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-8 h-8 border-2 border-[#123C91] border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] text-[#6B7280]">جاري التحميل...</p>
          </div>
        ) : (
          <>
            <div
              className={`w-full ${config.bg} rounded-xl p-6 flex flex-col items-center text-center mb-6 border border-[#1F293710]`}
            >
              <div className="mb-3">{config.icon}</div>
              <h3 className={`text-[18px] font-bold mb-1 ${config.color}`}>
                {config.title}
              </h3>
              <p className="text-[13px] text-[#6B7280]">{config.desc}</p>
            </div>

            {details && (
              <div className="w-full bg-[#F9FAFA] rounded-xl border border-[#1F293733] p-5 mb-6 space-y-3">
                {details.fullName && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B7280]">الاسم</span>
                    <span className="text-[#1F2937] font-medium">{details.fullName}</span>
                  </div>
                )}
                {details.email && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B7280]">البريد الإلكتروني</span>
                    <span className="text-[#1F2937] font-medium">{details.email}</span>
                  </div>
                )}
                {details.role && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#6B7280]">نوع الحساب</span>
                    <span className="text-[#1F2937] font-medium">
                      {{ student: "طالب", teacher: "معلم", parent: "ولي أمر" }[details.role] || details.role}
                    </span>
                  </div>
                )}
              </div>
            )}

            {status === "approved" && (
              <button
                onClick={() => navigate("/login")}
                className="w-full h-14 rounded-xl bg-[#123C91] text-white font-medium text-[16px] mb-3"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                تسجيل الدخول الآن
              </button>
            )}

            {status === "rejected" && (
              <button
                onClick={() => navigate("/select-account-type")}
                className="w-full h-14 rounded-xl border border-[#123C91] text-[#123C91] font-medium text-[16px] mb-3"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                إنشاء حساب جديد
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="text-[14px] text-[#6B7280] hover:text-[#123C91] transition-colors"
            >
              ↺ تحديث الحالة
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default AccountStatePage;