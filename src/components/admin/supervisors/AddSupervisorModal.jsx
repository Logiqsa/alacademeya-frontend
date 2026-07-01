import { useState, useRef, useEffect } from "react";
import { X, Eye, EyeOff, ChevronDown } from "lucide-react";
import { createUser, getCountries } from "../../../services/authService"; // ⚠️ عدّل المسار حسب مكان ملف api.js عندك

const getFlagUrl = (code) => {
  if (!code) return null;
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

const normalizeCountries = (raw) => {
  const list = Array.isArray(raw) ? raw : (raw?.data || []);
  return list.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name || "Unknown",
    flagUrl: getFlagUrl(c.code),
    phoneCode: c.phoneCode || "",
  }));
};

const normalizePhoneCode = (code) => {
  if (!code) return "";
  const trimmed = String(code).trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
};

const FlagIcon = ({ country }) => {
  if (!country?.flagUrl) return null;
  return <img src={country.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded-xs shrink-0" />;
};

const CountryDropdown = ({ value, onChange, countries = [], loading = false, error }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = countries.find((c) => c.id === value);
  const filtered = countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
        الدولة
      </label>
      <button
        type="button"
        onClick={() => { if (!loading) { setOpen(!open); setSearch(""); } }}
        disabled={loading}
        className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] flex items-center justify-between text-right transition-all
          ${error ? "border-red-400" : "border-[#E5E5E5]"} ${loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`flex items-center gap-2 ${!value ? "text-[#8C9198]" : "text-[#1F2937]"}`}>
          {loading ? "جاري تحميل الدول..." : selected ? (<><FlagIcon country={selected} />{selected.name}</>) : "اختر الدولة"}
        </span>
        <ChevronDown size={18} className={`text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}

      {open && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-[#E5E5E5]">
            <input
              type="text"
              placeholder="ابحث عن دولة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-[#E5E5E5] bg-[#F9FAFA] text-[13px] outline-none focus:border-[#123C91] text-right"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <li
                key={c.id}
                onClick={() => { onChange(c.id); setOpen(false); }}
                className="px-4 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-[#F0F4FC] text-right"
              >
                <FlagIcon country={c} />
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ─── Input field ────────────────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder, type = "text", error }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
        ${error ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}`}
    />
    {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
  </div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────
const AddSupervisorModal = ({ open, onClose, onSuccess }) => {
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [data, setData] = useState({ name: "", email: "", phone: "", password: "", country: "" });

  useEffect(() => {
    if (!open) return;
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await getCountries();
        setCountries(normalizeCountries(res.data));
      } catch (err) {
        console.error("Failed to load countries", err);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, [open]);

  if (!open) return null;

  const selectedCountry = countries.find((c) => c.id === data.country);
  const phoneCode = normalizePhoneCode(selectedCountry?.phoneCode);

  const handleField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!data.name.trim())     next.name     = "الاسم بالكامل مطلوب";
    if (!data.email.trim())    next.email    = "البريد الإلكتروني مطلوب";
    if (!data.country)         next.country  = "يرجى اختيار الدولة";
    if (!data.phone.trim())    next.phone    = "رقم الهاتف مطلوب";
    if (!data.password.trim()) next.password = "كلمة المرور مطلوبة";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const username = data.email.split("@")[0]; // مشتق تلقائيًا من الإيميل
      await createUser({
        fullName: data.name,
        username,
        email: data.email,
        phone: phoneCode ? `${phoneCode}${data.phone}` : data.phone,
        password: data.password,
        passwordConfirm: data.password,
        country: data.country,
        countryCode: selectedCountry?.code,
        role: "admin",
        isVerified: true,
      });
      setData({ name: "", email: "", phone: "", password: "", country: "" });
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || "حدث خطأ أثناء إضافة المشرف";
      setErrors((p) => ({ ...p, form: msg }));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setData({ name: "", email: "", phone: "", password: "", country: "" });
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="bg-white w-full sm:max-w-120 rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 shadow-xl max-h-[92dvh] overflow-y-auto"
        dir="rtl"
      >
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
        </div>

        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] text-[#1F2937]">
            إضافة مشرف جديد
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-[13px] text-right">
            {errors.form}
          </div>
        )}

        <div className="space-y-4">
          <InputField
            label="الاسم بالكامل"
            value={data.name}
            onChange={(v) => handleField("name", v)}
            placeholder="ادخل الاسم الكامل"
            error={errors.name}
          />

          <InputField
            label="البريد الإلكتروني"
            value={data.email}
            onChange={(v) => handleField("email", v)}
            placeholder="example@email.com"
            type="email"
            error={errors.email}
          />

          <CountryDropdown
            value={data.country}
            countries={countries}
            loading={loadingCountries}
            onChange={(id) => handleField("country", id)}
            error={errors.country}
          />

          {/* Phone with dynamic country code */}
          <div className="w-full">
            <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
              رقم الهاتف
            </label>
            <div className={`flex h-12 w-full border rounded-lg bg-[#F9FAFA] overflow-hidden transition-all focus-within:ring-2
              ${errors.phone ? "border-red-400 focus-within:ring-red-300" : "border-[#E5E5E5] focus-within:ring-[#123C91]"}`}>
              <div className="flex items-center justify-center px-3 bg-[#F3F4F6] border-l border-[#E5E5E5] text-[14px] text-[#575F69] shrink-0 font-['IBM_Plex_Sans_Arabic'] select-none">
                {phoneCode || "+--"}
              </div>
              <input
                type="tel"
                inputMode="numeric"
                value={data.phone}
                onChange={(e) => handleField("phone", e.target.value.replace(/\D/g, ""))}
                placeholder="رقم الهاتف"
                className="flex-1 min-w-0 h-full px-3 bg-transparent font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none placeholder:text-[#8C9198] text-right"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-[12px] mt-1 text-right">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="w-full">
            <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={data.password}
                onChange={(e) => handleField("password", e.target.value)}
                placeholder="••••••••"
                className={`w-full h-12 pl-10 pr-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
                  ${errors.password ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}`}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#575F69] transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-[12px] mt-1 text-right">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 px-6 bg-[#123C91] text-white rounded-xl font-medium text-[15px] disabled:opacity-60 cursor-pointer font-['IBM_Plex_Sans_Arabic']"
          >
            {saving ? "جارٍ الإضافة..." : "إضافة"}
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[15px] cursor-pointer font-['IBM_Plex_Sans_Arabic']"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSupervisorModal;