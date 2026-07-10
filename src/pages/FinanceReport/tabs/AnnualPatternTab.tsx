import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Store } from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import RiskGauge from "../../../components/common/RiskGauge";
import SpendBarChart from "../../../components/chart/SpendBarChart";
import CalendarHeatmap from "../../../components/chart/CalendarHeatmap";
import SpendingRadar from "../../../components/chart/SpendingRadar";
import documateCoaching from "../../../assets/documate-coaching.png";
import {
  getMonthlySpend,
  getDailySpend,
  getTopStores,
  getCategorySummary,
  getWeekdaySummary,
} from "../../../api/report";
import type {
  MonthlySpendResponse,
  DailySpendResponse,
  TopStoresResponse,
  CategorySummaryResponse,
  WeekdaySummaryResponse,
} from "../../../types/report";
import { formatKRW } from "../../../utils/formatCurrency";

const SAVINGS_RATES = [0.15, 0.2, 0.1];

interface AnnualPatternTabProps {
  isPro: boolean;
  refreshKey: number;
}

const GHOST_BAR_HEIGHTS = [22, 30, 20, 34, 26, 40, 14, 32, 38, 30, 44, 56];

const AnnualPatternTab: React.FC<AnnualPatternTabProps> = ({
  isPro,
  refreshKey,
}) => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const [monthlyData, setMonthlyData] = useState<MonthlySpendResponse | null>(
    null,
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [dailyData, setDailyData] = useState<DailySpendResponse | null>(null);
  const [topStores, setTopStores] = useState<TopStoresResponse | null>(null);
  const [annualCategoryData, setAnnualCategoryData] =
    useState<CategorySummaryResponse | null>(null);
  const [weekdaySummary, setWeekdaySummary] =
    useState<WeekdaySummaryResponse | null>(null);

  useEffect(() => {
    if (!isPro) return;
    getMonthlySpend(year)
      .then(setMonthlyData)
      .catch(() => {});
    getTopStores({ year, limit: 5 })
      .then(setTopStores)
      .catch(() => {});
    getCategorySummary({ year })
      .then(setAnnualCategoryData)
      .catch(() => {});
    getWeekdaySummary(year)
      .then(setWeekdaySummary)
      .catch(() => {});
  }, [isPro, year, refreshKey]);

  useEffect(() => {
    if (!isPro) return;
    getDailySpend(year, selectedMonth)
      .then(setDailyData)
      .catch(() => {});
  }, [isPro, year, selectedMonth, refreshKey]);

  const barData = useMemo(
    () =>
      (monthlyData?.months ?? []).map((m) => ({
        date: `${m.month}월`,
        amount: m.totalSpend,
      })),
    [monthlyData],
  );

  const selectedBarLabel = `${selectedMonth}월`;

  const handleBarClick = (label: string) => {
    const monthNum = Number(label.replace("월", ""));
    setSelectedMonth(monthNum);
  };

  const annualSummaryText = useMemo(() => {
    const months = monthlyData?.months ?? [];
    const activeMonths = months.filter((m) => m.totalSpend > 0);

    if (activeMonths.length === 0) {
      return "올해 등록된 소비 데이터가 없습니다. 영수증을 등록하면 연간 소비 패턴을 확인할 수 있습니다.";
    }

    const total = months.reduce((sum, m) => sum + m.totalSpend, 0);
    const average = total / 12;

    const maxMonth = activeMonths.reduce((max, m) =>
      m.totalSpend > max.totalSpend ? m : max,
    );
    const minMonth = activeMonths.reduce((min, m) =>
      m.totalSpend < min.totalSpend ? m : min,
    );

    const maxDiffPct =
      average > 0 ? Math.round(((maxMonth.totalSpend - average) / average) * 100) : 0;

    const maxText = `${maxMonth.month}월 지출이 연중 가장 높았어요(월평균 대비 ${
      maxDiffPct >= 0 ? "+" : ""
    }${maxDiffPct}%).`;

    const minText =
      minMonth.month !== maxMonth.month
        ? ` ${minMonth.month}월은 가장 지출이 적었습니다.`
        : "";

    return `${maxText}${minText}`;
  }, [monthlyData]);

  const radarData = useMemo(() => {
    const categories = annualCategoryData?.categories ?? [];
    const total = annualCategoryData?.totalSpend ?? 0;
    if (total === 0) return [];

    return categories.slice(0, 6).map((c) => {
      const item = c as unknown as { categoryName?: string; name?: string };
      const pct = c.percentage ?? 0;
      return {
        category: item.categoryName ?? item.name ?? "기타",
        score: Math.max(0.5, Math.min(5, Math.round((pct / 8) * 10) / 10)),
        amount: c.totalSpend,
      };
    });
  }, [annualCategoryData]);

  const savingsSimulation = useMemo(() => {
    const categories = annualCategoryData?.categories ?? [];
    const top = categories.slice(0, 3).map((c, i) => {
      const item = c as unknown as { categoryName?: string; name?: string };
      const rate = SAVINGS_RATES[i] ?? 0.1;
      return {
        name: item.categoryName ?? item.name ?? "기타",
        rate,
        saving: Math.round(c.totalSpend * rate),
      };
    });
    const totalSaving = top.reduce((sum, t) => sum + t.saving, 0);
    return { items: top, totalSaving };
  }, [annualCategoryData]);

  const coachingInsights = useMemo(() => {
    const insights: string[] = [];
    const weekdays = weekdaySummary?.weekdays ?? [];
    if (weekdays.length >= 7) {
      const weekendTotal =
        (weekdays[0]?.totalSpend ?? 0) + (weekdays[6]?.totalSpend ?? 0);
      const weekdayTotal = weekdays
        .slice(1, 6)
        .reduce((sum, d) => sum + d.totalSpend, 0);
      const weekendAvg = weekendTotal / 2;
      const weekdayAvg = weekdayTotal / 5;

      if (weekendAvg > weekdayAvg && weekdayAvg > 0) {
        const diffPct = Math.round(
          ((weekendAvg - weekdayAvg) / weekdayAvg) * 100,
        );
        const annualSaving = Math.round((weekendAvg - weekdayAvg) * 2 * 52);
        insights.push(
          `주말 하루 평균 지출이 평일보다 ${diffPct}% 많아요. 주말 소비를 평일 수준으로 조절하면 연간 약 ${formatKRW(annualSaving)}을 아낄 수 있어요.`,
        );
      } else if (weekdayAvg > weekendAvg && weekendAvg >= 0) {
        const diffPct =
          weekendAvg > 0
            ? Math.round(((weekdayAvg - weekendAvg) / weekendAvg) * 100)
            : 100;
        insights.push(
          `평일 하루 평균 지출이 주말보다 ${diffPct}% 많아요. 식비·교통처럼 반복되는 평일 소비를 먼저 점검해보세요.`,
        );
      } else if (weekendTotal > 0 || weekdayTotal > 0) {
        insights.push(
          "평일과 주말 지출이 고르게 분포되어 있어요. 현재 소비 리듬을 유지해보세요.",
        );
      }
    }

    const topCategory = annualCategoryData?.categories?.[0];
    if (topCategory && topCategory.totalSpend > 0) {
      const category = topCategory as typeof topCategory & {
        categoryName?: string;
      };
      const categoryName = category.categoryName ?? category.name ?? "기타";
      insights.push(
        `${categoryName} 지출이 연간 소비의 ${Math.round(topCategory.percentage)}%로 가장 커요. 이 항목을 10%만 줄여도 약 ${formatKRW(Math.round(topCategory.totalSpend * 0.1))}을 절약할 수 있어요.`,
      );
    }

    const activeMonths = (monthlyData?.months ?? []).filter(
      (month) => month.totalSpend > 0,
    );
    if (activeMonths.length > 1) {
      const peakMonth = activeMonths.reduce((peak, month) =>
        month.totalSpend > peak.totalSpend ? month : peak,
      );
      const monthlyAverage =
        activeMonths.reduce((sum, month) => sum + month.totalSpend, 0) /
        activeMonths.length;
      const peakDiffPct = Math.round(
        ((peakMonth.totalSpend - monthlyAverage) / monthlyAverage) * 100,
      );
      insights.push(
        `${peakMonth.month}월 지출이 소비가 있었던 달의 평균보다 ${peakDiffPct}% 높았어요. 해당 월의 큰 지출 내역을 다시 확인해보세요.`,
      );
    }

    return insights.slice(0, 3);
  }, [annualCategoryData, monthlyData, weekdaySummary]);

  const riskInfo = useMemo(() => {
    const months = (monthlyData?.months ?? []).filter((m) => m.totalSpend > 0);
    const topCategoryPct = annualCategoryData?.categories?.[0]?.percentage ?? 0;

    if (months.length < 2) {
      return { score: 70, label: "데이터 부족", color: "#6b7280" };
    }

    const mean =
      months.reduce((sum, m) => sum + m.totalSpend, 0) / months.length;
    const variance =
      months.reduce((sum, m) => sum + (m.totalSpend - mean) ** 2, 0) /
      months.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

    const volatilityPenalty = Math.min(40, Math.round(cv * 100));
    const concentrationPenalty =
      topCategoryPct > 50 ? Math.round((topCategoryPct - 50) * 0.8) : 0;

    const score = Math.max(
      0,
      Math.min(100, 100 - volatilityPenalty - concentrationPenalty),
    );

    if (score >= 80) return { score, label: "안정", color: "#16a34a" };
    if (score >= 60) return { score, label: "양호", color: "#5b9d99" };
    if (score >= 40) return { score, label: "주의", color: "#d97706" };
    return { score, label: "위험", color: "#ef4444" };
  }, [monthlyData, annualCategoryData]);

  if (!isPro) {
    return (
      <Card className="finance-report__pro-locked">
        <div className="finance-report__pro-ghost">
          <div className="finance-report__pro-ghost-bars">
            {GHOST_BAR_HEIGHTS.map((h, i) => (
              <span key={i} style={{ height: h }} />
            ))}
          </div>
        </div>
        <div className="finance-report__pro-overlay">
          <Lock size={28} />
          <p className="finance-report__pro-overlay-title">
            연간 소비 패턴은 PRO 전용입니다
          </p>
          <p className="finance-report__pro-overlay-text">
            12개월 지출 흐름, TOP 방문 매장, 소비 캘린더를 한눈에 확인해보세요.
          </p>
          <Button variant="primary" onClick={() => navigate("/mypage/plan")}>
            PRO 업그레이드
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="finance-report__annual-grid">
        <Card>
          <div className="finance-report__section-header">
            <div>
              <h3 className="finance-report__section-title">
                {year}년 연간 소비 패턴
              </h3>
              <p className="finance-report__section-desc">
                막대를 클릭하면 그 달의 소비 캘린더를 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <SpendBarChart
            data={barData}
            selectedDate={selectedBarLabel}
            onDateClick={handleBarClick}
          />

          <p className="finance-report__ai-text" style={{ marginTop: 12 }}>
            {annualSummaryText}
          </p>
        </Card>

        <Card>
          <h3 className="finance-report__section-title">
            {year}년 {selectedMonth}월 소비 캘린더
          </h3>
          {dailyData ? (
            <CalendarHeatmap data={dailyData} />
          ) : (
            <p className="finance-report__empty-text">불러오는 중입니다...</p>
          )}
        </Card>
      </div>

      <div className="finance-report__grid">
        <Card>
          <h3 className="finance-report__section-title">소비 성향 분석</h3>
          {radarData.length === 0 ? (
            <p className="finance-report__empty-text">
              분석할 카테고리 데이터가 없습니다.
            </p>
          ) : (
            <SpendingRadar data={radarData} />
          )}
        </Card>

        <Card>
          <h3 className="finance-report__section-title">소비 위험도</h3>
          <RiskGauge
            score={riskInfo.score}
            label={riskInfo.label}
            color={riskInfo.color}
          />
        </Card>
      </div>

      <div className="finance-report__grid">
        <Card>
          <h3 className="finance-report__section-title">절약 가능 금액 (시뮬레이션)</h3>
          {savingsSimulation.items.length === 0 ? (
            <p className="finance-report__empty-text">
              시뮬레이션할 카테고리 데이터가 없습니다.
            </p>
          ) : (
            <>
              <div className="finance-report__savings-list">
                {savingsSimulation.items.map((item) => (
                  <div key={item.name} className="finance-report__savings-row">
                    <strong className="finance-report__savings-name">
                      {item.name} 소비 -{Math.round(item.rate * 100)}% 절감 시
                    </strong>
                    <span className="finance-report__savings-amount">
                      연 {formatKRW(item.saving)} 절약
                    </span>
                  </div>
                ))}
              </div>
              <div className="finance-report__savings-total">
                총 연간 절약 가능 금액
                <strong>{formatKRW(savingsSimulation.totalSaving)}</strong>
              </div>
            </>
          )}
        </Card>

        <Card>
          <h3 className="finance-report__section-title">TOP 방문 매장</h3>
          {!topStores || topStores.stores.length === 0 ? (
            <p className="finance-report__empty-text">
              올해 등록된 영수증이 없습니다.
            </p>
          ) : (
            <div className="finance-report__top-store-list">
              {topStores.stores.map((store, i) => (
                <div key={store.storeName} className="finance-report__top-store-row">
                  <span className="finance-report__top-store-rank">{i + 1}</span>
                  <span className="finance-report__top-store-icon">
                    <Store size={16} />
                  </span>
                  <strong className="finance-report__top-store-name">
                    {store.storeName}
                  </strong>
                  <span className="finance-report__top-store-visits">
                    {store.visitCount}회
                  </span>
                  <span className="finance-report__top-store-amount">
                    {formatKRW(store.totalSpend)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="finance-report__coaching-card">
        <div className="finance-report__coaching-inner">
          <div className="finance-report__coaching-body">
            <h3 className="finance-report__coaching-title">💡 AI 소비 코칭</h3>
            {coachingInsights.length > 0 ? (
              <ul className="finance-report__coaching-list">
                {coachingInsights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            ) : (
              <p className="finance-report__coaching-text">
                소비 데이터가 부족합니다. 영수증을 더 등록하면 맞춤 코칭을 받을 수 있어요.
              </p>
            )}
          </div>
          <div className="finance-report__coaching-visual" aria-hidden="true">
            <img
              src={documateCoaching}
              alt=""
              className="finance-report__coaching-mascot"
            />
          </div>
        </div>
      </Card>
    </>
  );
};

export default AnnualPatternTab;
