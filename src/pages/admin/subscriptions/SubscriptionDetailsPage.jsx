import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, AlertCircle, Loader2, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import {
  getAllPackages,
  getPackage,
  getSubscription,
  renewSubscription,
} from "../../../services/APIService";

const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id || value._id || "";
};

const nameOf = (value) => {
  if (!value) return "--";
  if (typeof value === "string") return value;
  return (
    (typeof value.name === "string" ? value.name : value.name?.ar) ||
    value.name?.en ||
    value.fullName ||
    value.user?.fullName ||
    "--"
  );
};

const money = (value) => `${Number(value) || 0} جنيه`;

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const pricingOf = (item) => {
  const discount = Number(item.discount) || 0;
  const savedFinalPrice = Number(item.finalPrice);
  const savedPrice = Number(item.price);
  const packagePrice = Number(item.package?.price);
  const finalPrice = Number.isFinite(savedFinalPrice) ? savedFinalPrice : 0;
  const price =
    (Number.isFinite(savedPrice) && savedPrice > 0 && savedPrice) ||
    (Number.isFinite(packagePrice) && packagePrice > 0 && packagePrice) ||
    finalPrice + discount;

  return {
    price,
    discount,
    finalPrice:
      Number.isFinite(savedFinalPrice) && savedFinalPrice >= 0
        ? savedFinalPrice
        : Math.max(0, price - discount),
  };
};

const statusLabel = (status) =>
  ({ active: "نشط", expired: "منتهي", suspended: "موقوف" })[status] ||
  status ||
  "--";

const Detail = ({ label, value }) => (
  <div className="bg-[#F9FAFA] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
    <span className="text-[12px] text-[#8C9198]">{label}</span>
    <span className="text-[14px] font-medium text-[#1F2937] text-left">
      {value ?? "--"}
    </span>
  </div>
);

const RenewSubscriptionModal = ({ open, onClose, onRenew }) => {
  const [packages, setPackages] = useState([]);
  const [packageId, setPackageId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchPackages = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAllPackages();
        const list = extractList(res.data).filter((pkg) => pkg.isActive !== false);
        setPackages(list);
        setPackageId(list[0]?.id || list[0]?._id || "");
      } catch (err) {
        setError(err?.response?.data?.message || "تعذر تحميل الباقات");
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!packageId) {
      setError("اختر باقة للتجديد");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onRenew({ package: packageId });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "تعذر تجديد الاشتراك");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl" dir="rtl">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="font-['Tajawal'] font-semibold text-[17px] text-[#1F2937]">
            تجديد الاشتراك
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#6B7280] disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <label className="block font-['Tajawal'] font-medium text-[14px] text-[#1F2937] mb-2">
          الباقة الجديدة
        </label>
        <select
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          disabled={loading || saving}
          className="w-full h-11 px-4 border border-[#E5E5E5] rounded-lg bg-[#F9FAFA] text-[13px] font-['IBM_Plex_Sans_Arabic'] focus:outline-none focus:ring-2 focus:ring-[#123C91] text-right"
        >
          {loading ? (
            <option value="">جاري تحميل الباقات...</option>
          ) : (
            <>
              <option value="">اختر الباقة</option>
              {packages.map((pkg) => (
                <option key={pkg.id || pkg._id} value={pkg.id || pkg._id}>
                  {pkg.name} - {pkg.sessions} حصة - {money(pkg.price)}
                </option>
              ))}
            </>
          )}
        </select>

        <p className="text-[12px] text-[#8C9198] mt-3 leading-6">
          سيتم إنشاء اشتراك جديد بنفس المواد والفصول، وإغلاق الاشتراك الحالي.
        </p>

        {error && (
          <div className="flex items-center gap-2 mt-3 text-[13px] text-red-600">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loading}
            className="flex-1 py-3 bg-[#123C91] text-white [&_svg]:text-white rounded-xl font-medium text-[14px] hover:bg-[#0f3280] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            تجديد
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-[#123C91] font-medium text-[14px] hover:border-[#123C91] transition-colors disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const SubscriptionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [packagesById, setPackagesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRenewModal, setShowRenewModal] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      setError("");
      try {
        const subscriptionResponse = await getSubscription(id);
        const subscriptionData =
          subscriptionResponse.data?.data || subscriptionResponse.data;
        const subscriptionItems =
          subscriptionData?.items || subscriptionData?.subjectSubscriptions || [];
        const packageIds = [
          ...new Set(
            subscriptionItems
              .map((item) => idOf(item.package) || item.packageId)
              .filter(Boolean),
          ),
        ];
        const packageResponses = await Promise.allSettled(
          packageIds.map((packageId) => getPackage(packageId)),
        );
        const nextPackagesById = {};

        packageResponses.forEach((result, index) => {
          if (result.status !== "fulfilled") return;
          nextPackagesById[packageIds[index]] =
            result.value.data?.data || result.value.data;
        });

        setSubscription(subscriptionData);
        setPackagesById(nextPackagesById);
      } catch (err) {
        setError(err?.response?.data?.message || "تعذر تحميل تفاصيل الاشتراك");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id]);

  const handleRenew = async (payload) => {
    const res = await renewSubscription(id, payload);
    const renewedSubscription = res.data?.data || res.data;
    const renewedId = renewedSubscription?.id || renewedSubscription?._id;

    toast.success("تم تجديد الاشتراك بنجاح");
    if (renewedId) {
      navigate(`/admin/subscriptions/${renewedId}`);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center gap-2 py-24 text-[#8C9198]" dir="rtl">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-[14px]">جاري تحميل تفاصيل الاشتراك...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error || !subscription) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center gap-3 py-24" dir="rtl">
          <AlertCircle size={22} className="text-red-500" />
          <p className="text-[14px] text-red-600">{error || "الاشتراك غير موجود"}</p>
          <button
            onClick={() => navigate("/admin/subscription")}
            className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-[#374151] hover:bg-gray-50"
          >
            الرجوع للاشتراكات
          </button>
        </div>
      </AdminLayout>
    );
  }

  const items = subscription.items || subscription.subjectSubscriptions || [];

  return (
    <AdminLayout>
      <div dir="rtl" className="w-full max-w-full p-3 sm:p-4 md:p-6 font-['IBM_Plex_Sans_Arabic']">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-semibold text-[18px] sm:text-[20px] text-[#123C91]">
              تفاصيل الاشتراك
            </h2>
            <p className="text-[13px] text-[#8C9198] mt-1">
              الطالب: {nameOf(subscription.student)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {subscription.status === "active" && (
              <button
                type="button"
                onClick={() => setShowRenewModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#123C91] text-white [&_svg]:text-white rounded-lg text-[13px] hover:bg-[#0f3280] transition-colors"
              >
                <RefreshCw size={15} />
                تجديد الاشتراك
              </button>
            )}
            <button
              onClick={() => navigate("/admin/subscription")}
              className="flex items-center gap-2 text-[#575F69] hover:text-[#123C91] text-[13px] transition-colors"
            >
              <ArrowRight size={16} />
              الرجوع
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Detail label="اسم الطالب" value={nameOf(subscription.student)} />
            <Detail label="ولي الأمر" value={nameOf(subscription.parent)} />
            <Detail label="حالة الاشتراك" value={statusLabel(subscription.status)} />
          </div>
        </div>

        <div className="space-y-3">
          {items.length ? (
            items.map((item, index) => {
              const pricing = pricingOf(item);
              const packageId = idOf(item.package) || item.packageId;
              const packageData = packagesById[packageId];
              const packageName =
                nameOf(packageData) !== "--"
                  ? nameOf(packageData)
                  : typeof item.package === "object"
                    ? nameOf(item.package)
                    : item.packageName || "--";

              return (
              <div key={item.id || item._id || index} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
                <h3 className="font-['Tajawal'] font-semibold text-[16px] text-[#1F2937] mb-4">
                  {nameOf(item.subject)}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Detail label="المعلم" value={nameOf(item.teacher)} />
                  <Detail label="الباقة" value={packageName} />
                  <Detail label="نوع الاشتراك" value={item.type === "private" ? "فردي" : "مجموعة"} />
                  <Detail label="السعر" value={money(pricing.price)} />
                  <Detail label="الخصم" value={money(pricing.discount)} />
                  <Detail label="السعر النهائي" value={money(pricing.finalPrice)} />
                  <Detail label="الجلسات المتبقية" value={item.remainingSessions} />
                  <Detail label="إجمالي الجلسات" value={item.totalSessions} />
                </div>
              </div>
              );
            })
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl py-12 text-center text-[14px] text-[#9CA3AF]">
              لا توجد مواد في هذا الاشتراك
            </div>
          )}
        </div>
      </div>

      <RenewSubscriptionModal
        open={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        onRenew={handleRenew}
      />
    </AdminLayout>
  );
};

export default SubscriptionDetailsPage;
