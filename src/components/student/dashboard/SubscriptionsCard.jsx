import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getMySubscriptions } from "../../../services/APIService"; // عدّل المسار حسب مكانه عندك

const resolveName = (val) =>
  typeof val === "string" ? val : val?.ar || val?.en || "";

const numberOrZero = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const buildGroupsFromSubscriptions = (subscriptions = []) =>
  subscriptions.map((subscription) => {
    const items = subscription.items ?? subscription.subjectSubscriptions ?? [];
    const summary = subscription.summary ?? {};
    const subjects = items
      .map((item) => resolveName(item.subject?.name))
      .filter(Boolean);
    const itemsTotal = items.reduce(
      (sum, item) =>
        sum + numberOrZero(item.totalSessions ?? item.package?.sessions),
      0,
    );
    const itemsRemaining = items.reduce(
      (sum, item) => sum + numberOrZero(item.remainingSessions),
      0,
    );
    const itemsDone = items.reduce((sum, item) => {
      if (item.usedSessions != null)
        return sum + numberOrZero(item.usedSessions);
      if (item.consumedSessions != null)
        return sum + numberOrZero(item.consumedSessions);
      const itemTotal = numberOrZero(
        item.totalSessions ?? item.package?.sessions,
      );
      const itemRemaining = numberOrZero(item.remainingSessions);
      return sum + Math.max(itemTotal - itemRemaining, 0);
    }, 0);
    const total = numberOrZero(summary.totalSessions) || itemsTotal;
    const remaining =
      summary.remainingSessions != null
        ? numberOrZero(summary.remainingSessions)
        : itemsRemaining;
    const done =
      summary.usedSessions != null
        ? numberOrZero(summary.usedSessions)
        : summary.completedSessions != null
          ? numberOrZero(summary.completedSessions)
          : itemsDone;

    return {
      id: subscription.id ?? subscription._id,
      name: subjects.length > 0 ? subjects.join("، ") : "اشتراكك الحالي",
      done,
      total,
      remaining,
    };
  });

const SubscriptionsCard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubscriptionIndex, setActiveSubscriptionIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const { data } = await getMySubscriptions();

        const raw = data?.data ?? data;
        const subscriptions = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.subscriptions)
            ? raw.subscriptions
            : raw
              ? [raw]
              : [];

        if (!cancelled) setItems(subscriptions);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSubscriptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = buildGroupsFromSubscriptions(items);
  const activeIndex =
    groups.length > 0
      ? Math.min(activeSubscriptionIndex, groups.length - 1)
      : 0;
  const activeGroup = groups[activeIndex] ?? groups[0];
  const visibleGroups = activeGroup ? [activeGroup] : [];
  const totalLessons = activeGroup?.total ?? 0;
  const completedLessons = activeGroup?.done ?? 0;
  const explicitRemainingLessons = activeGroup?.remaining ?? 0;
  const remainingLessons =
    explicitRemainingLessons > 0
      ? explicitRemainingLessons
      : Math.max(totalLessons - completedLessons, 0);

  const miniStats = [
    { label: "حصص متبقية", value: remainingLessons },
    { label: "حصص مكتملة", value: completedLessons },
    { label: "إجمالي الحصص", value: totalLessons },
  ];

  return (
    <div
      dir="rtl"
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-4 sm:p-5 h-full"
    >
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3
          className="text-[#1F2937] font-semibold text-[15px] sm:text-[16px]"
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        >
          الاشتراكات
        </h3>

        <select
          className="
            text-[11px] sm:text-[12px] text-[#6B7280]
            border border-[#E5E7EB] rounded-lg
            px-2 py-1 outline-none cursor-pointer
            max-w-[120px] sm:max-w-none
          "
          style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
          defaultValue="month"
        >
          <option value="month">الشهر الحالي</option>
          <option value="lastMonth">الشهر الماضي</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-[#9CA3AF] gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-[13px]">جاري التحميل...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 text-[#E54848] text-[13px]">
          حدث خطأ أثناء تحميل الاشتراكات
        </div>
      )}

      {!loading && !error && groups.length === 0 && (
        <div className="text-center py-8 text-[#9CA3AF] text-[13px]">
          لا توجد اشتراكات حالياً
        </div>
      )}

      {!loading && !error && groups.length > 0 && (
        <>
          {groups.length > 1 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              {groups.map((group, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={group.id ?? index}
                    type="button"
                    onClick={() => setActiveSubscriptionIndex(index)}
                    aria-label={`عرض الاشتراك رقم ${index + 1}`}
                    aria-pressed={isActive}
                    className={[
                      "w-8 h-8 rounded-full text-[13px] font-semibold",
                      "border transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-[#12C6B0]/30",
                      isActive
                        ? "bg-[#12C6B0] border-[#12C6B0] text-white"
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#12C6B0] hover:text-[#12C6B0]",
                    ].join(" ")}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          )}

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {miniStats.map((s) => (
              <div
                key={s.label}
                className="bg-[#F9FAFB] rounded-lg py-2.5 sm:py-3 px-1.5 sm:px-2 text-center min-w-0"
              >
                <p className="text-[#1F2937] font-bold text-[16px] sm:text-[18px]">
                  {s.value}
                </p>
                <p
                  className="text-[#6B7280] text-[10px] sm:text-[11px] mt-1 leading-tight"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Progress list */}
          <div className="flex flex-col gap-3.5 sm:gap-4">
            {visibleGroups.map((g) => {
              const percent =
                g.total > 0
                  ? Math.min(100, Math.round((g.done / g.total) * 100))
                  : 0;
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-[#9CA3AF] text-[11px] sm:text-[12px] shrink-0">
                      {g.done}/{g.total}
                    </span>
                    <span
                      className="text-[#1F2937] text-[12.5px] sm:text-[13px] font-medium truncate"
                      style={{
                        fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      }}
                    >
                      {g.name}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#12C6B0] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionsCard;
