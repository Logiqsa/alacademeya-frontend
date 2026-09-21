const entityId = (value) =>
  value && typeof value === "object" ? value._id || value.id : value;

export const placeCourseQuizzes = (sections, quizzes, mapQuiz = (quiz) => quiz) => {
  const result = (sections || []).map((section) => ({
    ...section,
    lessons: [...(section.lessons || [])],
  }));

  for (const quiz of quizzes || []) {
    const linkedSectionId = entityId(quiz.section || quiz.sectionId);
    const linkedLessonId = entityId(quiz.lesson || quiz.lessonId);
    const owner = result.find((section) =>
      (linkedSectionId && String(section._id || section.id) === String(linkedSectionId)) ||
      (linkedLessonId && section.lessons.some((lesson) => String(lesson._id || lesson.id) === String(linkedLessonId))),
    );
    const destination = owner || result[0];
    if (destination) {
      destination.lessons.push({
        ...mapQuiz(quiz),
        _sectionUnlinked: !owner,
      });
    }
  }

  return result;
};
