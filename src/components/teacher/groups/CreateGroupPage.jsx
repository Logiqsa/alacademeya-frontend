import { useState } from "react";

const CreateGroupPage = () => {
  const [form, setForm] = useState({
    subject: "", stage: "", grade: "", name: "",
    maxStudents: "", sessionsPerMonth: "", description: "", zoomLink: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mt-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1F2937]">إنشاء مجموعة جديدة</h2>
        <p className="text-sm text-gray-500 mt-1">أدخل تفاصيل المجموعة التعليمية</p>
      </div>

      {/* Form Grid */}
      <div className="space-y-6">
        {/* Row 1 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">اسم المادة</label>
          <select name="subject" value={form.subject} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#123C91] outline-none">
            <option>اختر المادة الدراسية</option>
            <option>رياضيات</option>
          </select>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المرحلة الدراسية</label>
            <select name="stage" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none">
              <option>اختر المرحلة</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الصف الدراسي</label>
            <select name="grade" onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none">
              <option>اختر الصف</option>
            </select>
          </div>
        </div>

        {/* ... (بقية الحقول بنفس التنسيق) */}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-50">
          <button className="w-[160px] h-[48px] bg-[#123C91] text-white rounded-[8px] font-['Tajawal'] font-medium text-[16px]">
            إنشاء المجموعة
          </button>
          <button className="px-8 py-3 text-gray-600 font-medium hover:text-gray-800">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;