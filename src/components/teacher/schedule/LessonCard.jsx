import React from 'react';
import { Clock, Users } from 'lucide-react';

// ─── Single Lesson Card ───────────────────────────────────────────────────────
const LessonCard = ({ groupName, level, time, duration, status, actionLabel }) => {
  const isEnded = status === 'ended';

  const badge = isEnded
    ? { label: 'منتهية', cls: 'bg-[#00A63E26] text-[#00A63E]' }
    : { label: 'تبدأ الآن', cls: 'bg-[#EAF4FF]  text-[#123C91]' };

  const btnCls = isEnded
    ? 'border border-[#E5E5E5] text-[#1F2937] bg-white hover:bg-gray-50'
    : 'bg-[#123C91] text-white hover:bg-[#0f3278]';

  return (
    <div
      dir="rtl"
      className="
        bg-white border border-[#E5E5E5]
        shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)]
        rounded-2xl p-4 flex flex-col justify-between gap-3
        w-full
      "
      style={{ borderRight: '3px solid rgba(18,60,145,0.5)' }}
    >
      {/* Row 1 — title + badge */}
      <div className="flex items-center justify-between gap-2">
        <h3
          className="text-[15px] font-semibold text-[#1F2937] leading-6 text-right truncate"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {groupName}
        </h3>
        <span className={`shrink-0 px-3 py-0.5 rounded-md text-[11px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>

      </div>

      {/* Row 2 — level */}
      <div className="flex items-center justify-start gap-1.5 text-[12px] text-[#1F293780]">
        <Users size={14} className="text-[#9CA3AF]" />
        <span>{level}</span>

      </div>

      {/* Divider */}
      <div className="border-t border-[#E5E5E5]" />

      {/* Row 3 — button + time */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[#8C9198] text-[13px]">
          <Clock size={15} className="text-[#12C6B0]" />
           <span>{time}</span>
          <span>{duration} د</span>
         

        </div>

        <button
          className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-150 ${btnCls}`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

// ─── Lessons List ─────────────────────────────────────────────────────────────
const LessonsList = ({ title = 'دروس الأثنين', lessons }) => {
  const defaultLessons = [
    {
      groupName: 'مجموعة الرياضيات A',
      level: 'الصف الثالث الثانوي',
      time: '10:00 ص',
      duration: '45',
      status: 'ended',
      actionLabel: 'التسجيل',
    },
    {
      groupName: 'مجموعة الرياضيات B',
      level: 'الصف الثالث الثانوي',
      time: '12:00 ص',
      duration: '60',
      status: 'active',
      actionLabel: 'دخول',
    },
  ];

  const items = lessons ?? defaultLessons;

  return (
    <div dir="rtl" className="w-full font-['IBM_Plex_Sans_Arabic',sans-serif]">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        {/* <span className="text-[13px] text-[#8C9198]">{items.length} درس</span> */}
        {/* <h2 className="text-[15px] font-semibold text-[#1F2937]">{title}</h2> */}
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {items.map((lesson, i) => (
          <LessonCard key={i} {...lesson} />
        ))}
      </div>
    </div>
  );
};

export default LessonsList;