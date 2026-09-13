import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Check, ChevronDown, ChevronLeft, Clock3, Download, FileText, Globe2, ListChecks, LoaderCircle, LockKeyhole, Maximize2, MessageSquareText, Minimize2, Play, Star, Target, Users, Video } from "lucide-react";
import pythonCover from "../assets/courses/python-course.png";
import { AuthContext } from "../context/AuthContext";
import { enrollFreeCourse, fetchCourseAccess, fetchPublicCourse } from "../features/course-management/api/coursesApi";

import { PlayCircle, X } from 'lucide-react';
import { requestLessonMediaAccess } from '../services/APIService';
import { resolveMediaUrl } from '../services/apiUrl';
import ReviewsPanel from "../features/course-management/components/reviews/ReviewsPanel";
import PolicyAcceptanceDialog from "../components/course/PolicyAcceptanceDialog";
import { getMyPolicyStatus } from "../services/APIService";

export default function CourseDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [accessReason, setAccessReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPromoVideo, setShowPromoVideo] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewMimeType, setPreviewMimeType] = useState('');
  const [previewIsFile, setPreviewIsFile] = useState(false);
  const [previewFileName, setPreviewFileName] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewObjectUrlRef = useRef('');
  const [activeTab, setActiveTab] = useState(() =>
    window.location.hash === "#course-reviews" ? "reviews" : "description",
  );
  const [termsOpen, setTermsOpen] = useState(false);
  const [pendingAcquisition, setPendingAcquisition] = useState("");

  useEffect(() => {
    let active = true;
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    fetchPublicCourse(slug)
      .then(async (item) => {
        if (!active) return;
        setCourse(item);
        if (user && item.id) {
          try {
            const access = await fetchCourseAccess(item.id);
            if (active) {
              setAccessReason(access?.reason || "");
              setEnrolled(access?.reason === "enrollment");
            }
          } catch { /* The public detail remains usable when access lookup is unavailable. */ }
        }
      })
      .catch((err) => active && setError(err?.response?.data?.message || "لم يتم العثور على الدورة."))
      .finally(() => active && setLoading(false));
    return () => { active = false; window.clearTimeout(loadingTimer); };
  }, [slug, user]);

  useEffect(() => () => {
    if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current);
  }, []);

  if (loading) return <PageState><LoaderCircle className="animate-spin" />جاري تحميل تفاصيل الدورة...</PageState>;
  if (error || !course?.id) return <PageState><BookOpen /><span>{error || "لم يتم العثور على الدورة."}</span><Link to="/courses" className="font-bold text-[#123C91]">العودة إلى الدورات</Link></PageState>;

  const sections = course.curriculum || [];
  const lessonsCount = course.lessons || sections.reduce((total, section) => total + section.lessons.length, 0);
  const tabs = [
    { id: "description", label: "عن الدورة", icon: FileText },
    { id: "curriculum", label: "محتوى الدورة", icon: ListChecks },
    ...(course.requirements?.length ? [{ id: "requirements", label: "المتطلبات", icon: Check }] : []),
    ...(course.targetAudience?.length ? [{ id: "audience", label: "لمن هذه الدورة؟", icon: Target }] : []),
    { id: "reviews", label: "التقييمات", icon: MessageSquareText },
  ];
  const openLessonPreview = async (lesson) => {
    if (!lesson.preview) return;
    setPreviewLesson(lesson);
    setPreviewUrl('');
    setPreviewMimeType('');
    setPreviewIsFile(false);
    setPreviewFileName('');
    setPreviewLoading(true);
    try {
      const response = await requestLessonMediaAccess(course.id, lesson.id);
      const data = response?.data?.data ?? response?.data ?? response;
      if (!data?.playbackUrl) throw new Error('PREVIEW_URL_MISSING');
      const ticketUrl = resolveMediaUrl(data.playbackUrl);
      const declaredType = String(data.mimeType || data.contentType || lesson.media?.mimeType || lesson.contentType || lesson.type || '').toLowerCase();
      const isFile = declaredType.startsWith('application/') || declaredType.startsWith('image/') || declaredType.startsWith('text/') || ['document', 'file', 'ملف', 'مستند'].includes(declaredType);
      if (isFile) {
        const fileResponse = await fetch(ticketUrl, { credentials: 'include' });
        if (!fileResponse.ok) throw new Error('FILE_PREVIEW_FAILED');
        const blob = await fileResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        previewObjectUrlRef.current = objectUrl;
        setPreviewUrl(objectUrl);
        setPreviewMimeType(blob.type || data.mimeType || 'application/octet-stream');
        setPreviewFileName(lesson.media?.originalName || lesson.media?.name || lesson.fileName || lesson.title || 'ملف الدرس');
        setPreviewIsFile(true);
      } else {
        setPreviewUrl(ticketUrl);
        setPreviewMimeType(data.mimeType || data.contentType || lesson.media?.mimeType || '');
      }
    } catch (requestError) {
      setPreviewLesson(null);
      toast.error(requestError?.response?.data?.message || 'تعذر تشغيل معاينة الدرس');
    } finally {
      setPreviewLoading(false);
    }
  };
  const closePreview = () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = '';
    }
    setPreviewLesson(null);
    setPreviewUrl('');
    setPreviewMimeType('');
    setPreviewIsFile(false);
    setPreviewFileName('');
  };
  const refreshCourse = async () => {
    const refreshed = await fetchPublicCourse(slug);
    setCourse(refreshed);
    return refreshed;
  };
  const performAcquisition = async (mode) => {
    if (mode === "paid") return navigate(`/payment/courses/${course.slug}`);
    try {
      setSubmitting(true);
      await enrollFreeCourse(course.id);
      setEnrolled(true);
      setCourse((current) => ({ ...current, students: Number(current.students || 0) + 1 }));
      toast.success("تم الاشتراك في الدورة بنجاح");
      navigate("/student-dashboard/courses");
    } catch (requestError) {
      if (requestError?.response?.data?.code === "POLICY_ACCEPTANCE_REQUIRED") { setPendingAcquisition("free"); setTermsOpen(true); }
      else toast.error(requestError?.response?.data?.message || "تعذر الاشتراك في الدورة");
    } finally { setSubmitting(false); }
  };
  const subscribe = async () => {
    if (!user) {
      toast.error("سجّل الدخول أولًا للاشتراك في الدورة");
      navigate("/login", { state: { from: `/courses/${course.slug}` } });
    } else if (accessReason === "admin") navigate(`/admin/courses/${course.id}`);
    else if (accessReason === "instructor") navigate(`/teacher/courses/${course.id}`);
    else if (enrolled) navigate("/student-dashboard/courses");
    else if (course.price > 0) {
      setSubmitting(true);
      try {
        const status = (await getMyPolicyStatus())?.data?.data;
        if (status?.learner_course_terms?.required && !status.learner_course_terms.accepted) { setPendingAcquisition("paid"); setTermsOpen(true); }
        else await performAcquisition("paid");
      } catch (requestError) { toast.error(requestError?.response?.data?.message || "تعذر التحقق من شروط الدورة"); }
      finally { setSubmitting(false); }
    }
    else {
      try {
        setSubmitting(true);
        const status = (await getMyPolicyStatus())?.data?.data;
        if (status?.learner_course_terms?.required && !status.learner_course_terms.accepted) { setPendingAcquisition("free"); setTermsOpen(true); }
        else await performAcquisition("free");
      } catch (requestError) {
        toast.error(requestError?.response?.data?.message || "تعذر التحقق من شروط الدورة");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return <div dir="rtl" className="min-h-screen bg-[#F6F8FB] pb-10 text-[#202936] sm:pb-14">
    <PolicyAcceptanceDialog open={termsOpen} requiredTypes={["learner_course_terms"]} onClose={() => setTermsOpen(false)} onSatisfied={() => { setTermsOpen(false); const mode = pendingAcquisition; setPendingAcquisition(""); performAcquisition(mode); }} />
    <div className="mx-auto max-w-7xl px-3 pt-5 sm:px-5 sm:pt-7">
      <nav className="mb-4 flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-[#8B94A0] sm:text-sm">
        <Link to="/" className="text-[#123C91]">الرئيسية</Link><ChevronLeft size={14} />
        <Link to="/courses" className="text-[#123C91]">الدورات</Link><ChevronLeft size={14} /><span className="truncate">{course.title}</span>
      </nav>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-5">
        <main className="min-w-0 space-y-4">
          <div className="group relative h-[240px] overflow-hidden rounded-2xl bg-[#DCE5F2] shadow-sm sm:h-[360px] lg:h-[430px]">
            <img src={course.coverImage || pythonCover} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]" />
            {course.promoVideoUrl && <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-black/15 opacity-100 transition sm:bg-black/30 sm:opacity-0 sm:group-hover:opacity-100">
              <button type="button" onClick={() => setShowPromoVideo(true)} className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-extrabold text-[#123C91] shadow-xl transition hover:scale-105 hover:bg-white sm:px-5 sm:py-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#123C91] text-white shadow-sm"><Play size={16} className="translate-x-[-1px] fill-current" /></span>تشغيل الفيديو الترويجي</button>
            </div>}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/25 to-transparent px-4 pb-4 pt-16 text-white sm:px-6 sm:pb-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[#123C91]">{course.category || "دورة تعليمية"}</span>
                <span className="rounded-full bg-black/35 px-3 py-1 backdrop-blur-sm">{course.level}</span>
                {!!course.duration && <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-3 py-1 backdrop-blur-sm"><Clock3 size={13} />{course.duration} ساعة</span>}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="overflow-x-auto border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <nav className="flex min-w-max gap-1 p-2" aria-label="أقسام تفاصيل الدورة">
                {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActiveTab(id)} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors ${activeTab === id ? "bg-[#123C91] text-white shadow-sm" : "text-[#667085] hover:bg-white hover:text-[#123C91]"}`} aria-selected={activeTab === id} role="tab"><Icon size={16} />{label}</button>)}
              </nav>
            </div>

            <div className="p-4 sm:p-5">
              {activeTab === "description" && <TabContent title="عن الدورة">
                <p className="whitespace-pre-line text-sm leading-7 text-[#667085] sm:text-base">{course.description || "لا يوجد وصف متاح."}</p>
              </TabContent>}
              {activeTab === "curriculum" && <TabContent title="محتوى الدورة">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[#667085]">استعرض أقسام الدورة والدروس المتاحة داخل كل قسم.</p>
                  <span className="rounded-full bg-[#EEF4FF] px-3 py-1.5 text-xs font-bold text-[#123C91]">{sections.length} قسم · {lessonsCount} درس</span>
                </div>
                {sections.length ? <div className="space-y-3">
                  {sections.map((section, index) => {
                    const sectionLessons = section.lessons || [];
                    const isOpen = openSection === index;
                    return <div key={section.id || index} className={`overflow-hidden rounded-xl border bg-white transition-colors ${isOpen ? "border-[#B9CBEA] shadow-[0_4px_16px_rgba(18,60,145,0.06)]" : "border-[#E2E8F0]"}`}>
                      <button type="button" onClick={() => setOpenSection(isOpen ? -1 : index)} className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition-colors sm:px-5 ${isOpen ? "bg-[#F3F7FD]" : "bg-[#FAFBFC] hover:bg-[#F5F8FC]"}`} aria-expanded={isOpen}>
                        <span className="flex min-w-0 items-center gap-3">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${isOpen ? "bg-[#123C91] text-white" : "bg-[#EAF0F8] text-[#123C91]"}`}>{index + 1}</span>
                          <span className="min-w-0"><strong className="block truncate text-sm text-[#202936] sm:text-base">{section.title || `القسم ${index + 1}`}</strong><small className="mt-0.5 block font-medium text-[#7B8490]">{sectionLessons.length} درس</small></span>
                        </span>
                        <ChevronDown className={`shrink-0 text-[#657080] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} size={19} />
                      </button>
                      {isOpen && <div className="divide-y divide-[#EDF1F5] border-t border-[#E2E8F0]">
                        {sectionLessons.length ? sectionLessons.map((lesson, lessonIndex) => {
                          const isVideo = ["video", "فيديو"].includes(String(lesson.type || lesson.contentType).toLowerCase());
                          const LessonIcon = isVideo ? Video : FileText;
                          return <div key={lesson.id || lessonIndex} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F3F6FA] text-[#536176]"><LessonIcon size={17} /></span>
                              <span className="min-w-0"><strong className="block truncate text-sm font-semibold text-[#344054]">{lesson.title || `الدرس ${lessonIndex + 1}`}</strong><small className="mt-0.5 block text-[#98A2B3]">الدرس {lessonIndex + 1}</small></span>
                            </span>
                            {lesson.preview ? <button type="button" onClick={() => openLessonPreview(lesson)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#E8FFF9] px-3 py-2 text-xs font-bold text-[#087F72] transition hover:bg-[#D5FAF0]"><PlayCircle size={16} />معاينة</button> : <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#F4F6F8] px-2.5 py-2 text-xs font-semibold text-[#7B8490]"><LockKeyhole size={14} /><span className="hidden sm:inline">مغلق</span></span>}
                          </div>;
                        }) : <p className="px-5 py-4 text-sm text-[#7B8490]">لا توجد دروس في هذا القسم حاليًا.</p>}
                      </div>}
                    </div>;
                  })}
                </div> : <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFBFC] px-5 py-8 text-center text-sm text-[#667085]"><BookOpen className="mx-auto mb-2 text-[#98A2B3]" size={24} />لا يوجد محتوى متاح حاليًا.</div>}
              </TabContent>}
              {activeTab === "requirements" && <TabContent title="المتطلبات"><List items={course.requirements} /></TabContent>}
              {activeTab === "audience" && <TabContent title="لمن هذه الدورة؟"><List items={course.targetAudience} /></TabContent>}
              {activeTab === "reviews" && <ReviewsPanel course={course} user={user} onCourseRefresh={refreshCourse} />}
            </div>
          </div>
        </main>
        <aside className="order-first overflow-hidden rounded-2xl border border-[#DCE3EC] bg-white shadow-[0_10px_30px_rgba(18,60,145,0.08)] lg:order-none lg:sticky lg:top-4">
          <div className="border-b border-[#EDF1F5] p-5">
            <span className="mb-2 inline-flex rounded-full bg-[#EAF2FF] px-2.5 py-1 text-[11px] font-bold text-[#123C91]">{course.classification || course.category}</span>
            <h1 className="text-xl font-extrabold leading-8 text-[#17213A] sm:text-2xl">{course.title}</h1>
            {course.shortDescription && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667085]">{course.shortDescription}</p>}
          </div>

          <div className="p-5">
            {course.instructorSlug ? <Link to={`/instructors/${course.instructorSlug}`} className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3 transition hover:bg-[#EEF4FF]"><InstructorAvatar course={course} /><span><small className="block text-[#98A2B3]">المحاضر</small><strong className="text-sm text-[#123C91]">{course.instructor}</strong></span></Link> : <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3"><InstructorAvatar course={course} /><span><small className="block text-[#98A2B3]">المحاضر</small><strong className="text-sm text-[#344054]">{course.instructor}</strong></span></div>}

            <div className="my-4 flex items-end justify-between border-y border-[#EDF1F5] py-4">
              <div><small className="block text-[#8B95A1]">سعر الدورة</small><strong className="mt-1 block text-2xl text-[#123C91]">{course.pricingType === "free" || !course.price ? "مجاني" : `${Number(course.effectivePrice ?? course.price).toLocaleString("ar-EG")} ج.م`}</strong>{course.price > (course.effectivePrice ?? course.price) && <span className="text-xs text-[#98A2B3] line-through">{Number(course.price).toLocaleString("ar-EG")} ج.م</span>}</div>
              <div className="text-left"><div className="inline-flex items-center gap-1 font-bold text-[#F5A623]"><Star size={17} className="fill-current" />{course.ratingCount ? Number(course.averageRating || 0).toFixed(1) : "—"}</div><small className="block text-[#98A2B3]">{course.ratingCount ? `${Number(course.ratingCount).toLocaleString("ar-EG")} تقييم` : "بدون تقييمات"}</small></div>
            </div>

            <ul className="mb-5 grid grid-cols-2 gap-2 text-sm text-[#5F6A78]">
              <CourseFact icon={Users} value={`${Number(course.students || 0).toLocaleString("ar-EG")} طالب`} />
              <CourseFact icon={BookOpen} value={`${lessonsCount} درس`} />
              <CourseFact icon={Clock3} value={course.duration ? `${course.duration} ساعة` : "المدة غير محددة"} />
              <CourseFact icon={Globe2} value={course.language || "غير محددة"} />
              <CourseFact icon={Check} value={course.level || "كل المستويات"} />
            </ul>
            <button type="button" onClick={subscribe} disabled={submitting} className="h-12 w-full rounded-xl bg-[#123C91] text-sm font-bold text-white shadow-sm transition hover:bg-[#0E3279] disabled:opacity-60">{submitting ? "جاري التنفيذ..." : accessReason === "admin" ? "إدارة الدورة" : accessReason === "instructor" ? "إدارة دورتي" : enrolled ? "اذهب إلى دوراتي" : course.price > 0 ? "اشترك في الدورة" : "ابدأ الدورة مجانًا"}</button>
          </div>
        </aside>
      </div>
    </div>
    {previewLesson && previewIsFile && !previewLoading ? <FilePreviewViewer lesson={previewLesson} url={previewUrl} mimeType={previewMimeType} fileName={previewFileName} onClose={closePreview} /> : previewLesson && <div className={'fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4'} onClick={(event) => event.target === event.currentTarget && closePreview()}>
      <div className={'w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl'}>
        <div className={'flex items-center justify-between border-b px-5 py-4'}>
          <div><p className={'text-xs font-bold text-[#0A9B72]'}>معاينة مجانية</p><h2 className={'mt-1 font-extrabold'}>{previewLesson.title}</h2></div>
          <button type={'button'} onClick={closePreview} aria-label={'إغلاق المعاينة'} className={'grid h-9 w-9 place-items-center rounded-lg bg-gray-100'}><X size={18} /></button>
        </div>
        <LessonPreviewContent lesson={previewLesson} url={previewUrl} mimeType={previewMimeType} loading={previewLoading} />
        {previewLesson.description && <p className={'px-5 py-4 text-sm leading-7 text-[#667085]'}>{previewLesson.description}</p>}
      </div>
    </div>}
    {showPromoVideo && <PromoVideoViewer title={course.title} url={resolveMediaUrl(course.promoVideoUrl)} onClose={() => setShowPromoVideo(false)} />}
  </div>;
}

function PageState({ children }) { return <div dir="rtl" className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#F6F8FB] text-[#667085]">{children}</div>; }
function TabContent({ title, children }) { return <div role="tabpanel"><h2 className="mb-3 text-lg font-extrabold">{title}</h2>{children}</div>; }
function List({ items }) { return <ul className="space-y-2 text-sm leading-6 text-[#667085] sm:text-base">{items.map((item) => <li key={item} className="flex gap-2"><Check size={17} className="mt-1 shrink-0 text-[#12AFA0]" />{item}</li>)}</ul>; }
function CourseFact({ icon: Icon, value }) { return <li className="flex min-w-0 items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-2.5"><Icon size={16} className="shrink-0 text-[#123C91]" /><span className="truncate">{value}</span></li>; }
function InstructorAvatar({ course }) { const image = course.instructorDetails?.profileImage || course.instructorDetails?.avatar; return image ? <img src={image} alt={course.instructor} className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-linear-to-br from-[#12C6B0] to-[#123C91] font-bold text-white">{course.instructor?.charAt(0) || "م"}</span>; }

function LessonPreviewContent({ lesson, url, mimeType, loading }) {
  const normalizedMime = String(mimeType || "").toLowerCase();
  const normalizedType = String(lesson.contentType || lesson.type || "").toLowerCase();
  const fileName = String(lesson.media?.originalName || lesson.media?.name || lesson.fileName || url || "").toLowerCase().split("?")[0];
  const isVideo = normalizedMime.startsWith("video/") || (!normalizedMime && (["video", "فيديو"].includes(normalizedType) || /\.(mp4|webm|ogg|mov|m4v)$/.test(fileName)));
  const isAudio = normalizedMime.startsWith("audio/") || (!normalizedMime && (["audio", "صوت"].includes(normalizedType) || /\.(mp3|wav|m4a|aac|flac)$/.test(fileName)));
  const isImage = normalizedMime.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/.test(fileName);
  const isPdf = normalizedMime === "application/pdf" || /\.pdf$/.test(fileName);

  if (loading || !url) return <div className="grid aspect-video place-items-center bg-[#111827] text-white"><LoaderCircle className="animate-spin" size={32} /></div>;
  if (isVideo) return <div className="aspect-video bg-black"><video src={url} crossOrigin="use-credentials" controls autoPlay className="h-full w-full" /></div>;
  if (isAudio) return <div className="flex min-h-48 items-center justify-center bg-[#F4F7FB] p-6"><audio src={url} crossOrigin="use-credentials" controls autoPlay className="w-full max-w-xl" /></div>;
  if (isImage) return <div className="flex max-h-[65vh] items-center justify-center overflow-auto bg-[#F4F7FB] p-4"><img src={url} alt={lesson.title || "معاينة الدرس"} className="max-h-[60vh] max-w-full rounded-lg object-contain" /></div>;
  if (isPdf) return <iframe src={url} title={lesson.title || "معاينة ملف الدرس"} className="h-[65vh] w-full bg-white" />;
  return <div className="flex min-h-56 flex-col items-center justify-center gap-3 bg-[#F4F7FB] p-6 text-center"><FileText size={36} className="text-[#123C91]" /><p className="text-sm text-[#667085]">هذا الدرس يحتوي على ملف للمعاينة.</p><a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-[#123C91] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0E3279]">فتح الملف</a></div>;
}

function FilePreviewViewer({ lesson, url, mimeType, fileName, onClose }) {
  const viewerRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const isImage = String(mimeType).toLowerCase().startsWith("image/");

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
    if (!viewerRef.current) return;
    if (document.fullscreenElement === viewerRef.current) await document.exitFullscreen();
    else await viewerRef.current.requestFullscreen();
  };

  return <div className="fixed inset-0 z-[110] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={lesson.title} onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <div ref={viewerRef} className={`flex w-full flex-col overflow-hidden border border-white/15 bg-[#081A3A] shadow-2xl ${fullscreen ? "h-screen max-w-none rounded-none border-0" : "max-w-5xl rounded-2xl"}`}>
      <header className="flex items-center justify-between gap-3 bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white sm:px-5">
        <div className="min-w-0"><p className="text-[10px] text-[#8FE3D8]">معاينة ملف الدرس</p><h2 className="truncate text-sm font-bold sm:text-base">{lesson.title}</h2></div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={toggleFullscreen} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20"><span className="hidden sm:inline">{fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}</span>{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <a href={url} download={fileName} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"><span className="hidden sm:inline">تنزيل</span><Download size={16} /></a>
          <button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="إغلاق"><X size={18} /></button>
        </div>
      </header>
      <div className={`min-h-0 bg-[#050B17] p-2 sm:p-4 ${fullscreen ? "flex-1" : ""}`}>
        {isImage ? <img src={url} alt={lesson.title} className={fullscreen ? "h-full w-full bg-white object-contain" : "mx-auto max-h-[75vh] max-w-full rounded-lg bg-white object-contain"} /> : <iframe src={url} title={lesson.title} className={`${fullscreen ? "h-full" : "h-[75vh] rounded-lg"} w-full bg-white`} />}
      </div>
    </div>
  </div>;
}

function PromoVideoViewer({ title, url, onClose }) {
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

  return <div className="fixed inset-0 z-[120] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="الفيديو الترويجي" onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <div ref={viewerRef} className={`flex w-full flex-col overflow-hidden border border-white/15 bg-[#081A3A] shadow-2xl ${fullscreen ? "h-screen max-w-none rounded-none border-0" : "max-w-5xl rounded-2xl"}`}>
      <header className="flex items-center justify-between gap-3 bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white sm:px-5">
        <div className="min-w-0"><p className="text-[10px] text-[#8FE3D8]">الفيديو الترويجي</p><h2 className="truncate text-sm font-bold sm:text-base">{title}</h2></div>
        <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={toggleFullscreen} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/20">{fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}<span className="hidden sm:inline">{fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}</span></button><button type="button" onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="إغلاق"><X size={18} /></button></div>
      </header>
      <div className={`min-h-0 bg-black ${fullscreen ? "flex flex-1 items-center" : ""}`}><video src={url} controls controlsList="nodownload" autoPlay playsInline className={`${fullscreen ? "h-full max-h-screen" : "aspect-video"} w-full bg-black object-contain`}>متصفحك لا يدعم تشغيل الفيديو.</video></div>
    </div>
  </div>;
}
