import React from "react";
import { Clock } from "lucide-react";

const GroupCard = ({ name, teacher, status, statusType, price, done, total }) => {
  const isActive = statusType === "active";
  const percent = Math.round((done / total) * 100);

  return (
    <div
      dir="rtl"
      className="
        bg-white
        border
        border-[#E5E7EB]
        rounded-xl
        p-4
        flex-1
        min-w-[230px]
      "
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`
            px-2.5 py-0.5 rounded-md text-[11px] font-medium
            ${isActive ? "bg-[#00A63E1A] text-[#00A63E]" : "bg-[#FEEAEA] text-[#E54848]"}
          `}
        >
          {status}
        </span>
        <h4
          className="text-[#1F2937] font-semibold text-[14px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          {name}
        </h4>
      </div>

      <p className="text-[#6B7280] text-[12px] mb-3">{teacher}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[#9CA3AF] text-[11px] flex items-center gap-1">
          <Clock size={12} />
          {price}
        </span>
        <span className="text-[#9CA3AF] text-[11px]">
          {done}/{total} حصص
        </span>
      </div>

      <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#123C91] rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const GroupsCard = ({
  groups = [
    {
      name: "مجموعة الرياضيات A",
      teacher: "أ. عادل منصور",
      status: "خاصة",
      statusType: "private",
      price: "الحصة القادمة غداً",
      done: 6,
      total: 8,
    },
    {
      name: "مجموعة الفيزياء A",
      teacher: "أ. علياء محمد",
      status: "مجموعة",
      statusType: "active",
      price: "الحصة القادمة غداً",
      done: 3,
      total: 8,
    },
  ],
}) => {
  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 h-full"
    >
      <div className="mb-4">
        <h3
          className="text-[#1F2937] font-semibold text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          مجموعاتك
        </h3>
        <p
          className="text-[#9CA3AF] text-[12px] mt-1"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          المواد والمجموعات المشترك بها
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {groups.map((g, i) => (
          <GroupCard key={i} {...g} />
        ))}
      </div>
    </div>
  );
};

export default GroupsCard;