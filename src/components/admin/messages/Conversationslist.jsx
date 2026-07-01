import { Plus, Search } from "lucide-react";

const filters = [
  { key: "all", label: "الكل" },
  { key: "teachers", label: "المعلمون" },
  { key: "students", label: "الطلاب" },
  { key: "parents", label: "أولياء الأمور" },
];

export default function ConversationsLists({
  conversations,
  activeId,
  onSelect,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  mode = "chat",
}) {
  const filtered = conversations.filter((c) => {
    const matchesFilter = activeFilter === "all" || c.category === activeFilter;
    const matchesSearch =
      c.name.includes(searchQuery) ||
      (c.teacherName ?? "").includes(searchQuery) ||
      (c.parentName ?? "").includes(searchQuery) ||
      (c.role ?? "").includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex w-full flex-col h-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-base font-bold text-slate-800 font-['IBM_Plex_Sans_Arabic']">
          المحادثات
        </h2>
        {mode === "chat" && (
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123C91] text-white hover:bg-[#0f2f70] transition-colors"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              mode === "chat"
                ? "ابحث عن معلم او مجموعة..."
                : "ابحث عن معلم او طالب..."
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-9 pl-3 text-sm text-slate-700 placeholder:text-gray-400 focus:border-[#123C91] focus:outline-none focus:ring-1 focus:ring-[#123C91] font-['IBM_Plex_Sans_Arabic']"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-4 pb-3">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFilterChange(f.key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors font-['IBM_Plex_Sans_Arabic']
              ${
                activeFilter === f.key
                  ? "bg-[#123C91] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400 font-['IBM_Plex_Sans_Arabic']">
            لا توجد محادثات مطابقة
          </p>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-xl border p-3 text-right shadow-sm transition-colors font-['IBM_Plex_Sans_Arabic']
                ${
                  c.id === activeId
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-100 bg-white hover:bg-gray-50"
                }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#123C91] text-sm font-bold text-white">
                    {c.avatarInitial}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {c.name}
                    </p>
                    {mode === "monitor" && (
                      <p className="text-[11px] text-gray-400">
                        معلم ←&nbsp;ولي أمر
                      </p>
                    )}
                    {mode === "chat" && (
                      <p className="text-[11px] text-gray-400">{c.role}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Time + unread */}
              <div className="mt-1 flex items-center justify-end gap-2">
                <span className="text-xs text-gray-400">
                  {c.lastMessageTime}
                </span>
                {c.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#123C91] text-[11px] font-semibold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>

              {/* Preview */}
              <p className="mt-1 truncate text-xs text-gray-500 text-right">
                {c.lastMessagePreview}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
