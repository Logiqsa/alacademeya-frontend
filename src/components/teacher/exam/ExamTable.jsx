import React from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type, subLabel }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
    gray: "bg-gray-100 text-[#8C9198]",
  };
  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
          map[type] ?? map.gray
        }`}
      >
        {label}
      </span>
      {subLabel && (
        <span className="text-[11px] text-[#8C9198] whitespace-nowrap">{subLabel}</span>
      )}
    </div>
  );
};

const examStatusBadge = (status, timeRemaining) => {
  if (status === "نشط") {
    return (
      <Badge
        label={status}
        type="blue"
        subLabel={timeRemaining ? `الوقت المتبقي ${timeRemaining}` : null}
      />
    );
  }
  return <Badge label="مكتمل" type="gray" />;
};

const correctionStatusBadge = (v) => {
  if (v === "تم التصحيح") return <Badge label={v} type="green" />;
  if (v === "قيد التصحيح") return <Badge label={v} type="orange" />;
  return <Badge label={v} type="gray" />;
};

// ─── View Action ──────────────────────────────────────────────────────────────
const ViewAction = ({ examId, onView }) => (
  <button
    onClick={() => onView?.(examId)}
    className="p-2 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all duration-200"
    aria-label="عرض تفاصيل الاختبار"
  >
    <Eye size={18} />
  </button>
);

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ExamTable = ({ Exams = [], onView }) => {
  const navigate = useNavigate();

  const handleView = (examId) => {
    if (onView) {
      onView(examId);
    } else {
      navigate(`/teacher/exams/${examId}`);
    }
  };

  if (Exams.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد اختبارات متاحة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">

      {/* ── Desktop Table ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr style={{ backgroundColor: "#F9FAFA", fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
                {[
                  "عنوان الاختبار",
                  "المجموعة",
                  "الحصة",
                  "موعد الاختبار",
                  "تم التسليم",
                  "حالة الاختبار",
                  "حالة التصحيح",
                  "الإجراءات",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 text-[#575F69] text-[13px] font-medium text-right whitespace-nowrap"
                    style={{ fontWeight: 500, lineHeight: "16px" }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Exams.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Title */}
                  <td
                    className="px-3 py-3 text-[#575F69]"
                    style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "15px", lineHeight: "20px" }}
                  >
                    {a.title}
                  </td>

                  {/* Group, Lesson, DateTime */}
                  {[a.group, a.lesson, a.dateTime].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-3 py-3 text-[#575F69] whitespace-nowrap"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "13px",
                        lineHeight: "24px",
                      }}
                    >
                      {cellData}
                    </td>
                  ))}

                  {/* Submitted */}
                  <td
                    className="px-3 py-3 text-[#575F69] whitespace-nowrap"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "13px", lineHeight: "24px" }}
                  >
                    {a.submitted}/{a.totalStudents}
                  </td>

                  {/* Exam Status */}
                  <td className="px-3 py-3">
                    {examStatusBadge(a.status, a.timeRemaining)}
                  </td>

                  {/* Correction Status */}
                  <td className="px-3 py-3">
                    {correctionStatusBadge(a.correctionStatus)}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3">
                    <ViewAction examId={a.id} onView={handleView} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {Exams.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[#1A1A1A] font-semibold text-[16px]"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {a.title}
              </h4>
              <ViewAction examId={a.id} onView={handleView} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {examStatusBadge(a.status, a.timeRemaining)}
              {correctionStatusBadge(a.correctionStatus)}
            </div>

            <div className="space-y-0.5">
              <MobileField label="المجموعة">{a.group}</MobileField>
              <MobileField label="الحصة">{a.lesson}</MobileField>
              <MobileField label="موعد الاختبار">{a.dateTime}</MobileField>
              <MobileField label="تم التسليم">
                {a.submitted}/{a.totalStudents}
              </MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamTable;