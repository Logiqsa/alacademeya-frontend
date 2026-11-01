import { TicketPercent } from "lucide-react";

export default function DiscountCodeField({ value, onChange, disabled = false }) {
  return <label className="mt-5 block rounded-xl border border-[#DCE6F5] bg-[#F8FAFC] p-4">
    <span className="flex items-center gap-2 text-sm font-semibold text-[#344054]"><TicketPercent size={17} className="text-[#123C91]" />كود الخصم (اختياري)</span>
    <input value={value} disabled={disabled} onChange={(event) => onChange(event.target.value.toUpperCase())} placeholder="اكتب كود الخصم" className="mt-3 h-11 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 text-right text-sm uppercase outline-none focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/10 disabled:opacity-60" />
    <span className="mt-2 block text-xs text-[#667085]">يُراجع الكود والسعر النهائي من الخادم قبل التحويل للدفع.</span>
  </label>;
}
