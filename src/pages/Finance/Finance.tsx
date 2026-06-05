import React, { useState } from "react";
import { Lock } from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import SpendBarChart from "../../components/chart/SpendBarChart";
import CategoryPieChart from "../../components/chart/CategoryPieChart";
import { mockReceipts, mockSpendCategories } from "../../data/mockReceipts";
import { mockMonthlyReports, mockDailySpends } from "../../data/mockReports";
import { mockCurrentUser } from "../../data/mockUsers";
import { sumByCategory, filterReceipts } from "../../utils/filterUtils";
import { formatKRW } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import "./Finance.css";

const Finance: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const isPro = mockCurrentUser.plan === "PRO";

  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const monthReceipts = mockReceipts.filter((r) => r.purchase_date.startsWith(monthStr) && r.is_deleted === "N");
  const totalSpend = monthReceipts.reduce((s, r) => s + r.total_amount, 0);
  const report = mockMonthlyReports.find((r) => r.report_year === selectedYear && r.report_month === selectedMonth);

  const categoryData = sumByCategory(monthReceipts, mockSpendCategories);

  const dateReceipts = selectedDate
    ? filterReceipts(monthReceipts, "", undefined, `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${selectedDate.split("-")[1]}`, `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${selectedDate.split("-")[1]}`)
    : monthReceipts;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
    setSelectedDate(undefined);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
    setSelectedDate(undefined);
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
          <p className="finance__summary-value">{monthReceipts.length}건</p>
        </Card>
        <Card>
          <p className="finance__summary-label">전월 대비</p>
          <p className="finance__summary-value" style={{ color: (report?.prev_month_diff_pct ?? 0) > 0 ? "var(--color-danger)" : "var(--color-success)" }}>
            {report?.prev_month_diff_pct != null ? `${report.prev_month_diff_pct > 0 ? "+" : ""}${report.prev_month_diff_pct}%` : "-"}
          </p>
        </Card>
      </div>

      <div className="finance__charts-grid">
        <Card className="finance__chart-card">
          <h3 className="finance__chart-title">일별 지출</h3>
          <SpendBarChart
            data={mockDailySpends}
            selectedDate={selectedDate}
            onDateClick={(date) => setSelectedDate(selectedDate === date ? undefined : date)}
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
        <h3 className="finance__chart-title">{selectedDate ? `${selectedDate} 영수증` : "이번달 영수증 목록"}</h3>
        {dateReceipts.length === 0 ? (
          <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)", padding: "16px 0" }}>해당 날짜의 영수증이 없습니다.</p>
        ) : (
          <div className="finance__receipt-list">
            {dateReceipts.map((r) => {
              const cat = mockSpendCategories.find((c) => c.spend_category_id === r.spend_category_id);
              return (
                <div key={r.receipt_id} className="finance__receipt-row">
                  <span className="finance__receipt-cat">{cat?.name}</span>
                  <span className="finance__receipt-store">{r.store_name}</span>
                  <span className="finance__receipt-date">{formatDate(r.purchase_date)}</span>
                  <span className="finance__receipt-amount">{formatKRW(r.total_amount)}</span>
                </div>
              );
            })}
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
            <div className="finance__predict">
              <span className="finance__predict-label">예상 지출</span>
              <span className="finance__predict-value">{report?.predicted_spend ? formatKRW(report.predicted_spend) : "-"}</span>
              {report?.prediction_confidence && (
                <span className="finance__predict-conf">신뢰도 {Math.round(report.prediction_confidence * 100)}%</span>
              )}
            </div>
            <p className="finance__ai-analysis">{report?.ai_analysis || "분석 데이터가 없습니다."}</p>
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
