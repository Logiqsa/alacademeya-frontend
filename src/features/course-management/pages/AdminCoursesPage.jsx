import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  CirclePause,
  CirclePlay,
  FileText,
  LoaderCircle,
  Mail,
  MessageSquare,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import {
  fetchAdminCourse,
  fetchAdminCourses,
  fetchPublicInstructor,
  deactivateAdminCourse,
  activateAdminCourse,
} from "../api/coursesApi";
import { getApiErrorMessage } from "../../../services/apiError";
import { confirmToast } from "../../../utils/confirmToast";
import { getTeacher, getTeachers, getUser } from "../../../services/APIService";

const dateOf = (value) =>
  value
    ? new Intl.DateTimeFormat("ar-EG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "غير متاح";

const courseDateValue = (course, status) => {
  const value =
    status === "archived"
      ? course.archivedAt || course.updatedAt || course.submittedAt || course.createdAt
      : course.submittedAt || course.updatedAt || course.createdAt;
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const statusClass = (status) =>
  status === "منشور"
    ? "bg-emerald-50 text-emerald-700"
    : status === "غير نشطة"
      ? "bg-slate-100 text-slate-700"
      : "bg-amber-50 text-amber-700";

const InstructorNameLink = ({ course, className = "", onOpen }) => {
  return (
    <button
      type="button"
      onClick={() => onOpen(course)}
      className={`${className} cursor-pointer text-[#123C91] underline decoration-[#123C91]/30 underline-offset-4 transition hover:decoration-[#123C91]`}
    >
      {course.instructor}
    </button>
  );
};

const valueOrFallback = (value, fallback = "غير متوفر") =>
  value == null || value === "" ? fallback : String(value);

const hasValue = (value) => value != null && value !== "";

const labelOf = (value) => {
  if (!value) return "";
  if (["string", "number"].includes(typeof value)) return String(value);
  return labelOf(value.name || value.title || value.ar || value.en);
};

const labelsOf = (value) =>
  [
    ...new Set(
      (Array.isArray(value) ? value : value ? [value] : [])
        .map(labelOf)
        .filter(Boolean),
    ),
  ].join("، ");

const entityKey = (value, fallback) =>
  value?._id || value?.id || labelOf(value) || fallback;

const entityId = (value) =>
  String(
    typeof value === "object" ? value?._id || value?.id || "" : value || "",
  );

const belongsTo = (item, parent, keys) => {
  const parentId = entityId(parent);
  return (
    Boolean(parentId) && keys.some((key) => entityId(item?.[key]) === parentId)
  );
};

const TeacherEducationContent = ({ selections, teacher, fallbackDetails }) => {
  if (selections.length) {
    return (
      <div className="space-y-2.5 border-t border-[#E8EEF7] p-3">
        {selections.map((selection, selectionIndex) => (
          <details
            key={entityKey(selection.curriculum, selectionIndex)}
            className="group/curriculum overflow-hidden rounded-xl border border-[#DCE6F5] bg-[#F8FAFD]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between p-3 transition hover:bg-[#EEF4FF]">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#123C91] text-xs font-bold text-white">
                  {selectionIndex + 1}
                </span>
                <div>
                  <p className="text-[10px] text-[#98A2B3]">المنهج</p>
                  <strong className="text-sm text-[#123C91]">
                    {labelOf(selection.curriculum) || "منهج غير محدد"}
                  </strong>
                </div>
              </div>
              <ChevronDown
                size={17}
                className="text-[#123C91] transition group-open/curriculum:rotate-180"
              />
            </summary>
            <div className="space-y-2 border-t border-[#DCE6F5] bg-white p-3">
              {(selection.stages || []).map((stage, stageIndex) => (
                <div key={entityKey(stage.stage, stageIndex)}>
                  <p className="text-xs font-bold text-[#344054]">
                    المرحلة: {labelOf(stage.stage) || "غير محددة"}
                  </p>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    {(stage.grades || []).map((grade, gradeIndex) => (
                      <div
                        key={entityKey(grade.grade, gradeIndex)}
                        className="rounded-lg border border-[#E5EAF1] bg-white px-3 py-2"
                      >
                        <p className="text-xs font-semibold text-[#344054]">
                          {labelOf(grade.grade) || "صف غير محدد"}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {(grade.subjects || []).map(
                            (subject, subjectIndex) => (
                              <span
                                key={entityKey(subject, subjectIndex)}
                                className="rounded-md bg-[#EAF2FF] px-2 py-1 text-[11px] font-semibold text-[#123C91]"
                              >
                                {labelOf(subject)}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    );
  }
  const curricula = Array.isArray(teacher?.curriculums)
    ? teacher.curriculums
    : teacher?.curriculum
      ? [teacher.curriculum]
      : [];
  const grades = Array.isArray(teacher?.grades)
    ? teacher.grades
    : teacher?.grade
      ? [teacher.grade]
      : [];
  const subjects = Array.isArray(teacher?.subjects)
    ? teacher.subjects
    : teacher?.subject
      ? [teacher.subject]
      : [];

  if (curricula.length) {
    return (
      <div className="grid gap-2.5 border-t border-[#E8EEF7] p-3 lg:grid-cols-2">
        {curricula.map((curriculum, curriculumIndex) => {
          const linkedGrades = grades.filter((grade) =>
            belongsTo(grade, curriculum, ["curriculum", "curriculumId"]),
          );
          const linkedSubjects = subjects.filter((subject) =>
            belongsTo(subject, curriculum, ["curriculum", "curriculumId"]),
          );
          const singleCurriculum = curricula.length === 1;
          return (
            <details
              key={entityKey(curriculum, curriculumIndex)}
              className="group/curriculum overflow-hidden rounded-xl border border-[#DCE6F5] bg-[#F8FAFD]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-3 transition hover:bg-[#EEF4FF]">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#123C91] text-xs font-bold text-white">
                    {curriculumIndex + 1}
                  </span>
                  <div>
                    <p className="text-[10px] text-[#98A2B3]">المنهج</p>
                    <strong className="text-sm text-[#123C91]">
                      {labelOf(curriculum)}
                    </strong>
                  </div>
                </div>
                <ChevronDown
                  size={17}
                  className="text-[#123C91] transition group-open/curriculum:rotate-180"
                />
              </summary>
              <div className="grid gap-2 border-t border-[#DCE6F5] bg-white p-3 sm:grid-cols-2">
                {(linkedGrades.length || !singleCurriculum
                  ? linkedGrades
                  : grades
                ).map((grade, gradeIndex) => {
                  const gradeSubjects = subjects.filter((subject) =>
                    belongsTo(subject, grade, ["grade", "gradeId"]),
                  );
                  const visibleSubjects = gradeSubjects.length
                    ? gradeSubjects
                    : (linkedGrades.length || !singleCurriculum
                          ? linkedGrades
                          : grades
                        ).length === 1
                      ? linkedSubjects
                      : [];
                  return (
                    <div
                      key={entityKey(grade, gradeIndex)}
                      className="rounded-lg border border-[#E5EAF1] bg-[#F8FAFC] p-3"
                    >
                      <p className="text-xs font-bold text-[#344054]">
                        {labelOf(grade) || "صف غير محدد"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {visibleSubjects.length ? (
                          visibleSubjects.map((subject, subjectIndex) => (
                            <span
                              key={entityKey(subject, subjectIndex)}
                              className="rounded-md bg-[#EAF2FF] px-2 py-1 text-[11px] font-semibold text-[#123C91]"
                            >
                              {labelOf(subject)}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#98A2B3]">
                            لا توجد مواد مسجلة لهذا الصف
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!(
                  linkedGrades.length || !singleCurriculum
                    ? linkedGrades
                    : grades
                ).length && (
                  <p className="text-xs text-[#98A2B3]">
                    لا توجد صفوف مسجلة لهذا المنهج.
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    );
  }
  return (
    <dl className="grid gap-2 border-t border-[#E8EEF7] p-3 sm:grid-cols-2">
      {fallbackDetails.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-[#F8FAFC] px-3 py-2">
          <dt className="text-[10px] text-[#98A2B3]">{label}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-[#344054]">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

const InstructorDetailsModal = ({ course, onClose, onMessage }) => {
  const [resolvedInstructor, setResolvedInstructor] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const courseInstructor = course?.instructorDetails || {};

  useEffect(() => {
    if (!course) return undefined;
    const baseInstructor = course.instructorDetails || {};
    let active = true;
    const loadDetails = async () => {
      let profile = baseInstructor;
      const profileKey =
        baseInstructor.profileSlug ||
        course.instructorSlug ||
        course.instructorId;
      if (profileKey) {
        try {
          profile = await fetchPublicInstructor(profileKey);
        } catch {
          // The course response still contains enough data for a basic profile.
        }
      }

      let account = profile.user || baseInstructor.user || {};
      const userId =
        account.id || account._id || profile.userId || baseInstructor.userId;
      if (userId) {
        try {
          const response = await getUser(userId);
          const data = response?.data?.data ?? response?.data ?? response;
          account = { ...account, ...(data?.user || data) };
        } catch {
          // Personal fields remain limited to what the instructor endpoint exposes.
        }
      }

      const mergedProfile = {
        ...baseInstructor,
        ...profile,
        email: profile.email || account.email || baseInstructor.email,
        phone:
          profile.phone ||
          account.phone ||
          account.phoneNumber ||
          baseInstructor.phone,
        createdAt:
          profile.createdAt || account.createdAt || baseInstructor.createdAt,
        user: account,
      };
      if (active) setResolvedInstructor(mergedProfile);

      const isTeacherAccount =
        account.role === "teacher" || profile.role === "teacher";
      if (!isTeacherAccount) return;

      let teacher = null;
      const teacherId =
        profile.teacherId ||
        account.teacherId ||
        account.profileId ||
        baseInstructor.teacherId;
      if (teacherId) {
        try {
          const response = await getTeacher(teacherId);
          const data = response?.data?.data ?? response?.data ?? response;
          teacher = data?.teacher || data;
        } catch {
          // Fall through to the user-filtered teacher lookup.
        }
      }
      if (!teacher && userId) {
        try {
          const response = await getTeachers({ user: userId, limit: 20 });
          const data = response?.data?.data ?? response?.data ?? response;
          const items = Array.isArray(data)
            ? data
            : data?.teachers || data?.results || data?.items || [];
          teacher = items.find((item) => {
            const linkedUser = item.user;
            const linkedId =
              typeof linkedUser === "object"
                ? linkedUser?._id || linkedUser?.id
                : linkedUser;
            return String(linkedId || "") === String(userId);
          });
        } catch {
          // The teacher badge can still be shown without academic details.
        }
      }
      if (active)
        setTeacherDetails(
          teacher && typeof teacher === "object" ? teacher : null,
        );
    };
    loadDetails();
    return () => {
      active = false;
    };
  }, [course]);

  if (!course) return null;
  const instructor = resolvedInstructor || courseInstructor;
  const account = instructor.user || {};
  const name = valueOrFallback(
    instructor.name ||
      instructor.fullName ||
      account.fullName ||
      course.instructor,
    "المحاضر",
  );
  const avatar =
    instructor.avatar ||
    instructor.profileImage ||
    account.profileImage ||
    account.avatar;
  const joinedAt = instructor.joinedAt || instructor.createdAt;
  const details = [
    ["رقم الهاتف", instructor.phone || instructor.phoneNumber || account.phone],
    [
      "تاريخ الانضمام",
      joinedAt ? new Date(joinedAt).toLocaleDateString("ar-EG") : null,
    ],
  ].filter(([, value]) => hasValue(value));
  const email = instructor.email || account.email;
  const isTeacher =
    account.role === "teacher" ||
    instructor.role === "teacher" ||
    Boolean(teacherDetails);
  const profileKey =
    instructor.profileSlug || course.instructorSlug || course.instructorId;
  const teachingSelections = Array.isArray(teacherDetails?.teachingSelections)
    ? teacherDetails.teachingSelections
    : [];
  const selectionStages = teachingSelections.flatMap(
    (selection) => selection.stages || [],
  );
  const selectionGrades = selectionStages.flatMap(
    (stage) => stage.grades || [],
  );
  const educationalDetails = teacherDetails
    ? [
        [
          "المناهج",
          labelsOf(
            teachingSelections.map((selection) => selection.curriculum).length
              ? teachingSelections.map((selection) => selection.curriculum)
              : teacherDetails.curriculums || teacherDetails.curriculum,
          ),
        ],
        [
          "المراحل",
          labelsOf(
            selectionStages.map((stage) => stage.stage).length
              ? selectionStages.map((stage) => stage.stage)
              : teacherDetails.stages || teacherDetails.stage,
          ),
        ],
        [
          "الصفوف",
          labelsOf(
            selectionGrades.map((grade) => grade.grade).length
              ? selectionGrades.map((grade) => grade.grade)
              : teacherDetails.grades || teacherDetails.grade,
          ),
        ],
        [
          "المواد",
          labelsOf(
            selectionGrades.flatMap((grade) => grade.subjects || []).length
              ? selectionGrades.flatMap((grade) => grade.subjects || [])
              : teacherDetails.subjects || teacherDetails.subject,
          ),
        ],
      ].filter(([, value]) => hasValue(value))
    : [];

  return (
    <div
      className="fixed inset-0 z-[130] grid place-items-center bg-[#07152D]/70 p-2 backdrop-blur-[2px] sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructor-details-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-[min(1020px,calc(100vw-24px))] overflow-y-auto rounded-2xl border border-white/60 bg-white shadow-[0_28px_90px_rgba(3,15,38,0.32)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#DCE6F5] bg-linear-to-l from-[#F7FAFF] to-white px-5 py-3">
          <h2
            id="instructor-details-title"
            className="font-bold text-[#1F2937]"
          >
            تفاصيل المحاضر
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#667085] transition hover:bg-[#F2F4F7]"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-2.5 p-3 sm:p-4">
          <div className="flex items-center gap-4 rounded-xl border border-[#E5EDF8] bg-linear-to-l from-[#F3F7FD] to-[#FAFCFF] p-3">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-lg font-bold text-[#123C91] shadow-sm">
                {name.trim().charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[#1F2937]">{name}</strong>
              {hasValue(email) && (
                <span className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#667085]">
                  <Mail size={13} />
                  {email}
                </span>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#DDF7E8] px-2.5 py-1 text-[10px] font-semibold text-[#17864B]">
                  {instructor.status === "suspended" ? "موقوف" : "نشط"}
                </span>
                <span className="rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[10px] font-semibold text-[#123C91]">
                  محاضر
                </span>
                {isTeacher && (
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                    معلم
                  </span>
                )}
              </div>
            </div>
          </div>
          {(instructor.bio || instructor.headline) && (
            <p className="rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-sm leading-6 text-[#475467]">
              {instructor.bio || instructor.headline}
            </p>
          )}
          {details.length ? (
            <div>
              <h3 className="mb-2 text-sm font-bold text-[#1F2937]">
                البيانات الشخصية
              </h3>
              <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {details.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-[#F8FAFC] px-4 py-2.5"
                  >
                    <dt className="text-[11px] text-[#98A2B3]">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-[#344054]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#DCE3EC] px-4 py-2.5 text-center text-sm text-[#667085]">
              لم يضف المحاضر بيانات إضافية بعد.
            </p>
          )}
          {isTeacher && educationalDetails.length > 0 && (
            <details
              key={`education-${course.id}`}
              className="group rounded-xl border border-[#C9D8EE] bg-white shadow-xs"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl bg-[#F7FAFF] px-4 py-2.5 text-sm font-bold text-[#123C91] transition hover:bg-[#EEF4FF]">
                <span>التفاصيل التعليمية</span>
                <ChevronDown
                  size={18}
                  className="transition group-open:rotate-180"
                />
              </summary>
              <TeacherEducationContent
                selections={teachingSelections}
                teacher={teacherDetails}
                fallbackDetails={educationalDetails}
              />
            </details>
          )}
          {(instructor.cvName || instructor.cvUrl) && (
            <a
              href={instructor.cvUrl || "#"}
              className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3 text-[#344054]"
            >
              <FileText size={20} className="text-[#123C91]" />
              <strong className="min-w-0 flex-1 truncate text-sm">
                {instructor.cvName || "السيرة الذاتية"}
              </strong>
            </a>
          )}
          <div className="grid gap-2 border-t border-[#EEF1F5] pt-2.5 sm:grid-cols-2">
            {profileKey && (
              <Link
                to={`/instructors/${encodeURIComponent(profileKey)}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#123C91] px-5 py-2.5 text-sm font-semibold text-[#123C91] transition hover:bg-[#EEF4FF]"
              >
                <UserRound size={16} /> عرض الملف الشخصي
              </Link>
            )}
            <button
              type="button"
              onClick={() => onMessage(course)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#123C91] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E3279]"
            >
              <MessageSquare size={16} /> مراسلة المحاضر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    const status = searchParams.get("status");
    return ["published", "pending_review", "archived"].includes(status)
      ? status
      : "published";
  });
  const [loading, setLoading] = useState(true);
  const [deactivatingCourseId, setDeactivatingCourseId] = useState(null);
  const [selectedInstructorCourse, setSelectedInstructorCourse] =
    useState(null);
  const selectedCategory = searchParams.get("category") || "";
  const selectedAudience = searchParams.get("audienceType") || "";

  const openInstructorMessages = (course) => {
    const instructor = course.instructorDetails || {};
    const accountId =
      instructor.user?.id ||
      instructor.user?._id ||
      instructor.id ||
      instructor._id ||
      course.instructorId;
    navigate("/admin/messages", {
      state: {
        openUserId: accountId,
        openClassroomId: course.id,
        openClassroomName: course.title,
      },
    });
  };

  const handleDeactivate = async (course) => {
    if (deactivatingCourseId) return;
    const confirmed = await confirmToast({
      title: "إيقاف الدورة؟",
      message: `ستختفي دورة «${course.title}» من الرئيسية، لكنها ستظل متاحة للمشتركين الحاليين.`,
      confirmLabel: "إيقاف الدورة",
    });
    if (!confirmed) return;
    setDeactivatingCourseId(course.id);
    try {
      await deactivateAdminCourse(course.id);
      setCourses((items) => items.map((item) => String(item.id) === String(course.id) ? { ...item, rawStatus: "archived", status: "غير نشطة" } : item));
      toast.success("تم إيقاف الدورة مع الحفاظ على وصول المشتركين");
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر إيقاف الدورة")); }
    finally { setDeactivatingCourseId(null); }
  };
  const handleActivate = async (course) => {
    if (deactivatingCourseId) return;
    const confirmed = await confirmToast({
      title: "تفعيل الدورة؟",
      message: `ستعود دورة «${course.title}» للظهور في الرئيسية ويمكن للمتعلمين الجدد الاشتراك بها.`,
      confirmLabel: "تفعيل الدورة",
    });
    if (!confirmed) return;
    setDeactivatingCourseId(course.id);
    try {
      await activateAdminCourse(course.id);
      setCourses((items) => items.map((item) => String(item.id) === String(course.id) ? { ...item, rawStatus: "published", status: "منشور", archivedAt: null } : item));
      toast.success("تم تفعيل الدورة وإعادتها للعرض");
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر تفعيل الدورة")); }
    finally { setDeactivatingCourseId(null); }
  };

  useEffect(() => {
    let active = true;
    fetchAdminCourses()
      .then(async (items) => {
        if (!active) return;
        setCourses(items);
        setLoading(false);

        const coursesMissingLessonCount = items.filter(
          (course) => !Number(course.lessons) && course.id,
        );
        if (!coursesMissingLessonCount.length) return;

        const detailResults = await Promise.allSettled(
          coursesMissingLessonCount.map((course) => fetchAdminCourse(course.id)),
        );
        if (!active) return;
        const lessonCountsById = new Map();
        detailResults.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          const detail = result.value;
          const count = Math.max(
            Number(detail.lessons || 0),
            (detail.curriculum || []).reduce(
              (total, section) => total + (section.lessons?.length || 0),
              0,
            ),
          );
          lessonCountsById.set(
            String(coursesMissingLessonCount[index].id),
            count,
          );
        });
        setCourses((current) =>
          current.map((course) =>
            lessonCountsById.has(String(course.id))
              ? { ...course, lessons: lessonCountsById.get(String(course.id)) }
              : course,
          ),
        );
      })
      .catch((error) =>
        toast.error(
          getApiErrorMessage(error, "تعذر تحميل الدورات قيد المراجعة"),
        ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return courses
      .filter((course) => {
        const matchesTab = course.rawStatus === activeTab;
        const matchesSearch =
          !query ||
          `${course.title} ${course.instructor} ${course.category}`
            .toLocaleLowerCase("ar")
            .includes(query);
        const matchesCategory =
          !selectedCategory ||
          String(course.categoryId || course.category) === selectedCategory;
        const matchesAudience = !selectedAudience || course.audienceType === selectedAudience;
        return matchesTab && matchesSearch && matchesCategory && matchesAudience;
      })
      .sort(
        (firstCourse, secondCourse) =>
          courseDateValue(secondCourse, activeTab) -
          courseDateValue(firstCourse, activeTab),
      );
  }, [activeTab, courses, search, selectedCategory, selectedAudience]);
  const categories = useMemo(() => {
    const values = new Map();
    courses.forEach((course) => {
      const key = String(course.categoryId || course.category || "");
      if (key) values.set(key, course.category);
    });
    return [...values.entries()];
  }, [courses]);
  const pendingCount = courses.filter(
    (course) => course.rawStatus === "pending_review",
  ).length;
  const publishedCount = courses.filter(
    (course) => course.rawStatus === "published",
  ).length;
  const archivedCount = courses.filter(
    (course) => course.rawStatus === "archived",
  ).length;

  return (
    <AdminLayout>
      <main
        dir="rtl"
        className="min-h-full space-y-3 rounded-2xl bg-[#F5F7FB] p-3 sm:p-6"
      >
        <header className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#1E55B3] p-6 text-white shadow-sm sm:p-8">
          <div className="absolute -left-10 -top-14 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-sm font-semibold text-[#8FE3D8]">
              إدارة المحتوى
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              الدورات
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/75">
              تابع الدورات المنشورة وراجع طلبات النشر الجديدة.
            </p>
          </div>
        </header>

        <section className="grid gap-3 py-0! sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-[#E3E9F2] bg-white p-5 shadow-xs">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={23} />
            </span>
            <div>
              <p className="text-sm text-[#667085]">بانتظار المراجعة</p>
              <strong className="mt-1 block text-2xl text-[#17213A]">
                {pendingCount}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[#E3E9F2] bg-white p-5 shadow-xs">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8F8F5] text-[#087F72]">
              <ClipboardCheck size={23} />
            </span>
            <div>
              <p className="text-sm text-[#667085]">الدورات المنشورة</p>
              <strong className="mt-1 block text-2xl text-[#17213A]">
                {publishedCount}
              </strong>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#E3E9F2] bg-white py-0! shadow-xs">
          <div className="flex flex-col gap-3 border-b border-[#EEF1F5] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-extrabold text-[#17213A]">قائمة الدورات</h2>
              <p className="mt-1 text-xs text-[#98A2B3]">
                المنشورة وقيد المراجعة وغير النشطة
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="relative w-full sm:w-80">
                <Search
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن دورة أو محاضر..."
                  className="h-11 w-full rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] pr-10 pl-3 text-sm outline-none transition focus:border-[#123C91] focus:bg-white"
                />
              </label>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value)
                    next.set("category", event.target.value);
                  else next.delete("category");
                  setSearchParams(next);
                }}
                className="h-11 w-full rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] px-3 text-sm text-[#475467] outline-none focus:border-[#123C91] sm:w-52"
              >
                <option value="">كل التصنيفات</option>
                {categories.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <select value={selectedAudience} onChange={(event) => { const next=new URLSearchParams(searchParams); if(event.target.value) next.set("audienceType",event.target.value); else next.delete("audienceType"); setSearchParams(next); }} className="h-11 rounded-xl border border-[#DCE3EC] bg-[#FAFBFC] px-3 text-sm">
                <option value="">كل الجماهير</option><option value="general">عامة</option><option value="school">مدرسية</option><option value="university">جامعية</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto border-b border-[#EEF1F5] px-4 pt-3 sm:px-5">
            <button
              type="button"
              onClick={() => setActiveTab("published")}
              className={`border-b-2 px-4 py-3 text-sm font-bold transition ${activeTab === "published" ? "border-[#123C91] text-[#123C91]" : "border-transparent text-[#667085] hover:text-[#344054]"}`}
            >
              الدورات المنشورة{" "}
              <span className="mr-1 rounded-full bg-[#EEF4FF] px-2 py-0.5 text-xs">
                {publishedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending_review")}
              className={`border-b-2 px-4 py-3 text-sm font-bold transition ${activeTab === "pending_review" ? "border-[#123C91] text-[#123C91]" : "border-transparent text-[#667085] hover:text-[#344054]"}`}
            >
              دورات قيد المراجعة{" "}
              <span className="mr-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs">
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition ${activeTab === "archived" ? "border-[#123C91] text-[#123C91]" : "border-transparent text-[#667085] hover:text-[#344054]"}`}
            >
              الدورات غير النشطة{" "}
              <span className="mr-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {archivedCount}
              </span>
            </button>
          </div>
          {loading ? (
            <div className="grid min-h-72 place-items-center">
              <LoaderCircle className="animate-spin text-[#123C91]" size={34} />
            </div>
          ) : visible.length ? (
            <>
              <div className="grid gap-3 p-4 md:hidden">
                {visible.map((course) => (
                  <article
                    key={course.id}
                    className="rounded-xl border border-[#E5EAF1] p-4"
                  >
                    <div className="flex gap-3">
                      <div className="grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#EAF2FF] text-[#123C91]">
                        {course.coverImage ? (
                          <img
                            src={course.coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen size={22} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="block cursor-pointer truncate font-bold text-[#123C91] underline decoration-[#123C91]/30 underline-offset-4 transition hover:decoration-[#123C91]"
                        >
                          {course.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-1 text-xs text-[#667085]">
                          <UserRound size={13} />
                          <InstructorNameLink
                            course={course}
                            onOpen={setSelectedInstructorCourse}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(course.status)}`}
                      >
                        {course.status}
                      </span>
                      <div className="flex items-center gap-2">
                        {course.rawStatus === "published" && <button type="button" onClick={() => handleDeactivate(course)} disabled={Boolean(deactivatingCourseId)} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-700 disabled:opacity-50"><CirclePause size={15} />{deactivatingCourseId === course.id ? "جارٍ الإيقاف..." : "إيقاف"}</button>}
                        {course.rawStatus === "archived" && <button type="button" onClick={() => handleActivate(course)} disabled={Boolean(deactivatingCourseId)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50"><CirclePlay size={15} />{deactivatingCourseId === course.id ? "جارٍ التفعيل..." : "تفعيل"}</button>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-right text-sm">
                  <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#667085]">
                    <tr>
                      <th className="px-5 py-4">الدورة</th>
                      <th className="px-5 py-4">المحاضر</th>
                      <th className="px-5 py-4">التصنيف</th>
                      <th className="px-5 py-4">{activeTab === "archived" ? "تاريخ الإيقاف" : "تاريخ الإرسال"}</th>
                      <th className="px-5 py-4">الحالة</th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF1F5]">
                    {visible.map((course) => (
                      <tr
                        key={course.id}
                        className="transition hover:bg-[#FAFCFF]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#EAF2FF] text-[#123C91]">
                              {course.coverImage ? (
                                <img
                                  src={course.coverImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <BookOpen size={19} />
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/admin/courses/${course.id}`}
                                className="block max-w-64 cursor-pointer truncate font-bold text-[#123C91] underline decoration-[#123C91]/30 underline-offset-4 transition hover:decoration-[#123C91]"
                              >
                                {course.title}
                              </Link>
                              <p className="mt-1 text-xs text-[#98A2B3]">
                                {course.lessons || 0} درس
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <InstructorNameLink
                            course={course}
                            className="font-semibold text-[#344054]"
                            onOpen={setSelectedInstructorCourse}
                          />
                          <div className="mt-1 max-w-44 truncate text-xs text-[#98A2B3]">
                            {course.instructorDetails?.headline ||
                              course.instructorDetails?.profileSlug ||
                              "—"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/admin/courses?category=${encodeURIComponent(course.categoryId || course.category)}&status=${activeTab}`}
                            className="rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-xs font-semibold text-[#123C91] transition hover:bg-[#DCE9FF] hover:underline"
                          >
                            {course.category || "—"}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-[#667085]">
                          {dateOf(
                            activeTab === "archived"
                              ? course.archivedAt || course.updatedAt || course.submittedAt || course.createdAt
                              : course.submittedAt || course.updatedAt || course.createdAt,
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(course.status)}`}
                          >
                            {course.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {course.rawStatus === "published" && <button type="button" onClick={() => handleDeactivate(course)} disabled={Boolean(deactivatingCourseId)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 px-4 py-2.5 font-bold text-amber-700 disabled:opacity-50"><CirclePause size={17} />{deactivatingCourseId === course.id ? "جارٍ الإيقاف..." : "إيقاف"}</button>}
                            {course.rawStatus === "archived" && <button type="button" onClick={() => handleActivate(course)} disabled={Boolean(deactivatingCourseId)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-4 py-2.5 font-bold text-emerald-700 disabled:opacity-50"><CirclePlay size={17} />{deactivatingCourseId === course.id ? "جارٍ التفعيل..." : "تفعيل"}</button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="px-4 py-10 text-center sm:py-12">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#EEF4FF] text-[#123C91]">
                <ClipboardCheck size={27} />
              </span>
              <h2 className="mt-3 text-lg font-bold text-[#17213A]">
                {activeTab === "published"
                  ? "لا توجد دورات منشورة"
                  : activeTab === "archived"
                    ? "لا توجد دورات غير نشطة"
                    : "لا توجد دورات قيد المراجعة"}
              </h2>
              <p className="mt-1.5 text-sm text-[#667085]">
                {search
                  ? "لا توجد نتائج مطابقة للبحث."
                  : activeTab === "published"
                    ? "ستظهر هنا الدورات بعد نشرها."
                    : activeTab === "archived"
                      ? "ستظهر هنا الدورات التي تم أرشفتها."
                      : "ستظهر هنا طلبات النشر الجديدة."}
              </p>
            </div>
          )}
        </section>
        <InstructorDetailsModal
          key={selectedInstructorCourse?.id || "closed-instructor-modal"}
          course={selectedInstructorCourse}
          onClose={() => setSelectedInstructorCourse(null)}
          onMessage={openInstructorMessages}
        />
      </main>
    </AdminLayout>
  );
}
