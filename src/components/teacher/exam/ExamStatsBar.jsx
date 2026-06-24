import { Clock, CheckCircle, Zap, ClipboardCheck } from "lucide-react";

const ExamStatsBar = ({ pendingCorrection = 2, completed = 9, active = 1, total = 12 }) => {
  const stats = [
    { label: "قيد التصحيح", value: pendingCorrection, color: "text-orange-500", bg: "bg-orange-50", icon: Clock },
    { label: "مكتمل", value: completed, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
    { label: "نشط", value: active, color: "text-blue-600", bg: "bg-blue-50", icon: Zap },
    { label: "إجمالي الاختبارات", value: total, color: "text-teal-600", bg: "bg-teal-50", icon: ClipboardCheck },
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

export default ExamStatsBar;