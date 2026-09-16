export function countCompletedLessons(curriculum) {
  if (!Array.isArray(curriculum)) return null;

  const lessons = curriculum.flatMap((section) =>
    Array.isArray(section.lessons) ? section.lessons : [],
  );

  return {
    completedLessons: lessons.filter((lesson) => lesson.progress?.status === "completed").length,
    totalLessons: lessons.length,
  };
}
