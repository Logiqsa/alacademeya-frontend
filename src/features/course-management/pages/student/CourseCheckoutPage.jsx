import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import logo from '../../../../assets/icons/logo.svg';
import { fetchPublicCourse } from '../../api/coursesApi';
import { getMyPolicyStatus, startCoursePurchase } from '../../../../services/APIService';
import PolicyAcceptanceDialog from '../../../../components/course/PolicyAcceptanceDialog';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export default function CoursePaymentPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    fetchPublicCourse(slug)
      .then(setCourse)
      .catch(() => toast.error('تعذر تحميل بيانات الدورة'))
      .finally(() => setLoading(false));
  }, [slug]);

  const checkout = async () => {
    if (!course?.id || paying) return;
    setPaying(true);
    const loadingToast = toast.loading('جاري تجهيز صفحة الدفع الآمنة...');
    try {
      const status = unwrap(await getMyPolicyStatus());
      if (status?.learner_course_terms?.required && !status.learner_course_terms.accepted) {
        setTermsOpen(true); setPaying(false); toast.dismiss(loadingToast); return;
      }
      const data = unwrap(await startCoursePurchase(course.id, 'EGP'));
      const purchaseUrl = data?.purchaseUrl || data?.checkoutUrl || data?.url;
      if (!purchaseUrl) throw new Error('لم يُرجع الخادم رابط الدفع');
      toast.success('سيتم تحويلك إلى بوابة الدفع', { id: loadingToast });
      window.location.assign(purchaseUrl);
    } catch (error) {
      if (error?.response?.data?.code === 'POLICY_ACCEPTANCE_REQUIRED') setTermsOpen(true);
      toast.error(error?.response?.data?.message || error.message || 'تعذر بدء عملية الدفع', { id: loadingToast });
      setPaying(false);
    }
  };

  if (loading) return <div className='grid min-h-screen place-items-center'><LoaderCircle className='animate-spin text-[#123C91]' /></div>;
  if (!course) return <div className='grid min-h-screen place-items-center'><Link to='/courses'>العودة إلى الدورات</Link></div>;

  const price = course.effectivePrice ?? course.price ?? 0;

  return <div dir='rtl' className='min-h-screen bg-[#F4F7FC] px-4 py-5 text-[#1F2937] sm:px-6 sm:py-7'>
    <PolicyAcceptanceDialog open={termsOpen} requiredTypes={['learner_course_terms']} onClose={() => setTermsOpen(false)} onSatisfied={() => { setTermsOpen(false); checkout(); }} />
    <div className='mx-auto w-full max-w-5xl'>
      <header className='mb-6 flex items-center justify-between border-b border-[#DDE5F0] pb-5 sm:mb-8'>
        <Link to='/' aria-label='العودة إلى الرئيسية' className='shrink-0'><img src={logo} alt='الأكاديمية' className='h-9 w-auto sm:h-10' /></Link>
        <button type='button' onClick={() => navigate(-1)} className='inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-[#123C91] transition hover:bg-[#EAF1FF]'>العودة للدورة<ArrowLeft size={17} /></button>
      </header>

      <div className='mb-6 text-center sm:mb-8'>
        <p className='text-xs font-bold text-[#12AFA0]'>خطوة أخيرة</p>
        <h1 className='mt-2 text-2xl font-extrabold text-[#17213A] sm:text-3xl'>إتمام الاشتراك</h1>
        <p className='mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]'>راجع طلبك، ثم انتقل إلى بوابة الدفع الآمنة لإتمام الاشتراك.</p>
      </div>

      <main className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6'>
        <div className='order-2 overflow-hidden rounded-2xl border border-[#DDE5F0] bg-white shadow-[0_12px_35px_rgba(18,60,145,0.08)] lg:order-1'>
          <div className='h-1.5 bg-linear-to-l from-[#123C91] to-[#12C6B0]' />
          <div className='p-5 sm:p-7'>
            <div className='flex items-start gap-4'>
              <span className='grid size-12 shrink-0 place-items-center rounded-xl bg-[#EAF1FF] text-[#123C91]'><CreditCard size={23} /></span>
              <div><h2 className='text-lg font-extrabold sm:text-xl'>الدفع الإلكتروني الآمن</h2><p className='mt-1 text-sm leading-6 text-[#667085]'>سيتم تحويلك إلى بوابة الدفع الرسمية لإكمال العملية.</p></div>
            </div>

            <div className='my-6 grid gap-3 sm:grid-cols-2'>
              <TrustItem icon={ShieldCheck} text='عملية دفع مشفرة وآمنة' />
              <TrustItem icon={LockKeyhole} text='لا نخزن بيانات بطاقتك' />
            </div>

            <div className='rounded-xl border border-[#D7E2F3] bg-[#F8FAFD] px-4 py-3 text-sm leading-6 text-[#52637A]'>لن تُدخل بيانات بطاقتك داخل موقع الأكاديمية؛ سيتم إدخالها لدى مزود الدفع المعتمد فقط.</div>

            <button onClick={checkout} disabled={paying} className='mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#123C91] px-5 font-bold text-white shadow-[0_8px_18px_rgba(18,60,145,0.2)] transition hover:bg-[#0E327A] disabled:cursor-not-allowed disabled:opacity-60'>{paying ? <LoaderCircle className='animate-spin' size={19} /> : <ShieldCheck size={19} />}{paying ? 'جاري التحويل...' : 'الانتقال للدفع الآمن'}</button>
            <p className='mt-3 text-center text-xs text-[#8C9198]'>بالضغط على الزر ستغادر مؤقتًا إلى صفحة مزود الدفع.</p>
          </div>
        </div>

        <aside className='order-1 rounded-2xl border border-[#DDE5F0] bg-white p-5 shadow-[0_8px_24px_rgba(16,24,40,0.05)] lg:order-2 lg:sticky lg:top-7'>
          <h2 className='text-lg font-extrabold text-[#17213A]'>ملخص الطلب</h2>
          <div className='my-5 border-y border-[#EAECF0] py-5'>
            <p className='text-xs font-semibold text-[#667085]'>الدورة</p>
            <p className='mt-2 font-bold leading-6 text-[#1F2937]'>{course.title}</p>
            <p className='mt-1 text-sm text-[#667085]'>بواسطة {course.instructor}</p>
          </div>
          <div className='flex items-center justify-between gap-4'><span className='font-bold text-[#344054]'>الإجمالي</span><span dir='ltr' className='text-xl font-extrabold text-[#123C91]'>{Number(price).toLocaleString('ar-EG')} EGP</span></div>
          <div className='mt-5 flex items-center gap-2 rounded-xl bg-[#EAFBF8] px-3 py-3 text-xs font-semibold text-[#087F73]'><CheckCircle2 size={17} className='shrink-0' />وصول كامل للدورة بعد تأكيد الدفع</div>
        </aside>
      </main>
    </div>
  </div>;
}

const TrustItem = ({ icon: Icon, text }) => <div className='flex items-center gap-2.5 rounded-xl bg-[#F8FAFC] px-3 py-3 text-sm font-semibold text-[#475467]'><span className='grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#123C91] shadow-sm'><Icon size={17} /></span>{text}</div>;
