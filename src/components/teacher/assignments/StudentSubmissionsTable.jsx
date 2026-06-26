import React, { useState } from "react";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    blue: "bg-[#EAF4FF] text-[#123C91]",
    red: "bg-[#FFE9E9] text-[#D32F2F]",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${map[type] ?? ""}`}
      style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}
    >
      {label}
    </span>
  );
};

const submissionBadge = (submitted) =>
  submitted ? (
    <Badge label="تم التسليم" type="blue" />
  ) : (
    <Badge label="لم يسلّم" type="red" />
  );

// ─── Submission Count ─────────────────────────────────────────────────────────
const SubmissionCount = ({ value }) => {
  if (!value) return null;
  const [done, total] = value.split("/");
  return (
    <span style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px" }}>
      <span style={{ color: "#123C91", fontWeight: 700 }}>{done}</span>
      <span style={{ color: "#8C9198", fontWeight: 400 }}>/{total}</span>
    </span>
  );
};

// ─── Correction Modal ─────────────────────────────────────────────────────────
const CorrectionModal = ({ student, onClose, onSubmit }) => {
  const [grade, setGrade] = useState("");

  const handleSubmit = () => {
    onSubmit?.({ student, grade });
    onClose();
  };

  // prevent closing when clicking inside modal
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="bg-white rounded-2xl w-full mx-4 overflow-hidden"
        style={{ maxWidth: "480px" }}
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <h2
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontWeight: 700,
                fontSize: "20px",
                color: "#1A1A1A",
              }}
            >
              تصحيح الواجب
            </h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        {/* Student name */}
        <p
          className="text-right px-6 pb-5"
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontSize: "14px",
            color: "#8C9198",
          }}
        >
          {student.name}
        </p>

        <div className="px-6 pb-6 space-y-5">
          {/* File card */}
          <div className="border border-gray-200 rounded-xl flex items-center justify-between px-4 py-4">
            <button
              className="border border-gray-200 rounded-xl px-5 py-2 text-sm font-medium text-[#575F69] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "Tajawal, sans-serif" }}
            >
              تحميل
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p
                  style={{
                    fontFamily: "IBM Plex Sans Arabic, sans-serif",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "#1A1A1A",
                    direction: "ltr",
                  }}
                >
                  {student.fileName ?? `${student.name.replace(/\s/g, "_")}_assignment.pdf`}
                </p>
                <p
                  style={{
                    fontFamily: "IBM Plex Sans Arabic, sans-serif",
                    fontSize: "12px",
                    color: "#8C9198",
                  }}
                >
                  {student.fileSize ?? "PDF 24MB"}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#EAF4FF] flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grade input */}
          <div>
            <label
              className="block text-right mb-2"
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                color: "#575F69",
              }}
            >
              الدرجة (من 20)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              placeholder="0 - 20"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right text-[#575F69] bg-gray-50 outline-none focus:border-[#123C91] focus:bg-white transition-colors"
              style={{
                fontFamily: "IBM Plex Sans Arabic, sans-serif",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Info banner */}
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ backgroundColor: "#EAF4FF" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p
              className="text-right"
              style={{
                fontFamily: "Tajawal, sans-serif",
                fontSize: "13px",
                color: "#123C91",
              }}
            >
              قم بتنزيل ملف إجابة الطالب ومراجعة الحل بعناية قبل إدخال التقييم.
            </p>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="border border-gray-200 rounded-xl py-3.5 text-[#575F69] font-medium hover:bg-gray-50 transition-colors"
            style={{ fontFamily: "Tajawal, sans-serif", fontSize: "15px" }}
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#123C91] text-white rounded-xl py-3.5 font-semibold hover:bg-[#0e2f73] transition-colors"
            style={{ fontFamily: "Tajawal, sans-serif", fontSize: "15px" }}
          >
            حفظ و إرسال
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Single Row ───────────────────────────────────────────────────────────────
const StudentRow = ({ student, onCorrect, onEdit }) => {
  const showCorrect = student.submitted && student.correctionStatus !== "تم التصحيح";
  const showEdit = student.submitted && student.correctionStatus === "تم التصحيح";

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5"
      style={{ minHeight: "56px" }}
    >
      {/* Right: avatar + name */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#123C91] text-xs font-semibold flex items-center justify-center shrink-0">
          {student.initial}
        </div>
        <span
          style={{
            fontFamily: "Tajawal, sans-serif",
            fontWeight: 500,
            fontSize: "15px",
            color: "#575F69",
          }}
        >
          {student.name}
        </span>
      </div>

      {/* Left: actions area */}
      <div className="flex items-center gap-3">
        {student.submittedCount && <SubmissionCount value={student.submittedCount} />}
        {submissionBadge(student.submitted)}

        {showCorrect && (
          <button
            onClick={() => onCorrect(student)}
            className="bg-[#123C91] text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#0e2f73] transition-colors whitespace-nowrap"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            تصحيح
          </button>
        )}
        {showEdit && (
          <button
            onClick={() => onEdit?.(student)}
            className="text-[#123C91] text-sm font-semibold px-2 py-1 rounded-lg hover:bg-[#EAF4FF] transition-colors whitespace-nowrap"
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            تعديل
          </button>
        )}
      </div>
    </div>
  );
};

// ─── StudentSubmissionsTable ──────────────────────────────────────────────────
const StudentSubmissionsTable = ({ students = [], onAction }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleCorrect = (student) => {
    setSelectedStudent(student);
  };

  const handleModalSubmit = ({ student, grade }) => {
    onAction?.({ student, grade, type: "تصحيح" });
  };

  if (students.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm text-[#575F69]"
      >
        لا يوجد طلاب مطابقون للبحث
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-2">
        {students.map((student) => (
          <StudentRow
            key={student.id}
            student={student}
            onCorrect={handleCorrect}
            onEdit={(s) => onAction?.({ student: s, type: "تعديل" })}
          />
        ))}
      </div>

      {selectedStudent && (
        <CorrectionModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
};

export default StudentSubmissionsTable;