import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw, Search, ShieldCheck, ShieldEllipsis, Siren } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import { getAdminMediaSecurityEvents, suspendMediaSecurityActor } from "../../services/APIService";
import { getApiErrorMessage } from "../../services/apiError";

const initialFilters = { search: "", role: "", minAttempts: "", from: "", to: "" };
const fieldClass = "h-11 w-full rounded-xl border border-[#D8DEE8] bg-[#FAFBFC] px-3 text-sm text-[#344054] outline-none focus:border-[#3567C8] focus:bg-white focus:ring-2 focus:ring-[#3567C8]/10";
const dateTime = (value) => value ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const titleOf = (value) => typeof value === "string" ? value : value?.ar || value?.en || "—";
const levelOf = (count) => count >= 5 ? ["تكرار مرتفع", "bg-red-50 text-red-700 ring-red-100"] : count >= 2 ? ["متكرر", "bg-amber-50 text-amber-700 ring-amber-100"] : ["معلوماتي", "bg-blue-50 text-blue-700 ring-blue-100"];
const trustOf = (item) => item.accessReason === "instructor" ? "محاضر" : item.actorRoleSnapshot === "super-admin" ? "Super Admin · اختبار" : item.actorRoleSnapshot === "admin" ? "Admin · اختبار" : null;

const SummaryCard = ({ icon: Icon, label, value, tone }) => <div className="flex min-h-24 items-center justify-between rounded-2xl border border-[#E4E8EF] bg-white px-5 py-4 shadow-sm"><div><span className="text-xs text-[#667085]">{label}</span><strong className="mt-2 block text-2xl text-[#1F2937]">{value}</strong></div><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}><Icon size={21} /></span></div>;

export default function MediaSecurityEventsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], pagination: { page: 1, pages: 0, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [suspending, setSuspending] = useState("");
  const stats = useMemo(() => ({ repeated: result.items.filter((item) => item.attemptCount >= 2).length, high: result.items.filter((item) => item.attemptCount >= 5).length }), [result.items]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => { if (active) { setLoading(true); setError(""); } }, 0);
    getAdminMediaSecurityEvents({ page, limit: 20, eventType: "protected_media_direct_navigation", ...applied })
      .then((response) => { if (active) setResult(response?.data?.data || response?.data); })
      .catch((requestError) => { if (active) setError(requestError?.response?.status === 404 ? "مسار أمان الوسائط غير متاح على الباك الحالي. ارفع وشغّل تحديثات الباك أولًا." : getApiErrorMessage(requestError, "تعذر تحميل سجل حماية الوسائط")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; window.clearTimeout(timer); };
  }, [applied, page, reload]);

  const update = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const apply = (event) => { event.preventDefault(); setPage(1); setApplied(filters); };
  const clear = () => { setFilters(initialFilters); setApplied(initialFilters); setPage(1); };
  const suspendActor = async (item) => {
    if (!item.user?.id || suspending || !window.confirm(`إيقاف حساب ${item.user.name || item.user.email}؟`)) return;
    setSuspending(item.id);
    try { await suspendMediaSecurityActor(item.id); toast.success("تم إيقاف الحساب"); setReload((value) => value + 1); }
    catch (requestError) { toast.error(getApiErrorMessage(requestError, "تعذر إيقاف الحساب")); }
    finally { setSuspending(""); }
  };

  return <AdminLayout><main dir="rtl" className="min-h-full bg-[#F6F8FC] p-4 text-right sm:p-6 lg:p-8"><div className="mx-auto max-w-[1500px]">
    <header className="mb-5 rounded-2xl bg-linear-to-l from-[#0E327B] via-[#123C91] to-[#1E55B3] px-5 py-6 text-white shadow-lg shadow-[#123C91]/10 sm:px-7"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20"><ShieldCheck size={25} /></span><div><h1 className="text-xl font-bold sm:text-2xl">مراقبة أمان الوسائط</h1><p className="mt-1.5 max-w-3xl text-xs leading-6 text-blue-100 sm:text-sm">محاولات فتح روابط المحتوى المحمي مباشرة، للمراجعة فقط دون إجراءات تلقائية ضد المستخدمين.</p></div></div></header>

    <div className="mb-5 grid gap-3 sm:grid-cols-3"><SummaryCard icon={ShieldEllipsis} label="إجمالي النتائج المطابقة" value={result.pagination?.total || 0} tone="bg-blue-50 text-[#3567C8]" /><SummaryCard icon={RefreshCw} label="متكررة في الصفحة" value={stats.repeated} tone="bg-amber-50 text-amber-600" /><SummaryCard icon={Siren} label="تكرار مرتفع في الصفحة" value={stats.high} tone="bg-red-50 text-red-600" /></div>

    <form onSubmit={apply} className="mb-5 rounded-2xl border border-[#E4E8EF] bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-[#1F2937]">البحث والتصفية</h2><p className="mt-1 text-xs text-[#98A2B3]">حدد المستخدم أو الدور أو معدل التكرار.</p></div><button type="button" onClick={clear} className="text-xs font-semibold text-[#3567C8] hover:underline">مسح الفلاتر</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-[#475467]">المستخدم</span><span className="relative block"><Search className="absolute right-3 top-3 text-[#98A2B3]" size={17} /><input value={filters.search} onChange={update("search")} placeholder="الاسم أو البريد الإلكتروني" className={`${fieldClass} pr-10`} /></span></label>
      <label><span className="mb-1.5 block text-xs font-semibold text-[#475467]">الدور</span><select value={filters.role} onChange={update("role")} className={fieldClass}><option value="">كل الأدوار</option><option value="user">متعلم</option><option value="teacher">معلم</option><option value="instructor">محاضر</option><option value="admin">Admin</option><option value="super-admin">Super Admin</option></select></label>
      <label><span className="mb-1.5 block text-xs font-semibold text-[#475467]">أقل عدد محاولات</span><input type="number" min="1" value={filters.minAttempts} onChange={update("minAttempts")} placeholder="مثال: 2" className={fieldClass} /></label>
      <label><span className="mb-1.5 block text-xs font-semibold text-[#475467]">من تاريخ</span><input type="date" value={filters.from} onChange={update("from")} className={fieldClass} /></label>
      <label><span className="mb-1.5 block text-xs font-semibold text-[#475467]">إلى تاريخ</span><input type="date" value={filters.to} onChange={update("to")} className={fieldClass} /></label>
    </div><div className="mt-4 flex justify-end"><button className="h-11 rounded-xl bg-[#123C91] px-7 text-sm font-bold text-white hover:bg-[#0E327B]">تطبيق الفلاتر</button></div></form>

    <section className="overflow-hidden rounded-2xl border border-[#E4E8EF] bg-white shadow-sm"><div className="border-b border-[#EAECF0] px-5 py-4"><h2 className="font-bold text-[#1F2937]">سجل محاولات التنقل المباشر</h2><p className="mt-1 text-xs text-[#98A2B3]">الأحدث أولًا، والمحاولات المتشابهة مجمعة.</p></div>
      {loading ? <State icon={<RefreshCw className="animate-spin" />} title="جاري تحميل النشاط الأمني..." /> : error ? <State error icon={<AlertTriangle />} title="تعذر تحميل السجل" description={error} action={() => setReload((value) => value + 1)} /> : !result.items?.length ? <State icon={<ShieldCheck />} title="لا يوجد نشاط مطابق" description="لم تُسجل محاولات ضمن الفلاتر المحددة." /> : <EventsTable items={result.items} onSuspend={suspendActor} suspending={suspending} />}
      <footer className="flex items-center justify-between border-t bg-[#FCFDFE] px-5 py-3.5 text-xs text-[#667085]"><span>صفحة {result.pagination?.page || page} من {Math.max(1, result.pagination?.pages || 0)}</span><div className="flex gap-2"><PageButton label="السابقة" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}><ChevronRight size={17} /></PageButton><PageButton label="التالية" disabled={page >= (result.pagination?.pages || 1) || loading} onClick={() => setPage((value) => value + 1)}><ChevronLeft size={17} /></PageButton></div></footer>
    </section>
  </div></main></AdminLayout>;
}

