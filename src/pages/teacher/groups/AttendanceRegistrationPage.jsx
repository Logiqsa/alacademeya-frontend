import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClassroomStudents,
} from "../../../services/APIService"; // عدّل المسار حسب مكان ملفك لو مختلف
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";

// ─── Radio صغير مخصص (حاضر / غائب) ─────────────────────────────────────────────
const StatusRadio = ({ checked, onChange, color }) => (
  <button
    type="button"
    onClick={onChange}
    className="w-full flex items-center justify-center"
  >
    <span
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        checked ? "border-transparent" : "border-gray-300"
      }`}
    >
      {checked && (
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
// صفحة كاملة (مش modal) لتسجيل حضور طلاب الحصة، بنفس تصميم الصورة المرفقة.
const AttendanceRegistrationPage = () => {
  const { groupId, lessonId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({}); // { studentId: "present" | "absent" }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const res = await getClassroomStudents(groupId);
        const list = res.data?.data || res.data || [];
        if (cancelled) return;

        const normalized = list.map((s) => ({
          id: s.id || s._id || s.student?.id || s.student?._id,
          fullName:
            s.fullName ||
            s.user?.fullName ||
            s.student?.user?.fullName ||
            "طالب بدون اسم",
        }));

        setStudents(normalized);
      } catch (err) {
        console.error("فشل تحميل طلاب المجموعة:", err);
        setError("تعذر تحميل قائمة الطلاب");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  const setStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const goBack = () => {
    navigate(`/teacher/groups/${groupId}/lessons/${lessonId}`);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const records = students.map((s) => ({
        student: s.id,
        status: statusMap[s.id] || "absent",
      }));

      // ⚠️ مفيش endpoint جاهز لتسجيل الحضور بشكل جماعي في APIService حاليًا.
      // لازم تتأكد من شكل الـ endpoint الصح من الباك (URL + body) وتضيفه هناك،
      // مثال متوقع:
      // export const recordSessionAttendance = (sessionId, payload) =>
      //   API.post(`/sessions/${sessionId}/attendance`, payload);
      // وبعدين تستدعيه هنا:
      // await recordSessionAttendance(lessonId, { records });

      console.log("سيتم إرسال بيانات الحضور دي للباك:", {
        session: lessonId,
        records,
      });

      goBack();
    } catch (err) {
      console.error("فشل حفظ الحضور:", err);
      setError(
        err?.response?.data?.message || "تعذر حفظ الحضور، حاول مرة أخرى",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div
        dir="rtl"
        className="w-full font-['IBM_Plex_Sans_Arabic'] text-right"
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="text-[22px] font-semibold text-[#1F2937] mb-5">
            تسجيل الحضور
          </h1>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-[#575F69]">
                جاري تحميل الطلاب...
              </div>
            ) : error ? (
              <div className="py-16 text-center text-sm text-red-500">
                {error}
              </div>
            ) : students.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#575F69]">
                لا يوجد طلاب في هذه المجموعة
              </div>
            ) : (
              <div className="overflow-x-auto px-6 pt-6">
                <table className="w-full text-right">
                  <thead>
                    <tr>
                      <th className="text-[14px] font-medium text-[#1F2937] text-right pb-4">
                        الطالب
                      </th>
                      <th className="text-[14px] font-medium text-[#1F2937] text-center pb-4">
                        حاضر
                      </th>
                      <th className="text-[14px] font-medium text-[#1F2937] text-center pb-4">
                        غائب
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td
                          className="py-3 text-[14px] text-[#1F2937]"
                          style={{ fontFamily: "Tajawal, sans-serif" }}
                        >
                          {s.fullName}
                        </td>
                        <td className="py-3">
                          <StatusRadio
                            checked={statusMap[s.id] === "present"}
                            onChange={() => setStatus(s.id, "present")}
                            color="#00A63E"
                          />
                        </td>
                        <td className="py-3">
                          <StatusRadio
                            checked={statusMap[s.id] === "absent"}
                            onChange={() => setStatus(s.id, "absent")}
                            color="#D32F2F"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center gap-3 px-6 py-5 mt-2">
              <button
                onClick={goBack}
                disabled={saving}
                className="flex-1 h-12 rounded-lg border border-gray-200 text-[#374151] font-medium text-[14px] hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading || students.length === 0}
                className="flex-1 h-12 rounded-lg bg-[#123C91] text-white font-medium text-[14px] hover:bg-[#0f3280] transition-colors disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default AttendanceRegistrationPage;