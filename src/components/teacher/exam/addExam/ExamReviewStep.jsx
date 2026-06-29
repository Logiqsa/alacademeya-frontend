import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-[#F3F4F6] last:border-0 gap-1 sm:gap-4">
    <span className="text-[13px] sm:text-[14px] text-[#6B7280]">{label}</span>
    <span className="text-[14px] sm:text-[15px] font-semibold text-[#1F2937] sm:text-left">{value || '—'}</span>
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="bg-white border border-[#E5E5E5] rounded-2xl px-4 sm:px-5 py-2 mb-4">
    <div className="flex items-center gap-2 py-3 border-b border-[#F3F4F6]">
      <span className="font-['Tajawal'] font-semibold text-[15px] text-[#123C91]">{title}</span>
      {icon}
    </div>
    {children}
  </div>
);

const MOCK_GROUPS = { '1': 'مجموعة رياضيات A', '2': 'مجموعة رياضيات B', '3': 'مجموعة رياضيات C' };
const MOCK_LESSONS = { 'l1': 'المعادلات التربيعية', 'l2': 'الهندسة', 'l3': 'الجبر', 'l4': 'الإحصاء', 'l5': 'حساب المثلثات' };

const ExamReviewStep = ({ data, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const totalScore = (data.questions || []).reduce((s, q) => s + (Number(q.score) || 0), 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: replace with real API call
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('تم إنشاء الاختبار بنجاح!');
      onSuccess?.();
    } catch {
      toast.error('حدثت مشكلة أثناء إنشاء الاختبار');
    } finally {
      setLoading(false);
    }
  };

  const docIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#123C91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  );

  return (
    <div dir="rtl" className="w-full p-2">
      <div className="mb-6">
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[20px] sm:text-[22px] text-[#1F2937] mb-1">مراجعة وإنشاء</h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px] sm:text-[16px]">تأكد من البيانات قبل إنشاء الاختبار.</p>
      </div>

      {/* Summary */}
      <Section title="ملخص الاختبار" icon={docIcon}>
        <div className="py-2 mb-2">
          <p className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] text-right py-2">{data.title || '—'}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Row label="المجموعة:" value={MOCK_GROUPS[data.group] || data.group} />
          <Row label="الحصة:" value={MOCK_LESSONS[data.lesson] || data.lesson} />
          <Row label="بدأ:" value={data.startDate ? `${data.startDate} ${data.startTime || ''}` : '—'} />
          <Row label="ينتهي:" value={data.endDate ? `${data.endDate} ${data.endTime || ''}` : '—'} />
          <Row label="المدة:" value={data.duration ? `${data.duration} دقيقة` : '—'} />
          <Row label="الدرجة الكلية:" value={totalScore} />
        </div>
      </Section>

      {/* Questions */}
      <Section title="الأسئلة" icon={docIcon}>
        {(data.questions || []).map((q, i) => (
          <div key={q.id} className="py-3 border-b border-[#F3F4F6] last:border-0">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[#8C9198] text-[13px] shrink-0">{i + 1}</span>
              <div className="flex-1 text-right">
                <p className="font-['IBM_Plex_Sans_Arabic'] text-[14px] text-[#1F2937] font-medium">{q.text}</p>
                <p className="text-[12px] text-[#8C9198] mt-1">
                  الإجابة: <span className="text-[#00A63E] font-semibold">{q.correctOption !== null ? q.options[q.correctOption] : '—'}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-[#EAF4FF] text-[#123C91] text-[11px] font-semibold px-2 py-0.5 rounded-full">اختيار من متعدد</span>
                <span className="text-[#8C9198] text-[12px]">{q.score} درجة</span>
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* Notice */}
      <div className="mb-5 p-4 rounded-2xl bg-[#EAF4FF] border border-[#DBEAFE] text-[#123C91] text-[13px] leading-7 text-right">
        بعد النشر سيتلقى طلاب المجموعة إشعاراً بالاختبار وسيستجمع تلقائياً بعد انتهاء الموعد.
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button onClick={onBack} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]">السابق</button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px] disabled:opacity-70"
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء الاختبار'}
        </button>
      </div>
    </div>
  );
};

export default ExamReviewStep;