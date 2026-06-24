import React, { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SpendBarChart from "../../components/chart/SpendBarChart";
import CategoryPieChart from "../../components/chart/CategoryPieChart";
import { getDailySpend, getCategorySummary } from "../../api/report";
import { getReceipts } from "../../api/receipt";
import { mockCurrentUser } from "../../data/mockUsers";
import { formatKRW } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import type { DailySpendResponse } from "../../types/report";
import type { Receipt } from "../../types/receipt";
import "./Finance.css";

const Finance: React.FC = () => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const isPro = mockCurrentUser.plan === "PRO";

  const [dailyData, setDailyData] = useState<DailySpendResponse | null>(null);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    setSelectedDate(undefined);
    getDailySpend(selectedYear, selectedMonth)
      .then(setDailyData)
      .catch(() => setDailyData(null));
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const fullDate = selectedDate ? `${selectedYear}-${selectedDate}` : undefined;
    const params = fullDate
      ? { date: fullDate }
      : { year: selectedYear, month: selectedMonth };
    getCategorySummary(params)
      .then((res) => setCategoryData(res.categories.map((c) => ({
        name: (c as Record<string, unknown>).categoryName as string ?? c.name ?? "기타",
        value: c.totalSpend,
      }))))
      .catch(() => setCategoryData([]));
  }, [selectedYear, selectedMonth, selectedDate]);

  useEffect(() => {
    const fullDate = selectedDate ? `${selectedYear}-${selectedDate}` : undefined;
    const params = fullDate
      ? { date: fullDate, size: 100 as const }
      : { year: selectedYear, month: selectedMonth, size: 100 as const };
    getReceipts(params)
      .then((res) => setReceipts(res.receipts))
      .catch(() => setReceipts([]));
  }, [selectedYear, selectedMonth, selectedDate]);

  const barChartData = (dailyData?.days ?? []).map((d) => ({
    date: d.date.slice(5),
    amount: d.totalSpend,
  }));

  const totalSpend = dailyData?.totalSpend ?? 0;
  const receiptCount = dailyData?.days.reduce((s, d) => s + d.receiptCount, 0) ?? 0;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(selectedDate === date ? undefined : date);
  };

  return (
    <div className="finance">
      <div className="finance__month-nav">
        <button className="finance__month-btn" onClick={handlePrevMonth}>&lt;</button>
        <h2 className="finance__month-title">{selectedYear}년 {selectedMonth}월</h2>
        <button className="finance__month-btn" onClick={handleNextMonth}>&gt;</button>
      </div>

      <div className="finance__summary-grid">
        <Card>
          <p className="finance__summary-label">총 지출</p>
          <p className="finance__summary-value">{formatKRW(totalSpend)}</p>
        </Card>
        <Card>
          <p className="finance__summary-label">영수증</p>
          <p className="finance__summary-value">{receiptCount}건</p>
        </Card>
      </div>

      <div className="finance__charts-grid">
        <Card className="finance__chart-card">
          <h3 className="finance__chart-title">일별 지출</h3>
          <SpendBarChart
            data={barChartData}
            selectedDate={selectedDate}
            onDateClick={handleDateClick}
          />
        </Card>
        <Card className="finance__chart-card">
          <h3 className="finance__chart-title">카테고리별 지출</h3>
          {categoryData.length > 0 ? (
            <CategoryPieChart data={categoryData} />
          ) : (
            <p style={{ textAlign: "center", color: "var(--color-muted)", padding: 32 }}>데이터 없음</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="finance__chart-title">
          {selectedDate ? `${selectedDate} 영수증` : "이번달 영수증 목록"}
        </h3>
        {receipts.length === 0 ? (
          <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)", padding: "16px 0" }}>
            해당 날짜의 영수증이 없습니다.
          </p>
        ) : (
          <div className="finance__receipt-list">
            {receipts.map((r) => (
              <div key={r.receiptId} className="finance__receipt-row">
                <span className="finance__receipt-cat">{r.categoryName ?? "-"}</span>
                <span className="finance__receipt-store">{r.storeName}</span>
                <span className="finance__receipt-date">{formatDate(r.purchaseDate)}</span>
                <span className="finance__receipt-amount">{formatKRW(r.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className={!isPro ? "finance__pro-locked" : ""}>
        <div className="finance__pro-header">
          <h3 className="finance__chart-title">AI 인사이트 및 예상 지출</h3>
          {!isPro && <Badge variant="pro">PRO</Badge>}
        </div>
        {isPro ? (
          <div className="finance__pro-content">
            <p className="finance__ai-analysis">분석 데이터를 준비 중입니다.</p>
          </div>
        ) : (
          <div className="finance__pro-gate">
            <Lock size={28} />
            <p>PRO 플랜에서 이용 가능합니다</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Finance;
