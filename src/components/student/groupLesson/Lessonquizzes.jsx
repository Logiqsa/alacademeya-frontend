import React from "react";
import { HiOutlineDocumentCheck } from "react-icons/hi2";

const StatusPill = ({ status }) => {
  const styles = {
    "لم يبدأ": "bg-[#EAF4FF] text-[#123C91]",
    منتهي: "bg-[#1F293726] text-[#1F2937]",
    جاري: "bg-[#00A63E26] text-[#00A63E]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const QuizRow = ({ title, questionsCount, status, onOpen }) => (
  <div
    onClick={onOpen}
    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E5E5E5] hover:border-gray-300 cursor-pointer transition-all"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-[#EAF4FF] flex items-center justify-center shrink-0">
        <HiOutlineDocumentCheck size={18} className="text-[#123C91]" />
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-[#1F2937] truncate" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          {title}
        </p>
        <p className="text-[12px] text-[#9CA3AF] mt-1" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
          {questionsCount} أسئلة
        </p>
      </div>
    </div>
    <StatusPill status={status} />
  </div>
);

const LessonQuizzes = ({ quizzes = [] }) => {
  const defaultQuizzes = [
    { id: 1, title: "اختبار المعادلات التربيعية", questionsCount: 10, status: "لم يبدأ" },
    { id: 2, title: "اختبار المعادلات التربيعية", questionsCount: 10, status: "منتهي" },
  ];

  const displayQuizzes = quizzes.length > 0 ? quizzes : defaultQuizzes;

  return (
    <div dir="rtl" className="bg-white rounded-2xl border border-[#E5E5E5] p-4">
      <h3 className="text-[18px] font-semibold text-[#1F2937] mb-4" style={{ fontFamily: "IBM Plex Sans Arabic" }}>
        الاختبارات
      </h3>
      <div className="flex flex-col gap-3">
        {displayQuizzes.length === 0 ? (
          <p className="text-[13px] text-[#9CA3AF] text-center py-6">لا توجد اختبارات لهذه الحصة</p>
        ) : (
          displayQuizzes.map((q) => <QuizRow key={q.id} {...q} onOpen={() => console.log("open quiz", q.id)} />)
        )}
      </div>
    </div>
  );
};

export default LessonQuizzes;