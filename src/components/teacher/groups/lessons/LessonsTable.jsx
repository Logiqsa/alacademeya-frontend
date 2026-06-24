import React from "react";
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";

const StatusBadge = ({ status }) => {
  const styles = {
    "قادمة": "bg-[#EAF4FF] text-[#123C91] ",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E] ",
    "منتهية": "bg-[#D32F2F26] text-[#D32F2F] ",
    "ملغية": "bg-[#1F293726] text-[#1F2937] ",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Action Button (Styled to fit the table)
// ─────────────────────────────────────────────────────────────
const ActionButton = ({ children, onClick, colorClass = "" }) => (
  <button
    onClick={onClick}
    className={`p-2 flex items-center justify-center rounded-lg transition-all duration-200 ${colorClass}`}
  >
    {children}
  </button>
);

// ─── Mobile Row Field ─────────────────────────────────────────────────────────
const MobileField = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-xs font-medium text-[#8C9198] shrink-0">{label}</span>
    <span className="text-sm text-[#575F69] font-medium text-left">{children}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Lessons Table
// ─────────────────────────────────────────────────────────────
const LessonsTable = ({ lessons = [], onView, onEdit, onDelete }) => {
  if (lessons.length === 0) {
    return (
      <div
        dir="rtl"
        className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm py-12 text-center text-sm sm:text-base text-[#575F69]"
      >
        لا توجد حصص متاحة
      </div>
    );
  }

  const attendanceValue = (lesson) =>
    lesson.attendance === 0 && (lesson.absence === 0 || lesson.status === "قادمة") ? "--" : lesson.attendance;
  const absenceValue = (lesson) =>
    lesson.absence === 0 && (lesson.attendance === 0 || lesson.status === "قادمة") ? "--" : lesson.absence;

  return (
    <div dir="rtl" className="w-full">
      {/* ── Desktop / Tablet table (md and up) ───────────────────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-205 text-right">
            <thead>
              <tr
                style={{
                  backgroundColor: "#F9FAFA",
                  fontFamily: "IBM Plex Sans Arabic, sans-serif",
                }}
              >
                {["عنوان الحصة", "التاريخ", "الوقت", "المدة", "حضور", "غياب", "الحالة", "الإجراءات"].map((header) => (
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
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* عنوان الحصة */}
                  <td
                    className="px-4 lg:px-6 py-3 lg:py-4 text-[#575F69]"
                    style={{
                      fontFamily: "Tajawal, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "20px",
                    }}
                  >
                    {lesson.title}
                  </td>

                  {[lesson.date, lesson.time, lesson.duration, attendanceValue(lesson), absenceValue(lesson)].map(
                    (cellData, index) => (
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
                    )
                  )}

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <StatusBadge status={lesson.status} />
                  </td>

                  <td className="px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center gap-2">
                      <ActionButton onClick={() => onView?.(lesson.id)} colorClass="text-[#575F69] hover:text-blue-600">
                        <HiOutlineEye size={18} />
                      </ActionButton>
                      <ActionButton onClick={() => onEdit?.(lesson.id)} colorClass="text-[#575F69] hover:text-amber-600">
                        <HiOutlinePencil size={18} />
                      </ActionButton>
                      <ActionButton onClick={() => onDelete?.(lesson.id)} colorClass="text-[#575F69] hover:text-red-600">
                        <HiOutlineTrash size={18} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile cards (below md) ───────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h4
                className="text-[#1A1A1A] font-semibold text-[16px]"
                style={{ fontFamily: "Tajawal, sans-serif" }}
              >
                {lesson.title}
              </h4>
              <StatusBadge status={lesson.status} />
            </div>

            <div className="space-y-0.5">
              <MobileField label="التاريخ">{lesson.date}</MobileField>
              <MobileField label="الوقت">{lesson.time}</MobileField>
              <MobileField label="المدة">{lesson.duration}</MobileField>
              <MobileField label="حضور">{attendanceValue(lesson)}</MobileField>
              <MobileField label="غياب">{absenceValue(lesson)}</MobileField>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <ActionButton
                onClick={() => onView?.(lesson.id)}
                colorClass="text-[#575F69] hover:text-blue-600 bg-gray-50 flex-1 justify-center"
              >
                <HiOutlineEye size={18} />
              </ActionButton>
              <ActionButton
                onClick={() => onEdit?.(lesson.id)}
                colorClass="text-[#575F69] hover:text-amber-600 bg-gray-50 flex-1 justify-center"
              >
                <HiOutlinePencil size={18} />
              </ActionButton>
              <ActionButton
                onClick={() => onDelete?.(lesson.id)}
                colorClass="text-[#575F69] hover:text-red-600 bg-gray-50 flex-1 justify-center"
              >
                <HiOutlineTrash size={18} />
              </ActionButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonsTable;