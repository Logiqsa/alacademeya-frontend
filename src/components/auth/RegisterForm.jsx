import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../../assets/icons/logo.svg";
import { getArabicCountryName } from "../../utils/countryName";
import { buildInternationalPhone } from "../../utils/phone";
import {
  register,
  verifyAccount,
  resendOtp,
  getCountries,
} from "../../services/APIService";

const OTP_LENGTH = 6;
const TIMER_START = 60;

const getFlagUrl = (code) => {
  if (!code) return null;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

const normalizeCountries = (raw) => {
  const list = Array.isArray(raw) ? raw : raw?.data || [];
  return list.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name || "Unknown",
    nameAr: getArabicCountryName(c),
    flagUrl: getFlagUrl(c.code),
    phoneCode: c.phoneCode || "",
  }));
};

// Ensures the dialing code always has a leading "+", regardless of how
// the backend sends it (e.g. "20" or "+20" should both become "+20").
const normalizePhoneCode = (code) => {
  if (!code) return "";
  const trimmed = String(code).trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
};

const FlagIcon = ({ country }) => {
  if (country?.flagUrl) {
    return (
      <img
        src={country.flagUrl}
        alt=""
        className="w-5 h-3.5 object-cover rounded-xs shrink-0"
      />
    );
  }
  if (country?.flagEmoji) {
    return (
      <span className="text-[16px] leading-none">{country.flagEmoji}</span>
    );
  }
  return null;
};

