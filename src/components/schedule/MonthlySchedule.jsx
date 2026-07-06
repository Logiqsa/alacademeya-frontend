import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, UserRound, Video } from "lucide-react";
import { getMonthlySchedule } from "../../services/APIService";

const DAY_NAMES = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

const STATUS_LABELS = {
  scheduled: "قادمة",
  completed: "مكتملة",
  cancelled: "ملغاة",
  live: "تُعقد الآن",
};

const monthLabel = (date) =>
  new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(date);

const MonthlySchedule = ({ title, subtitle }) => {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;

  useEffect(() => {
    let active = true;

    getMonthlySchedule({ year, month })
      .then((response) => {
        if (!active) return;
        const list = response.data?.data;
        const nextDays = Array.isArray(list) ? list : [];
        setDays(nextDays);

        const today = new Date().toLocaleDateString("en-CA");
        const preferred = nextDays.find((day) => day.date === today) ||
          nextDays.find((day) => day.lessons?.length) || nextDays[0];
        setSelectedDate(preferred?.date || "");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || "تعذر تحميل جدول الحصص");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [year, month]);

  const selectedDay = useMemo(
    () => days.find((day) => day.date === selectedDate),
    [days, selectedDate],
  );

  const changeMonth = (amount) => {
    setLoading(true);
    setError("");
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <div className="mx-auto max-w-7xl p-2 text-right font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      <h1 className="mb-2 text-2xl font-semibold text-[#123C91]">{title}</h1>
      <p className="mb-6 text-[#575F69]">{subtitle}</p>

      <section className="rounded-2xl border border-[#E5E5E5] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button type="button" onClick={() => changeMonth(-1)} className="rounded-lg border p-2 text-[#123C91]" aria-label="الشهر السابق"><ChevronRight size={20} /></button>
          <h2 className="flex items-center gap-2 font-semibold text-[#1F2937]"><CalendarDays size={20} />{monthLabel(monthDate)}</h2>
          <button type="button" onClick={() => changeMonth(1)} className="rounded-lg border p-2 text-[#123C91]" aria-label="الشهر التالي"><ChevronLeft size={20} /></button>
        </div>

        {loading ? <p className="py-12 text-center text-[#8C9198]">جاري تحميل الجدول...</p> : error ? <p className="py-12 text-center text-red-500">{error}</p> : (
          <>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {days.map((day) => (
                <button key={day.date} type="button" onClick={() => setSelectedDate(day.date)} className={`min-w-20 rounded-xl border px-3 py-2 text-center transition-colors ${selectedDate === day.date ? "border-[#123C91] bg-[#123C91] text-white" : "border-[#E5E5E5] bg-white text-[#575F69]"}`}>
                  <span className="block text-xs">{DAY_NAMES[day.dayName] || day.dayName}</span>
                  <span className="block text-lg font-semibold">{Number(day.date.slice(-2))}</span>
                  <span className="block text-[10px]">{day.lessons?.length || 0} حصة</span>
                </button>
              ))}
            </div>

            {!selectedDay?.lessons?.length ? <p className="py-10 text-center text-[#8C9198]">لا توجد حصص في هذا اليوم</p> : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {selectedDay.lessons.map((lesson, index) => (
                  <article key={lesson.id || `${lesson.classroom}-${lesson.startTime}-${index}`} className="rounded-2xl border border-[#E5E5E5] border-r-4 border-r-[#123C91] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div><h3 className="font-semibold text-[#1F2937]">{lesson.title || lesson.classroomName}</h3><p className="mt-1 text-sm text-[#8C9198]">{lesson.classroomName}</p></div>
                      <span className={`rounded-lg px-2 py-1 text-xs ${lesson.isVirtual ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-[#123C91]"}`}>{lesson.isVirtual ? "موعد مجدول" : STATUS_LABELS[lesson.status] || lesson.status}</span>
                    </div>
                    <div className="space-y-2 text-sm text-[#575F69]">
                      <p className="flex items-center gap-2"><Clock size={15} />{lesson.startTime}</p>
                      <p className="flex items-center gap-2"><UserRound size={15} />{lesson.teacher?.name || "—"}</p>
                      <p>{lesson.subject?.name?.ar || lesson.subject?.name?.en || "—"}</p>
                    </div>
                    {lesson.meetingLink && !lesson.isVirtual && <a href={lesson.meetingLink} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#123C91] px-4 py-2 text-sm text-white"><Video size={16} />دخول الحصة</a>}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default MonthlySchedule;
