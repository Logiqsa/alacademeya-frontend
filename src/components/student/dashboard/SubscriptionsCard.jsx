import React from "react";

const SubscriptionsCard = ({
  remainingLessons = 7,
  completedLessons = 9,
  totalLessons = 16,
  groups = [
    { name: "مجموعة الرياضيات A", done: 5, total: 8 },
    { name: "مجموعة الفيزياء A", done: 3, total: 8 },
    { name: "مجموعة الفيزياء A", done: 3, total: 8 },
  ],
}) => {
  const miniStats = [
    { label: "حصص متبقية", value: remainingLessons },
    { label: "حصص مكتملة", value: completedLessons },
    { label: "إجمالي الحصص", value: totalLessons },
  ];

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[#1F2937] font-semibold text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          الاشتراكات
        </h3>

        <select
          className="
            text-[12px]
            text-[#6B7280]
            border
            border-[#E5E7EB]
            rounded-lg
            px-2
            py-1
            outline-none
            cursor-pointer
          "
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          defaultValue="month"
        >
          <option value="month">الشهر الحالي</option>
          <option value="lastMonth">الشهر الماضي</option>
        </select>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {miniStats.map((s) => (
          <div
            key={s.label}
            className="bg-[#F9FAFB] rounded-lg py-3 px-2 text-center"
          >
            <p className="text-[#1F2937] font-bold text-[18px]">{s.value}</p>
            <p
              className="text-[#6B7280] text-[11px] mt-1"
              style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress list */}
      <div className="flex flex-col gap-4">
        {groups.map((g, i) => {
          const percent = Math.round((g.done / g.total) * 100);
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#9CA3AF] text-[12px]">
                  {g.done}/{g.total}
                </span>
                <span
                  className="text-[#1F2937] text-[13px] font-medium"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {g.name}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#12C6B0] rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionsCard;