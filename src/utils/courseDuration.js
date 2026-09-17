export const formatCourseDuration = (course) => {
  const seconds = Number(course?.durationSeconds);
  const hours = Number(course?.duration);
  const duration = Number.isFinite(seconds) && seconds > 0
    ? seconds / 3600
    : hours;
  if (!Number.isFinite(duration) || duration <= 0) return 'المدة غير محددة';
  return `${Math.max(0.01, Math.round(duration * 100) / 100)} ساعة`;
};
