import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock3,
  Copy,
  CircleHelp,
  Download,
  FileText,
  Headphones,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Layers3,
  LoaderCircle,
  MessageSquare,
  Play,
  Search,
  Star,
  Users,
  Video,
  WalletCards,
  X,
} from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import CourseCard from "../../../components/courses/CourseCard";
import {
  approveCourse,
  fetchAdminCourse,
  fetchPublicCourses,
  fetchPublicInstructor,
  rejectCourse,
} from "../api/coursesApi";
import toast from "react-hot-toast";
import {
  getApiErrorMessage,
  normalizeApiError,
} from "../../../services/apiError";
import { resolveMediaUrl } from "../../../services/apiUrl";
import mathCover from "../../../assets/courses/math-course.png";
import pythonCover from "../../../assets/courses/python-course.png";
import skillsCover from "../../../assets/courses/skills-course.png";
import ReviewsPanel from "../components/reviews/ReviewsPanel";
import ModerationHistoryPanel from "../components/ModerationHistoryPanel";
import { getCourseEarningsByCourse } from "../../admin-finances/api/courseEarningsApi";
import BrandMediaPlayer from "../../../components/media/BrandMediaPlayer";
import { formatCourseDuration } from "../../../utils/courseDuration";
import { placeCourseQuizzes } from "../utils/placeCourseQuizzes";
import { downloadProtectedFile } from "../utils/downloadProtectedFile";
import {
  getAdminCourseEnrollments,
  getAdminCoursePurchases,
} from "../../../services/APIService";

const coverMap = {
  technology: pythonCover,
  algebra: mathCover,
  math: mathCover,
  skills: skillsCover,
  science: skillsCover,
  language: skillsCover,
};

const money = (value) => `${Number(value || 0).toLocaleString("ar-EG")} جنيه`;

const responseList = (response, keys = []) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return payload?.items || payload?.docs || [];
};

const formatCurrency = (value, currency = "EGP") => {
  const code = String(currency || "EGP").toUpperCase();
  try {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `${Number(value || 0).toLocaleString("ar-EG")} ${code}`;
  }
};

const enrollmentProgress = (item = {}) => {
  const enrollment = item.enrollment || item;
  const progress =
    item.progressData ||
    item.progressSummary ||
    item.courseProgress ||
    item.learningProgress ||
    enrollment.progressData ||
    enrollment.progressSummary ||
    enrollment.courseProgress ||
    enrollment.progress ||
    item.progress ||
    {};
  const percentage = Number(
    item.progressPercentage ??
      item.completionPercentage ??
      item.percentComplete ??
      enrollment.progressPercentage ??
      enrollment.completionPercentage ??
      progress.progressPercentage ??
      progress.completionPercentage ??
      progress.percentage ??
      progress.percentComplete ??
      (typeof progress === "number" ? progress : 0),
  );
  const lastActivityAt =
    item.lastActivityAt ||
    item.lastActivity ||
    item.lastAccessedAt ||
    item.lastLearnedAt ||
    enrollment.lastActivityAt ||
    enrollment.lastActivity ||
    enrollment.lastAccessedAt ||
    progress.lastActivityAt ||
    progress.lastActivity ||
    progress.lastAccessedAt ||
    progress.updatedAt ||
    null;
  return {
    percentage: Number.isFinite(percentage) ? Math.min(100, Math.max(0, percentage)) : 0,
    lastActivityAt,
  };
};

const paymentMethodOf = (item = {}) => {
  const value =
    item.paymentMethod ||
    item.method ||
    item.paymentProvider ||
    item.provider ||
    item.gateway ||
    item.payment?.method ||
    item.payment?.provider ||
    item.checkout?.provider;
  if (!value) return "غير محدد";
  const label = typeof value === "object"
    ? value.name || value.displayName || value.type || value.id
    : value;
  if (!label) return "غير محدد";
  return String(label).toLowerCase() === "whop" ? "Whop" : String(label);
};

const reviewErrorMessage = (error, fallback) => {
  const normalized = normalizeApiError(error);
  if (normalized.code === "COURSE_NOT_FOUND")
    return "لم تعد الدورة موجودة أو لا يمكنك الوصول إليها.";
  if (normalized.code === "COURSE_NOT_PENDING_REVIEW")
    return "تغيّرت حالة الدورة ولم تعد بانتظار المراجعة.";
  if (normalized.code === "VALIDATION_ERROR") {
    const details = normalized.errors
      ? Object.values(normalized.errors).flat().filter(Boolean).join("، ")
      : "";
    return (
      details ||
      (normalized.field
        ? `راجع الحقل: ${normalized.field}`
        : "راجع بيانات المراجعة وحاول مرة أخرى.")
    );
  }
  return getApiErrorMessage(error, fallback);
};

const StatCard = ({ icon: Icon, value, label, accent }) => (
  <div className="flex min-h-24 items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-5 py-4">
    <div>
      <strong dir="ltr" className="block whitespace-nowrap text-right text-xl text-[#1F2937]">{value}</strong>
      <span className="mt-1 block text-xs text-[#667085]">{label}</span>
    </div>
    <span className={`grid h-10 w-10 place-items-center rounded-lg ${accent}`}>
      <Icon size={19} />
    </span>
  </div>
);

const OverviewTab = ({ course, coverSrc, totalLessons, totalQuizzes }) => {
  const [showCover, setShowCover] = useState(false);
  const [showPromoVideo, setShowPromoVideo] = useState(false);
  const [contentTab, setContentTab] = useState("description");
  const courseUrl = `${window.location.origin}/courses/${course.slug || course.id}`;
  const pricePerStudent = Number(course.effectivePrice ?? course.price ?? 0);
  const commissionRateValue = course.commissionRateBps != null
    ? Number(course.commissionRateBps) / 100
    : course.commissionRate ?? course.platformCommissionRate ?? course.platformCommissionPercentage ?? (course.platformCommissionBps != null ? Number(course.platformCommissionBps) / 100 : null);
  const commissionRate = commissionRateValue == null ? null : Number(commissionRateValue);
  const platformProfitPerStudent = commissionRate == null ? null : pricePerStudent * (commissionRate / 100);
  const instructorProfitPerStudent = commissionRate == null ? null : pricePerStudent - platformProfitPerStudent;
  const isAcademicCourse =
    course.courseType === "academic" || Boolean(course.academicCurriculumId);
  const overviewDetails = [
    ["الحالة", course.status],
    [
      "تاريخ الإنشاء",
      course.createdAt
        ? new Date(course.createdAt).toLocaleDateString("ar-EG")
        : "غير محدد",
    ],
    [
      "آخر تحديث",
      course.updatedAt
        ? new Date(course.updatedAt).toLocaleDateString("ar-EG")
        : "غير محدد",
    ],
    ["التصنيف", course.category || "غير محدد"],
    ["المستوى", course.level || "غير محدد"],
    ["لغة الشرح", course.language || "العربية"],
    ...(isAcademicCourse
      ? [
          ["المرحلة", course.academicStage || course.stage || "غير محددة"],
          ["الصف الدراسي", course.academicGrade || course.grade || "غير محدد"],
          ["المنهج", course.academicCurriculumName || "غير محدد"],
          ["المادة", course.subject || "غير محددة"],
        ]
      : []),
  ];
  const audience = Array.isArray(course.targetAudience)
    ? course.targetAudience
    : course.targetAudience
      ? [course.targetAudience]
      : [];
  const requirements = Array.isArray(course.requirements)
    ? course.requirements
    : course.requirements
      ? [course.requirements]
      : [];
  const contentTabs = [
    { id: "description", label: "وصف الدورة", icon: FileText },
    { id: "audience", label: "لمن هذه الدورة", icon: Users },
    { id: "requirements", label: "المتطلبات", icon: CircleHelp },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
        <div className="overflow-x-auto rounded-xl bg-[#F6F8FB] p-1.5">
          <nav className="flex min-w-max gap-1" aria-label="معلومات الدورة">
            {contentTabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setContentTab(id)} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-bold transition sm:text-sm ${contentTab === id ? "bg-white text-[#123C91] shadow-sm ring-1 ring-[#DCE5F2]" : "text-[#667085] hover:bg-white/70 hover:text-[#344054]"}`} aria-selected={contentTab === id} role="tab"><Icon size={15} />{label}</button>)}
          </nav>
        </div>
        <div className="min-h-32 px-1 py-5" role="tabpanel">
          {contentTab === "description" && <p className="whitespace-pre-line text-[15px] leading-7 text-[#667085] sm:text-base">{course.description || course.shortDescription || "لا يوجد وصف مضاف لهذه الدورة بعد."}</p>}
          {contentTab === "audience" && (audience.length ? <div className="flex flex-wrap gap-2">{audience.map((item) => <span key={item} className="rounded-full bg-[#EAF2FF] px-3 py-1.5 text-xs font-medium text-[#3567C8] sm:text-sm">{item}</span>)}</div> : <p className="text-sm text-[#98A2B3]">لم تتم إضافة الفئة المستهدفة لهذه الدورة.</p>)}
          {contentTab === "requirements" && (requirements.length ? <div className="flex flex-wrap gap-2">{requirements.map((item) => <span key={item} className="rounded-full border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs text-[#667085] sm:text-sm">{item}</span>)}</div> : <p className="text-sm text-[#98A2B3]">لا توجد متطلبات مضافة لهذه الدورة.</p>)}
        </div>
        <div className="my-5 border-t border-[#EAECF0]" />
        <dl className="grid gap-x-8 gap-y-4 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
          {overviewDetails.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[#98A2B3]">{label}</dt>
              <dd className="mt-1 font-medium text-[#344054]">
                {label === "التصنيف" && course.categoryId ? (
                  <Link
                    to={`/admin/courses?category=${encodeURIComponent(course.categoryId)}&status=${course.rawStatus || "published"}`}
                    className="inline-flex rounded-lg bg-[#EAF2FF] px-2.5 py-1 text-[#123C91] underline decoration-[#123C91]/30 underline-offset-4 transition hover:bg-[#DCE9FF]"
                  >
                    {value}
                  </Link>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#EAECF0] pt-4 text-[13px] text-[#667085] sm:text-[14px]">
          <span className="inline-flex items-center gap-1.5">
            <Layers3 size={14} className="text-[#123C91]" />
            {course.curriculum?.length || 0} أقسام
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video size={14} className="text-[#123C91]" />
            {totalLessons} دروس
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleHelp size={14} className="text-[#123C91]" />
            {totalQuizzes} اختبارات
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} className="text-[#123C91]" />
            {formatCourseDuration(course)}
          </span>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-[14px] font-semibold text-[#344054]">
            رابط مشاركة الدورة
          </label>
          <div className="flex overflow-hidden rounded-md border border-[#D0D5DD]">
            <input
              readOnly
              dir="ltr"
              value={courseUrl}
              className="h-10 min-w-0 flex-1 bg-[#F9FAFB] px-3 text-left text-xs text-[#667085] outline-none"
            />
            <button
              type="button"
              onClick={async () => { try { await navigator.clipboard.writeText(courseUrl); toast.success("تم النسخ بنجاح"); } catch { toast.error("تعذر نسخ الرابط"); } }}
              className="inline-flex shrink-0 items-center gap-1.5 bg-[#123C91] px-4 text-xs font-semibold text-white"
            >
              <Copy size={14} /> نسخ
            </button>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="group overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <div className="relative aspect-video overflow-hidden bg-[#EEF2F6]">
            <button type="button" onClick={() => setShowCover(true)} className="block h-full w-full" aria-label="عرض صورة الدورة بالحجم الكامل">
              <img src={coverSrc} alt={course.title} width="1672" height="941" loading="eager" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02] [image-rendering:auto]" />
            </button>
            {course.promoVideoUrl && <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/20 opacity-100 transition sm:bg-black/35 sm:opacity-0 sm:group-hover:opacity-100">
              <button type="button" onClick={() => setShowPromoVideo(true)} className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-bold text-[#123C91] shadow-xl transition hover:scale-105 hover:bg-white" aria-label="تشغيل الفيديو الترويجي"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#123C91] text-white shadow-sm"><Play size={16} className="translate-x-[-1px] fill-current" /></span>تشغيل الفيديو</button>
            </div>}
          </div>
          <div className="flex items-center justify-between px-4 py-3 text-xs text-[#667085]">
            {course.promoVideoUrl ? <span className="inline-flex items-center gap-1.5"><Video size={14} className="text-[#123C91]" />يتوفر فيديو ترويجي</span> : <span>صورة غلاف الدورة</span>}
            <button
              type="button"
              onClick={() => setShowCover(true)}
              className="font-semibold text-[#123C91]"
            >
              عرض بالحجم الكامل
            </button>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#1F2937] to-[#111827] p-5 text-white shadow-[0_12px_30px_rgba(15,23,42,.18)]">
          <span className="absolute -left-8 -top-10 size-32 rounded-full bg-[#12C6B0]/10" />
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#8DE9DE]"><WalletCards size={19} /></span>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${course.pricingType === "free" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/80"}`}>{course.pricingType === "free" ? "دورة مجانية" : "دورة مدفوعة"}</span>
            </div>
            <div className="mt-5 rounded-xl border border-white/8 bg-white/5 p-4">
              <span className="block text-xs text-white/55">سعر بيع الدورة للطالب</span>
              <strong dir="ltr" className="mt-1.5 block text-right text-2xl font-extrabold tracking-tight">{course.pricingType === "free" ? "مجاني" : money(pricePerStudent)}</strong>
            </div>
            <dl className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3 text-xs"><dt className="text-white/60">عمولة المنصة</dt><dd className="rounded-md bg-white/10 px-2 py-1 font-bold text-white">{commissionRate == null ? "غير محددة" : `${commissionRate}%`}</dd></div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-3 text-xs"><dt className="text-white/60">ربح المنصة لكل طالب</dt><dd dir="ltr" className="text-right font-bold text-white">{platformProfitPerStudent == null ? "غير محسوب" : money(platformProfitPerStudent)}</dd></div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-[#12C6B0]/20 bg-[#12C6B0]/10 px-3 py-3 text-xs"><dt className="font-bold text-[#B7FFF6]">ربح المحاضر لكل طالب</dt><dd dir="ltr" className="text-right font-extrabold text-white">{instructorProfitPerStudent == null ? "غير محسوب" : money(instructorProfitPerStudent)}</dd></div>
            </dl>
            {commissionRate == null && course.pricingType !== "free" && <p className="mt-3 text-[10px] leading-5 text-white/45">تظهر قيم الأرباح بعد تحديد نسبة عمولة المنصة.</p>}
          </div>
        </div>
      </aside>

      {showCover && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="صورة الدورة"
          onClick={() => setShowCover(false)}
        >
          <button
            type="button"
            onClick={() => setShowCover(false)}
            className="absolute top-5 left-5 grid h-10 w-10 place-items-center rounded-full bg-white text-[#1F2937]"
            aria-label="إغلاق الصورة"
          >
            ×
          </button>
          <img
            src={coverSrc}
            alt={course.title}
            width="1672"
            height="941"
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl [image-rendering:auto]"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
      {showPromoVideo && <PromoVideoViewer title={course.title} url={resolveMediaUrl(course.promoVideoUrl)} onClose={() => setShowPromoVideo(false)} />}
    </div>
  );
};

const PromoVideoViewer = ({ title, url, onClose }) => {
  const viewerRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === viewerRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const close = async () => {
    if (document.fullscreenElement === viewerRef.current) await document.exitFullscreen();
    onClose();
  };
  const toggleFullscreen = async () => {
    if (document.fullscreenElement === viewerRef.current) await document.exitFullscreen();
    else await viewerRef.current?.requestFullscreen();
  };

  return <div className="fixed inset-0 z-[110] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="الفيديو الترويجي" onMouseDown={(event) => event.target === event.currentTarget && close()} onContextMenu={(event) => event.preventDefault()}>
    <div ref={viewerRef} className={`flex w-full flex-col overflow-hidden border border-white/15 bg-[#081A3A] shadow-2xl ${fullscreen ? "h-screen max-w-none rounded-none border-0" : "max-w-5xl rounded-2xl"}`}>
      <header className="flex items-center justify-between gap-3 bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white sm:px-5">
        <div className="min-w-0"><p className="text-[10px] text-[#8FE3D8]">الفيديو الترويجي</p><h2 className="truncate text-sm font-bold sm:text-base">{title}</h2></div>
        <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={toggleFullscreen} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20">{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}<span className="hidden sm:inline">{fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}</span></button><button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="إغلاق"><X size={18} /></button></div>
      </header>
      <div className={`min-h-0 bg-black ${fullscreen ? "flex flex-1 items-center" : ""}`}><BrandMediaPlayer src={url} autoPlay className={`${fullscreen ? "h-full max-h-screen" : "aspect-video"} w-full`} /></div>
    </div>
  </div>;
};

import { requestLessonAttachmentAccess, requestLessonMediaAccess } from "../../../services/APIService";

const CurriculumTab = ({ course }) => {
  const navigate = useNavigate();
  const [previewingLessonId, setPreviewingLessonId] = useState(null);
  const [openingAttachmentId, setOpeningAttachmentId] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFullscreen, setMediaFullscreen] = useState(false);
  const mediaPreviewRef = useRef(null);
  useEffect(
    () => () => {
      if (mediaPreview?.objectUrl) URL.revokeObjectURL(mediaPreview.objectUrl);
    },
    [mediaPreview],
  );
  useEffect(() => {
    const syncFullscreen = () =>
      setMediaFullscreen(
        document.fullscreenElement === mediaPreviewRef.current,
      );
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const closeMediaPreview = async () => {
    if (document.fullscreenElement === mediaPreviewRef.current)
      await document.exitFullscreen();
    setMediaPreview(null);
  };

  const toggleMediaFullscreen = async () => {
    if (!mediaPreviewRef.current) return;
    if (document.fullscreenElement === mediaPreviewRef.current)
      await document.exitFullscreen();
    else await mediaPreviewRef.current.requestFullscreen();
  };
  const sections = (course.curriculum || []).filter(
    (section) => Array.isArray(section.lessons) && section.lessons.length > 0,
  );
  const [openSections, setOpenSections] = useState(
    () => new Set(sections[0]?.id ? [sections[0].id] : []),
  );
  const totalLessons = sections.reduce(
    (sum, section) => sum + section.lessons.filter((lesson) => lesson.type !== "اختبار").length,
    0,
  );
  const totalQuizzes = sections.reduce(
    (sum, section) => sum + section.lessons.filter((lesson) => lesson.type === "اختبار").length,
    0,
  );
  const totalVideos = sections.reduce(
    (sum, section) =>
      sum + section.lessons.filter((lesson) => lesson.type === "فيديو").length,
    0,
  );

  const toggleSection = (sectionId) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const previewLesson = async (lesson) => {
    if (!lesson?.id || previewingLessonId) return;
    setPreviewingLessonId(lesson.id);
    try {
      const response = await requestLessonMediaAccess(course.id, lesson.id);
      const data = response?.data?.data ?? response?.data ?? response;
      if (!data?.playbackUrl) throw new Error("PREVIEW_URL_MISSING");
      const isFile =
        lesson.type === "ملف" ||
        lesson.type === "document" ||
        lesson.type === "file";
      const ticketUrl = resolveMediaUrl(data.playbackUrl);
      if (isFile) {
        const fileResponse = await fetch(ticketUrl, { credentials: "include" });
        if (!fileResponse.ok) throw new Error("تعذر فتح ملف الدرس");
        const blob = await fileResponse.blob();
        setMediaPreview({
          url: URL.createObjectURL(blob),
          objectUrl: true,
          mimeType:
            blob.type ||
            data.mimeType ||
            lesson.media?.mimeType ||
            "application/octet-stream",
          title: lesson.title || "محتوى الدرس",
          fileName:
            lesson.media?.originalName ||
            lesson.media?.name ||
            lesson.title ||
            "ملف الدرس",
          isFile: true,
        });
        return;
      }
      setMediaPreview({
        url: ticketUrl,
        title: lesson.title || "محتوى الدرس",
        isFile: false,
        type: ["صوت", "audio"].includes(
          String(lesson.type || lesson.contentType || "").toLowerCase(),
        ) ? "audio" : "video",
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر تشغيل معاينة الدرس"));
    } finally {
      setPreviewingLessonId(null);
    }
  };

  const openAttachment = async (lesson, attachment) => {
    const lessonId = lesson.id || lesson._id;
    const attachmentId = attachment.id || attachment._id;
    if (!course.id || !lessonId || !attachmentId || openingAttachmentId) {
      if (!attachmentId) toast.error("تعذر تحديد هذا المرفق. حدّث الصفحة وحاول مرة أخرى.");
      return;
    }
    setOpeningAttachmentId(attachmentId);
    try {
      const response = await requestLessonAttachmentAccess(course.id, lessonId, attachmentId);
      const data = response?.data?.data ?? response?.data ?? response;
      if (!data?.playbackUrl) throw new Error("PREVIEW_URL_MISSING");
      const fileResponse = await fetch(resolveMediaUrl(data.playbackUrl), { credentials: "include" });
      if (!fileResponse.ok) throw new Error("FILE_PREVIEW_FAILED");
      const blob = await fileResponse.blob();
      const name = attachment.name || attachment.originalName || "مرفق الدرس";
      if (data.inlineViewable === false) {
        downloadProtectedFile(blob, name);
        toast.success("هذه الصيغة لا تُعرض داخل المتصفح؛ بدأ تنزيل المرفق.");
        return;
      }
      setMediaPreview({
        url: URL.createObjectURL(blob),
        objectUrl: true,
        mimeType: blob.type || data.mimeType || "application/octet-stream",
        title: name,
        fileName: name,
        isFile: true,
        downloadable: (attachment.accessMode || "downloadable") !== "view_only",
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر فتح المرفق"));
    } finally {
      setOpeningAttachmentId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EAECF0] px-4 py-5 sm:px-6">
        <div>
          <h3 className="font-bold text-[#1F2937]">محتوى المنهج الدراسي</h3>
          <p className="mt-1 text-[13px] text-[#667085] sm:text-[14px]">
            عرض تسلسل الموضوعات والدروس داخل كل قسم.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-[#667085] sm:gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Layers3 size={14} className="text-[#123C91]" />
            {sections.length} أقسام
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={14} className="text-[#123C91]" />
            {totalLessons} دروس
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleHelp size={14} className="text-[#123C91]" />
            {totalQuizzes} اختبارات
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video size={14} className="text-[#123C91]" />
            {totalVideos} فيديو
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {sections.map((section, sectionIndex) => {
          const isOpen = openSections.has(section.id);
          return (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border border-[#DDE2E8]"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center gap-3 bg-[#EEF6FF] px-4 py-3 text-right"
                aria-expanded={isOpen}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#123C91] text-xs font-semibold text-white">
                  {sectionIndex + 1}
                </span>
                <strong className="min-w-0 flex-1 truncate text-[15px] text-[#344054] sm:text-[16px]">
                  {section.title}
                </strong>
                <span className="text-xs text-[#667085]">{section.lessons?.length || 0} دروس</span>
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-[#123C91] transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div>
                  {section.lessons.length ? section.lessons.map((lesson, lessonIndex) => {
                    const isQuiz = lesson.type === "اختبار";
                    const isAudio = ["صوت", "audio"].includes(
                      String(lesson.type || lesson.contentType || "").toLowerCase(),
                    );
                    return (
                      <div
                        key={lesson.id}
                        className="flex flex-wrap items-center gap-3 border-t border-[#EAECF0] px-4 py-3 text-[13px] sm:flex-nowrap sm:text-[14px]"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F2F4F7] text-[11px] text-[#667085]">
                          {lessonIndex + 1}
                        </span>
                        <div className="min-w-0 flex-1 text-[#344054]">
                          <span className="block truncate">{lesson.title || "درس بدون عنوان"}</span>
                          {!!lesson.attachments?.length && <div className="mt-1.5 flex flex-wrap gap-1">{lesson.attachments.map((attachment) => {
                            const attachmentId = attachment.id || attachment._id;
                            return <button key={attachmentId || attachment.name} type="button" onClick={() => openAttachment(lesson, attachment)} disabled={Boolean(openingAttachmentId)} title={`فتح ${attachment.name || attachment.originalName || "المرفق"}`} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1 text-[11px] text-[#344054] transition hover:border-[#123C91] hover:text-[#123C91] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123C91] disabled:cursor-wait disabled:opacity-60">{openingAttachmentId === attachmentId ? <LoaderCircle size={12} className="shrink-0 animate-spin" /> : <FileText size={12} className="shrink-0" />}<span className="max-w-48 truncate">{attachment.name || attachment.originalName || "مرفق"}</span><span className="shrink-0 text-[#667085]">· {(attachment.accessMode || "downloadable") === "view_only" ? "عرض فقط" : "قابل للتنزيل"}</span></button>;
                          })}</div>}
                        </div>
                        {lesson._sectionUnlinked && <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">اختبار غير مرتبط بقسم</span>}
                        {lesson.preview && (
                          <span className="shrink-0 rounded-full bg-[#DDF7E8] px-2.5 py-1 text-[10px] font-bold text-[#17864B]">
                            متاح للمعاينة
                          </span>
                        )}
                        {lesson.title &&
                          (isQuiz ? (
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/courses/${course.id}/quizzes/${lesson.id}`,
                                )
                              }
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#123C91] bg-[#F4F7FF] px-4 py-2 font-semibold text-[#123C91] sm:w-auto"
                            >
                              <CircleHelp size={14} /> اختبار
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={previewingLessonId === lesson.id}
                              onClick={() => previewLesson(lesson)}
                              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[#12C6B0] bg-[#E8FFFC] px-4 py-2 font-semibold text-[#087F72] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                            >
                              {lesson.type === "ملف" ? (
                                <FileText size={13} />
                              ) : isAudio ? (
                                <Headphones
                                  size={13}
                                  className={
                                    previewingLessonId === lesson.id
                                      ? "animate-pulse"
                                      : ""
                                  }
                                />
                              ) : (
                                <Video
                                  size={13}
                                  className={
                                    previewingLessonId === lesson.id
                                      ? "animate-pulse"
                                      : ""
                                  }
                                />
                              )}{" "}
                              {previewingLessonId === lesson.id
                                ? "جاري الفتح..."
                                : lesson.type === "ملف"
                                  ? "فتح الملف"
                                  : isAudio
                                    ? "استماع"
                                    : "عرض الفيديو"}
                            </button>
                          ))}
                      </div>
                    );
                  }) : (
                    <div className="border-t border-[#EAECF0] px-4 py-6 text-center text-sm text-[#98A2B3]">
                      لا توجد دروس مضافة بعد
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {mediaPreview && (
        <div
          className="fixed inset-0 z-[110] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={mediaPreview.title}
          onMouseDown={closeMediaPreview}
        >
          <div
            ref={mediaPreviewRef}
            className={`flex w-full flex-col overflow-hidden border border-white/15 bg-[#081A3A] shadow-2xl ${mediaFullscreen ? "h-screen max-w-none rounded-none border-0" : "max-w-5xl rounded-2xl"}`}
            onMouseDown={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
          >
            <header className="flex items-center justify-between bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white sm:px-5">
              <div className="min-w-0">
                <p className="text-[10px] text-[#8FE3D8]">محتوى الدرس</p>
                <h3 className="truncate text-sm font-bold sm:text-base">
                  {mediaPreview.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMediaFullscreen}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                  aria-label={
                    mediaFullscreen ? "إنهاء ملء الشاشة" : "عرض بملء الشاشة"
                  }
                >
                  {mediaFullscreen ? (
                    <Minimize2 size={15} />
                  ) : (
                    <Maximize2 size={15} />
                  )}
                  {mediaFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
                </button>
                {mediaPreview.isFile && mediaPreview.downloadable !== false && (
                  <a
                    href={mediaPreview.url}
                    download={mediaPreview.fileName}
                    className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    تنزيل الملف
                  </a>
                )}
                <button
                  type="button"
                  onClick={closeMediaPreview}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
                  aria-label="إغلاق"
                >
                  <X size={18} />
                </button>
              </div>
            </header>
            <div
              className={`min-h-0 bg-[#050B17] p-2 sm:p-4 ${mediaFullscreen ? "flex-1" : ""}`}
              onContextMenu={(event) => event.preventDefault()}
            >
              {mediaPreview.isFile ? (
                mediaPreview.mimeType.startsWith("image/") ? (
                  <img
                    src={mediaPreview.url}
                    alt={mediaPreview.title}
                    className={
                      mediaFullscreen
                        ? "h-full w-full bg-white object-contain"
                        : "mx-auto max-h-[75vh] max-w-full rounded-lg bg-white object-contain"
                    }
                  />
                ) : (
                  <iframe
                    src={mediaPreview.url}
                    title={mediaPreview.title}
                    className={`${mediaFullscreen ? "h-full" : "h-[75vh] rounded-lg"} w-full bg-white`}
                  />
                )
              ) : (
                <BrandMediaPlayer
                  src={mediaPreview.url}
                  type={mediaPreview.type}
                  autoPlay
                  className={
                    mediaFullscreen
                      ? "h-full w-full bg-black object-contain"
                      : "max-h-[75vh] w-full rounded-lg bg-black object-contain"
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentsTab = ({ course, setStudentCount }) => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminCourseEnrollments(course.id)
      .then((response) => {
        if (!active) return;
        const items = responseList(response, ["enrollments", "students"]);
        setEnrollments(items);
        setStudentCount(items.length);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, "تعذر تحميل طلاب الدورة."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [course.id, reloadKey, setStudentCount]);

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const students = enrollments.map((item) => {
    const enrollment = item.enrollment || item;
    const progress = enrollmentProgress(item);
    return {
    ...enrollment,
    id:
      enrollment.student?._id ||
      enrollment.student?.id ||
      enrollment.user?._id ||
      enrollment.user?.id ||
      enrollment._id ||
      enrollment.id,
    name:
      enrollment.student?.fullName ||
      enrollment.student?.name ||
      enrollment.user?.fullName ||
      enrollment.user?.name ||
      enrollment.fullName ||
      enrollment.name ||
      "طالب",
    progressPercentage: progress.percentage,
    lastActivityAt: progress.lastActivityAt,
  };
  }).filter((item) =>
    !search.trim() || item.name.toLocaleLowerCase("ar").includes(search.trim().toLocaleLowerCase("ar")),
  );

  if (loading) return <div className="rounded-xl border bg-white py-14 text-center text-sm text-[#667085]"><LoaderCircle className="mx-auto mb-2 animate-spin" size={22} />جاري تحميل طلاب الدورة...</div>;
  if (error) return <div className="rounded-xl border border-red-100 bg-white py-12 text-center text-sm text-red-700"><p>{error}</p><button type="button" onClick={retry} className="mt-3 rounded-md bg-[#123C91] px-4 py-2 font-semibold text-white">إعادة المحاولة</button></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <label className="relative min-w-0 flex-1 sm:min-w-60">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
          />
          <input
            placeholder="بحث..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-md border border-[#D0D5DD] pr-9 pl-3 text-xs outline-none focus:border-[#123C91]"
          />
        </label>
        <select className="h-10 rounded-md border border-[#D0D5DD] px-4 text-[14px] text-[#475467]">
          <option>ترتيب حسب</option>
          <option>الأحدث</option>
        </select>
      </div>

      {/* Desktop / Tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-right text-[14px]">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                {[
                  "الطالب",
                  "تاريخ التسجيل",
                  "نسبة التقدم",
                  "آخر نشاط",
                  "الإجراءات",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {students.map((item) => (
                <tr key={item.id || item.name}>
                  <td className="px-4 py-4 font-medium text-[#344054]">
                    {item.name}
                  </td>
                  <td className="px-4 py-4 text-[#667085]">
                    {item.enrolledAt || item.createdAt
                      ? new Date(
                          item.enrolledAt || item.createdAt,
                        ).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </td>
                  <td className="px-4 py-4 text-[#667085]">
                    {Number(
                      item.progressPercentage ??
                        item.progress?.percentage ??
                        item.progress ??
                        0,
                    )}
                    %
                  </td>
                  <td className="px-4 py-4 text-[#667085]">
                    {item.lastActivityAt
                      ? new Date(item.lastActivityAt).toLocaleDateString(
                          "ar-EG",
                        )
                      : "غير محدد"}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/admin/messages", {
                          state: {
                            openUserId: item.id,
                            openClassroomId: course.id,
                            openClassroomName: course.title,
                          },
                        })
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#EAF4FF] p-2 text-[#123C91] transition hover:bg-[#D8EEFF]"
                      aria-label={`فتح محادثة ${item.name}`}
                    >
                      <MessageSquare size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!students.length && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-10 text-center text-[#98A2B3]"
                  >
                    لا يوجد طلاب مسجلون في الدورة بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAECF0] px-4 py-3 text-xs text-[#667085]">
          <span>إجمالي {students.length} طالب</span>
          <div className="flex gap-1">
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronRight size={13} />
            </button>
            <button className="h-7 w-7 rounded bg-[#123C91] text-white">
              1
            </button>
            <button className="h-7 w-7 rounded border">2</button>
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {students.map((item) => (
          <div
            key={item.id || item.name}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[#344054] break-words">
                {item.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/messages", {
                    state: {
                      openUserId: item.id,
                      openClassroomId: course.id,
                      openClassroomName: course.title,
                    },
                  })
                }
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#EAF4FF] p-2 text-[#123C91] transition hover:bg-[#D8EEFF]"
                aria-label={`فتح محادثة ${item.name}`}
              >
                <MessageSquare size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[#F1F2F4] pt-3 text-center">
              <div>
                <p className="mb-0.5 text-[11px] text-[#98A2B3]">التسجيل</p>
                <p className="text-xs font-medium text-[#667085]">
                  {item.enrolledAt || item.createdAt
                    ? new Date(
                        item.enrolledAt || item.createdAt,
                      ).toLocaleDateString("ar-EG")
                    : "غير محدد"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] text-[#98A2B3]">التقدم</p>
                <p className="text-xs font-medium text-[#667085]">
                  {Number(
                    item.progressPercentage ??
                      item.progress?.percentage ??
                      item.progress ??
                      0,
                  )}
                  %
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] text-[#98A2B3]">آخر نشاط</p>
                <p className="text-xs font-medium text-[#667085]">
                  {item.lastActivityAt
                    ? new Date(item.lastActivityAt).toLocaleDateString("ar-EG")
                    : "غير محدد"}
                </p>
              </div>
            </div>
          </div>
        ))}
        {!students.length && (
          <p className="rounded-xl border bg-white py-8 text-center text-sm text-[#98A2B3]">
            لا يوجد طلاب مسجلون في الدورة بعد.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#667085]">
          <span>إجمالي {students.length} طالب</span>
          <div className="flex gap-1">
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronRight size={13} />
            </button>
            <button className="h-7 w-7 rounded bg-[#123C91] text-white">
              1
            </button>
            <button className="h-7 w-7 rounded border">2</button>
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstructorTab = ({ course }) => {
  const navigate = useNavigate();
  const rawInstructor =
    course.instructorDetails || course.instructor || course.teacher || {};
  const baseInstructor =
    typeof rawInstructor === "string" ? { name: rawInstructor } : rawInstructor;
  const baseProfileSlug =
    baseInstructor.profileSlug || baseInstructor.slug || course.instructorSlug;
  const [publicProfile, setPublicProfile] = useState(null);
  const [profileCourses, setProfileCourses] = useState([]);
  const [profileLoading, setProfileLoading] = useState(Boolean(baseProfileSlug));

  useEffect(() => {
    if (!baseProfileSlug) return;
    let active = true;
    Promise.all([fetchPublicInstructor(baseProfileSlug), fetchPublicCourses()])
      .then(([profile, courses]) => {
        if (!active) return;
        setPublicProfile(profile);
        const profileId = profile.id || profile._id;
        const userId = profile.user?.id || profile.user?._id;
        setProfileCourses(courses.filter((item) =>
          [item.instructorSlug, item.instructorId, item.instructorDetails?.profileSlug]
            .some((value) => value && [baseProfileSlug, profileId, userId].some((target) => target && String(value) === String(target))),
        ));
      })
      .catch(() => {})
      .finally(() => active && setProfileLoading(false));
    return () => { active = false; };
  }, [baseProfileSlug]);

  const instructor = publicProfile
    ? { ...baseInstructor, ...publicProfile, user: { ...(baseInstructor.user || {}), ...(publicProfile.user || {}) } }
    : baseInstructor;
  const name =
    instructor.name ||
    instructor.fullName ||
    instructor.user?.fullName ||
    course.teacherName ||
    "المحاضر";
  const instructorId =
    instructor.id ||
    instructor._id ||
    instructor.user?.id ||
    instructor.user?._id;
  const accountId = instructor.user?.id || instructor.user?._id || instructorId;
  const avatar =
    instructor.avatar || instructor.profileImage || instructor.user?.avatar;
  const email = instructor.email || instructor.user?.email;
  const phone =
    instructor.phone || instructor.phoneNumber || instructor.user?.phone;
  const subject = instructor.subject || instructor.specialization;
  const stage = instructor.stage || instructor.academicStage;
  const curriculum = instructor.curriculum || instructor.educationSystem;
  const experience = instructor.experience || instructor.yearsOfExperience;
  const joinedAt = instructor.joinedAt || instructor.createdAt;
  const joinedDate = joinedAt
    ? new Date(joinedAt).toLocaleDateString("ar-EG")
    : null;
  const bio =
    instructor.bio || instructor.headline || "لم يضف المحاضر نبذة عامة بعد.";

  const openMessages = () => {
    navigate("/admin/messages", {
      state: {
        openUserId: accountId,
        openClassroomId: course.id,
        openClassroomName: course.title,
      },
    });
  };

  const details = [
    ["البريد الإلكتروني", email],
    ["رقم الهاتف", phone],
    ["تاريخ الانضمام", joinedDate],
    ["المادة", subject],
    ["المرحلة", stage],
    ["المنهج", curriculum],
    ["سنوات الخبرة", typeof experience === "number" ? `${experience} سنوات` : experience],
  ].filter(([, value]) => value);

  return (
    <div className="overflow-hidden rounded-xl border border-[#DCE3EC] bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col items-start gap-3 border-b border-[#E8ECF2] pb-4 sm:flex-row sm:items-center">
          <div className="rounded-full border border-[#DCE3EC] bg-white p-1 shadow-sm">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-16 w-16 rounded-full object-cover sm:h-18 sm:w-18"
            />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-xl font-bold text-[#123C91] sm:h-18 sm:w-18">
              {name.trim().charAt(0)}
            </span>
          )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#1F2937] sm:text-xl">{name}</h2>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${instructor.status === "suspended" ? "bg-red-50 text-red-700" : "bg-[#DDF7E8] text-[#17864B]"}`}>{instructor.status === "suspended" ? "موقوف" : "نشط"}</span>
            </div>
            <p className="mt-1 text-sm text-[#667085]">{instructor.headline || subject || "محاضر بالأكاديمية"}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
                type="button"
                onClick={openMessages}
                disabled={!accountId}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#123C91] px-4 text-xs font-bold text-white transition hover:bg-[#0E3279] disabled:cursor-not-allowed disabled:bg-[#AAB4C3]"
              >
                <MessageSquare size={16} /> التواصل مع المحاضر
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
          <div className="rounded-xl border border-[#E8ECF2] p-4">
            <h3 className="text-sm font-bold text-[#344054]">نبذة عن المحاضر</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#667085]">{bio}</p>
          </div>
          <dl className="grid gap-2 sm:grid-cols-2">
            {details.length ? details.map(([label, value]) => <div key={label} className="rounded-lg bg-[#F7F9FC] px-3 py-2.5"><dt className="text-[10px] text-[#98A2B3]">{label}</dt><dd className="mt-0.5 break-words text-xs font-semibold text-[#344054]">{value}</dd></div>) : <div className="rounded-lg bg-[#F7F9FC] px-4 py-4 text-sm text-[#667085] sm:col-span-2">لا توجد بيانات إضافية للمحاضر.</div>}
          </dl>
        </div>

        {(instructor.cvName || instructor.cvUrl) && <a href={instructor.cvUrl || "#"} download className="mt-3 flex items-center gap-3 rounded-lg border border-[#E5E7EB] px-4 py-3 text-[#344054] transition hover:bg-[#F8FAFC]"><FileText size={18} className="text-[#123C91]" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{instructor.cvName || "السيرة الذاتية"}</strong><small className="text-[#98A2B3]">{instructor.cvSize || "ملف مرفق"}</small></span><Download size={16} /></a>}

        <div className="mt-4 border-t border-[#E8ECF2] pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="font-bold text-[#1F2937]">دورات المحاضر</h3><p className="mt-1 text-xs text-[#667085]">الدورات المنشورة على المنصة</p></div>
            {!profileLoading && <span className="rounded-full bg-[#EAF2FF] px-3 py-1.5 text-xs font-bold text-[#123C91]">{profileCourses.length} دورة</span>}
          </div>
          {profileLoading ? <div className="flex min-h-28 items-center justify-center gap-2 rounded-xl bg-[#F7F9FC] text-sm text-[#667085]"><LoaderCircle className="animate-spin" size={20} />جاري تحميل بروفايل المحاضر...</div> : profileCourses.length ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(240px,290px))]">{profileCourses.map((item) => <CourseCard key={item.id} course={item} compact />)}</div> : <div className="rounded-xl bg-[#F7F9FC] px-5 py-5 text-center text-sm text-[#667085]"><BookOpen className="mx-auto mb-1.5 text-[#98A2B3]" size={22} />لا توجد دورات منشورة أخرى لهذا المحاضر.</div>}
        </div>
      </div>
    </div>
  );
};


const EarningsTab = ({ course, setRevenueSummary }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminCoursePurchases({
        courseId: course.id,
        status: "paid",
        limit: 100,
      })
      .then((response) => {
        if (!active) return;
        const purchases = responseList(response, ["purchases", "transactions"]);
        setTransactions(purchases.filter((item) => {
          const itemCourseId = item.course?._id || item.course?.id || item.courseId;
          return !itemCourseId || String(itemCourseId) === String(course.id);
        }));
        const coursePurchases = purchases.filter((item) => {
          const itemCourseId = item.course?._id || item.course?.id || item.courseId;
          return !itemCourseId || String(itemCourseId) === String(course.id);
        });
        const grouped = coursePurchases.reduce((map, item) => {
          const currency = item.currency || item.amount?.currency || course.currency || "EGP";
          const amount = Number(item.gross ?? item.grossAmount ?? item.amount?.total ?? item.amount ?? item.total ?? course.price ?? 0);
          map.set(currency, (map.get(currency) || 0) + amount);
          return map;
        }, new Map());
        setRevenueSummary(grouped.size ? [...grouped].map(([currency, amount]) => formatCurrency(amount, currency)).join(" + ") : formatCurrency(0, course.currency));
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, "تعذر تحميل معاملات الدورة."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [course.currency, course.id, course.price, reloadKey, setRevenueSummary]);

  const retry = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const amountOf = (item) =>
    Number(
      item.gross ?? item.grossAmount ?? item.amount?.total ?? item.amount ?? item.total ?? course.price ?? 0,
    );
  const commissionOf = (item) => Number(
    item.commission ?? item.commissionAmount ?? item.platformCommission ?? 0,
  );
  const netOf = (item) => Number(
    item.net ?? item.netAmount ?? item.instructorEarning ?? item.instructorEarnings ?? 0,
  );
  const currencyOf = (item) => item.currency || item.amount?.currency || course.currency || "EGP";
  const visibleTransactions = transactions.filter((item) => {
    const query = search.trim().toLocaleLowerCase("ar");
    if (!query) return true;
    const haystack = [
      item.transactionId, item.reference, item._id, item.id,
      item.student?.fullName, item.student?.name,
      item.user?.fullName, item.user?.name,
      paymentMethodOf(item),
    ].filter(Boolean).join(" ").toLocaleLowerCase("ar");
    return haystack.includes(query);
  });
  const totals = transactions.reduce((map, item) => {
    const currency = currencyOf(item);
    const current = map.get(currency) || { gross: 0, commission: 0, net: 0, count: 0 };
    current.gross += amountOf(item);
    current.commission += commissionOf(item);
    current.net += netOf(item);
    current.count += 1;
    map.set(currency, current);
    return map;
  }, new Map());
  const totalTransactions = transactions.length;
  const totalText = (field) => totals.size
    ? [...totals].map(([currency, values]) => formatCurrency(values[field], currency)).join(" + ")
    : formatCurrency(0, course.currency);

  if (loading) return <div className="rounded-xl border bg-white py-14 text-center text-sm text-[#667085]"><LoaderCircle className="mx-auto mb-2 animate-spin" size={22} />جاري تحميل أرباح الدورة...</div>;
  if (error) return <div className="rounded-xl border border-red-100 bg-white py-12 text-center text-sm text-red-700"><p>{error}</p><button type="button" onClick={retry} className="mt-3 rounded-md bg-[#123C91] px-4 py-2 font-semibold text-white">إعادة المحاولة</button></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 divide-x divide-[#EAECF0] rounded-xl border border-[#E5E7EB] bg-white sm:grid-cols-4">
        {[
          ["إجمالي الإيرادات", totalText("gross")],
          ["عدد المبيعات", totalTransactions],
          ["عمولة المنصة", totalText("commission")],
          ["صافي أرباح المحاضر", totalText("net")],
        ].map(([label, value]) => (
          <div
            key={label}
            className="px-3 py-4 text-center sm:px-5 sm:text-right"
          >
            <span className="block text-xs text-[#667085]">{label}</span>
            <strong className="mt-2 block text-base font-bold text-[#1F2937] sm:text-lg">
              {value}
            </strong>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <label className="relative min-w-0 flex-1 sm:min-w-60">
          <Search
            size={15}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
          />
          <input
            placeholder="ابحث برقم العملية، اسم الطالب، أو طريقة الدفع..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-md border border-[#D0D5DD] pr-9 pl-3 text-xs outline-none focus:border-[#123C91]"
          />
        </label>
        <select className="h-10 rounded-md border border-[#D0D5DD] px-4 text-xs text-[#475467]">
          <option>التاريخ</option>
          <option>آخر 7 أيام</option>
          <option>آخر 30 يوم</option>
        </select>
        <select className="h-10 rounded-md border border-[#D0D5DD] px-4 text-xs text-[#475467]">
          <option>طريقة الدفع</option>
          <option>محفظة إلكترونية</option>
          <option>بطاقة ائتمان</option>
        </select>
        <select className="h-10 rounded-md border border-[#D0D5DD] px-4 text-xs text-[#475467]">
          <option>ترتيب حسب</option>
          <option>الأحدث</option>
          <option>الأعلى قيمة</option>
        </select>
      </div>

      {/* Desktop / Tablet table */}
      <div className="hidden overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-right text-xs">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                {[
                  "رقم العملية",
                  "الطالب",
                  "التاريخ",
                  "طريقة الدفع",
                  "إجمالي المبلغ",
                  "عمولة المنصة",
                  "حصتك",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {visibleTransactions.map((item) => (
                <tr key={item._id || item.id || item.transactionId}>
                  <td className="px-4 py-4">
                    {item.transactionId ||
                      item.reference ||
                      item._id ||
                      item.id}
                  </td>
                  <td className="px-4 py-4">
                    {item.student?.fullName ||
                      item.student?.name ||
                      item.user?.fullName ||
                      item.user?.name ||
                      "طالب"}
                  </td>
                  <td className="px-4 py-4">
                    {item.createdAt || item.paidAt
                      ? new Date(
                          item.createdAt || item.paidAt,
                        ).toLocaleDateString("ar-EG")
                      : "غير محدد"}
                  </td>
                  <td className="px-4 py-4">
                    {paymentMethodOf(item)}
                  </td>
                  <td className="px-4 py-4" dir="ltr">{formatCurrency(amountOf(item), currencyOf(item))}</td>
                  <td className="px-4 py-4" dir="ltr">{formatCurrency(commissionOf(item), currencyOf(item))}</td>
                  <td className="px-4 py-4">
                    <span className="font-semibold text-[#123C91]" dir="ltr">
                      {formatCurrency(netOf(item), currencyOf(item))}
                    </span>
                  </td>
                </tr>
              ))}
              {!visibleTransactions.length && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-10 text-center text-[#98A2B3]"
                  >
                    لا توجد معاملات للدورة بعد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EAECF0] px-4 py-3 text-xs text-[#667085]">
          <span>إجمالي {totalTransactions} معاملة</span>
          <div className="flex gap-1">
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronRight size={13} />
            </button>
            <button className="h-7 w-7 rounded bg-[#123C91] text-white">
              1
            </button>
            <button className="h-7 w-7 rounded border">2</button>
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {visibleTransactions.map((item) => (
          <div
            key={item._id || item.id || item.transactionId}
            className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-xs"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-[#344054]">
                {item.transactionId || item.reference || item._id || item.id}
              </span>
              <span className="font-semibold text-[#123C91]" dir="ltr">
                {formatCurrency(netOf(item), currencyOf(item))}
              </span>
            </div>
            <p className="mb-2 text-[#667085] break-words">
              {item.student?.fullName ||
                item.student?.name ||
                item.user?.fullName ||
                item.user?.name ||
                "طالب"}
            </p>
            <div className="grid grid-cols-2 gap-2 border-t border-[#F1F2F4] pt-2 text-[#667085]">
              <div>
                <p className="text-[11px] text-[#98A2B3]">التاريخ</p>
                <p>
                  {item.createdAt || item.paidAt
                    ? new Date(
                        item.createdAt || item.paidAt,
                      ).toLocaleDateString("ar-EG")
                    : "غير محدد"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#98A2B3]">طريقة الدفع</p>
                <p>{paymentMethodOf(item)}</p>
              </div>
            </div>
          </div>
        ))}
        {!visibleTransactions.length && (
          <p className="rounded-xl border bg-white py-8 text-center text-sm text-[#98A2B3]">
            لا توجد معاملات للدورة بعد.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs text-[#667085]">
          <span>إجمالي {totalTransactions} معاملة</span>
          <div className="flex gap-1">
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronRight size={13} />
            </button>
            <button className="h-7 w-7 rounded bg-[#123C91] text-white">
              1
            </button>
            <button className="h-7 w-7 rounded border">2</button>
            <button className="grid h-7 w-7 place-items-center rounded border">
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewsTab = ({ course, onCourseRefresh }) => (
  <ReviewsPanel course={course} mode="admin" onCourseRefresh={onCourseRefresh} />
);

const AdminCourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDetails, setRejectDetails] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [liveStudentCount, setLiveStudentCount] = useState(null);
  const [liveRevenueSummary, setLiveRevenueSummary] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getAdminCourseEnrollments(courseId),
      getCourseEarningsByCourse({ courseId }),
    ]).then(([studentsResult, earningsResult]) => {
      if (!active) return;
      if (studentsResult.status === "fulfilled") {
        const items = responseList(studentsResult.value, ["enrollments", "students"]);
        setLiveStudentCount(items.filter((item) => !item?.status || item.status === "active").length);
      }
      if (earningsResult.status === "fulfilled") {
        const rows = earningsResult.value.filter((item) => !item.id || String(item.id) === String(courseId));
        setLiveRevenueSummary(rows.length ? rows.map((item) => formatCurrency(item.gross, item.currency)).join(" + ") : "—");
      }
    });
    return () => { active = false; };
  }, [courseId]);

  useEffect(() => {
    let active = true;
    fetchAdminCourse(courseId)
      .then((result) => {
        if (active) {
          setCourse(result);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (active) {
          setCourse(null);
          setLoadError(normalizeApiError(error));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading && !course)
    return (
      <AdminLayout>
        <div
          dir="rtl"
          className="rounded-xl bg-white p-10 text-center text-[#667085]"
        >
          جاري تحميل تفاصيل الدورة...
        </div>
      </AdminLayout>
    );

  if (!course) {
    return (
      <AdminLayout>
        <div dir="rtl" className="rounded-xl bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 text-[#98A2B3]" />
          <p className="text-[#667085]">
            {loadError?.code === "COURSE_NOT_FOUND"
              ? "لم يتم العثور على الدورة."
              : loadError?.message || "تعذر تحميل تفاصيل الدورة."}
          </p>
          <Link
            to="/admin/courses"
            className="mt-4 inline-block font-semibold text-[#123C91]"
          >
            العودة إلى الدورات
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const isPendingReview = course.rawStatus === "pending_review";
  const reviewCurriculum =
    isPendingReview && course.submittedCurriculum?.length
      ? course.submittedCurriculum
      : course.curriculum || [];
  const curriculumWithQuizzes = placeCourseQuizzes(reviewCurriculum, course.quizzes, (quiz) => ({
    ...quiz,
    id: quiz._id || quiz.id,
    type: "اختبار",
  }));
  const reviewCourse = { ...course, curriculum: curriculumWithQuizzes };
  const countedLessons = curriculumWithQuizzes.reduce(
    (sum, section) => sum + (section.lessons || []).filter((lesson) => lesson.type !== "اختبار").length,
    0,
  );
  const totalLessons = countedLessons || course.lessons || 0;
  const totalQuizzes = curriculumWithQuizzes.reduce(
    (sum, section) => sum + (section.lessons || []).filter((lesson) => lesson.type === "اختبار").length,
    0,
  );
  const tabs = isPendingReview
    ? [
        { id: "overview", label: "نظرة عامة", icon: LayoutGrid },
        { id: "curriculum", label: "المنهج", icon: Layers3 },
        { id: "instructor", label: "المحاضر", icon: Users },
      ]
    : [
        { id: "overview", label: "نظرة عامة", icon: LayoutGrid },
        { id: "curriculum", label: "المنهج", icon: Layers3 },
        { id: "instructor", label: "المحاضر", icon: Users },
        { id: "students", label: "الطلاب", icon: Users },
        { id: "reviews", label: "التقييمات", icon: Star },
        { id: "earnings", label: "الأرباح", icon: WalletCards },
      ];
  const uploadedCover =
    typeof course.cover === "object"
      ? course.cover.previewUrl || course.cover.dataUrl
      : "";
  const coverSrc =
    uploadedCover || course.coverImage || coverMap[course.cover] || pythonCover;
  const refreshCourse = async () => {
    const refreshed = await fetchAdminCourse(courseId);
    setCourse(refreshed);
    return refreshed;
  };

  return (
    <AdminLayout>
      <div
        dir="rtl"
        className="min-h-full min-w-0 overflow-x-hidden rounded-xl bg-[#F7F8FC] p-3 pb-10 text-right font-['IBM_Plex_Sans_Arabic'] sm:p-5 sm:pb-12"
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-xs text-[#667085]">
              <Link
                to="/admin/courses"
                className="font-semibold text-[#123C91]"
              >
                الدورات
              </Link>
              <ChevronLeft size={13} />
              <span>تفاصيل الدورة</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold text-[#123C91] sm:text-xl">
                {course.title}
              </h1>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${isPendingReview ? "bg-[#FFF4D8] text-[#B7791F]" : "bg-[#DDF7E8] text-[#17864B]"}`}
              >
                {course.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-[#667085]">
              {course.shortDescription || course.description}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            {isPendingReview ? (
              <>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="w-full rounded-md bg-[#17864B] px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                >
                  اعتماد ونشر
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="w-full rounded-md bg-[#D92D20] px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                >
                  رفض
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-4"><ModerationHistoryPanel courseId={course.id} admin /></div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isPendingReview ? (
            <>
              <StatCard
                icon={Layers3}
                value={reviewCurriculum.length}
                label="أقسام"
                accent="bg-[#EAF2FF] text-[#3567C8]"
              />
              <StatCard
                icon={BookOpen}
                value={totalLessons}
                label="دروس"
                accent="bg-[#EAF2FF] text-[#3567C8]"
              />
              <StatCard
                icon={CircleHelp}
                value={totalQuizzes}
                label="اختبارات"
                accent="bg-[#F4EEFF] text-[#7F56D9]"
              />
              <StatCard
                icon={WalletCards}
                value={money(course.price)}
                label="سعر الدورة"
                accent="bg-[#E8FFFC] text-[#12A594]"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                value={liveStudentCount ?? course.students ?? 0}
                label="إجمالي الطلاب"
                accent="bg-[#EAF2FF] text-[#3567C8]"
              />
              <StatCard
                icon={Star}
                value={Number(course.rating || 0).toFixed(1)}
                label="التقييم"
                accent="bg-[#FFF4D8] text-[#F5A623]"
              />
              <StatCard
                icon={WalletCards}
                value={liveRevenueSummary || "—"}
                label="إجمالي مبيعات الدورة"
                accent="bg-[#E8FFFC] text-[#12A594]"
              />
            </>
          )}
        </div>

        <div className="mb-4 overflow-x-auto">
          <nav className="flex min-w-max items-center justify-start gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold transition ${activeTab === id ? "bg-[#1F2937] text-white" : "text-[#667085] hover:bg-[#F2F4F7]"}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "overview" && (
          <OverviewTab
            course={reviewCourse}
            coverSrc={coverSrc}
            totalLessons={totalLessons}
            totalQuizzes={totalQuizzes}
          />
        )}
        {activeTab === "curriculum" && <CurriculumTab course={reviewCourse} />}
        {activeTab === "instructor" && <InstructorTab course={course} />}
        {activeTab === "students" && <StudentsTab course={course} setStudentCount={setLiveStudentCount} />}
        {activeTab === "reviews" && <ReviewsTab course={course} onCourseRefresh={refreshCourse} />}
        {activeTab === "earnings" && <EarningsTab course={course} setRevenueSummary={setLiveRevenueSummary} />}

        {/* Approve modal */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 text-right">
              <h3 className="mb-2 text-lg font-semibold">
                اعتماد الدورة للنشر؟
              </h3>
              <p className="mb-4 text-sm text-[#667085]">
                سيتم نشر الدورة "{course.title}" على المنصة وإشعار المحاضر. هل
                تريد المتابعة؟
              </p>
              <label className="mb-4 block text-sm text-[#344054]">
                ملاحظات للمحاضر (اختياري)
                <textarea
                  value={approveNotes}
                  onChange={(event) => setApproveNotes(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="أضف ملاحظات المراجعة إن وجدت..."
                />
              </label>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="w-full rounded-md border px-4 py-2 sm:w-auto"
                >
                  إلغاء
                </button>
                <button
                  disabled={reviewing}
                  onClick={async () => {
                    setReviewing(true);
                    try {
                      const updated = await approveCourse(
                        course.id,
                        approveNotes,
                      );
                      setCourse(
                        updated?.id ? updated : { ...course, status: "منشور" },
                      );
                      toast.success("تم اعتماد الدورة ونشرها");
                      setShowApproveModal(false);
                      setApproveNotes("");
                      navigate("/admin/courses");
                    } catch (error) {
                      toast.error(
                        reviewErrorMessage(error, "تعذر اعتماد الدورة"),
                      );
                    } finally {
                      setReviewing(false);
                    }
                  }}
                  className="w-full rounded-md bg-[#17864B] px-4 py-2 text-white disabled:opacity-60 sm:w-auto"
                >
                  {reviewing ? "جاري الاعتماد..." : "تأكيد الاعتماد"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 text-right">
              <h3 className="mb-2 text-lg font-semibold">سبب الرفض</h3>
              <p className="mb-4 text-sm text-[#667085]">
                وضع سبب الرفض بدقة لتمكين المحاضر من تعديل الدورة وإعادة إرسالها
                للمراجعة.
              </p>
              <div className="mb-3">
                <label className="block text-sm text-[#344054] mb-1">
                  سبب الرفض
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="">اختر سببا رئيسيا...</option>
                  <option value="المحتوى غير مناسب">المحتوى غير مناسب</option>
                  <option value="جودة التسجيل ضعيفة">جودة التسجيل ضعيفة</option>
                  <option value="المعلومات ناقصة">المعلومات ناقصة</option>
                  <option value="اخرى">أخرى</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-[#344054] mb-1">
                  تفاصيل إضافية
                </label>
                <textarea
                  value={rejectDetails}
                  onChange={(e) => setRejectDetails(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="اكتب توضيحًا وأفضّلًا نصائح للمحاضر حول ما يجب تحسينه..."
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="w-full rounded-md border px-4 py-2 sm:w-auto"
                >
                  إلغاء
                </button>
                <button
                  onClick={async () => {
                    setReviewing(true);
                    try {
                      const updated = await rejectCourse(
                        course.id,
                        rejectReason,
                        rejectDetails,
                      );
                      setCourse(
                        updated?.id
                          ? updated
                          : {
                              ...course,
                              status: "مرفوض",
                              rejectedReason: rejectReason,
                              rejectedDetails: rejectDetails,
                            },
                      );
                      toast.success("تم رفض الدورة وإرسال الملاحظات للمحاضر");
                      setShowRejectModal(false);
                      navigate("/admin/courses");
                    } catch (error) {
                      toast.error(reviewErrorMessage(error, "تعذر رفض الدورة"));
                    } finally {
                      setReviewing(false);
                    }
                  }}
                  disabled={
                    reviewing ||
                    !rejectReason ||
                    (rejectDetails && rejectDetails.length < 10)
                  }
                  className="w-full rounded-md bg-[#D92D20] px-4 py-2 text-white disabled:opacity-50 sm:w-auto"
                >
                  {reviewing ? "جاري الإرسال..." : "تأكيد"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCourseDetailsPage;
