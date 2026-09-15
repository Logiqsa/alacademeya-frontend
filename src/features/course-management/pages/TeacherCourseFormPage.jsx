import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  Plus,
  DollarSign,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
// ⚠️ تأكدي من المسار ده صح عندك (نفس نمط TeacherLayout بس جوه components/admin/layout)
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import PolicyAcceptanceDialog from "../../../components/course/PolicyAcceptanceDialog";
import CourseStepsNavigation from "../components/CourseStepsNavigation";
import {
  addCourseCategory,
  fetchAdminCourse,
  fetchCourseCategories,
  fetchCourseInstructors,
  fetchTeacherCourse,
  saveCourseToApi,
} from "../api/coursesApi";
import {
  getCurriculums,
  getCurriculumStages,
  getStageGrades,
  getSubjects,
  getCourseMarketplaceConfig,
  getMyPolicyStatus,
} from "../../../services/APIService";
import {
  getApiErrorMessage,
  normalizeApiError,
} from "../../../services/apiError";

const EMPTY_COURSE = {
  title: "",
  titleEn: "",
  category: "",
  instructorId: "",
  audienceType: "general",
  level: "",
  language: "عربي",
  description: "",
  shortDescription: "",
  requirements: [],
  outcomes: [],
  targetAudience: [],
  academicCurriculum: "",
  academicStage: "",
  academicGrade: "",
  subject: "",
  tags: [],
  cover: "",
  promoVideo: "",
  curriculum: [],
  pricingType: "paid",
  price: "",
  discountPercentage: "",
  status: "مسودة",
};

