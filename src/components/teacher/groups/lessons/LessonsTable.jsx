// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    "قادمة":       "bg-blue-100 text-blue-700",
    "مباشر الآن":  "bg-green-100 text-green-700",
    "منتهية":      "bg-gray-100 text-gray-600",
    "ملغية":       "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── LessonsTable ─────────────────────────────────────────────────────────────
/**
 * Props:
 *  lessons: Array<{ id, title, date, time, duration, attendance, absence, status }>
 *  onView:   (id) => void
 *  onEdit:   (id) => void
 *  onDelete: (id) => void
 */
const LessonsTable = ({ lessons = [], onView, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {["عنوان الحصة", "التاريخ", "الوقت", "المدة", "حضور", "غياب", "الإجراءات", "الحالة"].map((h) => (
            <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lessons.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
              لا توجد حصص
            </td>
          </tr>
        ) : (
          lessons.map((lesson, i) => (
            <tr
              key={lesson.id}
              className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
            >
              <td className="px-4 py-3 font-medium text-gray-800">{lesson.title}</td>
              <td className="px-4 py-3 text-gray-600">{lesson.date}</td>
              <td className="px-4 py-3 text-gray-600">{lesson.time}</td>
              <td className="px-4 py-3 text-gray-600">{lesson.duration} دقيقة</td>
              <td className="px-4 py-3 text-gray-600">{lesson.attendance ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600">{lesson.absence ?? "—"}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {onView && (
                    <button onClick={() => onView(lesson.id)} className="text-gray-400 hover:text-blue-500 transition" title="عرض">
                      <EyeIcon />
                    </button>
                  )}
                  {onEdit && (
                    <button onClick={() => onEdit(lesson.id)} className="text-gray-400 hover:text-yellow-500 transition" title="تعديل">
                      <EditIcon />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(lesson.id)} className="text-gray-400 hover:text-red-500 transition" title="حذف">
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lesson.status} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default LessonsTable;