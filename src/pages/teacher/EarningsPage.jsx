import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Filter, History, RefreshCw } from "lucide-react";
import TeacherLayout from "../../components/teacher/layout/TeacherLayout";
import EarningsStatsBar from "../../components/teacher/earnings/EarningsStatsBar";
import EarningsFilters from "../../components/teacher/earnings/EarningsFilters";
import EarningsTable from "../../components/teacher/earnings/EarningsTable";
import EarningsTimelineChart from "../../components/teacher/earnings/EarningsTimelineChart";
import CourseEarningsAnalytics from "../../components/teacher/earnings/CourseEarningsAnalytics";
import InstructorPayoutDashboard from "../../components/teacher/earnings/InstructorPayoutDashboard";
import Paginationn from "../../components/teacher/groups/students/Paginationn";
import LoadingState from "../../components/shared/LoadingState";
import { getSavedPageSize } from "../../utils/tablePagination";
import { getApiErrorMessage } from "../../services/apiError";
import {
  getEarningsCourses,
  getEarningsHistory,
  getEarningsSummary,
  getEarningsTimeline,
} from "../../features/instructor-earnings/api/earningsApi";

const EMPTY_FILTERS = { from: "", to: "", courseId: "", currency: "" };
const initialSection = (data) => ({ data, loading: true, error: "" });

