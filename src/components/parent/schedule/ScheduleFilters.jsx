import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const ScheduleFilters = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6" dir="rtl">
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
        <input 
          type="text" 
          placeholder="ابحث عن مادة أو معلم..." 
          className="w-full pr-10 pl-4 py-2 bg-[#F9FAFA] border border-[#E5E5E5] rounded-xl text-sm outline-none focus:border-[#123C91]"
        />
      </div>
      <select className="bg-[#F9FAFA] border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm text-[#575F69] outline-none cursor-pointer">
        <option>جميع الأبناء</option>
      </select>
      <select className="bg-[#F9FAFA] border border-[#E5E5E5] rounded-xl px-4 py-2 text-sm text-[#575F69] outline-none cursor-pointer">
        <option>جميع المواد</option>
      </select>
    </div>
  );
};

export default ScheduleFilters;