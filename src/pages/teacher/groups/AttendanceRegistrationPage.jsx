import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClassroomStudents,
  getSessionAttendance,
  saveSessionAttendance,
} from "../../../services/APIService"; 
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

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      // تحميل الطلاب والحضور مع بعض
      const [studentsRes, attendanceRes] = await Promise.all([
        getClassroomStudents(groupId),
        getSessionAttendance(lessonId),
      ]);

      if (cancelled) return;

      const studentsList =
        studentsRes.data?.data || studentsRes.data || [];

      const normalized = studentsList.map((s) => ({
        id: s.id || s._id || s.student?.id || s.student?._id,
        fullName:
          s.fullName ||
          s.user?.fullName ||
          s.student?.user?.fullName ||
          "طالب بدون اسم",
      }));

      setStudents(normalized);

      const attendance = attendanceRes.data?.data || [];

      const map = {};

      attendance.forEach((item) => {
        const studentId =
          item.student?.id ||
          item.student?._id ||
          item.student;

        map[studentId] = item.status;
      });

      setStatusMap(map);
    } catch (err) {
      console.error(err);
      setError("تعذر تحميل البيانات");
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  load();

  return () => {
    cancelled = true;
  };
}, [groupId, lessonId]);

  const setStatus = (studentId, status) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const goBack = () => {
    navigate(`/teacher/groups/${groupId}/lessons/${lessonId}`);
  };

 const handleSave = async () => {
  try {
    setSaving(true);
    setError("");

    const attendance = students.map((student) => ({
      student: student.id,
      status: statusMap[student.id] || "absent",
    }));

    await saveSessionAttendance(lessonId, {
      attendance,
    });

    goBack();
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
        "حدث خطأ أثناء حفظ الحضور"
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