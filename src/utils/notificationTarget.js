const idOf = (value) =>
  value?.id ?? value?._id ?? (typeof value === "string" ? value : null);

const firstId = (notification, keys) => {
  for (const key of keys) {
    const value = idOf(notification[key]);
    if (value) return value;
    const dataValue = idOf(notification.data?.[key]);
    if (dataValue) return dataValue;
    const metadataValue = idOf(notification.metadata?.[key]);
    if (metadataValue) return metadataValue;
  }
  return null;
};

export const getNotificationChatState = (notification) => {
  const type = String(notification.type ?? "").toLowerCase();
  const roomId = firstId(notification, ["roomId", "room", "chatRoom"]);
  const classroomId = firstId(notification, ["classroomId", "classroom"]);
  const isChat = ["chat", "message", "new_message"].includes(type) || roomId;
  if (!isChat) return undefined;

  return {
    openRoomId: roomId,
    openClassroomId: classroomId,
    openClassroomName:
      notification.classroomName ??
      notification.data?.classroomName ??
      notification.metadata?.classroomName,
  };
};

export const getNotificationTarget = (notification, role) => {
  const eventType = notificationTypeOf(notification);
  const type = String(notification.type ?? "").toLowerCase();
  const roomId = firstId(notification, ["roomId", "room", "chatRoom"]);
  const assignmentId = firstId(notification, ["assignmentId", "assignment"]);
  const classroomId = firstId(notification, ["classroomId", "classroom"]);
  const sessionId = firstId(notification, ["sessionId", "session"]);
  const courseId = firstId(notification, ["courseId", "course"]);
  const courseSlug = firstId(notification, ["courseSlug", "slug"]);

  if (["chat", "message", "new_message"].includes(type) || roomId) {
    return role === "teacher" ? "/teacher/messages" : `/${role}/messages`;
  }

  if (["WITHDRAWAL_REQUEST_CREATED", "NEW_WITHDRAWAL_REQUEST", "WITHDRAWAL_APPROVED", "WITHDRAWAL_REJECTED", "WITHDRAWAL_PAID"].includes(eventType)) {
    return role === "admin"
      ? "/admin/course-finances/withdrawals"
      : "/teacher/earnings";
  }

  const explicitTarget =
    notification.targetUrl ??
    notification.url ??
    notification.link ??
    notification.data?.targetUrl ??
    notification.data?.url;
  if (typeof explicitTarget === "string" && explicitTarget.startsWith("/")) {
    return explicitTarget;
  }

  if (eventType === "CERTIFICATE_ISSUED") {
    return role === "student" && courseId
      ? `/certificate/${encodeURIComponent(courseId)}`
      : role === "student" ? "/student-dashboard/courses" : null;
  }

  if (["COURSE_PURCHASE_SUCCESS", "QUIZ_PASSED", "QUIZ_ATTEMPTS_EXHAUSTED", "COURSE_COMPLETED"].includes(eventType)) {
    if (role === "student") return courseId ? `/learn/${encodeURIComponent(courseId)}` : "/student-dashboard/courses";
    if (role === "parent") return courseSlug ? `/courses/${encodeURIComponent(courseSlug)}` : "/courses";
  }

  if (["NEW_COURSE_SALE", "NEW_COURSE_REVIEW"].includes(eventType)) {
    if (role === "teacher") return courseId ? `/teacher/courses/${encodeURIComponent(courseId)}` : "/teacher/courses";
    if (role === "admin") return courseId ? `/admin/courses/${encodeURIComponent(courseId)}` : "/admin/courses";
  }
  if (eventType === "COURSE_PURCHASE_SUCCEEDED" && role === "admin") {
    return courseId
      ? `/admin/course-finances?courseId=${encodeURIComponent(courseId)}`
      : "/admin/course-finances";
  }
  if (eventType === "COURSE_SUBMITTED_FOR_REVIEW" && role === "admin") {
    return courseId ? `/admin/courses/${encodeURIComponent(courseId)}` : "/admin/courses";
  }
  if (["COURSE_APPROVED", "COURSE_REJECTED"].includes(eventType) && role === "teacher") {
    return courseId ? `/teacher/courses/${encodeURIComponent(courseId)}` : "/teacher/courses";
  }

  if (eventType === "COURSE_ACCESS_GRANT_FAILED") {
    if (role === "admin") return courseId ? `/admin/courses/${encodeURIComponent(courseId)}` : "/admin/courses";
    if (role === "student") return courseSlug ? `/courses/${encodeURIComponent(courseSlug)}` : "/student-dashboard/courses";
  }

  if (assignmentId || ["assignment", "submission", "grading", "grade"].includes(type)) {
    if (role === "teacher" && assignmentId) {
      return `/teacher/assignments/${assignmentId}`;
    }
    if (role === "student") {
      return assignmentId
        ? `/student/assignments?assignment=${encodeURIComponent(assignmentId)}`
        : "/student/assignments";
    }
  }

  if (classroomId && sessionId) {
    if (role === "teacher") {
      return `/teacher/groups/${classroomId}/lessons/${sessionId}`;
    }
    if (role === "student") {
      return `/student/groups/${classroomId}/lessons/${sessionId}`;
    }
    if (role === "parent") {
      return `/parent/classrooms/${classroomId}/sessions/${sessionId}`;
    }
  }

  if (classroomId) {
    if (role === "teacher") return `/teacher/groups/${classroomId}/lessons`;
    if (role === "student") return `/student/groups/${classroomId}/lessons`;
  }

  return null;
};
import { notificationTypeOf } from "./notificationTypes.js";
