import { useContext, useEffect, useRef, useState } from 'react';
import { Award, CheckCircle2, ChevronDown, ChevronLeft, Download, ExternalLink, FileText, LoaderCircle, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, Paperclip, PlayCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../../../../components/student/layout/StudentLayout';
import TeacherLayout from '../../../../components/teacher/layout/TeacherLayout';
import { AuthContext } from '../../../../context/AuthContext';
import { claimCourseCertificate, completeCourseLesson, getCourseLearningView, requestLessonAttachmentAccess, requestLessonMediaAccess, updateCourseLessonProgress } from '../../../../services/APIService';
import { resolveMediaUrl } from '../../../../services/apiUrl';
import { hasApiErrorCode, normalizeApiError } from '../../../../services/apiError';
import { CircleHelp } from 'lucide-react';

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
  const [openSection, setOpenSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [working, setWorking] = useState(false);
  const [openingAttachmentId, setOpeningAttachmentId] = useState('');
  const [contentCollapsed, setContentCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mediaRef = useRef(null);
  const playerFrameRef = useRef(null);
  const lastSavedPositionRef = useRef(0);
  const mediaRefreshRef = useRef(0);
  const Layout = user?.role === 'teacher' ? TeacherLayout : StudentLayout;
  const libraryPath = user?.role === 'teacher' ? '/teacher/my-courses' : '/student-dashboard/courses';

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
      const url = data?.url || data?.mediaUrl || data?.signedUrl || data?.playbackUrl;
      if (active && url) {
        setMediaUrl(resolveMediaUrl(url));
        setMediaLessonId(currentLesson.id);
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
    try {
      const data = unwrap(await requestLessonMediaAccess(view.course.id, currentLesson.id));
      const url = data?.url || data?.mediaUrl || data?.signedUrl || data?.playbackUrl;
      if (url) {
        setMediaUrl(resolveMediaUrl(url));
        setMediaLessonId(currentLesson.id);
      }
    } catch (error) {
      toast.error(hasApiErrorCode(error, 'MEDIA_TOKEN_EXPIRED') ? 'انتهت صلاحية رابط الوسائط. أعد المحاولة.' : error?.response?.data?.message || 'تعذر تجديد رابط محتوى الدرس');
    }
  };

  const openAttachment = async (attachment) => {
    const attachmentId = attachment?.id || attachment?._id;
    if (!attachmentId || openingAttachmentId) return;
    const target = window.open('', '_blank');
    setOpeningAttachmentId(attachmentId);
    try {
      const data = unwrap(await requestLessonAttachmentAccess(view.course.id, currentLesson.id, attachmentId));
      if (!data?.url) throw new Error('ATTACHMENT_URL_MISSING');
      if (target) target.location.href = resolveMediaUrl(data.url);
      else window.location.assign(resolveMediaUrl(data.url));
    } catch (error) {
      if (target) target.close();
      toast.error(error?.response?.data?.message || 'تعذر فتح مرفق الدرس');
    } finally {
      setOpeningAttachmentId('');
    }
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
    const savedPosition = Number(currentLesson?.progress?.lastPositionSeconds || 0);
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

  if (loading) return <Layout><div className='grid min-h-[60vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div></Layout>;
  if (!view) return <Layout><div dir='rtl' className='p-10 text-center'><h1 className='text-xl font-bold'>{loadError?.code === 'COURSE_ACCESS_REVOKED' ? 'تم سحب الوصول إلى هذه الدورة' : 'تعذر تحميل الدورة'}</h1><p className='mt-2 text-sm text-gray-500'>{loadError?.message}</p><Link to={libraryPath} className='mt-5 inline-block font-bold text-[#123C91]'>العودة إلى دوراتي</Link></div></Layout>;

  const currentMediaType = mediaTypeOf(currentLesson);
  const activeMediaUrl = mediaLessonId === currentLesson?.id ? mediaUrl : '';
  const poster = resolveMediaUrl(currentLesson?.thumbnailUrl || currentLesson?.posterUrl || currentLesson?.previewImage || view.course?.coverImage || '');

  return <Layout><div dir='rtl' className='min-h-full rounded-2xl bg-[#F4F7FB] p-2 text-[#202936] sm:p-3 lg:p-4'>
    <div className='mx-auto max-w-[1450px]'><div className='mb-6 overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] via-[#174BAE] to-[#116B91] px-5 py-5 text-white shadow-[0_12px_30px_rgba(18,60,145,0.18)] sm:px-7'>
      <nav className='mb-3 flex items-center gap-2 text-xs text-white/75'><Link to={libraryPath} className='font-bold !text-white transition hover:opacity-80'>دوراتي</Link><ChevronLeft size={14} /><span className='truncate'>{titleOf(view.course.title)}</span></nav>
      <div className='flex flex-wrap items-end justify-between gap-4'><div><span className='mb-2 block text-xs font-semibold text-[#8EF0E3]'>أنت تتعلم الآن</span><h1 className='text-xl font-extrabold sm:text-2xl'>{titleOf(view.course.title)}</h1></div><div className='min-w-44 rounded-xl bg-white/10 px-4 py-3 backdrop-blur'><div className='mb-2 flex justify-between text-xs'><span>تقدم الدورة</span><b dir='ltr'>{Math.round(progress)}%</b></div><div className='h-2 overflow-hidden rounded-full bg-white/20'><div className='h-full rounded-full bg-[#26D6C1] transition-all duration-500' style={{ width: `${progress}%` }} /></div></div></div>
    </div>
      <div className={`grid items-start gap-3 ${contentCollapsed ? 'xl:grid-cols-[minmax(0,1fr)]' : 'xl:grid-cols-[340px_minmax(0,1fr)]'}`}>
        {!contentCollapsed && <aside className='order-2 overflow-hidden rounded-2xl border border-[#DCE4EF] bg-white shadow-[0_8px_24px_rgba(31,41,55,0.06)] xl:order-1 xl:sticky xl:top-3'><div className='border-b border-[#E8EDF4] bg-[#FAFBFD] px-4 py-3.5'><div className='flex items-center justify-between gap-3'><div className='flex min-w-0 items-center gap-2'><button type='button' onClick={() => setContentCollapsed(true)} className='grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#DCE4EF] bg-white text-[#123C91] transition hover:bg-[#EAF2FF]' aria-label='طي محتوى الدورة' title='طي محتوى الدورة'><PanelRightClose size={17} /></button><h2 className='truncate font-extrabold text-[#182338]'>محتوى الدورة</h2></div><b className='rounded-full bg-[#E7F8F5] px-2.5 py-1 text-xs text-[#089E8C]' dir='ltr'>{Math.round(progress)}%</b></div></div>
          <div className='max-h-[calc(100vh-260px)] overflow-y-auto p-3'>{view.curriculum?.map((section, index) => <div key={section.id} className='mb-2 overflow-hidden rounded-xl border border-[#E2E8F0]'><button onClick={() => setOpenSection(openSection === index ? -1 : index)} className='flex w-full items-center justify-between bg-[#F8FAFD] px-4 py-3.5 text-right text-sm font-extrabold text-[#26344B] transition hover:bg-[#EFF4FA]'>{section.title}<ChevronDown size={17} className={`shrink-0 text-[#667085] transition-transform ${openSection === index ? 'rotate-180' : ''}`} /></button>{openSection === index && section.lessons?.map((lesson) => <button key={lesson.id} onClick={() => setCurrentLesson(lesson)} className={'flex w-full items-center gap-3 border-t border-[#EDF1F5] px-4 py-3.5 text-right text-sm transition ' + (currentLesson?.id === lesson.id ? 'bg-[#EAF2FF] font-bold text-[#123C91]' : 'bg-white text-[#536176] hover:bg-[#F8FAFD]')}>{lesson.progress?.status === 'completed' ? <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#DDF8F2]'><CheckCircle2 size={16} className='text-[#08A88F]' /></span> : lesson.contentType === 'document' ? <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#FFF3DD]'><FileText size={15} className='text-[#D98A13]' /></span> : <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E8EFFF]'><PlayCircle size={16} className='text-[#245DC0]' /></span>}<span className='min-w-0 flex-1 break-words'>{lesson.title}</span></button>)}</div>)}</div>
          {!!view.quizzes?.length && <div className={'mt-5 border-t pt-4'}><h3 className={'mb-3 font-extrabold'}>الاختبارات المطلوبة</h3>{view.quizzes.map((quiz) => <Link key={quiz.id || quiz._id} to={'/exam/' + courseId + '?quiz=' + encodeURIComponent(quiz.id || quiz._id)} className={'mb-2 flex items-center gap-2 rounded-lg border border-[#D7E2F3] bg-[#F4F7FF] p-3 text-sm font-bold text-[#123C91]'}><CircleHelp size={17} />{quiz.title}</Link>)}</div>}
        </aside>}
        <main className='order-1 min-w-0 xl:order-2'>
          <div className='mb-2 flex items-center justify-between gap-2'>{contentCollapsed ? <button type='button' onClick={() => setContentCollapsed(false)} className='inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE4EF] bg-white px-3 text-xs font-bold text-[#123C91] shadow-sm transition hover:bg-[#EAF2FF]'><PanelRightOpen size={17} />إظهار محتوى الدورة</button> : <span />}</div>
          <div ref={playerFrameRef} className='group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#080B12] text-white shadow-[0_14px_36px_rgba(15,23,42,0.22)] fullscreen:aspect-auto fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none fullscreen:border-0'>
            <button type='button' onClick={toggleFullscreen} className='absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-xl bg-black/65 text-white opacity-90 backdrop-blur transition hover:bg-[#123C91] focus:opacity-100 sm:opacity-0 sm:group-hover:opacity-100' aria-label={isFullscreen ? 'الخروج من ملء الشاشة' : 'عرض بملء الشاشة'} title={isFullscreen ? 'الخروج من ملء الشاشة' : 'ملء الشاشة'}>{isFullscreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}</button>
            {!activeMediaUrl ? <div className='text-center'><LoaderCircle className='mx-auto animate-spin text-[#26D6C1]' size={30} /><p className='mt-3 text-xs text-white/65'>جاري تجهيز محتوى الدرس...</p></div> : currentMediaType === 'video' ? <video ref={mediaRef} key={activeMediaUrl} src={activeMediaUrl} poster={poster || undefined} controls controlsList='nodownload' playsInline preload='metadata' className='h-full w-full bg-black object-contain' onError={refreshExpiredMedia} onLoadedMetadata={restorePosition} onPlay={(event) => savePosition(event.currentTarget.currentTime, true)} onTimeUpdate={(event) => savePosition(event.currentTarget.currentTime)} onPause={(event) => savePosition(event.currentTarget.currentTime, true)} onEnded={completeLesson}>متصفحك لا يدعم تشغيل الفيديو.</video> : currentMediaType === 'audio' ? <audio ref={mediaRef} key={activeMediaUrl} src={activeMediaUrl} controls preload='metadata' className='w-[min(90%,680px)]' onError={refreshExpiredMedia} onLoadedMetadata={restorePosition} onPlay={(event) => savePosition(event.currentTarget.currentTime, true)} onTimeUpdate={(event) => savePosition(event.currentTarget.currentTime)} onPause={(event) => savePosition(event.currentTarget.currentTime, true)} onEnded={completeLesson} /> : <div className='mx-4 w-full max-w-md rounded-2xl border border-white/15 bg-white/8 p-6 text-center shadow-2xl backdrop-blur-sm sm:p-8'><span className='mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#123C91] shadow-lg'><FileText size={30} /></span><h2 className='mt-4 line-clamp-2 text-lg font-extrabold text-white'>{currentLesson?.title || 'ملف الدرس'}</h2><p className='mt-2 text-sm leading-6 text-white/65'>هذا الملف محمي ولا يسمح بعرضه داخل الصفحة. يمكنك فتحه بأمان في نافذة جديدة.</p><a href={activeMediaUrl} target='_blank' rel='noopener noreferrer' className='mx-auto mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#20CDB7] px-6 text-sm font-extrabold !text-[#082E3A] shadow-[0_8px_20px_rgba(32,205,183,0.25)] transition hover:-translate-y-0.5 hover:bg-[#43DFCB]'><ExternalLink size={18} />فتح ملف الدرس</a></div>}
          </div>
          <div className='mt-5 flex flex-col gap-4 rounded-2xl border border-[#DCE4EF] bg-white p-5 shadow-[0_6px_20px_rgba(31,41,55,0.05)] sm:flex-row sm:items-center sm:justify-between'><div className='min-w-0'><span className='mb-1 block text-xs font-bold text-[#12A594]'>الدرس الحالي</span><h1 className='text-lg font-extrabold text-[#172238]'>{currentLesson?.title}</h1><p className='mt-1 text-sm leading-7 text-[#718096]'>{currentLesson?.description}</p></div><button onClick={completeLesson} disabled={working || currentLesson?.progress?.status === 'completed'} className='h-11 shrink-0 rounded-xl bg-[#123C91] px-6 font-bold text-white shadow-[0_6px_14px_rgba(18,60,145,0.18)] transition hover:bg-[#0E3279] disabled:bg-[#D8DEE8] disabled:shadow-none'>{currentLesson?.progress?.status === 'completed' ? 'تم إكمال الدرس' : 'إكمال الدرس'}</button></div>
          {!!currentLesson?.attachments?.length && <div className='mt-4 rounded-2xl border border-[#DCE4EF] bg-white p-5'><h2 className='mb-3 flex items-center gap-2 font-extrabold text-[#26344B]'><Paperclip size={18} className='text-[#123C91]' />مرفقات الدرس</h2><div className='grid gap-2 sm:grid-cols-2'>{currentLesson.attachments.map((attachment) => { const attachmentId = attachment.id || attachment._id; return <button key={attachmentId} type='button' onClick={() => openAttachment(attachment)} disabled={!!openingAttachmentId} className='flex items-center justify-between rounded-xl border border-[#E1E7EF] bg-[#F8FAFD] px-4 py-3 text-right text-sm font-bold transition hover:border-[#123C91] hover:bg-[#EFF5FF] disabled:opacity-60'><span className='truncate'>{attachment.originalName || attachment.name || 'مرفق الدرس'}</span>{openingAttachmentId === attachmentId ? <LoaderCircle size={17} className='animate-spin' /> : <Download size={17} className='text-[#123C91]' />}</button>; })}</div></div>}
          <div className='mt-5 flex items-center justify-between rounded-xl border bg-[#F7FAFC] p-5'><div><h2 className='font-extrabold'>شهادة إتمام الدورة</h2><p className='mt-1 text-sm text-gray-500'>{view.certificateIssued ? 'تم إصدار شهادتك' : view.certificateEligible ? 'أصبحت مؤهلاً للحصول على الشهادة' : 'أكمل المتطلبات التي يحددها الخادم للحصول عليها'}</p></div>{view.certificateIssued ? <Link to={`/certificate/${courseId}`} className='flex items-center gap-2 rounded-lg bg-[#12C6B0] px-5 py-3 font-bold text-white'><Award size={18} />عرض الشهادة</Link> : <button onClick={claimCertificate} disabled={working || !view.certificateEligible} className='flex items-center gap-2 rounded-lg bg-[#12C6B0] px-5 py-3 font-bold text-white disabled:bg-gray-300'><Award size={18} />إصدار الشهادة</button>}</div>
        </main>
      </div>
    </div>
  </div></Layout>;
}
