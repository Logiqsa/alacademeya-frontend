import { useEffect, useState } from 'react';
import { Award, ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CertificateOwnerLayout from '../components/certificate/CertificateOwnerLayout';
import { getMyCourseCertificates } from '../services/APIService';

const titleOf = (value) => typeof value === 'string' ? value : value?.ar || value?.en || 'دورة تعليمية';
const dateOf = (value) => value && !Number.isNaN(new Date(value).getTime())
  ? new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
  : '—';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getMyCourseCertificates()
      .then((response) => {
        const items = response?.data?.data ?? response?.data ?? [];
        if (active) setCertificates(Array.isArray(items) ? items : []);
      })
      .catch(() => { if (active) setError('تعذر تحميل شهاداتك الآن. حاول مرة أخرى لاحقًا.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <CertificateOwnerLayout>
    <main dir='rtl' className='min-h-[75vh] rounded-2xl bg-[#F4F7FB] p-4 sm:p-7'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-7 flex items-center gap-3'>
          <div className='grid h-12 w-12 place-items-center rounded-xl bg-[#E6F7F5] text-[#079C89]'><Award size={26} /></div>
          <div><h1 className='text-2xl font-extrabold text-[#17213A]'>شهاداتي</h1><p className='text-sm text-[#667085]'>الشهادات التي حصلت عليها من الدورات المكتملة</p></div>
        </div>
        {loading && <div className='flex justify-center py-16'><LoaderCircle className='animate-spin text-[#123C91]' size={34} /></div>}
        {error && <p role='alert' className='rounded-xl bg-white p-6 text-center text-red-700'>{error}</p>}
        {!loading && !error && certificates.length === 0 && <div className='rounded-2xl bg-white p-10 text-center shadow-sm'><Award className='mx-auto text-[#AAB4C5]' size={48} /><h2 className='mt-4 text-xl font-bold'>لم تحصل على شهادات بعد</h2><p className='mt-2 text-[#667085]'>أكمل دورة تعليمية لتظهر شهادتها هنا.</p><Link to='/courses' className='mt-5 inline-flex rounded-lg bg-[#123C91] px-5 py-3 font-bold !text-white'>استكشف الدورات</Link></div>}
        {!loading && !error && certificates.length > 0 && <div className='grid gap-4 sm:grid-cols-2'>
          {certificates.map((certificate) => <article key={certificate.id || certificate.certificateNumber} className='rounded-2xl border border-[#DDE6F2] bg-white p-5 shadow-sm'>
            <div className='flex items-start gap-3'><Award className='shrink-0 text-[#079C89]' size={28} /><div className='min-w-0'><h2 className='text-lg font-extrabold text-[#17213A]'>{titleOf(certificate.courseTitle)}</h2><p className='mt-1 text-sm text-[#667085]'>تاريخ الإكمال: {dateOf(certificate.completionDate)}</p>{certificate.status === 'revoked' && <p className='mt-2 text-sm font-bold text-red-700'>الشهادة ملغاة</p>}</div></div>
            <p dir='ltr' className='mt-4 text-left text-sm font-semibold text-[#344054]'>{certificate.certificateNumber}</p>
            {certificate.status !== 'revoked' && <Link to={`/certificate/${certificate.course}`} className='mt-4 inline-flex items-center gap-2 rounded-lg bg-[#123C91] px-5 py-2.5 font-bold !text-white'>عرض الشهادة <ArrowLeft size={17} /></Link>}
          </article>)}
        </div>}
      </div>
    </main>
  </CertificateOwnerLayout>;
}
