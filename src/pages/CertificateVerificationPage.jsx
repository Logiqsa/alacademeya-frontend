import { useEffect, useState } from 'react';
import { Award, CheckCircle2, LoaderCircle, Search, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { verifyCourseCertificate } from '../services/APIService';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const courseTitle = (value) => typeof value === 'string' ? value : value?.ar || value?.en || '—';

function CertificateVerificationContent({ certificateNumber }) {
  const navigate = useNavigate();
  const [input, setInput] = useState(certificateNumber);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(certificateNumber ? 'loading' : 'idle');
  const [formError, setFormError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!certificateNumber) return undefined;
    let active = true;
    verifyCourseCertificate(certificateNumber)
      .then((response) => {
        if (!active) return;
        const data = response?.data?.data;
        setResult(data?.valid && data?.certificate ? data.certificate : null);
        setStatus(data?.valid && data?.certificate ? 'valid' : 'invalid');
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => { active = false; };
  }, [certificateNumber, retry]);

  const submit = (event) => {
    event.preventDefault();
    const reference = input.trim();
    if (!reference || reference.length > 128) {
      setFormError('Enter a valid Certificate ID.');
      return;
    }
    setFormError('');
    if (reference === certificateNumber) {
      setStatus('loading');
      setRetry((value) => value + 1);
      return;
    }
    navigate(`/certificates/verify/${encodeURIComponent(reference)}`);
  };

  return (
    <main dir='ltr' style={{ fontFamily: '"IBM Plex Sans", sans-serif' }} className='min-h-[70vh] bg-[#F4F7FB] px-4 py-12 text-[#17213A] sm:px-6'>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-8 text-center'>
          <Award className='mx-auto mb-3 text-[#123C91]' size={40} aria-hidden='true' />
          <h1 className='text-3xl font-bold'>Verify a Certificate</h1>
          <p className='mt-2 text-[#667085]'>Enter the Certificate ID printed on an Alacademeya certificate.</p>
        </div>
        <form onSubmit={submit} className='rounded-2xl bg-white p-6 shadow-sm sm:p-8'>
          <label htmlFor='certificate-reference' className='mb-2 block font-semibold'>Certificate ID</label>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <input
              id='certificate-reference'
              value={input}
              onChange={(event) => setInput(event.target.value)}
              dir='ltr'
              autoComplete='off'
              maxLength={128}
              aria-invalid={Boolean(formError)}
              aria-describedby={formError ? 'certificate-reference-error' : undefined}
              placeholder='CERT-2026-A7B9C2D4'
              className='min-w-0 flex-1 rounded-xl border border-[#D0D5DD] px-4 py-3 outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/15'
            />
            <button type='submit' disabled={status === 'loading'} className='inline-flex items-center justify-center gap-2 rounded-xl bg-[#123C91] px-6 py-3 font-semibold text-white disabled:opacity-60'>
              <Search size={18} aria-hidden='true' /> Verify
            </button>
          </div>
          {formError && <p id='certificate-reference-error' role='alert' className='mt-2 text-sm text-red-700'>{formError}</p>}
        </form>

        <div aria-live='polite' className='mt-6'>
          {status === 'loading' && <div className='flex items-center justify-center gap-2 py-8 text-[#667085]'><LoaderCircle className='animate-spin' size={20} /> Checking certificate…</div>}
          {status === 'valid' && result && (
            <section className='rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8'>
              <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold text-emerald-800'><CheckCircle2 aria-hidden='true' /> Certificate Verified</h2>
              <dl className='grid gap-x-6 gap-y-5 sm:grid-cols-2'>
                {[
                  ['Certificate ID', result.certificateNumber],
                  ['Learner', result.learnerName],
                  ['Course', courseTitle(result.courseTitle)],
                  ['Instructor', result.instructorName],
                  ['Completion Date', formatDate(result.completionDate)],
                  ['Issued Date', formatDate(result.issuedAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className='text-sm text-[#667085]'>{label}</dt>
                    <dd dir={label === 'Course' ? 'auto' : undefined} className='mt-1 break-words font-semibold'>{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {status === 'invalid' && <section role='status' className='rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm'><XCircle className='mx-auto text-[#667085]' aria-hidden='true' /><h2 className='mt-2 text-xl font-bold'>Certificate Not Valid</h2><p className='mt-2 text-[#667085]'>Check the Certificate ID and try again.</p></section>}
          {status === 'error' && <section role='alert' className='rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm'>Verification is unavailable right now. Please try again.</section>}
        </div>
      </div>
    </main>
  );
}

export default function CertificateVerificationPage() {
  const { certificateNumber = '' } = useParams();
  return <CertificateVerificationContent key={certificateNumber} certificateNumber={certificateNumber} />;
}
