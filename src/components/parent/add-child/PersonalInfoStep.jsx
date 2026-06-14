import React, { useState } from 'react'; // تأكد من استيراد useState
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PersonalInfoStep = ({ onNext }) => {
  const navigate = useNavigate();

  const [isFocused, setIsFocused] = useState(false);
  const [startDate, setStartDate] = useState(null);

  const handleCancel = () => {
    navigate('/parent-dashboard');
  };
  return (
    <div dir="rtl" className="w-full p-2">
      <div className="mb-8">
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[20px] leading-8 text-[#1F2937] text-right mb-2">
          المعلومات الشخصية
        </h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[16px] leading-6 text-[#575F69] text-right">
          يرجى إدخال البيانات الأساسية للطالب.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            className="block font-['Tajawal'] font-medium text-[17px] leading-4 text-right text-[#1F2937] p-2 rounded-md  w-fit"
          >
            الاسم بالكامل
          </label>
          <input
            type="text"
            className="
              w-full h-12 px-4 py-4 
              border border-[#E5E5E5] rounded-lg 
              bg-[#F9FAFA] 
              font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-right
              focus:outline-none focus:ring-2 focus:ring-[#123C91] 
              transition-all 
              placeholder:text-[#1F293780]
            "
            placeholder="ادخل اسمك الكامل"
          />
        </div>


        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] leading-4 text-right text-[#1F2937] p-2 rounded-md w-fit">
            تاريخ الميلاد
          </label>

          <div className="relative w-full">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="يوم / شهر / سنة"
              dateFormat="dd/MM/yyyy"
              wrapperClassName="w-full"
              className="w-full h-12 pr-12 pl-4 py-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#123C91]"
              calendarClassName="dark-calendar"
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-['Tajawal'] font-medium text-[17px] leading-4 text-right text-[#1F2937] p-2 rounded-md w-fit">
            الدولة
          </label>

          <div className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            <select
              className="
              w-full h-12 px-4 py-3
              border border-[#E5E5E5] rounded-lg 
              bg-[#F9FAFA] 
              font-['IBM_Plex_Sans_Arabic'] font-normal text-[14px] leading-4 text-right
              focus:outline-none focus:ring-2 focus:ring-[#123C91] 
              transition-all appearance-none
              text-[#1F2937]
            "
            >
              <option value="" disabled selected className="text-[#1F293780]">
                اختر الدولة
              </option>
              <option value="sa">السعودية</option>
              <option value="eg">مصر</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-10">
        <button
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer"
        >
          التالي
        </button>

        <button
          onClick={handleCancel} 
          className="flex-1 py-3 px-6 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer"
        >
          إلغاء
        </button>
        
      </div>
    </div>
  );
};

export default PersonalInfoStep;