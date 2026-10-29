import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  getTeacher,
  getTeacherSessionList,
} from "../../../services/APIService";

const TeacherSessionsPage = () => {
  const { teacherId, sessionStatus } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState(
    location.state?.teacherName || "",
  );
  const isMissed = sessionStatus === "missed";

  useEffect(() => {
    if (location.state?.teacherName) return;

    let active = true;
    getTeacher(teacherId)
      .then((response) => {
        if (!active) return;
        const data = response.data?.data ?? response.data ?? {};
        const name =
          data.user?.fullName || data.fullName || data.name || "المعلم";
        setTeacherName(name);
      })
      .catch(() => {
        if (active) setTeacherName("المعلم");
      });

    return () => {
      active = false;
    };
  }, [location.state?.teacherName, teacherId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await getTeacherSessionList(
          teacherId,
          isMissed ? "missed" : "completed",
        );
        if (active) setSessions(response.data?.data ?? response.data ?? []);
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
      <Breadcrumbs
        homeTo="/admin-dashboard"
        dynamicLabels={{ teacherId: teacherName || "المعلم" }}
        nonClickableSegments={["sessions"]}
      />
      <div className="w-full p-2 text-right" dir="rtl">
        <h1 className="text-xl font-semibold text-[#123C91] sm:text-[24px]">
          {isMissed ? "الحصص التي لم تُعقد" : "الحصص المكتملة"} -{" "}
          {teacherName || "المعلم"}
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
                    {["اسم الحصة", "المجموعة", "التاريخ والوقت", "الحالة"].map(
                      (header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#575F69]"
                        >
                          {header}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((session) => (
                    <tr key={session.id || session.eventId} className="hover:bg-gray-50">
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
                          <span className="text-[#1F2937]">
                            {session.title}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {session.classroomId ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/groups/${session.classroomId}/lessons`,
                                {
                                  state: { groupName: session.classroomName },
                                },
                              )
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
                          ? new Date(session.scheduledAt).toLocaleString(
                              "ar-EG",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isMissed
                              ? "bg-red-50 text-red-500"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isMissed ? "لم تُعقد" : "مكتملة"}
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
