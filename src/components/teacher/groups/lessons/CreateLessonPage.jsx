import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import TeacherLayout from "../../layout/TeacherLayout";
import {
  createClassroomSession,
  getClassroom,
  getClassroomSchedule,
} from "../../../../services/APIService"; // عدّل المسار حسب مكان ملفك

const DAY_LABELS = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الاثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

// JS Date.getDay(): 0=Sunday..6=Saturday
const TODAY_KEY_BY_JS_DAY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const CreateLessonPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [groupName, setGroupName] = useState("مجموعة");
  const [lessonTitle, setLessonTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [scheduledToday, setScheduledToday] = useState(true);
  const [checkingSchedule, setCheckingSchedule] = useState(true);

  const todayKey = TODAY_KEY_BY_JS_DAY[new Date().getDay()];

  useEffect(() => {
    let active = true;
    getClassroomSchedule(groupId)
      .then((response) => {
        if (!active) return;
        const schedule = response.data?.data?.schedule;
        const hasToday =
          Array.isArray(schedule) && schedule.some((item) => item.day === todayKey);
        setScheduledToday(hasToday);
      })
      .catch((err) => {
        // مفيش جدول للمجموعة أصلاً (404) → يبقى أكيد مفيش حصة النهارده
        if (active) setScheduledToday(err.response?.status !== 404);
      })
      .finally(() => active && setCheckingSchedule(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  useEffect(() => {
    let active = true;
    getClassroom(groupId)
      .then((response) => {
        if (!active) return;
        const name = response.data?.data?.name;
        const resolvedName =
          typeof name === "string" ? name : name?.ar || name?.en || "مجموعة";
        setGroupName(resolvedName);
        setLessonTitle((current) => current || `حصة ${resolvedName}`);
      })
      .catch((err) => {
        console.error("getClassroom failed:", err);
      });
    return () => {
      active = false;
    };
  }, [groupId]);

  const handleSubmit = async () => {
    setError(null);

    if (checkingSchedule) {
      setError("جاري التحقق من جدول المجموعة، حاول مرة أخرى بعد لحظات");
      return;
    }

    if (!scheduledToday) {
      setError(
        `لا يمكن إنشاء الحصة؛ اليوم (${DAY_LABELS[todayKey]}) غير موجود في جدول المجموعة`,
      );
      return;
    }

    if (!lessonTitle.trim()) {
      setError("من فضلك اكتب اسم الحصة");
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("classroom", groupId);
      payload.append("title", lessonTitle.trim());
      payload.append("description", "");

      await createClassroomSession(payload);

      navigate(`/teacher/groups/${groupId}/lessons`, {
        state: { showSuccessToast: true },
      });
    } catch (err) {
      console.error("createClassroomSession failed:", err);

      const code = err?.response?.data?.message;
      const KNOWN_ERRORS = {
        SESSION_ALREADY_EXISTS:
          "يوجد حصة أخرى مجدولة لهذه المجموعة في نفس الموعد، من فضلك اختر تاريخًا أو وقتًا مختلفًا",
        "There is no classroom schedule for today":
          "لا يوجد جدول لهذه المجموعة اليوم، من فضلك تأكد إن اليوم من أيام جدول المجموعة أو عدّل الجدول أولاً",
      };

      setError(
        KNOWN_ERRORS[code] ||
          code ||
          "حدث خطأ أثناء إنشاء الحصة، حاول مرة أخرى",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full h-12 border border-[#E5E5E5] rounded-[8px] px-4 py-3 text-sm text-[#1A1A1A] focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91] outline-none transition-all bg-[#F9FAFA] appearance-none placeholder:text-[#8C9198]";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  return (
    <TeacherLayout>
      <h2 className="font-[IBM_Plex_Sans_Arabic] text-xl sm:text-2xl font-bold text-[#123C91]">
        إنشاء حصة جديدة
      </h2>

      <div
        className="mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mt-6 sm:mt-8"
        dir="rtl"
      >
        {!checkingSchedule && !scheduledToday && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                لا يمكن إنشاء حصة اليوم ({DAY_LABELS[todayKey]})
              </p>
              <p className="text-xs text-amber-700 mt-1">
                اليوم غير موجود ضمن جدول المجموعة. يمكنك تعديل الجدول أولاً ثم إنشاء الحصة.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigate(`/teacher/groups/${groupId}/lessons/schedule/new`)
                }
                className="mt-2 text-xs font-semibold text-[#123C91] underline"
              >
                تعديل جدول المجموعة
              </button>
            </div>
          </div>
        )}

        <div className="pb-5 sm:pb-6 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#1A1A1A]">
            بيانات الحصة الأساسية
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6 pt-5 sm:pt-6">
          <div>
            <label className={labelClass}>اسم الحصة عند الإنشاء</label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(event) => setLessonTitle(event.target.value)}
              placeholder={`حصة ${groupName || "مجموعة"}`}
              className={inputClass}
            />
            <p className="mt-2 text-xs text-[#8C9198]">
              تاريخ ووقت الحصة يُحددان تلقائياً من جدول المجموعة لليوم، وعند الإنهاء ستظهر نافذة إضافة الوصف والمرفقات كالمعتاد.
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        {/* أزرار التحكم */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || checkingSchedule || !scheduledToday}
            className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white [&_svg]:text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-1 disabled:opacity-60"
          >
            {submitting
              ? "جاري الإنشاء..."
              : checkingSchedule
                ? "جاري التحقق من الجدول..."
                : "إنشاء حصة"}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <button
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-2"
          >
            إلغاء
          </button>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateLessonPage;
