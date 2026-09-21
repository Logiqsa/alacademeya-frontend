import { useEffect, useId, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, ClipboardList, Clock3, History, Inbox, LoaderCircle, XCircle } from "lucide-react";
import { getAdminCourseModeration, getMyCourseModeration } from "../../../services/APIService";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;
const STATUS = {
  pending: { label: "قيد المراجعة", classes: "bg-amber-50 text-amber-700", icon: Clock3 },
  submitted: { label: "تم الإرسال", classes: "bg-blue-50 text-blue-700", icon: Clock3 },
  approved: { label: "تم الاعتماد", classes: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  published: { label: "تم النشر", classes: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "مرفوض", classes: "bg-red-50 text-red-700", icon: XCircle },
};

const normalizedStatus = (value) => String(value || "").trim().toLowerCase();
const formatDate = (value) => value ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function ModerationHistoryPanel({ courseId, admin = false }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");
    (admin ? getAdminCourseModeration : getMyCourseModeration)(courseId)
      .then((response) => {
        if (!active) return;
        const data = unwrap(response);
        const rounds = Array.isArray(data) ? data : data?.items || data?.history || data?.rounds || [];
        setItems([...rounds].sort((a, b) =>
          new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0) ||
          Number(a.submissionNumber || a.submissionRound || a.round || 0) - Number(b.submissionNumber || b.submissionRound || b.round || 0)));
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "تعذر تحميل سجل المراجعة");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId, admin]);

  return <div className="overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-sm" dir="rtl">
    <button
      type="button"
      onClick={() => setExpanded((value) => !value)}
      aria-expanded={expanded}
      aria-controls={contentId}
      className={`flex w-full items-center gap-3 px-4 py-4 text-right transition hover:bg-[#FAFBFC] sm:px-5 ${expanded ? "border-b border-[#EEF1F5]" : ""}`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EEF4FF] text-[#123C91]"><History size={20} /></span>
      <div className="min-w-0 flex-1"><h2 className="font-extrabold text-[#1F2937]">سجل مراجعة الدورة</h2><p className="mt-0.5 text-xs text-[#667085]">تابع جولات الإرسال وقرارات فريق المراجعة</p></div>
      {!loading && items.length > 0 && <span className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-xs font-bold text-[#123C91]">{items.length} {items.length === 1 ? "جولة" : "جولات"}</span>}
      <ChevronDown aria-hidden="true" size={19} className={`shrink-0 text-[#667085] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
    </button>

    <div id={contentId} hidden={!expanded}>{loading ? <div className="flex min-h-28 items-center justify-center gap-2 px-5 py-7 text-sm text-[#667085]"><LoaderCircle size={20} className="animate-spin text-[#123C91]" />جاري تحميل سجل المراجعة...</div>
      : error ? <div role="alert" className="flex min-h-28 items-center justify-center gap-2 px-5 py-7 text-sm text-red-700"><AlertCircle size={20} />{error}</div>
        : !items.length ? <div className="flex min-h-28 flex-col items-center justify-center px-5 py-7 text-center"><span className="grid size-11 place-items-center rounded-full bg-[#F2F5F9] text-[#98A2B3]"><Inbox size={21} /></span><p className="mt-3 text-sm font-bold text-[#475467]">لا توجد جولات مراجعة حتى الآن</p><p className="mt-1 text-xs text-[#98A2B3]">ستظهر هنا تفاصيل كل جولة عند إرسال الدورة للمراجعة.</p></div>
          : <ol className="relative space-y-4 border-r-2 border-[#DCE6F5] py-4 pr-5 pl-4 sm:mr-5 sm:py-5 sm:pr-7 sm:pl-5">{items.map((item, index) => <li key={item.id || item._id || index} className="relative before:absolute before:-right-[29px] before:top-5 before:size-3 before:rounded-full before:border-2 before:border-white before:bg-[#123C91] sm:before:-right-[37px]"><ReviewRound item={item} index={index} initiallyExpanded={index === items.length - 1} /></li>)}</ol>}</div>
  </div>;
}

const ReviewRound = ({ item, index, initiallyExpanded }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const contentId = useId();
  const status = normalizedStatus(item.status);
  const meta = STATUS[status] || { label: item.status || "غير محدد", classes: "bg-slate-100 text-slate-600", icon: ClipboardList };
  const StatusIcon = meta.icon;
  const hasDetails = item.reviewedAt || item.rejectionReason || item.adminNotes || (item.failedCriteria || []).length > 0 || item.policyVersion;
  return <article className="relative overflow-hidden rounded-xl border border-[#E1E7EF] bg-[#FCFDFE]">
    <button type="button" onClick={() => hasDetails && setExpanded((value) => !value)} aria-expanded={hasDetails ? expanded : undefined} aria-controls={hasDetails ? contentId : undefined} className={`flex w-full flex-col gap-3 p-4 text-right sm:flex-row sm:items-center sm:justify-between sm:p-5 ${hasDetails ? "transition hover:bg-[#F7F9FC]" : "cursor-default"}`}>
      <div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EAF2FF] font-extrabold text-[#123C91]">{item.submissionNumber || item.submissionRound || item.round || index + 1}</span><div><h3 className="text-sm font-extrabold text-[#344054]">{item.isRevision ? "تحديث المنهج" : "مراجعة الدورة"} — جولة {item.submissionNumber || item.submissionRound || item.round || index + 1}</h3><p className="mt-0.5 text-xs text-[#667085]">تم الإرسال: {formatDate(item.submittedAt)}</p></div></div>
      <span className="flex items-center gap-2"><span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${meta.classes}`}><StatusIcon size={13} />{meta.label}</span>{hasDetails && <ChevronDown aria-hidden="true" size={17} className={`text-[#667085] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />}</span>
    </button>
    {hasDetails && <div id={contentId} hidden={!expanded} className="space-y-2 border-t border-[#EEF1F5] p-4 text-sm text-[#475467] sm:p-5">
      {item.reviewedAt && <p><b className="text-[#344054]">تاريخ المراجعة:</b> {formatDate(item.reviewedAt)}</p>}
      {item.rejectionReason && <div className="rounded-lg bg-red-50 p-3 text-red-700"><b>سبب الرفض:</b> {item.rejectionReason}</div>}
      {item.adminNotes && <div className="rounded-lg bg-[#F2F5F9] p-3"><b>ملاحظات الإدارة:</b> {item.adminNotes}</div>}
      {(item.failedCriteria || []).length > 0 && <div><b className="text-[#344054]">المعايير غير المستوفاة:</b><ul className="mt-1 list-inside list-disc space-y-1">{item.failedCriteria.map((criterion, criterionIndex) => <li key={criterionIndex}>{criterion.title?.ar || criterion.title || criterion.key || criterion}</li>)}</ul></div>}
      {item.policyVersion && <p className="text-xs text-[#98A2B3]">نسخة السياسة: {item.policyVersion.version || item.policyVersion}</p>}
    </div>}
  </article>;
};
