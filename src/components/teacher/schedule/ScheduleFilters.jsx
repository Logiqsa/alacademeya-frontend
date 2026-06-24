import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const ScheduleFilters = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-1" dir="rtl">

      <div className="relative flex-1 min-w-50" style={{ height: '48px' }}>
        <input
          type="text"
          placeholder="ابحث عن مادة أو معلم..."
          className="w-full h-full pr-10 pl-4 py-3  bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2  -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

 
      <div className="relative" style={{ width: '280px', height: '48px' }}>
        <select className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]">
          <option>جميع المجموعات</option>
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      {/* <div className="relative" style={{ width: '240px', height: '48px' }}>
        <select className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]">
          <option>جميع المواد</option>
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div> */}

    </div>
  );
};

export default ScheduleFilters;