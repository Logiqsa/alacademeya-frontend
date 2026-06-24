import React from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import TeacherLayout from '../../../components/teacher/layout/TeacherLayout';


const Schedule = () => {
  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto p-2  font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">

        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-2">
         جدول دروسك
        </h1>


        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
         متابعة دروسك القادمة وسجل دروسك السابقة.
        </p>


        <StatsCards />

        <div className="bg-white border border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
          <ScheduleFilters />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8  pb-4">
            <button className="flex items-center gap-1 text-[#1F293780] font-normal" style={{
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              fontSize: '16px',
              lineHeight: '24px'
            }}>
              <ChevronRight size={20} /> الأسبوع السابق
            </button>
            <h3
              className="font-medium text-base leading-6 text-right text-[#1F2937]  px-4 py-2 rounded-lg"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              22 يوليو 2026
            </h3>
            <button className="flex items-center gap-1 text-[#1F293780] font-normal" style={{
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              fontSize: '16px',
              lineHeight: '24px'
            }}>
              الأسبوع التالي <ChevronLeft size={20} />
            </button>
          </div>
        </div>


        <div >
          <CalendarStrip />
        </div>


        <div>
          <div className="flex justify-between items-center mb-4" dir="rtl">
       
            <h3
              className="text-[16px] leading-6 text-[#1F2937] text-right"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 600,
                letterSpacing: '0px'
              }}
            >
              دروس الاثنين
            </h3>

         
            <span
              className="text-[16px] leading-6 text-[#8C9198] text-right"
              style={{
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 400,
                letterSpacing: '0px'
              }}
            >
              2 درس
            </span>
          </div>

          <LessonsList />
        </div>
      </div>

    </TeacherLayout>
  );
};

export default Schedule;