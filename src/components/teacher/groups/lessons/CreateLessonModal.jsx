import { useState } from "react";

const INITIAL = { title: "", date: "", time: "", duration: "60", description: "", files: false };

/**
 * Props:
 *  onClose: () => void
 *  onSuccess: (formData) => void
 */
const CreateLessonModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleFiles  = () => setForm({ ...form, files: !form.files });

  const handleSubmit = () => {
    onSuccess?.(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 text-center">إنشاء حصة جديدة</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الحصة</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="اختر المادة الدراسية"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <input
                name="date" type="date" value={form.date} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
              <input
                name="time" type="time" value={form.time} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
            <input
              name="duration" type="number" value={form.duration} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الحصة (اختياري)</label>
            <input
              name="description" value={form.description} onChange={handleChange}
              placeholder="رياضيات - الصف الثالث الثانوي..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Attachments toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-700">مرفقات الحصة</p>
              <p className="text-xs text-gray-500">أضف الملفات أو المستندات التي يحتاجها الطالب أثناء الحصة</p>
            </div>
            <button
              onClick={toggleFiles}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.files ? "bg-[#1F2937]" : "bg-gray-300"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.files ? "translate-x-0.5" : "translate-x-5"}`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#1F2937] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#374151] transition"
          >
            إنشاء حصة
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

export default CreateLessonModal;