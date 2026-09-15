import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Banknote, BookOpen, CircleCheckBig, Clock3, FilePenLine, HandCoins, Plus, RefreshCw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";
import { fetchTeacherCourses } from "../../features/course-management/api/coursesApi";
import { getEarningsSummary } from "../../features/instructor-earnings/api/earningsApi";
import { getInstructorBalance, getWithdrawals } from "../../features/instructor-payouts/api/payoutsApi";
import { formatMoney } from "../../utils/currencyDisplay";

const withdrawalLabels = {
  requested: "قيد المراجعة",
  approved: "تمت الموافقة",
  paid: "تم التحويل",
  rejected: "مرفوض",
  cancelled: "ملغي",
};

export default function InstructorDashboardPage() {
  const [state, setState] = useState({ loading: true, courses: [], summary: null, balances: [], withdrawals: [], errors: [] });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, errors: [] }));
    const results = await Promise.allSettled([
      fetchTeacherCourses(),
      getEarningsSummary(),
      getInstructorBalance(),
      getWithdrawals({ page: 1, limit: 3 }),
    ]);
    setState({
      loading: false,
      courses: results[0].status === "fulfilled" ? results[0].value : [],
      summary: results[1].status === "fulfilled" ? results[1].value : null,
      balances: results[2].status === "fulfilled" ? results[2].value : [],
      withdrawals: results[3].status === "fulfilled" ? results[3].value.items : [],
      errors: results.filter((result) => result.status === "rejected").map((result) => result.reason?.message || "تعذر تحميل بعض البيانات"),
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const counts = useMemo(() => {
    const count = (status) => state.courses.filter((course) => course.rawStatus === status).length;
    return {
      all: state.courses.length,
      draft: count("draft"),
      pending: count("pending_review"),
      published: count("published"),
      rejected: count("rejected"),
    };
  }, [state.courses]);

  const available = state.balances.filter((item) => Number(item.available) > 0);
  const latestWithdrawal = state.withdrawals[0];
  const cards = [
    { label: "كل دوراتي", value: counts.all, icon: BookOpen, tone: "bg-[#EAF2FF] text-[#123C91]" },
    { label: "مسودات", value: counts.draft, icon: FilePenLine, tone: "bg-slate-100 text-slate-700" },
    { label: "قيد المراجعة", value: counts.pending, icon: Clock3, tone: "bg-amber-50 text-amber-700" },
    { label: "منشورة", value: counts.published, icon: CircleCheckBig, tone: "bg-emerald-50 text-emerald-700" },
    { label: "مرفوضة", value: counts.rejected, icon: XCircle, tone: "bg-red-50 text-red-700" },
  ];

  return (
    <TeacherLayout breadcrumbCurrentLabel="لوحة المحاضر">
      <main dir="rtl" className="mx-auto w-full max-w-400 space-y-6 pb-8 font-['IBM_Plex_Sans_Arabic']">
        <header className="overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#176FA5] p-6 text-white shadow-[0_12px_30px_rgba(18,60,145,0.18)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-bold text-[#8FE9DE]">سوق دورات الأكاديمية</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">لوحة المحاضر</h1><p className="mt-2 text-sm leading-7 text-white/75">تابع دوراتك ومراجعات النشر وأرباحك من مكان واحد.</p></div>
            <Link to="/teacher/courses/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold !text-[#123C91] shadow-sm"><Plus size={18} />إنشاء دورة جديدة</Link>
          </div>
        </header>

        {state.loading ? <div className="grid min-h-64 place-items-center rounded-2xl border bg-white text-[#667085]">جاري تحميل لوحة المحاضر...</div> : <>
          {!!state.errors.length && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><span className="flex items-center gap-2"><AlertCircle size={18} />تعذر تحميل بعض أقسام اللوحة، والبيانات الظاهرة متاحة من المصادر التي استجابت.</span><button type="button" onClick={load} className="inline-flex items-center gap-2 font-bold text-[#123C91]"><RefreshCw size={15} />إعادة المحاولة</button></div>}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map(({ label, value, icon: Icon, tone }) => <Link key={label} to="/teacher/courses" className="flex items-center gap-3 rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon size={21} /></span><span><strong className="block text-xl text-[#1F2937]">{value}</strong><span className="text-xs font-semibold text-[#667085]">{label}</span></span></Link>)}
          </section>

          {!state.courses.length ? <section className="rounded-2xl border border-dashed border-[#BFCDE0] bg-white px-5 py-12 text-center"><BookOpen className="mx-auto text-[#123C91]" size={38} /><h2 className="mt-4 text-xl font-extrabold text-[#1F2937]">لا توجد دورات بعد</h2><p className="mt-2 text-sm text-[#667085]">أنشئ دورتك الأولى وابدأ تجهيز محتواها للمراجعة.</p><Link to="/teacher/courses/new" className="mx-auto mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#123C91] px-6 font-bold !text-white"><Plus size={17} />إنشاء أول دورة</Link></section> : <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E1E7EF] bg-white p-5 shadow-sm"><div><h2 className="font-extrabold text-[#1F2937]">إدارة الدورات</h2><p className="mt-1 text-sm text-[#667085]">راجع المحتوى وحالات الإرسال وقرارات فريق المراجعة.</p></div><Link to="/teacher/courses" className="rounded-xl border border-[#123C91] px-5 py-2.5 text-sm font-bold text-[#123C91]">عرض دوراتي</Link></section>}

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#E1E7EF] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Banknote size={21} /></span><div><h2 className="font-extrabold text-[#1F2937]">ملخص الأرباح</h2><p className="text-xs text-[#667085]">{state.summary ? `${state.summary.salesCount} عملية بيع` : "الملخص غير متاح"}</p></div></div><div className="mt-4 space-y-2">{state.summary?.currencies?.length ? state.summary.currencies.map((item) => <div key={item.currency} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] p-3"><span className="text-sm text-[#667085]">إجمالي {item.currency}</span><strong dir="ltr">{formatMoney(item.amount, item.currency)}</strong></div>) : <p className="rounded-xl bg-[#F8FAFC] p-4 text-center text-sm text-[#98A2B3]">لا توجد أرباح مسجلة حتى الآن.</p>}</div><Link to="/teacher/earnings" className="mt-4 inline-block text-sm font-bold text-[#123C91]">عرض تفاصيل الأرباح ←</Link></article>
            <article className="rounded-2xl border border-[#E1E7EF] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#EAF2FF] text-[#123C91]"><HandCoins size={21} /></span><div><h2 className="font-extrabold text-[#1F2937]">الرصيد والسحوبات</h2><p className="text-xs text-[#667085]">الأرصدة المتاحة وحالة آخر طلب</p></div></div><div className="mt-4 space-y-2">{available.length ? available.map((item) => <div key={item.currency} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] p-3"><span className="text-sm text-[#667085]">متاح للسحب · {item.currency}</span><strong dir="ltr">{formatMoney(item.available, item.currency)}</strong></div>) : <p className="rounded-xl bg-[#F8FAFC] p-4 text-center text-sm text-[#98A2B3]">لا يوجد رصيد متاح للسحب حاليًا.</p>}{latestWithdrawal && <p className="text-xs text-[#667085]">آخر طلب سحب: <strong>{withdrawalLabels[latestWithdrawal.status] || latestWithdrawal.status}</strong></p>}</div><Link to="/teacher/earnings#withdrawals" className="mt-4 inline-block text-sm font-bold text-[#123C91]">إدارة السحوبات ←</Link></article>
          </section>
        </>}
      </main>
    </TeacherLayout>
  );
}
