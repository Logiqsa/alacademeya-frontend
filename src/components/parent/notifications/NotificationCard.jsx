
import React from "react";
import { Eye, EyeOff, GraduationCap, Settings } from "lucide-react";

const NotificationCard = ({
  title,
  description,
  time,
  type,
  isRead,
  onToggleRead,
}) => {
  const isAcademic = type === "academic";
  const Icon = isAcademic ? GraduationCap : Settings;

  return (
    <div
      dir="rtl"
      className={`border border-[#E5E5E5] rounded-xl p-4 transition-all ${
        isRead ? "bg-white" : "bg-[#EAF4FF]"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isAcademic
              ? "bg-[#E1F5EE] text-[#0F6E56]"
              : "bg-[#E6F1FB] text-[#185FA5]"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] sm:text-[16px] font-medium text-[#1F2937]">
            {title}
          </h3>
          <p className="mt-2 text-[13px] sm:text-[14px] leading-6 text-[#1F2937BF]">
            {description}
          </p>
          <span className="block mt-2 text-[12px] text-[#1F2937BF]">
            {time}
          </span>
        </div>

        <button
          onClick={onToggleRead}
          className="flex items-center justify-center sm:justify-start gap-1 text-[13px] sm:text-[14px] text-[#1F2937] hover:text-[#123C91] transition-colors self-start sm:self-center"
        >
          {isRead ? <EyeOff size={15} /> : <Eye size={15} />}
          <span>{isRead ? "وضع علامة كغير مقروءة" : "وضع علامة كمقروءة"}</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;