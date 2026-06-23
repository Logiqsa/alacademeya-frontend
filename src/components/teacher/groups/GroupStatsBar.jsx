import { Users, CheckCircle, Clock, FileText } from "lucide-react";

const GroupStatsBar = ({ total = 12, active = 6, suspended = 3, pending = 3 }) => {
  const stats = [
    { label: "إجمالي المجموعات", value: total, color: "text-teal-600", bg: "bg-teal-50", icon: Users },
    { label: "مجموعات نشطة", value: active, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
    { label: "مجموعات معلقة", value: suspended, color: "text-orange-500", bg: "bg-orange-50", icon: Clock },
    { label: "قيد التسجيل", value: pending, color: "text-purple-600", bg: "bg-purple-50", icon: FileText },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

export default GroupStatsBar;