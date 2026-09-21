export const UNIVERSITY_YEAR_OPTIONS = [
  { value: "preparatory", label: "السنة الإعدادية" },
  { value: "first", label: "السنة الأولى" },
  { value: "second", label: "السنة الثانية" },
  { value: "third", label: "السنة الثالثة" },
  { value: "fourth", label: "السنة الرابعة" },
  { value: "fifth", label: "السنة الخامسة" },
  { value: "sixth", label: "السنة السادسة" },
  { value: "internship", label: "سنة الامتياز" },
  { value: "postgraduate", label: "دراسات عليا" },
];

export const universityYearLabel = (value) =>
  UNIVERSITY_YEAR_OPTIONS.find((option) => option.value === value)?.label || value || "";
