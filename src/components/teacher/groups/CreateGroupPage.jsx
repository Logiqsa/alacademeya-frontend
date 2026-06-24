import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, ArrowRight, ChevronDown } from "lucide-react";
import TeacherLayout from "../layout/TeacherLayout";

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    stage: "",
    grade: "",
    name: "",
    maxStudents: "",
    sessionsPerMonth: "",
    description: "",
    zoomLink: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => navigate("/teacher/groups", { state: { showSuccessToast: true } });

  const inputClass =
    "w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] appearance-none placeholder:text-[#8C9198]";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2";

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
          اختر من القائمة
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

  return (
    <TeacherLayout>
      <h2 className="font-[IBM_Plex_Sans_Arabic] text-xl sm:text-2xl font-bold text-[#123C91]">
        إنشاء مجموعة جديدة
      </h2>

      <div
        className="mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mt-6 sm:mt-8"
        dir="rtl"
      >
        <div className="pb-5 sm:pb-6 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#1A1A1A]">قم بتعبئة بيانات المجموعة لبدء رحلة التدريس</p>
        </div>

        <div className="space-y-5 sm:space-y-6 pt-5 sm:pt-6">
          <CustomSelect name="subject" label="اسم المادة" options={["رياضيات", "فيزياء"]} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomSelect name="stage" label="المرحلة الدراسية" options={["الثانوية"]} />
            <CustomSelect name="grade" label="الصف الدراسي" options={["الصف الثالث"]} />
          </div>

          <div>
            <label className={labelClass}>اسم المجموعة</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="مثال: مجموعة التميز"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>سعة الطلاب</label>
              <input
                type="number"
                name="maxStudents"
                value={form.maxStudents}
                onChange={handleChange}
                placeholder="20"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>الحصص شهرياً</label>
              <input
                type="number"
                name="sessionsPerMonth"
                value={form.sessionsPerMonth}
                onChange={handleChange}
                placeholder="8"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>وصف المجموعة</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="رياضيات - الصف الثانى الثانوى...."
              rows={3}
              className={`${inputClass} h-auto py-3 resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>رابط الاجتماع</label>
            <input
              name="zoomLink"
              value={form.zoomLink}
              onChange={handleChange}
              placeholder="https://zoom.us/..."
              className={inputClass}
            />
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2">
          <button
            onClick={handleSubmit}
            className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-1"
          >
            إنشاء المجموعة
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-2"
          >
            إلغاء
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateGroupPage;