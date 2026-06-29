import { useState, useRef } from "react";
import { X, ChevronDown, CloudUpload } from "lucide-react";

// ─── Shared field components ──────────────────────────────────────────────────
const InputField = ({ label, value, onChange, placeholder, error }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198] text-right
        ${error ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}`}
    />
    {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder, error }) => (
  <div className="w-full">
    <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-12 px-4 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 appearance-none transition-all cursor-pointer
          ${!value ? "text-[#8C9198]" : "text-[#1F2937]"}
          ${error ? "border-red-400 focus:ring-red-300" : "border-[#E5E5E5] focus:ring-[#123C91]"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
        <ChevronDown size={16} />
      </div>
    </div>
    {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
  </div>
);

// ─── File Dropzone ────────────────────────────────────────────────────────────
const FileDropzone = ({ file, onFile, error }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="w-full">
      <label className="block font-['Tajawal'] font-medium text-[15px] text-right text-[#1F2937] pb-1">
        ملف التسجيل
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 py-8 px-4
          ${dragging ? "border-[#123C91] bg-[#EAF4FF]" : error ? "border-red-300 bg-red-50" : "border-[#E5E5E5] bg-[#F9FAFA]"}
          hover:border-[#123C91] hover:bg-[#EAF4FF]`}
      >
        <CloudUpload size={36} className="text-[#9CA3AF]" strokeWidth={1.5} />
        {file ? (
          <p className="text-[13px] font-medium text-[#123C91] text-center font-['IBM_Plex_Sans_Arabic']">
            {file.name}
          </p>
        ) : (
          <>
            <p className="text-[13px] text-[#575F69] text-center font-['IBM_Plex_Sans_Arabic']">
              اسحب الملفات هنا أو اضغط للاختيار
            </p>
            <p className="text-[12px] text-[#9CA3AF] text-center font-['IBM_Plex_Sans_Arabic']">
              PDF, DOCX, JPG, PPT
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.jpg,.jpeg,.png,.ppt,.pptx,.mp4,.mov"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
      </div>
      {error && <p className="text-red-500 text-[12px] mt-1 text-right">{error}</p>}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
const LESSON_OPTIONS = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة"];

const AddRecordingModal = ({ open, onClose, groupOptions = [] }) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({ title: "", group: "", lesson: "", file: null });

  if (!open) return null;

  const handleField = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }));
  };

  const validate = () => {
    const next = {};
    if (!data.title.trim()) next.title  = "اسم التسجيل مطلوب";
    if (!data.group)        next.group  = "المجموعة مطلوبة";
    if (!data.lesson)       next.lesson = "الحصة مطلوبة";
    if (!data.file)         next.file   = "ملف التسجيل مطلوب";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setData({ title: "", group: "", lesson: "", file: null });
      onClose();
    }, 800);
  };

  const handleClose = () => {
    setData({ title: "", group: "", lesson: "", file: null });
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
        {/* Drag handle — mobile only */}
        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[#E5E5E5]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] text-[#1F2937]">
            إضافة تسجيل جديد
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-1">
          <InputField
            label="اسم التسجيل"
            value={data.title}
            onChange={(v) => handleField("title", v)}
            placeholder="ادخل اسم التسجيل"
            error={errors.title}
          />

          <SelectField
            label="المجموعة"
            value={data.group}
            onChange={(v) => handleField("group", v)}
            options={groupOptions}
            placeholder="اختر الطالب"
            error={errors.group}
          />

          <SelectField
            label="الحصة"
            value={data.lesson}
            onChange={(v) => handleField("lesson", v)}
            options={LESSON_OPTIONS}
            placeholder="اختر الباقة"
            error={errors.lesson}
          />

          <FileDropzone
            file={data.file}
            onFile={(f) => handleField("file", f)}
            error={errors.file}
          />
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

export default AddRecordingModal;