export default function CourseReviewFilters({ sort, rating, onSortChange, onRatingChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="text-sm text-[#475467]">الترتيب
        <select value={sort} onChange={(event) => onSortChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 sm:w-44">
          <option value="newest">الأحدث</option><option value="highest">الأعلى تقييماً</option><option value="lowest">الأقل تقييماً</option>
        </select>
      </label>
      <label className="text-sm text-[#475467]">عدد النجوم
        <select value={rating} onChange={(event) => onRatingChange(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 sm:w-40">
          <option value="">الكل</option>{[5, 4, 3, 2, 1].map((star) => <option key={star} value={star}>{star} نجوم</option>)}
        </select>
      </label>
    </div>
  );
}
