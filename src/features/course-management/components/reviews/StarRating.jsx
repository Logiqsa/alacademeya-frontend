import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = 18, disabled = false }) {
  const interactive = typeof onChange === "function";
  return (
    <span className="inline-flex items-center gap-1" dir="ltr" role={interactive ? "radiogroup" : undefined} aria-label="التقييم من خمس نجوم">
      {[1, 2, 3, 4, 5].map((star) => interactive ? (
        <button key={star} type="button" role="radio" aria-checked={value === star} aria-label={`${star} من 5`} disabled={disabled} onClick={() => onChange(star)} className="rounded-sm disabled:cursor-not-allowed disabled:opacity-60">
          <Star size={size} className={star <= value ? "fill-[#F5A623] text-[#F5A623]" : "fill-[#E5E7EB] text-[#E5E7EB]"} />
        </button>
      ) : (
        <Star key={star} size={size} aria-hidden="true" className={star <= Math.round(value) ? "fill-[#F5A623] text-[#F5A623]" : "fill-[#E5E7EB] text-[#E5E7EB]"} />
      ))}
    </span>
  );
}
