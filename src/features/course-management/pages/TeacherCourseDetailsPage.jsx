import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Copy,
  CircleHelp,
  Download,
  FileText,
  LayoutGrid,
  Layers3,
  Maximize2,
  Minimize2,
  MessageSquare,
  Mail,
  Play,
  LoaderCircle,
  RefreshCw,
  Search,
  Star,
  Users,
  Video,
  WalletCards,
  X,
} from "lucide-react";
import TeacherLayout from "../../../components/teacher/layout/TeacherLayout";
import PolicyAcceptanceDialog from "../../../components/course/PolicyAcceptanceDialog";
import { confirmToast } from "../../../utils/confirmToast";
import { fetchTeacherCourse, fetchTeacherCourseEnrollments } from "../api/coursesApi";
import ReviewsPanel from "../components/reviews/ReviewsPanel";
import ModerationHistoryPanel from "../components/ModerationHistoryPanel";
import { resolveMediaUrl } from "../../../services/apiUrl";
import {
  requestLessonAttachmentAccess,
  requestLessonMediaAccess,
  getMyPolicyStatus,
  submitMarketplaceCourse,
} from "../../../services/APIService";
import { getApiErrorMessage, normalizeApiError } from "../../../services/apiError";
import { getEarningsCourses, getEarningsHistory } from "../../instructor-earnings/api/earningsApi";
import BrandMediaPlayer from "../../../components/media/BrandMediaPlayer";
import { formatCourseDuration } from "../../../utils/courseDuration";
import { courseStatusStyles } from "../utils/courseStatusStyles";
import { placeCourseQuizzes } from "../utils/placeCourseQuizzes";

const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutGrid },
  { id: "curriculum", label: "المنهج", icon: Layers3 },
  { id: "reviews", label: "التقييمات", icon: Star },
  { id: "earnings", label: "الأرباح", icon: WalletCards },
];

const money = (value, currency = "EGP") => {
  const safeCurrency = /^[A-Z]{3}$/.test(String(currency || "").toUpperCase())
    ? String(currency).toUpperCase()
    : "EGP";
  try {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  } catch {
    return `${Number(value || 0).toLocaleString("ar-EG")} ${safeCurrency}`;
  }
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
  const teacherProfitPerStudent = commissionRate == null ? null : pricePerStudent - platformProfitPerStudent;
  const isAcademicCourse = course.courseType === "academic" || Boolean(course.academicCurriculumId);
  const overviewDetails = [
    ["الحالة", course.status],
    ["تاريخ الإنشاء", course.createdAt ? new Date(course.createdAt).toLocaleDateString("ar-EG") : "غير محدد"],
    ["آخر تحديث", course.updatedAt ? new Date(course.updatedAt).toLocaleDateString("ar-EG") : "غير محدد"],
    ["التصنيف", course.category || "غير محدد"],
    ["المستوى", course.level || "غير محدد"],
    ["لغة الشرح", course.language || "العربية"],
    ...(isAcademicCourse ? [
      ["المرحلة", course.academicStage || course.stage || "غير محددة"],
      ["الصف الدراسي", course.academicGrade || course.grade || "غير محدد"],
      ["المنهج", course.academicCurriculumName || "غير محدد"],
      ["المادة", course.subject || "غير محددة"],
    ] : []),
  ];
  const audience = Array.isArray(course.targetAudience) ? course.targetAudience : course.targetAudience ? [course.targetAudience] : [];
  const requirements = Array.isArray(course.requirements) ? course.requirements : course.requirements ? [course.requirements] : [];
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
              <dd className="mt-1 font-medium text-[#344054]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#EAECF0] pt-4 text-[14px] text-[#667085]">
          <span className="inline-flex items-center gap-1.5"><Layers3 size={14} className="text-[#123C91]" />{course.curriculum?.length || 0} أقسام</span>
          <span className="inline-flex items-center gap-1.5"><Video size={14} className="text-[#123C91]" />{totalLessons} دروس</span>
          <span className="inline-flex items-center gap-1.5"><CircleHelp size={14} className="text-[#123C91]" />{totalQuizzes} اختبارات</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-[#123C91]" />{formatCourseDuration(course)}</span>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-[14px] font-semibold text-[#344054]">رابط مشاركة الدورة</label>
          <div className="flex overflow-hidden rounded-md border border-[#D0D5DD]">
            <input readOnly dir="ltr" value={courseUrl} className="h-10 min-w-0 flex-1 bg-[#F9FAFB] px-3 text-left text-xs text-[#667085] outline-none" />
            <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(courseUrl); toast.success("تم النسخ بنجاح"); } catch { toast.error("تعذر نسخ الرابط"); } }} className="inline-flex items-center gap-1.5 bg-[#123C91] px-4 text-xs font-semibold text-white">
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
            <button type="button" onClick={() => setShowCover(true)} className="font-semibold text-[#123C91]">عرض بالحجم الكامل</button>
          </div>
        </div>
        <div className="rounded-xl bg-[#1F2937] p-5 text-white">
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px]">{course.pricingType === "free" ? "مجانية" : "مدفوعة"}</span>
          <strong className="mt-5 block text-xl">{course.pricingType === "free" ? "مجاني" : money(pricePerStudent)}</strong>
          <span className="mt-1 block text-xs text-white/60">سعر بيع الدورة</span>
          <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs text-white/70">
            <div className="flex justify-between"><span>عمولة المنصة</span><span>{commissionRate == null ? "حسب إعداد المنصة" : `${commissionRate}%`}</span></div>
            <div className="flex justify-between"><span>ربح المنصة لكل طالب</span><span>{platformProfitPerStudent == null ? "—" : money(platformProfitPerStudent)}</span></div>
            <div className="flex justify-between border-t border-white/10 pt-3 font-semibold text-white"><span>ربحك لكل طالب</span><span>{teacherProfitPerStudent == null ? "—" : money(teacherProfitPerStudent)}</span></div>
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

const CurriculumTab = ({ course }) => {
  const navigate = useNavigate();
  const sections = (course.curriculum || []).filter(
    (section) => Array.isArray(section.lessons) && section.lessons.length > 0,
  );
  const [openSections, setOpenSections] = useState(() => new Set(sections[0]?.id ? [sections[0].id] : []));
  const [openingResource, setOpeningResource] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFullscreen, setMediaFullscreen] = useState(false);
  const mediaPreviewRef = useRef(null);
  const totalLessons = sections.reduce((sum, section) => sum + section.lessons.filter((lesson) => lesson.type !== "اختبار").length, 0);
  const totalQuizzes = sections.reduce((sum, section) => sum + section.lessons.filter((lesson) => lesson.type === "اختبار").length, 0);
  const totalVideos = sections.reduce((sum, section) => sum + section.lessons.filter((lesson) => lesson.type === "فيديو").length, 0);
  const toggleSection = (sectionId) => setOpenSections((current) => {
    const next = new Set(current);
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    return next;
  });

  useEffect(() => () => {
    if (mediaPreview?.objectUrl) URL.revokeObjectURL(mediaPreview.url);
  }, [mediaPreview]);

  useEffect(() => {
    const syncFullscreen = () => setMediaFullscreen(document.fullscreenElement === mediaPreviewRef.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const closeMediaPreview = async () => {
    if (document.fullscreenElement === mediaPreviewRef.current) await document.exitFullscreen();
    setMediaPreview(null);
  };

  const toggleMediaFullscreen = async () => {
    if (!mediaPreviewRef.current) return;
    if (document.fullscreenElement === mediaPreviewRef.current) await document.exitFullscreen();
    else await mediaPreviewRef.current.requestFullscreen();
  };

  const openProtectedResource = async ({ lesson, attachment }) => {
    const lessonId = lesson?.id || lesson?._id;
    const attachmentId = attachment?.id || attachment?._id;
    if (!course?.id || !lessonId || openingResource) return;
    const resourceKey = attachmentId || lessonId;
    setOpeningResource(resourceKey);
    try {
      const response = attachmentId
        ? await requestLessonAttachmentAccess(course.id, lessonId, attachmentId)
        : await requestLessonMediaAccess(course.id, lessonId);
      const data = response?.data?.data ?? response?.data ?? response;
      if (!data?.playbackUrl) throw new Error("PREVIEW_URL_MISSING");
      const url = resolveMediaUrl(data.playbackUrl);
      const isFile = Boolean(attachmentId) || ["ملف", "document", "file"].includes(lesson.type);
      if (isFile) {
        const fileResponse = await fetch(url, { credentials: "include" });
        if (!fileResponse.ok) throw new Error("FILE_PREVIEW_FAILED");
        const blob = await fileResponse.blob();
        setMediaPreview({
          url: URL.createObjectURL(blob),
          objectUrl: true,
          isFile: true,
          mimeType: blob.type || data.mimeType || "application/octet-stream",
          title: attachment?.name || attachment?.originalName || lesson.title || "محتوى الدرس",
        });
      } else {
        setMediaPreview({ url, objectUrl: false, isFile: false, type: ["صوت", "audio"].includes(String(lesson.type || lesson.contentType || "").toLowerCase()) ? "audio" : "video", title: lesson.title || "محتوى الدرس" });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر فتح المحتوى"));
    } finally {
      setOpeningResource("");
    }
  };

  return <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#EAECF0] px-4 py-5 sm:px-6">
      <div><h3 className="font-bold text-[#1F2937]">محتوى المنهج الدراسي</h3><p className="mt-1 text-[13px] text-[#667085] sm:text-[14px]">عرض تسلسل الموضوعات والدروس داخل كل قسم.</p></div>
      <div className="flex flex-wrap gap-3 text-xs text-[#667085] sm:gap-4">
        <span className="inline-flex items-center gap-1.5"><Layers3 size={14} className="text-[#123C91]" />{sections.length} أقسام</span>
        <span className="inline-flex items-center gap-1.5"><BookOpen size={14} className="text-[#123C91]" />{totalLessons} دروس</span>
        <span className="inline-flex items-center gap-1.5"><CircleHelp size={14} className="text-[#123C91]" />{totalQuizzes} اختبارات</span>
        <span className="inline-flex items-center gap-1.5"><Video size={14} className="text-[#123C91]" />{totalVideos} فيديو</span>
      </div>
    </div>
    <div className="space-y-4 p-4 sm:p-6">
      {sections.map((section, sectionIndex) => {
        const isOpen = openSections.has(section.id);
        return <div key={section.id} className="overflow-hidden rounded-xl border border-[#DDE2E8]">
          <button type="button" onClick={() => toggleSection(section.id)} className="flex w-full items-center gap-3 bg-[#EEF6FF] px-4 py-3 text-right" aria-expanded={isOpen}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#123C91] text-xs font-semibold text-white">{sectionIndex + 1}</span>
            <strong className="min-w-0 flex-1 truncate text-[15px] text-[#344054] sm:text-[16px]">{section.title}</strong>
            <span className="text-xs text-[#667085]">{section.lessons?.length || 0} دروس</span>
            <ChevronDown size={17} className={`shrink-0 text-[#123C91] transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>
          {isOpen && <div>{section.lessons?.length ? section.lessons.map((lesson, lessonIndex) => <div key={lesson.id} className="flex flex-wrap items-center gap-3 border-t border-[#EAECF0] px-4 py-3 text-[13px] sm:flex-nowrap sm:text-[14px]">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#F2F4F7] text-[11px] text-[#667085]">{lessonIndex + 1}</span>
            <span className="min-w-0 flex-1 text-[#344054]">{lesson.title || "درس بدون عنوان"}</span>
            {lesson._sectionUnlinked && <span className="rounded bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800">اختبار غير مرتبط بقسم</span>}
            {lesson.preview && <span className="shrink-0 rounded-full bg-[#DDF7E8] px-2.5 py-1 text-[10px] font-bold text-[#17864B]">متاح للمعاينة</span>}
            {lesson.type && <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#667085]">{lesson.type === "ملف" ? <FileText size={14} /> : <Video size={14} />}{lesson.type}</span>}
            {lesson.type === "اختبار" ? <button type="button" onClick={() => navigate(`/teacher/courses/${course.id}/quizzes/${lesson.id || lesson._id}`)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#123C91] bg-[#F4F7FF] px-3 py-1.5 text-xs font-semibold text-[#123C91] transition hover:bg-[#E8EEFF]"><CircleHelp size={14} />عرض الاختبار</button> : <button type="button" disabled={Boolean(openingResource)} onClick={() => openProtectedResource({ lesson })} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#123C91] bg-white px-3 py-1.5 text-xs font-semibold text-[#123C91] transition hover:bg-[#EEF6FF] disabled:cursor-wait disabled:opacity-60">{openingResource === (lesson.id || lesson._id) ? <LoaderCircle size={14} className="animate-spin" /> : <Play size={14} />}فتح المحتوى</button>}
            {!!lesson.attachments?.length && <div className="flex flex-wrap gap-1.5">{lesson.attachments.map((attachment) => { const attachmentId = attachment.id || attachment._id; return <button key={attachmentId || attachment.name} type="button" disabled={Boolean(openingResource)} onClick={() => openProtectedResource({ lesson, attachment })} title={attachment.name || attachment.originalName || "مرفق"} className="inline-flex max-w-48 items-center gap-1.5 rounded-lg border border-[#D0D5DD] bg-white px-2.5 py-1.5 text-xs text-[#344054] hover:border-[#123C91] hover:text-[#123C91] disabled:cursor-wait disabled:opacity-60">{openingResource === attachmentId ? <LoaderCircle size={13} className="animate-spin" /> : <Download size={13} />}<span className="truncate">{attachment.name || attachment.originalName || "فتح المرفق"}</span></button>; })}</div>}
          </div>) : <div className="border-t border-[#EAECF0] px-4 py-6 text-center text-sm text-[#98A2B3]">لا توجد دروس مضافة بعد</div>}</div>}
        </div>;
      })}
      {!sections.length && <p className="py-8 text-center text-sm text-[#98A2B3]">لا توجد دروس مضافة بعد.</p>}
    </div>
    {mediaPreview && <div className="fixed inset-0 z-[110] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={mediaPreview.title} onMouseDown={closeMediaPreview} onContextMenu={(event) => event.preventDefault()}>
      <div ref={mediaPreviewRef} className={`flex w-full flex-col overflow-hidden border border-white/15 bg-[#081A3A] shadow-2xl ${mediaFullscreen ? "h-screen max-w-none rounded-none border-0" : "max-w-5xl rounded-2xl"}`} onMouseDown={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()}>
        <header className="flex items-center justify-between gap-3 bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white sm:px-5"><div className="min-w-0"><p className="text-[10px] text-[#8FE3D8]">محتوى الدرس</p><h3 className="truncate text-sm font-bold sm:text-base">{mediaPreview.title}</h3></div><div className="flex shrink-0 items-center gap-2"><button type="button" onClick={toggleMediaFullscreen} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20">{mediaFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{mediaFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}</button><button type="button" onClick={closeMediaPreview} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="إغلاق"><X size={18} /></button></div></header>
        <div className={`min-h-0 bg-[#050B17] p-2 sm:p-4 ${mediaFullscreen ? "flex-1" : ""}`} onContextMenu={(event) => event.preventDefault()}>{mediaPreview.isFile ? (mediaPreview.mimeType.startsWith("image/") ? <img src={mediaPreview.url} alt={mediaPreview.title} draggable={false} className={mediaFullscreen ? "h-full w-full bg-white object-contain" : "mx-auto max-h-[75vh] max-w-full rounded-lg bg-white object-contain"} /> : <iframe src={`${mediaPreview.url}#toolbar=0`} title={mediaPreview.title} className={`${mediaFullscreen ? "h-full" : "h-[75vh] rounded-lg"} w-full bg-white`} />) : <BrandMediaPlayer src={mediaPreview.url} type={mediaPreview.type} autoPlay className={mediaFullscreen ? "h-full w-full" : "aspect-video max-h-[75vh] w-full rounded-lg"} />}</div>
      </div>
    </div>}
  </div>;
};

const StudentsTab = ({ course, setStudentCount }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [students, setStudents] = useState(Array.isArray(course.studentsData) ? course.studentsData : []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const studentName = (item) => item.student?.fullName || item.student?.name || item.user?.fullName || item.user?.name || item.fullName || item.name || "طالب";
  const studentId = (item) => item.student?._id || item.student?.id || item.user?._id || item.user?.id || item._id || item.id;
  const enrolledAt = (item) => item.enrolledAt || item.enrollment?.enrolledAt || item.joinedAt || item.createdAt;
  const progressOf = (item) => {
    const progress = item.progressPercentage ?? item.progress?.progressPercentage ?? item.progress?.percentage ?? item.enrollment?.progressPercentage ?? item.enrollment?.progress?.percentage ?? item.progress ?? 0;
    const number = Number(progress);
    return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 0;
  };
  const lastActivityOf = (item) => item.lastActivityAt || item.progress?.lastActivityAt || item.progress?.updatedAt || item.enrollment?.lastActivityAt || item.lastAccessedAt || item.updatedAt;
  useEffect(() => {
    let active = true;
    fetchTeacherCourseEnrollments(course.id)
      .then((items) => {
        if (!active) return;
        setStudents(items);
        setStudentCount(items.filter((item) => !item?.status || item.status === "active").length);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || requestError?.message || "تعذر تحميل طلاب الدورة.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [course.id, retryKey, setStudentCount]);
  const visibleStudents = students
    .filter((item) => studentName(item).toLocaleLowerCase("ar").includes(query.trim().toLocaleLowerCase("ar")))
    .sort((a, b) => {
      if (sort === "progress") return progressOf(b) - progressOf(a);
      return new Date(enrolledAt(b) || 0) - new Date(enrolledAt(a) || 0);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <label className="relative min-w-60 flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الطالب..." className="h-10 w-full rounded-md border border-[#D0D5DD] pr-9 pl-3 text-xs outline-none focus:border-[#123C91]" />
        </label>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-md border border-[#D0D5DD] px-4 text-[14px] text-[#475467]"><option value="newest">الأحدث تسجيلًا</option><option value="progress">الأعلى تقدمًا</option></select>
      </div>
      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        {loading && <div className="flex min-h-40 items-center justify-center text-sm text-[#667085]"><LoaderCircle size={20} className="ml-2 animate-spin" /> جاري تحميل الطلاب...</div>}
        {!loading && error && <div className="p-8 text-center text-sm text-[#B42318]"><p>{error}</p><button type="button" onClick={() => { setLoading(true); setError(""); setRetryKey((value) => value + 1); }} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#B42318] px-4 py-2 font-semibold text-white"><RefreshCw size={15} /> إعادة المحاولة</button></div>}
        {!loading && !error && <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-right text-[14px]">
            <thead className="bg-[#F9FAFB] text-[#667085]"><tr>{["الطالب", "تاريخ التسجيل", "نسبة التقدم", "آخر نشاط", "الإجراءات"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {visibleStudents.map((item) => {
                const name = studentName(item);
                const progress = progressOf(item);
                const lastActivity = lastActivityOf(item);
                return (
                <tr key={studentId(item) || name}>
                  <td className="px-4 py-4 font-medium text-[#344054]">{name}</td>
                  <td dir="ltr" className="px-4 py-4 text-right text-[#667085]">{enrolledAt(item) ? new Date(enrolledAt(item)).toLocaleDateString("ar-EG") : "غير محدد"}</td>
                  <td className="px-4 py-4 text-[#667085]"><div className="flex min-w-28 items-center gap-2"><span dir="ltr" className="w-9 text-xs">{progress}%</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EAECF0]"><span className="block h-full rounded-full bg-[#12B8A6]" style={{ width: `${progress}%` }} /></span></div></td>
                  <td dir="ltr" className="px-4 py-4 text-right text-[#667085]">{lastActivity ? new Date(lastActivity).toLocaleDateString("ar-EG") : "غير محدد"}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/teacher/messages", {
                          state: {
                            openUserId: studentId(item),
                            openClassroomId: course.id,
                            openClassroomName: course.title,
                          },
                        })
                      }
                      className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#EAF4FF] p-2 text-[#123C91] transition hover:bg-[#D8EEFF]"
                      aria-label={`فتح محادثة ${name}`}
                    >
                      <MessageSquare size={16} />
                    </button>
                  </td>
                </tr>
              )})}
              {!visibleStudents.length && <tr><td colSpan="5" className="px-4 py-10 text-center text-[#98A2B3]">{students.length ? "لا توجد نتائج مطابقة للبحث." : "لا يوجد طلاب مسجلون في الدورة بعد."}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-4 py-3 text-xs text-[#667085]">
          <span>إجمالي {students.length} طالب</span>
          {query && <span>{visibleStudents.length} نتيجة</span>}
        </div>
        </>}
      </div>
    </div>
  );
};

const InstructorTab = ({ course }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const instructor = course.instructorDetails || (typeof course.instructor === "object" ? course.instructor : { name: course.instructor });
  const text = (value, fallback = "غير متوفر") => {
    if (value == null || value === "") return fallback;
    if (typeof value === "string" || typeof value === "number") return String(value);
    return text(value.ar ?? value.en ?? value.name ?? value.title, fallback);
  };
  const name = text(instructor.name || instructor.fullName || instructor.user?.fullName || course.teacherName, "المحاضر");
  const instructorId = instructor.id || instructor._id || instructor.user?.id || instructor.user?._id || course.instructorId;
  const avatar = instructor.avatar || instructor.profileImage || instructor.user?.profileImage || instructor.user?.avatar;
  const email = text(instructor.email || instructor.user?.email);
  const phone = text(instructor.phone || instructor.phoneNumber || instructor.user?.phone);
  const subject = text(instructor.subject || instructor.specialization || course.subject, "غير محدد");
  const stage = text(instructor.stage || instructor.academicStage || course.academicStage, "غير محددة");
  const curriculum = text(instructor.curriculum || instructor.educationSystem, "غير محدد");
  const experience = text(instructor.experience || instructor.yearsOfExperience, "غير محددة");
  const joinedAt = instructor.joinedAt || instructor.createdAt;
  const joinedDate = joinedAt ? new Date(joinedAt).toLocaleDateString("ar-EG") : "غير محدد";
  const bio = text(instructor.bio, instructor.headline || `${subject} · ${experience}`);
  const openMessages = () => navigate("/teacher/messages", { state: { openUserId: instructorId, openClassroomId: course.id, openClassroomName: course.title } });

  return (
    <>
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="font-bold text-[#1F2937]">المحاضر المسؤول عن الدورة</h3>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          {avatar ? <img src={avatar} alt={name} className="h-16 w-16 rounded-full object-cover" /> : <span className="grid h-16 w-16 place-items-center rounded-full bg-[#EAF2FF] text-xl font-bold text-[#123C91]">{name.charAt(0)}</span>}
          <div className="min-w-0 flex-1">
            <strong className="block text-lg text-[#1F2937]">{name}</strong>
            <p className="mt-1 text-sm text-[#667085]">{bio}</p>
            <div className="mt-3 flex flex-col gap-2 min-[420px]:flex-row">
              <button type="button" onClick={() => setShowDetails(true)} className="rounded-md bg-[#123C91] px-4 py-2.5 text-xs font-semibold text-white">عرض التفاصيل</button>
              <button type="button" onClick={openMessages} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#D0D5DD] px-4 py-2.5 text-xs font-semibold text-[#344054]"><MessageSquare size={14} /> مراسلة</button>
            </div>
          </div>
        </div>
      </div>

      {showDetails && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-3" onMouseDown={() => setShowDetails(false)}>
        <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-4"><h3 className="font-bold text-[#1F2937]">تفاصيل المحاضر</h3><button type="button" onClick={() => setShowDetails(false)} className="rounded-md p-2 text-[#667085] hover:bg-[#F2F4F7]" aria-label="إغلاق"><X size={18} /></button></div>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-4 rounded-xl bg-[#F8FAFC] p-4">{avatar ? <img src={avatar} alt={name} className="h-14 w-14 rounded-full object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-lg font-bold text-[#123C91]">{name.charAt(0)}</span>}<div className="min-w-0"><strong className="block truncate">{name}</strong><span className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#667085]"><Mail size={13} />{email}</span></div></div>
            <dl className="grid gap-3 sm:grid-cols-2">{[["رقم الهاتف", phone], ["تاريخ الانضمام", joinedDate], ["المادة", subject], ["المرحلة", stage], ["المنهج", curriculum], ["سنوات الخبرة", experience]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#F8FAFC] px-4 py-3"><dt className="text-[11px] text-[#98A2B3]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[#344054]">{value}</dd></div>)}</dl>
            {(instructor.cvName || instructor.cvUrl) && <a href={instructor.cvUrl || "#"} download className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-4 text-[#344054]"><FileText size={20} className="text-[#123C91]" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{instructor.cvName || "السيرة الذاتية"}</strong></span><Download size={17} /></a>}
            <button type="button" onClick={openMessages} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#123C91] px-5 py-3 text-sm font-semibold text-white"><MessageSquare size={16} /> مراسلة المحاضر</button>
          </div>
        </div>
      </div>}
    </>
  );
};


const EarningsTab = ({ course }) => {
  const [result, setResult] = useState({ items: [], pagination: { total: 0 } });
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getEarningsHistory({ courseId: course.id, page: 1, limit: 100 }),
      getEarningsCourses({ courseId: course.id }),
    ])
      .then(([historyResult, analyticsResult]) => {
        if (!active) return;
        if (historyResult.status === "rejected") throw historyResult.reason;
        setResult(historyResult.value);
        setAnalytics(analyticsResult.status === "fulfilled" ? analyticsResult.value : []);
      })
      .catch((requestError) => { if (active) setError(requestError?.response?.data?.message || requestError?.message || "تعذر تحميل أرباح الدورة."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [course.id, retryKey]);

  const transactions = result.items;
  const matchingAnalytics = analytics.filter((item) => !item.id || String(item.id) === String(course.id));
  const totalsSource = matchingAnalytics.length ? matchingAnalytics : transactions;
  const totals = totalsSource.reduce((groups, item) => {
    const currency = item.currency || "EGP";
    const current = groups[currency] || { gross: 0, commission: 0, net: 0, sales: 0 };
    groups[currency] = {
      gross: current.gross + Number(item.gross || 0),
      commission: current.commission + Number(item.commission || 0),
      net: current.net + Number(item.net || 0),
      sales: current.sales + Number(item.salesCount ?? 1),
    };
    return groups;
  }, {});
  const currencies = Object.entries(totals);

  return (
    <div className="space-y-4">
      {loading && <div className="flex min-h-44 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#667085]"><LoaderCircle size={20} className="ml-2 animate-spin" /> جاري تحميل أرباح الدورة...</div>}
      {!loading && error && <div className="rounded-xl border border-[#FECDCA] bg-[#FEF3F2] p-6 text-center text-sm text-[#B42318]"><p>{error}</p><button type="button" onClick={() => { setLoading(true); setError(""); setRetryKey((value) => value + 1); }} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#B42318] px-4 py-2 font-semibold text-white"><RefreshCw size={15} /> إعادة المحاولة</button></div>}

      {!loading && !error && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5"><span className="text-xs text-[#667085]">عدد المبيعات</span><strong dir="ltr" className="mt-2 block text-right text-xl text-[#1F2937]">{currencies.reduce((sum, [, values]) => sum + values.sales, 0) || result.pagination.total}</strong></div>
        {["إجمالي المبيعات", "عمولة المنصة", "صافي أرباحك"].map((label, index) => (
          <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-5"><span className="text-xs text-[#667085]">{label}</span><div className="mt-2 space-y-1">{currencies.map(([currency, values]) => <strong dir="ltr" key={currency} className="block text-right text-sm text-[#1F2937]">{money(index === 0 ? values.gross : index === 1 ? values.commission : values.net, currency)}</strong>)}{!currencies.length && <span className="text-xs text-[#98A2B3]">لا توجد بيانات</span>}</div></div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
        <div className="border-b border-[#EAECF0] px-5 py-4"><h3 className="font-bold text-[#1F2937]">سجل أرباح الدورة</h3><p className="mt-1 text-xs text-[#667085]">القيم المالية كما أرسلها الخادم، وكل عملة معروضة بصورة مستقلة.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-right text-xs">
            <thead className="bg-[#F9FAFB] text-[#667085]">
              <tr>
                {["التاريخ", "إجمالي المبلغ", "عمولة المنصة", "صافي أرباحك", "العملة"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECF0]">
              {transactions.map((item) => {
                return <tr key={item.id}>
                  <td dir="ltr" className="px-4 py-4 text-right">{item.date ? new Date(item.date).toLocaleDateString("ar-EG") : "غير محدد"}</td>
                  <td dir="ltr" className="px-4 py-4 text-right">{money(item.gross, item.currency)}</td>
                  <td dir="ltr" className="px-4 py-4 text-right">{money(item.commission, item.currency)}</td>
                  <td dir="ltr" className="px-4 py-4 text-right font-semibold text-[#123C91]">{money(item.net, item.currency)}</td>
                  <td dir="ltr" className="px-4 py-4 text-right font-semibold">{item.currency}</td>
                </tr>})}
              {!transactions.length && <tr><td colSpan="5" className="px-4 py-10 text-center text-[#98A2B3]">لا توجد أرباح مسجلة لهذه الدورة بعد.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#EAECF0] px-4 py-3 text-xs text-[#667085]">
          <span>إجمالي {result.pagination.total} قيد أرباح</span>
        </div>
      </div>
      </>}
    </div>
  );
};

const ReviewsTab = ({ course, onCourseRefresh }) => (
  <ReviewsPanel course={course} mode="instructor" onCourseRefresh={onCourseRefresh} />
);

const TeacherCourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const submissionRef = useRef(false);
  const [, setLiveStudentCount] = useState(null);
  const [headerStats, setHeaderStats] = useState({ students: null, earnings: [] });

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      fetchTeacherCourseEnrollments(courseId),
      getEarningsCourses({ courseId }),
    ]).then(([studentsResult, earningsResult]) => {
      if (!active) return;
      const students = studentsResult.status === "fulfilled" ? studentsResult.value : null;
      const earnings = earningsResult.status === "fulfilled"
        ? earningsResult.value.filter((item) => !item.id || String(item.id) === String(courseId))
        : [];
      setHeaderStats({
        students: students ? students.filter((item) => !item?.status || item.status === "active").length : null,
        earnings: earnings.map((item) => ({ currency: item.currency, amount: item.net })),
      });
    });
    return () => { active = false; };
  }, [courseId]);

  useEffect(() => {
    let active = true;
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);

    fetchTeacherCourse(courseId)
      .then((result) => {
        if (active && result?.id) setCourse(result);
      })
      .catch(() => { if (active) setCourse(null); })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
    };
  }, [courseId]);

  if (loading && !course) {
    return <TeacherLayout breadcrumbLabels={{ courseId: "تفاصيل الدورة" }}><div dir="rtl" className="rounded-xl bg-white p-10 text-center text-[#667085]">جاري تحميل تفاصيل الدورة...</div></TeacherLayout>;
  }

  if (!course) {
    return <TeacherLayout breadcrumbLabels={{ courseId: "تفاصيل الدورة" }}><div dir="rtl" className="rounded-xl bg-white p-10 text-center"><BookOpen className="mx-auto mb-3 text-[#98A2B3]" /><p className="text-[#667085]">لم يتم العثور على الدورة.</p><Link to="/teacher/courses" className="mt-4 inline-block font-semibold text-[#123C91]">العودة إلى الدورات</Link></div></TeacherLayout>;
  }

  const curriculumWithQuizzes = placeCourseQuizzes(course.curriculum, course.quizzes, (quiz) => ({
      ...quiz,
      id: quiz._id || quiz.id,
      type: "اختبار",
  }));
  const displayCourse = { ...course, curriculum: curriculumWithQuizzes };
  const countedLessons = curriculumWithQuizzes.reduce((sum, section) => sum + section.lessons.filter((lesson) => lesson.type !== "اختبار").length, 0);
  const totalLessons = countedLessons || course.lessons || 0;
  const totalQuizzes = curriculumWithQuizzes.reduce((sum, section) => sum + section.lessons.filter((lesson) => lesson.type === "اختبار").length, 0);
  const uploadedCover = typeof course.cover === "object" ? course.cover.previewUrl || course.cover.dataUrl : "";
  const coverSrc = uploadedCover || course.coverImage || "";
  const canEditCourse = ["draft", "rejected"].includes(course.rawStatus) ||
    (!course.rawStatus && ["مسودة", "مرفوض"].includes(course.status));
  const refreshCourse = async () => {
    const refreshed = await fetchTeacherCourse(courseId);
    setCourse(refreshed);
    return refreshed;
  };
  const submitForReview = async (confirmed = false) => {
    if (submissionRef.current) return;
    submissionRef.current = true;
    if (!confirmed) {
      const approved = await confirmToast({
        title: "إرسال الدورة للمراجعة؟",
        message: "تأكد من حفظ كل تعديلات الدورة وملفاتها أولًا. بعد الإرسال لن تتمكن من تعديلها حتى تراجعها الإدارة.",
        confirmLabel: "إرسال للمراجعة",
      });
      if (!approved) {
        submissionRef.current = false;
        return;
      }
    }
    setSubmitting(true);
    try {
      const requiredTypes = ["instructor_agreement", "course_publishing_policy", "revenue_share_agreement"];
      const response = await getMyPolicyStatus();
      const policyStatus = response?.data?.data ?? response?.data;
      if (requiredTypes.some((type) => policyStatus?.[type]?.required && !policyStatus[type]?.accepted)) {
        setPolicyOpen(true);
        return;
      }
      await submitMarketplaceCourse(course.id);
      try {
        await refreshCourse();
      } catch {
        setCourse((current) => ({ ...current, rawStatus: "pending_review", status: "قيد المراجعة" }));
      }
      toast.success("تم إرسال الدورة للمراجعة بنجاح");
    } catch (error) {
      const apiError = normalizeApiError(error);
      if (apiError.code === "POLICY_ACCEPTANCE_REQUIRED") {
        setPolicyOpen(true);
      } else {
        const details = apiError.errors ? Object.values(apiError.errors).flat().filter(Boolean).join("، ") : "";
        toast.error(details || getApiErrorMessage(error, "تعذر إرسال الدورة للمراجعة"));
      }
    } finally {
      setSubmitting(false);
      submissionRef.current = false;
    }
  };

  return (
    <TeacherLayout breadcrumbLabels={{ courseId: course.title }} currentPageLabel={course.title}>
      <div
        dir="rtl"
        className="min-h-full rounded-xl bg-[#F7F8FC] p-3 pb-10 text-right font-['IBM_Plex_Sans_Arabic'] sm:p-5 sm:pb-12"
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-[#667085]"><Link to="/teacher/courses" className="font-semibold text-[#123C91]">الدورات</Link><ChevronLeft size={13} /><span>تفاصيل الدورة</span></div>
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-[#123C91]">{course.title}</h1><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${courseStatusStyles[course.status] || courseStatusStyles['مسودة']}`}>{course.status}</span></div>
            <p className="mt-2 text-xs text-[#667085]">{course.shortDescription || course.description}</p>
            {course.status === "قيد المراجعة" && (
              <div className="mt-3 rounded-md bg-[#FFF8E6] px-4 py-3 text-sm text-[#A76B00]">هذه الدورة قيد المراجعة من قبل الإدارة. سيظهر إشعار عند اعتماد أو رفض الدورة.</div>
            )}
            {course.status === "مرفوض" && (
              <div className="mt-3 rounded-md border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                <strong className="block">تم رفض الدورة</strong>
                <span>{course.rejectedReason || course.rejectionReason || "يرجى مراجعة بيانات الدورة وإعادة إرسالها."}</span>
                {(course.rejectedDetails || course.rejectionDetails) && <p className="mt-1">{course.rejectedDetails || course.rejectionDetails}</p>}
              </div>
            )}
          </div>
          {canEditCourse && <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => navigate(`/teacher/courses/${course.id}/edit`)} className="rounded-md border border-[#123C91] bg-white px-5 py-2.5 text-sm font-semibold text-[#123C91]">تعديل الدورة</button>
            <button type="button" disabled={submitting} aria-busy={submitting} onClick={() => submitForReview()} className="rounded-md bg-[#123C91] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">{submitting ? "جاري الإرسال..." : course.rawStatus === "rejected" ? "إعادة الإرسال للمراجعة" : "إرسال للمراجعة"}</button>
          </div>}
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <StatCard icon={Users} value={headerStats.students ?? Number(course.students || 0)} label="إجمالي الطلاب" accent="bg-[#EAF2FF] text-[#3567C8]" />
          <StatCard icon={Star} value={Number(course.rating || 0).toFixed(1)} label="التقييم" accent="bg-[#FFF4D8] text-[#F5A623]" />
          <StatCard icon={WalletCards} value={headerStats.earnings.length ? headerStats.earnings.map((item) => money(item.amount, item.currency)).join(" + ") : "—"} label="صافي أرباحك" accent="bg-[#E8FFFC] text-[#12A594]" />
        </div>
        <div className="mb-4"><ModerationHistoryPanel courseId={course.id} /></div>

        <div className="mb-4 overflow-x-auto">
          <nav className="flex min-w-max items-center justify-start gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1">
            {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold transition ${activeTab === id ? "bg-[#1F2937] text-white" : "text-[#667085] hover:bg-[#F2F4F7]"}`}><Icon size={15} />{label}</button>)}
          </nav>
        </div>

        {activeTab === "overview" && <OverviewTab course={displayCourse} coverSrc={coverSrc} totalLessons={totalLessons} totalQuizzes={totalQuizzes} />}
        {activeTab === "curriculum" && <CurriculumTab course={displayCourse} />}
        {activeTab === "instructor" && <InstructorTab course={course} />}
        {activeTab === "students" && <StudentsTab course={course} setStudentCount={setLiveStudentCount} />}
        {activeTab === "reviews" && <ReviewsTab course={course} onCourseRefresh={refreshCourse} />}
        {activeTab === "earnings" && <EarningsTab course={course} />}
      </div>
      <PolicyAcceptanceDialog open={policyOpen} requiredTypes={["instructor_agreement", "course_publishing_policy", "revenue_share_agreement"]} onClose={() => setPolicyOpen(false)} onSatisfied={() => { setPolicyOpen(false); submitForReview(true); }} />
    </TeacherLayout>
  );
};

export default TeacherCourseDetailsPage;