const CountryDropdown = ({
  value,
  onChange,
  inputClass,
  countries = [],
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = countries.find((c) => c.id === value);

  const filtered = countries.filter((c) => {
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.nameAr.includes(s);
  });

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
        دولة الإقامة
      </label>
      <button
        type="button"
        onClick={() => {
          if (!loading) {
            setOpen(!open);
            setSearch("");
          }
        }}
        disabled={loading}
        className={`${inputClass} flex items-center justify-between cursor-pointer text-right ${!value ? "text-[#9CA3AF]" : "text-[#1F2937]"} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-2">
          {loading ? (
            "جاري تحميل الدول..."
          ) : selected ? (
            <>
              <FlagIcon country={selected} />
              {selected.nameAr}
            </>
          ) : (
            "اختر الدولة"
          )}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#1F293733] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-[#1F293710]">
            <input
              type="text"
              placeholder="ابحث عن دولة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[#1F293733] bg-[#F9FAFA] text-[13px] outline-none focus:border-[#123C91]"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className="px-4 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-[#F0F4FC]"
              >
                <FlagIcon country={c} />
                <span>{c.nameAr}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Phone Country-Code Dropdown ───────────────────────────────────────────
// مستقل تمامًا عن حقل "الدولة" فوق — المستخدم يقدر يختار أي كود دولة يعايزه
// لرقم الهاتف، بغض النظر عن الدولة اللي اختارها في الحقل التاني.
// اتبنى بـ <select> أصلي (مش custom dropdown) عشان يفتح ويختار بشكل مضمون
// 100% على كل المتصفحات من غير مشاكل z-index أو ref.
const PhoneCodeDropdown = ({ value, onChange, countries = [], loading }) => {
  return (
    <div className="relative w-auto min-w-24 shrink-0 border-l border-[#1F293733]">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="h-12 pl-6 pr-2 appearance-none bg-[#E5E7EB] text-[#374151] text-[13px] outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed w-full"
      >
        <option value="" disabled>
          {loading ? "..." : "الكود"}
        </option>
        {countries.map((c) => {
          const code = normalizePhoneCode(c.phoneCode);
          return (
            <option key={c.id} value={c.id}>
              {code || "+--"}
            </option>
          );
        })}
      </select>
      <ChevronDown
        size={13}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none"
      />
    </div>
  );
};

const RegisterForm = ({ type }) => {
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(TIMER_START);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    country: "",
    // كود الدولة الخاص برقم الهاتف — منفصل عن حقل "الدولة" فوق، المستخدم
    // يقدر يختاره بحرية بغض النظر عن الدولة التانية.
    phoneCountryId: "",
    academicLevel: "",
    // نوع الطالب: مدرسي (school) أو جامعي (university) — بتتحدد من
    // المستخدم صراحةً وبترتبط مباشرة بحقل studentType في الباك إند.
    studentType: "school",
    role: type || "student",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCountries();
        setCountries(normalizeCountries(res.data));
      } catch {
        console.error("Failed to load countries");
      } finally {
        setLoadingCountries(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!showOtpModal) return;
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  const selectedPhoneCountry = countries.find(
    (c) => c.id === formData.phoneCountryId,
  );
  const phoneCode = normalizePhoneCode(selectedPhoneCountry?.phoneCode);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "") });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      toast.error("الاسم الكامل يجب أن يحتوي على 3 أحرف على الأقل");
      return false;
    }
    if (
      !formData.username.trim() ||
      !/^[a-zA-Z0-9_]+$/.test(formData.username)
    ) {
      toast.error("اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط");
      return false;
    }
    if (!formData.country) {
      toast.error("يرجى اختيار الدولة");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return false;
    }
    if (!formData.phoneCountryId) {
      toast.error("يرجى اختيار كود الدولة لرقم الهاتف");
      return false;
    }
    if (
      !formData.phone ||
      formData.phone.length < 7 ||
      formData.phone.length > 15
    ) {
      toast.error("يرجى إدخال رقم هاتف صحيح");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل");
      return false;
    }
    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      toast.error(
        "كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة ورقم ورمز خاص",
      );
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      toast.error("كلمتا المرور غير متطابقتين");
      return false;
    }
    if (
      type === "student" &&
      formData.studentType === "school" &&
      !formData.academicLevel
    ) {
      toast.error("يرجى اختيار المرحلة الدراسية");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const selectedCountry = countries.find((c) => c.id === formData.country);

      const payload = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: buildInternationalPhone(phoneCode, formData.phone),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        country: formData.country,
        countryCode: selectedCountry?.code,
        role: formData.role,
      };

      if (type === "student") {
        payload.academicLevel =
          formData.studentType === "school"
            ? formData.academicLevel
            : "university";
        payload.studentType = formData.studentType;
      }
      await register(payload);

      toast.success("تم إنشاء الحساب!");
      setOtp(new Array(OTP_LENGTH).fill(""));
      setTimer(TIMER_START);
      setShowOtpModal(true);
    } catch (err) {
      console.error("خطأ من السيرفر (register):", err.response?.data);
      toast.error(err.response?.data?.message || "حدثت مشكلة أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (target, index) => {
    const val = target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    if (val && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
      otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    e.preventDefault();
  };

  // ---- Post-verification routing ----
  // - parent                             -> straight to dashboard
  // - student, university                -> straight to dashboard
  // - student, primary/middle/high       -> student-details -> subjects -> success -> account-state
  // - teacher                            -> teacher-details -> pending
  const resolvePostVerifyRoute = () => {
    if (type === "parent") {
      return {
        path: "/parent-dashboard",
        state: { email: formData.email, role: type },
      };
    }
    if (type === "student") {
      if (formData.studentType === "university") {
        return {
          path: "/student-dashboard",
          state: { email: formData.email, role: type },
        };
      }
      return {
        path: "/register/student-details",
        state: {
          email: formData.email,
          role: type,
          academicLevel: formData.academicLevel,
          countryId: formData.country,
          // نوع الطالب اللي اختاره المستخدم صراحةً من الـ toggle.
          studentType: formData.studentType,
        },
      };
    }
    if (type === "teacher") {
      return {
        path: "/register/teacher-details",
        state: { email: formData.email, role: type },
      };
    }
    return { path: "/login", state: { email: formData.email, role: type } };
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("يرجى إدخال رمز التفعيل كاملاً");
      return;
    }
    setOtpLoading(true);
    try {
      const found = countries.find((c) => c.id === formData.country);

      const res = await verifyAccount({
        email: formData.email,
        code,
        country: found?.code,
      });

      const token = res.data?.token;
      if (token) localStorage.setItem("token", token);

      toast.success("تم تفعيل الحساب بنجاح!");
      setShowOtpModal(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const { path, state } = resolvePostVerifyRoute();
      navigate(path, { state });
    } catch (err) {
      console.error("خطأ من السيرفر (verify):", err.response?.data);
      toast.error(
        err.response?.data?.message || "الكود غير صحيح، حاول مرة أخرى",
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendOtp(formData.email, formData.role, formData.country);
      setTimer(TIMER_START);
      setOtp(new Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
      toast.success("تم إرسال كود جديد!");
    } catch (err) {
      console.error("خطأ من السيرفر (resend-otp):", err.response?.data);
      toast.error(
        err.response?.data?.message || "فشل إعادة الإرسال، حاول لاحقاً",
      );
    } finally {
      setResendLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 p-4 rounded-lg border border-[#1F293733] bg-[#F9FAFA] focus:outline-none focus:border-[#123C91] text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF] transition-colors";

  return (
    <div className="relative w-full max-w-175 mx-auto p-6">
      <Link to="/">
        <img src={logo} alt="logo" className="w-44 h-8 mb-4 cursor-pointer" />
      </Link>
      <h2 className="text-[24px] font-bold mb-4 text-[#1F2937]">
        مرحباً بك...
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1F2937]">
            الاسم الكامل
          </label>
          <input
            name="fullName"
            type="text"
            placeholder="أدخل اسمك الكامل"
            value={formData.fullName}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
            البريد الإلكتروني
          </label>
          <input
            name="email"
            type="email"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        {type === "student" && (
          <div className="relative">
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              المرحلة الدراسية
            </label>
            <div className="relative w-full">
              <select
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleChange}
                className={`${inputClass} w-full h-12.5 py-0 appearance-none px-4 outline-none ${!formData.academicLevel ? "text-gray-400" : "text-[#1F2937]"}`}
                required
              >
                <option value="" disabled>
                  اختر المرحلة الدراسية
                </option>
                <option value="primary">ابتدائي</option>
                <option value="middle">إعدادي</option>
                <option value="high">ثانوي</option>
                <option value="university">جامعي و غير ذلك</option>
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        )}

        {/* المرحلة الدراسية = نوع الطالب نفسه (ابتدائي/إعدادي/ثانوي/جامعي) */}

        <CountryDropdown
          value={formData.country}
          countries={countries}
          loading={loadingCountries}
          onChange={(selectedId) =>
            setFormData((prev) => ({ ...prev, country: selectedId }))
          }
          inputClass={inputClass}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              اسم المستخدم
            </label>
            <input
              name="username"
              type="text"
              placeholder="أدخل اسم المستخدم"
              value={formData.username}
              onChange={handleChange}
              maxLength={30}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
              رقم الهاتف
            </label>
            <div
              dir="ltr"
              className="flex w-full h-12 rounded-lg overflow-hidden border border-[#1F293733] bg-[#F9FAFA] focus-within:border-[#123C91] transition-colors"
            >
              {/* دروب داون مستقل لكود الدولة — المستخدم يختار أي كود يعايزه */}
              <PhoneCodeDropdown
                value={formData.phoneCountryId}
                countries={countries}
                loading={loadingCountries}
                onChange={(selectedId) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneCountryId: selectedId,
                  }))
                }
              />
              <input
                name="phone"
                type="tel"
                maxLength={15}
                inputMode="numeric"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={handleChange}
                className="flex-1 h-full px-3 bg-transparent outline-none text-[14px] text-[#1F2937] placeholder:text-[#9CA3AF]"
                required
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={formData.password}
              autoComplete="new-password"
              onChange={handleChange}
              className={inputClass}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[13px] font-medium text-[#1F2937] mb-1">
            تأكيد كلمة المرور
          </label>
          <div className="relative">
            <input
              name="passwordConfirm"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="********"
              value={formData.passwordConfirm}
              autoComplete="new-password"
              onChange={handleChange}
              className={inputClass}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white font-medium text-[16px] flex items-center justify-center disabled:opacity-70 transition-opacity mt-2"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          {loading ? "جاري الإرسال..." : "التالي"}
        </button>

        <div className="flex items-center justify-center gap-1 pt-2">
          <span className="text-[14px] text-[#1F2937]">لديك حساب؟</span>
          <Link
            to="/login"
            className="text-[14px] font-medium text-[#123C91] border-b border-[#123C91]"
          >
            تسجيل الدخول
          </Link>
        </div>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            dir="ltr"
            className="bg-white p-10 md:p-10 flex flex-col items-center justify-center shadow-[0px_20px_60px_0px_#1F29371F] overflow-y-auto"
            style={{
              width: "100%",
              maxWidth: "720px",
              height: "auto",
              minHeight: "30px",
              borderRadius: "24px",
              opacity: "1",
              gap: "20px",
            }}
          >
            <p className="font-normal text-[18px] md:text-[20px] leading-8 text-center text-[#1F2937] p-2">
              لإكمال عملية التسجيل، نرجو إدخال رمز التفعيل المرسل إلى البريد
              الإلكتروني:
            </p>
            <p className="font-medium text-[20px] md:text-[22px] leading-8 text-center text-[#123C91] p-2 mb-2">
              {formData.email}
            </p>

            <div
              className="flex justify-center gap-2 mb-4"
              onPaste={handleOtpPaste}
            >
              {otp.map((data, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-12 h-14 md:w-14 md:h-14 rounded-lg border border-[#1F293733] bg-[#F9FAFA] text-center text-xl outline-none focus:border-[#123C91] transition-colors"
                />
              ))}
            </div>

            <div className="mb-4">
              {timer > 0 ? (
                <p className="font-bold text-[20px] text-center text-[#123C91]">
                  {timer} ثانية
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-[#123C91] underline w-full disabled:opacity-60"
                >
                  {resendLoading
                    ? "جاري إعادة الإرسال..."
                    : "إعادة إرسال الكود"}
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full md:w-77 h-14 rounded-lg border border-[#1F293733] bg-white text-[#123C91]"
              >
                إلغاء
              </button>
              <button
                onClick={handleVerify}
                disabled={otpLoading}
                className="w-full md:w-77 h-14 rounded-lg bg-[#123C91] text-white [&_svg]:text-white disabled:opacity-70 transition-opacity"
              >
                {otpLoading ? "جاري التحقق..." : "تحقق"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
