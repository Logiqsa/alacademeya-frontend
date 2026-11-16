import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle,
  Loader2,
  ReceiptText,
  UserRound,
} from "lucide-react";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import AppSelect from "../../../components/ui/AppSelect";
import Breadcrumbs from "../../shared/Breadcrumbs";
import {
  approveSubscriptionOrder,
  getAdminSubscriptionOrder,
  getAvailableClassrooms,
  getTeachers,
} from "../../../services/APIService";
import {
  formatEgpEquivalent,
  formatMoney,
} from "../../../utils/currencyDisplay";

const dataOf = (response) => response?.data?.data ?? response?.data;
const listOf = (response) => {
  const data = dataOf(response);
  return Array.isArray(data) ? data : [];
};
const idOf = (value) =>
  typeof value === "string" ? value : value?.id || value?._id || "";
const localName = (value) =>
  typeof value === "string"
    ? value
    : value?.name?.ar ||
      value?.name?.en ||
      value?.name ||
      value?.user?.fullName ||
      value?.fullName ||
      "—";

const SubscriptionOrderReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [teachersByItem, setTeachersByItem] = useState({});
  const [classroomsByItem, setClassroomsByItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminSubscriptionOrder(id);
      const current = dataOf(response);
      setOrder(current);
      const initial = Object.fromEntries(
        (current.items || []).map((item) => [
          idOf(item),
          { teacher: "", classroom: "", type: item.type || "group" },
        ]),
      );
      setAssignments(initial);

      const teacherEntries = await Promise.all(
        (current.items || []).map(async (item) => {
          const subject = idOf(item.subject);
          const response = await getTeachers({
            subjects: subject,
            status: "approved",
            limit: 100,
          });
          return [
            idOf(item),
            listOf(response).filter((teacher) =>
              (teacher.subjects || []).some(
                (teacherSubject) => idOf(teacherSubject) === subject,
              ),
            ),
          ];
        }),
      );
      setTeachersByItem(Object.fromEntries(teacherEntries));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "تعذر تحميل تفاصيل طلب الاشتراك",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const updateAssignment = (itemId, patch) =>
    setAssignments((current) => ({
      ...current,
      [itemId]: { ...current[itemId], ...patch },
    }));

  const loadClassrooms = async (item, patch) => {
    const itemId = idOf(item);
    const next = { ...assignments[itemId], ...patch, classroom: "" };
    updateAssignment(itemId, next);
    setClassroomsByItem((current) => ({ ...current, [itemId]: [] }));
    if (!next.teacher || !next.type) return;
    try {
      const response = await getAvailableClassrooms({
        teacher: next.teacher,
        subject: idOf(item.subject),
        type: next.type,
      });
      setClassroomsByItem((current) => ({
        ...current,
        [itemId]: listOf(response),
      }));
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر تحميل الفصول المتاحة",
      );
    }
  };

  const complete = useMemo(
    () =>
      (order?.items || []).every((item) => {
        const assignment = assignments[idOf(item)];
        return assignment?.teacher && assignment?.classroom && assignment?.type;
      }),
    [assignments, order],
  );

  const approve = async () => {
    if (!complete) return toast.error("أكمل تعيينات جميع المواد أولاً");
    setApproving(true);
    try {
      const items = order.items.map((item) => ({
        orderItemId: idOf(item),
        ...assignments[idOf(item)],
      }));
      await approveSubscriptionOrder(id, items);
      toast.success("تمت الموافقة وتفعيل الاشتراك بنجاح");
      navigate("/admin/subscriptions/requests", { replace: true });
    } catch (requestError) {
      toast.error(
        requestError.response?.data?.message || "تعذر الموافقة على الطلب",
      );
    } finally {
      setApproving(false);
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div
          dir="rtl"
          className="py-24 flex justify-center gap-2 text-gray-500"
        >
          <Loader2 className="animate-spin" />
          جاري تحميل الطلب...
        </div>
      </AdminLayout>
    );
  if (error || !order)
    return (
      <AdminLayout>
        <Breadcrumbs homeTo="/admin-dashboard" />
        <div dir="rtl" className="py-24 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-2" />
          <p className="text-red-600">{error || "الطلب غير موجود"}</p>
          <button onClick={load} className="mt-3 text-[#123C91]">
            إعادة المحاولة
          </button>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <Breadcrumbs homeTo="/admin-dashboard" />
      <section dir="rtl" className="mx-auto max-w-6xl p-3 sm:p-6">
        <button
          onClick={() => navigate("/admin/subscriptions/requests")}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#475467] transition hover:text-[#123C91]"
        >
          <ArrowRight size={16} />
          العودة للطلبات
        </button>
        <div className="mb-6 rounded-2xl border border-[#DCE6F5] bg-gradient-to-l from-[#F2F6FF] to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#123C91] text-white shadow-sm">
                <BookOpenCheck size={21} />
              </span>
              <div>
                <h1 className="text-xl font-bold text-[#123C91] sm:text-2xl">
                  مراجعة طلب الاشتراك
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-[#667085]">
                  <UserRound size={15} /> الطالب: {localName(order.student)}
                </p>
              </div>
            </div>
            <div className="min-w-44 rounded-xl border border-[#D7E2F3] bg-white px-4 py-3 text-right shadow-sm sm:text-left">
              <p className="flex items-center gap-1.5 text-sm text-gray-500 sm:justify-end">
                <ReceiptText size={15} /> الإجمالي المؤكد
              </p>
              <strong className="block text-xl text-[#123C91]">
                {formatMoney(order.totalAmount, order.currency)}
              </strong>
              {formatEgpEquivalent(order.totalAmount, order) && (
                <small className="text-gray-500">
                  يعادل {formatEgpEquivalent(order.totalAmount, order)}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(order.items || []).map((item) => {
            const itemId = idOf(item);
            const assignment = assignments[itemId] || {};
            return (
              <article
                key={itemId}
                className="rounded-2xl border border-[#DCE3EE] bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF1F5] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#1D2939]">
                      {localName(item.subject) || item.subjectName}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {localName(item.package) || item.packageName} ·{" "}
                      {item.sessions} حصة
                    </p>
                  </div>
                  <strong className="rounded-xl bg-[#EEF4FF] px-3 py-2 text-[#123C91]">
                    {formatMoney(item.finalPrice, order.currency)}
                  </strong>
                </div>
                {order.discountCode && (
                  <p className="mb-4 inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-[#087F3F]">
                    كود الخصم المطبق: {order.discountCode}
                  </p>
                )}
                <p className="mb-5 rounded-xl bg-[#F8FAFC] px-4 py-3 text-sm leading-6 text-[#667085]">
                  السعر قبل الخصم:{" "}
                  {formatMoney(item.originalPrice, order.currency)}
                  {Number(item.discount) > 0 && (
                    <> · الخصم: {formatMoney(item.discount, order.currency)}</>
                  )}
                  {" · "}السعر النهائي:{" "}
                  {formatMoney(item.finalPrice, order.currency)}
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="text-sm font-semibold text-[#344054]">
                    نوع الاشتراك
                    <AppSelect
                      value={assignment.type || "group"}
                      onChange={(event) =>
                        loadClassrooms(item, { type: event.target.value })
                      }
                      className="mt-2 h-12 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 font-normal shadow-sm outline-none transition hover:border-[#98A2B3]"
                    >
                      <option value="group">مجموعة</option>
                      <option value="private">فردي</option>
                    </AppSelect>
                  </label>
                  <label className="text-sm font-semibold text-[#344054]">
                    المعلم
                    <AppSelect
                      value={assignment.teacher || ""}
                      onChange={(event) =>
                        loadClassrooms(item, { teacher: event.target.value })
                      }
                      searchable
                      searchPlaceholder="ابحث باسم المعلم..."
                      emptyMessage="لا يوجد معلمون متاحون"
                      className="mt-2 h-12 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 font-normal shadow-sm outline-none transition hover:border-[#98A2B3]"
                    >
                      <option value="">اختر المعلم</option>
                      {(teachersByItem[itemId] || []).map((teacher) => (
                        <option key={idOf(teacher)} value={idOf(teacher)}>
                          {localName(teacher)}
                        </option>
                      ))}
                    </AppSelect>
                  </label>
                  <label className="text-sm font-semibold text-[#344054]">
                    الفصل
                    <AppSelect
                      disabled={!assignment.teacher}
                      disabledMessage="اختر المعلم أولًا"
                      value={assignment.classroom || ""}
                      onChange={(event) =>
                        updateAssignment(itemId, {
                          classroom: event.target.value,
                        })
                      }
                      searchable
                      searchPlaceholder="ابحث باسم الفصل..."
                      emptyMessage="لا توجد فصول مطابقة"
                      className="mt-2 h-12 w-full rounded-xl border border-[#D0D5DD] bg-white px-3 font-normal shadow-sm outline-none transition hover:border-[#98A2B3]"
                    >
                      <option value="">اختر الفصل</option>
                      {(classroomsByItem[itemId] || []).map((classroom) => (
                        <option key={idOf(classroom)} value={idOf(classroom)}>
                          {localName(classroom)}
                        </option>
                      ))}
                    </AppSelect>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
        <button
          disabled={!complete || approving}
          onClick={approve}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#123C91] px-7 font-semibold text-white shadow-md shadow-[#123C91]/15 transition hover:bg-[#0E327B] disabled:cursor-not-allowed disabled:bg-[#8FA6D3] disabled:shadow-none sm:w-auto"
        >
          {approving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          {approving ? "جاري التفعيل..." : "الموافقة وتفعيل الاشتراك"}
        </button>
      </section>
    </AdminLayout>
  );
};

export default SubscriptionOrderReviewPage;
