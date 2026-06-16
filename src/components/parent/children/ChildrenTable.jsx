import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

const ChildrenTable = () => {
  const childrenData = [
    { 
      id: 1, 
      name: 'محمد أحمد', 
      initial: 'م', 
      grade: 'ثالث ثانوي', 
      gradeLevel: 'A', 
      attendance: '85%', 
      performance: '96%', 
      activeLessons: 5, 
      completedLessons: 24, 
      status: 'active', 
      label: 'ساري حتى 12/2026' 
    },
    { 
      id: 2, 
      name: 'سلمى أحمد', 
      initial: 'س', 
      grade: 'ثالث ثانوي', 
      gradeLevel: 'A+', 
      attendance: '85%', 
      performance: '96%', 
      activeLessons: 5, 
      completedLessons: 24, 
      status: 'expiring', 
      label: 'ينتهي خلال 3 أيام' 
    },
  ];

  return (
    <div className="w-full bg-white border border-[#E5E5E5] rounded-[8px] overflow-hidden shadow-sm" dir="rtl">
      <table className="w-full text-right border-collapse">
        {/* رأس الجدول */}
        <thead className="bg-[#F9FAFA] border-b border-[#E5E5E5]">
          <tr>
            {['الابن', 'التقدير', 'نسبة الحضور', 'الأداء العام', 'الدروس النشطة', 'الدروس المكتملة', 'الاشتراك', 'الإجراءات'].map((h) => (
              <th key={h} className="px-6 py-4 text-[#575F69] font-medium text-[14px] whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* جسم الجدول */}
        <tbody>
          {childrenData.map((child) => (
            <tr key={child.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFA] transition-colors">
              {/* الابن */}
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#123C91] text-white flex items-center justify-center font-bold text-lg">
                  {child.initial}
                </div>
                <div>
                  <p className="font-['Tajawal'] font-medium text-[#1F2937] text-[16px]">{child.name}</p>
                  <p className="text-[12px] text-[#6B7280]">{child.grade}</p>
                </div>
              </td>
              
              {/* البيانات */}
              <td className="px-6 font-bold text-[#00A63E] text-[16px]">{child.gradeLevel}</td>
              <td className="px-6 text-[#575F69] text-[16px]">{child.attendance}</td>
              <td className="px-6 text-[#575F69] text-[16px]">{child.performance}</td>
              <td className="px-6 text-[#575F69] text-[16px]">{child.activeLessons}</td>
              <td className="px-6 text-[#575F69] text-[16px]">{child.completedLessons}</td>
              
              {/* الاشتراك */}
              <td className="px-6">
                <span className={`px-4 py-1.5 rounded-full text-[12px] font-medium inline-block whitespace-nowrap ${
                  child.status === 'active' 
                    ? 'bg-[#00A63E1A] text-[#00A63E]' 
                    : 'bg-[#FFEBEE] text-[#D32F2F]'
                }`}>
                  {child.label}
                </span>
              </td>
              
              {/* الإجراءات */}
              <td className="px-6">
                <div className="flex gap-4 text-[#575F69]">
                  <button className="hover:text-[#123C91] transition-colors"><Eye size={18} /></button>
                  <button className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChildrenTable;