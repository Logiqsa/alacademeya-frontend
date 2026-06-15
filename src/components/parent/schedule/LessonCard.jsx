import React from 'react';
import { Clock, User } from 'lucide-react';

const LessonCard = ({ title, teacher, time, duration, status, studentName }) => {
  const statusStyles = {
    completed: { text: "مكتمل", bg: "bg-[#E6F7F0]", color: "text-[#10B981]" },
    upcoming: { text: "قادم", bg: "bg-[#EBF1FF]", color: "text-[#123C91]" },
  };

  const currentStatus = statusStyles[status] || statusStyles.upcoming;

  return (
    <div className="bg-white p-4 rounded-2xl border border-[#F3F4F6] flex items-center justify-between mb-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`px-3 py-1 rounded-lg text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
          {currentStatus.text}
        </div>
        <div className="text-right">
          <h4 className="font-bold text-[#1F2937] mb-1">{title}</h4>
          <div className="flex items-center gap-3 text-[#8C9198] text-xs">
            <span className="flex items-center gap-1"><User size={14}/> {teacher}</span>
            <span className="flex items-center gap-1"><Clock size={14}/> {duration} دقيقة</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <div className="bg-[#F9FAFA] px-4 py-1 rounded-full text-xs text-[#575F69] border border-[#E5E5E5]">
        {studentName}
      </div>
    </div>
  );
};

export default LessonCard;