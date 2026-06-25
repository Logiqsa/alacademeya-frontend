import React from "react";
import { HiOutlinePencilAlt, HiOutlineDownload } from "react-icons/hi";

const statusStyles = {
  ماضي: "bg-[#F3F4F6] text-[#1F2937]", 
  نشط: "bg-[#E6F9EE] text-[#00A63E]",
};

const QuizItem = ({ title, participants, total, status, onDownload }) => (
  <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-[#E5E5E5] bg-white hover:border-gray-300 transition-all">
    <div className="flex items-center gap-3 min-w-0">
     
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <HiOutlinePencilAlt size={20} className="text-[#1F2937]" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className="text-[14px] font-medium text-[#1F2937] truncate"
            style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "16px" }}
          >
            {title}
          </p>
          <span 
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyles[status] || "bg-gray-100 text-gray-600"}`}
            style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
          >
            {status}
          </span>
        </div>
        <p 
          className="text-[12px] text-[#575F69] mt-1" 
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "16px" }}
        >
          المشاركون: {participants}/{total}
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

const LessonQuizzes = ({ quizzes = [] }) => {
  const defaultQuizzes = [
    { id: 1, title: "اختبار المعادلات التربيعية", participants: 24, total: 25, status: "ماضي" },
    { id: 2, title: "اختبار المعادلات التربيعية", participants: 24, total: 25, status: "ماضي" },
  ];

  const displayQuizzes = quizzes.length > 0 ? quizzes : defaultQuizzes;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-[#E5E5E5] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-[20px] font-semibold text-[#1F2937]"
          style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", lineHeight: "24px" }}
        >
          الاختبارات
        </h3>
        <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-[#1F2937] hover:bg-gray-100 transition-all text-xl leading-none border border-[#E5E5E5]">
          +
        </button>
      </div>
      <div className="space-y-3">
        {displayQuizzes.map((q) => (
          <QuizItem key={q.id} {...q} onDownload={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default LessonQuizzes;