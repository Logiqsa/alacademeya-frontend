const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

/**
 * Props:
 *  total, active, excluded  (all numbers)
 */
const StudentStatsBar = ({ total = 22, active = 18, excluded = 4 }) => {
  const stats = [
    { label: "إجمالي الطلاب",     value: total,    color: "text-blue-600",  bg: "bg-blue-50" },
    { label: "الطلاب النشطين",    value: active,   color: "text-green-600", bg: "bg-green-50" },
    { label: "الطلاب المستبعدون", value: excluded, color: "text-red-500",   bg: "bg-red-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
            <UserIcon className={`w-5 h-5 ${s.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentStatsBar;