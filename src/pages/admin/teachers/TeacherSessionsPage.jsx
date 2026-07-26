import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  getClassrooms,
  getClassroomSessions,
} from "../../../services/APIService";
import { getTeacherMissedSessions } from "../../../utils/teacherMissedSessions";

const idOf = (value) =>
  value?.id ?? value?._id ?? (typeof value === "string" ? value : null);

const nameOf = (value) => {
  if (!value) return "المجموعة";
  if (typeof value === "string") return value;
  return value.ar || value.en || "المجموعة";
};

const TeacherSessionsPage = () => {
  const { teacherId, sessionStatus } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const teacherName = location.state?.teacherName || "المعلم";
  const isMissed = sessionStatus === "missed";

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        if (isMissed) {
          const missed = await getTeacherMissedSessions({ id: teacherId });
          if (active) setSessions(missed);
          return;
        }

        const classroomResponse = await getClassrooms({
          teacher: teacherId,
          limit: 100,
        });
        const body =
          classroomResponse.data?.data ?? classroomResponse.data ?? [];
        const returnedClassrooms = Array.isArray(body)
          ? body
          : body.classrooms || [];
        const matchingClassrooms = returnedClassrooms.filter((classroom) => {
          const ids = [
            idOf(classroom.teacher),
            idOf(classroom.teacher?.user),
            idOf(classroom.substituteTeacher),
            idOf(classroom.substituteTeacher?.user),
          ].filter(Boolean);
          return ids.some((id) => String(id) === String(teacherId));
        });
        const hasTeacherReferences = returnedClassrooms.some(
          (classroom) => classroom.teacher || classroom.substituteTeacher,
        );
        const classrooms = matchingClassrooms.length
          ? matchingClassrooms
          : hasTeacherReferences
            ? []
            : returnedClassrooms;
        const results = await Promise.allSettled(
          classrooms.map((classroom) =>
            getClassroomSessions(idOf(classroom)),
          ),
        );
        const completed = results.flatMap((result, index) => {
          if (result.status !== "fulfilled") return [];
          const classroom = classrooms[index];
          return (result.value.data?.data || [])
            .filter((session) => session.status === "completed")
            .map((session) => ({
              id: idOf(session),
              title: session.title || "حصة",
              classroomId: idOf(classroom),
              classroomName: nameOf(classroom.name),
              scheduledAt: session.scheduledDate || session.startAt,
              duration: session.duration,
            }));
        });
        if (active) setSessions(completed);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isMissed, teacherId]);

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <div className="w-full p-2 text-right" dir="rtl">
        <h1 className="text-xl font-semibold text-[#123C91] sm:text-[24px]">
          {isMissed ? "الحصص الفائتة" : "الحصص المكتملة"} - {teacherName}
        </h1>
        <p className="mt-2 text-sm text-[#575F69]">
          {isMissed
            ? "الحصص التي مر موعدها ولم يبدأها المعلم."
            : "الحصص التي أكملها المعلم."}
        </p>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border bg-white py-16 text-[#575F69]">
            <Loader2 size={18} className="animate-spin" />
            جاري تحميل الحصص...
          </div>
        ) : sessions.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white py-16 text-center text-[#575F69]">
            لا توجد حصص لعرضها.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-[#F9FAFA]">
                  <tr>
                    {["اسم الحصة", "المجموعة", "التاريخ والوقت", "الحالة"].map((header) => (
                      <th key={header} className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#575F69]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {session.classroomId && session.id ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/classrooms/${session.classroomId}/sessions/${session.id}`,
                              )
                            }
                            className="text-[#123C91] hover:underline"
                          >
                            {session.title}
                          </button>
                        ) : (
                          <span className="text-[#1F2937]">{session.title}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {session.classroomId ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/admin/groups/${session.classroomId}/lessons`, {
                                state: { groupName: session.classroomName },
                              })
                            }
                            className="font-medium text-[#123C91] hover:underline"
                          >
                            {session.classroomName}
                          </button>
                        ) : (
                          session.classroomName
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-[#575F69]">
                        {session.scheduledAt
                          ? new Date(session.scheduledAt).toLocaleString("ar-EG", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isMissed
                            ? "bg-red-50 text-red-500"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {isMissed ? "فائتة (انتهت)" : "مكتملة"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeacherSessionsPage;
