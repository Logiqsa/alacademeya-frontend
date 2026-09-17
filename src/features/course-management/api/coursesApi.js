import {
  getAssetUrl,
  getPublicCourses,
  getPublicCourse,
  getCourseReviews,
  getMyCourseReview,
  createCourseReview,
  updateCourseReview,
  deleteCourseReview,
  getInstructorCourseReviews,
  getAdminCourseReviews,
  deleteAdminCourseReview,
  getMyTeacherCourses,
  getMyTeacherCourse,
  getMyTeacherCourseEnrollments,
  getMyCourseEnrollments,
  getAdminInstructor,
  getAllAdminCourses,
  getPendingAdminCourses,
  approveMarketplaceCourse,
  rejectMarketplaceCourse,
  archiveCourse,
  deleteMarketplaceCourse,
  getCourseCategories,
  getAdminCourseCategories,
  createCourseCategory,
  createMarketplaceCourse,
  updateMarketplaceCourse,
  uploadCourseCover,
  uploadCoursePromoVideo,
  createCourseSection,
  createCourseLesson,
  updateCourseSection,
  deleteCourseSection,
  updateCourseLesson,
  uploadCourseLessonMedia,
  submitMarketplaceCourse,
  getTeachers,
  getTeacher,
  getUser,
  getMyInstructorProfile,
  getMyProfile,
  getPublicInstructor,
  enrollInMarketplaceCourse,
  getCourseAccess,
  getCourseLearningView,
  getAdminCourse,
  updateAdminCourse,
  uploadAdminCourseCover,
  uploadAdminCoursePromoVideo,
  deleteAdminCourse,
  createCourseQuiz,
  updateCourseQuiz,
  addCourseQuizQuestion,
  updateCourseQuizQuestion,
  reorderCourseQuizQuestions,
  deleteCourseQuizQuestion,
  deleteCourseQuiz,
  reorderCourseQuizzes,
  reorderCourseSections,
  reorderCourseLessons,
  moveCourseLesson,
  deleteCourseLesson,
  uploadCourseLessonAttachments,
  updateCourseLessonAttachmentAccessMode,
  deleteCourseLessonAttachment,
} from "../../../services/APIService";
import { normalizeApiError } from "../../../services/apiError";
import { countCompletedLessons } from "./lessonProgress";
import { retryCourseSaveStep } from "./retryCourseSaveStep";

const valueOf = (value, fallback = "") => {
  if (value == null) return fallback;
  if (typeof value === "string" || typeof value === "number") return value;
  if (Array.isArray(value))
    return value
      .map((item) => valueOf(item))
      .filter(Boolean)
      .join("، ");
  const nested =
    value.ar ??
    value.en ??
    value.name ??
    value.fullName ??
    value.title ??
    value.user;
  return nested == null ? fallback : valueOf(nested, fallback);
};

const textOf = (value, fallback = "") => String(valueOf(value, fallback));

const reconciliationError = (entityLabel) => {
  const error = new Error(
    `تعذرت مطابقة ${entityLabel} مع بيانات الخادم. أعد تحميل الدورة قبل الحفظ.`,
  );
  error.code = "COURSE_EDITOR_STALE";
  return error;
};

const listOf = (payload) => {
  const data = payload?.data?.data ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return data?.courses || data?.enrollments || data?.items || data?.docs || [];
};

const statusLabels = {
  published: "منشور",
  pending: "قيد المراجعة",
  pending_review: "قيد المراجعة",
  under_review: "قيد المراجعة",
  draft: "مسودة",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

const levelLabels = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  all: "جميع المستويات",
  all_levels: "جميع المستويات",
};

const languageLabels = {
  ar: "عربي",
  arabic: "عربي",
  عربي: "عربي",
  العربية: "عربي",
  en: "إنجليزي",
  english: "إنجليزي",
  إنجليزي: "إنجليزي",
  الإنجليزية: "إنجليزي",
};

const normalizedCourseLanguage = (value) => {
  const rawValue = String(valueOf(value, "ar")).trim();
  return languageLabels[rawValue] || languageLabels[rawValue.toLowerCase()] || rawValue;
};
const arrayOfText = (value) =>
  Array.isArray(value)
    ? value.map((item) => textOf(item)).filter(Boolean)
    : value
      ? [textOf(value)]
      : [];

const normalizeInstructor = (profile = {}, account = null) => {
  const user =
    account || (typeof profile.user === "object" ? profile.user : {});
  const name = textOf(
    user.fullName || user.name || profile.fullName || profile.name,
    "المحاضر",
  );
  return {
    ...profile,
    id: profile.id || profile._id,
    profileSlug: profile.profileSlug || profile.slug || user.username || "",
    name,
    fullName: name,
    headline: textOf(profile.headline),
    bio: textOf(profile.bio),
    status: profile.status || "active",
    avatar: getAssetUrl(
      user.profileImage ||
        user.avatar ||
        profile.profileImage ||
        profile.avatar,
    ),
    profileImage: getAssetUrl(
      user.profileImage ||
        user.avatar ||
        profile.profileImage ||
        profile.avatar,
    ),
    user: {
      ...user,
      id:
        user.id ||
        user._id ||
        (typeof profile.user === "string" ? profile.user : undefined),
    },
  };
};

export const normalizeCourse = (source = {}) => {
  const enrollment = source.enrollment || source;
  const linkedCourse = source.course || source.courseId || enrollment.course;
  const course =
    linkedCourse && typeof linkedCourse === "object" ? linkedCourse : source;
  const linkedCourseId = typeof linkedCourse === "string" ? linkedCourse : "";
  const sections =
    (Array.isArray(course.sections) && course.sections.length
      ? course.sections
      : null) ||
    (Array.isArray(course.curriculum) ? course.curriculum : null) ||
    (Array.isArray(course.curriculum_sections)
      ? course.curriculum_sections
      : null) ||
    (Array.isArray(source.sections) ? source.sections : []);
  const embeddedLessonCount = sections.reduce(
    (total, section) =>
      total +
      (Array.isArray(section.lessons)
        ? section.lessons.length
        : Number(section.lessonsCount ?? section.lessonCount ?? 0)),
    0,
  );
  const lessonCount = Math.max(
    Number(course.lessonsCount || 0),
    Number(course.lessonCount || 0),
    Number(course.totalLessons || 0),
    Number(course.totalLessonsCount || 0),
    Number(typeof course.lessons === "number" ? course.lessons : 0),
    embeddedLessonCount,
  );
  const completedLessons =
    source.completedLessonsCount ?? source.progress?.completedLessons ?? 0;
  const progress = Number(
    source.progressPercentage ??
      source.progress?.progressPercentage ??
      source.progress?.percentage ??
      (typeof source.progress === "number" ? source.progress : 0),
  );
  const instructor =
    course.instructor || course.teacher || course.createdBy || {};
  const normalizedInstructor =
    typeof instructor === "object" && instructor !== null
      ? normalizeInstructor(instructor)
      : null;
  const rejectionReview = [...(course.reviewHistory || [])]
    .reverse()
    .find((entry) => entry.action === "rejected");
  const category = course.category || {};
  const price = Number(course.price?.amount ?? course.price ?? 0);
  const studentsData = Array.isArray(course.enrollments)
    ? course.enrollments
    : Array.isArray(course.students)
      ? course.students
      : Array.isArray(source.enrollments)
        ? source.enrollments
        : [];
  const reviewsData = Array.isArray(course.reviews)
    ? course.reviews
    : Array.isArray(course.ratings)
      ? course.ratings
      : Array.isArray(source.reviews)
        ? source.reviews
        : [];
  const transactions = Array.isArray(course.transactions)
    ? course.transactions
    : Array.isArray(course.payments)
      ? course.payments
      : Array.isArray(source.transactions)
        ? source.transactions
        : [];
  const entityId = (value) =>
    value?._id || value?.id || (typeof value === "string" ? value : "");
  const academicCurriculum =
    course.curriculumRef ||
    course.academicCurriculum ||
    course.curriculumId ||
    (typeof course.curriculum === "object" && !Array.isArray(course.curriculum)
      ? course.curriculum
      : null);

  const academicStage = course.stage || course.academicStage;
  const academicGrade = course.grade || course.academicGrade;
  const academicSubject = course.subject;

  return {
    ...course,
    id: course._id || course.id || linkedCourseId,
    slug: course.slug || course._id || course.id || linkedCourseId,
    title: String(valueOf(course.title, "دورة تعليمية")),
    titleEn: textOf(course.title?.en || course.titleEn || course.titleEnglish),
    description: String(valueOf(course.description)),
    category: String(valueOf(category, "عام")),
    categoryId:
      category._id ||
      category.id ||
      (typeof course.category === "string" ? course.category : ""),
    classification: String(
      valueOf(course.audienceType, valueOf(course.courseType, valueOf(category, "عام"))),
    ),
    audienceType: course.audienceType || (course.courseType === "academic" || academicCurriculum ? "school" : "general"),
    level: levelLabels[course.level] || valueOf(course.level, "جميع المستويات"),
    language: normalizedCourseLanguage(course.language),
    instructor:
      normalizedInstructor?.name || String(valueOf(instructor, "الأكاديمية")),
    instructorDetails: normalizedInstructor
      ? normalizedInstructor
      : { name: textOf(instructor, "الأكاديمية") },
    instructorId:
      instructor._id ||
      instructor.id ||
      (typeof course.instructor === "string" ? course.instructor : ""),
    instructorSlug: normalizedInstructor?.profileSlug || "",
    academicCurriculumId: entityId(academicCurriculum),
    academicStageId: entityId(academicStage),
    academicGradeId: entityId(academicGrade),
    subjectId: entityId(academicSubject),
    // academicCurriculumName: textOf(academicCurriculum),
    academicCurriculumName: textOf(
      academicCurriculum ||
        course.curriculumName ||
        course.curriculumTitle ||
        course.curriculum,
    ),
    academicStage: textOf(academicStage),
    academicGrade: textOf(academicGrade),
    subject: textOf(academicSubject),
    shortDescription: textOf(course.shortDescription),
    requirements: arrayOfText(course.requirements),
    targetAudience: arrayOfText(course.targetAudience),
    outcomes:
      course.outcomes ||
      course.learningOutcomes ||
      course.whatYouWillLearn ||
      [],
    tags: course.tags || [],
    pricingType: course.pricingType || (price > 0 ? "paid" : "free"),
    discountPercentage: Number(
      course.discountPercentage ?? course.discount ?? 0,
    ),
    effectivePrice: Number(course.effectivePrice ?? price),
    promoVideoUrl: getAssetUrl(
      course.promoVideo?.url || course.promoVideo || course.previewVideo,
    ),
    price: course.pricingType === "free" ? 0 : price,
    duration: Number(
      course.durationHours ?? course.totalDurationHours ?? course.duration ?? 0,
    ),
    durationSeconds: Number(course.durationSeconds ?? 0),
    lessons: Number(lessonCount),
    averageRating: Number(course.averageRating ?? course.rating ?? 0),
    ratingCount: Number(course.ratingCount ?? 0),
    rating: Number(course.averageRating ?? course.rating ?? 0),
    students: Number(
      Array.isArray(course.enrollments)
        ? course.enrollments.filter(
            (item) => !item?.status || item.status === "active",
          ).length
        : (course.enrollmentsCount ??
            course.studentsCount ??
            (Array.isArray(course.students)
              ? course.students.length
              : course.students) ??
            studentsData.length),
    ),
    revenue: Number(course.revenue ?? 0),
    platformCommissionBps: course.platformCommissionBps,
    platformCommissionPercentage: course.platformCommissionPercentage,
    instructorSharePercentage: course.instructorSharePercentage,
    createdAt: course.createdAt || source.createdAt,
    submittedAt:
      course.submittedAt ||
      source.submittedAt ||
      [...(course.reviewHistory || [])]
        .reverse()
        .find((entry) => entry.action === "submitted")?.createdAt ||
      null,
    updatedAt: course.updatedAt || source.updatedAt,
    studentsData,
    reviewsData,
    transactions,
    status: statusLabels[course.status] || valueOf(course.status, "مسودة"),
    rejectionReason: course.rejectionReason || rejectionReview?.notes || "",
    rejectedReason:
      course.rejectedReason ||
      course.rejectionReason ||
      rejectionReview?.notes ||
      "",
    rawStatus: course.status ?? null,
    featured: Boolean(course.featured ?? course.isFeatured),
    coverImage: getAssetUrl(
      course.coverImage?.url || course.coverImage || course.thumbnail,
    ),
    sections,
    quizzes: Array.isArray(course.quizzes) ? course.quizzes : [],
    curriculum: sections.map((section) => ({
      ...section,
      id: section._id || section.id,
      title: valueOf(section.title),
      lessons: (section.lessons || []).map((lesson) => ({
        ...lesson,
        id: lesson._id || lesson.id,
        title: valueOf(lesson.title),
        type:
          {
            video: "فيديو",
            document: "ملف",
            file: "ملف",
            audio: "صوت",
            quiz: "اختبار",
            exam: "اختبار",
          }[lesson.type || lesson.contentType] ||
          lesson.type ||
          lesson.contentType ||
          "فيديو",
        duration: Number(
          lesson.durationMinutes ??
            lesson.duration ??
            (lesson.durationSeconds != null ? lesson.durationSeconds / 60 : 0),
        ),
        preview: Boolean(lesson.isPreview),
        legacyMedia:
          lesson.media?.url ||
          lesson.mediaUrl ||
          lesson.videoUrl ||
          lesson.fileUrl ||
          lesson.primaryContent
            ? {
                name: lesson.media?.name || lesson.fileName || "محتوى الدرس",
                url: getAssetUrl(
                  lesson.media?.url ||
                    lesson.mediaUrl ||
                    lesson.videoUrl ||
                    lesson.fileUrl,
                ),
              }
            : null,
        media:
          lesson.media?.url ||
          lesson.mediaUrl ||
          lesson.videoUrl ||
          lesson.fileUrl ||
          lesson.primaryContent
            ? {
                ...lesson.primaryContent,
                name:
                  lesson.primaryContent?.originalName ||
                  lesson.media?.name ||
                  lesson.fileName ||
                  "محتوى الدرس",
                originalName: lesson.primaryContent?.originalName,
                url:
                  getAssetUrl(
                    lesson.media?.url ||
                      lesson.mediaUrl ||
                      lesson.videoUrl ||
                      lesson.fileUrl ||
                      lesson.primaryContent?.url ||
                      lesson.primaryContent?.path ||
                      lesson.primaryContent?.secureUrl,
                  ) || (lesson.primaryContent ? "#stored" : null),
                previewUrl: getAssetUrl(
                  lesson.media?.url ||
                    lesson.mediaUrl ||
                    lesson.videoUrl ||
                    lesson.fileUrl ||
                    lesson.primaryContent?.url ||
                    lesson.primaryContent?.path ||
                    lesson.primaryContent?.secureUrl,
                ),
                persisted: Boolean(
                  lesson.primaryContent ||
                  lesson.mediaUrl ||
                  lesson.videoUrl ||
                  lesson.fileUrl,
                ),
              }
            : null,
        attachments: (lesson.attachments || []).map((file) => ({
          ...file,
          name: file.name || file.fileName || "مرفق",
          accessMode: file.accessMode || "downloadable",
          url: getAssetUrl(file.url || file.path),
        })),
        quiz: lesson.quiz?.questions || lesson.questions || lesson.quiz || [],
      })),
    })),
    progressData: {
      percentage: Number.isFinite(progress) ? progress : 0,
      completedLessons: Number(completedLessons),
      totalLessons: Number(lessonCount),
      completedTests: Number(
        source.completedQuizzesCount ??
          source.progress?.requiredQuizzesPassed ??
          0,
      ),
      lastCompletedTitle: valueOf(source.lastLesson?.title),
      isCompleted: Boolean(source.progress?.isCompleted),
      certificateIssued: Boolean(source.progress?.certificateIssued),
      certificateId: source.progress?.certificateId || null,
    },
    enrollmentId: source._id || source.id,
  };
};

const enrichCourseInstructor = async (course) => {
  const current = course.instructorDetails || {};
  if (
    current.profileSlug &&
    typeof current.user === "object" &&
    current.user?.fullName
  )
    return course;
  const instructorId = course.instructorId || current._id || current.id;
  if (!instructorId) return course;

  try {
    let teacher;
    try {
      const response = await getTeacher(instructorId);
      const data = response?.data?.data ?? response?.data ?? response;
      teacher = data?.teacher || data?.instructor || data;
    } catch {
      try {
        const response = await getMyInstructorProfile();
        const data = response?.data?.data ?? response?.data ?? response;
        teacher = data?.instructor || data?.teacher || data?.profile || data;
      } catch {
        const response = await getTeachers();
        teacher = listOf(response).find((item) => {
          const account = item.user || item;
          return [item._id, item.id, account._id, account.id].some(
            (id) => String(id || "") === String(instructorId),
          );
        });
      }
    }
    if (!teacher) return course;
    let account =
      teacher?.user && typeof teacher.user === "object"
        ? teacher.user
        : teacher;
    const userId =
      typeof teacher?.user === "string"
        ? teacher.user
        : teacher?.userId ||
          teacher?.user?._id ||
          teacher?.user?.id ||
          instructorId;
    if (userId && (!account?.email || !account?.phone)) {
      try {
        const userResponse = await getUser(userId);
        const userData =
          userResponse?.data?.data ?? userResponse?.data ?? userResponse;
        account = userData?.user || userData;
      } catch {
        try {
          const userResponse = await getMyProfile();
          const userData =
            userResponse?.data?.data ?? userResponse?.data ?? userResponse;
          account = userData?.user || userData;
        } catch {
          // The teacher profile can still be displayed when account details are restricted.
        }
      }
    }
    const firstSelection = teacher.teachingSelections?.[0];
    const firstStage = firstSelection?.stages?.[0];
    const firstGrade = firstStage?.grades?.[0];
    const firstSubject = firstGrade?.subjects?.[0];
    const name = textOf(
      account?.fullName || account?.name || teacher?.fullName || teacher?.name,
      course.instructor,
    );
    return {
      ...course,
      instructor: name,
      instructorId:
        teacher?._id ||
        teacher?.id ||
        account?._id ||
        account?.id ||
        instructorId,
      instructorDetails: {
        ...teacher,
        name,
        fullName: name,
        email: account?.email || teacher?.email,
        phone:
          account?.phone ||
          account?.phoneNumber ||
          teacher?.phone ||
          teacher?.phoneNumber,
        avatar: getAssetUrl(
          account?.avatar ||
            account?.profileImage ||
            teacher?.avatar ||
            teacher?.profileImage,
        ),
        createdAt: account?.createdAt || teacher?.createdAt,
        experience:
          teacher?.experienceYears ??
          teacher?.yearsOfExperience ??
          teacher?.experience,
        yearsOfExperience:
          teacher?.experienceYears ??
          teacher?.yearsOfExperience ??
          teacher?.experience,
        curriculum: textOf(
          firstSelection?.curriculum ||
            teacher?.curriculum ||
            teacher?.curriculums?.[0] ||
            course.academicCurriculumName,
        ),
        educationSystem: textOf(
          firstSelection?.curriculum ||
            teacher?.educationSystem ||
            course.academicCurriculumName,
        ),
        stage: textOf(
          firstStage?.stage ||
            firstStage ||
            teacher?.stage ||
            course.academicStage,
        ),
        subject: textOf(
          firstSubject ||
            teacher?.subject ||
            teacher?.subjects?.[0] ||
            course.subject,
        ),
        user: account,
      },
    };
  } catch {
    return course;
  }
};

