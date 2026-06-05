import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import MonthlyLineChart from "../../components/chart/MonthlyLineChart";
import CategoryPieChart from "../../components/chart/CategoryPieChart";
import { mockMonthlyReports } from "../../data/mockReports";
import { mockCurrentUser } from "../../data/mockUsers";
import { mockReceipts, mockSpendCategories } from "../../data/mockReceipts";
import { sumByCategory } from "../../utils/filterUtils";
import { formatKRW } from "../../utils/formatCurrency";
import "./FinanceReport.css";

const FinanceReport: React.FC = () => {
  const navigate = useNavigate();
  const isPro = mockCurrentUser.plan === "PRO";

  const lineData = mockMonthlyReports.map((r) => ({
    month: `${r.report_month}월`,
    amount: r.total_spend,
  }));

  const latestReport = mockMonthlyReports[mockMonthlyReports.length - 1];

  const categoryData = sumByCategory(mockReceipts.filter((r) => r.is_deleted === "N"), mockSpendCategories);

  if (!isPro) {
    return (
      <div className="finance-report finance-report--locked">
        <div className="finance-report__lock-box">
          <Lock size={48} />
          <h2>소비 리포트는 PRO 전용입니다</h2>
          <p>6개월 지출 추이, 카테고리 분석, AI 소비패턴 분석을 확인하세요.</p>
          <Button variant="primary" onClick={() => navigate("/mypage/plan")}>
            PRO로 업그레이드
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-report">
      <div className="finance-report__header">
        <h2 className="finance-report__title">소비 리포트</h2>
        <Badge variant="pro">PRO</Badge>
      </div>

      <Card>
        <h3 className="finance-report__section-title">6개월 지출 추이</h3>
        <MonthlyLineChart data={lineData} />
      </Card>

      <div className="finance-report__grid">
        <Card>
          <h3 className="finance-report__section-title">카테고리별 지출</h3>
          <CategoryPieChart data={categoryData} />
        </Card>

        <Card>
          <h3 className="finance-report__section-title">카테고리별 상세</h3>
          <div className="finance-report__category-list">
            {categoryData.sort((a, b) => b.value - a.value).map((c) => {
              const total = categoryData.reduce((s, d) => s + d.value, 0);
              const pct = total > 0 ? Math.round((c.value / total) * 100) : 0;
              return (
                <div key={c.name} className="finance-report__category-row">
                  <span className="finance-report__category-name">{c.name}</span>
                  <div className="finance-report__category-bar-wrap">
                    <div className="finance-report__category-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="finance-report__category-pct">{pct}%</span>
                  <span className="finance-report__category-amount">{formatKRW(c.value)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="finance-report__section-title">AI 소비패턴 분석</h3>
        <p className="finance-report__ai-text">{latestReport?.ai_analysis || "분석 데이터가 없습니다."}</p>
      </Card>

      <Card>
        <div className="finance-report__card-rec-header">
          <h3 className="finance-report__section-title">카드 추천</h3>
          <Badge variant="pro">PRO</Badge>
        </div>
        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
          지출 패턴을 분석하여 최적의 카드를 추천해 드립니다. (준비 중)
        </p>
      </Card>
    </div>
  );
};

export default FinanceReport;
