import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import ParentLayout from '../../components/parent/layout/ParentLayout';
import StatsCards from '../../components/parent/schedule/StatsCards';
import ScheduleFilters from '../../components/parent/schedule/ScheduleFilters';
import LessonCard from '../../components/parent/schedule/LessonCard';

const LessonsSchedule = () => {
  return (
    <ParentLayout>
      <div className="max-w-7xl mx-auto p-6 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
        <h1 className="text-2xl font-bold text-[#123C91] mb-8">جدول دروس الأبناء</h1>
        
        <StatsCards />

        <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-sm">
          <ScheduleFilters />

          {/* ننتقل هنا للجزء الخاص بالتقويم الأسبوعي */}
          <div className="flex items-center justify-between mb-8 border-b pb-4">
             <button className="flex items-center gap-1 text-[#123C91] font-medium"><ChevronRight size={20}/> الأسبوع السابق</button>
             <h3 className="text-lg font-bold text-[#1F2937]">22 يوليو 2026</h3>
             <button className="flex items-center gap-1 text-[#123C91] font-medium">الأسبوع التالي <ChevronLeft size={20}/></button>
          </div>

          {/* أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-2 mb-10">
            {['السبت 21', 'الأحد 22', 'الاثنين 23', 'الثلاثاء 24', 'الأربعاء 25', 'الخميس 26', 'الجمعة 27'].map((day, i) => (
              <div key={i} className={`p-4 rounded-2xl text-center cursor-pointer transition-all ${i === 1 ? 'bg-[#123C91] text-white' : 'hover:bg-gray-50 text-[#575F69]'}`}>
                <p className="text-xs mb-1">{day.split(' ')[0]}</p>
                <p className="font-bold">{day.split(' ')[1]}</p>
              </div>
            ))}
          </div>

          {/* قائمة الدروس */}
          <div>
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#8C9198]">2 درس</span>
                <h3 className="font-bold text-[#1F2937]">دروس الاثنين</h3>
            </div>
            
            <LessonCard 
              title="اللغة الفرنسية" 
              teacher="أماني محمد" 
              duration="45" 
              time="10:00 ص" 
              status="completed" 
              studentName="أحمد"
            />
            <LessonCard 
              title="الرياضيات" 
              teacher="أحمد" 
              duration="60" 
              time="8:00 م" 
              status="upcoming" 
              studentName="أحمد"
            />
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default LessonsSchedule;