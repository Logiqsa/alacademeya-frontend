import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import ParentLayout from "../../components/parent/layout/ParentLayout";
import LessonFiles from "../../components/teacher/groups/lessons/LessonFiles";
import LessonAssignments from "../../components/teacher/groups/lessons/LessonAssignments";
import LessonRecordings from "../../components/teacher/groups/lessons/LessonRecordings";
import { getAssignmentsByClassroom, getClassroom, getClassroomSessions, getSessionRecording } from "../../services/APIService";

const nameOf = (value) => typeof value === "string" ? value : value?.ar || value?.en || "المجموعة";

const SessionDetailsPage = ({ role }) => {
  const { classroomId, sessionId } = useParams();
  const Layout = role === "admin" ? AdminLayout : ParentLayout;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getClassroom(classroomId),
      getClassroomSessions(classroomId),
      getAssignmentsByClassroom(classroomId),
      getSessionRecording(sessionId),
    ]).then(([classroomResult, sessionsResult, assignmentsResult, recordingResult]) => {
      if (!active) return;
      if (sessionsResult.status === "rejected") throw sessionsResult.reason;
      const classroom = classroomResult.status === "fulfilled" ? classroomResult.value.data?.data || {} : {};
      const sessions = sessionsResult.value.data?.data || [];
      const session = sessions.find((item) => (item.id || item._id) === sessionId);
      if (!session) throw new Error("لم يتم العثور على الحصة");
      const assignments = assignmentsResult.status === "fulfilled" ? (assignmentsResult.value.data?.data || []).filter((assignment) => {
        const linkedSession = assignment.session?.id || assignment.session?._id || assignment.session;
        return linkedSession === sessionId;
      }) : [];
      setData({ classroom, session, assignments, recording: recordingResult.status === "fulfilled" ? recordingResult.value.data?.data || null : null });
    }).catch((err) => active && setError(err.response?.data?.message || err.message || "تعذر تحميل تفاصيل الحصة"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [classroomId, sessionId]);

  return <Layout><div className="mx-auto max-w-7xl space-y-5 p-2" dir="rtl">
    {loading ? <p className="py-16 text-center text-[#575F69]">جاري تحميل تفاصيل الحصة...</p> : error || !data ? <p className="py-16 text-center text-red-500">{error}</p> : <>
      <div className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-[#123C91]">{data.session.title}</h1><p className="mt-2 text-base font-bold text-[#575F69]">{nameOf(data.classroom.name)} • {new Date(data.session.scheduledDate).toLocaleString("ar-EG", { hour12: true })}</p></div><span className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-600">مكتملة</span></div>{data.session.description && <p className="mt-4 text-sm text-[#575F69]">{data.session.description}</p>}</div>
      <LessonFiles files={data.session.attachments || []} />
      <LessonAssignments assignments={data.assignments} />
      <LessonRecordings recording={data.recording} />
    </>}
  </div></Layout>;
};

export default SessionDetailsPage;
