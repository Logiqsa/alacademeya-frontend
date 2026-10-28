import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import TeacherLayout from "../../layout/TeacherLayout";
import AdminLayout from "../../../admin/layout/AdminLayout";

import {
  createOrUpdateClassroomSchedule,
  getClassroom,
  getClassroomSchedule,
} from "../../../../services/APIService";

const DAYS = [
  { key: "saturday", label: "السبت" },
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الاثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
];

const CreateSchedulePage = ({ role = "teacher" }) => {
  const Layout = role === "admin" ? AdminLayout : TeacherLayout;
  const navigate = useNavigate();
  const { groupId } = useParams();

  const [groupName, setGroupName] = useState("مجموعة");
  const [timesByDay, setTimesByDay] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getClassroomSchedule(groupId)
      .then((response) => {
        if (!active) return;
        const schedule = response.data?.data?.schedule;
        if (Array.isArray(schedule) && schedule.length) {
          setEditing(true);
          setTimesByDay(
            Object.fromEntries(
              schedule.map((item) => [item.day, item.startTime || ""]),
            ),
          );
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404 && active) {
          setError(err.response?.data?.message || "تعذر تحميل الجدول الحالي");
        }
      })
      .finally(() => active && setInitialLoading(false));

    return () => {
      active = false;
    };
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
      })
      .catch(() => {
        if (active) setGroupName("مجموعة");
      });
    return () => {
      active = false;
    };
  }, [groupId]);

  const toggleDay = (key) => {
    setTimesByDay((current) => {
      if (Object.hasOwn(current, key)) {
        const remaining = { ...current };
        delete remaining[key];
        return remaining;
      }
      return { ...current, [key]: "" };
    });
  };

  const updateDayTime = (key, startTime) => {
    setTimesByDay((current) => ({ ...current, [key]: startTime }));
  };

  const handleSubmit = async () => {
    const selectedDays = DAYS.filter((day) => Object.hasOwn(timesByDay, day.key));
    if (selectedDays.length === 0) {
      setError("من فضلك اختر يوم دراسة واحد على الأقل");
      return;
    }
    if (selectedDays.some((day) => !timesByDay[day.key])) {
      setError("من فضلك اختر وقتًا لكل يوم محدد");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // ✅ تم التأكيد من الـ Postman collection: شكل الـ body الصحيح هو
      // { schedule: [ { day, startTime }, ... ] }
      const schedule = selectedDays.map(({ key }) => ({
        day: key,
        startTime: timesByDay[key],
      }));

      await createOrUpdateClassroomSchedule(groupId, { schedule });
      navigate(
        role === "admin"
          ? `/admin/groups/${groupId}/lessons`
          : `/teacher/groups/${groupId}/lessons`,
        {
          state: {
            showSuccessToast: true,
            successMessage: editing
              ? "تم تعديل جدول الحصص بنجاح"
              : "تم إنشاء جدول الحصص بنجاح",
            groupName,
          },
        },
      );
    } catch (err) {
      console.error(
        "createOrUpdateClassroomSchedule failed:",
        err.response?.data || err,
      );
      setError(err.response?.data?.message || "حدث خطأ أثناء إنشاء الجدول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 className="font-[IBM_Plex_Sans_Arabic] text-xl sm:text-2xl font-bold text-[#123C91]">
        {editing ? "تعديل الجدول" : "إنشاء جدول"}
      </h2>

      {initialLoading ? (
        <p className="py-16 text-center text-[#575F69]">جاري تحميل الجدول...</p>
      ) : (
        <div
          className="mx-auto p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm mt-6 sm:mt-8"
          dir="rtl"
        >
          <div className="space-y-5 sm:space-y-6">
            {/* أيام الدراسة */}
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] mb-3">
                أيام الدراسة
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {DAYS.map((day) => (
                  <div
                    key={day.key}
                    className="rounded-xl border border-[#E5E5E5] bg-[#F9FAFA] p-3 transition-colors has-[:checked]:border-[#123C91] has-[:checked]:bg-[#EAF4FF]"
                  >
                    <label className="flex cursor-pointer items-center gap-3 select-none">
                      <input
                        type="checkbox"
                        checked={Object.hasOwn(timesByDay, day.key)}
                        onChange={() => toggleDay(day.key)}
                        className="h-4 w-4 rounded border-[#8C9198] text-[#123C91] focus:ring-[#123C91] accent-[#123C91]"
                      />
                      <span className="text-sm font-medium text-[#1A1A1A]">{day.label}</span>
                    </label>
                    {Object.hasOwn(timesByDay, day.key) && (
                      <label className="mt-3 block">
                        <span className="mb-1.5 block text-xs text-[#575F69]">وقت الحصة</span>
                        <div className="relative">
                          <input
                            type="time"
                            value={timesByDay[day.key]}
                            onChange={(event) => updateDayTime(day.key, event.target.value)}
                            className="h-11 w-full rounded-lg border border-[#E5E5E5] bg-white px-3 pl-9 text-sm text-[#1A1A1A] outline-none transition-all focus:border-[#123C91] focus:ring-1 focus:ring-[#123C91]"
                          />
                          <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9198]" size={15} />
                        </div>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-6 border-t border-gray-100">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto sm:px-16 lg:px-40 h-12 sm:h-12.5 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg order-2 sm:order-1"
            >
              إلغاء
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:flex-1 h-12 sm:h-12.5 bg-[#123C91] text-white [&_svg]:text-white rounded-lg font-bold text-sm sm:text-[16px] flex items-center justify-center gap-2 shadow-sm order-1 sm:order-2 disabled:opacity-60"
            >
              {loading
                ? "جاري الحفظ..."
                : editing
                  ? "حفظ تعديلات الجدول"
                  : "إنشاء جدول الحصص"}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CreateSchedulePage;