const enrichWithMyInstructorProfile = async (course) => {
  try {
    const [profileResponse, accountResponse] = await Promise.all([
      getMyInstructorProfile(),
      getMyProfile().catch(() => null),
    ]);
    const profileData =
      profileResponse?.data?.data ?? profileResponse?.data ?? profileResponse;
    const accountData =
      accountResponse?.data?.data ?? accountResponse?.data ?? accountResponse;
    const profile = profileData?.instructor || profileData;
    const account = accountData?.user || accountData || null;
    const instructor = normalizeInstructor(profile, account);
    return {
      ...course,
      instructor: instructor.name,
      instructorId: instructor.id || course.instructorId,
      instructorSlug: instructor.profileSlug,
      instructorDetails: instructor,
    };
  } catch {
    return enrichCourseInstructor(course);
  }
};

export const fetchPublicCourses = async (params) =>
  listOf(await getPublicCourses(params)).map(normalizeCourse);

export const fetchPublicCourse = async (slug) =>
  normalizeCourse(responseCourse(await getPublicCourse(slug)));

export const normalizeCourseReview = (review = {}, { includeId = false } = {}) => ({
  ...(includeId && review.id ? { id: String(review.id) } : {}),
  rating: Number(review.rating || 0),
  reviewText: review.reviewText ?? null,
  createdAt: review.createdAt || null,
  updatedAt: review.updatedAt || null,
  reviewer: {
    displayName: textOf(review.reviewer?.displayName, "مستخدم"),
    profileImage: getAssetUrl(review.reviewer?.profileImage),
  },
});

const normalizeReviewsResponse = (response, options) => {
  const body = response?.data ?? response ?? {};
  const items = Array.isArray(body.data) ? body.data : [];
  const pagination = body.pagination || {};
  return {
    items: items.map((review) => normalizeCourseReview(review, options)),
    pagination: {
      page: Number(pagination.page || 1),
      limit: Number(pagination.limit || 10),
      total: Number(pagination.total || 0),
      pages: Number(pagination.pages || 0),
    },
  };
};

export const fetchCourseReviews = async (courseId, params) =>
  normalizeReviewsResponse(await getCourseReviews(courseId, params));
export const fetchMyCourseReview = async (courseId) => {
  const response = await getMyCourseReview(courseId);
  const review = response?.data?.data ?? null;
  return review ? normalizeCourseReview(review) : null;
};
export const submitCourseReview = async (courseId, payload) => {
  const response = await createCourseReview(courseId, payload);
  return normalizeCourseReview(response?.data?.data || {});
};
export const editCourseReview = async (courseId, payload) => {
  const response = await updateCourseReview(courseId, payload);
  return normalizeCourseReview(response?.data?.data || {});
};
export const removeCourseReview = (courseId) => deleteCourseReview(courseId);
export const fetchInstructorCourseReviews = async (courseId, params) =>
  normalizeReviewsResponse(await getInstructorCourseReviews(courseId, params));
export const fetchAdminCourseReviews = async (courseId, params) =>
  normalizeReviewsResponse(await getAdminCourseReviews(courseId, params), { includeId: true });
export const removeAdminCourseReview = (courseId, reviewId) =>
  deleteAdminCourseReview(courseId, reviewId);

export const fetchPublicInstructor = async (slug) => {
  const response = await getPublicInstructor(slug);
  const data = response?.data?.data ?? response?.data ?? response;
  return normalizeInstructor(data?.instructor || data);
};

export const fetchAdminInstructor = async (id) => {
  const response = await getAdminInstructor(id);
  const data = response?.data?.data ?? response?.data ?? response;
  return normalizeInstructor(data?.instructor || data);
};

export const enrollFreeCourse = async (courseId) => {
  const response = await enrollInMarketplaceCourse(courseId);
  return response?.data?.data ?? response?.data ?? response;
};

export const fetchCourseAccess = async (courseId) => {
  const response = await getCourseAccess(courseId);
  return response?.data?.data ?? response?.data ?? response;
};

export const fetchCourseLearningView = async (courseId) => {
  const response = await getCourseLearningView(courseId);
  return response?.data?.data ?? response?.data ?? response;
};

export const fetchTeacherCourses = async (params) =>
  listOf(await getMyTeacherCourses(params)).map(normalizeCourse);

export const fetchTeacherCourse = async (id) =>
  enrichWithMyInstructorProfile(
    normalizeCourse(responseCourse(await getMyTeacherCourse(id))),
  );

export const fetchTeacherCourseEnrollments = async (id) =>
  listOf(await getMyTeacherCourseEnrollments(id));

export const fetchStudentCourses = async (params) => {
  const enrollments = listOf(await getMyCourseEnrollments(params));
  const courses = enrollments.map((enrollment) => ({
    ...normalizeCourse(enrollment),
    enrollmentStatus: enrollment.status || "active",
    enrollmentRevokedAt: enrollment.revokedAt,
    enrollmentRevocationReason: enrollment.revocationReason,
  }));
  // The enrollment summary can omit completedLessonsCount even when it has a
  // progress percentage. The learning view contains the actual lesson states.
  const withLessonCounts = async (course) => {
    if (!course.id || course.enrollmentStatus === "revoked") return course;
    const view = await fetchCourseLearningView(course.id);
    const lessonCounts = countCompletedLessons(view?.curriculum);
    if (!lessonCounts) return course;
    return {
      ...course,
      progressData: {
        ...course.progressData,
        ...lessonCounts,
      },
    };
  };
  const results = [];
  for (let index = 0; index < courses.length; index += 5) {
    results.push(...await Promise.allSettled(
      courses.slice(index, index + 5).map(withLessonCounts),
    ));
  }
  return results.map((result, index) =>
    result.status === "fulfilled" ? result.value : courses[index],
  );
};

export const fetchAdminCourses = async (params) => {
  try {
    return listOf(await getAllAdminCourses(params)).map(normalizeCourse);
  } catch (error) {
    const apiError = normalizeApiError(error);
    if (apiError.status !== 404 && apiError.code !== "COURSE_NOT_FOUND")
      throw error;

    const [pendingResponse, publishedResponse] = await Promise.all([
      getPendingAdminCourses(params),
      getPublicCourses(params),
    ]);
    const coursesById = new Map();
    [...listOf(pendingResponse), ...listOf(publishedResponse)].forEach(
      (course) => {
        const normalized = normalizeCourse(course);
        if (normalized.id) coursesById.set(String(normalized.id), normalized);
      },
    );
    return [...coursesById.values()];
  }
};

export const removeAdminCourse = (courseId) => deleteAdminCourse(courseId);

// The API lifecycle archives courses and does not expose DELETE /courses/:id.
export const removeTeacherCourse = (courseId) => archiveCourse(courseId);
export const deleteTeacherCourse = (courseId) => deleteMarketplaceCourse(courseId);

export const approveCourse = async (courseId, notes = "") =>
  normalizeCourse(
    responseCourse(
      await approveMarketplaceCourse(
        courseId,
        notes.trim() ? { notes: notes.trim() } : {},
      ),
    ),
  );

