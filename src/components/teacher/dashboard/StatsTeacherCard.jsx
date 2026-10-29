import { useEffect, useState } from "react";
import { Star, DollarSign, Clock3, Users } from "lucide-react";
import { getMyTeacherDashboardSummary } from "../../../services/APIService";

// ⚠️ ملحوظة مهمة: مفيش endpoints حاليًا لـ:
//   - إجمالي الأرباح
//   - متوسط التقييم

const formatHours = (minutes) => {
  const hours = minutes / 60;
  return new Intl.NumberFormat("ar-EG", {
    maximumFractionDigits: 1,
  }).format(hours);
};

const StatsTeacherCard = () => {
  const [totalStudents, setTotalStudents] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDashboardSummary = async () => {
      setLoading(true);
      try {
        const response = await getMyTeacherDashboardSummary();
        if (cancelled) return;
        const summary = response.data?.data ?? response.data ?? {};
        setTotalStudents(summary.totalStudents ?? 0);
        setTotalMinutes(summary.totalTeachingMinutes ?? 0);
      } catch (err) {
        console.error("Failed to load teacher dashboard summary:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboardSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: "إجمالي عدد الطلاب",
      value: loading ? "--" : totalStudents,
      icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "عدد الساعات",
      value: loading || totalMinutes === null ? "--" : formatHours(totalMinutes),
      icon: Clock3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "إجمالي الأرباح",
      // ⚠️ TODO: مفيش endpoint حاليًا للأرباح
      value: "--",
      icon: DollarSign,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      title: "متوسط التقييم",
      // ⚠️ TODO: مفيش endpoint حاليًا للتقييمات
      value: "--",
      icon: Star,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className={`p-3 rounded-lg ${card.iconBg}`}>
              <Icon size={24} className={card.iconColor} />
            </div>

            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-800">{card.value}</h3>
              <p className="text-gray-500 text-sm mt-1">{card.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsTeacherCard;
