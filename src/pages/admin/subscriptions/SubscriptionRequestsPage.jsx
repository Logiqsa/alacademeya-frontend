import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Loader2, AlertCircle, Inbox, Calendar } from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import { getPendingSubscriptionRequests } from "../../../services/APIService";

const PAGE_SIZE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const nameOf = (obj) => obj?.name?.ar || obj?.name?.en || obj?.fullName || "—";

const formatDate = (iso) => {
  if (!iso) return "--";
  try {
    return new Date(iso).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "--";
  }
};

const STATUS_STYLES = {
  pending: { label: "قيد الانتظار", text: "text-[#FF8A00]", bg: "bg-[#FF8A001A]" },
  approved: { label: "مكتمل", text: "text-[#00A63E]", bg: "bg-[#00A63E1A]" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] ?? {
    label: status || "--",
    text: "text-gray-500",
    bg: "bg-gray-100",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

const SubjectsPreview = ({ subjects = [] }) => {
  if (!subjects.length) return <span className="text-[#9CA3AF] text-[12px]">--</span>;
  const shown = subjects.slice(0, 2);
  const rest = subjects.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((s) => (
        <span
          key={s.id}
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EAF4FF] text-[#123C91]"
        >
          {nameOf(s)}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[11px] text-[#9CA3AF]">+{rest}</span>
      )}
    </div>
  );
};

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const RequestCard = ({ request, onView }) => (
  <div dir="rtl" className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[14px] font-semibold text-[#1F2937] font-['Tajawal']">
        {request.user?.fullName || "--"}
      </p>
      <StatusBadge status={request.status} />
    </div>

    <div className="flex items-center justify-between text-[12px] text-[#8C9198]">
      <span>{nameOf(request.grade)}</span>
      <span className="flex items-center gap-1">
        <Calendar size={12} />
        {formatDate(request.createdAt)}
      </span>
    </div>

    <SubjectsPreview subjects={request.preferredSubjects} />

    <button
      onClick={() => onView(request)}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#123C91]/20 text-[#123C91] text-[13px] font-medium hover:bg-[#123C91]/5 transition-colors"
    >
      <Eye size={15} />
      عرض وتفعيل الاشتراك
    </button>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const SubscriptionRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getPendingSubscriptionRequests();
      setRequests(res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحميل طلبات الاشتراك");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const paged = useMemo(
    () => requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [requests, page],
  );

  // Eye button → straight to the activate-subscription page.
  // We pass the full request object through router state so ActivateSubscriptionPage
  // can render immediately without another round-trip; it also has its own
  // fallback fetch if the page is opened directly (e.g. refresh / shared link).
  const handleView = (request) => {
    navigate(`/admin/subscriptions/requests/${request.id}/activate`, {
      state: { request },
    });
  };

  return (
    <AdminLayout>
      <div dir="rtl" className="w-full p-2 sm:p-4 font-['IBM_Plex_Sans_Arabic']">
        <div className="mb-5">
          <h2 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[20px] sm:text-[24px] text-[#123C91] mb-1">
            طلبات الاشتراك
          </h2>
          <p className="text-[#575F69] text-[13px] sm:text-[14px]">
            راجع طلبات الاشتراك الجديدة وفعّلها بعد اختيار المعلم والمجموعة والباقة
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#9CA3AF] gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-[13px]">جاري التحميل...</span>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
            <AlertCircle size={20} className="text-red-500 mx-auto mb-2" />
            <p className="text-[14px] text-[#E0394C] mb-3">{error}</p>
            <button
              onClick={fetchRequests}
              className="text-[13px] text-[#123C91] font-medium hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
            <Inbox size={22} className="text-gray-300 mx-auto mb-2" />
            <p className="text-[14px] text-[#9CA3AF]">لا توجد طلبات اشتراك قيد الانتظار حالياً</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right" style={{ minWidth: 720 }}>
                  <thead className="bg-[#F9FAFA] border-b border-gray-100">
                    <tr>
                      {["اسم الطالب", "الصف الدراسي", "المواد المطلوبة", "تاريخ الطلب", "الحالة", ""].map((h, i) => (
                        <th key={i} className="px-5 py-3.5 text-[12px] font-semibold text-[#8C9198] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paged.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-[13px] font-medium text-[#1F2937]">
                          {r.user?.fullName || "--"}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#575F69]">
                          {nameOf(r.grade)}
                        </td>
                        <td className="px-5 py-3.5">
                          <SubjectsPreview subjects={r.preferredSubjects} />
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-[#575F69] whitespace-nowrap">
                          {formatDate(r.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleView(r)}
                            className="p-2 rounded-lg text-[#575F69] hover:bg-[#123C91]/10 hover:text-[#123C91] transition-colors"
                            title="عرض وتفعيل الاشتراك"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {paged.map((r) => (
                <RequestCard key={r.id} request={r} onView={handleView} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div dir="rtl" className="flex items-center justify-center gap-1 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                      p === page
                        ? "bg-[#123C91] text-white [&_svg]:text-white"
                        : "border border-gray-200 text-[#575F69] hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-[#575F69] disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default SubscriptionRequestsPage;