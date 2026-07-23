import { useState } from "react";
import { Pencil, Trash2, Clock, X, Megaphone } from "lucide-react";

const statusColors = (status) => (status === "published" ? "bg-[#00A63E]" : "bg-[#FF8A00]");
const statusLabel = (status) => (status === "published" ? "منشور" : "مسودة");

const statusBadge = (status, className = "") => (
  <span className={`${statusColors(status)} text-white text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}>
    {statusLabel(status)}
  </span>
);

const CATEGORY_COLORS = {
  "إعلانات": "#123C91",
  "تعليمي": "#A3195B",
};
const DEFAULT_COVER_COLOR = "#1F2937";

const coverColorFor = (post) => post.coverColor || CATEGORY_COLORS[post.categoryName] || DEFAULT_COVER_COLOR;

const CoverImage = ({ post, variant = "card" }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="h-40 relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: coverColorFor(post) }}
    >
      {post.coverImageUrl && !imgError ? (
        <img
          key={`${post.id}-${post.coverImageUrl}`}
          src={post.coverImageUrl}
          alt={post.title}
          className={`absolute inset-0 w-full h-full object-cover ${post.coverColor ? "opacity-70 mix-blend-luminosity" : ""}`}
          onError={() => setImgError(true)}
        />
      ) : (
        <Megaphone className="text-white/60" size={40} />
      )}
      <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full border border-white/30 whitespace-nowrap z-10">
        {post.categoryName}
      </span>
      {variant === "card" && statusBadge(post.status, "absolute top-3 left-3 z-10")}
    </div>
  );
};

const BlogCard = ({ post, onEdit, onDelete }) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <CoverImage post={post} />

        <div className="p-4 text-right">
          <div className="flex flex-nowrap items-center justify-between gap-2 text-[12px] text-gray-400 mb-2">
            <span className="whitespace-nowrap">{post.date}</span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Clock size={12} />
              {post.readingTime} دقائق
            </span>
          </div>
          <h3 className="font-bold text-[16px] text-[#1F2937] mb-2 line-clamp-2">{post.title}</h3>
          <p className="text-[13px] text-gray-500 mb-4 line-clamp-2">{post.description}</p>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 py-2 rounded-lg border border-[#E5E5E5] text-[#575F69] text-[13px] font-medium hover:bg-gray-50 transition-colors"
            >
              معاينة
            </button>
            <button
              onClick={() => onEdit(post.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#E5E5E5] text-[#123C91] text-[13px] font-medium hover:bg-[#EAF4FF] transition-colors"
            >
              <Pencil size={14} />
              تعديل
            </button>
            <button
              onClick={() => onDelete(post)}
              className="w-10 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              aria-label="حذف"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl relative" dir="rtl">
              
              {/* زر الإغلاق (X) أصبح داخل الصندوق في الأعلى جهة الشمال تماماً */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-3 left-3 z-30 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>

              <CoverImage post={post} variant="modal" />

              <div className="p-5 text-right">
                <div className="flex flex-nowrap items-center justify-between gap-2 text-[12px] text-gray-400 mb-3">
                  {statusBadge(post.status)}
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock size={12} />
                    {post.readingTime} دقائق
                  </span>
                  <span className="whitespace-nowrap">{post.date}</span>
                </div>

                <h3 className="font-bold text-[18px] text-[#1F2937] mb-2">{post.title}</h3>
                <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">{post.description}</p>

                {post.content && (
                  <div className="bg-[#EAF4FF] text-[#123C91] text-[13px] rounded-xl px-4 py-3 mb-5 leading-relaxed border border-[#d2e6ff]">
                    {post.content}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E5E5E5] text-[#575F69] text-[14px] font-medium hover:bg-gray-50 transition-colors"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => {
                      setShowPreview(false);
                      onEdit(post.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#123C91] bg-[#123C91] text-white text-[14px] font-medium hover:bg-[#0f3278] transition-colors"
                  >
                    <Pencil size={14} />
                    تعديل
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogCard;
