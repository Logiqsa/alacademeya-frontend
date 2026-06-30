import React from "react";
import { Clock, GraduationCap } from "lucide-react";

const GroupCard = ({ name, teacher, status, statusType, nextLesson, done, total, remaining }) => {
  const isGroup = statusType === "group";

  return (
    <div
      dir="rtl"
      className="
        bg-white border border-[#E5E7EB] rounded-xl
        p-3.5 sm:p-4
        min-w-0
        flex flex-col
      "
    >
      {/* Badge */}
      <div className="mb-3">
        <span
          className={`
            inline-block px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-[12px] font-medium
            ${isGroup ? "bg-[#12C6B01A] text-[#12C6B0]" : "bg-[#EAF4FF] text-[#123C91]"}
          `}
        >
          {status}
        </span>
      </div>

      {/* Title */}
      <h4
        className="text-[#1F2937] font-semibold text-[14px] sm:text-[15px] mb-1 truncate"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        title={name}
      >
        {name}
      </h4>

      {/* Teacher */}
      <p
        className="text-[#123C91] text-[12.5px] sm:text-[13px] mb-3 truncate"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        أ/ {teacher}
      </p>

      <div className="border-t border-[#F1F1F1] mb-3" />

      {/* Next lesson */}
      <div className="flex items-center justify-start gap-1.5 text-[#9CA3AF] text-[11.5px] sm:text-[12px] mb-3">
        <Clock size={13} className="shrink-0" />
        <span className="truncate">{nextLesson}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto flex-wrap">
        <span className="flex items-center gap-1 text-[#6B7280] text-[11.5px] sm:text-[12px] shrink-0">
          <GraduationCap size={14} className="text-[#9CA3AF]" />
          {done}/{total} حصص
        </span>
        <span
          className={`
            px-2 sm:px-2.5 py-1 rounded-md text-[10.5px] sm:text-[11px] font-medium whitespace-nowrap
            ${remaining <= 2 ? "bg-[#FEEAEA] text-[#E54848]" : "bg-[#00A63E1A] text-[#00A63E]"}
          `}
        >
          متبقى {remaining} حصص
        </span>
      </div>
    </div>
  );
};

const GroupsCard = ({
  groups = [
    {
      name: "مجموعة الفيزياء A",
      teacher: "علياء محمد",
      status: "مجموعة",
      statusType: "group",
      nextLesson: "الحصة القادمة غداً",
      done: 3,
      total: 8,
      remaining: 5,
    },
    {
      name: "مجموعة الرياضيات A",
      teacher: "عادل منصور",
      status: "خاصة",
      statusType: "private",
      nextLesson: "الحصة القادمة غداً",
      done: 6,
      total: 8,
      remaining: 2,
    },
  ],
}) => {
  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5 h-full"
    >
      <div className="mb-4">
        <h3
          className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          مجموعاتك
        </h3>
        <p
          className="text-[#9CA3AF] text-[11.5px] sm:text-[12px] mt-1"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          المواد والمجموعات المشترك بها
        </p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
        {groups.map((g, i) => (
          <GroupCard key={i} {...g} />
        ))}
      </div>
    </div>
  );
};

export default GroupsCard;