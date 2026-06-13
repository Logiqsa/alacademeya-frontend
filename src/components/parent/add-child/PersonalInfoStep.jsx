const PersonalInfoStep = ({ onNext }) => (
  <div className="space-y-6 text-right">
    <h2 className="text-xl font-bold text-[#1F2937]">المعلومات الشخصية</h2>
    <input className="w-full p-4 border rounded-xl" placeholder="اسم الابن رباعي" />
    <input className="w-full p-4 border rounded-xl" type="date" />
    <button onClick={onNext} className="w-full bg-[#123C91] text-white py-3 rounded-xl">التالي</button>
  </div>
);
export default PersonalInfoStep;