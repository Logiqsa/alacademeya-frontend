import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    { title: "الدروس القادمة", value: "3", icon: <Calendar className="text-[#123C91]" />, bgColor: "bg-blue-50" },
    { title: "الدروس المكتملة", value: "3", icon: <CheckCircle className="text-[#10B981]" />, bgColor: "bg-green-50" },
    { title: "إجمالي الساعات", value: "64", icon: <Clock className="text-[#123C91]" />, bgColor: "bg-blue-50" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border border-[#F3F4F6] flex items-center justify-between shadow-sm">
          <div className="text-right">
            <p className="text-[#575F69] text-sm mb-1">{stat.title}</p>
            <h3 className="text-2xl font-bold text-[#1F2937]">{stat.value}</h3>
          </div>
          <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;