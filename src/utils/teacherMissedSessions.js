import {
  getClassrooms,
  getClassroomSessions,
} from "../services/APIService";

const idOf = (value) =>
  value?.id ?? value?._id ?? (typeof value === "string" ? value : null);

const nameOf = (value) => {
  if (!value) return "المجموعة";
  if (typeof value === "string") return value;
  return value.ar || value.en || value.name?.ar || value.name?.en || "المجموعة";
};

const belongsToTeacher = (classroom, teacherIds) => {
  const classroomTeacherIds = [
    idOf(classroom.teacher),
    idOf(classroom.teacher?.user),
    idOf(classroom.substituteTeacher),
    idOf(classroom.substituteTeacher?.user),
  ].filter(Boolean);

  return classroomTeacherIds.some((id) =>
    teacherIds.some((teacherId) => String(id) === String(teacherId)),
  );
};

export const getTeacherMissedSessions = async (teacher) => {
  const teacherIds = [
    idOf(teacher),
    idOf(teacher.user),
    teacher.userId,
  ].filter(Boolean);
  if (!teacherIds.length) return [];

  const classroomsResponse = await getClassrooms({
    teacher: teacherIds[0],
    limit: 100,
  });
  const body =
    classroomsResponse.data?.data ?? classroomsResponse.data ?? [];
  const returnedClassrooms = Array.isArray(body)
    ? body
    : body.classrooms || [];
  const matchedClassrooms = returnedClassrooms.filter((classroom) =>
    belongsToTeacher(classroom, teacherIds),
  );
  const responseHasTeacherReferences = returnedClassrooms.some(
    (classroom) =>
      classroom.teacher ||
      classroom.substituteTeacher,
  );
  // بعض نسخ الـ API تطبق فلتر teacher في السيرفر لكنها لا تعيد teacher populated.
  // لو الاستجابة فيها مراجع معلمين بالفعل فلا نستخدم مجموعات غير مطابقة.
  const classrooms = matchedClassrooms.length
    ? matchedClassrooms
    : responseHasTeacherReferences
      ? []
      : returnedClassrooms;

  const sessionResults = await Promise.allSettled(
    classrooms.map((classroom) =>
      getClassroomSessions(idOf(classroom)),
    ),
  );

  const seen = new Set();
  return sessionResults.flatMap((result, index) => {
    if (result.status !== "fulfilled") return [];
    const classroom = classrooms[index];
    const sessions = result.value.data?.data || [];

    return sessions.flatMap((session) => {
      const sessionId = idOf(session);
      if (sessionId && seen.has(sessionId)) return [];

      const scheduledAt = new Date(session.scheduledDate || session.startAt);
      const isPast =
        !Number.isNaN(scheduledAt.getTime()) &&
        scheduledAt.getTime() < Date.now();
      const isMissed =
        session.status === "missed" ||
        (isPast && ["scheduled", "upcoming"].includes(session.status));
      if (!isMissed) return [];

      if (sessionId) seen.add(sessionId);
      return [{
        id: sessionId || `${index}-${session.scheduledDate}`,
        title: session.title || "حصة",
        classroomId: idOf(classroom),
        classroomName: nameOf(classroom.name),
        scheduledAt: Number.isNaN(scheduledAt.getTime())
          ? null
          : scheduledAt.toISOString(),
      }];
    });
  }).sort(
    (a, b) =>
      new Date(b.scheduledAt || 0).getTime() -
      new Date(a.scheduledAt || 0).getTime(),
  );
};
