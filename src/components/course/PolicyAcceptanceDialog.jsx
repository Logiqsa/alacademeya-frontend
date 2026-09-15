import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck, X } from "lucide-react";
import { acceptCurrentPolicy, getCurrentPolicy, getMyPolicyStatus } from "../../services/APIService";
import { getApiErrorMessage } from "../../services/apiError";

// eslint-disable-next-line react-refresh/only-export-components
export const POLICY_LABELS = {
  course_publishing_policy: "سياسة نشر الدورات",
  instructor_agreement: "اتفاقية المحاضر",
  revenue_share_agreement: "اتفاقية مشاركة الإيرادات",
  learner_course_terms: "شروط شراء والالتحاق بالدورات",
};
const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export default function PolicyAcceptanceDialog({ open, requiredTypes, onClose, onSatisfied }) {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const status = unwrap(await getMyPolicyStatus());
      const missing = requiredTypes.filter((type) => status?.[type]?.required && !status[type]?.accepted);
      if (!missing.length) { onSatisfied?.(); return; }
      const policies = await Promise.all(missing.map(async (type) => ({ type, ...unwrap(await getCurrentPolicy(type)) })));
      setItems(policies); setActive((current) => missing.includes(current) ? current : missing[0]); setChecked(false);
    } catch (requestError) { setError(getApiErrorMessage(requestError, "تعذر تحميل الاتفاقيات المطلوبة.")); }
    finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) load(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;
  const policy = items.find((item) => item.type === active);
  const accept = async () => {
    if (!checked || !policy || working) return;
    setWorking(true); setError("");
    try { await acceptCurrentPolicy(policy.type); await load(); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "تعذر تسجيل الموافقة.")); }
    finally { setWorking(false); }
  };
  const text = (value) => value?.ar || value?.en || value || "";
  return <div className="fixed inset-0 z-[180] grid place-items-center bg-black/60 p-3" dir="rtl">
    <section role="dialog" aria-modal="true" className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-extrabold">الاتفاقيات المطلوبة</h2><p className="text-xs text-gray-500">اقرأ كل نسخة حالية ووافق عليها صراحة للمتابعة.</p></div><button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="إغلاق"><X size={19}/></button></header>
      {loading ? <div className="grid min-h-72 place-items-center"><LoaderCircle className="animate-spin"/></div> : error ? <div className="p-6 text-center text-red-700">{error}<button onClick={load} className="mt-3 block w-full font-bold">إعادة المحاولة</button></div> : policy ? <>
        <nav className="flex gap-2 overflow-x-auto border-b p-3">{items.map((item) => <button key={item.type} onClick={() => { setActive(item.type); setChecked(false); }} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${active === item.type ? "bg-[#123C91] text-white" : "bg-gray-100"}`}>{POLICY_LABELS[item.type]}</button>)}</nav>
        <div className="overflow-y-auto p-5"><div className="flex flex-wrap justify-between gap-2"><h3 className="text-lg font-extrabold">{text(policy.title) || POLICY_LABELS[policy.type]}</h3><span className="text-xs text-gray-500">الإصدار {policy.version}{policy.effectiveAt ? ` · ساري ${new Date(policy.effectiveAt).toLocaleDateString("ar-EG")}` : ""}</span></div><article className="policy-rich-content mt-4 max-h-[45vh] overflow-y-auto rounded-xl border bg-gray-50 p-4 text-sm leading-7" dangerouslySetInnerHTML={{ __html: text(policy.content) }} />{policy.type === "revenue_share_agreement" && Number.isFinite(Number(policy.platformCommissionBps)) && <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm">عمولة المنصة: {Number(policy.platformCommissionBps) / 100}% · حصة المحاضر: {(10000 - Number(policy.platformCommissionBps)) / 100}%</p>}</div>
        <footer className="border-t p-4"><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} className="mt-1"/><span>قرأت النسخة الحالية وأوافق عليها.</span></label><button onClick={accept} disabled={!checked || working} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#123C91] font-bold text-white disabled:opacity-50">{working ? <LoaderCircle className="animate-spin" size={18}/> : <ShieldCheck size={18}/>}موافقة ومتابعة</button></footer>
      </> : null}
    </section>
  </div>;
}
