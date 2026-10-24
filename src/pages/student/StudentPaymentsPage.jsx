import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import StudentLayout from "../../components/student/layout/StudentLayout";
import {
  getMyCoursePurchases,
  getMySubscriptionOrders,
} from "../../services/APIService";
import { formatMoney } from "../../utils/currencyDisplay";

const listFrom = (response) => {
  const body = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(body) ? body : [];
};

const idOf = (value) =>
  String(typeof value === "object" ? value?.id || value?._id || "" : value || "");

const localName = (value, fallback = "—") =>
  value?.ar || value?.en || (typeof value === "string" ? value : fallback);

const formatDate = (date) => {
  if (!date) return "—";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
};

const formatRelativeDate = (date) => {
  if (!date) return "لا توجد عمليات";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "لا توجد عمليات";
  const days = Math.max(0, Math.floor((Date.now() - value.getTime()) / 86400000));
  if (days === 0) return "اليوم";
  if (days === 1) return "أمس";
  if (days < 30) return `قبل ${days.toLocaleString("ar-EG")} يوم`;
  const months = Math.floor(days / 30);
  if (months < 12) return `قبل ${months.toLocaleString("ar-EG")} شهر`;
  const years = Math.floor(months / 12);
  return `قبل ${years.toLocaleString("ar-EG")} سنة`;
};

const normalizeCoursePurchases = (response) =>
  listFrom(response)
    .filter((purchase) => purchase.paymentStatus === "paid")
    .map((purchase) => ({
      key: `course-${idOf(purchase)}`,
      id: idOf(purchase),
      reference: purchase.whopPaymentId || idOf(purchase),
      title: localName(purchase.course?.title, "دورة تعليمية"),
      provider: purchase.course?.instructor?.name || "الأكاديمية",
      date: purchase.paidAt || purchase.createdAt,
      amount: Number(purchase.amount || 0),
      currency: purchase.currency || "EGP",
      units: [idOf(purchase.course)].filter(Boolean),
    }));

const normalizeSubscriptionOrders = (response) =>
  listFrom(response)
    .filter((order) => order.paymentStatus === "paid")
    .map((order) => {
      const items = Array.isArray(order.items) ? order.items : [];
      const subjectNames = [
        ...new Set(items.map((item) => item.subjectName).filter(Boolean)),
      ];
      const providerNames = [
        ...new Set(
          items
            .map(
              (item) =>
                item.teacher?.user?.fullName ||
                item.teacher?.name ||
                item.teacherName,
            )
            .filter(Boolean),
        ),
      ];
      return {
        key: `subscription-${idOf(order)}`,
        id: idOf(order),
        reference: order.whopPaymentId || idOf(order),
        title:
          subjectNames.join("، ") ||
          (order.orderType === "renewal" ? "تجديد اشتراك" : "اشتراك تعليمي"),
        provider: providerNames.join("، ") || "الأكاديمية",
        date: order.paidAt || order.createdAt,
        amount: Number(order.totalAmount || 0),
        currency: order.currency || "EGP",
        units: items.map((item) => idOf(item.subject)).filter(Boolean),
      };
    });

const formatPaidTotals = (payments) => {
  const totals = new Map();
  payments.forEach((payment) => {
    totals.set(
      payment.currency,
      (totals.get(payment.currency) || 0) + payment.amount,
    );
  });
  if (!totals.size) return formatMoney(0, "EGP");
  return [...totals.entries()]
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(" + ");
};

