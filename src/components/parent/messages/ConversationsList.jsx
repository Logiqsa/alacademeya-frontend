import { Plus, Search } from "lucide-react";

const filters = [
  { key: "all", label: "الكل" },
  { key: "teachers", label: "المعلمون" },
  { key: "admin", label: "الإدارة" },
];

export default function ConversationsList({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) {
  const filtered = conversations.filter((c) => {
    const matchesFilter = activeFilter === "all" || c.category === activeFilter;
    const matchesSearch =
      c.name.includes(searchQuery) || (c.studentName ?? "").includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex w-full max-w-[340px] flex-col border-r border-gray-100">
      {/* العنوان + زر محادثة جديدة */}
      <div className="flex items-center justify-between p-4 pb-3">
        <h2 className="text-base font-bold text-slate-800">المحادثات</h2>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 text-white hover:bg-blue-800"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* البحث */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن معلم او ابن..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-9 pl-3 text-sm text-slate-700 placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* الفلاتر */}
      <div className="flex items-center gap-2 px-4 pb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-blue-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* قائمة المحادثات */}
      <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-4">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">لا توجد محادثات مطابقة</p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-xl border p-3 text-right shadow-sm transition-colors ${
                c.id === activeId
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-100 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                    {c.avatarInitial}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {c.name} <span className="font-normal text-gray-400">({c.role})</span>
                  </span>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-end gap-2">
                <span className="text-xs text-gray-400">{c.lastMessageTime}</span>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-[11px] font-semibold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>

              <div className="mt-1 text-right">
                {c.studentName && <p className="text-xs text-gray-400">الطالب: {c.studentName}</p>}
                <p className="truncate text-xs text-gray-500">{c.lastMessagePreview}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}