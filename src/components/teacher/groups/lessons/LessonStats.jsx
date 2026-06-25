import React from "react";
import { HiOutlineUsers, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";

const StatCard = ({ icon, value, label, iconBg, iconColor }) => (
  <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4 justify-between" dir="rtl">
    <div className="text-right">
      <div className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: "Tajawal, sans-serif" }}>
        {value}
      </div>
      <div className="text-sm text-[#8C9198] mt-0.5" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
        {label}
      </div>
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
      <span className={iconColor}>{icon}</span>
    </div>
  </div>
);

const LessonStats = ({ totalStudents = 22, attendance = 18, absence = 4 }) => (
  <div className="flex flex-col sm:flex-row gap-3 w-full">
    <StatCard
      icon={<HiOutlineUsers size={22} />}
      value={totalStudents}
      label="إجمالي الطلاب"
      iconBg="bg-[#EAF4FF]"
      iconColor="text-[#123C91]"
    />
    <StatCard
      icon={<HiOutlineCheckCircle size={22} />}
      value={attendance}
      label="الحضور"
      iconBg="bg-[#E6F9EE]"
      iconColor="text-[#00A63E]"
    />
    <StatCard
      icon={<HiOutlineXCircle size={22} />}
      value={absence}
      label="الغياب"
      iconBg="bg-[#FDECEA]"
      iconColor="text-[#D32F2F]"
    />
  </div>
);

export default LessonStats;