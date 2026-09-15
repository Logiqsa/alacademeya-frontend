import { useEffect, useState } from 'react';
import { CheckCircle2, CircleHelp, LoaderCircle, RotateCcw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCourseQuiz, submitCourseQuizAttempt } from '../../services/APIService';

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export default function InlineCourseQuiz({ courseId, quizId, onClose, onCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    getCourseQuiz(courseId, quizId)
      .then((response) => {
        if (!active) return;
        setQuiz(unwrap(response));
        setResult(null);
        setAnswers({});
        setCurrentQuestion(0);
      })
      .catch((error) => toast.error(error?.response?.data?.message || 'تعذر تحميل الاختبار'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId, quizId]);

  const questions = quiz?.questions || [];
  const submit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('يجب الإجابة عن جميع الأسئلة قبل التسليم');
      return;
    }
    setSubmitting(true);
    try {
      const response = await submitCourseQuizAttempt(courseId, quiz.id || quiz._id, {
        answers: questions.map((question) => ({
          question: question.id || question._id,
          selectedOption: answers[question.id || question._id],
        })),
      });
      const submittedResult = unwrap(response);
      setResult(submittedResult);
      setQuiz((current) => ({
        ...current,
        attemptsUsed: submittedResult.attemptsUsed,
        attemptsRemaining: submittedResult.attemptsRemaining,
        maxAttempts: submittedResult.maxAttempts,
      }));
      onCompleted?.();
    } catch (error) {
      if (error?.response?.data?.code === 'QUIZ_MAX_ATTEMPTS_REACHED') {
        setQuiz((current) => ({ ...current, attemptsRemaining: 0 }));
      }
      toast.error(error?.response?.data?.message || 'تعذر تسليم الاختبار');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className='grid h-full w-full place-items-center'><LoaderCircle className='animate-spin text-[#79A7FF]' /></div>;
  if (!quiz || !questions.length) return <div className='p-8 text-center text-white/75'>لا توجد أسئلة متاحة في هذا الاختبار.</div>;
  if (result) {
    const score = result.score || result;
    const canRetry = !result.passed && (result.attemptsRemaining === null || result.attemptsRemaining > 0);
    return <div className='flex h-full w-full items-center justify-center overflow-y-auto p-4 sm:p-8'><div className='w-full max-w-xl rounded-2xl bg-white p-6 text-center text-[#202936] shadow-2xl'><span className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{result.passed ? <CheckCircle2 size={32} /> : <XCircle size={32} />}</span><h2 className='mt-4 text-xl font-extrabold'>{result.passed ? 'أحسنت، اجتزت الاختبار!' : 'لم تصل إلى درجة النجاح بعد'}</h2><strong className={`mt-3 block text-4xl ${result.passed ? 'text-emerald-600' : 'text-red-600'}`}>{Math.round(Number(score.percentage) || 0)}%</strong><p className='mt-2 text-sm text-[#667085]'>أجبت عن {Number(score.correctCount) || 0} من {Number(score.totalQuestions) || questions.length} إجابات صحيحة</p>{result.maxAttempts != null && <p className='mt-2 text-xs font-bold text-[#667085]'>المحاولة {result.attemptsUsed} من {result.maxAttempts} · المتبقي {result.attemptsRemaining}</p>}<div className='mt-5 flex justify-center gap-2'>{canRetry && <button type='button' onClick={() => { setResult(null); setAnswers({}); setCurrentQuestion(0); }} className='inline-flex items-center gap-2 rounded-xl border border-[#123C91] px-5 py-2.5 text-sm font-bold text-[#123C91]'><RotateCcw size={16} />إعادة المحاولة</button>}<button type='button' onClick={onClose} className='rounded-xl bg-[#123C91] px-5 py-2.5 text-sm font-bold text-white'>العودة للدروس</button></div></div></div>;
  }

  const question = questions[currentQuestion];
  const questionId = question.id || question._id;
  return <div dir='rtl' className='h-full w-full overflow-y-auto bg-[#F8FAFC] p-3 text-[#202936] sm:p-6'><div className='mx-auto w-full max-w-3xl rounded-2xl border border-[#DDE3E9] bg-white p-4 shadow-sm sm:p-6'><div className='flex items-start justify-between gap-3'><div><span className='mb-1 inline-flex items-center gap-1 text-xs font-bold text-[#123C91]'><CircleHelp size={15} />اختبار الدورة</span><h2 className='text-lg font-extrabold'>{quiz.title}</h2><p className='mt-1 text-xs text-[#667085]'>{questions.length} أسئلة · النجاح من {quiz.passingPercentage}% · المحاولات المتبقية {quiz.attemptsRemaining ?? 'غير محدودة'}</p></div><b className='shrink-0 text-sm text-[#123C91]'>{Object.keys(answers).length}/{questions.length}</b></div><div className='my-4 grid gap-1.5' style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }}>{questions.map((item, index) => <button key={item.id || item._id} type='button' onClick={() => setCurrentQuestion(index)} className={`h-2 rounded-full ${answers[item.id || item._id] ? 'bg-[#12C6B0]' : index === currentQuestion ? 'bg-[#123C91]' : 'bg-gray-200'}`} aria-label={`السؤال ${index + 1}`} />)}</div><div className='rounded-xl border border-[#DDE3E9] p-4 sm:p-5'><span className='rounded-full bg-[#EAF4FF] px-3 py-1 text-xs font-bold text-[#123C91]'>السؤال {currentQuestion + 1}</span><h3 className='my-4 font-bold'>{question.text}</h3><div className='space-y-2'>{question.options.map((option) => { const optionId = option.id || option._id; return <label key={optionId} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${answers[questionId] === optionId ? 'border-[#123C91] bg-[#F0F4F8]' : 'border-gray-200 hover:bg-gray-50'}`}><span>{option.text}</span><input type='radio' name={`question-${questionId}`} checked={answers[questionId] === optionId} onChange={() => setAnswers((current) => ({ ...current, [questionId]: optionId }))} /></label>; })}</div></div><div className='mt-4 flex justify-between gap-2'><button type='button' disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((value) => value - 1)} className='rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-40'>السابق</button>{currentQuestion < questions.length - 1 ? <button type='button' onClick={() => setCurrentQuestion((value) => value + 1)} className='rounded-xl bg-[#123C91] px-5 py-2 text-xs font-bold text-white'>التالي</button> : <button type='button' disabled={submitting || quiz.attemptsRemaining === 0} onClick={submit} className='rounded-xl bg-[#12C6B0] px-5 py-2 text-xs font-bold text-white disabled:opacity-50'>{submitting ? 'جاري التسليم...' : 'تسليم الاختبار'}</button>}</div></div></div>;
}
