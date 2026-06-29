import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

const emptyQuestion = () => ({
  id: Date.now(),
  text: '',
  options: ['', ''],
  correctOption: null,
  score: 1,
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
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => onDelete(question.id)} className="p-1.5 text-[#8C9198] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-[#EAF4FF] text-[#123C91] text-xs font-semibold px-3 py-1 rounded-full">اختيار من متعدد</span>
          <span className="text-[#8C9198] text-xs">✦ تصحيح تلقائي</span>
        </div>
      </div>

      {/* Question text */}
      <div>
        <label className="block font-['Tajawal'] font-medium text-[14px] text-[#1F2937] pb-1">السؤال</label>
        <textarea
          value={question.text}
          onChange={(e) => onChange({ ...question, text: e.target.value })}
          placeholder="ما مجموع زوايا المثلث"
          rows={2}
          className="w-full px-4 py-3 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[14px] text-right resize-none focus:outline-none focus:ring-2 focus:ring-[#123C91] placeholder:text-[#8C9198]"
        />
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => removeOption(i)}
              className="text-[#8C9198] hover:text-red-400 transition-colors shrink-0"
              title="حذف الخيار"
            >
              ×
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`خيار ${i + 1}`}
                className={`w-full h-10 px-3 border rounded-lg bg-[#F9FAFA] font-['IBM_Plex_Sans_Arabic'] text-[13px] text-right focus:outline-none focus:ring-2 transition-all placeholder:text-[#8C9198]
                  ${question.correctOption === i ? 'border-[#00A63E] focus:ring-green-300 bg-[#F0FFF4]' : 'border-[#E5E5E5] focus:ring-[#123C91]'}`}
              />
            </div>
            <button
              onClick={() => onChange({ ...question, correctOption: i })}
              className={`shrink-0 transition-colors ${question.correctOption === i ? 'text-[#00A63E]' : 'text-[#D1D5DB] hover:text-[#00A63E]'}`}
              title="تحديد كإجابة صحيحة"
            >
              <CheckCircle2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add option + score */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label className="font-['Tajawal'] text-[13px] text-[#575F69]">درجة السؤال:</label>
          <input
            type="number"
            min="0"
            value={question.score}
            onChange={(e) => onChange({ ...question, score: Number(e.target.value) })}
            className="w-16 h-8 px-2 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-center font-['IBM_Plex_Sans_Arabic'] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#123C91]"
          />
        </div>
        {question.options.length < 6 && (
          <button onClick={addOption} className="flex items-center gap-1 text-[#123C91] text-[13px] font-medium hover:underline">
            <Plus size={14} /> إضافة خيار جديد
          </button>
        )}
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
        <div className="flex items-center justify-between text-[13px] text-[#8C9198] px-1">
          <span>الدرجة الكلية: <strong className="text-[#123C91]">{totalScore}</strong></span>
          <span>اختيار من متعدد: <strong className="text-[#123C91]">{questions.length}</strong></span>
        </div>
      )}

      {/* Hint */}
      <div className="flex items-center gap-2 bg-[#EAF4FF] rounded-xl px-4 py-3 text-[#123C91] text-[13px]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>يرجى استكمال جميع الأسئلة (النص مطلوب، والخيارات يجب ألا تكون فارغة ثم قم بتحديد الإجابة الصحيحة)</span>
      </div>

      {error && <p className="text-red-500 text-[13px] text-right">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium cursor-pointer text-[14px] sm:text-[16px]">السابق</button>
        <button onClick={handleNext} className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium cursor-pointer text-[14px] sm:text-[16px]">التالي</button>
      </div>
    </div>
  );
};

export default ExamQuestionsStep;