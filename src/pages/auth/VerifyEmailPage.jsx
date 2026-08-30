import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import logo from "../../assets/icons/logo.svg";
import { AuthContext } from "../../context/AuthContext";
import { verifyAccount } from "../../services/APIService";
import { getAuthenticatedDestination } from "../../utils/roles";

const invalidLinkError = (error) => {
  const status = error.response?.status;
  const message = String(
    error.response?.data?.code || error.response?.data?.message || "",
  ).toUpperCase();
  return (
    [400, 404, 409, 410, 422].includes(status) ||
    ["INVALID", "EXPIRED", "CONSUMED", "REPLACED", "ALREADY_USED"].some(
      (key) => message.includes(key),
    )
  );
};

const readAndRemoveToken = () => {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const token = params.get("token")?.trim() || "";
  window.history.replaceState(
    window.history.state,
    document.title,
    `${window.location.pathname}${window.location.search}`,
  );
  return token;
};

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user, establishSession } = useContext(AuthContext);
  const [verificationToken] = useState(readAndRemoveToken);
  const [status, setStatus] = useState(
    verificationToken ? "verifying" : user ? "verified" : "invalid",
  );
  const started = useRef(false);

  useEffect(() => {
    if (!verificationToken || started.current) return undefined;
    started.current = true;
    let active = true;
    let redirectTimer;

    verifyAccount(verificationToken)
      .then((response) => {
        if (!active) return;
        const jwt = response.data?.token;
        const verifiedUser = response.data?.data;
        if (!jwt || !verifiedUser || typeof verifiedUser !== "object") {
          setStatus("server-error");
          return;
        }

        const sessionUser = establishSession(jwt, verifiedUser);
        const destination = getAuthenticatedDestination(sessionUser);
        setStatus("verified");
        redirectTimer = window.setTimeout(() => {
          navigate(destination.path, {
            replace: true,
            state: destination.state,
          });
        }, 1200);
      })
      .catch((error) => {
        if (!active) return;
        setStatus(invalidLinkError(error) ? "invalid" : "server-error");
      });

    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [establishSession, navigate, verificationToken]);

  useEffect(() => {
    if (verificationToken || !user) return undefined;
    const destination = getAuthenticatedDestination(user);
    const redirectTimer = window.setTimeout(() => {
      navigate(destination.path, { replace: true, state: destination.state });
    }, 600);
    return () => window.clearTimeout(redirectTimer);
  }, [navigate, user, verificationToken]);

  const content = {
    verifying: {
      icon: <Loader2 className="animate-spin text-[#123C91]" size={32} />,
      title: "جاري التحقق من البريد الإلكتروني",
      description: "يرجى الانتظار، سيتم تفعيل حسابك خلال لحظات.",
    },
    verified: {
      icon: <CheckCircle className="text-[#059669]" size={34} />,
      title: "تم تفعيل حسابك بنجاح",
      description: "تم تسجيل دخولك، وسيتم نقلك إلى الخطوة التالية.",
    },
    invalid: {
      icon: <AlertCircle className="text-[#B45309]" size={34} />,
      title: "رابط التحقق غير صالح أو منتهي",
      description:
        "قد يكون الرابط منتهياً أو سبق استخدامه أو تم استبداله برابط أحدث. يمكنك طلب رسالة تحقق جديدة.",
    },
    "server-error": {
      icon: <AlertCircle className="text-[#B91C1C]" size={34} />,
      title: "تعذر إكمال التحقق",
      description:
        "حدثت مشكلة في الاتصال أو الخادم. حاول فتح الرابط مرة أخرى لاحقاً أو اطلب رسالة تحقق جديدة.",
    },
  }[status];

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto p-8 flex flex-col items-center" dir="rtl" aria-live="polite">
        <Link to="/" className="self-start">
          <img src={logo} alt="الأكاديمية" className="w-44 h-8 mb-8" />
        </Link>
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-5">
          {content.icon}
        </div>
        <h1 className="text-[23px] font-bold text-[#1F2937] mb-3 text-center">
          {content.title}
        </h1>
        <p className="text-[14px] leading-7 text-[#6B7280] text-center mb-7">
          {content.description}
        </p>

        {(status === "invalid" || status === "server-error") && (
          <div className="w-full space-y-3">
            <Link to="/check-email" className="w-full h-14 rounded-lg bg-[#123C91] text-white font-medium text-[16px] flex items-center justify-center gap-2">
              <Mail size={18} /> طلب رابط تحقق جديد
            </Link>
            <Link to="/login" className="w-full h-12 rounded-lg border border-[#123C91] text-[#123C91] font-medium text-[14px] flex items-center justify-center">
              الذهاب إلى تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
