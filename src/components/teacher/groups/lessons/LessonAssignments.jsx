import React from "react";
import { HiOutlineClipboardList, HiOutlineDownload } from "react-icons/hi";

const statusStyles = {
  نشط: "bg-[#E6F9EE] text-[#00A63E]",
  منتهي: "bg-[#FDECEA] text-[#D32F2F]",
};

const AssignmentItem = ({ title, deadline, submitted, total, status, onDownload }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-[#FFF8E1] flex items-center justify-center flex-shrink-0">
        <HiOutlineClipboardList size={18} className="text-[#F59E0B]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-sm font-medium text-[#1A1A1A] truncate"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            {title}
          </p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-[#8C9198] mt-0.5" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
          الموعد النهائي: {deadline} • مُسلَّم: {submitted}/{total}
        </p>
      </div>
    </div>
    <button
      onClick={onDownload}
      className="p-2 rounded-lg text-[#8C9198] hover:text-[#123C91] hover:bg-blue-50 transition-all flex-shrink-0"
    >
      <HiOutlineDownload size={18} />
    </button>
  </div>
);

const LessonAssignments = ({ assignments = [] }) => {
  const defaultAssignments = [
    { id: 1, title: "واجب التفاضل والتكامل", deadline: "18/25", submitted: 18, total: 25, status: "نشط" },
    { id: 2, title: "واجب التفاضل والتكامل", deadline: "18/25", submitted: 18, total: 25, status: "نشط" },
  ];

  const displayAssignments = assignments.length > 0 ? assignments : defaultAssignments;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-semibold text-[#1A1A1A]"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          الواجبات
        </h3>
        <button className="w-8 h-8 rounded-lg bg-[#EAF4FF] flex items-center justify-center text-[#123C91] hover:bg-[#123C91] hover:text-white transition-all text-xl leading-none">
          +
        </button>
      </div>
      <div className="space-y-2">
        {displayAssignments.map((a) => (
          <AssignmentItem key={a.id} {...a} onDownload={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default LessonAssignments;