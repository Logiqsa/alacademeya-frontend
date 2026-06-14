import React, { useState } from 'react';

const AcademicInfoStep = ({ onNext, onBack }) => {
  const [selectedSubjects, setSelectedSubjects] = useState(['الفيزياء', 'الحاسب الآلي', 'الدراسات الاجتماعية', 'اللغة الإنجليزية', 'اللغة العربية']);
  const allSubjects = ['الفيزياء', 'الحاسب الآلي', 'الدراسات الاجتماعية', 'اللغة الإنجليزية', 'اللغة العربية'];

  const toggleSubject = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };



  const CustomSelect = ({ label }) => (
    <div className="relative w-full">
      <label className="block font-['Tajawal'] font-medium text-[17px] leading-4 text-right text-[#1F2937] p-2 rounded-md w-fit">
        {label}
      </label>
      <div className="relative">
        <select
          defaultValue=""
          className="w-full h-12 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#123C91] appearance-none cursor-pointer invalid:text-[#8C9198] text-[#1F2937]"
        >
          <option value="" disabled className="text-[#8C9198]">اختر {label}</option>
          <option value="1">خيار 1</option>
        </select>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div dir="rtl" className="w-full p-2 space-y-6">
      <div>
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] text-[#1F2937] text-right mb-2">المعلومات الأكاديمية</h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[16px]">يرجى إدخال المعلومات الدراسية للطالب.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomSelect label="المرحلة الدراسية" />
        <CustomSelect label="الصف الدراسي" />
        <div className="md:col-span-2"><CustomSelect label="المنهج الدراسي" /></div>
        <div className="md:col-span-2"><CustomSelect label="لغة التعلم المفضلة" /></div>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-[#1F2937]">المواد المفضلة</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSubjects.map((sub) => (
            <span key={sub} className="bg-[#EFF6FF] text-[#1E4FAE] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              {sub}
              <button onClick={() => toggleSubject(sub)} className="hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="w-full h-12 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] placeholder:text-[#8C9198] focus:outline-none focus:ring-2 focus:ring-[#123C91]"
          placeholder="ابدأ بكتابة اسم المادة..."
        />
      </div>

      <div className="flex gap-4 mt-10">
        <button onClick={onNext} className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer">التالي</button>
        <button onClick={onBack} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl font-medium text-[#123C91] cursor-pointer">السابق</button>

      </div>
    </div>
  );
};

export default AcademicInfoStep;