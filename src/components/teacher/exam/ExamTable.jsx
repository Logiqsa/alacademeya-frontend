import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    blue: "bg-[#EAF4FF] text-[#123C91]",
    orange: "bg-[#FF8A0026] text-[#FF8A00]",
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

const assignmentStatusBadge = (v) => (v === "نشط" ? <Badge label={v} type="blue" /> : <Badge label={v} type="gray" />);

const correctionStatusBadge = (v) => {
  if (v === "تم التصحيح") return <Badge label={v} type="green" />;
  if (v === "قيد التصحيح") return <Badge label={v} type="orange" />;
  return <Badge label={v} type="orange" />; // "لم يبدأ التصحيح"
};

// ─── Actions Menu (three dots + tooltip popover) ──────────────────────────────
const ActionsMenu = ({ assignment, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-2 flex items-center justify-center rounded-lg text-[#575F69] hover:bg-gray-100 transition-all duration-200"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-[#1F2937] text-white text-xs rounded-xl shadow-lg p-3 text-right">
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-[#1F2937] rotate-45" />
          <p className="font-semibold mb-1">تصحيح الطالب ناجي</p>
          <p className="text-gray-300 leading-5">إرسال نموذج الحل عبر شات</p>

          <div className="flex items-center gap-1 mt-3 pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onView?.(assignment.id);
                setOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <Eye size={14} /> عرض
            </button>
            <button
              onClick={() => {
                onEdit?.(assignment.id);
                setOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <Pencil size={14} /> تعديل
            </button>
            <button
              onClick={() => {
                onDelete?.(assignment.id);
                setOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/10 transition text-red-300"
            >
              <Trash2 size={14} /> حذف
            </button>
          </div>
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


const ExamTable = ({ assignments = [], onView, onEdit, onDelete }) => {
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
      {/* ── Desktop / Tablet table (md and up) ───────────────────────────── */}
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

                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69] whitespace-nowrap"
                    style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif", fontSize: "14px", lineHeight: "24px" }}
                  >
                    {a.submitted}/{a.totalStudents}
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">{assignmentStatusBadge(a.status)}</td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4">{correctionStatusBadge(a.correctionStatus)}</td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <ActionsMenu assignment={a} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards (below md) ───────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[#1A1A1A] font-semibold text-[16px]" style={{ fontFamily: "Tajawal, sans-serif" }}>
                {a.title}
              </h4>
              <ActionsMenu assignment={a} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            </div>

            <div className="flex items-center gap-2 mb-3">
              {assignmentStatusBadge(a.status)}
              {correctionStatusBadge(a.correctionStatus)}
            </div>

            <div className="space-y-0.5">
              <MobileField label="المجموعة">{a.group}</MobileField>
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

export default ExamTable;