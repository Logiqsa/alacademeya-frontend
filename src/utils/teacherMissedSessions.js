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

  const classroomResults = await Promise.allSettled(
    teacherIds.map((teacherId) =>
      getClassrooms({ teacher: teacherId, limit: 100 }),
    ),
  );
  const returnedClassrooms = [];
  const seenClassrooms = new Set();
  classroomResults.forEach((result) => {
    if (result.status !== "fulfilled") return;
    const body = result.value.data?.data ?? result.value.data ?? [];
    const list = Array.isArray(body) ? body : body.classrooms || [];
    list.forEach((classroom) => {
      const classroomId = idOf(classroom);
      const key = classroomId || classroom;
      if (seenClassrooms.has(key)) return;
      seenClassrooms.add(key);
      returnedClassrooms.push(classroom);
    });
  });
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
    const sessionsBody = result.value.data?.data ?? result.value.data ?? [];
    const sessions = Array.isArray(sessionsBody)
      ? sessionsBody
      : sessionsBody.sessions || [];

    return sessions.flatMap((session) => {
      const sessionId = idOf(session);
      if (sessionId && seen.has(sessionId)) return [];

      const scheduledValue =
        session.scheduledDate ||
        session.scheduledAt ||
        session.startAt ||
        session.startTime ||
        session.date;
      const scheduledAt = new Date(scheduledValue);
      const isPast =
        !Number.isNaN(scheduledAt.getTime()) &&
        scheduledAt.getTime() < Date.now();
      const status = String(session.status || "").toLowerCase();
      // missed = لم يبدأ في الموعد/بدأ متأخرًا، أما not_started و
      // expired_schedule فتعني أن الموعد انتهى من غير عقد الحصة.
      const isMissed =
        ["missed", "not_started", "expired_schedule", "absent"].includes(
          status,
        ) ||
        (isPast && ["scheduled", "upcoming", "pending"].includes(status));
      if (!isMissed) return [];

      if (sessionId) seen.add(sessionId);
      return [{
        id: sessionId || `${index}-${scheduledValue}`,
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
