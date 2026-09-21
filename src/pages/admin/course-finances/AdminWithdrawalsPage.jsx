import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Banknote, CheckCircle2, Clock3, Filter, LoaderCircle, WalletCards, XCircle } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { approveAdminInstructorWithdrawal, confirmPaidAdminInstructorWithdrawal, downloadAdminInstructorWithdrawalReceipt, getAdminInstructorWithdrawals, rejectAdminInstructorWithdrawal } from "../../../services/APIService";
import { getApiErrorMessage } from "../../../services/apiError";
import { InstructorModal } from "./CourseFinancesPage";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const STATUS = {
  requested: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-700", icon: Clock3 },
  approved: { label: "تمت الموافقة", className: "bg-blue-50 text-blue-700", icon: CheckCircle2 },
  rejected: { label: "مرفوض", className: "bg-red-50 text-red-700", icon: XCircle },
  paid: { label: "تم الدفع", className: "bg-emerald-50 text-emerald-700", icon: Banknote },
};
const paymentMethodLabels = { instapay: "InstaPay", "bank-transfer": "تحويل بنكي", wallet: "محفظة إلكترونية", cash: "نقدي", other: "وسيلة أخرى" };
const money = (item) => `${(Number(item.requestedAmountMinor) / 10 ** Number(item.currencyScale ?? 2)).toLocaleString("ar-EG")} ${item.currency || ""}`;
const date = (value) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(parsed) : "—";
};
const apiDate = (value, end = false) => {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (end) parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
};

export default function AdminWithdrawalsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [working, setWorking] = useState("");
  const [action, setAction] = useState(null);
  const [detail, setDetail] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draftFilters, setDraftFilters] = useState({ from: "", to: "", instructorName: "" });
  const [filters, setFilters] = useState({ from: "", to: "", instructorName: "" });
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = unwrap(await getAdminInstructorWithdrawals({ status: status || undefined, instructorName: filters.instructorName.trim() || undefined, from: apiDate(filters.from), to: apiDate(filters.to, true), page, limit: 20 }));
      setItems(Array.isArray(data) ? data : data?.items || data?.withdrawals || []);
      setPagination(data?.pagination || {});
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر تحميل طلبات السحب"));
    } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [status, page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async () => {
    const { item, kind } = action || {};
    const id = item?.id || item?._id;
    if (!id || working) return;
    if (kind === "reject" && !detail.trim()) return toast.error("أدخل سبب الرفض");
    if (kind === "paid" && !receipt) return toast.error("ارفع إيصال التحويل");
    let payload = kind === "approve" ? (detail ? { estimatedTransferHours: Number(detail) } : {}) : { rejectionReason: detail.trim() };
    if (kind === "paid") { payload = new FormData(); payload.append("confirm", "true"); payload.append("receipt", receipt); }
    setWorking(id);
    try {
      if (kind === "approve") await approveAdminInstructorWithdrawal(id, payload);
      if (kind === "reject") await rejectAdminInstructorWithdrawal(id, payload);
      if (kind === "paid") await confirmPaidAdminInstructorWithdrawal(id, payload);
      toast.success("تم تحديث الطلب");
      setAction(null);
      setDetail("");
      await load();
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر تحديث الطلب")); }
    finally { setWorking(""); }
  };

  const counts = useMemo(() => Object.keys(STATUS).reduce((result, key) => ({ ...result, [key]: items.filter((item) => item.status === key).length }), {}), [items]);
  const openAction = (item, kind) => { setAction({ item, kind }); setDetail(""); setReceipt(null); };
  const downloadReceipt = async (item) => {
    try {
      const response = await downloadAdminInstructorWithdrawalReceipt(item.id || item._id);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `withdrawal-${item.id || item._id}-receipt`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر تحميل الإيصال")); }
  };
  const totalPages = Number(pagination.totalPages || pagination.pages || 1);

  return <AdminLayout><main dir="rtl" className="mx-auto w-full max-w-400 space-y-5 pb-10 text-right font-['IBM_Plex_Sans_Arabic']">
    <header className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#17689A] px-5 py-6 text-white shadow-sm sm:px-7">
      <span className="absolute -left-10 -top-14 size-40 rounded-full bg-[#12C6B0]/20" />
      <div className="relative flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/12"><WalletCards /></span><div><p className="text-xs font-bold text-[#8DE9DE]">إدارة المدفوعات</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">طلبات سحب أرباح المحاضرين</h1><p className="mt-2 text-sm text-white/75">مراجعة الطلبات والموافقة عليها وتسجيل عمليات التحويل.</p></div></div>
    </header>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Object.entries(STATUS).map(([key, meta]) => <StatusCard key={key} meta={meta} count={counts[key] || 0} active={status === key} onClick={() => { setStatus(status === key ? "" : key); setPage(1); }} />)}</div>

    <div className="rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#123C91]"><Filter size={19} /></span><div><h2 className="font-extrabold text-[#1F2937]">تصفية الطلبات</h2><p className="mt-0.5 text-xs text-[#667085]">اختر حالة الطلب لعرض النتائج المطابقة</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><FilterField label="اسم المحاضر"><input value={draftFilters.instructorName} onChange={(event) => setDraftFilters((current) => ({ ...current, instructorName: event.target.value }))} placeholder="ابحث باسم المحاضر" /></FilterField><FilterField label="من تاريخ"><input type="date" value={draftFilters.from} onChange={(event) => setDraftFilters((current) => ({ ...current, from: event.target.value }))} /></FilterField><FilterField label="إلى تاريخ"><input type="date" value={draftFilters.to} onChange={(event) => setDraftFilters((current) => ({ ...current, to: event.target.value }))} /></FilterField><FilterField label="الحالة"><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">كل الحالات</option>{Object.entries(STATUS).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select></FilterField></div>
      <div className="mt-4 flex gap-2"><button type="button" onClick={() => { if (draftFilters.from && draftFilters.to && draftFilters.from > draftFilters.to) return toast.error("تاريخ البداية يجب أن يكون قبل تاريخ النهاية"); setFilters({ ...draftFilters }); setPage(1); }} className="h-10 rounded-xl bg-[#123C91] px-5 text-sm font-bold text-white">تطبيق الفلاتر</button><button type="button" onClick={() => { const empty = { from: "", to: "", instructorName: "" }; setDraftFilters(empty); setFilters(empty); setStatus(""); setPage(1); }} className="h-10 rounded-xl border px-5 text-sm font-bold text-[#475467]">إعادة ضبط</button></div>
    </div>

    {action && <ActionPanel action={action} detail={detail} setDetail={setDetail} receipt={receipt} setReceipt={setReceipt} working={working} onConfirm={act} onCancel={() => setAction(null)} />}

    <div className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-sm">
      <div className="border-b border-[#EEF1F5] p-5"><h2 className="font-extrabold text-[#1F2937]">قائمة طلبات السحب</h2><p className="mt-1 text-xs text-[#667085]">بيانات الدفع الحساسة غير معروضة في هذه القائمة</p></div>
      {loading ? <div className="grid min-h-60 place-items-center text-sm text-[#667085]"><span className="flex items-center gap-2"><LoaderCircle className="animate-spin" />جاري تحميل الطلبات...</span></div> : !items.length ? <div className="grid min-h-60 place-items-center px-4 text-center text-sm text-[#98A2B3]">لا توجد طلبات سحب مطابقة.</div> : <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-190 text-sm"><thead className="bg-[#F8FAFC] text-[#667085]"><tr>{["المحاضر", "المبلغ", "الحالة", "تاريخ الطلب", "الإجراءات"].map((head) => <th key={head} className="px-5 py-3 text-right font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-[#EEF1F5]">{items.map((item) => <WithdrawalRow key={item.id || item._id} item={item} openAction={openAction} onInstructor={setSelectedInstructor} onReceipt={downloadReceipt} />)}</tbody></table></div>
        <div className="space-y-3 p-3 md:hidden">{items.map((item) => <WithdrawalCard key={item.id || item._id} item={item} openAction={openAction} onInstructor={setSelectedInstructor} onReceipt={downloadReceipt} />)}</div>
      </>}
    </div>

    <div className="flex items-center justify-between rounded-xl border border-[#E1E7EF] bg-white px-4 py-3 text-sm"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-4 py-2 font-bold text-[#475467] disabled:cursor-not-allowed disabled:opacity-40">السابق</button><span className="text-[#667085]">صفحة <b className="text-[#1F2937]">{page}</b> من <b className="text-[#1F2937]">{totalPages}</b></span><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-4 py-2 font-bold text-[#475467] disabled:cursor-not-allowed disabled:opacity-40">التالي</button></div>
    {selectedInstructor && <InstructorModal instructor={{ id: selectedInstructor.id, instructorId: selectedInstructor.id, instructor: selectedInstructor.name, instructorSlug: selectedInstructor.slug }} onClose={() => setSelectedInstructor(null)} />}
  </main></AdminLayout>;
}

const StatusBadge = ({ status }) => { const meta = STATUS[status] || { label: status || "غير محدد", className: "bg-gray-100 text-gray-600", icon: Clock3 }; const Icon = meta.icon; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}><Icon size={13} />{meta.label}</span>; };
const StatusCard = ({ meta, count, active, onClick }) => { const Icon = meta.icon; return <button type="button" onClick={onClick} className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-right shadow-sm transition ${active ? "border-[#123C91] ring-2 ring-[#123C91]/10" : "border-[#E1E7EF] hover:border-[#AAB8CA]"}`}><span className={`grid size-11 place-items-center rounded-xl ${meta.className}`}><Icon size={20} /></span><span><span className="block text-xs font-bold text-[#667085]">{meta.label}</span><b dir="ltr" className="mt-1 block text-xl text-[#1F2937]">{count}</b></span></button>; };
const FilterField = ({ label, children }) => <label className="text-xs font-bold text-[#475467]"><span className="mb-1.5 block">{label}</span><span className="block [&>*]:h-11 [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:border-[#D7DEE8] [&>*]:bg-white [&>*]:px-3 [&>*]:text-sm [&>*]:outline-none focus-within:[&>*]:border-[#123C91]">{children}</span></label>;
const Actions = ({ item, openAction, onReceipt }) => <div className="flex flex-wrap gap-2">{item.status === "requested" && <><button type="button" onClick={() => openAction(item, "approve")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">موافقة</button><button type="button" onClick={() => openAction(item, "reject")} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">رفض</button></>}{item.status === "approved" && <button type="button" onClick={() => openAction(item, "paid")} className="rounded-lg bg-[#EAF2FF] px-3 py-2 text-xs font-bold text-[#123C91] hover:bg-[#DCE9FF]">تأكيد الدفع</button>}{item.status === "paid" && item.paymentReceipt && <button type="button" onClick={() => onReceipt(item)} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">تحميل الإيصال</button>}{!["requested", "approved", "paid"].includes(item.status) && <span className="text-xs text-[#98A2B3]">للقراءة فقط</span>}</div>;
const WithdrawalRow = ({ item, openAction, onInstructor, onReceipt }) => <tr className="transition hover:bg-[#FCFDFE]"><td className="px-5 py-4 font-bold"><button type="button" onClick={() => onInstructor(item.instructor)} className="text-[#123C91] hover:underline">{item.instructor?.fullName || item.instructor?.name || "—"}</button></td><td dir="ltr" className="px-5 py-4 text-right font-bold text-[#123C91]">{money(item)}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-[#667085]">{date(item.requestedAt || item.createdAt)}</td><td className="px-5 py-4"><Actions item={item} openAction={openAction} onReceipt={onReceipt} /></td></tr>;
const WithdrawalCard = ({ item, openAction, onInstructor, onReceipt }) => <article className="rounded-xl border border-[#E1E7EF] bg-[#FCFDFE] p-4"><div className="flex items-start justify-between gap-3"><div><button type="button" onClick={() => onInstructor(item.instructor)} className="font-bold text-[#123C91] hover:underline">{item.instructor?.fullName || item.instructor?.name || "—"}</button><p className="mt-1 text-xs text-[#667085]">{date(item.requestedAt || item.createdAt)}</p></div><StatusBadge status={item.status} /></div><p dir="ltr" className="my-4 text-right text-lg font-extrabold text-[#123C91]">{money(item)}</p><div className="border-t border-[#EEF1F5] pt-3"><Actions item={item} openAction={openAction} onReceipt={onReceipt} /></div></article>;
const ActionPanel = ({ action, detail, setDetail, receipt, setReceipt, working, onConfirm, onCancel }) => {
  const config = action.kind === "approve" ? { title: "الموافقة على طلب السحب", label: "المهلة المتوقعة بالساعات (اختياري)", type: "number", placeholder: "مثال: 24" } : { title: "رفض طلب السحب", label: "سبب الرفض", type: "text", placeholder: "اكتب سبب الرفض" };
  return <div className="rounded-2xl border border-[#B9CAE5] bg-[#F7FAFF] p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-[#1F2937]">{action.kind === "paid" ? "تأكيد إتمام الدفع" : config.title}</h2><p className="mt-1 text-xs text-[#667085]">المحاضر: {action.item.instructor?.fullName || action.item.instructor?.name || "—"} · المبلغ: {money(action.item)}</p></div><button type="button" onClick={onCancel} className="grid size-9 place-items-center rounded-full text-[#667085] hover:bg-white" aria-label="إلغاء"><XCircle size={20} /></button></div>
    {action.kind === "paid" ? <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl bg-white p-3 text-sm"><span className="block text-xs text-[#667085]">طريقة الاستلام التي حددها المحاضر</span><b>{paymentMethodLabels[action.item.paymentMethod] || action.item.paymentMethod || "—"}</b></div>
      <div className="rounded-xl bg-white p-3 text-sm"><span className="block text-xs text-[#667085]">بيانات التحويل</span><b dir="ltr" className="block text-right">{action.item.paymentDestination || "—"}</b></div>
      <label className="cursor-pointer text-xs font-bold text-[#475467] sm:col-span-2"><span className="mb-1.5 block">إيصال التحويل <b className="text-red-500">*</b></span><input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => setReceipt(event.target.files?.[0] || null)} className="block w-full cursor-pointer rounded-xl border border-dashed border-[#B9CAE5] bg-white p-3 text-sm transition hover:border-[#123C91] focus:border-[#123C91] focus:outline-none file:cursor-pointer" />{receipt && <small className="mt-1 block text-emerald-700">{receipt.name}</small>}</label>
    </div> : <label className="mt-4 block text-xs font-bold text-[#475467]"><span className="mb-1.5 block">{config.label}</span><input type={config.type} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder={config.placeholder} className="h-11 w-full rounded-xl border border-[#D7DEE8] bg-white px-3 text-sm outline-none focus:border-[#123C91]" /></label>}
    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row"><button type="button" onClick={onCancel} className="h-10 rounded-xl border bg-white px-5 font-bold text-[#475467]">إلغاء</button><button type="button" onClick={onConfirm} disabled={Boolean(working)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-5 font-bold text-white disabled:opacity-50">{working && <LoaderCircle size={16} className="animate-spin" />}تأكيد الإجراء</button></div>
  </div>;
};
