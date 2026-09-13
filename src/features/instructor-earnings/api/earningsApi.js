import {
  getMyInstructorEarnings,
  getMyInstructorEarningsCourses,
  getMyInstructorEarningsSummary,
  getMyInstructorEarningsTimeline,
} from "../../../services/APIService.js";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? {};
const numberOf = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null);
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};
const currencyOf = (source, fallback = "EGP") =>
  String(source?.currency || source?.currencyCode || fallback).toUpperCase();
const idOf = (source, fallback = "") =>
  (typeof source === "string" ? source : source?._id || source?.id || source?.courseId?._id || source?.courseId?.id) || fallback;
const courseNameOf = (source) => {
  const course = source?.course || source?.courseId;
  const title = course?.title || source?.courseTitle || source?.title || source?.name;
  if (typeof title === "object") return title.ar || title.en || "دورة غير مسماة";
  return title || "دورة غير مسماة";
};
const listOf = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};
const entity = (value) => (value && typeof value === "object" ? value : {});
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const apiParams = (params = {}) => {
  const normalized = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null));
  if (params.from) {
    const from = new Date(DATE_ONLY_PATTERN.test(params.from) ? `${params.from}T00:00:00.000Z` : params.from);
    if (!Number.isNaN(from.getTime())) normalized.from = from.toISOString(); else delete normalized.from;
  }
  if (params.to) {
    const dateOnly = DATE_ONLY_PATTERN.test(params.to);
    const to = new Date(dateOnly ? `${params.to}T00:00:00.000Z` : params.to);
    if (!Number.isNaN(to.getTime())) {
      if (dateOnly) to.setUTCDate(to.getUTCDate() + 1);
      normalized.to = to.toISOString();
    } else delete normalized.to;
  }
  return normalized;
};
const financials = (item = {}) => {
  const nested = item.financials || item.amounts || item.earning || item.totals || (item.amount && typeof item.amount === "object" ? item.amount : {});
  const purchase = entity(item.purchase || item.coursePurchase || item.purchaseId);
  return {
    gross: numberOf(item.gross?.amount, item.gross?.value, item.gross, item.grossAmount, item.totalGross, item.totalGrossAmount, item.saleAmount, item.salesAmount, item.amount?.total, item.amount?.value, typeof item.amount !== "object" ? item.amount : undefined, purchase.amount?.total, purchase.amount?.value, typeof purchase.amount !== "object" ? purchase.amount : undefined, nested.gross?.amount, nested.gross, nested.grossAmount),
    commission: numberOf(item.commission?.amount, item.commission?.value, item.commission, item.commissionAmount, item.platformCommission, item.platformCommissionAmount, item.totalCommission, item.totalCommissionAmount, nested.commission?.amount, nested.commission, nested.commissionAmount),
    net: numberOf(item.net?.amount, item.net?.value, item.net, item.netAmount, item.instructorNet, item.instructorNetAmount, item.instructorEarning, item.instructorEarnings, item.earnings, item.netEarning, item.netEarnings, item.totalEarnings, item.totalNet, item.totalNetAmount, nested.net?.amount, nested.net, nested.netAmount, nested.instructorEarning, nested.earnings),
    currency: currencyOf(item, currencyOf(nested, item.amount?.currency || purchase.currency || purchase.amount?.currency || "EGP")),
  };
};

const timelineAmount = (point = {}) =>
  numberOf(
    point.net?.amount, point.net?.value, point.net, point.netAmount,
    point.instructorEarning, point.instructorEarnings, point.earnings,
    point.netEarning, point.netEarnings, point.totalEarnings, point.totalNet,
    point.amount?.amount, point.amount?.value,
    typeof point.amount !== "object" ? point.amount : undefined,
    point.value, point.total,
  );

const normalizeBreakdown = (value, fallbackCurrency, fallbackAmount) => {
  if (Array.isArray(value)) {
    return value.map((item) => ({ currency: financials(item).currency, amount: financials(item).net }));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([currency, amount]) => ({
      currency: String(currency).toUpperCase(),
      amount: financials({ ...(typeof amount === "object" ? amount : { net: amount }), currency }).net,
    }));
  }
  return fallbackAmount === undefined
    ? []
    : [{ currency: fallbackCurrency, amount: numberOf(fallbackAmount) }];
};

export const normalizeEarningsSummary = (response) => {
  const payload = unwrap(response);
  const candidate = payload.summary || payload.overview || (!Array.isArray(payload.totals) && payload.totals) || payload;
  const data = Array.isArray(candidate) ? payload : candidate;
  const total = data.totalEarnings ?? data.netEarnings ?? data.totalNet ?? data.net;
  const currency = currencyOf(data, currencyOf(payload));
  const breakdown =
    (Array.isArray(candidate) ? candidate : null) ||
    (Array.isArray(payload.totals) ? payload.totals : null) ||
    data.currencyBreakdown || data.byCurrency || data.totalsByCurrency || data.currencies || payload.currencyBreakdown || payload.byCurrency || payload.totalsByCurrency || payload.currencies;
  return {
    salesCount: numberOf(data.salesCount, data.totalSales, data.totalSalesCount, data.sales, payload.salesCount),
    coursesSold: numberOf(data.coursesSold, data.soldCoursesCount, data.courseCount, data.coursesCount, data.coursesWithSales, payload.coursesSold),
    currencies: normalizeBreakdown(breakdown, currency, total),
  };
};

const normalizeHistoryItem = (item, index) => {
  const purchase = entity(item.purchase || item.coursePurchase || item.purchaseId);
  const source = { ...purchase, ...item };
  return {
    id: item._id || item.id || item.earningId || `${item.createdAt || item.date || "earning"}-${index}`,
    courseId: idOf(item.course || item.courseId || purchase.course || purchase.courseId),
    course: courseNameOf(source),
    date: item.date || item.earnedAt || item.soldAt || item.paidAt || purchase.paidAt || item.createdAt,
    ...financials(item),
  };
};

export const normalizeEarningsHistory = (response) => {
  const data = unwrap(response);
  const items = listOf(data, ["earnings", "transactions", "items", "docs", "results", "rows"]);
  const pagination = data.pagination || data.meta || {};
  const total = numberOf(pagination.total, data.total, data.totalItems, items.length);
  const page = Math.max(1, numberOf(pagination.page, data.page, 1));
  const limit = Math.max(1, numberOf(pagination.limit, pagination.pageSize, data.limit, items.length || 10));
  return {
    items: items.map(normalizeHistoryItem),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, numberOf(pagination.totalPages, data.totalPages, Math.ceil(total / limit))),
    },
  };
};

export const normalizeEarningsCourses = (response) => {
  const data = unwrap(response);
  return listOf(data, ["courses", "items", "results", "analytics", "rows"]).map((item, index) => ({
    id: idOf(item, `course-${index}`),
    title: courseNameOf(item),
    salesCount: numberOf(item.salesCount, item.totalSales, item.sales, item.ordersCount),
    ...financials(item),
  }));
};

export const normalizeEarningsTimeline = (response) => {
  const data = unwrap(response);
  const direct = listOf(data, ["timeline", "points", "items", "results", "buckets"]);
  const grouped = data.timeline && !Array.isArray(data.timeline)
    ? Object.entries(data.timeline).flatMap(([currency, points]) => (Array.isArray(points) ? points : points?.items || points?.points || []).map((point) => ({ ...point, currency: point.currency || currency })))
    : [];
  const series = (Array.isArray(data.series) ? data.series : []).flatMap((item) => (item.data || item.points || item.items || []).map((point) => ({ ...point, currency: point.currency || item.currency || item.name })));
  return [...direct, ...grouped, ...series].flatMap((item, index) => {
    const pointDate = item.date || item.period || item.day || item.month || item.label;
    const breakdown = item.byCurrency || item.currencyBreakdown || item.currencies || item.totalsByCurrency;
    const normalizePoint = (point) => ({ id: point.id || `${pointDate || index}-${currencyOf(point)}`, date: point.date || point.period || point.day || point.month || point.label || pointDate, amount: timelineAmount(point), currency: financials(point).currency });
    if (Array.isArray(breakdown)) return breakdown.map(normalizePoint);
    if (breakdown && typeof breakdown === "object") return Object.entries(breakdown).map(([currency, values]) => normalizePoint({ ...(typeof values === "object" ? values : { net: values }), currency }));
    return [normalizePoint(item)];
  });
};

export const getEarningsSummary = (params = {}) =>
  getMyInstructorEarningsSummary(apiParams(params)).then(normalizeEarningsSummary);

export const getEarningsHistory = (params = {}) =>
  getMyInstructorEarnings(apiParams(params)).then(normalizeEarningsHistory);

export const getEarningsCourses = (params = {}) =>
  getMyInstructorEarningsCourses(apiParams(params)).then(normalizeEarningsCourses);

export const getEarningsTimeline = (params = {}) =>
  getMyInstructorEarningsTimeline(apiParams(params)).then(normalizeEarningsTimeline);
