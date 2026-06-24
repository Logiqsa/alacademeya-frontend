import React from 'react';
import { Clock, BookOpen} from 'lucide-react';

const LessonCard = ({ title, teacher, duration, time, status, studentName }) => {
  const isCompleted = status === 'completed';

  return (
    <div
      className="bg-white border mt-2 border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] p-4 flex flex-col justify-between"
      dir="rtl"
      style={{
        width: '320px',
        height: '145px',
        borderRadius: '16px',
        borderRight: '3px solid rgba(18, 60, 145, 0.5)'
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3
          className="text-right text-[16px] leading-6 text-[#1F2937] font-semibold"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {title}
        </h3>

        <span className={`px-3 py-1 rounded-md text-[12px] font-medium ${isCompleted ? 'bg-[#00A63E26] text-[#00A63E]' : 'bg-[#EAF4FF] text-[#123C91]'}`}>
          {isCompleted ? 'مكتمل' : 'قادم'}
        </span>
      </div>


      <div
        className="flex items-center text-right text-[12px] leading-4 text-[#1F293780] mb-3"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <BookOpen size={16} className="ml-2 text-[#9CA3AF]" />
        <span>{teacher}</span>
      </div>


      <div className="border-t border-[#E5E5E5] mb-3"></div>


      <div className="flex justify-between items-center">
        <div className="flex items-center text-[#8C9198] text-[14px] gap-2">
          <Clock size={16} className="text-[#12C6B0]" />
          <span>{time}</span>
          <span className="text-[#8C9198]">•</span>
          <span>{duration} د</span>
        </div>

        <span className="bg-[#E5E5E5] text-[#1F2937BF] text-[12px] px-2 py-1 rounded-md font-medium">{studentName}</span>

      </div>
    </div>
  );
};

const LessonsList = () => {
  return (
    <div className="max-w-212.5" dir="rtl " >

      <div className="flex gap-4">
        <LessonCard
          title="اللغة الفرنسية"
          teacher="أ. علي محمد"
          duration="45"
          time="10:00 ص"
          status="completed"
          studentName="سلمى"
        />

        <LessonCard
          title="الرياضيات"
          teacher="أ. فاطمة"
          duration="60"
          time="8:00 م"
          status="upcoming"
          studentName="أحمد"
        />

      </div>
    </div>
  );
};

export default LessonsList;