import { Info } from "lucide-react";

export default function ApiIntegrationHint({ className = "" }) {
  return (
    <div
      dir="rtl"
      role="status"
      className={`flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ${className}`}
    >
      <Info size={18} className="shrink-0" />
      <span>لم يتم الربط بالكامل مع الـ APIs</span>
    </div>
  );
}
