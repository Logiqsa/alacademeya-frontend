import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Trophy, Download } from "lucide-react";
import StudentLayout from "../../../components/student/layout/StudentLayout";

// ─── Mock exam + correct answers (would come from API in real app) ────────
const MOCK_EXAM = {
  title: "امتحان الرياضيات",
  studentName: "محمد",
  totalGrade: 15,
  questions: [
    {
      id: 1,
      text: "ما مجموع زوايا المثلث",
      options: ["180", "140", "210", "170"],
      correctIndex: 0,
    },
    {
      id: 2,
      text: "ما مجموع زوايا الشكل الخماسي",
      options: ["180", "540", "360", "450"],
      correctIndex: 1,
    },
    {
      id: 3,
      text: "ما مجموع زوايا المربع",
      options: ["180", "140", "360", "170"],
      correctIndex: 2,
    },
  ],
};

const QuestionReview = ({ index, question, selectedIndex }) => {
  const isCorrect = selectedIndex === question.correctIndex;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm p-5" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isCorrect ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}
        >
          {isCorrect ? "إجابة صحيحة" : "إجابة خاطئة"}
        </span>
        <p className="text-xs text-[#9CA3AF]">
          {["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"][index] ?? index + 1} السؤال
        </p>
      </div>

      <h3 className="text-[16px] font-semibold text-[#1F2937] mb-4">{question.text}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          const isCorrectOption = i === question.correctIndex;
          const isSelectedWrong = i === selectedIndex && !isCorrect;

          let classes = "border-[#E5E5E5] bg-[#F9FAFA] text-[#1F2937]";
          if (isCorrectOption) classes = "border-green-300 bg-green-50 text-green-700";
          if (isSelectedWrong) classes = "border-red-300 bg-red-50 text-red-700";

          return (
            <div
              key={i}
              className={`flex items-center justify-between gap-2 px-4 py-3 rounded-lg border text-sm ${classes}`}
            >
              <span>{opt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ExamResultPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const location = useLocation();
  const exam = MOCK_EXAM;

  const answers = location.state?.answers || { 1: 0, 2: 1, 3: 3 };

  const score = exam.questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctIndex ? 1 : 0),
    0
  );

  return (
    <StudentLayout>
      <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right  mx-auto" dir="rtl">
        {/* Score header */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-sm p-6 text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-[#EAF4FF] flex items-center justify-center mx-auto mb-3">
            <Trophy size={26} className="text-[#123C91]" />
          </div>
          <h2 className="text-lg font-bold text-[#1F2937] mb-1">
            عمل رائع يا {exam.studentName}!
          </h2>
          <p className="text-sm text-[#6B7280] mb-2">
            لقد أتممت الاختبار بنجاح وحصلت على:
          </p>
          <p className="text-2xl font-bold text-[#123C91]">
            {score}/{exam.totalGrade}
          </p>
        </div>

        {/* Questions review */}
        <div className="flex flex-col gap-5 mb-6">
          {exam.questions.map((q, i) => (
            <QuestionReview
              key={q.id}
              index={i}
              question={q}
              selectedIndex={answers[q.id]}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/student-dashboard")}
            className="w-full sm:flex-1 h-12 bg-[#123C91] text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
          >
            الرجوع إلى لوحة التحكم
          </button>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto sm:px-10 h-12 text-[#575F69] bg-white border border-[#E5E5E5] font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Download size={16} />
            تنزيل
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default ExamResultPage;