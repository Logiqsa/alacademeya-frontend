import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, Clock3, HandCoins, LoaderCircle, RefreshCw, WalletCards, X } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../../context/AuthContext";
import {
  cancelWithdrawal,
  createWithdrawal,
  getInstructorBalance,
  getWithdrawals,
} from "../../../features/instructor-payouts/api/payoutsApi";
import {
  canRequestWithdrawal,
  withdrawableBalances,
} from "../../../features/instructor-payouts/payoutPolicy";
import { getApiErrorMessage } from "../../../services/apiError";
import { formatMoney } from "../../../utils/currencyDisplay";
import { confirmToast } from "../../../utils/confirmToast";
import { downloadMyInstructorWithdrawalReceipt } from "../../../services/APIService";
import Paginationn from "../groups/students/Paginationn";

const statusLabels = {
  requested: "مطلوب",
  approved: "مقبول",
  paid: "مدفوع",
  rejected: "مرفوض",
  cancelled: "ملغي",
};
const statusClasses = {
  requested: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  paid: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};
const balanceFields = [
  { key: "available", label: "الرصيد المتاح", hint: "أرباح معترف بها ومتاحة للسحب فورًا" },
  { key: "reserved", label: "محجوز للسحب", hint: "مرتبط بطلب سحب نشط" },
  { key: "paid", label: "تم دفعه", hint: "إجمالي السحوبات المكتملة" },
];
const paymentMethods = [
  { value: "instapay", label: "InstaPay", placeholder: "رقم الهاتف أو عنوان الدفع (IPA)" },
  { value: "bank-transfer", label: "تحويل بنكي", placeholder: "رقم الحساب أو IBAN" },
  { value: "wallet", label: "محفظة إلكترونية", placeholder: "اسم المحفظة ورقم الهاتف" },
  { value: "other", label: "وسيلة أخرى", placeholder: "بيانات التحويل أو الاستلام" },
];

const InstructorPayoutDashboard = () => {
  const { user } = useContext(AuthContext);
  const suspended = user?.instructorStatus === "suspended";
  const [balances, setBalances] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");
  const [history, setHistory] = useState({ items: [], pagination: { page: 1, total: 0, totalPages: 1 } });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ currency: "", amount: "", paymentMethod: "instapay", paymentDestination: "" });
  const pageSize = 10;

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    setBalanceError("");
    try { setBalances(await getInstructorBalance()); }
    catch (error) { setBalanceError(getApiErrorMessage(error, "تعذر تحميل أرصدة السحب.")); }
    finally { setBalanceLoading(false); }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try { setHistory(await getWithdrawals({ page, limit: pageSize })); }
    catch (error) { setHistoryError(getApiErrorMessage(error, "تعذر تحميل سجل السحوبات.")); }
    finally { setHistoryLoading(false); }
  }, [page]);

  useEffect(() => {
    let active = true;
    getInstructorBalance()
      .then((items) => { if (active) setBalances(items); })
      .catch((error) => { if (active) setBalanceError(getApiErrorMessage(error, "تعذر تحميل أرصدة السحب.")); })
      .finally(() => { if (active) setBalanceLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    getWithdrawals({ page, limit: pageSize })
      .then((data) => { if (active) setHistory(data); })
      .catch((error) => { if (active) setHistoryError(getApiErrorMessage(error, "تعذر تحميل سجل السحوبات.")); })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, [page]);

  const availableCurrencies = useMemo(() => withdrawableBalances(balances), [balances]);
  const withdrawalEnabled = canRequestWithdrawal({ balances, suspended, loading: balanceLoading });
  const selectedBalance = balances.find((item) => item.currency === form.currency);
  const openModal = () => {
    const currency = availableCurrencies.some((item) => item.currency === form.currency)
      ? form.currency
      : availableCurrencies[0]?.currency || "";
    setForm((current) => ({ ...current, currency }));
    setFormError("");
    setModalOpen(true);
  };
  const submitWithdrawal = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.currency) return setFormError("اختر العملة.");
    if (!Number.isInteger(amount) || amount <= 0) return setFormError("أدخل مبلغًا صحيحًا موجبًا.");
    if (selectedBalance && amount > selectedBalance.available) return setFormError("المبلغ أكبر من الرصيد المتاح.");
    if (!form.paymentDestination.trim()) return setFormError("أدخل بيانات الحساب أو الجهة التي تريد استلام المبلغ عليها.");
    setSubmitting(true);
    setFormError("");
    try {
      await createWithdrawal({ currency: form.currency, amount, paymentMethod: form.paymentMethod, paymentDestination: form.paymentDestination.trim() });
      toast.success("تم إرسال طلب السحب بنجاح");
      setModalOpen(false);
      setForm({ currency: "", amount: "", paymentMethod: "instapay", paymentDestination: "" });
      setPage(1);
      await Promise.all([loadBalance(), page === 1 ? loadHistory() : Promise.resolve()]);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "تعذر إرسال طلب السحب."));
    } finally { setSubmitting(false); }
  };
  const cancelItem = async (item) => {
    if (suspended || !item.canCancel) return;
    const confirmed = await confirmToast({ title: "إلغاء طلب السحب؟", message: "سيتم إلغاء الطلب وإعادة معالجة الرصيد بواسطة الخادم.", confirmLabel: "إلغاء الطلب", danger: true });
    if (!confirmed) return;
    try {
      await cancelWithdrawal(item.id);
      toast.success("تم إلغاء طلب السحب");
      await Promise.all([loadBalance(), loadHistory()]);
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر إلغاء طلب السحب.")); }
  };
  const openReceipt = async (item) => {
    try {
      const response = await downloadMyInstructorWithdrawalReceipt(item.id);
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `withdrawal-${item.id}-receipt`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر تحميل الإيصال")); }
  };

  return <section id="withdrawals" aria-labelledby="payout-title" className="scroll-mt-5 space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#123C91]"><HandCoins size={20} /></span><div><h2 id="payout-title" className="text-lg font-bold text-[#1F2937]">الرصيد والسحوبات</h2><p className="mt-0.5 text-xs text-[#667085]">الأرصدة وحالات الطلبات كما يحسبها الخادم</p></div></div>
      <button type="button" onClick={openModal} disabled={!withdrawalEnabled} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#98A2B3]"><WalletCards size={17} />طلب سحب</button>
    </div>
    {suspended && <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><Ban className="mt-0.5 shrink-0" size={17} /><span>يمكنك مشاهدة الأرصدة والسجل، لكن إنشاء أو إلغاء طلبات السحب غير متاح أثناء إيقاف الحساب.</span></div>}

    {balanceLoading ? <Loading label="جاري تحميل الأرصدة..." /> : balanceError ? <ErrorState message={balanceError} retry={loadBalance} /> : balances.length ? <div className="space-y-3">{balances.map((balance) => <article key={balance.currency} className="rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-sm sm:p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-[#1F2937]">رصيد {balance.currency}</h3><span dir="ltr" className="rounded-lg bg-[#F2F4F7] px-2.5 py-1 text-xs font-bold text-[#475467]">{balance.currency}</span></div><div className="grid gap-3 sm:grid-cols-3">{balanceFields.map((field) => <div key={field.key} className="rounded-xl bg-[#F8FAFC] p-4"><span className="text-xs font-semibold text-[#667085]">{field.label}</span><strong dir="ltr" className="mt-2 block text-right text-lg text-[#1F2937]">{formatMoney(balance[field.key], balance.currency)}</strong><small className="mt-1 block text-[10px] text-[#98A2B3]">{field.hint}</small></div>)}</div></article>)}</div> : <Empty text="لا توجد أرصدة مالية حتى الآن." />}

    <div className="overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#EAECF0] px-4 py-4 sm:px-5"><Clock3 size={19} className="text-[#123C91]" /><div><h3 className="font-bold text-[#1F2937]">سجل طلبات السحب</h3><p className="mt-0.5 text-xs text-[#667085]">تابع حالة كل طلب سحب</p></div></div>
      {historyLoading ? <Loading label="جاري تحميل طلبات السحب..." plain /> : historyError ? <ErrorState message={historyError} retry={loadHistory} plain /> : history.items.length ? <>
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-180 text-right text-sm"><thead className="bg-[#F8FAFC] text-[#667085]"><tr>{["التاريخ", "المبلغ", "العملة", "طريقة الاستلام", "الحالة", "الإجراءات"].map((label) => <th key={label} className="px-5 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#EAECF0]">{history.items.map((item) => <tr key={item.id}><td dir="ltr" className="px-5 py-4 text-right">{item.date ? new Date(item.date).toLocaleDateString("ar-EG") : "—"}</td><td dir="ltr" className="px-5 py-4 text-right font-semibold">{formatMoney(item.amount, item.currency)}</td><td dir="ltr" className="px-5 py-4 text-right font-bold">{item.currency}</td><td className="px-5 py-4"><span className="block">{paymentMethods.find((method) => method.value === item.paymentMethod)?.label || item.paymentMethod || "—"}</span><span dir="ltr" className="text-xs text-[#667085]">{item.paymentDestination}</span></td><td className="px-5 py-4"><Status status={item.status} /></td><td className="px-5 py-4">{item.canCancel && <button type="button" disabled={suspended} onClick={() => cancelItem(item)} className="font-semibold text-red-600 disabled:cursor-not-allowed disabled:text-[#98A2B3]">إلغاء الطلب</button>}{item.paymentReceipt && <button type="button" onClick={() => openReceipt(item)} className="block font-semibold text-[#123C91] underline">تحميل الإيصال</button>}</td></tr>)}</tbody></table></div>
        <div className="grid gap-3 p-3 md:hidden">{history.items.map((item) => <article key={item.id} className="rounded-xl border border-[#E3E8EF] p-4"><div className="flex items-start justify-between gap-3"><strong dir="ltr" className="text-[#1F2937]">{formatMoney(item.amount, item.currency)}</strong><Status status={item.status} /></div><p className="mt-2 text-xs text-[#667085]">{paymentMethods.find((method) => method.value === item.paymentMethod)?.label || item.paymentMethod || "—"} · <span dir="ltr">{item.paymentDestination}</span></p><div className="mt-3 flex items-center justify-between text-xs text-[#667085]"><span dir="ltr">{item.date ? new Date(item.date).toLocaleDateString("ar-EG") : "—"}</span>{item.canCancel && <button type="button" disabled={suspended} onClick={() => cancelItem(item)} className="font-bold text-red-600 disabled:text-[#98A2B3]">إلغاء الطلب</button>}{item.paymentReceipt && <button type="button" onClick={() => openReceipt(item)} className="font-bold text-[#123C91] underline">تحميل الإيصال</button>}</div></article>)}</div>
      </> : <Empty text="لم ترسل أي طلبات سحب بعد." plain />}
    </div>
    {!historyLoading && !historyError && history.pagination.totalPages > 1 && <Paginationn page={history.pagination.page || page} totalPages={history.pagination.totalPages} onChange={(value) => { setHistoryLoading(true); setHistoryError(""); setPage(value); }} totalItems={history.pagination.total} displayedCount={history.items.length} unitLabel="طلب" />}

    {modalOpen && <div className="fixed inset-0 z-[120] grid place-items-center bg-black/55 p-3" onMouseDown={() => !submitting && setModalOpen(false)}><form onSubmit={submitWithdrawal} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-[#EAECF0] px-5 py-4"><h3 className="font-bold text-[#1F2937]">طلب سحب جديد</h3><button type="button" disabled={submitting} onClick={() => setModalOpen(false)} aria-label="إغلاق" className="rounded-lg p-2 text-[#667085] hover:bg-[#F2F4F7]"><X size={18} /></button></div><div className="space-y-4 p-5"><label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#344054]">العملة</span><select value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} className="h-11 w-full rounded-xl border border-[#D0D5DD] px-3 outline-none focus:border-[#123C91]">{availableCurrencies.map((item) => <option key={item.currency} value={item.currency}>{item.currency} — المتاح {formatMoney(item.available, item.currency)}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#344054]">المبلغ</span><input dir="ltr" type="number" min="1" step="1" inputMode="numeric" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} className="h-11 w-full rounded-xl border border-[#D0D5DD] px-3 text-right outline-none focus:border-[#123C91]" placeholder="0" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#344054]">طريقة استلام المبلغ</span><select value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value, paymentDestination: "" }))} className="h-11 w-full rounded-xl border border-[#D0D5DD] px-3 outline-none focus:border-[#123C91]">{paymentMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#344054]">بيانات التحويل</span><input dir="ltr" value={form.paymentDestination} onChange={(event) => setForm((current) => ({ ...current, paymentDestination: event.target.value }))} className="h-11 w-full rounded-xl border border-[#D0D5DD] px-3 text-right outline-none focus:border-[#123C91]" placeholder={paymentMethods.find((method) => method.value === form.paymentMethod)?.placeholder} /></label>{formError && <div role="alert" className="flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="shrink-0" />{formError}</div>}</div><div className="flex gap-2 border-t border-[#EAECF0] px-5 py-4"><button type="submit" disabled={submitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-4 py-2.5 font-bold text-white disabled:opacity-60">{submitting && <LoaderCircle size={17} className="animate-spin" />}إرسال الطلب</button><button type="button" disabled={submitting} onClick={() => setModalOpen(false)} className="rounded-xl border border-[#D0D5DD] px-5 py-2.5 font-semibold text-[#344054]">إلغاء</button></div></form></div>}
  </section>;
};

const Status = ({ status }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClasses[status] || "bg-slate-100 text-slate-600"}`}>{statusLabels[status] || status}</span>;
const Loading = ({ label, plain = false }) => <div className={`flex min-h-32 items-center justify-center gap-2 text-sm text-[#667085] ${plain ? "" : "rounded-2xl border border-[#E3E8EF] bg-white"}`}><LoaderCircle size={20} className="animate-spin" />{label}</div>;
const ErrorState = ({ message, retry, plain = false }) => <div role="alert" className={`flex min-h-32 flex-col items-center justify-center gap-3 p-5 text-center text-sm text-red-700 ${plain ? "" : "rounded-2xl border border-red-200 bg-red-50"}`}><AlertCircle size={22} /><span>{message}</span><button type="button" onClick={retry} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-[#123C91] shadow-sm"><RefreshCw size={15} />إعادة المحاولة</button></div>;
const Empty = ({ text, plain = false }) => <div className={`grid min-h-28 place-items-center p-5 text-center text-sm text-[#98A2B3] ${plain ? "" : "rounded-2xl border border-[#E3E8EF] bg-white"}`}>{text}</div>;

export default InstructorPayoutDashboard;
