import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  Calendar,
  Paperclip,
  ArrowRight,
  ChevronDown,
  X,
  FileText,
} from "lucide-react";
import TeacherLayout from "../../layout/TeacherLayout";
import { createClassroomSession } from "../../../../services/authService"; // عدّل المسار حسب مكان ملفك

const CreateLessonPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [form, setForm] = useState({
    subject: "",
    date: "",
    time: "",
    duration: "60",
    description: "",
  });
  const [attachmentsEnabled, setAttachmentsEnabled] = useState(false);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFilesSelected = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ""; // يسمح باختيار نفس الملف تاني لو اتشال بالغلط
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    if (!form.subject) return "من فضلك اختر عنوان الحصة";
    if (!form.date) return "من فضلك اختر تاريخ الحصة";
    if (!form.time) return "من فضلك اختر وقت الحصة";
    if (!form.duration || Number(form.duration) <= 0) return "من فضلك أدخل مدة صحيحة";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // ندمج التاريخ والوقت في تاريخ واحد (scheduledDate) زي ما الـ API محتاجه
      const scheduledDate = new Date(`${form.date}T${form.time}`).toISOString();

      const payload = new FormData();
      payload.append("classroom", groupId);
      payload.append("title", form.subject);
      payload.append("description", form.description || "");
      payload.append("scheduledDate", scheduledDate);
      payload.append("duration", form.duration);

      if (attachmentsEnabled) {
        files.forEach((file) => payload.append("attachments", file));
      }

      await createClassroomSession(payload);

      navigate(`/teacher/groups/${groupId}/lessons`, {
        state: { showSuccessToast: true },
      });
    } catch (err) {
      console.error("createClassroomSession failed:", err);

      const code = err?.response?.data?.message;
      const KNOWN_ERRORS = {
        SESSION_ALREADY_EXISTS:
          "يوجد حصة أخرى مجدولة لهذه المجموعة في نفس الموعد، من فضلك اختر تاريخًا أو وقتًا مختلفًا",
      };

      setError(KNOWN_ERRORS[code] || code || "حدث خطأ أثناء إنشاء الحصة، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] appearance-none placeholder:text-[#8C9198]";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  const CustomSelect = ({ name, label, options }) => (
    <div className="relative">
      <label className={labelClass}>{label}</label>
      <select
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`${inputClass} ${form[name] ? "text-[#1A1A1A]" : "text-[#8C9198]"}`}
      >
        <option value="" disabled>
          اختر المادة الدراسية
        </option>
        {options?.map((opt, i) => (
          <option key={i} value={opt} className="text-gray-700">
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute left-4 top-10.5 text-[#8C9198] pointer-events-none"
        size={16}
      />
    </div>
  );

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} بايت`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
  };

  return (
    <TeacherLayout>
      <h2 className="font-[IBM_Plex_Sans_Arabic] text-xl sm:text-2xl font-bold text-[#123C91]">
        إنشاء حصة جديدة
      </h2>

      <div
        className="mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mt-6 sm:mt-8"
        dir="rtl"
      >
        <div className="pb-5 sm:pb-6 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#1A1A1A]">بيانات الحصة الأساسية</p>
        </div>

        <div className="space-y-5 sm:space-y-6 pt-5 sm:pt-6">
          {/* عنوان الحصة */}
          <CustomSelect name="subject" label="عنوان الحصة" options={["رياضيات", "فيزياء"]} />

          {/* التاريخ + الوقت */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>التاريخ</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                />
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9198] pointer-events-none"
                  size={16}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>الوقت</label>
              <div className="relative">
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className={`${inputClass} pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                />
                <Clock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9198] pointer-events-none"
                  size={16}
                />
              </div>
            </div>
          </div>

          {/* المدة */}
          <div>
            <label className={labelClass}>المدة (بالدقائق)</label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="60 دقيقة"
              className={inputClass}
            />
          </div>

          {/* وصف الحصة */}
          <div>
            <label className={labelClass}>وصف الحصة (اختياري)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="رياضيات - الصف الثانى الثانوى...."
              rows={3}
              className={`${inputClass} h-auto py-3 resize-none`}
            />
          </div>
        </div>

        {/* مرفقات الحصة */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-2">
              <Paperclip className="text-[#1A1A1A] mt-0.5 shrink-0" size={18} />
              <div>
                <p className="text-sm font-semibold text-[#1A1A1A]">مرفقات الحصة</p>
                <p className="text-xs text-[#8C9198] mt-1">
                  أضف الملفات أو المستندات التي يحتاجها الطلاب أثناء الحصة.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={attachmentsEnabled}
              onClick={() => setAttachmentsEnabled((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                attachmentsEnabled ? "bg-[#123C91]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  attachmentsEnabled ? "-translate-x-0.5" : "-translate-x-5"
                }`}
              />
            </button>
          </div>

          {attachmentsEnabled && (
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-[#E5E5E5] rounded-lg py-6 flex flex-col items-center justify-center gap-2 text-[#8C9198] hover:border-[#123C91] hover:text-[#123C91] transition-colors"
              >
                <Paperclip size={20} />
                <span className="text-sm font-medium">اضغط لاختيار الملفات</span>
              </button>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={16} className="text-[#575F69] shrink-0" />
                        <span className="text-sm text-[#1A1A1A] truncate">{file.name}</span>
                        <span className="text-xs text-[#8C9198] shrink-0">
                          {formatSize(file.size)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-[#8C9198] hover:text-red-500 shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {/* أزرار التحكم */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-1 disabled:opacity-60"
          >
            {submitting ? "جاري الإنشاء..." : "إنشاء حصة"}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-2"
          >
            إلغاء
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateLessonPage;