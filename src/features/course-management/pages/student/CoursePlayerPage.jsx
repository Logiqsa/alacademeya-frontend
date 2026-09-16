import { useContext, useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, ChevronDown, ChevronLeft, Download, ExternalLink, Eye, FileText, LoaderCircle, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, Paperclip, PlayCircle, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../../../../components/student/layout/StudentLayout';
import TeacherLayout from '../../../../components/teacher/layout/TeacherLayout';
import { AuthContext } from '../../../../context/AuthContext';
import { claimCourseCertificate, completeCourseLesson, getCourseLearningView, requestLessonAttachmentAccess, requestLessonMediaAccess, updateCourseLessonProgress } from '../../../../services/APIService';
import { resolveMediaUrl } from '../../../../services/apiUrl';
import { hasApiErrorCode, normalizeApiError } from '../../../../services/apiError';
import { CircleHelp } from 'lucide-react';
import ProtectedContentWatermark from '../../../../components/course/ProtectedContentWatermark';
import InlineCourseQuiz from '../../../../components/course/InlineCourseQuiz';
import BrandMediaPlayer from '../../../../components/media/BrandMediaPlayer';
import { getProtectedContentIdentity } from '../../../../utils/protectedContentIdentity';
import { isInstructor } from '../../../../utils/roles';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const titleOf = (value) => value?.ar || value?.en || value || 'الدورة';
const mediaTypeOf = (lesson = {}) => {
  const raw = String(
    lesson.contentType ||
      lesson.mediaType ||
      lesson.type ||
      lesson.media?.type ||
      lesson.media?.mimeType ||
      lesson.mimeType ||
      '',
  ).toLowerCase();
  if (raw.includes('audio') || raw.includes('صوت')) return 'audio';
  if (raw.includes('document') || raw.includes('pdf') || raw.includes('ملف') || raw.includes('مستند')) return 'document';
  return 'video';
};

export default function CoursePlayerPage() {
  const { user } = useContext(AuthContext);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaLessonId, setMediaLessonId] = useState('');
  const [mediaMimeType, setMediaMimeType] = useState('');
  const [openSection, setOpenSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [working, setWorking] = useState(false);
  const [openingAttachmentId, setOpeningAttachmentId] = useState('');
  const [attachmentViewer, setAttachmentViewer] = useState(null);
  const [inlineAttachment, setInlineAttachment] = useState(null);
  const [activeQuizId, setActiveQuizId] = useState('');
  const [contentCollapsed, setContentCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mediaRef = useRef(null);
  const playerFrameRef = useRef(null);
  const lastSavedPositionRef = useRef(0);
  const mediaRefreshRef = useRef(0);
  const pendingResumePositionRef = useRef(null);
  const instructorView = user?.role === 'teacher' || isInstructor(user);
  const learnerOnly = user?.role === 'user' && !isInstructor(user);
  const Layout = instructorView ? TeacherLayout : StudentLayout;
  const layoutProps = instructorView ? {} : { marketplaceOnly: learnerOnly };
  const libraryPath = instructorView
    ? '/teacher/my-courses'
    : learnerOnly
      ? '/learner-dashboard'
      : '/student-dashboard/courses';

  const load = async () => {
    const data = unwrap(await getCourseLearningView(courseId));
    setView(data);
    setCurrentLesson((current) => {
      if (current) return data.curriculum?.flatMap((section) => section.lessons || []).find((lesson) => lesson.id === current.id) || current;
      const allLessons = data.curriculum?.flatMap((section) => section.lessons || []) || [];
      return allLessons.find((lesson) => lesson.id === data.progress?.lastLessonId) || allLessons[0] || null;
    });
    return data;
  };

  useEffect(() => {
    let active = true;
    getCourseLearningView(courseId)
      .then((response) => {
        if (!active) return;
        const data = unwrap(response);
        const allLessons = data.curriculum?.flatMap((section) => section.lessons || []) || [];
        setView(data);
        setCurrentLesson(allLessons.find((lesson) => lesson.id === data.progress?.lastLessonId) || allLessons[0] || null);
      })
      .catch((error) => {
        if (!active) return;
        const apiError = normalizeApiError(error);
        setLoadError(apiError);
        toast.error(apiError.message || 'لا يمكنك فتح محتوى هذه الدورة');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId]);

  useEffect(() => {
    mediaRefreshRef.current = 0;
    lastSavedPositionRef.current = Number(currentLesson?.progress?.lastPositionSeconds || 0);
    if (!view?.course?.id || !currentLesson?.id) return;
    let active = true;
    requestLessonMediaAccess(view.course.id, currentLesson.id).then((response) => {
      const data = unwrap(response);
      const url = data?.playbackUrl;
      if (active && url) {
        setMediaUrl(resolveMediaUrl(url));
        setMediaLessonId(currentLesson.id);
        setMediaMimeType(String(data?.mimeType || ''));
      }
    }).catch((error) => toast.error(error?.response?.data?.message || 'تعذر تشغيل محتوى الدرس'));
    return () => { active = false; };
  }, [currentLesson?.id, currentLesson?.progress?.lastPositionSeconds, view?.course?.id]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await playerFrameRef.current?.requestFullscreen();
    } catch {
      toast.error('تعذر تشغيل وضع ملء الشاشة في هذا المتصفح');
    }
  };

  const refreshExpiredMedia = async () => {
    if (!view?.course?.id || !currentLesson?.id || mediaRefreshRef.current >= 1) return;
    mediaRefreshRef.current += 1;
    pendingResumePositionRef.current = Number(mediaRef.current?.currentTime || lastSavedPositionRef.current || 0);
    try {
      const data = unwrap(await requestLessonMediaAccess(view.course.id, currentLesson.id));
      const url = data?.playbackUrl;
      if (url) {
        setMediaUrl(resolveMediaUrl(url));
        setMediaLessonId(currentLesson.id);
        setMediaMimeType(String(data?.mimeType || ''));
      }
    } catch (error) {
      toast.error(hasApiErrorCode(error, 'MEDIA_PLAYBACK_SESSION_EXPIRED') ? 'انتهت صلاحية جلسة الوسائط. أعد المحاولة.' : error?.response?.data?.message || 'تعذر تجديد جلسة محتوى الدرس');
    }
  };

  const fetchAttachmentBlob = async (url) => {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('ATTACHMENT_DOWNLOAD_FAILED');
    return response.blob();
  };

  const saveAttachmentBlob = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const getAttachmentAccess = async (attachment, lesson) => {
    const attachmentId = attachment?.id || attachment?._id;
    const lessonId = lesson?.id || lesson?._id;
    if (!attachmentId || !lessonId || openingAttachmentId) return;
    setOpeningAttachmentId(attachmentId);
    try {
      const data = unwrap(await requestLessonAttachmentAccess(view.course.id, lessonId, attachmentId));
      if (!data?.playbackUrl) throw new Error('ATTACHMENT_URL_MISSING');
      return {
        ...data,
        url: resolveMediaUrl(data.playbackUrl),
        mimeType: String(data.mimeType || attachment.mimeType || ''),
        name: attachment.originalName || attachment.name || 'مرفق الدرس',
      };
    } catch (error) {
      toast.error(error?.response?.data?.message || 'تعذر فتح مرفق الدرس');
    } finally {
      setOpeningAttachmentId('');
    }
  };

  const downloadAttachment = async (attachment, lesson = currentLesson) => {
    const access = await getAttachmentAccess(attachment, lesson);
    if (!access || access.accessMode === 'view_only') return;
    try {
      const blob = await fetchAttachmentBlob(access.url);
      saveAttachmentBlob(blob, access.name);
      toast.success('بدأ تنزيل الملف');
    } catch {
      toast.error('تعذر تنزيل مرفق الدرس');
    }
  };

  const openAttachment = async (attachment, lesson = currentLesson) => {
    const access = await getAttachmentAccess(attachment, lesson);
    if (!access) return;
    const isImage = access.mimeType.startsWith('image/');
    if (access.accessMode !== 'view_only' && !isImage) {
      try {
        const blob = await fetchAttachmentBlob(access.url);
        saveAttachmentBlob(blob, access.name);
      } catch {
        toast.error('تعذر تنزيل مرفق الدرس');
      }
      return;
    }
    try {
      const blob = isImage ? await fetchAttachmentBlob(access.url) : null;
      const viewer = {
        ...access,
        url: blob ? URL.createObjectURL(blob) : access.url,
        objectUrl: Boolean(blob),
        downloadable: access.accessMode !== 'view_only',
        inline: isImage,
      };
      if (isImage) {
        setActiveQuizId('');
        setInlineAttachment(viewer);
      } else setAttachmentViewer(viewer);
    } catch {
      toast.error('تعذر عرض مرفق الدرس');
    }
  };

  const closeAttachmentViewer = () => {
    if (attachmentViewer?.objectUrl) URL.revokeObjectURL(attachmentViewer.url);
    setAttachmentViewer(null);
  };

  const closeInlineAttachment = () => {
    if (inlineAttachment?.objectUrl) URL.revokeObjectURL(inlineAttachment.url);
    setInlineAttachment(null);
  };

  const isImageAttachment = (attachment = {}) => {
    const mimeType = String(attachment.mimeType || '').toLowerCase();
    const name = String(attachment.originalName || attachment.name || '').toLowerCase();
    return mimeType.startsWith('image/') || /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/.test(name);
  };

  const savePosition = async (position, force = false) => {
    if (!view?.course?.id || !currentLesson?.id || mediaTypeOf(currentLesson) === 'document') return;
    const seconds = Math.max(0, Number(position || 0));
    if (!force && Math.abs(seconds - lastSavedPositionRef.current) < 10) return;
    lastSavedPositionRef.current = seconds;
    try {
      await updateCourseLessonProgress(view.course.id, currentLesson.id, { lastPositionSeconds: seconds });
    } catch {
      // Background resume-position updates must not interrupt playback.
    }
  };

  const restorePosition = (event) => {
    mediaRefreshRef.current = 0;
    const savedPosition = Number(pendingResumePositionRef.current ?? currentLesson?.progress?.lastPositionSeconds ?? 0);
    pendingResumePositionRef.current = null;
    const duration = Number(event.currentTarget.duration || currentLesson?.durationSeconds || 0);
    if (savedPosition > 0 && (!duration || savedPosition < duration)) event.currentTarget.currentTime = savedPosition;
  };

  const progress = Number(view?.progress?.progressPercentage ?? view?.progress?.percentage ?? 0);

  const completeLesson = async () => {
    if (!currentLesson || working) return;
    setWorking(true);
    try {
      await completeCourseLesson(view.course.id, currentLesson.id);
      const updated = await load();
      const all = updated.curriculum?.flatMap((section) => section.lessons || []) || [];
      const index = all.findIndex((lesson) => lesson.id === currentLesson.id);
      if (all[index + 1]) setCurrentLesson(all[index + 1]);
      toast.success('تم إكمال الدرس');
    } catch (error) { toast.error(error?.response?.data?.message || 'تعذر إكمال الدرس'); }
    finally { setWorking(false); }
  };

  const claimCertificate = async () => {
    setWorking(true);
    try { await claimCourseCertificate(view.course.id); navigate(`/certificate/${view.course.id}`); }
    catch (error) { toast.error(error?.response?.data?.message || 'أكمل جميع الدروس والاختبارات أولاً'); }
    finally { setWorking(false); }
  };

  if (loading) return <Layout {...layoutProps}><div className='grid min-h-[60vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div></Layout>;
  if (!view) return <Layout {...layoutProps}><div dir='rtl' className='p-10 text-center'><h1 className='text-xl font-bold'>{loadError?.code === 'COURSE_ACCESS_REVOKED' ? 'تم سحب الوصول إلى هذه الدورة' : 'تعذر تحميل الدورة'}</h1><p className='mt-2 text-sm text-gray-500'>{loadError?.message}</p><Link to={libraryPath} className='mt-5 inline-block font-bold text-[#123C91]'>العودة إلى دوراتي</Link></div></Layout>;

  const currentMediaType = mediaTypeOf(currentLesson);
  const activeMediaUrl = mediaLessonId === currentLesson?.id ? mediaUrl : '';
  const poster = resolveMediaUrl(currentLesson?.thumbnailUrl || currentLesson?.posterUrl || currentLesson?.previewImage || view.course?.coverImage || '');
  const watermarkIdentity = getProtectedContentIdentity(user);
  const isLearnerPlayback = !['teacher', 'admin', 'super-admin'].includes(user?.role);
  const isPdf = currentMediaType === 'document' && mediaMimeType.toLowerCase() === 'application/pdf';
  const selectLesson = (lesson) => {
    closeInlineAttachment();
    setActiveQuizId('');
    setCurrentLesson(lesson);
  };
  const renderQuizButton = (quiz) => {
    const quizId = quiz.id || quiz._id;
    return <button key={quizId} type='button' onClick={() => { closeInlineAttachment(); setActiveQuizId(quizId); }} className={`flex w-full items-center gap-2 border-t border-[#EDF1F5] px-4 py-3 text-right text-xs font-bold transition ${activeQuizId === quizId ? 'bg-[#EAF2FF] text-[#123C91]' : 'bg-[#F8FAFD] text-[#536176] hover:bg-[#EEF4FF] hover:text-[#123C91]'}`}><span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E8EFFF] text-[#123C91]'><CircleHelp size={15} /></span><span className='min-w-0 flex-1 truncate'>{quiz.title}</span>{quiz.passed ? <span className='shrink-0 rounded-full bg-[#DDF8F2] px-2 py-1 text-[10px] font-extrabold text-[#078C79]'>ناجح</span> : quiz.attemptsRemaining === 0 && <span className='shrink-0 rounded-full bg-[#FFF3DD] px-2 py-1 text-[10px] font-extrabold text-[#A96410]'>انتهى</span>}</button>;
  };
  const renderCurriculumLesson = (lesson) => {
    const downloadableAttachments = (lesson.attachments || []).filter(
      (attachment) => (attachment.accessMode || 'downloadable') === 'downloadable',
    );

    return <div key={lesson.id} className='border-t border-[#EDF1F5] bg-white'>
      <button onClick={() => selectLesson(lesson)} className={'flex w-full items-center gap-3 px-4 py-3.5 text-right text-sm transition ' + (currentLesson?.id === lesson.id ? 'bg-[#EAF2FF] font-bold text-[#123C91]' : 'text-[#536176] hover:bg-[#F8FAFD]')}>
        {lesson.progress?.status === 'completed' ? <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#DDF8F2]'><CheckCircle2 size={16} className='text-[#08A88F]' /></span> : lesson.contentType === 'document' ? <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FFF3DD]'><FileText size={15} className='text-[#D98A13]' /></span> : <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E8EFFF]'><PlayCircle size={16} className='text-[#245DC0]' /></span>}
        <span className='min-w-0 flex-1 break-words'>{lesson.title}</span>
        {lesson.progress?.status === 'completed' && <span className='shrink-0 rounded-full bg-[#DDF8F2] px-2 py-1 text-[10px] font-extrabold text-[#078C79]'>مكتمل</span>}
      </button>
      {!!downloadableAttachments.length && <div className='space-y-1 border-t border-dashed border-[#E3E9F1] bg-[#FAFCFF] px-3 py-2'>
        {downloadableAttachments.map((attachment) => {
          const attachmentId = attachment.id || attachment._id;
          const attachmentName = attachment.originalName || attachment.name || 'ملف الدرس';
          const imageAttachment = isImageAttachment(attachment);
          return <div key={attachmentId} className='flex items-center gap-1 rounded-lg transition hover:bg-[#EAF2FF]'>
            <button type='button' onClick={() => openAttachment(attachment, lesson)} disabled={!!openingAttachmentId} title={imageAttachment ? `عرض ${attachmentName}` : `تنزيل ${attachmentName}`} className='flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-right text-xs font-bold text-[#123C91] disabled:cursor-wait disabled:opacity-60'>
              {openingAttachmentId === attachmentId ? <LoaderCircle size={15} className='shrink-0 animate-spin' /> : imageAttachment ? <Eye size={15} className='shrink-0' /> : <Download size={15} className='shrink-0' />}
              <span className='min-w-0 flex-1 truncate'>{attachmentName}</span>
              <span className='shrink-0 text-[10px] font-semibold text-[#667085]'>{imageAttachment ? 'عرض' : 'تنزيل'}</span>
            </button>
            {imageAttachment && <button type='button' onClick={() => downloadAttachment(attachment, lesson)} disabled={!!openingAttachmentId} aria-label={`تنزيل ${attachmentName}`} title={`تنزيل ${attachmentName}`} className='mx-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#D7E2F3] bg-white text-[#123C91] transition hover:bg-[#123C91] hover:text-white disabled:opacity-60'><Download size={14} /></button>}
          </div>;
        })}
      </div>}
      {lesson.quizzes?.map(renderQuizButton)}
    </div>;
  };

  return <Layout {...layoutProps}><div dir='rtl' className='min-h-full rounded-2xl bg-[#F4F7FB] p-2 text-[#202936] sm:p-3 lg:p-4'>
    <div className='mx-auto max-w-[1450px]'><div className='mb-6 overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] via-[#174BAE] to-[#116B91] px-5 py-5 text-white shadow-[0_12px_30px_rgba(18,60,145,0.18)] sm:px-7'>
      <nav className='mb-3 flex items-center gap-2 text-xs text-white/75'><Link to={libraryPath} className='font-bold !text-white transition hover:opacity-80'>دوراتي</Link><ChevronLeft size={14} /><span className='truncate'>{titleOf(view.course.title)}</span></nav>
      <div className='flex flex-wrap items-end justify-between gap-4'><div><span className='mb-2 block text-xs font-semibold text-[#8EF0E3]'>أنت تتعلم الآن</span><h1 className='text-xl font-extrabold sm:text-2xl'>{titleOf(view.course.title)}</h1></div><div className='min-w-44 rounded-xl bg-white/10 px-4 py-3 backdrop-blur'><div className='mb-2 flex justify-between text-xs'><span>تقدم الدورة</span><b dir='ltr'>{Math.round(progress)}%</b></div><div className='h-2 overflow-hidden rounded-full bg-white/20'><div className='h-full rounded-full bg-[#26D6C1] transition-all duration-500' style={{ width: `${progress}%` }} /></div></div></div>
    </div>
      <div className={`grid items-start gap-3 ${contentCollapsed ? 'xl:grid-cols-[minmax(0,1fr)]' : 'xl:grid-cols-[340px_minmax(0,1fr)]'}`}>
        {!contentCollapsed && <aside className='order-2 overflow-hidden rounded-2xl border border-[#DCE4EF] bg-white shadow-[0_8px_24px_rgba(31,41,55,0.06)] xl:order-1 xl:sticky xl:top-3'><div className='border-b border-[#E8EDF4] bg-[#FAFBFD] px-4 py-3.5'><div className='flex items-center justify-between gap-3'><div className='flex min-w-0 items-center gap-2'><button type='button' onClick={() => setContentCollapsed(true)} className='grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#DCE4EF] bg-white text-[#123C91] transition hover:bg-[#EAF2FF]' aria-label='طي محتوى الدورة' title='طي محتوى الدورة'><PanelRightClose size={17} /></button><h2 className='truncate font-extrabold text-[#182338]'>محتوى الدورة</h2></div><b className='rounded-full bg-[#E7F8F5] px-2.5 py-1 text-xs text-[#089E8C]' dir='ltr'>{Math.round(progress)}%</b></div></div>
          <div className='max-h-[calc(100vh-260px)] overflow-y-auto p-3'>{view.curriculum?.map((section, index) => <div key={section.id} className='mb-2 overflow-hidden rounded-xl border border-[#E2E8F0]'><button onClick={() => setOpenSection(openSection === index ? -1 : index)} className='flex w-full items-center justify-between bg-[#F8FAFD] px-4 py-3.5 text-right text-sm font-extrabold text-[#26344B] transition hover:bg-[#EFF4FA]'>{section.title}<ChevronDown size={17} className={`shrink-0 text-[#667085] transition-transform ${openSection === index ? 'rotate-180' : ''}`} /></button>{openSection === index && <>{section.lessons?.map(renderCurriculumLesson)}{index === view.curriculum.length - 1 && view.quizzes?.map(renderQuizButton)}</>}</div>)}</div>
        </aside>}
        <main className='order-1 min-w-0 xl:order-2'>
          <div className='mb-2 flex items-center justify-between gap-2'>{contentCollapsed ? <button type='button' onClick={() => setContentCollapsed(false)} className='inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE4EF] bg-white px-3 text-xs font-bold text-[#123C91] shadow-sm transition hover:bg-[#EAF2FF]'><PanelRightOpen size={17} />إظهار محتوى الدورة</button> : <span />}</div>
          <div ref={playerFrameRef} onContextMenu={(event) => event.preventDefault()} className='group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#080B12] text-white shadow-[0_14px_36px_rgba(15,23,42,0.22)] fullscreen:aspect-auto fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none fullscreen:border-0'>
            <button type='button' onClick={toggleFullscreen} className='absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-xl bg-black/65 text-white opacity-90 backdrop-blur transition hover:bg-[#123C91] focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100' aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'عرض بملء الشاشة'} title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}>{isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</button>
            {!activeQuizId && activeMediaUrl && isLearnerPlayback && <ProtectedContentWatermark {...watermarkIdentity} />}
            {activeQuizId ? <InlineCourseQuiz key={activeQuizId} courseId={view.course.id} quizId={activeQuizId} onClose={() => setActiveQuizId('')} onCompleted={load} onCompleteLesson={isLearnerPlayback && currentLesson?.id && currentLesson.progress?.status !== 'completed' && !working ? () => { setActiveQuizId(''); completeLesson(); } : null} /> : inlineAttachment ? <div className='relative flex h-full w-full items-center justify-center bg-[#050B17] p-3 sm:p-6'><img src={inlineAttachment.url} alt={inlineAttachment.name} className='max-h-full max-w-full rounded-lg object-contain' /><div className='absolute left-3 top-3 z-20 flex items-center gap-2'>{inlineAttachment.downloadable && <a href={inlineAttachment.url} download={inlineAttachment.name} className='inline-flex h-10 items-center gap-2 rounded-xl bg-[#123C91] px-4 text-xs font-bold !text-white shadow-lg transition hover:bg-[#1750B4]'><Download size={16} />تنزيل الصورة</a>}<button type='button' onClick={closeInlineAttachment} className='grid h-10 w-10 place-items-center rounded-xl bg-black/65 text-white transition hover:bg-[#123C91]' aria-label='إغلاق الصورة' title='العودة إلى الدرس'><X size={18} /></button></div></div> : !activeMediaUrl ? <div className='text-center'><LoaderCircle className='mx-auto animate-spin text-[#26D6C1]' size={30} /><p className='mt-3 text-xs text-white/65'>جاري تجهيز محتوى الدرس...</p></div> : ['video', 'audio'].includes(currentMediaType) ? <BrandMediaPlayer ref={mediaRef} key={activeMediaUrl} type={currentMediaType} src={activeMediaUrl} poster={poster || undefined} className='h-full w-full' onToggleFullscreen={toggleFullscreen} onError={refreshExpiredMedia} onLoadedMetadata={restorePosition} onPlay={(event) => savePosition(event.currentTarget.currentTime, true)} onTimeUpdate={(event) => savePosition(event.currentTarget.currentTime)} onPause={(event) => savePosition(event.currentTarget.currentTime, true)} onEnded={completeLesson} /> : isPdf ? <iframe src={`${activeMediaUrl}#toolbar=0&navpanes=0`} title={currentLesson?.title || 'ملف الدرس'} className='h-full w-full bg-white' /> : <div className='mx-4 w-full max-w-md rounded-2xl border border-white/15 bg-white/8 p-6 text-center shadow-2xl backdrop-blur-sm sm:p-8'><span className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#123C91] shadow-lg'><FileText size={30} /></span><h2 className='mt-4 line-clamp-2 text-lg font-extrabold text-white'>{currentLesson?.title || 'ملف الدرس'}</h2><p className='mt-2 text-sm leading-6 text-white/65'>هذا التنسيق لا يملك عارضًا آمنًا داخل المتصفح في المرحلة الحالية. يمكنك فتحه عبر الطلب المحمي المؤقت.</p><a href={activeMediaUrl} target='_blank' rel='noopener noreferrer' className='mx-auto mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#20CDB7] px-6 text-sm font-extrabold !text-[#082E3A] shadow-[0_8px_20px_rgba(32,205,183,0.25)] transition hover:-translate-y-0.5 hover:bg-[#43DFCB]'><ExternalLink size={18} />فتح ملف الدرس</a></div>}
          </div>
          <div className='mt-5 flex flex-col gap-4 rounded-2xl border border-[#DCE4EF] bg-white p-5 shadow-[0_6px_20px_rgba(31,41,55,0.05)] sm:flex-row sm:items-center sm:justify-between'><div className='min-w-0'><span className='mb-1 block text-xs font-bold text-[#12A594]'>الدرس الحالي</span><h1 className='text-lg font-extrabold text-[#172238]'>{currentLesson?.title}</h1><p className='mt-1 text-sm leading-7 text-[#718096]'>{currentLesson?.description}</p></div><button onClick={completeLesson} disabled={working || currentLesson?.progress?.status === 'completed'} className='h-11 shrink-0 rounded-xl bg-[#123C91] px-6 font-bold text-white shadow-[0_6px_14px_rgba(18,60,145,0.18)] transition hover:bg-[#0E3279] disabled:bg-[#D8DEE8] disabled:shadow-none'>{currentLesson?.progress?.status === 'completed' ? 'تم إكمال الدرس' : 'إكمال الدرس'}</button></div>
          {!!currentLesson?.attachments?.length && <div className='mt-4 rounded-2xl border border-[#DCE4EF] bg-white p-5'><h2 className='mb-3 flex items-center gap-2 font-extrabold text-[#26344B]'><Paperclip size={18} className='text-[#123C91]' />مرفقات الدرس</h2><div className='grid gap-2 sm:grid-cols-2'>{currentLesson.attachments.map((attachment) => { const attachmentId = attachment.id || attachment._id; const viewOnly = attachment.accessMode === 'view_only'; return <button key={attachmentId} type='button' onClick={() => openAttachment(attachment)} disabled={!!openingAttachmentId} className='flex items-center justify-between gap-3 rounded-xl border border-[#E1E7EF] bg-[#F8FAFD] px-4 py-3 text-right text-sm font-bold transition hover:border-[#123C91] hover:bg-[#EFF5FF] disabled:opacity-60'><span className='min-w-0 flex-1'><span className='block truncate'>{attachment.originalName || attachment.name || 'مرفق الدرس'}</span><small className='mt-0.5 block text-[10px] font-semibold text-[#667085]'>{viewOnly ? 'عرض فقط / View only' : 'قابل للتنزيل / Downloadable'}</small></span>{openingAttachmentId === attachmentId ? <LoaderCircle size={17} className='animate-spin' /> : viewOnly ? <Eye size={17} className='text-[#089E8C]' /> : <Download size={17} className='text-[#123C91]' />}</button>; })}</div></div>}
          <div className='mt-5 flex items-center justify-between rounded-xl border bg-[#F7FAFC] p-5'><div><h2 className='font-extrabold'>شهادة إتمام الدورة</h2><p className='mt-1 text-sm text-gray-500'>{view.certificateIssued ? 'تم إصدار شهادتك' : view.certificateEligible ? 'أصبحت مؤهلاً للحصول على الشهادة' : 'أكمل المتطلبات التي يحددها الخادم للحصول عليها'}</p></div>{view.certificateIssued ? <Link to={`/certificate/${courseId}`} className='flex items-center gap-2 rounded-lg bg-[#12C6B0] px-5 py-3 font-bold text-white'><Award size={18} />عرض الشهادة</Link> : <button onClick={claimCertificate} disabled={working || !view.certificateEligible} className='flex items-center gap-2 rounded-lg bg-[#12C6B0] px-5 py-3 font-bold text-white disabled:bg-gray-300'><Award size={18} />إصدار الشهادة</button>}</div>
        </main>
      </div>
    </div>
    {attachmentViewer && <div className='fixed inset-0 z-[130] grid place-items-center bg-[#07142D]/90 p-3 sm:p-6' role='dialog' aria-modal='true' aria-label={attachmentViewer.name} onMouseDown={(event) => event.target === event.currentTarget && closeAttachmentViewer()}><div onContextMenu={(event) => event.preventDefault()} className='relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#081A3A] shadow-2xl'><header className='flex items-center justify-between gap-3 bg-linear-to-l from-[#123C91] to-[#1E55B3] px-4 py-3 text-white'><div className='min-w-0'><p className='text-[10px] text-[#8FE3D8]'>{attachmentViewer.downloadable ? 'متاح للعرض والتنزيل' : 'عرض فقط / View only'}</p><h2 className='truncate text-sm font-bold'>{attachmentViewer.name}</h2></div><div className='flex items-center gap-2'>{attachmentViewer.downloadable && <a href={attachmentViewer.url} download={attachmentViewer.name} className='inline-flex h-9 items-center gap-2 rounded-lg bg-white/15 px-3 text-xs font-bold !text-white transition hover:bg-white/25'><Download size={16} />تنزيل</a>}<button type='button' onClick={closeAttachmentViewer} className='grid h-9 w-9 place-items-center rounded-full bg-white/10' aria-label='إغلاق'><X size={18} /></button></div></header><div className='relative min-h-0 flex-1 bg-[#050B17]'>{isLearnerPlayback && <ProtectedContentWatermark {...watermarkIdentity} />}{attachmentViewer.mimeType.startsWith('image/') ? <img src={attachmentViewer.url} alt={attachmentViewer.name} className='h-full w-full bg-white object-contain' /> : <iframe src={`${attachmentViewer.url}#toolbar=0&navpanes=0`} title={attachmentViewer.name} className='h-full w-full bg-white' />}</div></div></div>}
  </div></Layout>;
}
