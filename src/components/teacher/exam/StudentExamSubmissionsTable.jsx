import React from "react";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    blue: "bg-[#EAF4FF] text-[#123C91]",
    red: "bg-[#FFE9E9] text-[#D32F2F]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? ""}`}
      style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
    >
      {label}
    </span>
  );
};

const submissionBadge = (completed) =>
  completed
    ? <Badge label="أكمل الاختبار" type="blue" />
    : <Badge label="لم يؤد الاختبار" type="red" />;

// ─── Score Display ─────────────────────────────────────────────────────────────
const ScoreDisplay = ({ value }) => {
  if (!value) return null;
  const [done, total] = value.split("/");
  return (
    <span style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "18px" }} className="sm:text-[16px]">
      <span style={{ color: "#123C91", fontWeight: 700 }}>{done}</span>
      <span style={{ color: "#8C9198", fontWeight: 400 }}>/{total}</span>
    </span>
  );
};

// ─── Single Row ───────────────────────────────────────────────────────────────
const StudentRow = ({ student }) => {
  return (
    <div
      dir="rtl"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 sm:px-5 py-3.5"
    >
      {/* Student identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#EAF4FF] text-[#123C91] text-[14px] font-semibold flex items-center justify-center shrink-0">
          {student.initial}
        </div>
        <h2
          className="truncate"
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontWeight: 500,
            fontSize: "18px",
            color: "#575F69",
          }}
        >
          {student.name}
        </h2>
      </div>

      {/* Score + badge */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap sm:shrink-0">
        {student.score && <ScoreDisplay value={student.score} />}
        {submissionBadge(student.completed)}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudentExamSubmissionsTable = ({ students = [] }) => {
  if (students.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 px-4 text-center text-sm text-[#575F69]"
      >
        لا يوجد طلاب مطابقون للبحث
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {students.map((student) => (
        <StudentRow key={student.id} student={student} />
      ))}
    </div>
  );
};

export default StudentExamSubmissionsTable;