import { useState } from "react";
import StarRating from "./StarRating";

const dateOf = (value) => value ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(value)) : "";

export default function CourseReviewCard({ review, onDelete, deleting = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = review.reviewer?.displayName || "مستخدم";
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="flex items-start gap-3">
        {review.reviewer?.profileImage && !imageFailed ? <img src={review.reviewer.profileImage} onError={() => setImageFailed(true)} alt={name} className="h-11 w-11 shrink-0 rounded-full object-cover" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#EAF2FF] font-bold text-[#123C91]">{name.trim().charAt(0) || "؟"}</span>}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><strong className="block text-sm text-[#344054]">{name}</strong><div className="mt-1 flex flex-wrap items-center gap-2"><StarRating value={review.rating} size={13} /><span className="text-xs text-[#98A2B3]">{dateOf(review.createdAt)}</span></div></div>{onDelete && <button type="button" disabled={deleting} onClick={() => onDelete(review)} className="delete-action rounded-lg px-3 py-1.5 text-xs">{deleting ? "جاري الحذف..." : "حذف"}</button>}</div>
          {review.reviewText ? <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#667085]">{review.reviewText}</p> : <p className="mt-3 text-sm text-[#98A2B3]">تقييم بدون تعليق.</p>}
        </div>
      </div>
    </article>
  );
}
