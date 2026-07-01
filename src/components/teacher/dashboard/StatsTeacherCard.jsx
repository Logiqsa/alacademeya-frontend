import { useEffect, useState } from "react";
import { Star, DollarSign, Clock3, Users } from "lucide-react";
import { getMyClassrooms, getClassroomStudents } from "../../../services/authService";

// ⚠️ ملحوظة مهمة: مفيش endpoints حاليًا لـ:
//   - عدد ساعات التدريس الفعلية
//   - إجمالي الأرباح
//   - متوسط التقييم
// لما تتضاف من الباك إند (زي GET /teachers/me/stats مثلاً) هنربطها هنا بنفس الطريقة.
// دلوقتي بنحسب فقط "إجمالي عدد الطلاب" لأنه فعلاً ممكن نجمعه من classrooms/my + classrooms/:id/students

const StatsTeacherCard = () => {
  const [totalStudents, setTotalStudents] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadStudentsCount = async () => {
      setLoading(true);
      try {
        // GET /classrooms/my -> كل مجموعات المعلّم
        const classroomsRes = await getMyClassrooms();
        const classrooms = classroomsRes.data?.data || [];

        if (cancelled) return;

        // بنجيب طلاب كل مجموعة بالتوازي ونجمعهم (طالب ممكن يتكرر في أكتر من مجموعة،
        // لو محتاجين عدد فريد بس، لازم نجمع الـ ids في Set بدل ما نجمع الطول مباشرة)
        const studentsResults = await Promise.allSettled(
          classrooms.map((c) => getClassroomStudents(c.id))
        );

        const uniqueStudentIds = new Set();
        studentsResults.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const students = result.value.data?.data || [];
            students.forEach((s) => {
              if (s.id) uniqueStudentIds.add(s.id);
            });
          } else {
            console.error(
              `getClassroomStudents failed for classroom ${classrooms[idx]?.id}:`,
              result.reason
            );
          }
        });

        if (cancelled) return;
        setTotalStudents(uniqueStudentIds.size);
      } catch (err) {
        console.error("Failed to load teacher stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadStudentsCount();
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
      // ⚠️ TODO: مفيش endpoint حاليًا لساعات التدريس الفعلية
      value: "--",
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