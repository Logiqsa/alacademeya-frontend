import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import logo from "../../assets/icons/logo.svg";
import { resendVerificationLink } from "../../services/APIService";

const RESEND_COOLDOWN = 120;

const CheckEmailPage = () => {
  const { state } = useLocation();
  const [email, setEmail] = useState(state?.email || "");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setSending(true);
    try {
      await resendVerificationLink(normalizedEmail);
      setCooldown(RESEND_COOLDOWN);
      toast.success(
        "إذا كان الحساب موجوداً وغير مفعّل، فستصلك رسالة تحقق جديدة.",
      );
    } catch {
      toast.error("تعذر إرسال رسالة التحقق حالياً، حاول مرة أخرى لاحقاً.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 flex flex-col items-center" dir="rtl">
        <Link to="/" className="self-start">
          <img src={logo} alt="الأكاديمية" className="w-44 h-8 mb-8" />
        </Link>

        <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center mb-5">
          <Mail size={30} className="text-[#123C91]" aria-hidden="true" />
        </div>
        <h1 className="text-[24px] font-bold text-[#1F2937] mb-3 text-center">
          تحقق من بريدك الإلكتروني
        </h1>
        <p className="text-[14px] leading-7 text-[#6B7280] text-center mb-2">
          تم إنشاء الحساب وإرسال رابط التحقق إلى بريدك الإلكتروني. الرابط صالح
          لمدة 24 ساعة.
        </p>
        <p className="text-[14px] leading-7 text-[#6B7280] text-center mb-6">
          تحقق من صندوق الوارد ومجلد البريد غير المرغوب فيه (Spam).
        </p>

        <form onSubmit={handleResend} className="w-full space-y-4">
          <div>
            <label htmlFor="verification-email" className="block text-[13px] font-medium text-[#1F2937] mb-1">
              البريد الإلكتروني
            </label>
            <input
              id="verification-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@mail.com"
              autoComplete="email"
              className="w-full h-12 px-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] outline-none focus:border-[#123C91] text-[14px]"
            />
          </div>
          <button
            type="submit"
            disabled={sending || cooldown > 0}
            className="w-full h-14 rounded-lg bg-[#123C91] text-white font-medium text-[16px] disabled:opacity-60"
          >
            {sending
              ? "جاري الإرسال..."
              : cooldown > 0
                ? `يمكن إعادة الإرسال بعد ${cooldown} ثانية`
                : "إعادة إرسال رابط التحقق"}
          </button>
        </form>

        <Link to="/login" className="mt-5 text-[14px] font-medium text-[#123C91] underline">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </AuthLayout>
  );
};

export default CheckEmailPage;
