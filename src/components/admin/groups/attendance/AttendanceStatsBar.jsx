import { UserX, UserCheck, Users, Clock } from "lucide-react";

const AttendanceStatsBar = ({ absences = 10, attendances = 68, students = 14, sessions = 20 }) => {
  const stats = [
    { label: "إجمالي الغياب", value: absences, color: "text-red-500", bg: "bg-red-50", icon: UserX },
    { label: "إجمالي الحضور", value: attendances, color: "text-green-600", bg: "bg-green-50", icon: UserCheck },
    { label: "إجمالي الطلاب", value: students, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: Users },
    { label: "إجمالي الحصص", value: sessions, color: "text-teal-600", bg: "bg-teal-50", icon: Clock },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-lg ${s.bg}`}>
              <Icon size={24} className={s.color} />
            </div>

            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800">{s.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStatsBar;