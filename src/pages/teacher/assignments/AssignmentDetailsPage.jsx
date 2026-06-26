import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileCheck2, FileClock, FilesIcon } from "lucide-react";

const MOCK_ASSIGNMENT = {
  id: "1",
  title: "حل المعادلات",
  subtitle: "إدارة ومتابعة واجبات الطلاب وتصحيحها.",
  stats: {
    pendingCorrection: 2,
    corrected: 22,
    totalSubmissions: 24,
  },
  students: [
    { id: 1, name: "ريم سعد", initial: "ر", submitted: true, submittedCount: "18/20", action: "تعديل" },
    { id: 2, name: "محمد احمد", initial: "م", submitted: true, submittedCount: "15/20", action: "تعديل" },
    { id: 3, name: "عبدالحميد محمد", initial: "ع", submitted: true, action: "تصحيح" },
    { id: 4, name: "صلاح علي", initial: "ص", submitted: true, action: "تصحيح" },
    { id: 5, name: "شهد عادل", initial: "ش", submitted: true, action: "تصحيح" },
    { id: 6, name: "سمير السيد", initial: "س", submitted: false },
    { id: 7, name: "ملك محمد", initial: "م", submitted: false },
  ],
};

// ─── Small building blocks ────────────────────────────────────────────────────
const StatCard = ({ value, label, icon, tone }) => {
  const toneMap = {
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
  };
  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center justify-between gap-3">
      <div className="flex flex-col items-start">
        <span className="text-2xl font-bold text-[#1A1A1A]">{value}</span>
        <span className="text-sm text-[#8C9198] mt-1">{label}</span>
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>{icon}</div>
    </div>
  );
};

const SubmissionBadge = ({ submitted }) =>
  submitted ? (
    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-[#EAF4FF] text-[#123C91] whitespace-nowrap">
      تم التسليم
    </span>
  ) : (
    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-[#FEEAEA] text-[#D92D20] whitespace-nowrap">
      لم يسلّم
    </span>
  );

const StudentRow = ({ student, onAction }) => (
  <div className="flex items-center justify-between gap-3 py-3 px-1 border-b border-gray-50 last:border-b-0">
    {/* Right side: avatar + name (RTL -> visually right) */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#EAF4FF] text-[#123C91] text-sm font-semibold flex items-center justify-center shrink-0">
        {student.initial}
      </div>
      <span className="text-sm font-medium text-[#1A1A1A] whitespace-nowrap">{student.name}</span>
    </div>

    {/* Left side: submission badge + count + action */}
    <div className="flex items-center gap-2">
      <SubmissionBadge submitted={student.submitted} />
      {student.submittedCount && (
        <span className="text-xs text-[#8C9198] whitespace-nowrap">{student.submittedCount}</span>
      )}
      {student.submitted && student.action && (
        <button
          onClick={() => onAction?.(student)}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            student.action === "تصحيح"
              ? "bg-[#123C91] text-white hover:bg-[#0e2f73]"
              : "text-[#123C91] hover:bg-[#EAF4FF]"
          }`}
        >
          {student.action}
        </button>
      )}
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const AssignmentDetailsPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // In production, fetch the assignment by `assignmentId` here.
  const assignment = MOCK_ASSIGNMENT;

  const filteredStudents = assignment.students.filter((s) => {
    const matchesSearch = s.name.includes(search);
    const matchesFilter =
      filter === "all" ||
      (filter === "submitted" && s.submitted) ||
      (filter === "not-submitted" && !s.submitted);
    return matchesSearch && matchesFilter;
  });

  return (
    <div dir="rtl" className="min-h-screen bg-[#F9FAFA]">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">{assignment.title}</h1>
          <p className="text-sm text-[#8C9198] mt-1">{assignment.subtitle}</p>
        </div>

        {/* Stat cards */}
        <div className="flex flex-col sm:flex-row gap-3">
          <StatCard
            value={assignment.stats.pendingCorrection}
            label="قيد التصحيح"
            tone="orange"
            icon={<FileClock size={18} />}
          />
          <StatCard
            value={assignment.stats.corrected}
            label="تم تصحيحها"
            tone="green"
            icon={<FileCheck2 size={18} />}
          />
          <StatCard
            value={assignment.stats.totalSubmissions}
            label="إجمالي التسليمات"
            tone="blue"
            icon={<FilesIcon size={18} />}
          />
        </div>

        {/* Search & filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm text-[#575F69] bg-transparent border-l border-gray-200 pl-3 pr-1 py-1.5 focus:outline-none shrink-0"
          >
            <option value="all">جميع الطلاب</option>
            <option value="submitted">تم التسليم</option>
            <option value="not-submitted">لم يسلّم</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن طالب..."
            className="flex-1 text-sm text-[#575F69] bg-transparent focus:outline-none text-right placeholder:text-[#8C9198]"
          />
        </div>

        {/* Students list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-2">
          {filteredStudents.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8C9198]">لا يوجد طلاب مطابقون للبحث</div>
          ) : (
            filteredStudents.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onAction={(s) =>
                  navigate(`/teacher/assignments/${assignmentId}/students/${s.id}/correction`)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsPage;