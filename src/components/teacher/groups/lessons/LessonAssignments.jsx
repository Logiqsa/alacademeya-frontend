import React from "react";
import { HiOutlineClipboardList, HiOutlineDownload } from "react-icons/hi";

const statusStyles = {
  نشط: "bg-[#E6F9EE] text-[#00A63E]",
  منتهي: "bg-[#FDECEA] text-[#D32F2F]",
};

const AssignmentItem = ({ title, deadline, submitted, total, status, onDownload }) => (
  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[#E5E5E5] bg-white hover:border-gray-300 transition-all">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <HiOutlineClipboardList size={20} className="text-[#123C91]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-[14px] font-medium text-[#1F2937] truncate mb-2"
            style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "16px" }}
          >
            {title}
          </p>
          <span 
            className={`text-[10px] font-medium mb-2 px-2 py-0.5 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}
            style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
          >
            {status}
          </span>
        </div>
        <p 
          className="text-[12px] text-[#575F69] mt-1" 
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "16px" }}
        >
          الموعد النهائي: {deadline} • مُسلَّم: {submitted}/{total}
        </p>
      </div>
    </div>
    <button
      onClick={onDownload}
      className="p-2 rounded-lg text-[#1F2937] hover:bg-gray-100 transition-all shrink-0"
    >
      <HiOutlineDownload size={20} />
    </button>
  </div>
);

const LessonAssignments = ({ assignments = [] }) => {
  const defaultAssignments = [
    { id: 1, title: "واجب التفاضل والتكامل", deadline: "25/18", submitted: 18, total: 25, status: "نشط" },
    { id: 2, title: "واجب التفاضل والتكامل", deadline: "25/18", submitted: 18, total: 25, status: "نشط" },
  ];

  const displayAssignments = assignments.length > 0 ? assignments : defaultAssignments;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[20px] font-semibold text-[#1F2937]"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "24px" }}
        >
          الواجبات
        </h3>
        <button className="w-8 h-8 rounded-lg bg-white  flex items-center justify-center text-[#1F2937] hover:bg-gray-100 transition-all text-xl leading-none border border-[#E5E5E5]">
          +
        </button>
      </div>
      <div className="space-y-3">
        {displayAssignments.map((a) => (
          <AssignmentItem key={a.id} {...a} onDownload={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default LessonAssignments;