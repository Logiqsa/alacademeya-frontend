import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: "الدروس القادمة",
      value: "3",
      icon: <Calendar className="text-[#10B981]" />,
      bgColor: "bg-green-50"
    },
   
    {
      title: "الدروس المكتملة",
      value: "3",
      icon: <CheckCircle className="text-[#123C91]" />,
      bgColor: "bg-blue-50"
    },

    {
      title: "إجمالي الساعات",
      value: "64",
      icon: <Clock className="text-[#10B981]" />,
      bgColor: "bg-green-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} c className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
          <div className={`p-3 rounded-lg shrink-0 ${stat.bgColor} `}>

            {stat.icon}
          </div>
          <div className="text-right flex-1">
            <h3 className="text-xl font-bold text-[#1F2937]">{stat.value}</h3>
            <p className="text-[#575F69] ttext-sm mt-1 font-medium">{stat.title}</p>

          </div>

        </div>
      ))}
    </div>
  );
};

export default StatsCards;