import React, { useRef, useState, useEffect } from "react";
import { MoreVertical, Upload, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type, subLabel }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    red: "bg-[#FB2C3626] text-[#FB2C36]",
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

// Student-facing assignment status: نشط / تم التسليم / لم يتم التسليم
const statusBadge = (status, timeRemaining) => {
  if (status === "نشط") {
    return <Badge label={status} type="blue" subLabel={timeRemaining ? `الوقت المتبقي ${timeRemaining}` : null} />;
  }
  if (status === "تم التسليم") {
    return <Badge label={status} type="green" />;
  }
  if (status === "لم يتم التسليم") {
    return <Badge label={status} type="red" />;
  }
  return <Badge label={status} type="gray" />;
};

// ─── Row Actions Menu (the "..." button in the screenshot) ───────────────────
const RowActionsMenu = ({ assignment, onView, onSubmit }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSubmit = assignment.status !== "تم التسليم";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-all duration-200"
        aria-label="إجراءات الواجب"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          dir="rtl"
          className="absolute left-0 z-20 mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden py-1"
        >
          <button
            onClick={() => {
              setOpen(false);
              onView?.(assignment.id);
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#575F69] hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            عرض التفاصيل
          </button>
          {canSubmit && (
            <button
              onClick={() => {
                setOpen(false);
                onSubmit?.(assignment.id);
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#123C91] hover:bg-gray-50 transition-colors"
            >
              <Upload size={16} />
              تسليم الحل
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

const StudentAssignmentsTable = ({ assignments = [], onView, onSubmit }) => {
  const navigate = useNavigate();

  const handleView = (assignmentId) => {
    if (onView) {
      onView(assignmentId);
    } else {
      navigate(`/student/assignments/${assignmentId}`);
    }
  };

  const handleSubmit = (assignmentId) => {
    onSubmit?.(assignmentId);
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
                  "الحصة",
                  "موعد التسليم",
                  "الحالة",
                  "الدرجة",
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
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{ fontFamily: "Tajawal, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "20px" }}
                  >
                    {a.title}
                  </td>

                  {[a.group, a.lesson, a.dueDate].map((cellData, index) => (
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
                      {cellData}
                    </td>
                  ))}

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{statusBadge(a.status, a.timeRemaining)}</td>

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px", lineHeight: "24px" }}
                  >
                    {a.grade ?? "--"}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <RowActionsMenu assignment={a} onView={handleView} onSubmit={handleSubmit} />
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
              <h4 className="text-[#1A1A1A] font-semibold text-[16px]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                {a.title}
              </h4>
              <RowActionsMenu assignment={a} onView={handleView} onSubmit={handleSubmit} />
            </div>

            <div className="flex items-center gap-2 mb-3">{statusBadge(a.status, a.timeRemaining)}</div>

            <div className="space-y-0.5">
              <MobileField label="المجموعة">{a.group}</MobileField>
              <MobileField label="الحصة">{a.lesson}</MobileField>
              <MobileField label="موعد التسليم">{a.dueDate}</MobileField>
              <MobileField label="الدرجة">{a.grade ?? "--"}</MobileField>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignmentsTable;