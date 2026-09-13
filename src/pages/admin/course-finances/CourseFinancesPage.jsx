import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, BarChart3, BookOpen, Check, ChevronDown, Filter, GraduationCap, LoaderCircle, RefreshCw, Search, ShoppingCart, WalletCards, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Paginationn from "../../../components/teacher/groups/students/Paginationn";
import LoadingState from "../../../components/shared/LoadingState";
import { getSavedPageSize } from "../../../utils/tablePagination";
import { formatMoney } from "../../../utils/currencyDisplay";
import { getApiErrorMessage } from "../../../services/apiError";
import { getAssetUrl } from "../../../services/APIService";
import { fetchPublicInstructor } from "../../../features/course-management/api/coursesApi";
import { getCourseEarningsByCourse, getCourseEarningsByInstructor, getCourseEarningsLedger, getCourseEarningsSummary } from "../../../features/admin-finances/api/courseEarningsApi";

const EMPTY_FILTERS = { from: "", to: "", courseId: "", instructorId: "", currency: "" };
const initialSection = (data) => ({ data, loading: true, error: "" });
const money = (value, currency) => formatMoney(Number(value || 0), currency || "EGP");
const date = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(parsed) : "—";
};
const isoDate = (value) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const periodDates = (interval) => {
  const today = new Date();
  return interval === "monthly"
    ? { from: isoDate(new Date(today.getFullYear(), today.getMonth(), 1)), to: isoDate(today) }
    : { from: isoDate(today), to: isoDate(today) };
};
const CourseFinancesPage = () => {
  const [draftFilters, setDraftFilters] = useState(() => ({ ...EMPTY_FILTERS, ...periodDates("daily") }));
  const [filters, setFilters] = useState(() => ({ ...EMPTY_FILTERS, ...periodDates("daily") }));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(10));
  const [refreshKey, setRefreshKey] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [sections, setSections] = useState({ summary: initialSection(null), courses: initialSection([]), instructors: initialSection([]), ledger: initialSection({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }) });
  const query = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")), [filters]);
  const setPending = useCallback((names) => setSections((current) => { const next = { ...current }; names.forEach((name) => { next[name] = { ...current[name], loading: true, error: "" }; }); return next; }), []);
  const settle = useCallback((name, result, fallback) => setSections((current) => ({ ...current, [name]: result.status === "fulfilled" ? { data: result.value, loading: false, error: "" } : { ...current[name], loading: false, error: getApiErrorMessage(result.reason, fallback) } })), []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCourseEarningsSummary(query), getCourseEarningsByCourse(query), getCourseEarningsByInstructor(query), getCourseEarningsLedger({ ...query, page, limit: pageSize })]).then(([summary, courses, instructors, ledger]) => {
      if (!active) return;
      settle("summary", summary, "تعذر تحميل الملخص المالي"); settle("courses", courses, "تعذر تحميل أداء الدورات"); settle("instructors", instructors, "تعذر تحميل أداء المحاضرين"); settle("ledger", ledger, "تعذر تحميل سجل المبيعات"); setInitialized(true);
    });
    return () => { active = false; };
  }, [page, pageSize, query, refreshKey, settle]);

  const retry = async (name) => {
    setPending([name]);
    const calls = { summary: () => getCourseEarningsSummary(query), courses: () => getCourseEarningsByCourse(query), instructors: () => getCourseEarningsByInstructor(query), ledger: () => getCourseEarningsLedger({ ...query, page, limit: pageSize }) };
    const messages = { summary: "تعذر تحميل الملخص المالي", courses: "تعذر تحميل أداء الدورات", instructors: "تعذر تحميل أداء المحاضرين", ledger: "تعذر تحميل سجل المبيعات" };
    const [result] = await Promise.allSettled([calls[name]()]); settle(name, result, messages[name]);
  };
  const courseOptions = useMemo(() => [...new Map([...sections.courses.data, ...sections.ledger.data.items].filter((item) => item.courseId || item.id).map((item) => [String(item.courseId || item.id), { id: item.courseId || item.id, name: item.course }])).values()], [sections.courses.data, sections.ledger.data.items]);
  const instructorOptions = useMemo(() => [...new Map([...sections.instructors.data, ...sections.courses.data, ...sections.ledger.data.items].filter((item) => item.instructorId || item.id).map((item) => [String(item.instructorId || item.id), { id: item.instructorId || item.id, name: item.instructor }])).values()], [sections.courses.data, sections.instructors.data, sections.ledger.data.items]);
  const currencies = useMemo(() => [...new Set([...(sections.summary.data?.currencies || []).map((item) => item.currency), ...sections.courses.data.map((item) => item.currency), ...sections.ledger.data.items.map((item) => item.currency)].filter(Boolean))].sort(), [sections]);
  const anyLoading = Object.values(sections).some((item) => item.loading);
  const applyFilters = () => {
    if (draftFilters.from && draftFilters.to && draftFilters.from > draftFilters.to) {
      toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية");
      return;
    }
    setPending(Object.keys(sections)); setPage(1); setFilters({ ...draftFilters }); setRefreshKey((value) => value + 1);
  };
  const resetFilters = () => { const defaults = { ...EMPTY_FILTERS, ...periodDates("daily") }; setPending(Object.keys(sections)); setDraftFilters(defaults); setFilters(defaults); setPage(1); setRefreshKey((value) => value + 1); };

  return <AdminLayout><main dir="rtl" className="mx-auto w-full max-w-400 space-y-6 pb-10 text-right font-['IBM_Plex_Sans_Arabic']">
    <header className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#17689A] px-5 py-7 text-white shadow-[0_10px_30px_rgba(18,60,145,.18)] sm:px-7"><div className="absolute -left-10 -top-14 size-40 rounded-full bg-[#12C6B0]/20" /><div className="relative flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl bg-white/12"><BarChart3 /></span><div><p className="text-xs font-bold text-[#8DE9DE]">لوحة الإدارة المالية</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">مالية الدورات</h1><p className="mt-2 text-sm text-white/75">تحليل المبيعات وعمولة المنصة وصافي مستحقات المحاضرين.</p></div></div></header>
    <Filters value={draftFilters} courses={courseOptions} instructors={instructorOptions} currencies={currencies} loading={anyLoading} onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))} onApply={applyFilters} onReset={resetFilters} />
    {!initialized ? <div className="rounded-2xl border bg-white"><LoadingState label="جاري تحميل البيانات المالية..." /></div> : <>
      <Section section={sections.summary} retry={() => retry("summary")}><Summary data={sections.summary.data} /></Section>
      <Section section={sections.courses} retry={() => retry("courses")}><AnalyticsTable title="أداء الدورات" type="courses" items={sections.courses.data} onInstructor={setSelectedInstructor} /></Section>
      <Section section={sections.instructors} retry={() => retry("instructors")}><AnalyticsTable title="أداء المحاضرين" type="instructors" items={sections.instructors.data} onInstructor={setSelectedInstructor} /></Section>
      <Section section={sections.ledger} retry={() => retry("ledger")}><Ledger items={sections.ledger.data.items} onInstructor={setSelectedInstructor} />{sections.ledger.data.pagination.totalPages > 1 && <div className="mt-3"><Paginationn page={sections.ledger.data.pagination.page || page} totalPages={sections.ledger.data.pagination.totalPages} onChange={(value) => { setPending(["ledger"]); setPage(value); }} totalItems={sections.ledger.data.pagination.total} displayedCount={sections.ledger.data.items.length} unitLabel="عملية" pageSize={pageSize} onPageSizeChange={(value) => { setPending(["ledger"]); setPage(1); setPageSize(value); }} /></div>}</Section>
    </>}
    {selectedInstructor && <InstructorModal instructor={selectedInstructor} onClose={() => setSelectedInstructor(null)} />}
  </main></AdminLayout>;
};

const Filters = ({ value, courses, instructors, currencies, loading, onChange, onApply, onReset }) => <div className="rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-sm sm:p-5"><Heading icon={Filter} title="تصفية النتائج" subtitle="بدون فترة محددة يعرض المخطط اليوم الحالي أو الشهر الحالي" /><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><Field label="من تاريخ"><input type="date" value={value.from} onChange={(e) => onChange("from", e.target.value)} /></Field><Field label="إلى تاريخ"><input type="date" value={value.to} onChange={(e) => onChange("to", e.target.value)} /></Field><SearchableSelect label="الدورة" value={value.courseId} options={courses} placeholder="كل الدورات" searchPlaceholder="ابحث عن دورة..." onChange={(selected) => onChange("courseId", selected)} /><SearchableSelect label="المحاضر" value={value.instructorId} options={instructors} placeholder="كل المحاضرين" searchPlaceholder="ابحث عن محاضر..." onChange={(selected) => onChange("instructorId", selected)} /><Field label="العملة"><select value={value.currency} onChange={(e) => onChange("currency", e.target.value)}><option value="">كل العملات</option>{currencies.map((item) => <option key={item}>{item}</option>)}</select></Field></div><div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row"><button type="button" onClick={onReset} disabled={loading} className="h-11 rounded-xl border px-5 font-bold text-[#475467] disabled:opacity-50">إعادة ضبط</button><button type="button" onClick={onApply} disabled={loading} className="h-11 rounded-xl bg-[#123C91] px-6 font-bold text-white disabled:opacity-50">تطبيق الفلاتر</button></div></div>;
const Field = ({ label, children }) => <label className="text-xs font-bold text-[#475467]"><span className="mb-1.5 block">{label}</span><span className="block [&>*]:h-11 [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:border-[#D7DEE8] [&>*]:bg-white [&>*]:px-3 [&>*]:text-sm [&>*]:outline-none focus-within:[&>*]:border-[#123C91]">{children}</span></label>;

const SearchableSelect = ({ label, value, options, placeholder, searchPlaceholder, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef(null);
  useEffect(() => {
    const close = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const selected = options.find((item) => String(item.id) === String(value));
  const query = search.trim().toLocaleLowerCase("ar");
  const visible = options.filter((item) => !query || String(item.name || "").toLocaleLowerCase("ar").includes(query));
  const choose = (id) => { onChange(id); setSearch(""); setOpen(false); };
  return <div ref={rootRef} className="relative text-xs font-bold text-[#475467]"><span className="mb-1.5 block">{label}</span><button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#D7DEE8] bg-white px-3 text-right text-sm font-medium outline-none transition hover:border-[#AAB8CA] focus:border-[#123C91]"><span className={`truncate ${selected ? "text-[#344054]" : "text-[#667085]"}`}>{selected?.name || placeholder}</span><ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} /></button>{open && <div className="absolute top-full z-40 mt-1 w-full min-w-56 overflow-hidden rounded-xl border border-[#D7DEE8] bg-white shadow-xl"><label className="relative block border-b p-2"><Search size={15} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#98A2B3]" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} className="h-9 w-full rounded-lg border border-[#E1E7EF] pr-9 pl-3 text-sm font-normal outline-none focus:border-[#123C91]" /></label><div className="max-h-56 overflow-y-auto p-1"><button type="button" onClick={() => choose("")} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-right text-sm font-medium hover:bg-[#F2F6FC]"><span>{placeholder}</span>{!value && <Check size={15} className="text-[#12A594]" />}</button>{visible.map((item) => <button key={item.id} type="button" onClick={() => choose(String(item.id))} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-right text-sm font-medium hover:bg-[#F2F6FC]"><span className="truncate">{item.name}</span>{String(item.id) === String(value) && <Check size={15} className="shrink-0 text-[#12A594]" />}</button>)}{!visible.length && <p className="px-3 py-6 text-center text-xs font-normal text-[#98A2B3]">لا توجد نتائج مطابقة</p>}</div></div>}</div>;
};

const Summary = ({ data }) => <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><MoneyCard icon={ShoppingCart} label="إجمالي مبيعات الدورات" rows={data?.currencies} field="gross" /><MoneyCard icon={WalletCards} label="عمولة المنصة" rows={data?.currencies} field="commission" /><MoneyCard icon={GraduationCap} label="صافي أرباح المحاضرين" rows={data?.currencies} field="net" /><CountCard icon={BookOpen} label="الدورات المباعة" value={data?.coursesSold} /><CountCard icon={GraduationCap} label="محاضرون لديهم مبيعات" value={data?.instructorsWithSales} /></div>;
const MoneyCard = ({ icon: Icon, label, rows = [], field }) => <div className="min-h-32 rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-2"><span className="grid size-9 place-items-center rounded-lg bg-[#EAF2FF] text-[#123C91]"><Icon size={18} /></span><span className="text-xs font-bold text-[#667085]">{label}</span></div>{rows.length ? <div className="space-y-1.5">{rows.map((row) => <div key={row.currency} dir="ltr" className="flex items-center justify-between gap-2 text-sm"><b className="text-[#1F2937]">{money(row[field], row.currency)}</b><span className="rounded bg-[#F2F4F7] px-1.5 py-0.5 text-[10px] text-[#475467]">{row.currency}</span></div>)}</div> : <p className="text-sm text-[#98A2B3]">لا توجد بيانات</p>}</div>;
const CountCard = ({ icon: Icon, label, value }) => <div className="min-h-32 rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-sm"><span className="grid size-9 place-items-center rounded-lg bg-[#E8F8F5] text-[#0B9F8D]"><Icon size={18} /></span><b dir="ltr" className="mt-3 block text-2xl text-[#1F2937]">{Number(value || 0).toLocaleString("en-US")}</b><span className="mt-1 block text-xs font-bold text-[#667085]">{label}</span></div>;

const AnalyticsTable = ({ title, type, items, onInstructor }) => {
  const instructor = type === "instructors"; const heads = instructor ? ["المحاضر", "الدورات المباعة", "المبيعات", "الإجمالي", "العمولة", "الصافي", "العملة"] : ["الدورة", "المحاضر", "المبيعات", "الإجمالي", "العمولة", "صافي المحاضر", "العملة"];
  return <div className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-sm"><div className="p-5"><Heading icon={instructor ? GraduationCap : BookOpen} title={title} subtitle="القيم المالية كما أرسلها الخادم" /></div>{!items.length ? <Empty text="لا توجد بيانات للفلاتر المحددة." /> : <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-200 text-sm"><thead className="bg-[#F8FAFC] text-[#667085]"><tr>{heads.map((head) => <th key={head} className="px-4 py-3 text-right font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y">{items.map((item) => <tr key={`${item.id}-${item.currency}`}><td className="px-4 py-4 font-bold">{instructor ? <button type="button" onClick={() => onInstructor(item)} className="text-[#123C91] hover:underline">{item.instructor}</button> : <Link to={`/admin/courses/${item.id}`} className="text-[#123C91] hover:underline">{item.course}</Link>}</td><td className="px-4 py-4">{instructor ? item.coursesSold : <button type="button" onClick={() => onInstructor(item)} className="text-[#123C91] hover:underline">{item.instructor}</button>}</td><td dir="ltr" className="px-4 py-4 text-right">{item.salesCount}</td><MoneyCells item={item} /><td dir="ltr" className="px-4 py-4 text-right font-bold">{item.currency}</td></tr>)}</tbody></table></div><div className="space-y-3 p-3 md:hidden">{items.map((item) => <FinancialCard key={`${item.id}-${item.currency}`} title={instructor ? item.instructor : item.course} subtitle={instructor ? `${item.coursesSold} دورة · ${item.salesCount} مبيعة` : `${item.instructor} · ${item.salesCount} مبيعة`} item={item} courseId={instructor ? "" : item.id} onInstructor={() => onInstructor(item)} titleIsInstructor={instructor} />)}</div></>}</div>;
};
const MoneyCells = ({ item }) => <><td dir="ltr" className="px-4 py-4 text-right">{money(item.gross, item.currency)}</td><td dir="ltr" className="px-4 py-4 text-right">{money(item.commission, item.currency)}</td><td dir="ltr" className="px-4 py-4 text-right font-bold text-[#123C91]">{money(item.net, item.currency)}</td></>;
const FinancialCard = ({ title, subtitle, item, courseId, onInstructor, titleIsInstructor = false }) => <article className="rounded-xl border bg-[#FCFDFE] p-4"><h3 className="font-bold text-[#344054]">{courseId ? <Link to={`/admin/courses/${courseId}`} className="text-[#123C91] hover:underline">{title}</Link> : titleIsInstructor ? <button type="button" onClick={onInstructor} className="text-[#123C91] hover:underline">{title}</button> : title}</h3><p className="mt-1 text-xs text-[#667085]">{subtitle}</p><div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center text-[11px]"><span>الإجمالي<b dir="ltr" className="mt-1 block text-[#344054]">{money(item.gross, item.currency)}</b></span><span>العمولة<b dir="ltr" className="mt-1 block text-[#344054]">{money(item.commission, item.currency)}</b></span><span>الصافي<b dir="ltr" className="mt-1 block text-[#123C91]">{money(item.net, item.currency)}</b></span></div></article>;

const Ledger = ({ items, onInstructor }) => <div className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-sm"><div className="p-5"><Heading icon={ShoppingCart} title="سجل مبيعات الدورات" subtitle="تفاصيل قيود الأرباح المسجلة" /></div>{!items.length ? <Empty text="لا توجد مبيعات للفلاتر المحددة." /> : <><div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-250 text-sm"><thead className="bg-[#F8FAFC] text-[#667085]"><tr>{["الدورة", "المحاضر", "المشتري", "المبلغ", "العمولة", "الصافي", "العملة", "التاريخ"].map((head) => <th key={head} className="px-4 py-3 text-right font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y">{items.map((item) => <tr key={item.id}><td className="px-4 py-4 font-bold"><Link to={`/admin/courses/${item.courseId}`} className="text-[#123C91] hover:underline">{item.course}</Link></td><td className="px-4 py-4"><button type="button" onClick={() => onInstructor(item)} className="text-[#123C91] hover:underline">{item.instructor}</button></td><td className="px-4 py-4">{item.buyer}</td><MoneyCells item={item} /><td dir="ltr" className="px-4 py-4 text-right font-bold">{item.currency}</td><td dir="ltr" className="px-4 py-4 text-right">{date(item.date)}</td></tr>)}</tbody></table></div><div className="space-y-3 p-3 lg:hidden">{items.map((item) => <FinancialCard key={item.id} title={item.course} subtitle={`${item.instructor} · ${item.buyer} · ${date(item.date)}`} item={item} courseId={item.courseId} />)}</div></>}</div>;

const InstructorModal = ({ instructor, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const key = instructor.instructorSlug || instructor.instructorId || instructor.id;
  useEffect(() => {
    let active = true;
    if (!key) return () => { active = false; };
    fetchPublicInstructor(key).then((data) => { if (active) setProfile(data); }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [key]);
  const user = profile?.user || {};
  const name = user.fullName || profile?.fullName || profile?.name || instructor.instructor;
  const avatar = getAssetUrl(user.profileImage || profile?.profileImage || profile?.avatar);
  return <div className="fixed inset-0 z-60 grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div role="dialog" aria-modal="true" aria-label={`تفاصيل المحاضر ${name}`} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="relative bg-linear-to-l from-[#123C91] to-[#17689A] px-6 py-6 text-white"><button type="button" onClick={onClose} className="absolute left-4 top-4 grid size-9 place-items-center rounded-full bg-white/12 hover:bg-white/20" aria-label="إغلاق"><X size={19} /></button><div className="flex items-center gap-4">{avatar ? <img src={avatar} alt={name} className="size-18 rounded-full border-2 border-white/30 object-cover" /> : <span className="grid size-18 place-items-center rounded-full bg-white/15 text-2xl font-extrabold">{String(name || "م").charAt(0)}</span>}<div><p className="text-xs text-[#8DE9DE]">تفاصيل المحاضر</p><h2 className="mt-1 text-xl font-extrabold">{name}</h2><p className="mt-1 text-sm text-white/75">{profile?.headline || "محاضر بالأكاديمية"}</p></div></div></div><div className="p-6">{loading ? <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-[#667085]"><LoaderCircle className="animate-spin" />جاري تحميل البيانات...</div> : <><p className="text-sm leading-7 text-[#667085]">{profile?.bio || "لا توجد نبذة متاحة عن هذا المحاضر."}</p><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#F7F9FC] p-3"><dt className="text-xs text-[#98A2B3]">الحالة</dt><dd className="mt-1 font-bold text-[#344054]">{profile?.status === "active" ? "نشط" : profile?.status || "غير محدد"}</dd></div><div className="rounded-xl bg-[#F7F9FC] p-3"><dt className="text-xs text-[#98A2B3]">معرّف المحاضر</dt><dd dir="ltr" className="mt-1 truncate text-right text-sm font-bold text-[#344054]">{instructor.instructorId || instructor.id || "—"}</dd></div></dl></>}</div></div></div>;
};
const Heading = ({ icon: Icon, title, subtitle }) => <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[#123C91]"><Icon size={19} /></span><div><h2 className="font-extrabold text-[#1F2937]">{title}</h2><p className="mt-0.5 text-xs text-[#667085]">{subtitle}</p></div></div>;
const Empty = ({ text }) => <div className="grid min-h-40 place-items-center px-4 text-center text-sm text-[#98A2B3]">{text}</div>;
const Section = ({ section, retry, children }) => section.loading ? <div className="rounded-2xl border bg-white"><LoadingState compact /></div> : section.error ? <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700"><AlertCircle /><span>{section.error}</span><button onClick={retry} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-bold text-[#123C91] shadow-sm"><RefreshCw size={15} />إعادة المحاولة</button></div> : children;

export default CourseFinancesPage;
