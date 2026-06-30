import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, ChevronDown, ChevronRight, ChevronLeft, ClipboardList, CheckCircle2, Clock3 } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";

const MOCK_REQUESTS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  student: "محمد أحمد",
  guardian: i % 3 === 0 ? "--" : "أحمد علي",
  subjects:
    i % 3 === 0
      ? ["رياضيات", "لغة عربية", "فيزياء"]
      : i % 3 === 1
      ? ["رياضيات"]
      : ["كيمياء", "رياضيات", "لغة عربية", "فيزياء"],
  date: "2024-09-01",
  status: i % 3 === 2 ? "مكتمل" : "قيد الانتظار",
}));

const PAGE_SIZE = 6;

// ─── Filters ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["جميع الحالات", "قيد الانتظار", "مكتمل"];
const DATE_OPTIONS = [
  { value: "", label: "تاريخ الطلب" },
  { value: "newest", label: "الأحدث أولاً" },
  { value: "oldest", label: "الأقدم أولاً" },
];

const RequestsFilters = ({
  search,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterDate,
  onFilterDateChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4" dir="rtl">
      {/* Search */}
      <div className="relative w-full sm:flex-1" style={{ height: "48px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="ابحث باسم الطالب أو ولي الأمر..."
          className="w-full h-full pr-10 pl-4 bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg text-sm outline-none focus:border-[#123C91] transition-colors font-['IBM_Plex_Sans_Arabic']"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
      </div>

      {/* Status + Date filters */}
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-44" style={{ height: "48px" }}>
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange?.(e.target.value)}
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91] font-['IBM_Plex_Sans_Arabic']"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
        </div>

        <div className="relative w-full sm:w-44" style={{ height: "48px" }}>
          <select
            value={filterDate}
            onChange={(e) => onFilterDateChange?.(e.target.value)}
            className="w-full h-full appearance-none bg-[#F9FAFA] border border-[#E5E5E5] rounded-lg px-4 py-3 text-sm text-[#575F69] outline-none cursor-pointer focus:border-[#123C91] font-['IBM_Plex_Sans_Arabic']"
          >
            {DATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-[#575F69] pointer-events-none" size={16} />
        </div>
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ total, pending, completed }) => {
  const stats = [
    { label: "إجمالي الطلبات", value: total,     color: "text-[#123C91]", bg: "bg-[#EAF4FF]", icon: ClipboardList },
    { label: "مكتمل",           value: completed, color: "text-[#00A63E]", bg: "bg-[#00A63E1A]", icon: CheckCircle2 },
    { label: "قيد الانتظار",    value: pending,   color: "text-[#FF8A00]", bg: "bg-[#FF8A001A]", icon: Clock3 },
  ];
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6" dir="rtl">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow min-w-0"
          >
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <Icon size={22} className={s.color} />
            </div>
            <div className="text-right min-w-0">
              <h3 className="text-[18px] sm:text-xl font-bold text-gray-800 leading-tight">{s.value}</h3>
              <p className="text-gray-500 text-[12px] sm:text-sm mt-0.5 truncate">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Subject Tag ──────────────────────────────────────────────────────────────
const SubjectTag = ({ label }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EAF4FF] text-[#123C91] whitespace-nowrap">
    {label}
  </span>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    "مكتمل":        "bg-[#00A63E26] text-[#00A63E]",
    "قيد الانتظار": "bg-[#FF8A0026] text-[#FF8A00]",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({ page, total, totalPages, displayed, onChange }) => (
  <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-1 gap-3" dir="rtl">
    <span className="text-[13px] text-[#575F69] text-center sm:text-right">عرض {displayed} من أصل {total} طلب اشتراك</span>
    <div className="flex items-center flex-wrap justify-center gap-1">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-40 hover:bg-gray-50 shrink-0">
        <ChevronRight size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors shrink-0 ${p === page ? "bg-[#123C91] text-white" : "border border-gray-200 text-[#575F69] hover:bg-gray-50"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-40 hover:bg-gray-50 shrink-0">
        <ChevronLeft size={16} />
      </button>
    </div>
  </div>
);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const RequestCard = ({ r, onView }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="min-w-0">
        <p className="font-['Tajawal'] font-semibold text-[15px] text-[#1F2937] truncate">{r.student}</p>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">ولي الأمر: {r.guardian}</p>
      </div>
      <StatusBadge status={r.status} />
    </div>

    <div className="mb-3">
      <p className="text-[11px] text-[#9CA3AF] mb-1.5">المواد المطلوبة</p>
      <div className="flex flex-wrap gap-1">
        {r.subjects.map((s) => <SubjectTag key={s} label={s} />)}
      </div>
    </div>

    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
      <span className="text-[12px] text-[#575F69]">{r.date}</span>
      <button
        onClick={onView}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#123C91] bg-[#EAF4FF] hover:bg-[#d6e6fb] transition-colors"
      >
        <Eye size={14} />
        عرض التفاصيل
      </button>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SubscriptionRequestsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("جميع الحالات");
  const [dateFilter, setDateFilter]     = useState("");
  const [page, setPage]                 = useState(1);

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch = r.student.includes(search) || r.guardian.includes(search);
    const matchStatus = statusFilter === "جميع الحالات" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pending    = MOCK_REQUESTS.filter((r) => r.status === "قيد الانتظار").length;
  const completed  = MOCK_REQUESTS.filter((r) => r.status === "مكتمل").length;

  return (
    <AdminLayout>
      <div dir="rtl" className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic'] overflow-x-hidden">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
          <div className="text-right">
            <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[18px] sm:text-[20px] text-[#123C91]">
              طلبات الاشتراك
            </h2>
          </div>
        </div>

        {/* Stats */}
        <StatsBar total={MOCK_REQUESTS.length} pending={pending} completed={completed} />

        {/* Filters */}
        <RequestsFilters
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          filterStatus={statusFilter}
          onFilterStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
          filterDate={dateFilter}
          onFilterDateChange={setDateFilter}
        />

        {/* Empty state */}
        {paged.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
            <p className="text-[14px] text-[#9CA3AF]">لا توجد طلبات مطابقة لبحثك</p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right" style={{ minWidth: 680 }}>
                  <thead className="bg-[#F9FAFA] border-b border-gray-100">
                    <tr>
                      {["الطالب", "ولي الأمر", "المواد المطلوبة", "تاريخ الطلب", "الحالة", "الإجراءات"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-[13px] font-medium text-[#575F69] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paged.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-['Tajawal'] font-semibold text-[15px] text-[#1F2937] whitespace-nowrap">{r.student}</td>
                        <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">{r.guardian}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {r.subjects.map((s) => <SubjectTag key={s} label={s} />)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">{r.date}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            {/* {r.status === "قيد الانتظار" && (
                              <button
                                onClick={() => navigate(`/admin/subscriptions/requests/${r.id}/activate`)}
                                className="p-2 rounded-lg text-[#575F69] hover:bg-[#EAF4FF] hover:text-[#123C91] transition-colors"
                                title="تفعيل الاشتراك"
                              >
                                <CheckCircle2 size={17} />
                              </button>
                            )} */}
                            <button
                            onClick={() => navigate(`/admin/subscriptions/requests/${r.id}/activate`)}
                              className="p-2 rounded-lg text-[#575F69] hover:bg-[#EAF4FF] hover:text-[#123C91] transition-colors"
                              title="عرض التفاصيل"
                            >
                              <Eye size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {paged.map((r) => (
                <RequestCard key={r.id} r={r} onView={() => navigate(`/admin/subscriptions/requests/${r.id}/activate`)} />
              ))}
            </div>
          </>
        )}

        <Pagination
          page={page}
          total={filtered.length}
          totalPages={totalPages}
          displayed={paged.length}
          onChange={setPage}
        />
      </div>
    </AdminLayout>
  );
};

export default SubscriptionRequestsPage;