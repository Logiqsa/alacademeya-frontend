export const sanitizeTeachingSelections = (items) => items.map((curriculum) => ({
  ...curriculum,
  stages: (curriculum.stages || []).filter((stage) => stage.stage),
}));

export const validTeachingSelections = (items) => items.length > 0 && items.every((curriculum) =>
  curriculum.curriculum && curriculum.stages.length > 0 && curriculum.stages.every((stage) =>
    stage.stage && stage.grades.length > 0 && stage.grades.every((grade) => grade.grade && grade.subjects.length > 0)));
