import { useEffect, useState } from 'react';
import { Award, Check, Copy, ExternalLink, LoaderCircle, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import StudentLayout from '../components/student/layout/StudentLayout';
import certificateTemplate from '../../templates/certificate.png';
import blankCertificateValues from '../../templates/certificate-values-blank.png';
import { claimCourseCertificate, getCourseCertificateState } from '../services/APIService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const localizedText = (value, fallback = '') => {
  if (value == null) return fallback;
  if (typeof value === 'string') return value;
  return value.ar || value.en || fallback;
};
const formatDate = (value) => value
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
  : '—';

export default function CourseCertificatePage() {
  const { courseId } = useParams();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadCertificate = async () => {
      try {
        const course = { id: courseId };
        let certificateState = unwrap(await getCourseCertificateState(courseId));
        if (certificateState.eligible && !certificateState.issued) {
          const certificate = unwrap(await claimCourseCertificate(course.id));
          certificateState = { ...certificateState, issued: true, certificate };
        }
        if (active) setState({ ...certificateState, course });
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || 'تعذر تحميل الشهادة الآن');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCertificate();
    return () => { active = false; };
  }, [courseId]);

  if (loading) return (
    <StudentLayout><div className='grid min-h-[65vh] place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' size={38} /></div></StudentLayout>
  );

  const certificate = state?.certificate;
  if (error || !state?.issued || !certificate) return (
    <StudentLayout>
      <main dir='rtl' className='grid min-h-[65vh] place-items-center bg-[#F7F9FC] px-4'>
        <div className='max-w-lg rounded-2xl bg-white p-10 text-center shadow-sm'>
          <Award className='mx-auto text-[#AAB4C5]' size={58} />
          <h1 className='mt-5 text-2xl font-extrabold text-[#17213A]'>الشهادة غير متاحة بعد</h1>
          <p className='mt-3 leading-7 text-[#667085]'>{error || state?.reason || 'أكمل جميع الدروس والاختبارات المطلوبة للحصول على الشهادة.'}</p>
          <Link to={`/learn/${courseId}`} className='mt-7 inline-flex rounded-lg bg-[#123C91] px-6 py-3 font-bold text-white'>العودة إلى الدورة</Link>
        </div>
      </main>
    </StudentLayout>
  );

  const courseTitle = localizedText(certificate.courseTitle) || localizedText(state.course?.title);
  const completionDate = certificate.completionDate || state.completedAt || certificate.issuedAt;
  const verificationUrl = `${window.location.origin}/certificates/verify/${encodeURIComponent(certificate.certificateNumber)}`;
  const copyVerification = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      toast.success('تم نسخ رابط التحقق من الشهادة');
    } catch {
      toast.error('تعذر نسخ الرابط');
    }
  };

  return (
    <StudentLayout>
      <main dir='rtl' className='certificate-page min-h-screen bg-[#F4F7FB] px-4 py-8 sm:px-6'>
        <style>{`@media print { @page { size: A4 landscape; margin: 0; } body * { visibility: hidden; } .certificate-sheet, .certificate-sheet * { visibility: visible; } .certificate-sheet { position: fixed !important; top: 6mm !important; left: 0 !important; width: 297mm !important; height: auto !important; aspect-ratio: 800 / 533 !important; box-shadow: none !important; border-radius: 0 !important; } .certificate-actions, header, aside, nav { display: none !important; } }`}</style>
        <div className='mx-auto max-w-6xl'>
          <div className='certificate-actions mb-6 text-center'>
            <div className='mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#D9F9F4] text-[#079C89]'><Check size={27} strokeWidth={3} /></div>
            <h1 className='mt-3 text-2xl font-extrabold text-[#17213A]'>تهانينا، تم إصدار شهادتك بنجاح</h1>
            <p className='mt-1 text-sm text-[#667085]'>يمكنك طباعتها أو حفظها بصيغة PDF ومشاركة رابط التحقق الرسمي.</p>
          </div>

          <section dir='ltr' className='certificate-sheet relative mx-auto aspect-[800/533] w-full overflow-hidden shadow-[0_20px_60px_rgba(18,60,145,.16)]'>
            <img src={certificateTemplate} alt='' aria-hidden='true' className='absolute inset-0 h-full w-full' />
            <svg aria-hidden='true' className='absolute inset-0 h-full w-full' viewBox='0 0 800 533' preserveAspectRatio='none'>
              <defs>
                <clipPath id='certificate-value-patches'>
                  <rect x='285' y='233' width='230' height='52' />
                  <rect x='312' y='345' width='176' height='38' />
                  <rect x='88' y='391' width='155' height='33' />
                  <rect x='588' y='392' width='118' height='33' />
                </clipPath>
              </defs>
              <image href={blankCertificateValues} width='800' height='533' preserveAspectRatio='none' clipPath='url(#certificate-value-patches)' />
            </svg>
            <div className='certificate-overlays absolute inset-0 text-center text-[#17213A]'>
              <h3 dir='auto' className='certificate-learner'>{certificate.learnerName}</h3>
              <h4 dir='auto' className='certificate-course'>{courseTitle}</h4>
              <p dir='auto' className='certificate-instructor'>{certificate.instructorName || '—'}</p>
              <div className='certificate-footer certificate-id'>
                <span>Certificate ID</span>
                <strong>{certificate.certificateNumber}</strong>
              </div>
              <p className='certificate-date'>{formatDate(completionDate)}</p>
            </div>
          </section>

          <div className='certificate-actions mt-6 flex flex-wrap justify-center gap-3'>
            <button onClick={() => window.print()} className='flex items-center gap-2 rounded-xl bg-[#123C91] px-6 py-3 font-bold text-white shadow-sm hover:bg-[#0E3279]'><Printer size={18} />طباعة أو حفظ PDF</button>
            <button onClick={copyVerification} className='flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 font-bold text-[#344054] hover:bg-[#F9FAFB]'><Copy size={18} />نسخ رابط التحقق</button>
            <a href={verificationUrl} target='_blank' rel='noreferrer' className='flex items-center gap-2 rounded-xl border border-[#D0D5DD] bg-white px-6 py-3 font-bold text-[#344054] hover:bg-[#F9FAFB]'><ExternalLink size={18} />التحقق من الشهادة</a>
          </div>
        </div>
      </main>
    </StudentLayout>
  );
}