const EarningsPage = () => {
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [interval, setIntervalValue] = useState("daily");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(10));
  const [refreshKey, setRefreshKey] = useState(0);
  const [sections, setSections] = useState({
    summary: initialSection(null),
    history: initialSection({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
    courses: initialSection([]),
    timeline: initialSection([]),
  });

  const query = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);
  const setPending = useCallback((names) => setSections((current) => {
    const next = { ...current };
    names.forEach((name) => { next[name] = { ...current[name], loading: true, error: "" }; });
    return next;
  }), []);
  const settle = useCallback((name, result, fallback) => setSections((current) => ({
    ...current,
    [name]: result.status === "fulfilled"
      ? { data: result.value, loading: false, error: "" }
      : { ...current[name], loading: false, error: getApiErrorMessage(result.reason, fallback) },
  })), []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getEarningsSummary(query)]).then(([summary]) => {
      if (!active) return;
      settle("summary", summary, "تعذر تحميل ملخص الأرباح");
    });
    return () => { active = false; };
  }, [query, refreshKey, settle]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getEarningsTimeline({ ...query, interval })]).then(([result]) => { if (active) settle("timeline", result, "تعذر تحميل مخطط الأرباح"); });
    return () => { active = false; };
  }, [interval, query, refreshKey, settle]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getEarningsHistory({ ...query, page, limit: pageSize })]).then(([history]) => {
      if (!active) return;
      settle("history", history, "تعذر تحميل سجل الأرباح");
    });
    return () => { active = false; };
  }, [page, pageSize, query, refreshKey, settle]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getEarningsCourses(query)]).then(([courses]) => {
      if (!active) return;
      settle("courses", courses, "تعذر تحميل أداء الدورات");
    });
    return () => { active = false; };
  }, [query, refreshKey, settle]);

  const retrySection = async (name) => {
    setPending([name]);
    const requests = {
      summary: () => getEarningsSummary(query),
      history: () => getEarningsHistory({ ...query, page, limit: pageSize }),
      courses: () => getEarningsCourses(query),
      timeline: () => getEarningsTimeline({ ...query, interval }),
    };
    const fallbacks = { summary: "تعذر تحميل ملخص الأرباح", history: "تعذر تحميل سجل الأرباح", courses: "تعذر تحميل أداء الدورات", timeline: "تعذر تحميل مخطط الأرباح" };
    const [result] = await Promise.allSettled([requests[name]()]);
    settle(name, result, fallbacks[name]);
  };

  const courseOptions = useMemo(() => {
    const values = [...sections.courses.data, ...sections.history.data.items.map((item) => ({ id: item.courseId, title: item.course }))];
    return [...new Map(values.filter((item) => item.id).map((item) => [String(item.id), item])).values()];
  }, [sections.courses.data, sections.history.data.items]);
  const currencyOptions = useMemo(() => [...new Set([
    ...(sections.summary.data?.currencies || []).map((item) => item.currency),
    ...sections.courses.data.map((item) => item.currency),
    ...sections.history.data.items.map((item) => item.currency),
  ].filter(Boolean))].sort(), [sections]);
  const anyLoading = Object.values(sections).some((section) => section.loading);

  const applyFilters = () => { setPending(["summary", "history", "courses"]); setPage(1); setFilters({ ...draftFilters }); setRefreshKey((value) => value + 1); };
  const resetFilters = () => { setPending(["summary", "history", "courses"]); setDraftFilters(EMPTY_FILTERS); setPage(1); setFilters(EMPTY_FILTERS); setRefreshKey((value) => value + 1); };
  const changeInterval = (value) => { if (value !== interval) { setPending(["timeline"]); setIntervalValue(value); } };

  return <TeacherLayout>
    <main className="mx-auto w-full max-w-400 pb-8 text-right font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      <header className="relative mb-6 overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#1E55B3] px-5 py-6 text-white shadow-[0_10px_30px_rgba(18,60,145,0.18)] sm:px-7 sm:py-8">
        <div className="absolute -left-10 -top-14 h-40 w-40 rounded-full bg-[#12C6B0]/20 blur-sm" aria-hidden="true" />
        <div className="absolute -bottom-16 left-24 h-32 w-32 rounded-full bg-white/8" aria-hidden="true" />
        <div className="relative flex items-center gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/15"><BarChart3 size={25} /></div>
          <div><p className="mb-1 text-xs font-semibold text-[#8DE9DE]">لوحة المحاضر</p><h1 className="text-2xl font-bold sm:text-3xl">أرباح الدورات</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">تابع مبيعات دوراتك وعمولة المنصة وصافي أرباحك من مكان واحد.</p></div>
        </div>
      </header>

      <div role="region" aria-labelledby="earnings-filters-title" className="mb-6 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_4px_16px_rgba(16,24,40,0.04)] sm:p-5">
        <SectionHeading id="earnings-filters-title" icon={Filter} title="تصفية النتائج" description="خصص البيانات حسب الفترة أو الدورة أو العملة" />
        <EarningsFilters filters={draftFilters} courses={courseOptions} currencies={currencyOptions} onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))} onApply={applyFilters} onReset={resetFilters} loading={anyLoading} />
      </div>

      <div className="space-y-6">
        <InstructorPayoutDashboard />
        <SectionState section={sections.summary} retry={() => retrySection("summary")}><EarningsStatsBar summary={sections.summary.data} /></SectionState>
        <SectionState section={sections.timeline} retry={() => retrySection("timeline")}><EarningsTimelineChart points={sections.timeline.data} interval={interval} onIntervalChange={changeInterval} /></SectionState>
        <SectionState section={sections.courses} retry={() => retrySection("courses")}><CourseEarningsAnalytics courses={sections.courses.data} /></SectionState>
        <div role="region" aria-labelledby="earnings-history-title" className="space-y-4">
          <SectionHeading id="earnings-history-title" icon={History} title="سجل الأرباح" description="تفاصيل كل عملية بيع وخصم عمولة المنصة" />
          <SectionState section={sections.history} retry={() => retrySection("history")}>
            <EarningsTable earnings={sections.history.data.items} />
            {sections.history.data.pagination.totalPages > 1 && <div className="mt-3"><Paginationn page={sections.history.data.pagination.page || page} totalPages={sections.history.data.pagination.totalPages} onChange={(value) => { setPending(["history"]); setPage(value); }} totalItems={sections.history.data.pagination.total} displayedCount={sections.history.data.items.length} unitLabel="عملية" pageSize={pageSize} onPageSizeChange={(value) => { setPending(["history"]); setPage(1); setPageSize(value); }} /></div>}
          </SectionState>
        </div>
      </div>
    </main>
  </TeacherLayout>;
};

const SectionHeading = ({ id, icon: Icon, title, description }) => <div className="mb-4 flex items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[#123C91]"><Icon size={19} /></div><div><h2 id={id} className="text-base font-bold text-[#1F2937] sm:text-lg">{title}</h2><p className="mt-0.5 text-xs text-[#667085] sm:text-sm">{description}</p></div></div>;

const SectionState = ({ section, retry, children }) => {
  if (section.loading) return <div className="rounded-2xl border border-gray-200 bg-white"><LoadingState compact /></div>;
  if (section.error) return <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700"><AlertCircle size={24} /><span>{section.error}</span><button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-[#123C91] shadow-sm"><RefreshCw size={15} />إعادة المحاولة</button></div>;
  return children;
};

export default EarningsPage;
