import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import logo from "../../assets/icons/logo.svg";
import clockIcon from "../../assets/icons/clock.svg";
import whatsappIcon from "../../assets/icons/whatsapp.svg";
import reviewTimeIcon from "../../assets/icons/review-time.svg";
import { AuthContext } from "../../context/AuthContext";

const AccountStatePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { logout } = useContext(AuthContext);

  return (
    <AuthLayout>
      <div className="w-full max-w-145 mx-auto p-2 flex flex-col items-center" dir="rtl">

        {/* Logo */}
        <img src={logo} alt="logo" className="w-44 h-8 mb-2 mt-4 cursor-pointer" />

        <img src={clockIcon} alt="clock" className="w-16 h-16 mb-4" />
        <h2
          className="text-center mb-2"
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontWeight: 700,
            fontSize: "24px",
            lineHeight: "32px",
            letterSpacing: "0px",
            color: "#1F2937",
          }}
        >
          طلبك قيد المراجعة
        </h2>
        <p
          className="text-center mb-6"
          style={{
            fontFamily: "IBM Plex Sans Arabic, sans-serif",
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0px",
            color: "#575F69",
          }}
        >
          شكراً لتقديم طلبك، يقوم فريقنا حالياً بمراجعة بياناتك والتحقق من المستندات المرفقة
        </p>

        <div className="w-full bg-[#F9FAFA] rounded-xl border border-[#1F293720] p-5 mb-4">

          {/* Step 1 - Done */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#14B8A6] flex items-center justify-center shrink-0">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="w-0.5 h-8 bg-[#E5E7EB]" />
            </div>
            <div className="pt-0.5 ">
              <p className="mb-1" style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "16px", lineHeight: "24px", color: "#1F2937" }}>
                تم استلام الطلب
              </p>
              <p style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "16px", color: "#575F69" }}>
                تم تسجيل بياناتك بنجاح
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="w-0.5 h-8 bg-[#E5E7EB]" />
            </div>
            <div className="pt-0.5">
              <p className="mb-1" style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "16px", lineHeight: "24px", color: "#1F2937" }}>
                قيد المراجعة
              </p>
              <p style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "16px", color: "#575F69" }}>
                يتم مراجعة بياناتك والتحقق من المستندات
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-[#D1D5DB] bg-white shrink-0" />
            <div className="pt-0.5">
              <p className="mb-1" style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "16px", lineHeight: "24px", color: "#9CA3AF" }}>
                تفعيل الحساب
              </p>
              <p style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "#575F69" }}>
                تحقق من رقم واتسابك سنرسل لك إشعاراً فور الموافقة على طلبك.
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[#1F293720] p-4 flex flex-col items-right text-right gap-5">
            <img src={reviewTimeIcon} alt="review time" className="w-8 h-8" />
            <p style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "16px", lineHeight: "16px", color: "#1F2937" }}>
              وقت المراجعة
            </p>
            <p style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "16px", color: "#575F69" }}>
              عادة 1-3 أيام عمل
            </p>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-xl border border-[#1F293720] p-4 flex flex-col items-right text-right gap-3">
            <img src={whatsappIcon} alt="whatsapp" className="w-8 h-8" />
            <p style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 700, fontSize: "16px", lineHeight: "16px", color: "#1F2937" }}>
              تواصل معنا عبر واتساب
            </p>
            <p style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontWeight: 400, fontSize: "14px", lineHeight: "16px", color: "#575F69" }}>
              تحقق من رقم واتسابك سنرسل لك إشعارا فور الموافقة على طلبك.
            </p>
            <button
              onClick={() => window.open("https://wa.me/", "_blank")}
              style={{
                width: "240px",
                height: "40px",
                borderRadius: "8px",
                paddingRight: "24px",
                paddingLeft: "24px",
                gap: "8px",
                backgroundColor: "#123C91",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={whatsappIcon} alt="" className="w-4 h-4 brightness-0 invert" />
              <span style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "16px", color: "#FFFFFF" }}>
                تواصل عبر واتساب
              </span>
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button className="mb-4"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          style={{
            width: "100%",
            height: "56px",
            borderRadius: "8px",
            border: "1px solid #123C9180",
            backgroundColor: "#FFFFFF",
            fontFamily: "Tajawal, sans-serif",
            fontWeight: 500,
            fontSize: "16px",
            color: "#123C91",
          }}
        >
          العودة لتسجيل الدخول
        </button>

      </div>
    </AuthLayout>
  );
};

export default AccountStatePage;