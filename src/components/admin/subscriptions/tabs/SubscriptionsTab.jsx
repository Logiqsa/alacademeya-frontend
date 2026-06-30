import { useState } from "react";
import { MoreVertical, ChevronRight, ChevronLeft } from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUBS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  student: "محمد أحمد",
  package: i % 3 === 0 ? "باقة المادة الواحدة" : i % 3 === 1 ? "باقة شاملة" : "باقة المادة الواحدة",
  discount: i % 2 === 0 ? "--" : "20%",
  status: i === 3 ? "منتهي" : i === 4 ? "موقوف" : "نشط",
}));

const PAGE_SIZE = 6;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    نشط:   "bg-[#00A63E26] text-[#00A63E]",
    منتهي: "bg-[#FF8A0026] text-[#FF8A00]",
    موقوف: "bg-red-100 text-red-500",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ─── Row Actions ──────────────────────────────────────────────────────────────
const RowActions = ({ align = "left" }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen((p) => !p)} className="p-2 rounded-lg text-[#575F69] hover:bg-gray-100 hover:text-[#123C91] transition-colors">
        <MoreVertical size={17} />
      </button>
      {open && (
        <ul
          className={`absolute ${align === "left" ? "left-0" : "right-0"} z-30 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden`}
          onClick={() => setOpen(false)}
        >
          {[
            { label: "عرض التفاصيل", cls: "text-[#374151]" },
            { label: "إيقاف",         cls: "text-orange-500" },
            { label: "حذف",           cls: "text-red-600" },
          ].map(({ label, cls }) => (
            <li key={label} className={`px-4 py-2.5 text-[13px] cursor-pointer hover:bg-gray-50 font-['IBM_Plex_Sans_Arabic'] ${cls}`}>
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, totalPages, onChange }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1" dir="rtl">
    <span className="text-[13px] text-[#575F69] text-center sm:text-right">
      عرض {Math.min(PAGE_SIZE, total - (page - 1) * PAGE_SIZE)} من أصل {total} اشتراك
    </span>
    <div className="flex items-center gap-1 flex-wrap justify-center">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-40 hover:bg-gray-50 shrink-0">
        <ChevronRight size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors shrink-0 ${p === page ? "bg-[#123C91] text-white" : "border border-gray-200 text-[#575F69] hover:bg-gray-50"}`}>{p}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-40 hover:bg-gray-50 shrink-0">
        <ChevronLeft size={16} />
      </button>
    </div>
  </div>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const SubCard = ({ s }) => (
  <div className="p-4 flex flex-col gap-2.5">
    <div className="flex items-start justify-between gap-2">
      <span className="font-['Tajawal'] font-semibold text-[15px] text-[#1F2937]">{s.student}</span>
      <RowActions align="left" />
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الباقة</span>
      <span className="text-[#575F69]">{s.package}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الخصم</span>
      <span className="text-[#575F69]">{s.discount}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الحالة</span>
      <StatusBadge status={s.status} />
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SubscriptionsTab = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(MOCK_SUBS.length / PAGE_SIZE);
  const paged = MOCK_SUBS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full max-w-full">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" dir="rtl">
        {/* Mobile: stacked cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {paged.map((s) => (
            <SubCard key={s.id} s={s} />
          ))}
        </div>

        {/* Desktop/tablet: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right" style={{ minWidth: 600 }}>
            <thead className="bg-[#F9FAFA] border-b border-gray-100">
              <tr>
                {["الطالب", "الباقة", "الخصم", "الحالة", "الإجراءات"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[13px] font-medium text-[#575F69] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-['Tajawal'] font-semibold text-[15px] text-[#1F2937] whitespace-nowrap">{s.student}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">{s.package}</td>
                  <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">{s.discount}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3.5"><RowActions align="left" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} total={MOCK_SUBS.length} totalPages={totalPages} onChange={setPage} />
    </div>
  );
};

export default SubscriptionsTab;