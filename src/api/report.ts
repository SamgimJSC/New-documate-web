import client from "./client";
import type {
  MonthlySpendResponse,
  DailySpendResponse,
  CategorySummaryResponse,
  TopStoresResponse,
  WeekdaySummaryResponse,
} from "../types/report";

export const getMonthlySpend = (year: number) =>
  client
    .get<MonthlySpendResponse>("/reports/monthly-spend", { params: { year } })
    .then((r) => r.data);

export const getDailySpend = (year: number, month: number) =>
  client
    .get<DailySpendResponse>("/reports/daily-spend", { params: { year, month } })
    .then((r) => r.data);

export const getCategorySummary = (params: {
  year?: number;
  month?: number;
  date?: string;
}) =>
  client
    .get<CategorySummaryResponse>("/reports/category-summary", { params })
    .then((r) => r.data);

export const getTopStores = (params: {
  year?: number;
  month?: number;
  limit?: number;
}) =>
  client
    .get<TopStoresResponse>("/reports/top-stores", { params })
    .then((r) => r.data);

export const getWeekdaySummary = (year?: number) =>
  client
    .get<WeekdaySummaryResponse>("/reports/weekday-summary", {
      params: { year },
    })
    .then((r) => r.data);
