import {
  cancelMyInstructorWithdrawal,
  createMyInstructorWithdrawal,
  getMyInstructorBalance,
  getMyInstructorWithdrawal,
  getMyInstructorWithdrawals,
} from "../../../services/APIService.js";
import { normalizeApiError } from "../../../services/apiError.js";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response ?? {};
const numericMoney = (value) => {
  if (value && typeof value === "object") {
    return numericMoney(value.amount ?? value.value ?? value.total ?? value.balance);
  }
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    if (!normalized) return null;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }
  const number = Number(value);
  return value !== undefined && value !== null && Number.isFinite(number) ? number : null;
};
const numberOf = (...values) => {
  for (const value of values) {
    const number = numericMoney(value);
    if (number !== null) return number;
  }
  return 0;
};
const currencyOf = (item, fallback = "EGP") =>
  String(item?.currency || item?.currencyCode || fallback).toUpperCase();
const request = (promise) => promise.catch((error) => {
  const normalized = normalizeApiError(error);
  const wrapped = new Error(normalized.message);
  wrapped.apiError = normalized;
  throw wrapped;
});

const normalizeBalanceItem = (item = {}, currency) => ({
  currency: currencyOf(item, currency),
  available: numberOf(item.available, item.availableAmount, item.availableBalance),
  reserved: numberOf(item.reserved, item.reservedAmount, item.reservedBalance),
  paid: numberOf(item.paid, item.paidAmount, item.totalPaid),
});

export const normalizeInstructorBalance = (response) => {
  const data = unwrap(response);
  const source = data.balances || data.balance || data.byCurrency || data.currencyBreakdown || data.currencies || data;
  if (Array.isArray(source)) return source.map((item) => normalizeBalanceItem(item));
  const summaryKeys = ["available", "availableAmount", "availableBalance", "reserved", "reservedAmount", "reservedBalance", "paid", "paidAmount", "totalPaid"];
  if (summaryKeys.some((key) => source?.[key] !== undefined)) return [normalizeBalanceItem(source)];
  if (source && typeof source === "object") {
    return Object.entries(source)
      .filter(([, value]) => value && typeof value === "object")
      .map(([currency, value]) => normalizeBalanceItem(value, currency));
  }
  return [];
};

const normalizeWithdrawal = (item = {}) => {
  const amount = item.amount && typeof item.amount === "object" ? item.amount : {};
  const status = String(item.status || "requested").toLowerCase();
  return {
    id: item._id || item.id || item.withdrawalId,
    amount: numberOf(amount.value, amount.amount, typeof item.amount !== "object" ? item.amount : undefined, item.requestedAmount),
    currency: currencyOf(item, amount.currency),
    status,
    date: item.requestedAt || item.createdAt || item.date,
    updatedAt: item.updatedAt,
    rejectionReason: item.rejectionReason || item.reason || "",
    canCancel: Boolean(item.canCancel ?? item.cancellable ?? status === "requested"),
  };
};

export const normalizeWithdrawals = (response) => {
  const data = unwrap(response);
  const items = Array.isArray(data)
    ? data
    : data.withdrawals || data.items || data.docs || data.results || [];
  const pagination = data.pagination || data.meta || {};
  const total = numberOf(pagination.total, data.total, data.totalItems, items.length);
  const page = Math.max(1, numberOf(pagination.page, data.page, 1));
  const limit = Math.max(1, numberOf(pagination.limit, pagination.pageSize, data.limit, items.length || 10));
  return {
    items: items.map(normalizeWithdrawal),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, numberOf(pagination.totalPages, data.totalPages, Math.ceil(total / limit))),
    },
  };
};

export const getInstructorBalance = () =>
  request(getMyInstructorBalance()).then(normalizeInstructorBalance);

export const createWithdrawal = (payload) =>
  request(createMyInstructorWithdrawal(payload)).then((response) => {
    const data = unwrap(response);
    return normalizeWithdrawal(data.withdrawal || data.request || data);
  });

export const getWithdrawals = (params = {}) =>
  request(getMyInstructorWithdrawals(params)).then(normalizeWithdrawals);

export const getWithdrawalById = (id) =>
  request(getMyInstructorWithdrawal(id)).then((response) => {
    const data = unwrap(response);
    return normalizeWithdrawal(data.withdrawal || data.request || data);
  });

export const cancelWithdrawal = (id) =>
  request(cancelMyInstructorWithdrawal(id)).then((response) => {
    const data = unwrap(response);
    return normalizeWithdrawal(data.withdrawal || data.request || data);
  });
