import { formatMoney } from "../../../utils/currencyDisplay";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(date);
};
const Money = ({ value, currency, emphasized = false }) => <span dir="ltr" className={`inline-block whitespace-nowrap ${emphasized ? "font-bold text-[#087F73]" : ""}`}>{formatMoney(value, currency)}</span>;
const Field = ({ label, children }) => <div className="flex items-center justify-between gap-3 border-b border-gray-50 py-2.5 last:border-0"><span className="text-xs font-medium text-[#8C9198]">{label}</span><span className="text-sm text-[#575F69]">{children}</span></div>;

const EarningsTable = ({ earnings = [] }) => {
  if (!earnings.length) return <div className="rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-[#667085]">لا توجد عمليات أرباح تطابق الفلاتر الحالية.</div>;
  return <div className="w-full" dir="rtl">
    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block"><div className="overflow-x-auto">
      <table className="w-full min-w-190 text-right"><thead className="bg-[#F9FAFB] text-[13px] text-[#575F69]"><tr>{["الدورة", "التاريخ", "الإجمالي", "العمولة", "الصافي", "العملة"].map((header) => <th key={header} scope="col" className="px-5 py-3.5 font-semibold whitespace-nowrap">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-100">{earnings.map((earning) => <tr key={earning.id} className="transition-colors hover:bg-gray-50/80">
          <td className="max-w-70 px-5 py-4 text-sm font-semibold text-[#1F2937]">{earning.course}</td><td className="px-5 py-4 text-sm text-[#575F69] whitespace-nowrap"><span dir="ltr">{formatDate(earning.date)}</span></td><td className="px-5 py-4 text-sm text-[#575F69]"><Money value={earning.gross} currency={earning.currency} /></td><td className="px-5 py-4 text-sm text-[#B54708]"><Money value={earning.commission} currency={earning.currency} /></td><td className="px-5 py-4 text-sm"><Money value={earning.net} currency={earning.currency} emphasized /></td><td className="px-5 py-4"><span dir="ltr" className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-xs font-bold text-[#123C91]">{earning.currency}</span></td>
        </tr>)}</tbody></table>
    </div></div>
    <div className="space-y-3 md:hidden">{earnings.map((earning) => <article key={earning.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3"><h3 className="text-sm font-bold text-[#1F2937]">{earning.course}</h3><span dir="ltr" className="rounded-full bg-[#EEF4FF] px-2.5 py-1 text-xs font-bold text-[#123C91]">{earning.currency}</span></div>
      <Field label="التاريخ"><span dir="ltr">{formatDate(earning.date)}</span></Field><Field label="الإجمالي"><Money value={earning.gross} currency={earning.currency} /></Field><Field label="العمولة"><Money value={earning.commission} currency={earning.currency} /></Field><Field label="الصافي"><Money value={earning.net} currency={earning.currency} emphasized /></Field>
    </article>)}</div>
  </div>;
};

export default EarningsTable;
