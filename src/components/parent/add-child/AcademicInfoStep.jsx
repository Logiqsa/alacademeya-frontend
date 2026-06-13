const AcademicInfoStep = ({ onNext, onBack }) => (
  <div className="space-y-6 text-right">
    <h2 className="text-xl font-bold text-[#1F2937]">المعلومات الأكاديمية</h2>
    <select className="w-full p-4 border rounded-xl"><option>اختر المدرسة</option></select>
    <div className="flex gap-4">
      <button onClick={onBack} className="w-1/3 py-3 border rounded-xl">السابق</button>
      <button onClick={onNext} className="w-2/3 bg-[#123C91] text-white py-3 rounded-xl">التالي</button>
    </div>
  </div>
);
export default AcademicInfoStep;