export const rejectCourse = async (courseId, reason, details = "") =>
  normalizeCourse(
    responseCourse(
      await rejectMarketplaceCourse(courseId, {
        notes: [reason, details]
          .map((value) => value?.trim())
          .filter(Boolean)
          .join(" — "),
      }),
    ),
  );

export const fetchCourseCategories = async ({ admin = false } = {}) =>
  listOf(await (admin ? getAdminCourseCategories() : getCourseCategories()));
export const fetchCourseInstructors = async () => listOf(await getTeachers());
export const addCourseCategory = async (name) => {
  const response = await createCourseCategory({
    name: { ar: name.trim(), en: name.trim() },
  });
  const data = response?.data?.data ?? response?.data ?? response;
  return data?.category || data;
};

const splitValues = (value) =>
  Array.isArray(value)
    ? value.filter(Boolean)
    : String(value || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);

const levelValues = {
  مبتدئ: "beginner",
  متوسط: "intermediate",
  متقدم: "advanced",
  "جميع المستويات": "all_levels",
};
const languageValues = {
  ar: "ar",
  arabic: "ar",
  عربي: "ar",
  العربية: "ar",
  en: "en",
  english: "en",
  إنجليزي: "en",
  الإنجليزية: "en",
};

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const coursePayload = (course) => {
  const academicIds = {
    curriculum: course.academicCurriculum,
    stage: course.academicStage,
    grade: course.academicGrade,
    subject: course.subject,
  };
  const isAcademic =
    course.audienceType === "school" &&
    Object.values(academicIds).every(isMongoId);

  return {
    title: {
      ar: course.title.trim(),
      ...(course.titleEn?.trim() ? { en: course.titleEn.trim() } : {}),
    },
    description: course.description || course.shortDescription || course.title,
    requirements: splitValues(course.requirements),
    targetAudience: splitValues(course.targetAudience),
    outcomes: splitValues(course.outcomes),
    tags: splitValues(course.tags),
    // The editable form stores the current selection in `category`. A loaded
    // course may still carry its original `categoryId`, which must not win
    // after the admin selects a different category.
    category: course.category || course.categoryId,
    audienceType: course.audienceType || "general",
    ...(isAcademic ? academicIds : {}),
    level: levelValues[course.level] || course.level || "beginner",
    language:
      languageValues[course.language] ||
      languageValues[String(course.language || "").toLowerCase()] ||
      "ar",
    pricingType: course.pricingType || "free",
    ...(course.pricingType === "paid"
      ? {
          price: Number(course.price),
          discountPercentage: Number(course.discountPercentage || 0),
        }
      : {}),
  };
};

const responseData = (response) =>
  response?.data?.data ?? response?.data ?? response;

const responseCourse = (response) => {
  const data = responseData(response);
  return data?.course || data;
};

export const fetchAdminCourse = async (id) => {
  const course = responseCourse(await getAdminCourse(id));
  return normalizeCourse(course);
};

