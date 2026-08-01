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

const assignmentStatusBadge = (status, timeRemaining) => {
  if (status === "نشط") {
    return <Badge label={status} type="blue" subLabel={timeRemaining ? `الوقت المتبقي ${timeRemaining}` : null} />;
  }
  return <Badge label={status} type="gray" />;
};

const correctionStatusBadge = (v) => {
  if (v === "تم التصحيح") return <Badge label={v} type="green" />;
  if (v === "قيد التصحيح") return <Badge label={v} type="orange" />;
  return <Badge label={v} type="gray" />; 
};

// ─── View Action (single eye icon) ────────────────────────────────────────────
const ViewAction = ({ assignmentId, onView }) => (
  <button
    onClick={() => onView?.(assignmentId)}
    className="p-2 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all duration-200"
    aria-label="عرض تفاصيل الواجب"
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

const AssignmentsTable = ({ assignments = [], onView }) => {
  const navigate = useNavigate();

  // Default navigation: go to the assignment details page.
  // Caller can still override by passing a custom onView prop.
  const handleView = (assignmentId) => {
    if (onView) {
      onView(assignmentId);
    } else {
      navigate(`/teacher/assignments/${assignmentId}`);
    }
  };

  if (assignments.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد واجبات متاحة
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full">
    
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-230 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {[
                  "عنوان الواجب",
                  "المجموعة",
                  "المادة",
                  "الحصة",
                  "موعد التسليم",
                  "تم التسليم",
                  "حالة الواجب",
                  "حالة التصحيح",
                  "الإجراءات",
                ].map((header) => (
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
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4"
                    style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleView(a.id)}
                      className="text-[#123C91] hover:underline text-right"
                    >
                      {a.title}
                    </button>
                  </td>

                  {[a.group, a.subject, a.place, a.lesson, a.dueDate].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "24px",
                      }}
                    >
                      {cellData || "—"}
                    </td>
                  ))}

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px", lineHeight: "24px" }}
                  >
                    {a.submitted}/{a.totalStudents}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    {assignmentStatusBadge(a.status, a.timeRemaining)}
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">{correctionStatusBadge(a.correctionStatus)}</td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <ViewAction assignmentId={a.id} onView={handleView} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      <div className="md:hidden space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => handleView(a.id)}
                className="text-[#123C91] font-semibold text-[16px] hover:underline text-right"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {a.title}
              </button>
              <ViewAction assignmentId={a.id} onView={handleView} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {assignmentStatusBadge(a.status, a.timeRemaining)}
              {correctionStatusBadge(a.correctionStatus)}
            </div>

            <div className="space-y-0.5">
              <MobileField label="المجموعة">{a.group}</MobileField>
              <MobileField label="المادة">{a.subject || "—"}</MobileField>
              <MobileField label="المكان">{a.place || "—"}</MobileField>
              <MobileField label="الحصة">{a.lesson}</MobileField>
              <MobileField label="موعد التسليم">{a.dueDate}</MobileField>
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

export default AssignmentsTable;