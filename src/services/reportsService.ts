import { api } from "./api";

interface ApiResponse<T = null> {
  message: string;
  data: T;
}

export interface ThisMonthSummary {
  year: number;
  month: number;
  totalSpend: number;
  receiptCount: number;
}

export const reportsService = {
  async getThisMonthSummary(): Promise<ThisMonthSummary> {
    const res = await api.get<ApiResponse<ThisMonthSummary>>("/reports/this-month-summary");
    return res.data.data;
  },
};
