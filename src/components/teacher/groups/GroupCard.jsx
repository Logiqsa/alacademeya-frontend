// ─── Status Badge (local helper) ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    "نشطة":          "bg-green-100 text-green-700",
    "معلقة":         "bg-orange-100 text-orange-600",
    "قيد التسجيل":  "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const CalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─── GroupCard ────────────────────────────────────────────────────────────────
/**
 * Props:
 *  group: { id, name, grade, subject, status, enrolled, max, nextLesson }
 *  onViewLessons: (id) => void
 *  onViewStudents: (id) => void
 *  onEdit: (id) => void        (optional)
 *  onDelete: (id) => void      (optional)
 */
const GroupCard = ({ group, onViewLessons, onViewStudents, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition">
    {/* Top row */}
    <div className="flex items-start justify-between">
      <StatusBadge status={group.status} />
      <div className="flex gap-2">
        {onDelete && (
          <button
            onClick={() => onDelete(group.id)}
            className="text-gray-400 hover:text-red-500 transition"
            title="حذف"
          >
            <TrashIcon />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(group.id)}
            className="text-gray-400 hover:text-blue-500 transition"
            title="تعديل"
          >
            <EditIcon />
          </button>
        )}
      </div>
    </div>

    {/* Name & subject */}
    <div>
      <h3 className="font-bold text-gray-800 text-base">{group.name}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{group.grade} • {group.subject}</p>
    </div>

    {/* Enrolled */}
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <UsersIcon />
      <span>{group.enrolled} / {group.max} طالباً</span>
    </div>

    {/* Next lesson */}
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <CalIcon />
      <span>{group.nextLesson}</span>
    </div>

    {/* Actions */}
    <div className="flex gap-2 mt-1">
      <button
        onClick={() => onViewLessons(group.id)}
        className="flex-1 bg-[#1F2937] text-white rounded-xl py-2 text-sm font-semibold hover:bg-[#374151] transition"
      >
        الحصص
      </button>
      <button
        onClick={() => onViewStudents(group.id)}
        className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2 text-sm font-semibold hover:bg-gray-50 transition"
      >
        الطلاب
      </button>
    </div>
  </div>
);

export default GroupCard;