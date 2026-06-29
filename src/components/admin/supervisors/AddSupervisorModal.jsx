import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

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

const AddSupervisorModal = ({ open, onClose }) => {
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({ name: "", email: "", phone: "", password: "" });

  if (!open) return null;

  const handleField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!data.name.trim())     next.name     = "الاسم بالكامل مطلوب";
    if (!data.email.trim())    next.email    = "البريد الإلكتروني مطلوب";
    if (!data.phone.trim())    next.phone    = "رقم الهاتف مطلوب";
    if (!data.password.trim()) next.password = "كلمة المرور مطلوبة";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setData({ name: "", email: "", phone: "", password: "" });
      onClose();
    }, 800);
  };

  const handleClose = () => {
    setData({ name: "", email: "", phone: "", password: "" });
    setErrors({});
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-2xl w-full max-w-135 mx-4 p-6 shadow-xl"
        dir="rtl"
      >
        {/* Header */}
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

        {/* Fields */}
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

          {/* Phone with prefix */}
          <div className="w-full">
            <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
              رقم الهاتف
            </label>
            <div className="flex gap-2">
              <div className="flex items-center justify-center h-12 px-4 border border-[#E5E5E5] rounded-lg bg-[#F3F4F6] text-[14px] text-[#575F69] shrink-0 font-['IBM_Plex_Sans_Arabic']">
                ‎+20
              </div>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => handleField("phone", e.target.value)}
                placeholder="رقم الهاتف"
                className={`flex-1 h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
                  ${errors.phone ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-[12px] mt-1 text-right">{errors.phone}</p>
            )}
          </div>

          {/* Password with toggle */}
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

        {/* Footer */}
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