import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Zap, Info, X } from 'lucide-react';

const emptyQuestion = () => ({
  id: Date.now(),
  text: '',
  options: ['', ''],
  correctOption: null,
  score: 0,
  type: 'mcq',
});

const QuestionCard = ({ question, index, onChange, onDelete }) => {
  const updateOption = (i, val) => {
    const opts = [...question.options];
    opts[i] = val;
    onChange({ ...question, options: opts });
  };

  const addOption = () => {
    if (question.options.length >= 6) return;
    onChange({ ...question, options: [...question.options, ''] });
  };

  const removeOption = (i) => {
    if (question.options.length <= 2) return;
    const opts = question.options.filter((_, idx) => idx !== i);
    const correct = question.correctOption === i ? null : question.correctOption > i ? question.correctOption - 1 : question.correctOption;
    onChange({ ...question, options: opts, correctOption: correct });
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#EAF4FF] text-[#123C91] text-[13px] font-bold px-3 py-1 rounded-full">اختيار من متعدد</span>
          <span className="w-px h-4 bg-[#E5E5E5]" />
          <span className="flex items-center gap-1 text-[#9CA3AF] text-[13px]">
            <Zap size={13} />
            تصحيح تلقائي
          </span>
        </div>
        <button onClick={() => onDelete(question.id)} className="text-[#9CA3AF] hover:text-red-500 transition-colors">
          <Trash2 size={17} />
        </button>

      </div>

      {/* Question text */}
      <div>
        <label className="block font-['Tajawal'] font-medium text-[14px] text-[#1F2937] pb-1.5">السؤال</label>
        <textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="ما مجموع زوايا المثلث"
          rows={2}
          className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] text-right resize-none focus:outline-none focus:ring-2 focus:ring-[#123C91] placeholder:text-[#8C9198]"
        />
      </div>

      {/* Options grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, i) => {
            const isCorrect = question.correctOption === i;
            return (
              <div key={i} className="group relative">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`خيار ${i + 1}`}
                  className={`w-full h-11 pr-3 pl-16 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] text-right focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198]
                    ${isCorrect ? 'border-[#00A63E] focus:ring-green-300 bg-[#F0FFF4]' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => onChange({ ...question, correctOption: i })}
                    className={`shrink-0 transition-colors ${isCorrect ? 'text-[#00A63E]' : 'text-[#D1D5DB] hover:text-[#00A63E]'}`}
                    title="تحديد كإجابة صحيحة"
                  >
                    <CheckCircle2 size={17} />
                  </button>
                  <button
                    onClick={() => removeOption(i)}
                    className="text-[#D1D5DB] hover:text-red-400 transition-colors shrink-0"
                    title="حذف الخيار"
                  >
                    <X size={15} />
                  </button>
                </div>
                {isCorrect && (
                  <CheckCircle2 size={17} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#00A63E] group-hover:opacity-0 transition-opacity" />
                )}
              </div>
            );
          })}
        </div>

        {question.options.length < 6 && (
          <button
            onClick={addOption}
            className="w-full h-11 flex items-center justify-center gap-1.5 border border-dashed border-[#C7D2E8] rounded-lg text-[#123C91] text-[13px] font-medium hover:bg-[#F9FAFA] transition-colors"
          >
            إضافة خيار جديد <Plus size={15} />
          </button>
        )}
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        <label className="font-['Tajawal'] text-[14px] text-[#1F2937]">درجة السؤال:</label>
        <input
          type="number"
          min="0"
          value={question.score}
          onChange={(e) => onChange({ ...question, score: Number(e.target.value) })}
          className="w-16 h-9 px-2 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-center font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91]"
        />
      </div>
    </div>
  );
};

const ExamQuestionsStep = ({ data, onChange, onNext, onBack }) => {
  const [error, setError] = useState('');

  const questions = data.questions || [];
  const totalScore = questions.reduce((s, q) => s + (Number(q.score) || 0), 0);

  const addQuestion = () => {
    onChange('questions', [...questions, emptyQuestion()]);
    setError('');
  };

  const updateQuestion = (updated) => {
    onChange('questions', questions.map((q) => q.id === updated.id ? updated : q));
  };

  const deleteQuestion = (id) => {
    onChange('questions', questions.filter((q) => q.id !== id));
  };

  const validate = () => {
    if (questions.length === 0) { setError('أضف سؤالاً واحداً على الأقل'); return false; }
    for (const q of questions) {
      if (!q.text.trim()) { setError('يرجى استكمال جميع الأسئلة (النص مطلوب)'); return false; }
      if (q.options.some((o) => !o.trim())) { setError('يرجى استكمال جميع الخيارات'); return false; }
      if (q.correctOption === null) { setError('يرجى تحديد الإجابة الصحيحة لكل سؤال'); return false; }
    }
    setError('');
    return true;
  };

  const handleNext = () => { if (validate()) onNext(); };

  return (
    <div dir="rtl" className="w-full p-2 space-y-4">
      <div>
        <h2 className="font-['IBM_Plex_Sans_Arabic'] font-medium text-[18px] sm:text-[20px] text-[#1F2937] mb-1">الأسئلة</h2>
        <p className="font-['IBM_Plex_Sans_Arabic'] text-[#575F69] text-[14px]">أضف أسئلة الاختبار وحدد الإجابات الصحيحة.</p>
      </div>

      {/* Add question button */}
      <button
        onClick={addQuestion}
        className="w-full h-12 bg-[#123C91] text-white rounded-xl font-['Tajawal'] font-medium text-[15px] flex items-center justify-center gap-2 hover:bg-[#0e2f73] transition-colors"
      >
        <Plus size={18} /> سؤال اختيار من متعدد
      </button>

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionCard key={q.id} question={q} index={i} onChange={updateQuestion} onDelete={deleteQuestion} />
        ))}
      </div>

      {/* Footer summary */}
      {questions.length > 0 && (
        <div className="flex items-center justify-between text-[16px] text-[#8C9198] px-1">
          <span>اختيار من متعدد: <strong className="text-[#123C91]">{questions.length}</strong></span>
          <span>الدرجة الكلية: <strong className="text-[#123C91]">{totalScore}</strong></span>
        </div>
      )}

      {/* Hint */}
      <div className="flex items-center gap-2 bg-[#EAF4FF] rounded-xl px-4 py-3 text-[#123C91] text-[13px]">
        <Info size={16} className="shrink-0" />
        <span>يرجى استكمال جميع الأسئلة (النص مطلوب، والخيارات يجب ألا تكون فارغة ثم قم بتحديد الإجابة الصحيحة)</span>
      </div>

      {error && <p className="text-red-500 text-[13px] text-right">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <button onClick={handleNext} className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px]">التالي</button>
        <button onClick={onBack} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]">السابق</button>
      </div>
    </div>
  );
};

export default ExamQuestionsStep;