const STEPS = ["المعلومات الأساسية", "بناء المحتوى", "التسعير", "المراجعة"];
const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-[#E5E5E5] bg-[#F9FAFA] px-4 text-right font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#1F2937] outline-none transition-all placeholder:text-[11px] placeholder:font-normal placeholder:text-[#8C9198] focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/15 sm:h-12 sm:text-[14px] sm:placeholder:text-[12px]";
const optionId = (item) => item?._id || item?.id || "";
const optionName = (item) =>
  item?.name?.ar ||
  item?.name?.en ||
  item?.name ||
  item?.title?.ar ||
  item?.title?.en ||
  item?.title ||
  "—";
const extractOptions = (response, key) => {
  const data = response?.data?.data ?? response?.data ?? [];
  if (Array.isArray(data)) return data;
  return data?.[key] || data?.items || data?.results || [];
};

const UploadBox = ({
  label,
  accept,
  value,
  onChange,
  onRemove,
  icon: Icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const isVideo = accept.startsWith("video/");
  const previewUrl =
    value && typeof value === "object" ? value.previewUrl || value.dataUrl : "";

  const handleFile = (file) => {
    if (!file) return;
    setPendingFile({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    });
  };

  const openModal = () => {
    setPendingFile(value && typeof value === "object" ? value : null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setPendingFile(null);
    setIsOpen(false);
  };

  const confirmFile = () => {
    if (!pendingFile) return;
    onChange(pendingFile);
    setIsOpen(false);
  };

  const pendingPreviewUrl = pendingFile?.previewUrl || pendingFile?.dataUrl;

  return (
    <div className="block text-right text-sm font-medium text-[#1F2937]">
      <span className="mb-3 block">{label}</span>
      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border border-[#D8DCE2] bg-[#F8FAFC]">
          <div className="flex min-h-40 items-center justify-center bg-[#EEF2F6] sm:min-h-48">
            {isVideo ? (
              <video
                src={previewUrl}
                controls
                className="max-h-56 w-full bg-black object-contain sm:max-h-64"
              >
                متصفحك لا يدعم تشغيل الفيديو.
              </video>
            ) : (
              <img
                src={previewUrl}
                alt={`معاينة ${label}`}
                className="max-h-56 w-full object-contain sm:max-h-64"
              />
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <span className="min-w-0 flex-1 truncate text-xs font-normal text-[#667085]">
              {value.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openModal}
                className="cursor-pointer rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-xs font-semibold text-[#475467] transition hover:border-[#123C91] hover:text-[#123C91]"
              >
                تغيير
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border border-[#FECACA] bg-white px-3 py-2 text-xs font-semibold text-[#D92D20] transition hover:bg-[#FFF5F5]"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D8DCE2] bg-[#FCFCFD] px-4 py-5 text-center transition hover:border-[#123C91] hover:bg-[#F7FAFF] sm:min-h-48 sm:px-5"
        >
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-[#EAF2FF] text-[#123C91]">
            <Icon size={21} strokeWidth={1.8} />
          </span>
          <span className="text-sm font-semibold text-[#575F69]">
            رفع {label}
          </span>
          <span className="mt-1.5 text-[11px] font-normal text-[#8C9198]">
            اضغط هنا لاختيار الملف
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-3 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`إضافة ${label}`}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#EAECF0] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#1F2937]">
                  {previewUrl ? `تغيير ${label}` : `إضافة ${label}`}
                </h3>
                <p className="mt-1 text-xs font-normal text-[#667085]">
                  اختر {isVideo ? "ملف فيديو" : "صورة"} ثم راجع المعاينة قبل
                  الإضافة.
                </p>
              </div>
              <button
                type="button"
                aria-label="إغلاق"
                onClick={closeModal}
                className="shrink-0 rounded-md p-2 text-[#667085] transition hover:bg-[#F2F4F7]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {pendingPreviewUrl ? (
                <div className="overflow-hidden rounded-xl border border-[#D8DCE2]">
                  <div className="flex min-h-48 items-center justify-center bg-[#EEF2F6] sm:min-h-56">
                    {isVideo ? (
                      <video
                        src={pendingPreviewUrl}
                        controls
                        className="max-h-72 w-full bg-black object-contain sm:max-h-80"
                      >
                        متصفحك لا يدعم تشغيل الفيديو.
                      </video>
                    ) : (
                      <img
                        src={pendingPreviewUrl}
                        alt={`معاينة ${label}`}
                        className="max-h-72 w-full object-contain sm:max-h-80"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <span className="min-w-0 flex-1 truncate text-xs font-normal text-[#667085]">
                      {pendingFile.name}
                    </span>
                    <label className="cursor-pointer rounded-md border border-[#D0D5DD] px-3 py-2 text-xs font-semibold text-[#475467] hover:border-[#123C91] hover:text-[#123C91]">
                      اختيار ملف آخر
                      <input
                        type="file"
                        accept={accept}
                        className="sr-only"
                        onChange={(event) =>
                          handleFile(event.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFile(event.dataTransfer.files?.[0]);
                  }}
                  className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C9D3E0] bg-[#F9FBFD] px-4 text-center transition hover:border-[#123C91] hover:bg-[#F5F8FF] sm:min-h-64 sm:px-6"
                >
                  <span className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-[#EAF2FF] text-[#123C91]">
                    <UploadCloud size={23} />
                  </span>
                  <strong className="text-sm text-[#344054]">
                    اسحب الملف هنا أو اضغط للاختيار
                  </strong>
                  <span className="mt-2 text-[11px] font-normal text-[#8C9198]">
                    {isVideo ? "MP4 أو WebM أو MOV" : "PNG أو JPG أو WebP"}
                  </span>
                  <input
                    type="file"
                    accept={accept}
                    className="sr-only"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#EAECF0] bg-[#FCFCFD] px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-md border border-[#D0D5DD] bg-white px-5 text-sm font-medium text-[#475467]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={!pendingFile}
                onClick={confirmFile}
                className="h-10 rounded-md bg-[#123C91] px-6 text-sm font-semibold text-white transition hover:bg-[#0E327A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {previewUrl ? "حفظ التغيير" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TagsField = ({ label, values = [], onChange, placeholder }) => {
  const [text, setText] = useState("");
  const addValue = () => {
    const value = text.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setText("");
  };

  return (
    <label className="block space-y-2 text-right text-sm font-medium text-[#1F2937]">
      <span>{label}</span>
      <input
        className={inputClass}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            addValue();
          }
        }}
        onBlur={addValue}
        placeholder={placeholder}
      />
      <span className="block text-xs font-normal text-[#8C9198]">
        اكتب قيمة واحدة ثم اضغط Enter لإضافتها
      </span>
      {values.length > 0 && (
        <span className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-2 rounded-md border border-[#DCE6F5] bg-[#F7FAFF] px-3 py-1.5 text-xs font-normal text-[#344054]"
            >
              {value}
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onChange(values.filter((item) => item !== value));
                }}
                className="text-[#98A2B3] hover:text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </span>
      )}
    </label>
  );
};

const TeacherCourseFormPage = ({ useTeacherLayout = true }) => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminFlow = location.pathname.startsWith("/admin");
  const returnPath = isAdminFlow ? "/admin/courses" : "/teacher/courses";
  const [existingCourse, setExistingCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [stages, setStages] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [showInstructorOptions, setShowInstructorOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ label: "", percent: 0 });
  const [step, setStep] = useState(0);
  const [contentModal, setContentModal] = useState(null);
  const [quizModal, setQuizModal] = useState(null);
  const [course, setCourse] = useState(EMPTY_COURSE);
  const [commission, setCommission] = useState(null);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    getCourseMarketplaceConfig().then((response) => setCommission(response?.data?.data ?? response?.data)).catch(() => setCommission(null));
  }, []);

  useEffect(() => {
    fetchCourseCategories({ admin: isAdminFlow })
      .then(setCategories)
      .catch(() => toast.error("تعذر تحميل تصنيفات الدورات"));
  }, [isAdminFlow]);

  useEffect(() => {
    if (!isAdminFlow) return;
    fetchCourseInstructors()
      .then(setInstructors)
      .catch(() => toast.error("تعذر تحميل قائمة المدرسين"));
  }, [isAdminFlow]);

  useEffect(() => {
    getCurriculums()
      .then((response) =>
        setCurriculums(extractOptions(response, "curriculums")),
      )
      .catch(() => setCurriculums([]));
  }, []);

  useEffect(() => {
    if (!course.academicCurriculum) return;
    getCurriculumStages(course.academicCurriculum)
      .then((response) => setStages(extractOptions(response, "stages")))
      .catch(() => setStages([]));
  }, [course.academicCurriculum]);

  useEffect(() => {
    if (!course.academicStage) return;
    getStageGrades(course.academicStage)
      .then((response) => setGrades(extractOptions(response, "grades")))
      .catch(() => setGrades([]));
  }, [course.academicStage]);

  useEffect(() => {
    if (!course.academicGrade) return;
    getSubjects({ grade: course.academicGrade })
      .then((response) => setSubjects(extractOptions(response, "subjects")))
      .catch(() => setSubjects([]));
  }, [course.academicGrade]);

  useEffect(() => {
    if (!courseId) return;
    const loadCourse = isAdminFlow ? fetchAdminCourse : fetchTeacherCourse;
    loadCourse(courseId)
      .then((item) => {
        if (!isAdminFlow && !["draft", "rejected"].includes(item.rawStatus)) {
          toast.error(
            item.rawStatus === "pending_review"
              ? "الدورة قيد المراجعة ولا يمكن تعديلها الآن."
              : "حالة الدورة الحالية لا تسمح بالتعديل.",
          );
          navigate(`/teacher/courses/${courseId}`, { replace: true });
          return;
        }
        const quizLessons = (item.quizzes || []).map((quiz) => ({
          id: quiz._id || quiz.id,
          quizId: quiz._id || quiz.id,
          title: quiz.title || "اختبار الدورة",
          description: quiz.description || "",
          type: "اختبار",
          passingPercentage: quiz.passingPercentage || 60,
          maxAttempts: quiz.maxAttempts,
          isRequired: quiz.isRequired !== false,
          lessonId: quiz.lesson?._id || quiz.lesson?.id || quiz.lesson || null,
          preview: false,
          media: null,
          attachments: [],
          quiz: (quiz.questions || []).map((question) => ({
            ...question,
            id: question._id || question.id,
            options: (question.options || []).map(
              (option) => option.text || option,
            ),
            correctIndex: Math.max(
              0,
              (question.options || []).findIndex((option) => option.isCorrect),
            ),
            points: question.points || 0,
          })),
        }));
        const loadedCurriculum = (item.curriculum || []).map((section) => ({
          ...section,
          lessons: [...(section.lessons || [])],
        }));
        const editableQuizIds = [];
        if (quizLessons.length && loadedCurriculum.length) {
          loadedCurriculum[0].lessons.push(...quizLessons);
          editableQuizIds.push(
            ...quizLessons.map((quiz) => String(quiz.quizId)),
          );
        }
        setExistingCourse(item);
        setCourse({
          ...EMPTY_COURSE,
          ...item,
          editableQuizIds,
          category: item.categoryId || item.category,
          instructorId: item.instructorId || "",
          audienceType: item.audienceType || (item.courseType === "academic" || item.academicCurriculumId ? "school" : "general"),
          academicCurriculum: item.academicCurriculumId || "",
          academicStage: item.academicStageId || "",
          academicGrade: item.academicGradeId || "",
          subject: item.subjectId || "",
          titleEn: item.titleEn || "",
          requirements: Array.isArray(item.requirements)
            ? item.requirements
            : String(item.requirements || "")
                .split(/[,\n]/)
                .map((value) => value.trim())
                .filter(Boolean),
          targetAudience: Array.isArray(item.targetAudience)
            ? item.targetAudience
            : String(item.targetAudience || "")
                .split(/[,\n]/)
                .map((value) => value.trim())
                .filter(Boolean),
          tags: item.tags || [],
          curriculum: loadedCurriculum,
          cover: item.coverImage
            ? { name: "صورة الغلاف", previewUrl: item.coverImage }
            : "",
          promoVideo: item.promoVideoUrl
            ? { name: "الفيديو الترويجي", previewUrl: item.promoVideoUrl }
            : "",
        });
      })
      .catch((error) =>
        toast.error(getApiErrorMessage(error, "تعذر تحميل بيانات الدورة")),
      );
  }, [courseId, isAdminFlow, navigate]);

  const update = (field, value) =>
    setCourse((current) => ({ ...current, [field]: value }));

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await addCourseCategory(newCategory);
      setCategories((items) => [...items, created]);
      const createdCategoryId = created._id || created.id;
      setCourse((current) => ({
        ...current,
        category: createdCategoryId,
        categoryId: createdCategoryId,
      }));
      setNewCategory("");
      toast.success("تم إنشاء التصنيف");
      setShowCategoryCreator(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "تعذر إنشاء التصنيف");
    }
  };

  const validateStep = () => {
    if (
      step === 0 &&
      (!course.title.trim() || !course.category || !course.level)
    ) {
      toast.error("أكمل عنوان الدورة بالعربية والتصنيف والمستوى");
      return false;
    }
    if (step === 0 && isAdminFlow && !course.instructorId) {
      toast.error("اختر المحاضر المسؤول عن الدورة");
      return false;
    }
    if (
      step === 0 &&
      course.audienceType === "school" &&
      (!course.academicStage || !course.academicGrade || !course.subject)
    ) {
      toast.error("أكمل المنهج والمرحلة والصف والمادة، أو اختر دورة عامة");
      return false;
    }
    if (step === 1 && course.curriculum.length === 0) {
      toast.error("أضف قسمًا واحدًا على الأقل للمحتوى");
      return false;
    }
    if (step === 1) {
      const emptySection = course.curriculum.find(
        (section) => !section.lessons?.length,
      );
      if (emptySection) {
        toast.error(
          `أضف درسًا واحدًا على الأقل داخل قسم «${emptySection.title || "بدون عنوان"}»`,
        );
        return false;
      }
      const sectionWithUntitledLesson = course.curriculum.find((section) =>
        section.lessons.some((lesson) => !lesson.title?.trim()),
      );
      if (sectionWithUntitledLesson) {
        toast.error(
          `أكمل عنوان كل درس داخل قسم «${sectionWithUntitledLesson.title || "بدون عنوان"}»`,
        );
        return false;
      }
    }
    if (
      step === 2 &&
      course.pricingType === "paid" &&
      Number(course.price) <= 0
    ) {
      toast.error("أدخل سعرًا صحيحًا للدورة");
      return false;
    }
    if (
      step === 2 &&
      course.pricingType === "paid" &&
      Number(course.discountPercentage || 0) >= 100
    ) {
      toast.error("نسبة الخصم يجب أن تكون أقل من 100%");
      return false;
    }
    return true;
  };

  const save = async (status = course.status, policyChecked = false) => {
    if (savingRef.current) return;
    if (!isAdminFlow && status === "قيد المراجعة" && !policyChecked) {
      try {
        const policyStatus = (await getMyPolicyStatus())?.data?.data;
        const required = ["instructor_agreement", "course_publishing_policy", "revenue_share_agreement"];
        if (required.some((type) => policyStatus?.[type]?.required && !policyStatus[type]?.accepted)) {
          setPendingSubmission(true);
          setPolicyOpen(true);
          return;
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "تعذر التحقق من اتفاقيات المحاضر"));
        return;
      }
    }
    if (
      course.pricingType === "paid" &&
      (!Number.isFinite(Number(course.price)) || Number(course.price) <= 0)
    ) {
      toast.error("أدخل سعرًا صحيحًا أكبر من صفر للدورة المدفوعة");
      setStep(2);
      return;
    }
    if (status === "قيد المراجعة") {
      const missing = [];
      if (!course.title.trim()) missing.push("عنوان الدورة بالعربية");
      if (!course.category) missing.push("التصنيف");
      if (!course.level) missing.push("المستوى");
      if (!course.description?.trim()) missing.push("وصف الدورة");
      if (
        !course.cover?.file &&
        !course.cover?.previewUrl &&
        !course.coverImage
      )
        missing.push("صورة الغلاف");
      if (course.academicCurriculum && !course.academicStage)
        missing.push("المرحلة");
      if (course.academicCurriculum && !course.academicGrade)
        missing.push("الصف");
      if (course.academicCurriculum && !course.subject) missing.push("المادة");
      if (!course.curriculum.length) missing.push("قسم واحد على الأقل");
      course.curriculum.forEach((section, sectionIndex) => {
        if (!section.title?.trim())
          missing.push(`عنوان القسم ${sectionIndex + 1}`);
        if (!section.lessons?.length)
          missing.push(`درس داخل القسم ${sectionIndex + 1}`);
        section.lessons?.forEach((lesson, lessonIndex) => {
          if (!lesson.title?.trim())
            missing.push(
              `عنوان الدرس ${lessonIndex + 1} في القسم ${sectionIndex + 1}`,
            );
          if (
            lesson.type !== "اختبار" &&
            !lesson.media?.file &&
            !lesson.media?.url &&
            !lesson.media?.originalName
          ) {
            missing.push(`محتوى الدرس «${lesson.title || lessonIndex + 1}»`);
          }
        });
      });
      if (course.pricingType === "paid" && Number(course.price) <= 0)
        missing.push("سعر الدورة");
      if (missing.length) {
        toast.error(`البيانات الناقصة: ${[...new Set(missing)].join("، ")}`, {
          duration: 7000,
        });
        return;
      }
    }
    if (!course.title.trim() || !course.category || !course.level) {
      toast.error("أكمل عنوان الدورة بالعربية والتصنيف والمستوى قبل الحفظ");
      setStep(0);
      return;
    }
    if (
      course.academicCurriculum &&
      (!course.academicStage || !course.academicGrade || !course.subject)
    ) {
      toast.error("أكمل المنهج والمرحلة والصف والمادة قبل الحفظ");
      setStep(0);
      return;
    }
    if (status === "قيد المراجعة") {
      if (
        !course.cover?.file &&
        !course.cover?.previewUrl &&
        !course.coverImage
      ) {
        toast.error("ارفع صورة غلاف للدورة قبل الإرسال للمراجعة");
        setStep(0);
        return;
      }
      const emptySection = course.curriculum.find(
        (section) => !section.lessons?.length,
      );
      if (!course.curriculum.length || emptySection) {
        toast.error(
          emptySection
            ? `أضف درسًا واحدًا على الأقل داخل قسم «${emptySection.title || "بدون عنوان"}»`
            : "أضف قسمًا ودرسًا واحدًا على الأقل قبل الإرسال للمراجعة",
        );
        setStep(1);
        return;
      }
      const untitledLesson = course.curriculum.some((section) =>
        section.lessons.some((lesson) => !lesson.title?.trim()),
      );
      if (untitledLesson) {
        toast.error("أكمل عناوين جميع الدروس قبل الإرسال للمراجعة");
        setStep(1);
        return;
      }
      const quizLesson = course.curriculum.find((section) =>
        section.lessons.some((lesson) => lesson.type === "اختبار"),
      );
      if (quizLesson && !quizLesson) {
        toast.error(
          `نوع «اختبار» غير مدعوم كدرس في الـ API الحالي داخل قسم «${quizLesson.title || "بدون عنوان"}». استخدم فيديو أو ملف.`,
        );
        setStep(1);
        return;
      }
      const videoWithoutMedia = course.curriculum.find((section) =>
        section.lessons.some(
          (lesson) =>
            lesson.type === "فيديو" &&
            !lesson.media?.file &&
            !lesson.media?.url,
        ),
      );
      if (videoWithoutMedia) {
        toast.error(
          `ارفع فيديو لكل درس فيديو داخل قسم «${videoWithoutMedia.title || "بدون عنوان"}»`,
        );
        setStep(1);
        return;
      }
      const documentWithoutMedia = course.curriculum.find((section) =>
        section.lessons.some(
          (lesson) =>
            lesson.type === "ملف" && !lesson.media?.file && !lesson.media?.url,
        ),
      );
      if (documentWithoutMedia) {
        toast.error(
          `ارفع ملف كل درس من نوع ملف داخل قسم «${documentWithoutMedia.title || "بدون عنوان"}»`,
        );
        setStep(1);
        return;
      }
    }
    savingRef.current = true;
    setSaving(true);
    setUploadStatus({ label: "جاري تجهيز الدورة", percent: 0 });
    const savingToast = toast.loading(
      status === "قيد المراجعة"
        ? "جاري رفع الملفات وإرسال الدورة..."
        : "جاري حفظ الدورة...",
    );
    try {
      const saved = await saveCourseToApi({
        course,
        courseId: existingCourse?.id || courseId,
        admin: isAdminFlow,
        submit: status === "قيد المراجعة",
        onProgress: setUploadStatus,
        onCourseCreated: (createdId) => {
          setExistingCourse((current) => current || { ...course, id: createdId });
        },
      });
      toast.success(
        existingCourse ? "تم تعديل الدورة بنجاح" : "تم إنشاء الدورة بنجاح",
        { id: savingToast },
      );
      const savedCourseId = saved?.id || existingCourse?.id || courseId;
      const destination =
        isAdminFlow && savedCourseId
          ? `/admin/courses/${savedCourseId}`
          : returnPath;
      navigate(destination, {
        replace: true,
        state: { savedId: savedCourseId, refresh: true },
      });
    } catch (error) {
      if (error?.response?.data?.code === "POLICY_ACCEPTANCE_REQUIRED") {
        setPendingSubmission(true);
        setPolicyOpen(true);
        toast.dismiss(savingToast);
        return;
      }
      const apiError = normalizeApiError(error);
      if (apiError.code === "COURSE_NOT_FOUND" && !courseId) {
        setExistingCourse(null);
        toast.error(
          "المسودة السابقة لم تعد موجودة. احتفظنا ببياناتك؛ اضغط إرسال مرة أخرى لإنشاء مسودة جديدة.",
          { id: savingToast, duration: 7000 },
        );
        return;
      }
      if (error.savedCourseId) {
        setExistingCourse((current) => ({
          ...(current || course),
          id: error.savedCourseId,
        }));
      }
      const validationDetails = apiError.errors
        ? Object.values(apiError.errors).flat().filter(Boolean).join("، ")
        : "";
      const lifecycleMessage = {
        INSTRUCTOR_PROFILE_NOT_FOUND: isAdminFlow
          ? "تعديل الدورات غير متاح للأدمن لأن الباك لا يوفر مسار تعديل إداريًا."
          : "ملف المحاضر غير موجود.",
        COURSE_NOT_EDITABLE: "لا يمكن تعديل الدورة في حالتها الحالية.",
        COURSE_INVALID_STATUS: "لا تسمح حالة الدورة الحالية بهذا الإجراء.",
        COURSE_ALREADY_SUBMITTED: "تم إرسال الدورة للمراجعة بالفعل.",
        INSTRUCTOR_SUSPENDED: "هوية المحاضر موقوفة ولا يمكنها تعديل الدورات.",
        VALIDATION_ERROR:
          validationDetails ||
          (apiError.field
            ? `راجع الحقل: ${apiError.field}`
            : "راجع بيانات الدورة المطلوبة."),
      }[apiError.code];
      toast.error(
        lifecycleMessage || getApiErrorMessage(error, "تعذر حفظ الدورة"),
        { id: savingToast },
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const addSection = () =>
    update("curriculum", [
      ...course.curriculum,
      {
        id: crypto.randomUUID(),
        _isNew: true,
        title: `قسم ${course.curriculum.length + 1}`,
        lessons: [],
      },
    ]);

  const updateSection = (sectionId, patch) =>
    update(
      "curriculum",
      course.curriculum.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    );

  const removeSection = (sectionId) =>
    update(
      "curriculum",
      course.curriculum.filter((section) => section.id !== sectionId),
    );

  const moveSection = (sectionIndex, offset) => {
    const target = sectionIndex + offset;
    if (target < 0 || target >= course.curriculum.length) return;
    const next = [...course.curriculum];
    [next[sectionIndex], next[target]] = [next[target], next[sectionIndex]];
    update("curriculum", next);
  };

  const addLesson = (sectionId) =>
    updateSection(sectionId, {
      lessons: [
        ...(course.curriculum.find((section) => section.id === sectionId)
          ?.lessons || []),
        {
          id: crypto.randomUUID(),
          _isNew: true,
          title: "",
          type: "فيديو",
          duration: 0,
          preview: false,
          media: null,
          attachments: [],
          quiz: [],
        },
      ],
    });

  const updateLesson = (sectionId, lessonId, patch) => {
    const section = course.curriculum.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      lessons: section.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
      ),
    });
  };

  const moveLesson = (
    fromSectionId,
    lessonId,
    targetSectionId,
    targetIndex = null,
  ) => {
    const source = course.curriculum.find(
      (section) => section.id === fromSectionId,
    );
    const lesson = source?.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    const next = course.curriculum.map((section) => ({
      ...section,
      lessons: section.lessons.filter((item) => item.id !== lessonId),
    }));
    const target = next.find((section) => section.id === targetSectionId);
    if (!target) return;
    const insertAt =
      targetIndex == null
        ? target.lessons.length
        : Math.max(0, Math.min(targetIndex, target.lessons.length));
    target.lessons.splice(insertAt, 0, lesson);
    update("curriculum", next);
  };

  const activeModalLesson = (modal) => {
    const section = course.curriculum.find(
      (item) => item.id === modal?.sectionId,
    );
    return section?.lessons.find((lesson) => lesson.id === modal?.lessonId);
  };

  const openQuizBuilder = (sectionId, lesson) => {
    if (!lesson.quiz?.length) {
      updateLesson(sectionId, lesson.id, {
        quiz: [
          {
            id: crypto.randomUUID(),
            _isNew: true,
            text: "",
            options: ["", "", "", ""],
            correctIndex: 0,
            points: 0,
          },
        ],
      });
    }
    setQuizModal({ sectionId, lessonId: lesson.id });
  };

  const moveQuizQuestion = (questionIndex, offset) => {
    const lesson = activeModalLesson(quizModal);
    const target = questionIndex + offset;
    if (!lesson || target < 0 || target >= lesson.quiz.length) return;
    const questions = [...lesson.quiz];
    [questions[questionIndex], questions[target]] = [
      questions[target],
      questions[questionIndex],
    ];
    updateLesson(quizModal.sectionId, quizModal.lessonId, { quiz: questions });
  };

  const totalLessons = course.curriculum.reduce(
    (sum, section) => sum + section.lessons.length,
    0,
  );
  const totalContent = course.curriculum.reduce(
    (sum, section) =>
      sum +
      section.lessons.filter(
        (lesson) =>
          lesson.media || lesson.attachments?.length || lesson.quiz?.length,
      ).length,
    0,
  );
  const coursePrice = Math.max(0, Number(course.price) || 0);
  const discountPercentage = Math.min(
    100,
    Math.max(0, Number(course.discountPercentage) || 0),
  );
  const discountAmount = coursePrice * (discountPercentage / 100);
  const priceAfterDiscount = coursePrice - discountAmount;
  const commissionRate = Number.isFinite(Number(commission?.platformCommissionBps)) ? Number(commission.platformCommissionBps) / 10000 : null;
  const platformFee = commissionRate == null ? null : priceAfterDiscount * commissionRate;
  const teacherNet = platformFee == null ? null : priceAfterDiscount - platformFee;
  const instructorOptions = instructors.map((teacher) => {
    const account = teacher.user || teacher;
    return {
      id: teacher._id || teacher.id || account._id || account.id,
      ids: [
        teacher._id,
        teacher.id,
        teacher.instructorId,
        teacher.profileId,
        account._id,
        account.id,
        account.userId,
        account.profileId,
        account.instructorId,
      ]
        .filter(Boolean)
        .map(String),
      name:
        account.fullName ||
        account.name ||
        `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
        account.email ||
        "محاضر",
      email: account.email || "",
    };
  });
  const courseInstructorIds = [
    course.instructorId,
    existingCourse?.instructorId,
    existingCourse?.instructorDetails?._id,
    existingCourse?.instructorDetails?.id,
    existingCourse?.instructorDetails?.user?._id,
    existingCourse?.instructorDetails?.user?.id,
  ]
    .filter(Boolean)
    .map(String);
  const selectedInstructor = instructorOptions.find(
    (item) =>
      item.ids.some((id) => courseInstructorIds.includes(id)) ||
      (existingCourse?.instructor && item.name === existingCourse.instructor),
  );
  const policyDialog = <PolicyAcceptanceDialog open={policyOpen} requiredTypes={["instructor_agreement", "course_publishing_policy", "revenue_share_agreement"]} onClose={() => setPolicyOpen(false)} onSatisfied={() => { setPolicyOpen(false); if (pendingSubmission) { setPendingSubmission(false); save("قيد المراجعة", true); } }} />;
  const selectedCategory = categories.find(
    (item) =>
      String(item._id || item.id) === String(course.category || ""),
  );
  const selectedCategoryName =
    selectedCategory?.name?.ar ||
    selectedCategory?.name?.en ||
    selectedCategory?.name ||
    (String(course.category || "") === String(existingCourse?.categoryId || "")
      ? existingCourse?.category
      : course.category) ||
    "غير محدد";
  const visibleInstructors = instructorOptions.filter((item) =>
    `${item.name} ${item.email}`
      .toLocaleLowerCase("ar")
      .includes(instructorSearch.trim().toLocaleLowerCase("ar")),
  );
  const money = (value) =>
    `${Number(value).toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م`;
  const visibleStepIndexes = isAdminFlow ? [0, 2, 3] : [0, 1, 2, 3];
  const visibleStep = visibleStepIndexes.indexOf(step);
  const visibleSteps = visibleStepIndexes.map((stepIndex, index) => ({
    id: index + 1,
    name: STEPS[stepIndex],
  }));

  const formContent = (
    <div
      dir="rtl"
      className="min-h-screen px-3 pt-1 pb-5 text-right sm:px-5 md:px-8"
    >
      <div className="mx-auto w-full ">
        <div className="mb-4">
          <h1 className="text-[15px] font-bold text-[#123C91] sm:text-[16px]">
            {existingCourse ? "تعديل الدورة" : "إنشاء دورة جديدة"}
          </h1>
          <p className="mt-1 text-xs text-[#667085] sm:text-sm">
            الخطوة {visibleStep + 1} من {visibleSteps.length} · {STEPS[step]}
          </p>
        </div>

        <div className="mb-4 overflow-x-auto">
          <CourseStepsNavigation currentStep={visibleStep + 1} steps={visibleSteps} />
        </div>

        <section className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-6 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.08)] sm:px-8 sm:py-7 md:px-12 md:py-8 lg:px-16">
          {step === 0 && (
            <div className="mx-2 space-y-6 sm:mx-4 sm:space-y-7 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
              <div>
                <h2 className="text-right font-['IBM_Plex_Sans_Arabic'] text-[17px] font-medium text-[#1F2937] sm:text-[18px] md:text-[20px]">
                  المعلومات الأساسية
                </h2>
                <p className="mt-1 text-right font-['IBM_Plex_Sans_Arabic'] text-[13px] text-[#575F69] sm:text-[14px] md:text-[16px]">
                  أدخل بيانات الدورة التي ستظهر للطلاب.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="block space-y-2 text-right text-[14px] font-medium text-[#1F2937] sm:text-[15px] md:text-[17px]">
                  عنوان الدورة بالعربية *
                  <input
                    className={inputClass}
                    value={course.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="مثال: مقدمة في البرمجة"
                  />
                </label>
                <label className="block space-y-2 text-right text-[14px] font-medium text-[#1F2937] sm:text-[15px] md:text-[17px]">
                  عنوان الدورة بالإنجليزية *
                  <input
                    dir="ltr"
                    className={`${inputClass} text-left`}
                    value={course.titleEn}
                    onChange={(e) => update("titleEn", e.target.value)}
                    placeholder="Introduction to Programming"
                  />
                </label>
              </div>
              <label className="block space-y-2 text-right text-sm font-medium text-[#1F2937]">
                وصف الدورة
                <textarea
                  className={`${inputClass} h-20 py-3`}
                  value={course.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="اكتب وصفًا شاملًا للدورة..."
                />
              </label>
              <TagsField
                label="متطلبات الدورة"
                values={course.requirements}
                onChange={(values) => update("requirements", values)}
                placeholder="اكتب متطلبًا مثل: معرفة أساسيات البرمجة"
              />
              <TagsField
                label="ماذا سيتعلم الطالب؟"
                values={course.outcomes}
                onChange={(values) => update("outcomes", values)}
                placeholder="اكتب ناتج تعلم مثل: إتقان الأساسيات"
              />
              <TagsField
                label="لمن هذه الدورة؟"
                values={course.targetAudience}
                onChange={(values) => update("targetAudience", values)}
                placeholder="اكتب فئة مثل: المبتدئون في البرمجة"
              />
              <TagsField
                label="الوسوم"
                values={course.tags}
                onChange={(values) => update("tags", values)}
                placeholder="مثال: برمجة، مبتدئين"
              />
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                  <div className="flex items-center justify-between">
                    <span>التصنيف *</span>
                    {isAdminFlow && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowCategoryCreator((value) => !value)
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#123C91] hover:underline"
                      >
                        <Plus size={14} /> إضافة تصنيف
                      </button>
                    )}
                  </div>
                  <select
                    className={`${inputClass} mt-0`}
                    value={course.category}
                    onChange={(e) =>
                      setCourse((current) => ({
                        ...current,
                        category: e.target.value,
                        categoryId: e.target.value,
                      }))
                    }
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((item) => (
                      <option
                        key={item._id || item.id}
                        value={item._id || item.id}
                      >
                        {item.name?.ar || item.name?.en || item.name}
                      </option>
                    ))}
                  </select>
                </div>
                {isAdminFlow && (
                  <div className="relative space-y-2 text-right text-sm font-medium text-[#1F2937]">
                    <span>المحاضر *</span>
                    <button
                      type="button"
                      disabled={Boolean(existingCourse)}
                      onClick={() =>
                        setShowInstructorOptions((value) => !value)
                      }
                      className={`${inputClass} mt-0 flex items-center justify-between font-normal disabled:cursor-not-allowed disabled:border-[#DCE3EC] disabled:bg-[#EEF2F6]`}
                    >
                      <span>
                        {selectedInstructor?.name ||
                          existingCourse?.instructor ||
                          "اختر المحاضر"}
                      </span>
                      {existingCourse ? (
                        <LockKeyhole size={16} className="text-[#667085]" />
                      ) : (
                        <ChevronLeft
                          size={16}
                          className="-rotate-90 text-[#667085]"
                        />
                      )}
                    </button>
                    {existingCourse && (
                      <p className="flex items-center gap-1.5 text-[11px] font-normal text-[#667085]">
                        <LockKeyhole size={12} /> لا يمكن تغيير المحاضر حفاظًا
                        على حقوق ملكية الدورة.
                      </p>
                    )}
                    {!existingCourse && showInstructorOptions && (
                      <div className="absolute top-full z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#DCE3EC] bg-white shadow-xl">
                        <div className="p-2">
                          <input
                            autoFocus
                            value={instructorSearch}
                            onChange={(event) =>
                              setInstructorSearch(event.target.value)
                            }
                            placeholder="ابحث بالاسم أو البريد..."
                            className="h-10 w-full rounded-lg border border-[#DCE3EC] bg-[#F8FAFC] px-3 text-sm outline-none focus:border-[#123C91]"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto p-1">
                          {visibleInstructors.length ? (
                            visibleInstructors.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  update("instructorId", item.id);
                                  setShowInstructorOptions(false);
                                  setInstructorSearch("");
                                }}
                                className="block w-full rounded-lg px-3 py-2.5 text-right transition hover:bg-[#EEF4FF]"
                              >
                                <strong className="block text-sm text-[#17213A]">
                                  {item.name}
                                </strong>
                                {item.email && (
                                  <small className="text-[#98A2B3]">
                                    {item.email}
                                  </small>
                                )}
                              </button>
                            ))
                          ) : (
                            <p className="p-4 text-center text-xs text-[#98A2B3]">
                              لا يوجد محاضر مطابق
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                  المستوى *
                  <select
                    className={inputClass}
                    value={course.level}
                    onChange={(e) => update("level", e.target.value)}
                  >
                    <option value="">اختر المستوى</option>
                    {["مبتدئ", "متوسط", "متقدم", "جميع المستويات"].map(
                      (item) => (
                        <option key={item}>{item}</option>
                      ),
                    )}
                  </select>
                </label>
                <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                  لغة الشرح *
                  <select
                    className={inputClass}
                    value={course.language}
                    onChange={(e) => update("language", e.target.value)}
                  >
                    <option>عربي</option>
                    <option>إنجليزي</option>
                  </select>
                </label>
              </div>
              {isAdminFlow && showCategoryCreator && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-3 text-sm text-amber-800">
                    أضف اسم التصنيف الجديد وسيتم اختياره تلقائيًا.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className={inputClass}
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      placeholder="اسم التصنيف، مثال: برمجة"
                    />
                    <button
                      type="button"
                      onClick={createCategory}
                      className="mt-2 shrink-0 rounded-lg bg-[#123C91] px-5 text-sm font-semibold text-white"
                    >
                      إنشاء التصنيف
                    </button>
                  </div>
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                  نوع الدورة
                  <select
                    className={inputClass}
                    value={course.audienceType || "general"}
                    onChange={(e) =>
                      setCourse((current) => ({
                        ...current,
                        audienceType: e.target.value,
                        ...(e.target.value !== "school"
                          ? {
                              academicCurriculum: "",
                              academicStage: "",
                              academicGrade: "",
                              subject: "",
                            }
                          : {}),
                      }))
                    }
                  >
                    <option value="general">عامة / General</option>
                    <option value="school">مدرسية / School</option>
                    <option value="university">جامعية / University</option>
                    <option value="graduate">خريجون / Graduates</option>
                  </select>
                </label>
              </div>
              {course.audienceType === "school" && (
                <div className="grid gap-5 rounded-xl border border-[#DCE6F5] bg-[#F8FAFD] p-4 sm:grid-cols-2 md:grid-cols-4">
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                    المنهج *
                    <select
                      className={inputClass}
                      value={course.academicCurriculum || ""}
                      onChange={(e) =>
                        setCourse((current) => ({
                          ...current,
                          academicCurriculum: e.target.value,
                          academicStage: "",
                          academicGrade: "",
                          subject: "",
                        }))
                      }
                    >
                      <option value="">اختر المنهج</option>
                      {curriculums.map((item) => (
                        <option key={optionId(item)} value={optionId(item)}>
                          {optionName(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                    المرحلة
                    <select
                      disabled={!course.academicCurriculum}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                      value={course.academicStage || ""}
                      onChange={(e) =>
                        setCourse((current) => ({
                          ...current,
                          academicStage: e.target.value,
                          academicGrade: "",
                          subject: "",
                        }))
                      }
                    >
                      <option value="">اختر المرحلة</option>
                      {stages.map((item) => (
                        <option key={optionId(item)} value={optionId(item)}>
                          {optionName(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                    الصف الدراسي
                    <select
                      disabled={!course.academicStage}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                      value={course.academicGrade || ""}
                      onChange={(e) =>
                        setCourse((current) => ({
                          ...current,
                          academicGrade: e.target.value,
                          subject: "",
                        }))
                      }
                    >
                      <option value="">اختر الصف</option>
                      {grades.map((item) => (
                        <option key={optionId(item)} value={optionId(item)}>
                          {optionName(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-right text-sm font-medium text-[#1F2937]">
                    المادة
                    <select
                      disabled={!course.academicGrade}
                      className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
                      value={course.subject || ""}
                      onChange={(e) => update("subject", e.target.value)}
                    >
                      <option value="">اختر المادة</option>
                      {subjects.map((item) => (
                        <option key={optionId(item)} value={optionId(item)}>
                          {optionName(item)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              <div className="grid gap-6 border-t border-[#EAECF0] pt-6 sm:grid-cols-2">
                <UploadBox
                  label="صورة الغلاف"
                  accept="image/png,image/jpeg,image/webp"
                  value={course.cover}
                  onChange={(file) => update("cover", file)}
                  onRemove={() => update("cover", "")}
                  icon={ImageIcon}
                />
                <UploadBox
                  label="فيديو ترويجي"
                  accept="video/mp4,video/webm,video/quicktime"
                  value={course.promoVideo}
                  onChange={(file) => update("promoVideo", file)}
                  onRemove={() => update("promoVideo", "")}
                  icon={Film}
                />
              </div>
            </div>
          )}

          {step === 1 && !isAdminFlow && (
            <div className="mx-2 space-y-5 sm:mx-4 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
              <div>
                <h2 className="text-[16px] font-semibold text-[#1F2937] sm:text-[17px]">
                  بناء المنهج الدراسي
                </h2>
                <p className="mt-1.5 text-[13px] text-[#667085] sm:text-[14px]">
                  قم ببناء وتنظيم محتوى دورتك التعليمية خطوة بخطوة لتجربة تعلم
                  متكاملة للطلاب.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#667085] sm:gap-4 sm:text-[14px]">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers3 size={14} className="text-[#123C91]" />
                    {course.curriculum.length} أقسام
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Video size={14} className="text-[#123C91]" />
                    {totalLessons} دروس
                  </span>
                  <span>{totalContent} دروس بمحتوى</span>
                </div>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex h-10 items-center gap-2 rounded-md bg-[#123C91] px-4 text-sm font-semibold text-white hover:bg-[#0E327A] sm:px-5"
                >
                  <Plus size={16} /> إضافة قسم / وحدة
                </button>
              </div>
              {course.curriculum.length === 0 && (
                <button
                  onClick={addSection}
                  className="flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] text-[#667085] sm:min-h-48"
                >
                  <Plus className="mb-2" /> ابدأ بإضافة قسم للمحتوى
                </button>
              )}
              {course.curriculum.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-xl border border-[#DDE2E8] bg-white"
                >
                  <div className="flex items-center gap-2 border-b border-[#E7EBF0] bg-[#EEF6FF] px-3 py-3 sm:px-4">
                    <GripVertical
                      size={16}
                      className="shrink-0 text-[#98A2B3]"
                    />
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#123C91] text-xs font-semibold text-white">
                      {sectionIndex + 1}
                    </span>
                    <input
                      aria-label={`عنوان القسم ${sectionIndex + 1}`}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#344054] outline-none"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(section.id, { title: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      disabled={sectionIndex === 0}
                      onClick={() => moveSection(sectionIndex, -1)}
                      className="px-1 disabled:opacity-30"
                      aria-label="تحريك القسم لأعلى"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={sectionIndex === course.curriculum.length - 1}
                      onClick={() => moveSection(sectionIndex, 1)}
                      className="px-1 disabled:opacity-30"
                      aria-label="تحريك القسم لأسفل"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label="حذف القسم"
                      onClick={() => removeSection(section.id)}
                      className="shrink-0 rounded p-1 text-[#98A2B3] hover:bg-white hover:text-red-600"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div>
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="border-b border-[#EAECF0] px-3 py-3 last:border-b-0 sm:px-4"
                      >
                        <div className="flex flex-wrap items-center gap-2 xl:grid xl:flex-nowrap xl:grid-cols-[18px_26px_minmax(170px,1fr)_105px_80px_auto_auto_34px]">
                          <GripVertical
                            size={15}
                            className="hidden shrink-0 text-[#B0B7C3] sm:block"
                          />
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F1F4F8] text-[11px] text-[#667085]">
                            {lessonIndex + 1}
                          </span>
                          <input
                            className="h-9 min-w-[160px] flex-1 basis-full rounded-md border border-transparent px-2 text-sm text-[#344054] outline-none placeholder:text-[#98A2B3] focus:border-[#D0D5DD] sm:basis-auto xl:min-w-0 xl:basis-auto"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(section.id, lesson.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="اكتب عنوان الدرس..."
                          />
                          <select
                            className="h-9 shrink-0 rounded-md border border-[#D0D5DD] bg-white px-2 text-xs text-[#475467] outline-none"
                            value={lesson.type}
                            onChange={(e) =>
                              updateLesson(section.id, lesson.id, {
                                type: e.target.value,
                                media: null,
                              })
                            }
                          >
                            <option>فيديو</option>
                            <option>صوت</option>
                            <option>ملف</option>
                            <option>اختبار</option>
                          </select>
                          <label className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-md border border-[#E1E5EA] bg-[#FAFAFA] px-2 text-xs text-[#667085]">
                            <input
                              type="number"
                              min="0"
                              className="w-8 bg-transparent text-center outline-none"
                              value={lesson.duration || ""}
                              onChange={(e) =>
                                updateLesson(section.id, lesson.id, {
                                  duration: Number(e.target.value),
                                })
                              }
                              placeholder="0"
                            />
                            <span>د</span>
                          </label>
                          <label className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-[#475467]">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(lesson.preview)}
                              onClick={() =>
                                updateLesson(section.id, lesson.id, {
                                  preview: !lesson.preview,
                                })
                              }
                              className={`relative h-5 w-9 rounded-full transition ${lesson.preview ? "bg-[#12C6B0]" : "bg-[#D0D5DD]"}`}
                            >
                              <span
                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${lesson.preview ? "right-0.5" : "right-4"}`}
                              />
                            </button>
                            معاينة
                          </label>
                          {lesson.type === "اختبار" ? (
                            <button
                              onClick={() =>
                                openQuizBuilder(section.id, lesson)
                              }
                              className="h-9 shrink-0 rounded-md border border-[#12C6B0] bg-[#E8FFFC] px-3 text-xs font-semibold text-[#087F72]"
                            >
                              {lesson.quiz?.length
                                ? "تعديل الاختبار"
                                : "بناء الاختبار"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setContentModal({
                                  sectionId: section.id,
                                  lessonId: lesson.id,
                                })
                              }
                              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-[#D0D5DD] px-3 text-xs font-medium text-[#475467]"
                            >
                              <Video size={14} />
                              {lesson.media || lesson.attachments?.length
                                ? "تغيير المحتوى"
                                : "إضافة محتوى +"}
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label="حذف الدرس"
                            onClick={() =>
                              updateSection(section.id, {
                                lessons: section.lessons.filter(
                                  (item) => item.id !== lesson.id,
                                ),
                              })
                            }
                            className="shrink-0 p-2 text-[#98A2B3] hover:text-red-600"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={lessonIndex === 0}
                            onClick={() =>
                              moveLesson(
                                section.id,
                                lesson.id,
                                section.id,
                                lessonIndex - 1,
                              )
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-30"
                          >
                            ↑ ترتيب
                          </button>
                          <button
                            type="button"
                            disabled={
                              lessonIndex === section.lessons.length - 1
                            }
                            onClick={() =>
                              moveLesson(
                                section.id,
                                lesson.id,
                                section.id,
                                lessonIndex + 1,
                              )
                            }
                            className="rounded border px-2 py-1 text-xs disabled:opacity-30"
                          >
                            ↓ ترتيب
                          </button>
                          {course.curriculum.length > 1 && (
                            <select
                              aria-label="نقل الدرس إلى قسم"
                              value={section.id}
                              onChange={(event) =>
                                moveLesson(
                                  section.id,
                                  lesson.id,
                                  event.target.value,
                                )
                              }
                              className="rounded border px-2 py-1 text-xs"
                            >
                              <option value={section.id}>نقل إلى قسم...</option>
                              {course.curriculum
                                .filter((item) => item.id !== section.id)
                                .map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.title || "قسم بدون عنوان"}
                                  </option>
                                ))}
                            </select>
                          )}
                          {lesson.media?.name && (
                            <span className="rounded-md bg-[#E8FFFC] px-3 py-1.5 text-xs font-medium text-[#087F72]">
                              {lesson.type === "ملف" ? "📎" : "🎬"}{" "}
                              {lesson.media.name}
                            </span>
                          )}
                          {lesson.attachments?.map((file) => (
                            <span
                              key={file.name}
                              className="rounded-md bg-[#F2F4F7] px-3 py-1.5 text-xs text-[#475467]"
                            >
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLesson(section.id)}
                      className="flex items-center gap-1 px-4 py-3 text-sm font-semibold text-[#123C91] hover:bg-[#F8FAFC] sm:px-5"
                    >
                      <Plus size={15} /> إضافة درس
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="mx-2 space-y-5 sm:mx-4 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
              <div>
                <h2 className="font-bold text-[#1F2937]">تسعير الدورة</h2>
                <p className="mt-1 text-[14px] text-[#667085]">
                  حدد سعر الدورة ونوع التسعير، ويمكنك إضافة خصومات.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => update("pricingType", "paid")}
                  className={`min-h-28 rounded-xl border p-4 text-right transition sm:min-h-32 sm:p-5 ${
                    course.pricingType === "paid"
                      ? "border-[#123C91] bg-[#EAF2FF]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-lg ${
                      course.pricingType === "paid"
                        ? "bg-[#123C91] text-white"
                        : "bg-[#F2F4F7] text-[#667085]"
                    }`}
                  >
                    <DollarSign size={20} />
                  </span>
                  <strong className="mt-3 block">مدفوعة</strong>
                  <span className="mt-1 block text-[14px] text-[#667085]">
                    حدد سعرًا مناسبًا للدورة قبل نشرها
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => update("pricingType", "free")}
                  className={`min-h-28 rounded-xl border p-4 text-right transition sm:min-h-32 sm:p-5 ${
                    course.pricingType === "free"
                      ? "border-[#123C91] bg-[#EAF2FF]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-lg ${
                      course.pricingType === "free"
                        ? "bg-[#123C91] text-white"
                        : "bg-[#F2F4F7] text-[#667085]"
                    }`}
                  >
                    <BadgeCheck size={20} />
                  </span>
                  <strong className="mt-3 block">مجانية</strong>
                  <span className="mt-1 block text-xs text-[#667085]">
                    إتاحة الدورة لجميع الطلاب مجانًا
                  </span>
                </button>
              </div>
              {course.pricingType === "paid" && (
                <>
                  <label className="block space-y-2 text-sm font-medium text-[#1F2937]">
                    السعر بالجنيه المصري *
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={course.price}
                      onChange={(e) => update("price", e.target.value)}
                      placeholder="أدخل سعر الدورة"
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium text-[#1F2937]">
                    نسبة الخصم
                    <input
                      type="number"
                      min="0"
                      max="99"
                      className={inputClass}
                      value={course.discountPercentage || ""}
                      onChange={(e) =>
                        update("discountPercentage", e.target.value)
                      }
                      placeholder="أدخل النسبة"
                    />
                  </label>
                  <div className="overflow-hidden rounded-xl bg-[#EAF4FF] text-sm text-[#344054]">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
                      <strong className="text-[#123C91]">سعر الدورة</strong>
                      <span>{money(coursePrice)}</span>
                    </div>
                    {discountPercentage > 0 && (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-3 sm:px-5">
                          <span>الخصم ({discountPercentage}%)</span>
                          <span>- {money(discountAmount)}</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-3 sm:px-5">
                          <span>السعر بعد الخصم</span>
                          <strong>{money(priceAfterDiscount)}</strong>
                        </div>
                      </>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-3 sm:px-5">
                      <strong className="text-[#123C91]">رسوم المنصة {commissionRate == null ? "" : `(${commission.platformCommissionPercentage}%)`}</strong>
                      <span>{platformFee == null ? "غير متاحة حاليًا" : `- ${money(platformFee)}`}</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#D7E7FC] px-4 py-4 font-bold sm:px-5">
                      <span>صافي أرباحك</span>
                      <span>{teacherNet == null ? "غير متاح حاليًا" : money(teacherNet)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mx-2 space-y-5 sm:mx-4 sm:-mt-8 md:mx-6 lg:mx-8 lg:-mt-12">
              <div>
                <h2 className="font-bold text-[#1F2937]">مراجعة الدورة</h2>
                <p className="mt-1 text-[14px] text-[#667085]">
                  تأكد من البيانات قبل الإرسال.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#E5E7EB] p-4">
                  <h3 className="mb-3 font-bold">المعلومات الأساسية</h3>
                  <dl className="space-y-2 text-[14px]">
                    <div>
                      <dt className="text-[#667085]">العنوان</dt>
                      <dd>{course.title}</dd>
                    </div>
                    <div>
                      <dt className="text-[#667085]">التصنيف والمستوى</dt>
                      <dd>
                        {selectedCategoryName} · {course.level}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#667085]">اللغة</dt>
                      <dd>{course.language}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-xl border border-[#E5E7EB] p-4">
                  <h3 className="mb-3 font-bold">المحتوى والتسعير</h3>
                  <dl className="space-y-2 text-[14px]">
                    <div>
                      <dt className="text-[#667085]">الأقسام</dt>
                      <dd>{course.curriculum.length} قسم</dd>
                    </div>
                    <div>
                      <dt className="text-[#667085]">الدروس</dt>
                      <dd>
                        {course.curriculum.reduce(
                          (sum, section) => sum + section.lessons.length,
                          0,
                        )}{" "}
                        درس
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#667085]">السعر</dt>
                      <dd>
                        {course.pricingType === "free"
                          ? "مجانية"
                          : `${course.price} جنيه`}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="rounded-lg bg-[#EAF4FF] p-3 text-sm text-[#123C91]">
                بعد الإرسال ستصبح الدورة قيد المراجعة قبل النشر.
              </div>
            </div>
          )}

          <div className="mx-2 mt-8 flex flex-col items-stretch justify-between gap-3 border-t border-[#EAECF0] pt-5 sm:mx-4 sm:flex-row sm:items-center md:mx-6 lg:mx-8">
            <button
              onClick={() =>
                step === 0
                  ? navigate(returnPath)
                  : setStep(visibleStepIndexes[Math.max(0, visibleStep - 1)])
              }
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm sm:w-auto sm:px-5"
            >
              <ChevronRight size={16} /> {step === 0 ? "إلغاء" : "السابق"}
            </button>
            <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:flex sm:w-auto">
              {existingCourse && step < 3 ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save(course.status)}
                  className="w-full rounded-lg border border-[#123C91] bg-[#EAF2FF] px-4 py-2.5 text-sm font-semibold text-[#123C91] transition hover:bg-[#DCE9FF] sm:w-auto sm:px-5"
                >
                  حفظ التعديلات
                </button>
              ) : !existingCourse && isAdminFlow ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => save("مسودة")}
                  className="w-full rounded-lg border border-[#D0D5DD] px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5"
                >
                  {saving ? "جاري الحفظ..." : "حفظ كمسودة"}
                </button>
              ) : null}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!validateStep()) return;
                    setStep(visibleStepIndexes[Math.min(visibleSteps.length - 1, visibleStep + 1)]);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#123C91] px-5 py-2.5 text-sm font-semibold text-white sm:w-auto sm:px-7"
                >
                  التالي <ChevronLeft size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  aria-busy={saving}
                  onClick={() =>
                    save(isAdminFlow ? course.status : "قيد المراجعة")
                  }
                  className="w-full rounded-lg bg-[#123C91] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-7"
                >
                  {saving
                    ? `${uploadStatus.label}${uploadStatus.percent ? ` (${uploadStatus.percent}%)` : "..."}`
                    : isAdminFlow
                      ? "حفظ التعديلات"
                      : existingCourse
                      ? "حفظ وإرسال للمراجعة"
                      : "إرسال للمراجعة"}
                </button>
              )}
            </div>
          </div>
          {saving && (
            <div className="mx-2 mt-3 sm:mx-4 md:mx-6 lg:mx-8" dir="rtl">
              <div className="mb-1 flex justify-between text-xs text-[#667085]">
                <span>{uploadStatus.label}</span>
                <span>{uploadStatus.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[#12AFA0] transition-all"
                  style={{ width: `${uploadStatus.percent}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {contentModal && (
          <div className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-3 sm:p-4">
            <div
              dir="rtl"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-5"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-[#1F2937]">ملفات الدرس</h3>
                  <p className="mt-1 truncate text-xs text-[#667085]">
                    {activeModalLesson(contentModal)?.title || "الدرس"}
                  </p>
                </div>
                <button
                  onClick={() => setContentModal(null)}
                  className="shrink-0 p-1 text-[#667085]"
                >
                  <X size={18} />
                </button>
              </div>
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] p-4 text-center text-sm text-[#475467] sm:min-h-36">
                <UploadCloud className="mb-3 text-[#123C91]" size={30} />
                {activeModalLesson(contentModal)?.type === "ملف"
                  ? "اسحب الملف هنا أو اضغط للاختيار"
                  : activeModalLesson(contentModal)?.type === "صوت"
                    ? "اختر ملفاً صوتياً"
                    : "اسحب الفيديو هنا أو اضغط للاختيار"}
                <span className="mt-1 text-xs text-[#98A2B3]">
                  {activeModalLesson(contentModal)?.type === "ملف"
                    ? "PDF, DOC, DOCX, PPT, PPTX, JPG, PNG"
                    : "MP4, WebM, MOV"}
                </span>
                <input
                  type="file"
                  accept={
                    activeModalLesson(contentModal)?.type === "ملف"
                      ? ".pdf,.doc,.docx,.ppt,.pptx,image/jpeg,image/png"
                      : activeModalLesson(contentModal)?.type === "صوت"
                        ? "audio/mpeg,audio/wav,audio/ogg,audio/mp4"
                        : "video/mp4,video/webm,video/quicktime"
                  }
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const lessonType = activeModalLesson(contentModal)?.type;
                    const isDocument = lessonType === "ملف";
                    const maximumSize =
                      (isDocument ? 20 : lessonType === "صوت" ? 100 : 500) *
                      1024 *
                      1024;
                    if (file.size > maximumSize) {
                      toast.error(
                        isDocument
                          ? "حجم ملف الدرس يجب ألا يتجاوز 20MB"
                          : "حجم فيديو الدرس يجب ألا يتجاوز 500MB",
                      );
                      event.target.value = "";
                      return;
                    }
                    const targetSectionId = contentModal.sectionId;
                    const targetLessonId = contentModal.lessonId;
                    const previewUrl = URL.createObjectURL(file);
                    updateLesson(
                      targetSectionId,
                      targetLessonId,
                      {
                        media: {
                          file,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          previewUrl,
                        },
                      },
                    );
                    if (!isDocument) {
                      const media = document.createElement(
                        lessonType === "صوت" ? "audio" : "video",
                      );
                      media.preload = "metadata";
                      media.onloadedmetadata = () => {
                        const durationSeconds = Math.round(media.duration || 0);
                        if (durationSeconds > 0) {
                          updateLesson(
                            targetSectionId,
                            targetLessonId,
                            {
                              durationSeconds,
                              duration: Math.max(1, Math.ceil(durationSeconds / 60)),
                            },
                          );
                        }
                      };
                      media.src = previewUrl;
                    }
                  }}
                />
              </label>
              {activeModalLesson(contentModal)?.media && (
                <div className="mt-3 rounded-xl border border-[#DCE6F5] bg-[#F7FAFF] p-3">
                  <p className="mb-2 text-[11px] font-medium text-[#667085]">
                    ملف محتوى الدرس
                  </p>
                  <div className="flex items-start gap-2 text-sm text-[#344054]">
                    <FileText size={17} className="mt-0.5 shrink-0 text-[#123C91]" />
                    <span
                      dir="auto"
                      className="min-w-0 break-all font-medium"
                      title={
                        activeModalLesson(contentModal).media.name ||
                        activeModalLesson(contentModal).media.originalName ||
                        "محتوى الدرس"
                      }
                    >
                      {activeModalLesson(contentModal).media.name ||
                        activeModalLesson(contentModal).media.originalName ||
                        "محتوى الدرس"}
                    </span>
                  </div>
                </div>
              )}
              {activeModalLesson(contentModal)?.type === "فيديو" &&
                activeModalLesson(contentModal)?.media?.previewUrl && (
                  <video
                    controls
                    className="mt-4 max-h-72 w-full rounded-xl bg-black"
                    src={activeModalLesson(contentModal).media.previewUrl}
                  >
                    متصفحك لا يدعم تشغيل الفيديو.
                  </video>
                )}
              <label className="mt-4 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#D0D5DD] p-4 text-center text-sm text-[#475467]">
                <UploadCloud className="mb-2 text-[#123C91]" size={24} />
                إضافة مرفقات للدرس
                <span className="mt-1 text-xs text-[#98A2B3]">
                  يمكن اختيار أكثر من ملف
                </span>
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    const selected = Array.from(event.target.files || []);
                    const currentAttachments =
                      activeModalLesson(contentModal)?.attachments || [];
                    if (currentAttachments.length + selected.length > 10) {
                      toast.error("الحد الأقصى لمرفقات الدرس هو 10 ملفات");
                      event.target.value = "";
                      return;
                    }
                    const files = selected.map((file) => ({
                      id: crypto.randomUUID(),
                      file,
                      name: file.name,
                      accessMode: "downloadable",
                    }));
                    if (!files.length) return;
                    const lesson = activeModalLesson(contentModal);
                    updateLesson(
                      contentModal.sectionId,
                      contentModal.lessonId,
                      {
                        attachments: [...(lesson.attachments || []), ...files],
                      },
                    );
                    event.target.value = "";
                  }}
                />
              </label>
              {!!activeModalLesson(contentModal)?.attachments?.length && (
                <div className="mt-3 space-y-2">
                  {activeModalLesson(contentModal).attachments.map(
                    (attachment) => (
                      <div
                        key={attachment.id || attachment._id}
                        className="rounded-lg border border-[#EAECF0] bg-[#F8FAFC] px-3 py-2.5 text-xs"
                      >
                        <div className="flex items-start gap-2 text-[#344054]">
                          <FileText size={15} className="mt-0.5 shrink-0 text-[#123C91]" />
                          <span
                            dir="auto"
                            className="min-w-0 break-all font-medium"
                            title={attachment.name || attachment.originalName || "مرفق"}
                          >
                            {attachment.name || attachment.originalName || "مرفق"}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#EAECF0] pt-2">
                          <select
                          aria-label="وضع الوصول للمرفق"
                          value={attachment.accessMode || "downloadable"}
                          onChange={(event) => {
                            const lesson = activeModalLesson(contentModal);
                            updateLesson(contentModal.sectionId, contentModal.lessonId, {
                              attachments: lesson.attachments.map((item) =>
                                (item.id || item._id) === (attachment.id || attachment._id)
                                  ? { ...item, accessMode: event.target.value }
                                  : item,
                              ),
                            });
                          }}
                          className="min-w-0 flex-1 rounded-md border border-[#D0D5DD] bg-white px-2 py-1 text-xs"
                        >
                          <option value="view_only">عرض فقط / View only</option>
                          <option value="downloadable">قابل للتنزيل / Downloadable</option>
                        </select>
                          <button
                          type="button"
                          onClick={() =>
                            updateLesson(
                              contentModal.sectionId,
                              contentModal.lessonId,
                              {
                                attachments: activeModalLesson(
                                  contentModal,
                                ).attachments.filter(
                                  (item) =>
                                    (item.id || item._id) !==
                                    (attachment.id || attachment._id),
                                ),
                              },
                            )
                          }
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-red-200 bg-white text-red-600 hover:bg-red-50"
                            aria-label={`حذف ${attachment.name || attachment.originalName || "المرفق"}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setContentModal(null)}
                  className="min-w-[100px] flex-1 rounded-lg border border-[#D0D5DD] py-2.5 text-sm"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => setContentModal(null)}
                  className="min-w-[100px] flex-1 rounded-lg bg-[#123C91] py-2.5 text-sm font-semibold text-white"
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        )}

        {quizModal && activeModalLesson(quizModal) && (
          <div className="absolute inset-0 z-[70] overflow-y-auto bg-[#F7F8FC] p-3 sm:p-4 md:p-7">
            <div dir="rtl" className="mx-auto max-w-5xl">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-[#1F2937] sm:text-xl">
                    بناء الاختبار
                  </h2>
                  <p className="mt-1 truncate text-sm text-[#667085]">
                    {activeModalLesson(quizModal).title || "اختبار الدرس"}
                  </p>
                </div>
                <button
                  onClick={() => setQuizModal(null)}
                  className="shrink-0 p-2 text-[#667085]"
                >
                  <X />
                </button>
              </div>
              <div className="mb-4 rounded-lg bg-[#EAF4FF] p-3 text-sm text-[#475467]">
                أضف الأسئلة وحدد الإجابة الصحيحة لكل سؤال. يمكنك إضافة 4 خيارات
                لكل سؤال.
              </div>
              <div className="mb-4 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3">
                <label className="text-sm font-bold">
                  درجة النجاح %
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={activeModalLesson(quizModal).passingPercentage ?? 60}
                    onChange={(e) =>
                      updateLesson(quizModal.sectionId, quizModal.lessonId, {
                        passingPercentage: Number(e.target.value),
                      })
                    }
                    className="mt-2 h-10 w-full rounded-lg border px-3 font-normal"
                  />
                </label>
                <label className="text-sm font-bold">
                  الحد الأقصى للمحاولات
                  <input
                    type="number"
                    min="1"
                    value={activeModalLesson(quizModal).maxAttempts ?? ""}
                    onChange={(e) =>
                      updateLesson(quizModal.sectionId, quizModal.lessonId, {
                        maxAttempts:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    placeholder="غير محدود"
                    className="mt-2 h-10 w-full rounded-lg border px-3 font-normal"
                  />
                </label>
                <label className="flex items-center gap-2 self-end rounded-lg border p-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={activeModalLesson(quizModal).isRequired !== false}
                    onChange={(e) =>
                      updateLesson(quizModal.sectionId, quizModal.lessonId, {
                        isRequired: e.target.checked,
                      })
                    }
                  />
                  اختبار مطلوب للإكمال
                </label>
              </div>
              <div className="space-y-4">
                {activeModalLesson(quizModal).quiz.map(
                  (question, questionIndex) => (
                    <div
                      key={question.id}
                      className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <strong>السؤال {questionIndex + 1}</strong>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={questionIndex === 0}
                            onClick={() => moveQuizQuestion(questionIndex, -1)}
                            className="rounded border px-2 py-1 text-xs disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={
                              questionIndex ===
                              activeModalLesson(quizModal).quiz.length - 1
                            }
                            onClick={() => moveQuizQuestion(questionIndex, 1)}
                            className="rounded border px-2 py-1 text-xs disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() =>
                              updateLesson(
                                quizModal.sectionId,
                                quizModal.lessonId,
                                {
                                  quiz: activeModalLesson(
                                    quizModal,
                                  ).quiz.filter(
                                    (item) => item.id !== question.id,
                                  ),
                                },
                              )
                            }
                            className="text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                      <label className="block space-y-2 text-sm">
                        نص السؤال
                        <textarea
                          className={`${inputClass} h-20 py-3`}
                          value={question.text}
                          onChange={(event) =>
                            updateLesson(
                              quizModal.sectionId,
                              quizModal.lessonId,
                              {
                                quiz: activeModalLesson(quizModal).quiz.map(
                                  (item) =>
                                    item.id === question.id
                                      ? { ...item, text: event.target.value }
                                      : item,
                                ),
                              },
                            )
                          }
                          placeholder="اكتب سؤالك هنا..."
                        />
                      </label>
                      <p className="mt-4 mb-2 text-xs text-[#667085]">
                        الاختيارات — اضغط على الدائرة لتحديد الإجابة الصحيحة
                      </p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className={`flex items-center gap-3 rounded-lg border p-3 ${question.correctIndex === optionIndex ? "border-[#12C6B0] bg-[#E8FFFC]" : "border-[#E5E7EB]"}`}
                          >
                            <input
                              type="radio"
                              checked={question.correctIndex === optionIndex}
                              onChange={() =>
                                updateLesson(
                                  quizModal.sectionId,
                                  quizModal.lessonId,
                                  {
                                    quiz: activeModalLesson(quizModal).quiz.map(
                                      (item) =>
                                        item.id === question.id
                                          ? {
                                              ...item,
                                              correctIndex: optionIndex,
                                            }
                                          : item,
                                    ),
                                  },
                                )
                              }
                              className="shrink-0 accent-[#12C6B0]"
                            />
                            <input
                              className="w-full min-w-0 bg-transparent text-sm outline-none"
                              value={option}
                              onChange={(event) =>
                                updateLesson(
                                  quizModal.sectionId,
                                  quizModal.lessonId,
                                  {
                                    quiz: activeModalLesson(quizModal).quiz.map(
                                      (item) =>
                                        item.id === question.id
                                          ? {
                                              ...item,
                                              options: item.options.map(
                                                (value, index) =>
                                                  index === optionIndex
                                                    ? event.target.value
                                                    : value,
                                              ),
                                            }
                                          : item,
                                    ),
                                  },
                                )
                              }
                              placeholder={`الخيار ${optionIndex + 1}`}
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                aria-label="حذف الاختيار"
                                onClick={() =>
                                  updateLesson(
                                    quizModal.sectionId,
                                    quizModal.lessonId,
                                    {
                                      quiz: activeModalLesson(
                                        quizModal,
                                      ).quiz.map((item) =>
                                        item.id === question.id
                                          ? {
                                              ...item,
                                              options: item.options.filter(
                                                (_, index) =>
                                                  index !== optionIndex,
                                              ),
                                              correctIndex:
                                                item.correctIndex ===
                                                optionIndex
                                                  ? 0
                                                  : item.correctIndex >
                                                      optionIndex
                                                    ? item.correctIndex - 1
                                                    : item.correctIndex,
                                            }
                                          : item,
                                      ),
                                    },
                                  )
                                }
                                className="text-red-500"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </label>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            updateLesson(
                              quizModal.sectionId,
                              quizModal.lessonId,
                              {
                                quiz: activeModalLesson(quizModal).quiz.map(
                                  (item) =>
                                    item.id === question.id
                                      ? {
                                          ...item,
                                          options: [...item.options, ""],
                                        }
                                      : item,
                                ),
                              },
                            )
                          }
                          className="text-xs font-bold text-[#123C91]"
                        >
                          + إضافة اختيار
                        </button>
                      </div>
                      <label className="mt-4 flex flex-wrap items-center justify-end gap-2 text-sm">
                        درجة السؤال
                        <input
                          type="number"
                          min="0"
                          className="h-10 w-24 rounded-lg border border-[#E5E7EB] px-3"
                          value={question.points}
                          onChange={(event) =>
                            updateLesson(
                              quizModal.sectionId,
                              quizModal.lessonId,
                              {
                                quiz: activeModalLesson(quizModal).quiz.map(
                                  (item) =>
                                    item.id === question.id
                                      ? {
                                          ...item,
                                          points: Number(event.target.value),
                                        }
                                      : item,
                                ),
                              },
                            )
                          }
                        />
                      </label>
                    </div>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  updateLesson(quizModal.sectionId, quizModal.lessonId, {
                    quiz: [
                      ...activeModalLesson(quizModal).quiz,
                      {
                        id: crypto.randomUUID(),
                        _isNew: true,
                        text: "",
                        options: ["", "", "", ""],
                        correctIndex: 0,
                        points: 0,
                      },
                    ],
                  })
                }
                className="mt-4 font-semibold text-[#123C91]"
              >
                <Plus size={16} className="inline" /> إضافة سؤال
              </button>
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <button
                  onClick={() => setQuizModal(null)}
                  className="rounded-lg border border-[#D0D5DD] px-6 py-3 sm:px-8"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    setQuizModal(null);
                    toast.success("تم حفظ الاختبار");
                  }}
                  className="rounded-lg bg-[#123C91] px-6 py-3 font-semibold text-white sm:px-10"
                >
                  حفظ الاختبار
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!useTeacherLayout) {
    return <>{policyDialog}{formContent}</>;
  }

  return <>{policyDialog}{isAdminFlow ? (
    <AdminLayout contentClassName="!p-0">{formContent}</AdminLayout>
  ) : (
    <TeacherLayout contentClassName="!p-0">{formContent}</TeacherLayout>
  )}</>;
};

export default TeacherCourseFormPage;
