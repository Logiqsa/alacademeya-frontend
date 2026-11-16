import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  Eye,
  Inbox,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import EntityProfileModal from "../../../components/admin/users/EntityProfileModal";
import ConfirmDialog from "../../../components/admin/supervisors/Confirmdialog";
import {
  getPendingSubscriptionOrders,
  rejectSubscriptionOrder,
} from "../../../services/APIService";
import {
  formatEgpEquivalent,
  formatMoney,
} from "../../../utils/currencyDisplay";

const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("ar-EG", { dateStyle: "medium" })
    : "—";
const name = (value) => value?.user?.fullName || value?.fullName || "—";

const SubscriptionRequestsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStudent, setProfileStudent] = useState(null);
  const [rejectingId, setRejectingId] = useState("");
  const [orderToReject, setOrderToReject] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingSubscriptionOrders({ page, limit: 10 });
      setOrders(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر تحميل طلبات الاشتراك المدفوعة",
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const totalPages = pagination?.totalPages || pagination?.pages || 1;

  const rejectOrder = async (order) => {
    const orderId = order.id || order._id;
    setRejectingId(orderId);
    try {
      await rejectSubscriptionOrder(orderId, "تم تجاهل الطلب بواسطة الإدارة");
      setOrders((current) =>
        current.filter((item) => (item.id || item._id) !== orderId),
      );
      setPagination((current) =>
        current?.total
          ? { ...current, total: Math.max(0, current.total - 1) }
          : current,
      );
      toast.success("تم تجاهل الطلب");
      setOrderToReject(null);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "تعذر تجاهل الطلب");
    } finally {
      setRejectingId("");
    }
  };

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <section dir="rtl" className="mx-auto max-w-7xl p-3 sm:p-6">
        <div className="mb-6 rounded-2xl border border-[#DCE6F5] bg-gradient-to-l from-[#F2F6FF] to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#123C91] text-white shadow-sm">
                <Clock3 size={21} />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-[#123C91]">
                  طلبات الاشتراك المدفوعة
                </h1>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  راجع الطلبات التي أكد Whop دفعها وعيّن المدرس والفصل لكل مادة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                {pagination?.total ?? orders.length} طلب معلق
              </span>
              <button
                onClick={load}
                disabled={loading}
                className="flex size-10 items-center justify-center rounded-xl border border-[#D7E2F3] bg-white text-[#123C91] shadow-sm hover:bg-[#F4F7FC] disabled:opacity-50"
                aria-label="تحديث"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/subscription/orders")}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#475467] hover:text-[#123C91]"
          >
            <ArrowRight size={16} /> العودة للاشتراكات
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center gap-2 text-gray-400">
            <Loader2 className="animate-spin" size={19} />
            جاري التحميل...
          </div>
        ) : error ? (
          <div className="py-16 bg-white border rounded-2xl text-center">
            <AlertCircle className="mx-auto text-red-500 mb-2" />
            <p className="text-red-600">{error}</p>
            <button onClick={load} className="mt-3 text-[#123C91]">
              إعادة المحاولة
            </button>
          </div>
        ) : !orders.length ? (
          <div className="py-16 bg-white border rounded-2xl text-center text-gray-400">
            <Inbox className="mx-auto mb-2" />
            <p>لا توجد طلبات مدفوعة بانتظار المراجعة</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-[#DCE3EE] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] table-fixed text-right">
                  <thead className="border-b border-[#E5EAF2] bg-[#F7F9FC] text-xs font-semibold text-[#667085]">
                    <tr>
                      <th className="w-[19%] px-5 py-4">الطالب</th>
                      <th className="w-[29%] px-5 py-4">المواد</th>
                      <th className="w-[13%] px-4 py-4">الإجمالي</th>
                      <th className="w-[12%] px-4 py-4">تاريخ الدفع</th>
                      <th className="w-[12%] px-4 py-4">الحالة</th>
                      <th className="w-[11%] px-4 py-4 text-center">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EDF4]">
                    {orders.map((order) => (
                      <tr
                        key={order.id || order._id}
                        className="transition odd:bg-white even:bg-[#FBFCFE] hover:bg-[#F5F8FD]"
                      >
                        <td className="px-5 py-5 align-top font-medium">
                          <button
                            type="button"
                            onClick={() => setProfileStudent(order.student)}
                            className="block w-full text-right font-semibold leading-6 text-[#123C91] hover:underline"
                          >
                            {name(order.student)}
                          </button>
                        </td>
                        <td className="px-5 py-5 align-top text-sm leading-6 text-[#475467]">
                          {(order.items || [])
                            .map(
                              (item) =>
                                item.subject?.name?.ar ||
                                item.subject?.name?.en ||
                                item.subjectName ||
                                "مادة",
                            )
                            .join("، ")}
                        </td>
                        <td className="px-4 py-5 align-top font-semibold text-[#123C91]">
                          <span className="block">
                            {formatMoney(order.totalAmount, order.currency)}
                          </span>
                          {formatEgpEquivalent(order.totalAmount, order) && (
                            <small className="block font-normal text-gray-500">
                              يعادل{" "}
                              {formatEgpEquivalent(order.totalAmount, order)}
                            </small>
                          )}
                        </td>
                        <td className="px-4 py-5 align-top text-sm text-[#667085]">
                          {date(order.paidAt)}
                        </td>
                        <td className="px-4 py-5 align-top">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            بانتظار الإدارة
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/subscription-orders/${order.id || order._id}`,
                                )
                              }
                              className="inline-flex size-10 items-center justify-center rounded-xl bg-[#123C91] text-white shadow-sm transition hover:bg-[#0E327B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123C91]"
                              title="مراجعة الطلب وتعيينه"
                              aria-label="مراجعة الطلب وتعيينه"
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderToReject(order)}
                              disabled={Boolean(rejectingId)}
                              className="inline-flex size-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              title="تجاهل الطلب"
                              aria-label="تجاهل الطلب"
                            >
                              {rejectingId === (order.id || order._id) ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-5">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40"
                >
                  السابق
                </button>
                <span className="text-sm">
                  صفحة {page} من {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <EntityProfileModal
        entity={profileStudent}
        role="student"
        onClose={() => setProfileStudent(null)}
      />
      <ConfirmDialog
        open={Boolean(orderToReject)}
        title="تجاهل طلب الاشتراك"
        message="سيُزال الطلب من قائمة الانتظار مع الاحتفاظ بسجل الدفع للمراجعة المالية. هل تريد المتابعة؟"
        confirmLabel="تجاهل الطلب"
        danger
        loading={Boolean(rejectingId)}
        onConfirm={() => orderToReject && rejectOrder(orderToReject)}
        onClose={() => !rejectingId && setOrderToReject(null)}
      />
    </AdminLayout>
  );
};

export default SubscriptionRequestsPage;
