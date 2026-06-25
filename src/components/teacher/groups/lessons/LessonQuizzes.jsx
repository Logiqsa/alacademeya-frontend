import React from "react";
import { HiOutlinePencilAlt, HiOutlineDownload } from "react-icons/hi";

const statusStyles = {
  ماضي: "bg-[#1F293726] text-[#1F2937]",
  نشط: "bg-[#E6F9EE] text-[#00A63E]",
};

const QuizItem = ({ title, participants, total, status, onDownload }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-[#F3E8FF] flex items-center justify-center flex-shrink-0">
        <HiOutlinePencilAlt size={18} className="text-[#7C3AED]" />
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
          المشاركون: {participants}/{total}
        </p>
      </div>
    </div>
    <button
      onClick={onDownload}
      className="p-2 rounded-lg text-[#8C9198] hover:text-[#7C3AED] hover:bg-purple-50 transition-all flex-shrink-0"
    >
      <HiOutlineDownload size={18} />
    </button>
  </div>
);

const LessonQuizzes = ({ quizzes = [] }) => {
  const defaultQuizzes = [
    { id: 1, title: "اختبار المعادلات التربيعية", participants: 24, total: 25, status: "ماضي" },
    { id: 2, title: "اختبار المعادلات التربيعية", participants: 24, total: 25, status: "ماضي" },
    { id: 3, title: "اختبار المعادلات التربيعية", participants: 24, total: 25, status: "ماضي" },
  ];

  const displayQuizzes = quizzes.length > 0 ? quizzes : defaultQuizzes;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-base font-semibold text-[#1A1A1A]"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          الاختبارات
        </h3>
        <button className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white transition-all text-xl leading-none">
          +
        </button>
      </div>
      <div className="space-y-2">
        {displayQuizzes.map((q) => (
          <QuizItem key={q.id} {...q} onDownload={() => {}} />
        ))}
      </div>
    </div>
  );
};

export default LessonQuizzes;