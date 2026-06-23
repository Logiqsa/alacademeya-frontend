const CalIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

/**
 * Props:
 *  total, upcoming, completed, cancelled  (all numbers)
 */
const LessonStatsBar = ({ total = 12, upcoming = 6, completed = 5, cancelled = 1 }) => {
  const stats = [
    { label: "إجمالي الحصص",   value: total,     color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "الحصص القادمة",  value: upcoming,  color: "text-green-600",  bg: "bg-green-50" },
    { label: "الحصص المكتملة", value: completed, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "الحصص الملغاة",  value: cancelled, color: "text-red-500",    bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
            <CalIcon className={`w-5 h-5 ${s.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonStatsBar;