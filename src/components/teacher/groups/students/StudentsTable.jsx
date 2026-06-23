// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    "نشط":    "bg-green-100 text-green-700",
    "مستبعد": "bg-red-100 text-red-600",
    "معلق":   "bg-orange-100 text-orange-500",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// ─── StudentsTable ────────────────────────────────────────────────────────────
/**
 * Props:
 *  students: Array<{ id, name, joinDate, phone, parent, status }>
 *  onView: (id) => void   ← ينتقل لصفحة تفاصيل الطالب
 */
const StudentsTable = ({ students = [], onView }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          {["اسم الطالب", "تاريخ الإنضمام", "رقم الهاتف", "ولي الأمر", "الحالة", "الإجراءات"].map((h) => (
            <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-gray-500">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {students.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
              لا يوجد طلاب
            </td>
          </tr>
        ) : (
          students.map((student, i) => (
            <tr
              key={student.id}
              onClick={() => onView?.(student.id)}
              className={`border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
            >
              <td className="px-4 py-3 font-semibold text-gray-800">{student.name}</td>
              <td className="px-4 py-3 text-gray-600">{student.joinDate}</td>
              <td className="px-4 py-3 text-gray-600 font-mono">{student.phone}</td>
              <td className="px-4 py-3 text-gray-600">{student.parent}</td>
              <td className="px-4 py-3">
                <StatusBadge status={student.status} />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onView?.(student.id)}
                  className="text-gray-400 hover:text-blue-500 transition"
                  title="عرض"
                >
                  <EyeIcon />
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default StudentsTable;