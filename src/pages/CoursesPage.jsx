import { useContext, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Minus, Search, SlidersHorizontal } from "lucide-react";
import CourseCard from "../components/courses/CourseCard";
import { fetchPublicCourses, fetchStudentCourses } from "../features/course-management/api/coursesApi";
import { AuthContext } from "../context/AuthContext";
import { universityYearLabel } from "../utils/courseAudience";

const prices = [
  { value: "free", label: "مجاني" },
  { value: "paid", label: "مدفوع" },
];
const audiences = [{value:"general",label:"عامة"},{value:"school",label:"مدرسية"},{value:"university",label:"جامعية"},{value:"graduate",label:"خريجون"}];
const COURSES_PER_PAGE = 50;
const optionsFromCourses = (items, field) => [...new Set(items.map((item) => item[field]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar"));

const CheckboxGroup = ({ title, items, selected, onToggle }) => (
  <fieldset className="border-b border-[#EDF0F4] pb-5">
    <legend className="mb-3 w-full text-sm font-bold text-[#1F2937]">{title}</legend>
    <div className="space-y-2.5">
      {items.map((item) => {
        const value = typeof item === "string" ? item : item.value;
        const label = typeof item === "string" ? item : item.label;
        return (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#667180]">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="h-4 w-4 accent-[#123C91]"
            />
            {label}
          </label>
        );
      })}
    </div>
  </fieldset>
);

export default function CoursesPage() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedClassifications, setSelectedClassifications] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedAudiences, setSelectedAudiences] = useState([]);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);
  const [selectedUniversityYears, setSelectedUniversityYears] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const classifications = useMemo(() => optionsFromCourses(courses, "category"), [courses]);
  const languages = useMemo(() => optionsFromCourses(courses, "language"), [courses]);
  const levels = useMemo(() => optionsFromCourses(courses, "level"), [courses]);
  const schoolCourses = useMemo(() => courses.filter((item) => item.audienceType === "school"), [courses]);
  const stages = useMemo(() => optionsFromCourses(schoolCourses, "academicStage"), [schoolCourses]);
  const gradeCourses = useMemo(() => schoolCourses.filter((item) => selectedStages.includes(item.academicStage)), [schoolCourses, selectedStages]);
  const grades = useMemo(() => optionsFromCourses(gradeCourses, "academicGrade"), [gradeCourses]);
  const subjectCourses = useMemo(() => gradeCourses.filter((item) => selectedGrades.includes(item.academicGrade)), [gradeCourses, selectedGrades]);
  const subjects = useMemo(() => optionsFromCourses(subjectCourses, "subject"), [subjectCourses]);
  const universityCourses = useMemo(() => courses.filter((item) => item.audienceType === "university"), [courses]);
  const faculties = useMemo(() => optionsFromCourses(universityCourses, "universityFaculty"), [universityCourses]);
  const facultyCourses = useMemo(() => universityCourses.filter((item) => selectedFaculties.includes(item.universityFaculty)), [universityCourses, selectedFaculties]);
  const majors = useMemo(() => optionsFromCourses(facultyCourses, "universityMajor"), [facultyCourses]);
  const majorCourses = useMemo(() => facultyCourses.filter((item) => selectedMajors.includes(item.universityMajor)), [facultyCourses, selectedMajors]);
  const universityYears = useMemo(() => optionsFromCourses(majorCourses, "universityYear").map((value) => ({ value, label: universityYearLabel(value) })), [majorCourses]);

  useEffect(() => {
    let active = true;
    fetchPublicCourses()
      .then((items) => active && setCourses(items))
      .catch((error) => active && setLoadError(error?.response?.data?.message || "تعذر تحميل الدورات"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    fetchStudentCourses()
      .then((items) => { if (active) setEnrolledCourses(items); })
      .catch(() => { /* Public courses remain available if enrollment lookup fails. */ });
    return () => { active = false; };
  }, [user]);

  const enrollmentByCourseId = useMemo(() => new Map(
    (user ? enrolledCourses : [])
      .filter((course) => course.enrollmentStatus !== 'revoked')
      .map((course) => [String(course.id), course]),
  ), [enrolledCourses, user]);

  const toggleValue = (setter) => (value) => {
    setCurrentPage(1);
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setSelectedClassifications([]);
    setSelectedSubjects([]);
    setSelectedStages([]);
    setSelectedGrades([]);
    setSelectedLanguages([]);
    setSelectedLevels([]);
    setSelectedPrices([]);
    setSelectedAudiences([]);
    setSelectedFaculties([]);
    setSelectedMajors([]);
    setSelectedUniversityYears([]);
  };

  const activeFilterCount =
    selectedClassifications.length +
    selectedSubjects.length +
    selectedStages.length +
    selectedGrades.length +
    selectedLanguages.length +
    selectedLevels.length +
    selectedPrices.length +
    selectedAudiences.length +
    selectedFaculties.length +
    selectedMajors.length +
    selectedUniversityYears.length;

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.instructor.toLowerCase().includes(normalizedQuery);
      const matchesClassification =
        !selectedClassifications.length || selectedClassifications.includes(course.category);
      const matchesSubject =
        !selectedSubjects.length ||
        selectedSubjects.includes(course.subject);
      const matchesStage = !selectedStages.length || selectedStages.includes(course.academicStage);
      const matchesGrade = !selectedGrades.length || selectedGrades.includes(course.academicGrade);
      const matchesLanguage = !selectedLanguages.length || selectedLanguages.includes(course.language);
      const matchesLevel = !selectedLevels.length || selectedLevels.includes(course.level);
      const matchesPrice =
        !selectedPrices.length ||
        (selectedPrices.includes("free") && course.price === 0) ||
        (selectedPrices.includes("paid") && course.price > 0);
      const matchesAudience = !selectedAudiences.length || selectedAudiences.includes(course.audienceType);
      const matchesFaculty = !selectedFaculties.length || selectedFaculties.includes(course.universityFaculty);
      const matchesMajor = !selectedMajors.length || selectedMajors.includes(course.universityMajor);
      const matchesUniversityYear = !selectedUniversityYears.length || selectedUniversityYears.includes(course.universityYear);
      return (
        matchesQuery &&
        matchesClassification &&
        matchesSubject &&
        matchesStage &&
        matchesGrade &&
        matchesLanguage &&
        matchesLevel &&
        matchesPrice && matchesAudience && matchesFaculty && matchesMajor && matchesUniversityYear
      );
    });

    return [...result].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.students - a.students;
    });
  }, [
    courses,
    query,
    selectedClassifications,
    selectedSubjects,
    selectedStages,
    selectedGrades,
    selectedLanguages,
    selectedLevels,
    selectedPrices,
    selectedAudiences,
    selectedFaculties,
    selectedMajors,
    selectedUniversityYears,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE,
  );

  return (
    <div className="min-h-screen bg-white py-14" dir="rtl">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-[#123C91] md:text-5xl">
            استكشف الدورات التعليمية
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[#657080] md:text-base">
            اكتسب مهارات جديدة وابدأ رحلتك التعليمية مع دورات متنوعة يقدمها أفضل المدرسين.
          </p>
        </header>

        <div className="mb-7 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8A94A3]" size={18} />
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setCurrentPage(1); }}
              placeholder="بحث..."
              className="h-12 w-full rounded-lg border border-[#DDE4EC] bg-white pr-12 pl-4 text-right text-sm outline-none focus:border-[#123C91]"
            />
          </label>

          <label className="relative block">
            <select
              value={sortBy}
              onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }}
              className="h-12 w-full appearance-none rounded-lg border border-[#DDE4EC] bg-white px-4 pl-10 text-sm text-[#556171] outline-none focus:border-[#123C91]"
            >
              <option value="popular">الأكثر شعبية</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="price-low">السعر: الأقل أولاً</option>
              <option value="price-high">السعر: الأعلى أولاً</option>
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A3]" size={17} />
          </label>
        </div>

        <div className={`grid items-start gap-5 transition-[grid-template-columns] duration-300 ease-out ${
          filterOpen ? "lg:grid-cols-[230px_1fr]" : "lg:grid-cols-[56px_1fr]"
        }`}>
          <div className="relative min-w-0">
            <div
              aria-hidden={!filterOpen}
              className={`grid origin-top transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
                filterOpen
                  ? "visible grid-rows-[1fr] scale-y-100 opacity-100"
                  : "invisible pointer-events-none grid-rows-[0fr] scale-y-95 opacity-0"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <aside className="rounded-lg border border-[#DDE4EC] bg-white p-5 shadow-sm lg:sticky lg:top-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-[#1F2937]">
                  <SlidersHorizontal size={18} /> تصفية النتائج
                </h2>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex h-7 w-7 items-center justify-center text-[#657080]"
                  aria-label="إغلاق الفلاتر"
                  title="إغلاق الفلاتر"
                >
                  <Minus size={17} />
                </button>
              </div>

              <div className="space-y-5">
                <CheckboxGroup title="الجمهور" items={audiences} selected={selectedAudiences} onToggle={(value) => {
                  toggleValue(setSelectedAudiences)(value);
                  if (value === "school" && selectedAudiences.includes("school")) { setSelectedStages([]); setSelectedGrades([]); setSelectedSubjects([]); }
                  if (value === "university" && selectedAudiences.includes("university")) { setSelectedFaculties([]); setSelectedMajors([]); setSelectedUniversityYears([]); }
                }} />
                <CheckboxGroup
                  title="التصنيف"
                  items={classifications}
                  selected={selectedClassifications}
                  onToggle={toggleValue(setSelectedClassifications)}
                />
                {selectedAudiences.includes("school") && <CheckboxGroup
                  title="المرحلة"
                  items={stages}
                  selected={selectedStages}
                  onToggle={(value) => { toggleValue(setSelectedStages)(value); setSelectedGrades([]); setSelectedSubjects([]); }}
                />}
                {selectedAudiences.includes("school") && selectedStages.length > 0 && <CheckboxGroup
                  title="الصف"
                  items={grades}
                  selected={selectedGrades}
                  onToggle={(value) => { toggleValue(setSelectedGrades)(value); setSelectedSubjects([]); }}
                />}
                {selectedAudiences.includes("school") && selectedGrades.length > 0 && <CheckboxGroup
                  title="المادة"
                  items={subjects}
                  selected={selectedSubjects}
                  onToggle={toggleValue(setSelectedSubjects)}
                />}
                {selectedAudiences.includes("university") && <CheckboxGroup
                  title="الكلية"
                  items={faculties}
                  selected={selectedFaculties}
                  onToggle={(value) => { toggleValue(setSelectedFaculties)(value); setSelectedMajors([]); setSelectedUniversityYears([]); }}
                />}
                {selectedAudiences.includes("university") && selectedFaculties.length > 0 && <CheckboxGroup
                  title="التخصص / الشعبة"
                  items={majors}
                  selected={selectedMajors}
                  onToggle={(value) => { toggleValue(setSelectedMajors)(value); setSelectedUniversityYears([]); }}
                />}
                {selectedAudiences.includes("university") && selectedMajors.length > 0 && <CheckboxGroup
                  title="السنة الدراسية"
                  items={universityYears}
                  selected={selectedUniversityYears}
                  onToggle={toggleValue(setSelectedUniversityYears)}
                />}
                <CheckboxGroup
                  title="اللغة"
                  items={languages}
                  selected={selectedLanguages}
                  onToggle={toggleValue(setSelectedLanguages)}
                />
                <CheckboxGroup
                  title="المستوى"
                  items={levels}
                  selected={selectedLevels}
                  onToggle={toggleValue(setSelectedLevels)}
                />
                <CheckboxGroup
                  title="السعر"
                  items={prices}
                  selected={selectedPrices}
                  onToggle={toggleValue(setSelectedPrices)}
                />

              </div>

              <button className="mt-6 h-11 w-full rounded-lg bg-[#123C91] text-sm font-bold text-white">
                تطبيق
              </button>
              <button
                onClick={resetFilters}
                className="mt-2 h-11 w-full rounded-lg border border-[#DDE4EC] text-sm font-semibold text-[#657080]"
              >
                إعادة ضبط
              </button>
                </aside>
              </div>
            </div>

            <button
              onClick={() => setFilterOpen(true)}
              className={`absolute right-0 top-0 flex h-14 w-14 items-center justify-center rounded-xl border border-[#DDE4EC] bg-white text-[#556171] transition-[opacity,transform,border-color,color] duration-300 hover:border-[#123C91] hover:text-[#123C91] ${
                filterOpen ? "invisible pointer-events-none scale-90 opacity-0" : "visible scale-100 opacity-100"
              }`}
              aria-label="فتح الفلاتر"
              title="فتح الفلاتر"
            >
              <Filter size={19} />
              {activeFilterCount > 0 && (
                <span className="absolute -left-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#12AFA0] px-1 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <main>
            {loading ? (
              <div className="rounded-lg border border-[#E1E7EF] bg-[#FAFBFD] py-20 text-center text-[#7B8490]">جاري تحميل الدورات...</div>
            ) : loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 py-20 text-center text-red-700">{loadError}</div>
            ) : filteredCourses.length ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {paginatedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} enrollment={enrollmentByCourseId.get(String(course.id))} compact />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#E1E7EF] bg-[#FAFBFD] py-20 text-center text-[#7B8490]">
                لا توجد دورات مطابقة للفلاتر المختارة.
              </div>
            )}

            {filteredCourses.length > 0 && totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="صفحات الدورات" dir="rtl">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE4EC] bg-white text-[#657080] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="الصفحة السابقة"
                >
                  <ChevronRight size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold transition-colors ${currentPage === page
                        ? "border-[#123C91] bg-[#123C91] text-white"
                        : "border-[#DDE4EC] bg-white text-[#556171] hover:border-[#123C91]"
                      }`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDE4EC] bg-white text-[#657080] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="الصفحة التالية"
                >
                  <ChevronLeft size={16} />
                </button>
              </nav>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
