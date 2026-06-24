import React from "react";

// ─── Badge Helper ─────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const map = {
    green: "bg-[#00A63E26] text-[#00A63E]",
    red: "bg-[#D32F2F26] text-[#D32F2F]",
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

const attendanceBadge = (v) => (v === "حاضر" ? <Badge label={v} type="green" /> : <Badge label={v} type="red" />);

const homeworkBadge = (v) => {
  if (v === "تم التسليم" || v === "تم تسليم") return <Badge label={v} type="green" />;
  if (v === "لا يوجد واجب") return <Badge label={v} type="gray" />;
  return <Badge label={v} type="orange" />;
};

const gradeBadge = (v) => {
  if (v === "مكتمل") return <Badge label={v} type="green" />;
  if (v === "قيد الانتظار") return <Badge label={v} type="orange" />;
  if (v === "لايوجد اختبار") return <Badge label={v} type="gray" />;
  return <Badge label={v} type="gray" />;
};

// ─── StudentLessonsTable ──────────────────────────────────────────────────────
/**
 * Props:
 *  lessons: Array<{
 *    id, title, date,
 *    attendance, homeworkStatus, grade, gradeStatus, examGrade
 *  }>
 */
const StudentLessonsTable = ({ lessons = [] }) => {
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
              {["اسم الحصة", "التاريخ", "الحضور", "حالة الواجب", "الدرجة", "حالة الاختبار", "درجة الاختبار"].map(
                (header) => (
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
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[#575F69]">
                  لا توجد بيانات
                </td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* اسم الحصة */}
                  <td
                    className="px-6 py-4 text-[#575F69]"
                    style={{
                      fontFamily: "Tajawal, sans-serif",
                      fontWeight: 500,
                      fontSize: "18px",
                      lineHeight: "20px",
                    }}
                  >
                    {lesson.title}
                  </td>

                  <td
                    className="px-6 py-4 text-[#575F69]"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    {lesson.date}
                  </td>

                  <td className="px-6 py-4">{attendanceBadge(lesson.attendance)}</td>
                  <td className="px-6 py-4">{homeworkBadge(lesson.homeworkStatus)}</td>

                  <td
                    className="px-6 py-4 text-[#575F69] font-medium"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    {lesson.grade}
                  </td>

                  <td className="px-6 py-4">{gradeBadge(lesson.gradeStatus)}</td>

                  <td
                    className="px-6 py-4 text-[#575F69] font-medium"
                    style={{
                      fontFamily: "IBM Plex Sans Arabic, sans-serif",
                      fontSize: "16px",
                      lineHeight: "24px",
                    }}
                  >
                    {lesson.examGrade}
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

export default StudentLessonsTable;