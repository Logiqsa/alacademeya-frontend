import { ChevronRight, ChevronLeft } from "lucide-react";

const Pagination = ({ page, totalItems, itemsPerPage = 6, onChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-sm text-gray-500 mt-6">
      <span>عرض {Math.min(itemsPerPage, totalItems)} من اصل {totalItems} مجموعة</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="p-2 border rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onChange(n)} className={`w-8 h-8 rounded-lg ${page === n ? "bg-[#123C91] text-white" : "border hover:bg-gray-50"}`}>{n}</button>
        ))}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="p-2 border rounded-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
      </div>
    </div>
  );
};
export default Pagination;