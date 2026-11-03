import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, Loader2, RefreshCw, FilePenLine, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cancelSubscription, getAllSubscriptions } from "../../../../services/APIService";
import EntityProfileModal from "../../users/EntityProfileModal";
import Paginationn from "../../../teacher/groups/students/Paginationn";
import { getSavedPageSize } from "../../../../utils/tablePagination";
import AppSelect from "../../../ui/AppSelect";

const PAGE_SIZE = 10;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: "bg-[#07883B] text-white",
    expired: "bg-[#D96600] text-white",
    suspended: "bg-[#DC2626] text-white",
    incomplete: "bg-[#1D4ED8] text-white",
  };
  const label =
    { active: "نشط", expired: "منتهي", suspended: "موقوف", incomplete: "بيانات غير مكتملة" }[status] ?? status;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${map[status] ?? "bg-[#475569] text-white"}`}
    >
      {label}
    </span>
  );
};

// ─── Row Actions ──────────────────────────────────────────────────────────────
const RowActions = ({ onView, onRenew, canRenew, onComplete, onCancel, cancelling }) => (<div className="flex items-center gap-1"><button
    onClick={onView}
    className="p-2 rounded-lg text-[#575F69] hover:bg-[#EAF4FF] hover:text-[#123C91] transition-colors"
    title="عرض التفاصيل"
  >
    <Eye size={17} />
  </button>{canRenew && <button onClick={onRenew} className="p-2 rounded-lg text-[#123C91] hover:bg-[#EAF4FF]" title="تجديد يدوي"><RefreshCw size={17}/></button>}{onComplete && <button onClick={onComplete} className="p-2 rounded-lg text-amber-700 hover:bg-amber-50" title="استكمال بيانات الاشتراك"><FilePenLine size={17}/></button>}{onCancel && <button onClick={onCancel} disabled={cancelling} className="p-2 disabled:opacity-50" title="حذف الاشتراك وإخراج الطالب من المجموعة" aria-label="حذف الاشتراك وإخراج الطالب من المجموعة">{cancelling ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}</button>}</div>);

const valueOrDash = (value) => (value == null || value === "" ? "--" : value);

const sessionValue = (...values) => {
  const value = values.find((item) => item != null && item !== "");
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const sessionDisplay = (value) => (value == null ? "--" : `${value} حصة`);

// ─── Mobile Card ──────────────────────────────────────────────────────────────
const SubCard = ({ s, onView, onRenew, onComplete, onStudentClick, onCancel, cancelling }) => (
  <div className="p-4 flex flex-col gap-2.5">
    <div className="flex items-start justify-between gap-2">
      <button
        type="button"
        onClick={onStudentClick}
        className="font-['Tajawal'] font-semibold text-[15px] text-[#123C91] hover:underline"
      >
        {s.student}
      </button>
      <RowActions onView={onView} onRenew={onRenew} onComplete={onComplete} onCancel={onCancel} cancelling={cancelling} canRenew={s.status === "active" && !s.incomplete} />
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">المادة</span>
      <span className="text-[#575F69]">{s.subject}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الباقة</span>
      <span className="text-[#575F69]">{s.package}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الخصم</span>
      <span className="text-[#575F69]">{s.discount}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">المستهلك</span>
      <span className="text-[#575F69]">{s.usedSessions}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">المتبقي</span>
      <span className="font-medium text-[#123C91]">{s.remainingSessions}</span>
    </div>
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-[#9CA3AF]">الحالة</span>
      <StatusBadge status={s.status} />
    </div>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
// API بترجع "subscription" واحد فيه array "items" (مادة لكل item ممكن يكون بمعلم/باقة مختلفين).
// بنفرد كل item كصف مستقل في الجدول عشان يطابق تصميم الـ UI الحالي.
const flattenSubscriptions = (subscriptions) => {
  const rows = [];
  for (const sub of subscriptions) {
    const studentName = sub.student?.user?.fullName ?? "--";
    if (!sub.items?.length) {
      rows.push({
        rowId: sub.id || sub._id,
        subscriptionId: sub.id || sub._id,
        studentId: sub.student?.id || sub.student?._id,
        student: studentName,
        studentEntity: sub.student,
        subject: "غير متاحة",
        package: "غير متاحة",
        discount: "--",
        usedSessions: "--",
        remainingSessions: "--",
        status: "incomplete",
        subscriptionStatus: sub.status,
        incomplete: true,
      });
      continue;
    }
    for (const [index, item] of (sub.items ?? []).entries()) {
      const totalSessions = sessionValue(
        item.totalSessions,
        item.package?.sessions,
        item.packageSessions,
      );
      const remainingSessions = sessionValue(
        item.remainingSessions,
        item.sessionsRemaining,
        item.remaining,
      );
      const usedSessions = sessionValue(
        item.usedSessions,
        item.consumedSessions,
        item.sessionsUsed,
        totalSessions != null && remainingSessions != null
          ? totalSessions - remainingSessions
          : null,
      );

      rows.push({
        rowId: item.id ?? item._id ?? `${sub.id || sub._id}-${index}`,
        subscriptionId: sub.id || sub._id,
        student: studentName,
        studentEntity: sub.student,
        subject: item.subject?.name?.ar ?? item.subject?.name?.en ?? "--",
        package: item.package?.name ?? "--",
        discount: item.discount ? `${item.discount} جنيه` : "--",
        usedSessions: sessionDisplay(usedSessions),
        remainingSessions: sessionDisplay(remainingSessions),
        status: item.status ?? sub.status,
        subscriptionStatus: sub.status,
      });
    }
  }
  return rows;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SubscriptionsTab = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSavedPageSize(PAGE_SIZE));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStudent, setProfileStudent] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllSubscriptions();
      setSubscriptions(res.data?.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تحميل الاشتراكات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const rows = useMemo(
    () => flattenSubscriptions(subscriptions),
    [subscriptions],
  );
  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("ar");
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch = !query || [row.student, row.subject, row.package]
        .some((value) => String(value || "").toLocaleLowerCase("ar").includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [rows, searchQuery, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm("سيتم إلغاء الاشتراك وإخراج الطالب من المجموعة والشات الخاص بها. هل تريد المتابعة؟")) return;
    setCancellingId(subscriptionId);
    try {
      await cancelSubscription(subscriptionId);
      setSubscriptions((current) => current.filter((subscription) => String(subscription.id || subscription._id) !== String(subscriptionId)));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "تعذر إلغاء الاشتراك");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[#9CA3AF] gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px]">جاري التحميل...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl py-14 px-4 text-center">
        <p className="text-[14px] text-[#E0394C] mb-3">{error}</p>
        <button
          onClick={fetchSubscriptions}
          className="text-[13px] text-[#123C91] font-medium hover:underline"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      {rows.length > 0 && <div className="mb-4 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_220px]" dir="rtl">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1); }} placeholder="ابحث باسم الطالب أو المادة أو الباقة..." className="h-11 w-full rounded-xl border border-gray-200 bg-[#F8FAFC] pr-10 pl-3 text-sm outline-none focus:border-[#123C91]" />
        </div>
        <AppSelect value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm">
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="expired">منتهي</option>
          <option value="suspended">موقوف</option>
          <option value="incomplete">بيانات غير مكتملة</option>
        </AppSelect>
      </div>}

      {filteredRows.length > 0 && (
        <Paginationn
          page={currentPage}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={filteredRows.length}
          displayedCount={paged.length}
          unitLabel="اشتراك"
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
      )}

      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        dir="rtl"
      >
        {filteredRows.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <p className="text-[14px] text-[#9CA3AF]">
              {rows.length ? "لا توجد اشتراكات مطابقة للفلاتر" : "لا توجد اشتراكات حالياً"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: stacked cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {paged.map((s) => (
                <SubCard
                  key={s.rowId}
                  s={s}
                  onView={() =>
                    navigate(`/admin/subscriptions/${s.subscriptionId}`)
                  }
                  onRenew={() => navigate(`/admin/subscriptions/${s.subscriptionId}/renew`)}
                  onComplete={s.incomplete ? () => navigate(`/admin/subscriptions/add?studentId=${s.studentId}&completeLegacy=${s.subscriptionId}`) : undefined}
                  onStudentClick={() => setProfileStudent(s.studentEntity)}
                  onCancel={s.subscriptionStatus !== "cancelled" ? () => handleCancelSubscription(s.subscriptionId) : undefined}
                  cancelling={cancellingId === s.subscriptionId}
                />
              ))}
            </div>

            {/* Desktop/tablet: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right" style={{ minWidth: 680 }}>
                <thead className="bg-[#F9FAFA] border-b border-gray-100">
                  <tr>
                    {[
                      "الطالب",
                      "المادة",
                      "الباقة",
                      "الخصم",
                      "المستهلك",
                      "المتبقي",
                      "الحالة",
                      "الإجراءات",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[13px] font-medium text-[#575F69] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((s) => (
                    <tr
                      key={s.rowId}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-['Tajawal'] font-semibold text-[15px] text-[#1F2937] whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setProfileStudent(s.studentEntity)}
                          className="text-[#123C91] hover:underline"
                        >
                          {s.student}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {s.subject}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {s.package}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {valueOrDash(s.discount)}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#575F69] whitespace-nowrap">
                        {s.usedSessions}
                      </td>
                      <td className="px-5 py-3.5 text-[14px] font-medium text-[#123C91] whitespace-nowrap">
                        {s.remainingSessions}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <RowActions canRenew={s.status === "active" && !s.incomplete} onRenew={() => navigate(`/admin/subscriptions/${s.subscriptionId}/renew`)}
                          onComplete={s.incomplete ? () => navigate(`/admin/subscriptions/add?studentId=${s.studentId}&completeLegacy=${s.subscriptionId}`) : undefined}
                          onView={() =>
                            navigate(`/admin/subscriptions/${s.subscriptionId}`)
                          }
                          onCancel={s.subscriptionStatus !== "cancelled" ? () => handleCancelSubscription(s.subscriptionId) : undefined}
                          cancelling={cancellingId === s.subscriptionId}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <EntityProfileModal
        entity={profileStudent}
        role="student"
        onClose={() => setProfileStudent(null)}
      />
    </div>
  );
};

export default SubscriptionsTab;
