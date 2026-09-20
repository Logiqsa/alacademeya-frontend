import { Check, CircleAlert, LoaderCircle, LocateFixed, RotateCcw } from 'lucide-react';

const statusStyles = {
  done: 'bg-[#E6F7EE] text-[#178044]',
  failed: 'bg-[#FDECEC] text-[#B42318]',
  running: 'bg-[#EAF2FF] text-[#123C91]',
  pending: 'bg-[#F2F4F7] text-[#98A2B3]',
};

function StatusIcon({ status }) {
  return <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${statusStyles[status] || statusStyles.pending}`}>
    {status === 'done' ? <Check size={16} strokeWidth={3} /> : status === 'failed' ? <CircleAlert size={16} /> : status === 'running' ? <LoaderCircle className='animate-spin' size={16} /> : <span className='h-2 w-2 rounded-full bg-current' />}
  </span>;
}

export default function CourseUploadProgress({ course, statuses, retryRequest, uploadStatus, saving, submitRequested, showCurriculum = true, onRetry, onCancel, onGoTo }) {
  const row = (key, title, indent = false) => {
    const item = statuses[key] || { status: 'pending' };
    const activeRetry = retryRequest?.key === key;
    return <li key={key} className={`flex items-center gap-3 border-b border-[#EDF1F5] py-2.5 last:border-0 ${indent ? 'pr-5' : ''}`}>
      <StatusIcon status={item.status} />
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-semibold text-[#344054]'>{title}</p>
        {item.status === 'running' && item.label && <p className='text-xs text-[#667085]'>{item.label}</p>}
        {item.status === 'failed' && <p className='text-xs text-[#B42318]'>{item.error?.response?.data?.message || item.error?.message || 'تعذر إكمال الرفع'}</p>}
      </div>
      {item.status === 'failed' && <div className='flex shrink-0 flex-wrap items-center gap-2'>
        {onGoTo && <button type='button' onClick={() => onGoTo(key, item)} className='inline-flex items-center gap-1 rounded-lg border border-[#D0D5DD] px-2.5 py-1.5 text-xs font-bold text-[#344054] hover:border-[#123C91] hover:bg-[#F5F8FF] hover:text-[#123C91]'><LocateFixed size={14} />اذهب للمشكلة</button>}
        {activeRetry && <button type='button' onClick={onRetry} className='inline-flex items-center gap-1 rounded-lg border border-[#B42318] px-2.5 py-1.5 text-xs font-bold text-[#B42318] hover:bg-[#FFF3F1]'><RotateCcw size={14} />إعادة المحاولة</button>}
      </div>}
    </li>;
  };

  return <section dir='rtl' className='mx-2 mt-4 rounded-xl border border-[#DCE4EF] bg-white p-4 sm:mx-4 md:mx-6 lg:mx-8' aria-live='polite'>
    <div className='mb-2 flex items-center justify-between gap-3'><h3 className='font-extrabold text-[#17213A]'>حالة رفع الدورة</h3><span className='text-xs font-semibold text-[#667085]'>{uploadStatus.label}{saving && uploadStatus.percent > 0 ? ` (${uploadStatus.percent}%)` : ''}</span></div>
    {saving && <div className='mb-3 h-2 overflow-hidden rounded-full bg-[#E5E7EB]'><div className='h-full rounded-full bg-[#12AFA0] transition-all' style={{ width: `${uploadStatus.percent}%` }} /></div>}
    <ul>{row('course', 'بيانات الدورة')}{course.cover?.file && row('cover', 'صورة الغلاف')}{course.promoVideo?.file && row('promo', 'الفيديو الترويجي')}
      {showCurriculum && course.curriculum.map((section, index) => <li key={section.id}>
        <ul>{row(`section:${section.id}`, `القسم ${index + 1}: ${section.title || 'بدون عنوان'}`)}
          {section.lessons.map((lesson, lessonIndex) => row(`lesson:${lesson.id}`, `الدرس ${lessonIndex + 1}: ${lesson.title || 'بدون عنوان'}`, true))}
        </ul>
      </li>)}
      {submitRequested && row('submit', 'إرسال الدورة للمراجعة')}
    </ul>
    {retryRequest && <button type='button' onClick={onCancel} className='mt-3 text-xs font-semibold text-[#667085] underline hover:text-[#344054]'>إيقاف الحفظ وتعديل البيانات</button>}
  </section>;
}