const State = ({ icon, title, description, error, action }) => <div className={`mx-auto my-8 max-w-xl rounded-2xl px-6 py-8 text-center ${error ? "border border-red-100 bg-red-50/70" : "bg-white"}`}><span className={`mx-auto grid h-13 w-13 place-items-center rounded-full ${error ? "bg-white text-red-500 shadow-sm" : "bg-emerald-50 text-emerald-600"}`}>{icon}</span><h3 className={`mt-4 font-bold ${error ? "text-red-800" : "text-[#344054]"}`}>{title}</h3>{description && <p className={`mt-2 text-sm leading-6 ${error ? "text-red-700" : "text-[#98A2B3]"}`}>{description}</p>}{action && <button onClick={action} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#123C91] px-5 py-2.5 text-sm font-bold text-white"><RefreshCw size={15} />إعادة المحاولة</button>}</div>;
const PageButton = ({ label, ...props }) => <button aria-label={`الصفحة ${label}`} className="grid h-9 w-9 place-items-center rounded-lg border bg-white hover:border-[#3567C8] disabled:opacity-40" {...props} />;
const EventsTable = ({ items, onSuspend, suspending }) => <div className="overflow-x-auto"><table className="w-full min-w-[1200px] text-right text-xs"><thead className="bg-[#F8FAFC] text-[#667085]"><tr>{["المستخدم والإجراء", "الدور", "الدورة والدرس", "المورد", "المحاولات", "التصنيف", "أول محاولة", "آخر محاولة", "المتصفح والجهاز", "IP", "سبب الوصول"].map((heading, index) => <th key={heading} className={`whitespace-nowrap px-4 py-3.5 ${index === 0 ? "sticky right-0 z-20 min-w-52 bg-[#F8FAFC] shadow-[-6px_0_12px_-10px_#344054]" : ""}`}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#EEF1F5]">{items.map((item) => { const level = levelOf(item.attemptCount); const trust = trustOf(item); const protectedActor = ["admin", "super-admin"].includes(item.user?.role) || item.accessReason === "instructor"; return <tr key={item.id} className="align-top hover:bg-[#FAFCFF]"><td className="sticky right-0 z-10 min-w-52 bg-white px-4 py-4 shadow-[-6px_0_12px_-10px_#344054]"><strong className="block text-sm">{item.user?.name || "مستخدم محذوف"}</strong><span dir="ltr" className="block text-right">{item.user?.email || "—"}</span><button type="button" disabled={protectedActor || !item.user?.id || item.user.isActive === false || suspending === item.id} title={protectedActor ? "الأدمن ومحاضر الدورة مستثنيان" : "إيقاف الحساب"} onClick={() => onSuspend(item)} className="mt-2 whitespace-nowrap rounded-lg bg-red-50 px-3 py-1.5 font-bold text-red-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">{item.user?.isActive === false ? "موقوف بالفعل" : suspending === item.id ? "جارٍ الإيقاف..." : "إيقاف الحساب"}</button></td><td className="px-4 py-4">{trust ? <span className="whitespace-nowrap rounded-full bg-purple-50 px-2.5 py-1 font-semibold text-purple-700 ring-1 ring-purple-100">{trust}</span> : item.actorRoleSnapshot}</td><td className="px-4 py-4"><strong className="block">{titleOf(item.course?.title)}</strong><span className="text-[#667085]">{item.lesson?.title || "—"}</span></td><td className="px-4 py-4">{item.resourceType === "primary" ? "محتوى أساسي" : "مرفق"}</td><td className="px-4 py-4 text-center text-lg font-bold text-[#123C91]">{item.attemptCount}</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 font-semibold ring-1 ${level[1]}`}>{level[0]}</span></td><td className="whitespace-nowrap px-4 py-4">{dateTime(item.firstOccurredAt)}</td><td className="whitespace-nowrap px-4 py-4">{dateTime(item.lastOccurredAt)}</td><td dir="ltr" className="max-w-56 truncate px-4 py-4 text-right" title={item.userAgentSummary}>{item.userAgentSummary}</td><td dir="ltr" className="px-4 py-4 text-right">{item.ipSummary}</td><td className="px-4 py-4">{item.accessReason}</td></tr>; })}</tbody></table></div>;
