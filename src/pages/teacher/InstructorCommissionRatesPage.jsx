import { CircleOff, MessageCircle } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";
import { AuthContext } from "../../context/AuthContext";

const InstructorCommissionRatesPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  return (
    <TeacherLayout breadcrumbCurrentLabel="نسب العمولات">
      <main dir="rtl" className="mx-auto w-full max-w-400 space-y-6 p-2 font-['IBM_Plex_Sans_Arabic'] sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-1">نسب العمولات</h1>
            <p className="text-sm text-gray-500">نسبة عمولة المنصة المطبقة تلقائيًا على دوراتك</p>
          </div>
          {user?.role === "teacher" && (
            <button
              type="button"
              onClick={() => navigate("/teacher/messages", { state: { openSupportConversation: true } })}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#123C91] hover:bg-[#0e2f73] transition-colors rounded-lg px-4 py-2"
            >
              <MessageCircle size={16} />
              تواصل مع الإدارة
            </button>
          )}
        </div>

        <section className="grid min-h-72 place-items-center rounded-2xl border border-[#E3E8EF] bg-white p-6 text-center shadow-sm">
          <div className="max-w-lg">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EEF4FF] text-[#123C91]">
              <CircleOff size={26} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-[#1F2937]">بيانات نسب العمولات غير متاحة حاليًا</h2>
            <p className="mt-2 text-sm leading-7 text-[#667085]">
              لم يتم توفير واجهة خلفية معتمدة لعرض النسبة العامة أو النسب المخصصة للدورات بعد.
              ستظهر البيانات هنا عند إتاحة المصدر المالي المعتمد.
            </p>
          </div>
        </section>
      </main>
    </TeacherLayout>
  );
};

export default InstructorCommissionRatesPage;
