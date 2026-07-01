import { useState, useEffect, useCallback } from "react";
import {
  MoreVertical, X, ChevronDown, ChevronRight, ChevronLeft,
  Percent, Banknote, Copy, Check, Plus, TicketPercent, Loader2,
} from "lucide-react";
import { getAllDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../../../../services/authService"; // ⚠️ عدّل المسار حسب مكان api.js عندك

const PAGE_SIZE = 6;

// ─── Tokens ───────────────────────────────────────────────────────────────────
// isActive=true -> نشط | isActive=false -> موقوف
// (لا يوجد حقل انتهاء/حد أقصى في الـ response الحالي، فحالة "منتهي" اتشالت)
const STATUS_STYLES = {
  نشط: { dot: "bg-[#15A862]", text: "text-[#15A862]", bg: "bg-[#15A862]/10" },
  موقوف: { dot: "bg-[#E0394C]", text: "text-[#E0394C]", bg: "bg-[#E0394C]/10" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? { dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-100" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const TypeIcon = ({ type }) => (
  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${type === "percentage" ? "bg-[#123C91]/10 text-[#123C91]" : "bg-[#0E7C66]/10 text-[#0E7C66]"}`}>
    {type === "percentage" ? <Percent size={13} strokeWidth={2.4} /> : <Banknote size={13} strokeWidth={2.4} />}
  </span>
);

const typeLabel = (type) => (type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت");
const discountLabel = (d) => (d.type === "percentage" ? `${d.value}%` : `${d.value} جنيه`);

// ─── Usage (no limit field in API, so just show raw usedCount) ────────────────
const UsageCount = ({ usedCount }) => (
  <span className="text-[13px] tabular-nums text-[#575F69]" dir="ltr">
    استُخدم {usedCount ?? 0} مرة
  </span>
);

// ─── Copyable code ────────────────────────────────────────────────────────────
const CodeChip = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(code).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={handleCopy}
      dir="ltr"
      className="group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-dashed border-gray-300 bg-[#F9FAFA] hover:border-[#123C91]/40 hover:bg-[#123C91]/5 transition-colors"
      title="نسخ الكود"
    >
      <span className="font-mono font-semibold text-[13px] text-[#1F2937]">{code}</span>
      {copied ? (
        <Check size={13} className="text-[#15A862]" />
      ) : (
        <Copy size={13} className="text-[#9CA3AF] group-hover:text-[#123C91] transition-colors" />
      )}
    </button>
  );
};

// ─── Row Actions ──────────────────────────────────────────────────────────────
const RowActions = ({ discount, onToggleActive, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-2 rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-colors"
      >
        <MoreVertical size={17} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <ul
            dir="rtl"
            className="absolute right-0 z-30 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1"
          >
            <li
              onClick={() => { setOpen(false); onToggleActive(discount); }}
              className="px-4 py-2.5 text-[13px] cursor-pointer hover:bg-gray-50 font-['IBM_Plex_Sans_Arabic'] text-right text-[#E8821C]"
            >
              {discount.isActive ? "إيقاف" : "تفعيل"}
            </li>
            <li
              onClick={() => { setOpen(false); onDelete(discount); }}
              className="px-4 py-2.5 text-[13px] cursor-pointer hover:bg-gray-50 font-['IBM_Plex_Sans_Arabic'] text-right text-[#E0394C]"
            >
              حذف
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

// ─── Form Field ───────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block font-['Tajawal'] font-medium text-[13px] text-[#374151] mb-1.5 text-right">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full h-11 px-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91]/30 focus:border-[#123C91] text-right transition-colors placeholder:text-[#9CA3AF]";
const selectCls =
  "w-full h-11 px-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91]/30 focus:border-[#123C91] appearance-none text-right transition-colors";

// ─── Add Code Modal ───────────────────────────────────────────────────────────
const AddCodeModal = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: "", code: "", type: "", value: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({ name: "", code: "", type: "", value: "" });
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.code || !form.type || !form.value) {
      setError("من فضلك أكمل الكود والنوع والقيمة");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createDiscount({
        name: form.name || form.code,
        code: form.code,
        type: form.type,
        value: Number(form.value),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "حدث خطأ أثناء إنشاء الكود");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/50 backdrop-blur-[2px] px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        dir="rtl"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-gray-100 hover:text-[#374151] transition-colors shrink-0"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937]">
              إنشاء كود خصم جديد
            </h3>
            <span className="w-8 h-8 rounded-lg bg-[#123C91]/10 text-[#123C91] flex items-center justify-center">
              <TicketPercent size={16} />
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <Field label="اسم الكود">
            <input value={form.name} onChange={handleChange("name")} placeholder="مثال: خصم العيد" className={inputCls} />
          </Field>

          <Field label="الكود">
            <input value={form.code} onChange={handleChange("code")} placeholder="مثال: SAVE20" className={inputCls} dir="ltr" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="نوع الخصم">
              <div className="relative">
                <select value={form.type} onChange={handleChange("type")} className={selectCls}>
                  <option value="" disabled>اختر النوع</option>
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]" />
              </div>
            </Field>
            <Field label="قيمة الخصم">
              <input value={form.value} onChange={handleChange("value")} placeholder="20" type="number" className={inputCls} />
            </Field>
          </div>

          {error && <p className="text-[12px] text-[#E0394C] text-right">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-3 px-5 sm:px-6 pb-5 sm:pb-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3 bg-[#123C91] text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] disabled:opacity-60 transition-colors shadow-sm shadow-[#123C91]/20 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={15} className="animate-spin" />}
            إنشاء الكود
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#E5E7EB] rounded-xl text-[#374151] font-medium text-[14px] hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, totalPages, onChange }) => (
  <div dir="rtl" className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
    <span className="text-[13px] text-[#8C9198] text-center sm:text-right">
      عرض <span className="font-medium text-[#575F69]">{Math.min(PAGE_SIZE, total - (page - 1) * PAGE_SIZE)}</span> من أصل <span className="font-medium text-[#575F69]">{total}</span> كود خصم
    </span>
    <div className="flex items-center flex-wrap justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shrink-0"
      >
        <ChevronRight size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors shrink-0 ${p === page ? "bg-[#123C91] text-white shadow-sm shadow-[#123C91]/25" : "border border-gray-200 text-[#575F69] hover:bg-gray-50"
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shrink-0"
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  </div>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const CodeCard = ({ code, onToggleActive, onDelete }) => (
  <div dir="rtl" className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
    <div className="flex items-center justify-between gap-2 mb-3.5">
      <CodeChip code={code.code} />
      <StatusBadge status={code.isActive ? "نشط" : "موقوف"} />
    </div>

    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <TypeIcon type={code.type} />
        <div>
          <p className="text-[13px] font-semibold text-[#1F2937] leading-tight">{discountLabel(code)}</p>
          <p className="text-[11px] text-[#9CA3AF] leading-tight mt-0.5">{typeLabel(code.type)}</p>
        </div>
      </div>
      <div className="text-left">
        <p className="text-[11px] text-[#9CA3AF] mb-1">الاستخدامات</p>
        <UsageCount usedCount={code.usedCount} />
      </div>
    </div>

    <div className="flex justify-end pt-2.5 border-t border-gray-100">
      <RowActions discount={code} onToggleActive={onToggleActive} onDelete={onDelete} />
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const DiscountCodesTab = ({ showAdd, onCloseAdd, onOpenAdd }) => {
  const [page, setPage] = useState(1);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDiscounts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllDiscounts();
      setCodes(res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحميل أكواد الخصم");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  const handleToggleActive = async (discount) => {
    // optimistic update
    setCodes((prev) => prev.map((c) => (c.id === discount.id ? { ...c, isActive: !c.isActive } : c)));
    try {
      await updateDiscount(discount.id, { isActive: !discount.isActive });
    } catch {
      // rollback on failure
      setCodes((prev) => prev.map((c) => (c.id === discount.id ? { ...c, isActive: discount.isActive } : c)));
    }
  };

  const handleDelete = async (discount) => {
    const prev = codes;
    setCodes((c) => c.filter((x) => x.id !== discount.id));
    try {
      await deleteDiscount(discount.id);
    } catch {
      setCodes(prev); // rollback
    }
  };

  const totalPages = Math.max(1, Math.ceil(codes.length / PAGE_SIZE));
  const paged = codes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full max-w-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-['Tajawal'] font-semibold text-[16px] sm:text-[18px] text-[#1F2937]">أكواد الخصم</h2>
          <p className="text-[12px] sm:text-[13px] text-[#9CA3AF] mt-0.5">إدارة ومتابعة أكواد الخصم النشطة</p>
        </div>
        {onOpenAdd && (
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 bg-[#123C91] hover:bg-[#0f3280] text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-[#123C91]/20 shrink-0"
          >
            <Plus size={15} />
            <span className="hidden xs:inline">إنشاء كود</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#9CA3AF] gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">جاري التحميل...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
          <p className="text-[14px] text-[#E0394C] mb-3">{error}</p>
          <button onClick={fetchDiscounts} className="text-[13px] text-[#123C91] font-medium hover:underline">إعادة المحاولة</button>
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
          <p className="text-[14px] text-[#9CA3AF]">لا توجد أكواد خصم حالياً</p>
        </div>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right" style={{ minWidth: 680 }}>
                <thead className="bg-[#F9FAFA] border-b border-gray-100">
                  <tr>
                    {["الكود", "الخصم", "الاستخدامات", "الحالة", ""].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-[12px] font-medium text-[#9CA3AF] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <CodeChip code={c.code} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <TypeIcon type={c.type} />
                          <div>
                            <p className="text-[13px] font-semibold text-[#1F2937] leading-tight">{discountLabel(c)}</p>
                            <p className="text-[11px] text-[#9CA3AF] leading-tight mt-0.5">{typeLabel(c.type)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3"><UsageCount usedCount={c.usedCount} /></td>
                      <td className="px-5 py-3"><StatusBadge status={c.isActive ? "نشط" : "موقوف"} /></td>
                      <td className="px-5 py-3 text-left">
                        <RowActions discount={c} onToggleActive={handleToggleActive} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {paged.map((c) => (
              <CodeCard key={c.id} code={c} onToggleActive={handleToggleActive} onDelete={handleDelete} />
            ))}
          </div>

          <Pagination page={page} total={codes.length} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <AddCodeModal open={showAdd} onClose={onCloseAdd} onCreated={fetchDiscounts} />
    </div>
  );
};

export default DiscountCodesTab;