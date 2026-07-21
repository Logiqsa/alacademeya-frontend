import { Pencil, Trash2, Clock } from "lucide-react";

const statusBadge = (status) =>
  status === "published"
    ? <span className="absolute top-3 left-3 bg-[#00A63E] text-white text-[10px] px-2.5 py-1 rounded-full">منشور</span>
    : <span className="absolute top-3 left-3 bg-[#FF8A00] text-white text-[10px] px-2.5 py-1 rounded-full">مسودة</span>;

const BlogCard = ({ post, onEdit, onDelete }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
    <div className="h-40 relative" style={{ backgroundColor: post.coverImageUrl ? undefined : "#123C91" }}>
      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 rounded-full border border-white/30">
        {post.categoryName}
      </span>
      {statusBadge(post.status)}
    </div>

    <div className="p-4 text-right">
      <div className="flex items-center justify-between text-[12px] text-gray-400 mb-2">
        <span>{post.date}</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {post.readingTime} دقائق
        </span>
      </div>
      <h3 className="font-bold text-[16px] text-[#1F2937] mb-2 line-clamp-2">{post.title}</h3>
      <p className="text-[13px] text-gray-500 mb-4 line-clamp-2">{post.description}</p>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#E5E5E5] text-[#123C91] text-[13px] font-medium hover:bg-[#EAF4FF] transition-colors"
        >
          <Pencil size={14} />
          تعديل
        </button>
        <button
          onClick={() => onDelete(post)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-500 text-[13px] font-medium hover:bg-red-50 transition-colors"
        >
          <Trash2 size={14} />
          حذف
        </button>
      </div>
    </div>
  </div>
);

export default BlogCard;