export const saveCourseToApi = async ({
  course,
  courseId,
  admin = false,
  submit = false,
  onProgress = () => {},
  onCourseCreated = () => {},
  onTaskStatus = () => {},
  onRetryRequired,
  onEntityCreated = () => {},
  onFileSaved = () => {},
}) => {
  const runStep = (key, label, operation) => {
    onProgress({ label, percent: 0 });
    return retryCourseSaveStep({ key, label, operation, onStatus: onTaskStatus, onRetryRequired });
  };
  onProgress({ label: "جاري حفظ بيانات الدورة", percent: 0 });
  onTaskStatus({ key: 'course', label: 'حفظ بيانات الدورة', status: 'running' });
  const payload = coursePayload(course);
  let response;
  let id = courseId;
  if (courseId) {
    response = await runStep('course', 'حفظ بيانات الدورة', () => (admin
      ? updateAdminCourse(courseId, payload)
      : updateMarketplaceCourse(courseId, payload)));
  } else {
    // Paid courses are validated during creation, so their price must be sent
    // in the first request rather than waiting for the follow-up PATCH.
    response = await createMarketplaceCourse({
      title: payload.title,
      category: payload.category,
      audienceType: payload.audienceType,
      pricingType: payload.pricingType,
      ...(payload.pricingType === "paid"
        ? {
            price: payload.price,
            discountPercentage: payload.discountPercentage,
          }
        : {}),
    });
    const created = responseCourse(response);
    id = created?._id || created?.id;
    if (id) onCourseCreated(id);
    if (id) response = await runStep('course', 'استكمال بيانات الدورة', () => updateMarketplaceCourse(id, payload));
  }
  let saved = responseCourse(response);
  id = saved?._id || saved?.id || id;
  if (!id) throw new Error("لم يُرجع الخادم معرّف الدورة");
  onTaskStatus({ key: 'course', label: 'حفظ بيانات الدورة', status: 'done' });

  const progressHandler = (label) => (event) => {
    const percent = event.total
      ? Math.round((event.loaded * 100) / event.total)
      : 0;
    onProgress({ label, percent });
  };
  if (course.cover?.file) {
    await runStep('cover', 'رفع صورة الغلاف', () => (admin ? uploadAdminCourseCover : uploadCourseCover)(
      id,
      course.cover.file,
      progressHandler("جاري رفع صورة الغلاف"),
    ));
    onFileSaved({ type: 'cover', file: course.cover.file });
  }
  if (course.promoVideo?.file) {
    await runStep('promo', 'رفع الفيديو الترويجي', () => (admin ? uploadAdminCoursePromoVideo : uploadCoursePromoVideo)(
      id,
      course.promoVideo.file,
      progressHandler("جاري رفع الفيديو الترويجي"),
    ));
    onFileSaved({ type: 'promo', file: course.promoVideo.file });
  }

  // Admin edits are intentionally limited to metadata and public media.
  // Curriculum ownership remains with the instructor.
  if (admin && courseId) {
    const refreshed = responseCourse(await getAdminCourse(id));
    return normalizeCourse(refreshed || saved || { ...course, _id: id });
  }

  let storedSections = [];
  let storedQuizzes = [];
  if (courseId) {
    const detail = responseCourse(await runStep('course', 'تحميل المحتوى المحفوظ', () => (admin ? getAdminCourse(id) : getMyTeacherCourse(id))));
    storedSections = detail?.sections || detail?.curriculum_sections || (Array.isArray(detail?.curriculum) ? detail.curriculum : []);
    storedQuizzes = Array.isArray(detail?.quizzes) ? detail.quizzes : [];
    onTaskStatus({ key: 'course', label: 'حفظ بيانات الدورة', status: 'done' });
  }

  const retainedSectionIds = new Set();
  const retainedQuizIds = new Set();
  const orderedQuizIds = [];
  const storedLessonLocations = new Map();
  storedSections.forEach((storedSection) => {
    const storedSectionId = storedSection._id || storedSection.id;
    (storedSection.lessons || []).forEach((storedLesson) => {
      const storedLessonId = storedLesson._id || storedLesson.id;
      if (storedLessonId)
        storedLessonLocations.set(String(storedLessonId), {
          lesson: storedLesson,
          sectionId: storedSectionId,
        });
    });
  });
  const orderedSectionIds = [];
  for (
    let sectionIndex = 0;
    sectionIndex < course.curriculum.length;
    sectionIndex += 1
  ) {
    const section = course.curriculum[sectionIndex];
    const sectionKey = `section:${section.id}`;
    onTaskStatus({ key: sectionKey, label: section.title, status: 'running' });
    let savedSection = storedSections.find(
      (item) =>
        String(item._id || item.id) === String(section._id || section.id),
    );
    if (!savedSection && courseId && !section._isNew) {
      const error = reconciliationError('القسم');
      onTaskStatus({ key: sectionKey, label: section.title, status: 'failed', error });
      throw error;
    }
    const existingSectionId = savedSection?._id || savedSection?.id;
    if (existingSectionId) {
      await runStep(sectionKey, 'حفظ القسم', () => updateCourseSection(id, existingSectionId, {
        title: section.title,
        description: section.description || "",
      }));
    }
    if (!savedSection) {
      const sectionResponse = await runStep(sectionKey, 'إنشاء القسم', async () => {
        try {
          return await createCourseSection(id, {
            title: section.title,
            description: section.description || '',
          });
        } catch (error) {
          // The server may have created it even when the response was lost.
          try {
            const detail = responseCourse(await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)));
            const sections = detail?.sections || detail?.curriculum_sections || detail?.curriculum || [];
            const candidate = sections[sectionIndex];
            const candidateId = candidate?._id || candidate?.id;
            if (candidateId && candidate.title === section.title && !storedSections.some((item) => String(item._id || item.id) === String(candidateId)) && !retainedSectionIds.has(String(candidateId))) return candidate;
          } catch { /* Keep the original create error for retry. */ }
          throw error;
        }
      });
      const sectionData = responseData(sectionResponse);
      savedSection = sectionData?.section || sectionData;
    }
    const sectionId = savedSection?._id || savedSection?.id;
    if (!sectionId) {
      const error = new Error('لم يُرجع الخادم معرّف القسم');
      onTaskStatus({ key: sectionKey, label: section.title, status: 'failed', error });
      throw error;
    }
    onEntityCreated({ type: 'section', localId: section.id, serverId: sectionId });
    retainedSectionIds.add(String(sectionId));
    orderedSectionIds.push(String(sectionId));
    const storedLessons = savedSection.lessons || [];
    const retainedLessonIds = new Set();
    const orderedLessonIds = [];
    for (
      let lessonIndex = 0;
      lessonIndex < section.lessons.length;
      lessonIndex += 1
    ) {
      const lesson = section.lessons[lessonIndex];
      const lessonKey = `lesson:${lesson.id}`;
      onTaskStatus({ key: lessonKey, label: lesson.title, status: 'running' });
      if (lesson.type === "اختبار") {
        let savedQuiz = storedQuizzes.find(
          (quiz) =>
            String(quiz._id || quiz.id) ===
            String(lesson.quizId || lesson._id || lesson.id),
        );
        if (!savedQuiz && lesson.quizId) {
          const error = reconciliationError('الاختبار');
          onTaskStatus({ key: lessonKey, label: lesson.title, status: 'failed', error });
          throw error;
        }
        const quizPayload = {
          title: lesson.title || "اختبار الدورة",
          description: lesson.description || "",
          passingPercentage: Number(lesson.passingPercentage || 60),
          maxAttempts: lesson.maxAttempts ? Number(lesson.maxAttempts) : null,
          isRequired: lesson.isRequired !== false,
          lesson: lesson.lessonId || null,
        };
        if (savedQuiz) {
          await runStep(lessonKey, 'حفظ الاختبار', () => updateCourseQuiz(
            id,
            savedQuiz._id || savedQuiz.id,
            quizPayload,
          ));
        } else {
          const quizResponse = await runStep(lessonKey, 'إنشاء الاختبار', async () => {
            try { return await createCourseQuiz(id, quizPayload); }
            catch (error) {
              try {
                const detail = responseCourse(await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)));
                const candidate = (detail?.quizzes || []).find((item) => {
                  const candidateId = String(item._id || item.id);
                  return item.title === quizPayload.title && !storedQuizzes.some((stored) => String(stored._id || stored.id) === candidateId) && !retainedQuizIds.has(candidateId);
                });
                if (candidate) return candidate;
              } catch { /* Keep the original create error for retry. */ }
              throw error;
            }
          });
          const quizData = responseData(quizResponse);
          savedQuiz = quizData?.quiz || quizData;
        }
        const quizId = savedQuiz?._id || savedQuiz?.id;
        if (!quizId) {
          const error = new Error('لم يُرجع الخادم معرّف الاختبار');
          onTaskStatus({ key: lessonKey, label: lesson.title, status: 'failed', error });
          throw error;
        }
        onEntityCreated({ type: 'quiz', sectionId: section.id, localId: lesson.id, serverId: quizId });
        retainedQuizIds.add(String(quizId));
        orderedQuizIds.push(String(quizId));
        const storedQuestions = savedQuiz.questions || [];
        const orderedQuestionIds = [];
        for (const question of lesson.quiz || []) {
          const questionText = String(question.text || "").trim();
          const options = (question.options || [])
            .map((option, optionIndex) => ({
              text: String(
                typeof option === "string" ? option : option.text || "",
              ).trim(),
              isCorrect:
                Number(question.correctIndex) === optionIndex ||
                option.isCorrect === true,
            }))
            .filter((option) => option.text);
          const correctOptions = options.filter((option) => option.isCorrect);
          if (
            !questionText ||
            options.length < 2 ||
            correctOptions.length !== 1
          ) {
            const quizValidationError = new Error(
              !questionText
                ? "اكتب نص السؤال داخل اختبار «" + lesson.title + "»"
                : options.length < 2
                  ? "أضف اختيارين مكتوبين على الأقل للسؤال «" +
                    questionText +
                    "»"
                  : "حدد إجابة صحيحة واحدة للسؤال «" + questionText + "»",
            );
            quizValidationError.savedCourseId = id;
            onTaskStatus({ key: lessonKey, label: lesson.title, status: 'failed', error: quizValidationError });
            throw quizValidationError;
          }
          const questionPayload = {
            text: questionText,
            options,
            explanation: question.explanation || "",
          };
          let savedQuestion = storedQuestions.find(
            (item) =>
              String(item._id || item.id) ===
              String(question._id || question.id),
          );
          if (!savedQuestion && !question._isNew) {
            const error = reconciliationError('سؤال الاختبار');
            onTaskStatus({ key: lessonKey, label: lesson.title, status: 'failed', error });
            throw error;
          }
          if (savedQuestion) {
            await runStep(lessonKey, 'حفظ سؤال الاختبار', () => updateCourseQuizQuestion(
              id,
              quizId,
              savedQuestion._id || savedQuestion.id,
              questionPayload,
            ));
          } else {
            const questionResponse = await runStep(lessonKey, 'إضافة سؤال الاختبار', async () => {
              try { return await addCourseQuizQuestion(id, quizId, questionPayload); }
              catch (error) {
                try {
                  const detail = responseCourse(await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)));
                  const currentQuiz = (detail?.quizzes || []).find((item) => String(item._id || item.id) === String(quizId));
                  const candidate = (currentQuiz?.questions || []).find((item) => {
                    const candidateId = String(item._id || item.id);
                    return item.text === questionPayload.text && !storedQuestions.some((stored) => String(stored._id || stored.id) === candidateId) && !orderedQuestionIds.includes(candidateId);
                  });
                  if (candidate) return candidate;
                } catch { /* Keep the original create error for retry. */ }
                throw error;
              }
            });
            const questionData = responseData(questionResponse);
            savedQuestion = questionData?.question || questionData;
          }
          const questionId = savedQuestion?._id || savedQuestion?.id;
          if (questionId) {
            orderedQuestionIds.push(String(questionId));
            onEntityCreated({ type: 'question', sectionId: section.id, lessonId: lesson.id, localId: question.id, serverId: questionId });
          }
        }
        const retainedQuestionIds = new Set(orderedQuestionIds);
        for (const storedQuestion of storedQuestions) {
          const storedQuestionId = storedQuestion._id || storedQuestion.id;
          if (
            storedQuestionId &&
            !retainedQuestionIds.has(String(storedQuestionId))
          ) {
            await runStep(lessonKey, 'حذف سؤال قديم', () => deleteCourseQuizQuestion(id, quizId, storedQuestionId));
          }
        }
        if (orderedQuestionIds.length > 1)
          await runStep(lessonKey, 'ترتيب أسئلة الاختبار', () => reorderCourseQuizQuestions(id, quizId, orderedQuestionIds));
        onTaskStatus({ key: lessonKey, label: lesson.title, status: 'done' });
        continue;
      }
      let savedLesson = storedLessons.find(
        (item) =>
          String(item._id || item.id) === String(lesson._id || lesson.id),
      );
      const requestedLessonId = lesson._id || lesson.id;
      const previousLocation = storedLessonLocations.get(
        String(requestedLessonId),
      );
      if (!savedLesson && previousLocation) {
        savedLesson = previousLocation.lesson;
        if (String(previousLocation.sectionId) !== String(sectionId)) {
          await runStep(lessonKey, 'نقل الدرس', () => moveCourseLesson(id, requestedLessonId, sectionId, lessonIndex));
        }
      }
      if (!savedLesson && courseId && !lesson._isNew) {
        const error = reconciliationError('الدرس');
        onTaskStatus({ key: lessonKey, label: lesson.title, status: 'failed', error });
        throw error;
      }
      const lessonContentType =
        { فيديو: "video", ملف: "document", صوت: "audio", مستند: "document" }[
          lesson.type
        ] || String(lesson.type || "video").toLowerCase();
      const existingLessonId = savedLesson?._id || savedLesson?.id;
      if (existingLessonId) {
        await runStep(lessonKey, 'حفظ الدرس', () => updateCourseLesson(id, existingLessonId, {
          title: lesson.title,
          description: lesson.description || "",
          durationSeconds: Math.max(
            0,
            Number(lesson.durationSeconds ?? Number(lesson.duration || 0) * 60),
          ),
          ...(!lesson.media?.file ? { contentType: lessonContentType } : {}),
          isPreview: Boolean(lesson.preview),
        }));
      }
      if (!savedLesson) {
        const lessonResponse = await runStep(lessonKey, 'إنشاء الدرس', async () => {
          try {
            return await createCourseLesson(id, sectionId, {
              title: lesson.title,
              description: lesson.description || '',
              durationSeconds: Math.max(0, Number(lesson.durationSeconds ?? Number(lesson.duration || 0) * 60)),
              contentType: lessonContentType,
              isPreview: Boolean(lesson.preview),
            });
          } catch (error) {
            try {
              const detail = responseCourse(await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)));
              const sections = detail?.sections || detail?.curriculum_sections || detail?.curriculum || [];
              const currentSection = sections.find((item) => String(item._id || item.id) === String(sectionId));
              const candidate = currentSection?.lessons?.[lessonIndex];
              const candidateId = candidate?._id || candidate?.id;
              if (candidateId && candidate.title === lesson.title && !storedLessons.some((item) => String(item._id || item.id) === String(candidateId)) && !retainedLessonIds.has(String(candidateId))) return candidate;
            } catch { /* Keep the original create error for retry. */ }
            throw error;
          }
        });
        const lessonData = responseData(lessonResponse);
        savedLesson = lessonData?.lesson || lessonData;
      }
      const lessonId = savedLesson?._id || savedLesson?.id;
      if (!lessonId) {
        const error = new Error('لم يُرجع الخادم معرّف الدرس');
        onTaskStatus({ key: lessonKey, label: lesson.title, status: 'failed', error });
        throw error;
      }
      onEntityCreated({ type: 'lesson', sectionId: section.id, localId: lesson.id, serverId: lessonId });
      retainedLessonIds.add(String(lessonId));
      orderedLessonIds.push(String(lessonId));
      if (lessonId && lesson.media?.file) {
        const contentType = lesson.media.file.type?.startsWith("video/")
          ? "video"
          : lesson.media.file.type?.startsWith("audio/")
            ? "audio"
            : "document";
        await runStep(lessonKey, 'رفع ملف الدرس', () => uploadCourseLessonMedia(
          id,
          lessonId,
          lesson.media.file,
          contentType,
          progressHandler(`جاري رفع محتوى الدرس: ${lesson.title}`),
        ));
        await runStep(lessonKey, 'حفظ مدة الدرس', () => updateCourseLesson(id, lessonId, {
          durationSeconds: Math.max(
            0,
            Number(lesson.durationSeconds ?? Number(lesson.duration || 0) * 60),
          ),
        }));
        onFileSaved({ type: 'media', sectionId: section.id, lessonId: lesson.id, file: lesson.media.file });
      }
      if (lessonId) {
        const storedAttachments = savedLesson.attachments || [];
        const retainedAttachmentIds = new Set(
          (lesson.attachments || [])
            .map((item) => String(item._id || item.id || ""))
            .filter(Boolean),
        );
        for (const attachment of storedAttachments) {
          const attachmentId = attachment._id || attachment.id;
          if (
            attachmentId &&
            !retainedAttachmentIds.has(String(attachmentId))
          ) {
            await runStep(lessonKey, 'حذف مرفق قديم', () => deleteCourseLessonAttachment(id, lessonId, attachmentId));
          } else if (attachmentId) {
            const desired = (lesson.attachments || []).find(
              (item) => String(item._id || item.id || "") === String(attachmentId),
            );
            const desiredMode = desired?.accessMode || "downloadable";
            const storedMode = attachment.accessMode || "downloadable";
            if (desiredMode !== storedMode) {
              await runStep(lessonKey, 'حفظ صلاحية المرفق', () => updateCourseLessonAttachmentAccessMode(
                id,
                lessonId,
                attachmentId,
                desiredMode,
              ));
            }
          }
        }
        const newAttachments = (lesson.attachments || []).filter((item) => item.file);
        for (const accessMode of ["view_only", "downloadable"]) {
          const attachmentFiles = newAttachments
            .filter((item) => (item.accessMode || "downloadable") === accessMode)
            .map((item) => item.file);
          if (!attachmentFiles.length) continue;
          const uploadResponse = await runStep(lessonKey, 'رفع مرفقات الدرس', async () => {
            try {
              return await uploadCourseLessonAttachments(
                id, lessonId, attachmentFiles, accessMode,
                progressHandler(`جاري رفع مرفقات الدرس: ${lesson.title}`),
              );
            } catch (error) {
              // A lost response can follow a successful upload. Reuse those
              // attachments before offering another upload of the same files.
              try {
                const detail = responseCourse(await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)));
                const sections = detail?.sections || detail?.curriculum_sections || detail?.curriculum || [];
                const currentSection = sections.find((item) => String(item._id || item.id) === String(sectionId));
                const currentLesson = currentSection?.lessons?.find((item) => String(item._id || item.id) === String(lessonId));
                const oldIds = new Set(storedAttachments.map((item) => String(item._id || item.id)));
                const available = (currentLesson?.attachments || []).filter((item) => !oldIds.has(String(item._id || item.id)) && (item.accessMode || 'downloadable') === accessMode);
                const recovered = attachmentFiles.map((file) => {
                  const index = available.findIndex((item) => item.originalName === file.name && item.size === file.size);
                  return index < 0 ? null : available.splice(index, 1)[0];
                });
                if (recovered.every(Boolean)) return { data: recovered };
              } catch { /* Keep the original upload error for retry. */ }
              throw error;
            }
          });
          const savedAttachments = responseData(uploadResponse);
          attachmentFiles.forEach((file, index) => onFileSaved({ type: 'attachment', sectionId: section.id, lessonId: lesson.id, file, saved: Array.isArray(savedAttachments) ? savedAttachments[index] : null }));
        }
      }
      onTaskStatus({ key: lessonKey, label: lesson.title, status: 'done' });
    }
    for (const storedLesson of storedLessons) {
      const storedLessonId = storedLesson._id || storedLesson.id;
      if (
        storedLessonId &&
        !retainedLessonIds.has(String(storedLessonId)) &&
        !course.curriculum.some((candidateSection) =>
          candidateSection.lessons?.some(
            (candidateLesson) =>
              String(candidateLesson._id || candidateLesson.id) ===
              String(storedLessonId),
          ),
        )
      ) {
        await runStep(sectionKey, 'حذف درس قديم', () => deleteCourseLesson(id, storedLessonId));
      }
    }
    if (orderedLessonIds.length > 1)
      await runStep(sectionKey, 'ترتيب دروس القسم', () => reorderCourseLessons(id, sectionId, orderedLessonIds));
    onTaskStatus({ key: sectionKey, label: section.title, status: 'done' });
  }
  if (orderedSectionIds.length > 1)
    await runStep('course', 'ترتيب أقسام الدورة', () => reorderCourseSections(id, orderedSectionIds));
  for (const storedQuiz of storedQuizzes) {
    const storedQuizId = storedQuiz._id || storedQuiz.id;
    const wasLoadedIntoEditor = (course.editableQuizIds || []).includes(
      String(storedQuizId),
    );
    if (
      storedQuizId &&
      wasLoadedIntoEditor &&
      !retainedQuizIds.has(String(storedQuizId))
    ) {
      await runStep('course', 'حذف اختبار قديم', () => deleteCourseQuiz(id, storedQuizId));
    }
  }
  if (orderedQuizIds.length > 1) await runStep('course', 'ترتيب الاختبارات', () => reorderCourseQuizzes(id, orderedQuizIds));
  for (const storedSection of storedSections) {
    const storedSectionId = storedSection?._id || storedSection?.id;
    if (storedSectionId && !retainedSectionIds.has(String(storedSectionId))) {
      await runStep('course', 'حذف قسم قديم', () => deleteCourseSection(id, storedSectionId));
    }
  }
  onTaskStatus({ key: 'course', label: 'حفظ بيانات الدورة', status: 'done' });
  if (submit) {
    const verificationDetail = responseCourse(
      await (admin ? getAdminCourse(id) : getMyTeacherCourse(id)),
    );
    const verificationSections =
      verificationDetail?.sections ||
      verificationDetail?.curriculum_sections ||
      (Array.isArray(verificationDetail?.curriculum)
        ? verificationDetail.curriculum
        : []);
    const lessonsWithoutMedia = verificationSections.flatMap((section) =>
      (section.lessons || [])
        .filter((lesson) => !lesson.primaryContent)
        .map((lesson) => valueOf(lesson.title, "درس بدون عنوان")),
    );
    if (lessonsWithoutMedia.length) {
      const mediaError = new Error(
        "ارفع أو أعد اختيار المحتوى الأساسي للدروس: " +
          [...new Set(lessonsWithoutMedia)].join("، "),
      );
      mediaError.savedCourseId = id;
      throw mediaError;
    }
    onProgress({ label: "جاري إرسال الدورة للمراجعة", percent: 100 });
    onTaskStatus({ key: 'submit', label: 'إرسال الدورة للمراجعة', status: 'running' });
    try {
      const submitResponse = await submitMarketplaceCourse(id);
      saved = responseCourse(submitResponse) || saved;
      onTaskStatus({ key: 'submit', label: 'إرسال الدورة للمراجعة', status: 'done' });
    } catch (error) {
      onTaskStatus({ key: 'submit', label: 'إرسال الدورة للمراجعة', status: 'failed', error });
      error.savedCourseId = id;
      throw error;
    }
  }
  return normalizeCourse(saved || { ...course, _id: id });
};
