import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, Users, Calendar, FileText, Link as LinkIcon, ArrowRight, ChevronDown } from "lucide-react";
import TeacherLayout from "../layout/TeacherLayout";

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "", stage: "", grade: "", name: "",
    maxStudents: "", sessionsPerMonth: "", description: "", zoomLink: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => navigate("/teacher/groups", { state: { showSuccessToast: true } });


  const inputClass = "w-full h-[48px] border border-[#E5E5E5] rounded-[8px] px-[16px] py-[12px] text-sm focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] appearance-none"; const labelClass = "block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2";

  const CustomSelect = ({ name, label, icon: Icon, options }) => (
    <div className="relative">
      <label className={labelClass}>{label}</label>

      <select name={name} onChange={handleChange} className={`${inputClass} text-[#8C9198]`}>
        <option value="" disabled selected>اختر من القائمة</option>
        {options?.map((opt, i) => <option key={i} className="text-gray-700">{opt}</option>)}
      </select>

      <ChevronDown className="absolute left-4 top-10.5 text-[#8C9198] pointer-events-none" size={16} />
    </div>
  );

  return (
    <TeacherLayout>
      <h2 className=" font-[IBM Plex Sans Arabic] text-2xl font-bold text-[#123C91]">إنشاء مجموعة جديدة</h2>
      <div className="mx-auto p-6 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8" dir="rtl">
        <div className="mb-8 border-b border-gray-50 pb-6">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">إنشاء مجموعة جديدة</h2>
          <p className="text-sm text-[#575F69] mt-1">قم بتعبئة بيانات المجموعة لبدء رحلة التدريس</p>
        </div>

        <div className="space-y-6">
          <CustomSelect name="subject" label="اسم المادة" icon={BookOpen} options={["رياضيات", "فيزياء"]} />

          <div className="grid grid-cols-2 gap-4">
            <CustomSelect name="stage" label="المرحلة الدراسية" icon={GraduationCap} options={["الثانوية"]} />
            <CustomSelect name="grade" label="الصف الدراسي" icon={GraduationCap} options={["الصف الثالث"]} />
          </div>

          <div>
            <label className={labelClass}> اسم المجموعة</label>
            <input name="name" onChange={handleChange} placeholder="مثال: مجموعة التميز" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}> سعة الطلاب</label>
              <input type="number" name="maxStudents" onChange={handleChange} placeholder="20" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>الحصص شهرياً</label>
              <input type="number" name="sessionsPerMonth" onChange={handleChange} placeholder="8" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}> وصف المجموعة</label>
            <textarea name="description" onChange={handleChange} placeholder="رياضيات - الصف الثانى الثانوى...." rows={3} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}> رابط الاجتماع</label>
            <input name="zoomLink" onChange={handleChange} placeholder="https://zoom.us/..." className={inputClass} />
          </div>

          <div className="flex gap-4 pt-6 mt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 h-12.5 bg-[#123C91] text-white rounded-lg font-bold text-[16px]  flex items-center justify-center gap-2 shadow-sm"
            >
              إنشاء المجموعة
              <ArrowRight size={18} />
            </button>


            <button
              onClick={() => navigate(-1)}
              className="px-40 h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg "
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateGroupPage;