import { Filter, RotateCcw } from "lucide-react";

const controlClass = "h-12 w-full rounded-xl border border-[#D0D5DD] bg-[#F9FAFB] px-3 text-sm text-[#344054] transition focus:border-[#123C91] focus:bg-white focus:ring-3 focus:ring-[#123C91]/10";

const EarningsFilters = ({ filters, courses, currencies, onChange, onApply, onReset, loading }) => (
  <form
    className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1.35fr_1fr_auto]"
    dir="rtl"
    onSubmit={(event) => { event.preventDefault(); onApply(); }}
  >
    <FilterField label="من تاريخ">
      <input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => onChange("from", event.target.value)} className={controlClass} dir="ltr" />
    </FilterField>
    <FilterField label="إلى تاريخ">
      <input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => onChange("to", event.target.value)} className={controlClass} dir="ltr" />
    </FilterField>
    <FilterField label="الدورة">
      <select value={filters.courseId} onChange={(event) => onChange("courseId", event.target.value)} className={controlClass}>
        <option value="">جميع الدورات</option>
        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
    </FilterField>
    <FilterField label="العملة">
      <select value={filters.currency} onChange={(event) => onChange("currency", event.target.value)} className={controlClass} dir="ltr">
        <option value="">جميع العملات</option>
        {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
      </select>
    </FilterField>
    <div className="flex gap-2">
      <button type="submit" disabled={loading} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#123C91] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E327A] disabled:cursor-not-allowed disabled:opacity-60 xl:flex-none"><Filter size={16} /> تطبيق</button>
      <button type="button" onClick={onReset} aria-label="إعادة تعيين الفلاتر" title="إعادة تعيين الفلاتر" className="grid size-12 place-items-center rounded-xl border border-[#D0D5DD] bg-white text-[#575F69] transition hover:border-[#123C91] hover:bg-[#F5F8FF] hover:text-[#123C91]"><RotateCcw size={17} /></button>
    </div>
  </form>
);

const FilterField = ({ label, children }) => (
  <label className="block min-w-0">
    <span className="mb-2 block text-xs font-semibold text-[#475467]">{label}</span>
    {children}
  </label>
);

export default EarningsFilters;
