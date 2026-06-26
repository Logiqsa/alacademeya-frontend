import React from "react";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    red: "bg-[#D32F2F26] text-[#D32F2F]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    gray: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
        map[type] ?? map.gray
      }`}
    >
      {label}
    </span>
  );
};

const submissionBadge = (v) => (v === "تم التسليم" ? <Badge label={v} type="blue" /> : <Badge label={v} type="red" />);

const correctionActionLabel = (student) => {
  if (!student.submitted) return null;
  return student.correctionStatus === "تم التصحيح" ? "تعديل" : "تصحيح";
};

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─── StudentSubmissionsTable ──────────────────────────────────────────────────
/**
 * Props:
 *  students: Array<{
 *    id, name, initial,
 *    submitted: boolean,
 *    submittedCount?: string,   // e.g. "18/20"
 *    correctionStatus?: string  // "تم التصحيح" | otherwise -> "تصحيح"
 *  }>
 *  onAction: (student) => void  // called when تصحيح/تعديل button is pressed
 */
const StudentSubmissionsTable = ({ students = [], onAction }) => {
  if (students.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا يوجد طلاب مطابقون للبحث
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
      {/* ── Desktop / Tablet table (md and up) ───────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["اسم الطالب", "حالة التسليم", "عدد التسليمات", "الإجراءات"].map((header) => (
                  <th
                    key={header}
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] text-[13px] lg:text-[14px] font-medium text-right uppercase tracking-wider whitespace-nowrap"
                    style={{ fontWeight: 500, lineHeight: "16px" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const actionLabel = correctionActionLabel(student);
                return (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                    <td
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                      style={{
                        fontFamily: "Tajawal, sans-serif",
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: "20px",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF4FF] text-[#123C91] text-sm font-semibold flex items-center justify-center shrink-0">
                          {student.initial}
                        </div>
                        {student.name}
                      </div>
                    </td>

                    <td className="px-4 lg:px-6 py-3 lg:py-4">{submissionBadge(student.submitted ? "تم التسليم" : "لم يسلّم")}</td>

                    <td
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "24px",
                      }}
                    >
                      {student.submittedCount ?? "—"}
                    </td>

                    <td className="px-4 lg:px-6 py-3 lg:py-4">
                      {actionLabel ? (
                        <button
                          onClick={() => onAction?.(student)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                            actionLabel === "تصحيح"
                              ? "bg-[#123C91] text-white hover:bg-[#0e2f73]"
                              : "text-[#123C91] hover:bg-[#EAF4FF]"
                          }`}
                        >
                          {actionLabel}
                        </button>
                      ) : (
                        <span className="text-xs text-[#8C9198]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards (below md) ───────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {students.map((student) => {
          const actionLabel = correctionActionLabel(student);
          return (
            <div key={student.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EAF4FF] text-[#123C91] text-sm font-semibold flex items-center justify-center shrink-0">
                    {student.initial}
                  </div>
                  <h4 className="text-[#1A1A1A] font-semibold text-[16px]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                    {student.name}
                  </h4>
                </div>
                {submissionBadge(student.submitted ? "تم التسليم" : "لم يسلّم")}
              </div>

              <div className="space-y-0.5">
                <MobileField label="عدد التسليمات">{student.submittedCount ?? "—"}</MobileField>
                <MobileField label="الإجراءات">
                  {actionLabel ? (
                    <button
                      onClick={() => onAction?.(student)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                        actionLabel === "تصحيح"
                          ? "bg-[#123C91] text-white hover:bg-[#0e2f73]"
                          : "text-[#123C91] hover:bg-[#EAF4FF]"
                      }`}
                    >
                      {actionLabel}
                    </button>
                  ) : (
                    "—"
                  )}
                </MobileField>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSubmissionsTable;