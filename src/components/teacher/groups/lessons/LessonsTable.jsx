import React from "react";
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi"; // Using Heroicons/hi

const StatusBadge = ({ status }) => {
  const styles = {
    "قادمة": "bg-[#EAF4FF] text-[#123C91] ",
    "مباشر الآن": "bg-[#00A63E26] text-[#00A63E] ",
    "منتهية": "bg-[#D32F2F26] text-[#D32F2F] ",
    "ملغية": "bg-[#1F293726] text-[#1F2937] ",
  };

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 text-[11px] md:text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600"
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
// Lessons Table
// ─────────────────────────────────────────────────────────────
const LessonsTable = ({
  lessons = [
    {
      id: 1,
      title: "المصفوفات_2",
      date: "السبت 21 يونيو 2026",
      time: "06:00 PM",
      duration: "45 دقيقة",
      attendance: 0,
      absence: 22,
      status: "قادمة",
    },
    {
      id: 2,
      title: "المصفوفات_1",
      date: "غدًا 18 يونيو 2026",
      time: "08:30 PM",
      duration: "40 دقيقة",
      attendance: 0,
      absence: 18,
      status: "قادمة",
    },
    {
      id: 3,
      title: "التباديل والتوافيق",
      date: "اليوم 17 يونيو 2026",
      time: "06:00 PM",
      duration: "60 دقيقة",
      attendance: 21,
      absence: 1,
      status: "مباشر الآن",
    },
    {
      id: 4,
      title: "المتتاليات",
      date: "السبت 24 مايو 2026",
      time: "05:30 PM",
      duration: "50 دقيقة",
      attendance: 0,
      absence: 0, // Assume new
      status: "ملغية",
    },
    {
      id: 5,
      title: "العدد الأول",
      date: "السبت 24 مايو 2026",
      time: "11:00 AM",
      duration: "40 دقيقة",
      attendance: 19,
      absence: 3,
      status: "منتهية",
    },
    {
      id: 6,
      title: "الميل الحسابي",
      date: "السبت 24 مايو 2026",
      time: "06:00 PM",
      duration: "60 دقيقة",
      attendance: 22,
      absence: 0,
      status: "منتهية",
    },
  ],
  onView,
  onEdit,
  onDelete,
}) => {

  return (
    <div dir="rtl" className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-200 text-right">
          <thead>
            <tr
              className=""
              style={{
                backgroundColor: '#F9FAFA',
                fontFamily: 'IBM Plex Sans Arabic, sans-serif'
              }}
            >
              {["عنوان الحصة", "التاريخ", "الوقت", "المدة", "حضور", "غياب", "الحالة", "الإجراءات"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-[#575F69] text-[14px] font-medium text-right uppercase tracking-wider"
                  style={{
                    fontWeight: 500,
                    lineHeight: '16px',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#575F69]">لا توجد حصص متاحة</td>
              </tr>
            ) : (
              lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* عنوان الحصة */}
                  <td
                    className="px-6 py-4 text-[#575F69]"
                    style={{
                      fontFamily: 'Tajawal, sans-serif',
                      fontWeight: 500,
                      fontSize: '18px',
                      lineHeight: '20px',
                   
                    }}
                  >
                    {lesson.title}
                  </td>

                 
                  {[lesson.date, lesson.time, lesson.duration,
                  (lesson.attendance === 0 && (lesson.absence === 0 || lesson.status === "قادمة") ? "--" : lesson.attendance),
                  (lesson.absence === 0 && (lesson.attendance === 0 || lesson.status === "قادمة") ? "--" : lesson.absence)
                  ].map((cellData, index) => (
                    <td
                      key={index}
                      className="px-6 py-4 text-[#575F69]"
                      style={{
                        fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '24px',
                        
                      }}
                    >
                      {cellData}
                    </td>
                  ))}

            
                  <td className="px-6 py-4 ">
                    <StatusBadge status={lesson.status} />
                  </td>

                
                  <td className="px-6 py-4 ">
                    <div className="flex items-center gap-2">
                      <ActionButton onClick={() => onView(lesson.id)} colorClass="text-[#575F69] hover:text-blue-600">
                        <HiOutlineEye size={18} />
                      </ActionButton>
                      <ActionButton onClick={() => onEdit(lesson.id)} colorClass="text-[#575F69] hover:text-amber-600">
                        <HiOutlinePencil size={18} />
                      </ActionButton>
                      <ActionButton onClick={() => onDelete(lesson.id)} colorClass="text-[#575F69] hover:text-red-600">
                        <HiOutlineTrash size={18} />
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


export default LessonsTable;