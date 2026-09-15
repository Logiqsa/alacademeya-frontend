import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ChevronLeft, ChevronRight, FileCheck2, FilePlus2, History, LoaderCircle, Plus, Save, ShieldCheck, Upload } from "lucide-react";
import AdminLayout from "../../components/admin/layout/AdminLayout";
import RichTextEditor from "../../components/shared/RichTextEditor";
import { POLICY_LABELS } from "../../components/course/PolicyAcceptanceDialog";
import { createAdminPolicyDraft, getAdminPolicyVersions, publishAdminPolicy, updateAdminPolicyDraft } from "../../services/APIService";
import { getApiErrorMessage } from "../../services/apiError";

const TYPES = Object.keys(POLICY_LABELS);
const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const emptyPolicy = () => ({ title: { ar: "", en: "" }, content: { ar: "", en: "" }, effectiveAt: "", criteria: [], platformCommissionBps: "" });
const STATUS_LABELS = { draft: "مسودة", published: "منشورة", archived: "مؤرشفة" };

export default function AdminPoliciesPage() {
  const queryType = new URLSearchParams(location.search).get("type");
  const [type, setType] = useState(TYPES.includes(queryType) ? queryType : TYPES[0]);
  const [versions, setVersions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyPolicy);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("ar");
  const [isVersionsSidebarOpen, setIsVersionsSidebarOpen] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = unwrap(await getAdminPolicyVersions({ type }));
      const list = Array.isArray(data) ? data : data?.items || data?.versions || [];
      setVersions(list);
      setSelected(list[0] || null);
      setForm(list[0] || emptyPolicy());
    } catch (error) {
      toast.error(getApiErrorMessage(error, "تعذر تحميل السياسات"));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const local = (field, lang, value) => setForm((current) => ({ ...current, [field]: { ...(current[field] || {}), [lang]: value } }));
  const payload = () => ({
    title: form.title,
    content: form.content,
    ...(form.effectiveAt ? { effectiveAt: new Date(form.effectiveAt).toISOString() } : {}),
    ...(type === "course_publishing_policy" ? { criteria: form.criteria } : {}),
    ...(type === "revenue_share_agreement" ? { platformCommissionBps: Number(form.platformCommissionBps) } : {}),
  });
  const save = async () => {
    setSaving(true);
    try {
      if (selected?.status === "draft") await updateAdminPolicyDraft(selected.id || selected._id, payload());
      else await createAdminPolicyDraft(type, payload());
      toast.success("تم حفظ المسودة");
      await load();
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر حفظ المسودة")); }
    finally { setSaving(false); }
  };
  const publish = async () => {
    setSaving(true);
    try {
      await publishAdminPolicy(selected.id || selected._id);
      toast.success("تم نشر النسخة");
      await load();
    } catch (error) { toast.error(getApiErrorMessage(error, "تعذر نشر النسخة")); }
    finally { setSaving(false); }
  };
  const readonly = selected && selected.status !== "draft";

  return <AdminLayout><main dir="rtl" className="mx-auto w-full max-w-400 space-y-5 pb-10 text-right font-['IBM_Plex_Sans_Arabic']">
    <header className="relative overflow-hidden rounded-2xl bg-linear-to-l from-[#123C91] to-[#17689A] px-5 py-6 text-white shadow-sm sm:px-7">
      <span className="absolute -left-10 -top-14 size-40 rounded-full bg-[#12C6B0]/20" />
      <div className="relative flex items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/12"><ShieldCheck /></span><div><p className="text-xs font-bold text-[#8DE9DE]">إدارة المحتوى القانوني</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">السياسات والاتفاقيات</h1><p className="mt-2 text-sm text-white/75">إنشاء ومراجعة ونشر النسخ المعتمدة للمنصة.</p></div></div>
    </header>

    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-[#E1E7EF] bg-white p-2 shadow-sm" aria-label="أنواع السياسات">
      {TYPES.map((item) => <button type="button" key={item} onClick={() => { setType(item); setActiveLanguage("ar"); }} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${item === type ? "bg-[#123C91] text-white shadow-sm" : "text-[#475467] hover:bg-[#F2F6FC]"}`}>{POLICY_LABELS[item]}</button>)}
    </nav>

    {loading ? <Loading /> : <div className={`grid items-start gap-5 transition-[grid-template-columns] duration-300 ${isVersionsSidebarOpen ? "lg:grid-cols-[260px_minmax(0,1fr)]" : "lg:grid-cols-[72px_minmax(0,1fr)]"}`}>
      <aside className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-sm lg:sticky lg:top-0">
        <div className={`flex items-center border-b border-[#EEF1F5] p-3 ${isVersionsSidebarOpen ? "justify-between" : "justify-center"}`}>
          {isVersionsSidebarOpen && <span className="flex items-center gap-2 text-sm font-extrabold text-[#344054]"><History size={17} className="text-[#123C91]" />نسخ السياسة</span>}
          <button type="button" onClick={() => setIsVersionsSidebarOpen((open) => !open)} className="grid size-9 place-items-center rounded-lg text-[#475467] transition hover:bg-[#F2F4F7]" aria-expanded={isVersionsSidebarOpen} aria-label={isVersionsSidebarOpen ? "طي سايدبار المسودات" : "فتح سايدبار المسودات"} title={isVersionsSidebarOpen ? "طي السايدبار" : "فتح السايدبار"}>{isVersionsSidebarOpen ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}</button>
        </div>
        {isVersionsSidebarOpen ? <div className="p-3"><button type="button" onClick={() => { setSelected(null); setForm(emptyPolicy()); }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EAF2FF] p-3 font-bold text-[#123C91] transition hover:bg-[#DCE9FF]"><FilePlus2 size={18} />مسودة جديدة</button>
        <div className="mt-3 space-y-2">{versions.length ? versions.map((version) => {
          const id = version.id || version._id;
          const active = id && id === (selected?.id || selected?._id);
          return <button type="button" key={id} onClick={() => { setSelected(version); setForm(version); }} className={`w-full rounded-xl border p-3 text-right transition ${active ? "border-[#123C91] bg-[#F3F7FF]" : "border-[#E1E7EF] hover:border-[#AAB8CA]"}`}><span className="flex items-center justify-between gap-2"><b className="text-sm text-[#344054]">نسخة {version.version || "مسودة"}</b><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${version.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{STATUS_LABELS[version.status] || version.status}</span></span></button>;
        }) : <p className="py-6 text-center text-sm text-[#98A2B3]">لا توجد نسخ سابقة</p>}</div></div> : <div className="flex justify-center p-3"><button type="button" onClick={() => { setSelected(null); setForm(emptyPolicy()); }} className="grid size-10 place-items-center rounded-xl bg-[#EAF2FF] text-[#123C91] transition hover:bg-[#DCE9FF]" aria-label="مسودة جديدة" title="مسودة جديدة"><FilePlus2 size={19} /></button></div>}
      </aside>

      <div className="rounded-2xl border border-[#E1E7EF] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-[#EEF1F5] pb-4"><span className="grid size-10 place-items-center rounded-xl bg-[#EEF4FF] text-[#123C91]"><FileCheck2 size={19} /></span><div><h2 className="font-extrabold text-[#1F2937]">بيانات السياسة</h2><p className="mt-0.5 text-xs text-[#667085]">أدخل المحتوى باللغتين العربية والإنجليزية</p></div></div>
        <div className="mb-5 flex w-full rounded-xl bg-[#F2F5F9] p-1 sm:w-fit" role="tablist" aria-label="لغة محتوى السياسة">
          {[{ key: "ar", label: "العربية" }, { key: "en", label: "English" }].map((language) => <button type="button" role="tab" aria-selected={activeLanguage === language.key} key={language.key} onClick={() => setActiveLanguage(language.key)} className={`flex-1 rounded-lg px-7 py-2.5 text-sm font-bold transition sm:flex-none ${activeLanguage === language.key ? "bg-white text-[#123C91] shadow-sm" : "text-[#667085] hover:text-[#344054]"}`}>{language.label}</button>)}
        </div>
        <div className="rounded-2xl border border-[#E1E7EF] bg-[#FAFBFD] p-4 sm:p-5">
          <LanguageFields key={`${type}-${selected?.id || selected?._id || "new"}-${activeLanguage}`} lang={activeLanguage} form={form} readonly={readonly} local={local} />
        </div>
        <div className="mt-5 grid gap-4 border-t border-[#EEF1F5] pt-5 md:grid-cols-2">
          <label className="text-xs font-bold text-[#475467]"><span className="mb-1.5 flex items-center gap-2"><CalendarDays size={15} />تاريخ بدء التطبيق</span><input disabled={readonly} type="datetime-local" value={form.effectiveAt ? String(form.effectiveAt).slice(0, 16) : ""} onChange={(event) => setForm({ ...form, effectiveAt: event.target.value })} className="h-11 w-full rounded-xl border border-[#D7DEE8] px-3 text-sm outline-none focus:border-[#123C91] disabled:bg-[#F8FAFC]" /></label>
          {type === "revenue_share_agreement" && <label className="text-xs font-bold text-[#475467]"><span className="mb-1.5 block">عمولة المنصة بنقاط الأساس</span><input disabled={readonly} type="number" value={form.platformCommissionBps ?? ""} onChange={(event) => setForm({ ...form, platformCommissionBps: event.target.value })} className="h-11 w-full rounded-xl border border-[#D7DEE8] px-3 text-sm outline-none focus:border-[#123C91] disabled:bg-[#F8FAFC]" /></label>}
        </div>
        {type === "course_publishing_policy" && <Criteria value={form.criteria || []} disabled={readonly} onChange={(criteria) => setForm({ ...form, criteria })} />}
        {!readonly && <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#EEF1F5] pt-5 sm:flex-row"><button type="button" disabled={saving} onClick={save} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-6 font-bold text-white hover:bg-[#0E327B] disabled:opacity-50">{saving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}حفظ المسودة</button>{selected?.status === "draft" && <button type="button" disabled={saving} onClick={publish} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><Upload size={18} />نشر النسخة</button>}</div>}
      </div>
    </div>}
  </main></AdminLayout>;
}

const Loading = () => <div className="grid min-h-64 place-items-center rounded-2xl border border-[#E1E7EF] bg-white text-[#667085]"><div className="flex items-center gap-2 text-sm"><LoaderCircle className="animate-spin" />جاري تحميل السياسات...</div></div>;

const LanguageFields = ({ lang, form, readonly, local }) => {
  const isArabic = lang === "ar";
  const label = isArabic ? "بالعربية" : "بالإنجليزية";
  return <div className="space-y-2"><label className="text-xs font-bold text-[#475467]">العنوان {label}</label><input disabled={readonly} value={form.title?.[lang] || ""} onChange={(event) => local("title", lang, event.target.value)} placeholder={isArabic ? "عنوان السياسة بالعربية" : "Policy title in English"} dir={isArabic ? "rtl" : "ltr"} className="h-11 w-full rounded-xl border border-[#D7DEE8] px-3 text-sm outline-none focus:border-[#123C91] disabled:bg-[#F8FAFC]" /><label className="block pt-2 text-xs font-bold text-[#475467]">المحتوى {label}</label><RichTextEditor value={form.content?.[lang] || ""} onChange={(value) => local("content", lang, value)} disabled={readonly} direction={isArabic ? "rtl" : "ltr"} language={lang} placeholder={isArabic ? "اكتب محتوى السياسة بالعربية…" : "Write the policy content in English…"} ariaLabel={`محتوى السياسة ${label}`} /></div>;
};

function Criteria({ value, onChange, disabled }) {
  const update = (index, patch) => onChange(value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  return <div className="mt-5 border-t border-[#EEF1F5] pt-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-extrabold text-[#1F2937]">معايير جودة النشر</h3><p className="mt-0.5 text-xs text-[#667085]">الشروط التي يجب تحققها قبل نشر الدورة</p></div>{!disabled && <button type="button" onClick={() => onChange([...value, { key: "", title: { ar: "", en: "" }, description: { ar: "", en: "" }, required: true, sortOrder: value.length }])} className="inline-flex items-center gap-1 rounded-lg bg-[#EAF2FF] px-3 py-2 text-xs font-bold text-[#123C91]"><Plus size={15} />إضافة معيار</button>}</div><div className="mt-3 space-y-3">{value.map((criterion, index) => <div key={index} className="grid gap-3 rounded-xl border border-[#E1E7EF] bg-[#FCFDFE] p-4 sm:grid-cols-2"><input disabled={disabled} value={criterion.key || ""} placeholder="المفتاح" onChange={(event) => update(index, { key: event.target.value })} className="h-10 rounded-lg border border-[#D7DEE8] px-3 text-sm" /><input disabled={disabled} value={criterion.title?.ar || ""} placeholder="العنوان العربي" onChange={(event) => update(index, { title: { ...criterion.title, ar: event.target.value } })} className="h-10 rounded-lg border border-[#D7DEE8] px-3 text-sm" /><textarea disabled={disabled} value={criterion.description?.ar || ""} placeholder="الوصف العربي" onChange={(event) => update(index, { description: { ...criterion.description, ar: event.target.value } })} className="rounded-lg border border-[#D7DEE8] p-3 text-sm sm:col-span-2" /><label className="flex items-center gap-2 text-sm font-bold text-[#475467]"><input disabled={disabled} type="checkbox" checked={criterion.required !== false} onChange={(event) => update(index, { required: event.target.checked })} className="size-4 accent-[#123C91]" />معيار إلزامي</label></div>)}</div></div>;
}
