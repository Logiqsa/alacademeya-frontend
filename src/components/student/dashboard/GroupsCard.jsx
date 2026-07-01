import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, GraduationCap, Loader2 } from "lucide-react";
import { getMyClassrooms, getClassroomSchedule } from "../../../services/authService";
import { generateLessonInstances } from "../../../utils/scheduleWeek";

const GroupCard = ({ groupId, name, teacher, status, statusType, nextLesson, done, total, remaining, onClick }) => {
  const isGroup = statusType === "group";

  return (
    <div
      dir="rtl"
      onClick={onClick}
      className="
        bg-white border border-[#E5E7EB] rounded-xl
        p-3.5 sm:p-4
        min-w-0
        flex flex-col
        cursor-pointer hover:border-[#123C91] hover:shadow-md transition-all
      "
    >
      <div className="mb-3">
        <span
          className={`
            inline-block px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-[12px] font-medium
            ${isGroup ? "bg-[#12C6B01A] text-[#12C6B0]" : "bg-[#EAF4FF] text-[#123C91]"}
          `}
        >
          {status}
        </span>
      </div>

      <h4
        className="text-[#1F2937] font-semibold text-[14px] sm:text-[15px] mb-1 truncate"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        title={name}
      >
        {name}
      </h4>

      <p
        className="text-[#123C91] text-[12.5px] sm:text-[13px] mb-3 truncate"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        أ/ {teacher}
      </p>

      <div className="border-t border-[#F1F1F1] mb-3" />

      <div className="flex items-center justify-start gap-1.5 text-[#9CA3AF] text-[11.5px] sm:text-[12px] mb-3">
        <Clock size={13} className="shrink-0" />
        <span className="truncate">{nextLesson}</span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto flex-wrap">
        <span className="flex items-center gap-1 text-[#6B7280] text-[11.5px] sm:text-[12px] shrink-0">
          <GraduationCap size={14} className="text-[#9CA3AF]" />
          {done}/{total} حصص
        </span>
        <span
          className={`
            px-2 sm:px-2.5 py-1 rounded-md text-[10.5px] sm:text-[11px] font-medium whitespace-nowrap
            ${remaining <= 2 ? "bg-[#FEEAEA] text-[#E54848]" : "bg-[#00A63E1A] text-[#00A63E]"}
          `}
        >
          متبقى {remaining} حصص
        </span>
      </div>
    </div>
  );
};

const getLocalizedName = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val.ar ?? val.en ?? "";
};

const getTeacherName = (classroom) =>
  classroom.teacher?.user?.fullName ?? classroom.teacher?.fullName ?? "";

const formatNextLesson = (instances = []) => {
  const now = new Date();
  const upcoming = instances.filter((i) => i.date >= now);

  if (upcoming.length === 0) return "لا توجد حصص قادمة";

  const next = upcoming[0];
  const diffDays = Math.round(
    (new Date(next.date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000
  );
  const time = next.date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `الحصة القادمة اليوم ${time}`;
  if (diffDays === 1) return `الحصة القادمة غداً ${time}`;
  return `الحصة القادمة بعد ${diffDays} أيام`;
};

// ⚠️ مفيش بيانات حضور/اكتمال فعلية، فبنعتبر أي حصة معادها فات = "تمت"
// وأي حصة معادها لسه جاي = "متبقية"، بناءً على نافذة 8 أسابيع سابقة + 4 قادمة
const buildGroupCardData = (classroom, instances = []) => {
  const now = new Date();
  const done = instances.filter((i) => i.date < now).length;
  const remaining = instances.filter((i) => i.date >= now).length;
  const total = done + remaining;
  const type = classroom.type ?? "group";

  return {
    groupId: classroom.id ?? classroom._id,
    name: getLocalizedName(classroom.name) || classroom.subject?.name?.ar || "بدون اسم",
    teacher: getTeacherName(classroom),
    status: type === "group" ? "مجموعة" : "خاصة",
    statusType: type,
    nextLesson: formatNextLesson(instances),
    done,
    total,
    remaining,
  };
};

const GroupsCard = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data } = await getMyClassrooms();
        const classrooms = data?.data ?? [];

        const withSchedule = await Promise.all(
          classrooms.map(async (classroom) => {
            const id = classroom.id ?? classroom._id;
            try {
              const res = await getClassroomSchedule(id);
              const schedule = res.data?.data?.schedule ?? [];
              const instances = generateLessonInstances(schedule, { weeksBack: 8, weeksForward: 4 });
              return buildGroupCardData(classroom, instances);
            } catch {
              return buildGroupCardData(classroom, []);
            }
          })
        );

        if (isMounted) setGroups(withSchedule);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGroups();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div dir="rtl" className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5 h-full">
      <div className="mb-4">
        <h3
          className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          مجموعاتك
        </h3>
        <p
          className="text-[#9CA3AF] text-[11.5px] sm:text-[12px] mt-1"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          المواد والمجموعات المشترك بها
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-[#9CA3AF] gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">جاري التحميل...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 text-[#E54848] text-[13px]">
          حدث خطأ أثناء تحميل المجموعات
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-8 text-[#9CA3AF] text-[13px]">
          لا توجد مجموعات مشترك بها حالياً
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
          {groups.map((g) => (
            <GroupCard
              key={g.groupId}
              {...g}
              onClick={() => navigate(`/student/groups/${g.groupId}/lessons`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsCard;