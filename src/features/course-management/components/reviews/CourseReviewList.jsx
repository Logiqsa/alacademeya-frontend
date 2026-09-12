import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import CourseReviewCard from "./CourseReviewCard";

const pagesAround = (page, pages) => Array.from(new Set([1, page - 1, page, page + 1, pages])).filter((item) => item >= 1 && item <= pages).sort((a, b) => a - b);

export default function CourseReviewList({ items, pagination, loading, error, filtered, onRetry, onPageChange, onDelete, deletingId }) {
  if (loading) return <div role="status" className="grid min-h-40 place-items-center text-[#123C91]"><Loader2 className="animate-spin" /><span className="sr-only">جاري تحميل التقييمات</span></div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700"><p>{error}</p><button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-2 font-bold"><RotateCcw size={15} />إعادة المحاولة</button></div>;
  if (!items.length) return <div className="rounded-xl border border-dashed border-[#CBD7E6] bg-white p-10 text-center text-[#7B8490]">{filtered ? "لا توجد تقييمات مطابقة لهذا الفلتر." : "لا توجد تقييمات بعد."}</div>;
  const page = pagination.page || 1, pages = pagination.pages || 1;
  const visiblePages = pagesAround(page, pages);
  return <><div className="space-y-3">{items.map((review, index) => <CourseReviewCard key={review.id || `${review.createdAt}-${review.reviewer?.displayName}-${review.rating}-${index}`} review={review} onDelete={onDelete} deleting={Boolean(review.id && deletingId === review.id)} />)}</div>{pages > 1 && <nav aria-label="صفحات التقييمات" className="mt-5 flex flex-wrap items-center justify-center gap-1" dir="rtl"><button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="الصفحة السابقة" className="grid h-9 w-9 place-items-center rounded-lg border disabled:opacity-40"><ChevronRight size={17} /></button>{visiblePages.map((item, index) => <span key={item} className="contents">{index > 0 && item - visiblePages[index - 1] > 1 && <span className="px-1">…</span>}<button type="button" onClick={() => onPageChange(item)} className={`h-9 min-w-9 rounded-lg px-2 ${item === page ? "bg-[#123C91] text-white" : "border"}`}>{item}</button></span>)}<button type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="الصفحة التالية" className="grid h-9 w-9 place-items-center rounded-lg border disabled:opacity-40"><ChevronLeft size={17} /></button></nav>}</>;
}
