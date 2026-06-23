import { useState } from "react";

const INITIAL = {
  subject: "", stage: "", grade: "", name: "",
  maxStudents: "20", pricePerMonth: "8", description: "", zoomLink: "",
};

/**
 * Props:
 *  onClose: () => void
 *  onSuccess: (formData) => void
 */
const CreateGroupModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    onSuccess(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 text-center">إنشاء مجموعة جديدة</h2>
          <p className="text-sm text-gray-500 text-center mt-1">أدخل تفاصيل المجموعة</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المادة</label>
            <select
              name="subject" value={form.subject} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر المادة الدراسية</option>
              <option>رياضيات</option>
              <option>فيزياء</option>
              <option>كيمياء</option>
              <option>لغة عربية</option>
            </select>
          </div>

          {/* Stage + Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المرحلة الدراسية</label>
              <select
                name="stage" value={form.stage} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر المرحلة</option>
                <option>ابتدائي</option>
                <option>إعدادي</option>
                <option>ثانوي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الصف الدراسي</label>
              <select
                name="grade" value={form.grade} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الصف</option>
                <option>الأول</option>
                <option>الثاني</option>
                <option>الثالث</option>
              </select>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المجموعة</label>
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="مجموعة..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Students + Sessions/Month */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد الطلاب (نصف الفصل)</label>
              <input
                name="maxStudents" value={form.maxStudents} onChange={handleChange} type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد الحصص شهرياً</label>
              <input
                name="pricePerMonth" value={form.pricePerMonth} onChange={handleChange} type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف المجموعة (اختياري)</label>
            <input
              name="description" value={form.description} onChange={handleChange}
              placeholder="رياضيات - الصف الثالث الثانوي..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Zoom Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط المجموعة التعليمية</label>
            <input
              name="zoomLink" value={form.zoomLink} onChange={handleChange}
              placeholder="https://zoom.us/12548"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              سيستخدم هذا الرابط لجميع حصص المجموعة، تأكد من صحة الرابط وإمكانية انضمام الطالب إليه في الوقت المحدد للحصة.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#1F2937] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#374151] transition"
          >
            إنشاء المجموعة
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;