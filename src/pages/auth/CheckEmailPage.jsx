import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../../components/auth/AuthLayout";
import logo from "../../assets/icons/logo.svg";
import { resendVerificationLink } from "../../services/APIService";
import { AuthContext } from "../../context/AuthContext";

const RESEND_COOLDOWN = 120;

const CheckEmailPage = () => {
  const { state } = useLocation();
  const { user } = useContext(AuthContext);
  const registrationEmail =
    typeof state?.email === "string" ? state.email.trim() : "";
  const emailIsLocked = Boolean(registrationEmail);
  const [email, setEmail] = useState(registrationEmail);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [alreadyVerified, setAlreadyVerified] = useState(() => {
    const currentEmail = String(user?.email || "").trim().toLowerCase();
    return Boolean(
      currentEmail &&
        registrationEmail &&
        currentEmail === registrationEmail.toLowerCase(),
    );
  });

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
    if (alreadyVerified) {
      toast.success("هذا البريد الإلكتروني مفعّل بالفعل.");
      return;
    }

    setSending(true);
    try {
      const response = await resendVerificationLink(normalizedEmail);
      const responseCode = String(
        response.data?.code || response.data?.message || "",
      ).toUpperCase();
      if (responseCode.includes("ACCOUNT_ALREADY_VERIFIED")) {
        setAlreadyVerified(true);
        toast.success("هذا البريد الإلكتروني مفعّل بالفعل.");
        return;
      }
      setCooldown(RESEND_COOLDOWN);
      toast.success(
        "إذا كان الحساب موجوداً وغير مفعّل، فستصلك رسالة تحقق جديدة.",
      );
    } catch (error) {
      const responseCode = String(
        error.response?.data?.code || error.response?.data?.message || "",
      ).toUpperCase();
      if (responseCode.includes("ACCOUNT_ALREADY_VERIFIED")) {
        setAlreadyVerified(true);
        toast.success("هذا البريد الإلكتروني مفعّل بالفعل.");
        return;
      }
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
        <p className="w-full rounded-xl border-2 border-amber-300 bg-[#FFF8E6] px-4 py-3 text-[14px] font-bold leading-7 text-[#6B4700] text-center mb-6 shadow-sm">
          تحقق من صندوق الوارد ومجلد البريد غير المرغوب فيه (Spam).
        </p>

        <form onSubmit={handleResend} className="w-full space-y-4">
          {alreadyVerified && (
            <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-[14px] font-bold text-emerald-700">
              هذا البريد الإلكتروني مفعّل بالفعل، ولا يحتاج إلى رابط تحقق جديد.
            </p>
          )}
          <div>
            <label htmlFor="verification-email" className="block text-[13px] font-medium text-[#1F2937] mb-1">
              البريد الإلكتروني
            </label>
            <input
              id="verification-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              readOnly={emailIsLocked}
              aria-readonly={emailIsLocked}
              placeholder="example@mail.com"
              autoComplete="email"
              className={`w-full h-12 px-4 rounded-lg border border-[#1F293733] outline-none focus:border-[#123C91] text-[14px] ${
                emailIsLocked
                  ? "bg-[#E5E7EB] text-[#4B5563] cursor-not-allowed"
                  : "bg-[#F9FAFA]"
              }`}
            />
            {emailIsLocked && (
              <p className="mt-2 text-[12px] text-[#6B7280]">
                سيتم إعادة إرسال رابط التحقق إلى نفس البريد المسجل.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={sending || cooldown > 0 || alreadyVerified}
            className="w-full h-14 rounded-lg bg-[#123C91] text-white font-medium text-[16px] disabled:opacity-60"
          >
            {alreadyVerified
              ? "البريد الإلكتروني مفعّل"
              : sending
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
