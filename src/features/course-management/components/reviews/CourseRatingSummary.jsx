import StarRating from "./StarRating";

export default function CourseRatingSummary({ averageRating = 0, ratingCount = 0, compact = false }) {
  const count = Number(ratingCount || 0);
  if (compact) return count ? (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#667085]">
      <StarRating value={averageRating} size={14} />
      <b className="text-[#344054]">{Number(averageRating).toFixed(1)}</b>
      <span>({count.toLocaleString("ar-EG")})</span>
    </span>
  ) : <span className="text-xs text-[#98A2B3]">لا توجد تقييمات بعد</span>;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 text-center sm:flex sm:items-center sm:justify-between sm:p-5 sm:text-start">
      <div><h2 className="text-lg font-extrabold text-[#1F2937]">تقييم الدورة</h2><p className="mt-0.5 text-sm text-[#667085]">{count ? `${count.toLocaleString("ar-EG")} تقييم` : "لا توجد تقييمات بعد"}</p></div>
      <div className="mt-3 sm:mt-0"><strong className="block text-2xl text-[#344054]">{count ? Number(averageRating).toFixed(1) : "—"}</strong><StarRating value={averageRating} size={16} /></div>
    </div>
  );
}
