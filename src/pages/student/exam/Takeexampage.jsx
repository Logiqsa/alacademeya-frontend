import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock } from "lucide-react";

// ─── Mock exam data ────────────────────────────────────────────────────────
const MOCK_EXAM = {
  title: "امتحان الرياضيات",
  durationSeconds: 30 * 60,
  questions: [
    {
      id: 1,
      text: "ما مجموع زوايا المثلث",
      options: ["180", "140", "210", "170"],
    },
    {
      id: 2,
      text: "ما مجموع زوايا الشكل الخماسي",
      options: ["180", "540", "360", "450"],
    },
    {
      id: 3,
      text: "ما مجموع زوايا المربع",
      options: ["180", "140", "360", "170"],
    },
  ],
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const QuestionCard = ({ index, question, selected, onSelect }) => (
  <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm p-5" dir="rtl">
    <p className="text-xs text-[#9CA3AF] mb-2">
      {["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"][index] ?? index + 1} السؤال
    </p>
    <h3 className="text-[16px] font-semibold text-[#1F2937] mb-4">{question.text}</h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {question.options.map((opt, i) => {
        const isChecked = selected === i;
        return (
          <label
            key={i}
            className={`
              flex items-center justify-between gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors
              ${isChecked ? "border-[#123C91] bg-[#EAF4FF]" : "border-[#E5E5E5] bg-[#F9FAFA] hover:border-[#123C91]/30"}
            `}
          >
            <span className="text-sm text-[#1F2937]">{opt}</span>
            <input
              type="radio"
              name={`q-${question.id}`}
              checked={isChecked}
              onChange={() => onSelect(i)}
              className="w-4 h-4 accent-[#123C91]"
            />
          </label>
        );
      })}
    </div>
  </div>
);

const TakeExamPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const exam = MOCK_EXAM;

  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(exam.durationSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const handleSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    navigate(`/student/exams/${examId}/result`, { state: { answers } });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFA] p-1 sm:p-6" dir="rtl" style={{ fontFamily: "IBM Plex Sans Arabic, sans-serif" }}>
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-[#123C91]">{exam.title}</h1>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 text-red-600 font-semibold text-sm">
              <Clock size={16} />
              {formatTime(secondsLeft)}
            </span>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-[#123C91] text-white text-sm font-semibold hover:bg-[#0F2F73] transition-colors"
            >
              تسليم الاختبار
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="flex flex-col gap-5">
          {exam.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              index={i}
              question={q}
              selected={answers[q.id]}
              onSelect={(optIndex) => handleSelect(q.id, optIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TakeExamPage;