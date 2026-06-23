import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const StudentFilters = () => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-1" dir="rtl">

      <div className="relative w-full sm:flex-1 sm:min-w-50" style={{ height: '48px' }}>
        <input
          type="text"
          placeholder="بحث عن طالب..."
          className="w-full h-full pr-10 pl-4 py-3 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      <div className="relative w-full sm:w-55 lg:w-70" style={{ height: '48px' }}>
        <select className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]">
          <option>جميع الحالات</option>
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

      <div className="relative w-full sm:w-47.5 lg:w-60" style={{ height: '48px' }}>
        <select className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91]">
          <option>تاريخ الانضمام </option>
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
      </div>

    </div>
  );
};

export default StudentFilters;