import React from "react";
import { HiOutlineEye } from "react-icons/hi";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    "نشط": "bg-[#00A63E26] text-[#00A63E]",
    "مستبعد": "bg-[#D32F2F26] text-[#D32F2F]",
    "معلق": "bg-[#FF8A0026] text-[#FF8A00]",
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

// ─────────────────────────────────────────────────────────────
// Students Table
// ─────────────────────────────────────────────────────────────
/**
 * Props:
 *  students: Array<{ id, name, joinDate, phone, parent, status }>
 *  onView: (id) => void
 */
const StudentsTable = ({ students = [], onView }) => {
  return (
    <div dir="rtl" className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-200 text-right">
          <thead>
            <tr
              style={{
                backgroundColor: "#F9FAFA",
                fontFamily: "IBM Plex Sans Arabic, sans-serif",
              }}
            >
              {["اسم الطالب", "تاريخ الإنضمام", "رقم الهاتف", "ولي الأمر", "الحالة", "الإجراءات"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-[#575F69] text-[14px] font-medium text-right uppercase tracking-wider"
                  style={{
                    fontWeight: 500,
                    lineHeight: "16px",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#575F69]">
                  لا يوجد طلاب
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* اسم الطالب */}
                  <td
                    className="px-6 py-4 text-[#575F69]"
                    style={{
                      fontFamily: "Tajawal, sans-serif",
                      fontWeight: 500,
                      fontSize: "18px",
                      lineHeight: "20px",
                    }}
                  >
                    {student.name}
                  </td>

                  {[student.joinDate, student.phone, student.parent].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-6 py-4 text-[#575F69]"
                      style={{
                        fontFamily: "IBM Plex Sans Arabic, sans-serif",
                        fontWeight: 400,
                        fontSize: "16px",
                        lineHeight: "24px",
                      }}
                    >
                      {cellData}
                    </td>
                  ))}

                  <td className="px-6 py-4">
                    <StatusBadge status={student.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ActionButton onClick={() => onView?.(student.id)} colorClass="text-[#575F69] hover:text-blue-600">
                        <HiOutlineEye size={18} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTable;