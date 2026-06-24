import client from "./client";
import type {
  MonthlySpendResponse,
  DailySpendResponse,
  CategorySummaryResponse,
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
