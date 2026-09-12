import { BadgeDollarSign, BookOpenCheck, ShoppingCart, WalletCards } from "lucide-react";
import { formatMoney } from "../../../utils/currencyDisplay";

const EarningsStatsBar = ({ summary }) => {
  const currencies = summary?.currencies || [];
  const stats = [
    {
      label: "إجمالي الأرباح",
      icon: BadgeDollarSign,
      color: "text-[#12AFA0]",
      bg: "bg-[#E8FBF8]",
      accent: "bg-[#12AFA0]",
      value: currencies.length ? (
        <div className="flex flex-col gap-1" dir="ltr">
          {currencies.map(({ currency, amount }) => (
            <span key={currency} className="whitespace-nowrap">{formatMoney(amount, currency)}</span>
          ))}
        </div>
      ) : "—",
    },
    { label: "عدد المبيعات", icon: ShoppingCart, color: "text-[#123C91]", bg: "bg-[#EAF4FF]", accent: "bg-[#123C91]", value: summary?.salesCount ?? 0 },
    { label: "الدورات المباعة", icon: BookOpenCheck, color: "text-[#7C3AED]", bg: "bg-[#F3E8FF]", accent: "bg-[#7C3AED]", value: summary?.coursesSold ?? 0 },
    {
      label: "توزيع العملات",
      icon: WalletCards,
      color: "text-[#D97706]",
      bg: "bg-[#FFF7E6]",
      accent: "bg-[#D97706]",
      value: currencies.length ? <div className="flex flex-wrap gap-1.5" dir="ltr">{currencies.map(({ currency }) => <span key={currency} className="rounded-md bg-[#FFF7E6] px-2 py-1 text-xs font-bold text-[#B54708]">{currency}</span>)}</div> : "—",
    },
  ];

  return (
    <div role="region" aria-label="ملخص الأرباح" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      {stats.map(({ label, icon: Icon, color, bg, accent, value }) => (
        <article key={label} className="group relative flex min-h-30 min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-[0_4px_16px_rgba(16,24,40,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(16,24,40,0.08)] sm:p-5">
          <span className={`absolute inset-y-0 right-0 w-1 ${accent}`} aria-hidden="true" />
          <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${bg}`}><Icon size={22} className={color} aria-hidden="true" /></div>
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-xs font-semibold text-[#667085]">{label}</p>
            <div className="text-xl font-bold leading-7 text-[#1F2937]">{value}</div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default EarningsStatsBar;