const StatCard = ({ icon: Icon, iconClass, iconBackground, value, label }) => (
  <article className="flex min-h-28 items-center gap-4 rounded-xl border border-[#E3E6EA] bg-white p-5 shadow-sm">
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBackground}`}
    >
      <Icon size={21} className={iconClass} />
    </span>
    <div className="min-w-0">
      <p className="text-lg font-bold text-[#1F2937]">{value}</p>
      <p className="mt-1 text-sm text-[#69717C]">{label}</p>
    </div>
  </article>
);

const MobilePaymentCard = ({ payment }) => (
  <article className="rounded-xl border border-[#E3E6EA] bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4 border-b border-[#EEF0F2] pb-3">
      <div>
        <p className="font-semibold text-[#1F2937]">{payment.title}</p>
        <p className="mt-1 text-sm text-[#69717C]">{payment.provider}</p>
      </div>
      <span className="max-w-28 truncate font-mono text-xs text-[#69717C]">
        #{payment.reference}
      </span>
    </div>
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-[#69717C]">{formatDate(payment.date)}</span>
      <span className="font-semibold text-[#1F2937]">
        {formatMoney(payment.amount, payment.currency)}
      </span>
    </div>
  </article>
);

const StudentPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [referenceTime, setReferenceTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [period, setPeriod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    let active = true;
    const loadPayments = async () => {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        getMySubscriptionOrders(),
        getMyCoursePurchases(),
      ]);
      if (!active) return;
      setReferenceTime(Date.now());

      const successful = results.filter((result) => result.status === "fulfilled");
      if (!successful.length) {
        setPayments([]);
        setError("تعذر تحميل سجل المدفوعات، حاول مرة أخرى");
      } else {
        const subscriptionPayments =
          results[0].status === "fulfilled"
            ? normalizeSubscriptionOrders(results[0].value)
            : [];
        const coursePayments =
          results[1].status === "fulfilled"
            ? normalizeCoursePurchases(results[1].value)
            : [];
        setPayments([...subscriptionPayments, ...coursePayments]);
        if (successful.length !== results.length) {
          setError("تعذر تحميل جزء من سجل المدفوعات. البيانات الظاهرة مكتملة جزئيًا.");
        }
      }
      setLoading(false);
    };
    loadPayments();
    return () => {
      active = false;
    };
  }, [reloadToken]);

  const visiblePayments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");
    return payments
      .filter((payment) => {
        const matchesSearch = [
          payment.reference,
          payment.title,
          payment.provider,
        ]
          .join(" ")
          .toLocaleLowerCase("ar")
          .includes(query);
        const ageInDays =
          (referenceTime - new Date(payment.date).getTime()) / 86400000;
        return (
          matchesSearch &&
          (period === "all" || ageInDays <= Number(period))
        );
      })
      .sort(
        (a, b) =>
          (sort === "newest" ? -1 : 1) *
          (new Date(a.date).getTime() - new Date(b.date).getTime()),
      );
  }, [payments, period, referenceTime, search, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(visiblePayments.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstVisibleIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedPayments = visiblePayments.slice(
    firstVisibleIndex,
    firstVisibleIndex + itemsPerPage,
  );
  const totalPaid = useMemo(() => formatPaidTotals(payments), [payments]);
  const purchasesCount = useMemo(
    () => new Set(payments.flatMap((payment) => payment.units)).size,
    [payments],
  );
  const lastPaymentDate = useMemo(
    () =>
      payments.reduce((latest, payment) => {
        const timestamp = new Date(payment.date).getTime();
        return timestamp > latest ? timestamp : latest;
      }, 0),
    [payments],
  );

  const resetToFirstPage = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <StudentLayout>
      <section
        dir="rtl"
        className="w-full pb-8 font-['IBM_Plex_Sans_Arabic'] text-right"
      >
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-[#123C91]">المدفوعات</h1>
          <p className="mt-2 text-sm text-[#69717C]">
            سجل مشترياتك وفواتيرك في مكان واحد
          </p>
        </header>

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="flex items-center gap-2">
              <AlertCircle size={17} />
              {error}
            </span>
            <button
              type="button"
              onClick={() => setReloadToken((value) => value + 1)}
              className="flex shrink-0 items-center gap-1 font-semibold text-[#123C91]"
            >
              <RefreshCw size={15} /> إعادة المحاولة
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            icon={WalletCards}
            iconClass="text-[#12BDAA]"
            iconBackground="bg-[#E5FAF7]"
            value={loading ? "—" : totalPaid}
            label="إجمالي المدفوع"
          />
          <StatCard
            icon={BookOpen}
            iconClass="text-[#19A64A]"
            iconBackground="bg-[#E8F8ED]"
            value={loading ? "—" : purchasesCount.toLocaleString("ar-EG")}
            label="المشتريات التعليمية"
          />
          <StatCard
            icon={Clock3}
            iconClass="text-[#1757B8]"
            iconBackground="bg-[#EAF2FF]"
            value={loading ? "—" : formatRelativeDate(lastPaymentDate)}
            label="آخر عملية دفع"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E3E6EA] bg-white shadow-sm">
          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <label className="relative block w-full md:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#69717C]"
              />
              <input
                value={search}
                onChange={resetToFirstPage(setSearch)}
                placeholder="ابحث برقم العملية أو اسم المشتريات..."
                className="h-11 w-full rounded-lg border border-[#E3E6EA] bg-[#FAFBFC] pr-10 pl-4 text-sm text-[#1F2937] outline-none transition focus:border-[#123C91] focus:ring-2 focus:ring-[#123C91]/10"
              />
            </label>
            <div className="flex gap-3">
              <label className="relative min-w-32 flex-1 md:flex-none">
                <select
                  value={sort}
                  onChange={resetToFirstPage(setSort)}
                  className="h-11 w-full appearance-none rounded-lg border border-[#E3E6EA] bg-[#FAFBFC] px-4 pl-9 text-sm text-[#4F5865] outline-none focus:border-[#123C91]"
                >
                  <option value="newest">الأحدث أولاً</option>
                  <option value="oldest">الأقدم أولاً</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#69717C]"
                />
              </label>
              <label className="relative min-w-32 flex-1 md:flex-none">
                <select
                  value={period}
                  onChange={resetToFirstPage(setPeriod)}
                  className="h-11 w-full appearance-none rounded-lg border border-[#E3E6EA] bg-[#FAFBFC] px-4 pl-9 text-sm text-[#4F5865] outline-none focus:border-[#123C91]"
                >
                  <option value="all">جميع الأوقات</option>
                  <option value="7">آخر 7 أيام</option>
                  <option value="30">آخر 30 يوماً</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#69717C]"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-2 border-t border-[#E8EAED] text-sm text-[#69717C]">
              <Loader2 size={19} className="animate-spin" />
              جاري تحميل المدفوعات...
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-180 text-right">
                  <thead className="bg-[#F8F9FA] text-xs font-medium text-[#69717C]">
                    <tr>
                      {["رقم العملية", "المشتريات", "المحاضر / الجهة", "التاريخ", "إجمالي المبلغ"].map(
                        (title) => (
                          <th key={title} className="px-5 py-4 font-medium">
                            {title}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAED]">
                    {paginatedPayments.map((payment) => (
                      <tr
                        key={payment.key}
                        className="transition-colors hover:bg-[#FAFBFC]"
                      >
                        <td className="max-w-40 truncate px-5 py-5 font-mono text-xs text-[#69717C]">
                          #{payment.reference}
                        </td>
                        <td className="px-5 py-5 text-sm font-semibold text-[#1F2937]">
                          {payment.title}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#69717C]">
                          {payment.provider}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#69717C]">
                          {formatDate(payment.date)}
                        </td>
                        <td className="px-5 py-5 text-sm text-[#4F5865]">
                          {formatMoney(payment.amount, payment.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 border-t border-[#E8EAED] bg-[#F8F9FA] p-3 md:hidden">
                {paginatedPayments.map((payment) => (
                  <MobilePaymentCard key={payment.key} payment={payment} />
                ))}
              </div>
              {visiblePayments.length === 0 && (
                <div className="border-t border-[#E8EAED] px-4 py-12 text-center text-sm text-[#69717C]">
                  {payments.length
                    ? "لا توجد عمليات دفع مطابقة لبحثك"
                    : "لا توجد عمليات دفع مكتملة حتى الآن"}
                </div>
              )}
              {visiblePayments.length > 0 && (
                <div className="flex flex-col-reverse gap-3 border-t border-[#E8EAED] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#69717C]">
                    <span>
                      عرض {firstVisibleIndex + 1}–
                      {Math.min(
                        firstVisibleIndex + itemsPerPage,
                        visiblePayments.length,
                      )}{" "}
                      من أصل {visiblePayments.length} عملية
                    </span>
                    <label className="flex items-center gap-2">
                      <span>عدد الصفوف:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(event) => {
                          setItemsPerPage(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-md border border-[#E3E6EA] bg-white px-2 text-sm text-[#4F5865] outline-none focus:border-[#123C91]"
                      >
                        {[5, 10, 20].map((count) => (
                          <option key={count} value={count}>
                            {count}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <nav
                    dir="ltr"
                    aria-label="التنقل بين الصفحات"
                    className="flex items-center gap-1"
                  >
                    <button
                      type="button"
                      aria-label="الصفحة السابقة"
                      disabled={safeCurrentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E3E6EA] text-[#4F5865] transition hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        aria-current={page === safeCurrentPage ? "page" : undefined}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium transition ${page === safeCurrentPage ? "bg-[#123C91] text-white" : "bg-[#EAF2FF] text-[#1F2937] hover:bg-[#DCE9FF]"}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      aria-label="الصفحة التالية"
                      disabled={safeCurrentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1),
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E3E6EA] text-[#4F5865] transition hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </StudentLayout>
  );
};

export default StudentPaymentsPage;
