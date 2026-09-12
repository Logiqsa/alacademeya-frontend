import {
  getAdminCourseEarningsCourses,
  getAdminCourseEarningsInstructors,
  getAdminCourseEarningsLedger,
  getAdminCourseEarningsSummary,
  getAdminCourseEarningsTimeline,
} from "../../../services/APIService";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? {};
const numberOf = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null);
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};
const listOf = (payload, keys) => {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
};
const currencyOf = (item, fallback = "EGP") =>
  String(item?.currency || item?.currencyCode || fallback).toUpperCase();
const entity = (value) => (value && typeof value === "object" ? value : {});
const idOf = (value, fallback = "") =>
  (typeof value === "string" ? value : value?._id || value?.id) || fallback;
const textOf = (value, fallback) => {
  if (value && typeof value === "object") return value.ar || value.en || fallback;
  return value || fallback;
};
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const isoStart = (value) => {
  if (!value) return undefined;
  const parsed = DATE_ONLY_PATTERN.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};
const isoExclusiveEnd = (value) => {
  if (!value) return undefined;
  const parsed = DATE_ONLY_PATTERN.test(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  if (DATE_ONLY_PATTERN.test(value)) parsed.setUTCDate(parsed.getUTCDate() + 1);
  return parsed.toISOString();
};
const apiParams = (params = {}) => {
  const normalized = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  );
  if (params.from) normalized.from = isoStart(params.from);
  if (params.to) normalized.to = isoExclusiveEnd(params.to);
  if (!normalized.from) delete normalized.from;
  if (!normalized.to) delete normalized.to;
  return normalized;
};
const courseOf = (item) => entity(item.course || item.courseId);
const instructorOf = (item) => entity(item.instructor || item.instructorId);
const courseNameOf = (item) => textOf(courseOf(item).title || item.courseTitle || item.courseName, "دورة غير مسماة");
const instructorNameOf = (item) => textOf(instructorOf(item).fullName || instructorOf(item).name || item.instructorName, "محاضر غير محدد");
const financials = (item) => {
  const nested = item.financials || item.amounts || item.earning || item.totals || (item.amount && typeof item.amount === "object" ? item.amount : {});
  const purchase = entity(item.purchase || item.coursePurchase || item.purchaseId);
  return {
    gross: numberOf(item.gross?.amount, item.gross?.value, item.gross, item.grossAmount, item.grossRevenue, item.totalGross, item.totalGrossAmount, item.totalCourseSales, item.totalSalesAmount, item.grossSales, item.salesAmount, item.saleAmount, item.amount?.total, item.amount?.value, typeof item.amount !== "object" ? item.amount : undefined, purchase.amount?.total, purchase.amount?.value, typeof purchase.amount !== "object" ? purchase.amount : undefined, nested.gross?.amount, nested.gross, nested.grossAmount, nested.saleAmount),
    commission: numberOf(item.commission?.amount, item.commission?.value, item.commission, item.commissionAmount, item.platformCommission, item.platformCommissionAmount, item.totalCommission, item.totalCommissionAmount, nested.commission?.amount, nested.commission, nested.commissionAmount, nested.platformCommission),
    net: numberOf(item.net?.amount, item.net?.value, item.net, item.netAmount, item.instructorNet, item.instructorNetAmount, item.instructorEarning, item.instructorEarnings, item.instructorNetEarnings, item.totalNet, item.totalNetAmount, nested.net?.amount, nested.net, nested.netAmount, nested.instructorEarning),
    currency: currencyOf(item, currencyOf(nested, item.amount?.currency || purchase.currency || purchase.amount?.currency || "EGP")),
  };
};

const normalizePagination = (data, items) => {
  const meta = data.pagination || data.meta || {};
  const total = numberOf(meta.total, data.total, data.totalItems, items.length);
  const page = Math.max(1, numberOf(meta.page, data.page, 1));
  const limit = Math.max(1, numberOf(meta.limit, meta.pageSize, data.limit, items.length || 10));
  return { page, limit, total, totalPages: Math.max(1, numberOf(meta.totalPages, data.totalPages, Math.ceil(total / limit))) };
};

export const normalizeCourseEarningsSummary = (response) => {
  const payload = unwrap(response);
  const summaryCandidate = payload.summary || payload.overview || (!Array.isArray(payload.totals) && payload.totals) || payload;
  const summary = Array.isArray(summaryCandidate) ? payload : summaryCandidate;
  const rawCurrencies =
    (Array.isArray(summaryCandidate) ? summaryCandidate : null) ||
    (Array.isArray(payload.totals) ? payload.totals : null) ||
    summary.byCurrency || summary.currencyBreakdown || summary.totalsByCurrency || summary.currencies ||
    payload.byCurrency || payload.currencyBreakdown || payload.totalsByCurrency || payload.currencies || [];
  let currencies = Array.isArray(rawCurrencies)
    ? rawCurrencies.map((item) => ({ ...financials(item), salesCount: numberOf(item.salesCount, item.sales) }))
    : Object.entries(rawCurrencies).map(([currency, item]) => ({ ...financials({ ...(typeof item === "object" ? item : { gross: item }), currency }), salesCount: numberOf(item?.salesCount, item?.sales) }));
  if (!currencies.length && [summary.gross, summary.grossAmount, summary.totalGross, summary.totalCourseSales].some((value) => value !== undefined)) {
    currencies = [{ ...financials(summary), salesCount: numberOf(summary.salesCount, summary.totalSales, summary.sales) }];
  }
  return {
    currencies,
    coursesSold: numberOf(summary.coursesSold, summary.soldCoursesCount, summary.courseCount, summary.coursesCount, summary.coursesWithSales, summary.uniqueCoursesSold, summary.totalCourses, payload.coursesSold, payload.coursesWithSales),
    instructorsWithSales: numberOf(summary.instructorsWithSales, summary.instructorCount, summary.instructorsCount, summary.sellingInstructors, summary.uniqueInstructorsWithSales, summary.totalInstructors, payload.instructorsWithSales, payload.sellingInstructors),
    salesCount: numberOf(summary.salesCount, summary.totalSales, summary.sales, summary.totalSalesCount, payload.salesCount, payload.totalSales),
  };
};

const normalizeCourse = (item, index) => ({
  id: idOf(item.course || item.courseId, item.courseId || `course-${index}`),
  course: courseNameOf(item), instructorId: idOf(item.instructor || item.instructorId), instructorSlug: instructorOf(item).profileSlug || instructorOf(item).slug || item.instructorSlug || "",
  instructor: instructorNameOf(item), salesCount: numberOf(item.salesCount, item.totalSales, item.sales),
  ...financials(item),
});
const normalizeInstructor = (item, index) => ({
  id: idOf(item.instructor || item.instructorId, item.instructorId || `instructor-${index}`),
  instructor: instructorNameOf(item), instructorSlug: instructorOf(item).profileSlug || instructorOf(item).slug || item.instructorSlug || item.profileSlug || "", coursesSold: numberOf(item.coursesSold, item.courseCount, item.coursesCount, item.distinctCourses, item.soldCoursesCount),
  salesCount: numberOf(item.salesCount, item.totalSales, item.sales), ...financials(item),
});

export const getCourseEarningsSummary = (params = {}) =>
  getAdminCourseEarningsSummary(apiParams(params)).then(normalizeCourseEarningsSummary);
export const getCourseEarningsByCourse = (params = {}) =>
  getAdminCourseEarningsCourses(apiParams(params)).then((response) => {
    const data = unwrap(response); return listOf(data, ["courses", "items", "results", "rows"]).map(normalizeCourse);
  });
export const getCourseEarningsByInstructor = (params = {}) =>
  getAdminCourseEarningsInstructors(apiParams(params)).then((response) => {
    const data = unwrap(response); return listOf(data, ["instructors", "items", "results", "rows"]).map(normalizeInstructor);
  });
export const getCourseEarningsTimeline = (params = {}) =>
  getAdminCourseEarningsTimeline(apiParams(params)).then((response) => {
    const data = unwrap(response);
    const direct = listOf(data, ["timeline", "points", "items", "results", "buckets"]);
    const groupedTimeline = data.timeline && !Array.isArray(data.timeline) ? data.timeline : null;
    const groupedPoints = groupedTimeline
      ? Object.entries(groupedTimeline).flatMap(([currency, points]) => (Array.isArray(points) ? points : points?.items || points?.points || []).map((point) => ({ ...point, currency: point.currency || currency })))
      : [];
    const seriesPoints = (Array.isArray(data.series) ? data.series : []).flatMap((series) =>
      (series.data || series.points || series.items || []).map((point) => ({ ...point, currency: point.currency || series.currency || series.name })),
    );
    return [...direct, ...groupedPoints, ...seriesPoints].flatMap((item, index) => {
      const pointDate = item.date || item.period || item.day || item.month || item.label;
      const breakdown = item.byCurrency || item.currencyBreakdown || item.currencies || item.totalsByCurrency;
      if (Array.isArray(breakdown)) return breakdown.map((values) => ({ id: `${pointDate || index}-${currencyOf(values)}`, date: pointDate, ...financials(values) }));
      if (breakdown && typeof breakdown === "object") return Object.entries(breakdown).map(([currency, values]) => ({ id: `${pointDate || index}-${currency}`, date: pointDate, ...financials({ ...(typeof values === "object" ? values : { gross: values }), currency }) }));
      return [{ id: item.id || `${pointDate || index}-${currencyOf(item)}`, date: pointDate, ...financials(item) }];
    });
  });
export const getCourseEarningsLedger = (params = {}) =>
  getAdminCourseEarningsLedger(apiParams(params)).then((response) => {
    const data = unwrap(response); const raw = listOf(data, ["earnings", "ledger", "items", "results", "rows", "docs"]);
    const items = raw.map((item, index) => {
      const purchase = entity(item.purchase || item.coursePurchase || item.purchaseId);
      const buyer = entity(item.buyer || item.buyerId || item.student || item.studentId || item.user || item.userId || purchase.buyer || purchase.user || purchase.student);
      return { id: item._id || item.id || item.earningId || `earning-${index}`, courseId: idOf(item.course || item.courseId || purchase.course), course: courseNameOf({ ...purchase, ...item }), instructorId: idOf(item.instructor || item.instructorId), instructorSlug: instructorOf(item).profileSlug || instructorOf(item).slug || item.instructorSlug || "", instructor: instructorNameOf(item), buyer: textOf(buyer.fullName || buyer.name || buyer.email || item.buyerName || item.studentName || purchase.buyerName, "—"), date: item.date || item.earnedAt || item.soldAt || item.paidAt || purchase.paidAt || item.createdAt, ...financials(item) };
    });
    return { items, pagination: normalizePagination(data, items) };
  });
