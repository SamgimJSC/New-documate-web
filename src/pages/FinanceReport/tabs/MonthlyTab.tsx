import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Wallet, ReceiptText, Sparkles } from "lucide-react";
import Card from "../../../components/common/Card";
import MonthlyLineChart from "../../../components/chart/MonthlyLineChart";
import CategoryPieChart, {
  getCategoryColor,
} from "../../../components/chart/CategoryPieChart";
import { getReceipts } from "../../../api/receipt";
import {
  getMonthlySpend,
  getDailySpend,
  getCategorySummary,
} from "../../../api/report";
import type {
  MonthlySpendResponse,
  DailySpendResponse,
  CategorySummaryResponse,
} from "../../../types/report";
import { formatDate } from "../../../utils/formatDate";
import { formatKRW } from "../../../utils/formatCurrency";
import type { Receipt } from "../../../types/receipt";

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getPreviousMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return getMonthKey(date);
};

const getNextMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1, 1);
  date.setMonth(date.getMonth() + 1);
  return getMonthKey(date);
};

const getMonthLabel = (month: string) => {
  const [year, monthNumber] = month.split("-");
  return `${year}년 ${Number(monthNumber)}월`;
};

interface MonthlyTabProps {
  refreshKey: number;
}

const MonthlyTab: React.FC<MonthlyTabProps> = ({ refreshKey }) => {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [monthlyData, setMonthlyData] = useState<MonthlySpendResponse | null>(
    null,
  );
  const [dailyData, setDailyData] = useState<DailySpendResponse | null>(null);
  const [categorySummary, setCategorySummary] =
    useState<CategorySummaryResponse | null>(null);
  const [monthReceipts, setMonthReceipts] = useState<Receipt[]>([]);

  const [year, monthNum] = selectedMonth.split("-").map(Number);

  useEffect(() => {
    getMonthlySpend(year)
      .then(setMonthlyData)
      .catch(() => {});
  }, [year, refreshKey]);

  useEffect(() => {
    getDailySpend(year, monthNum)
      .then(setDailyData)
      .catch(() => {});
  }, [year, monthNum, refreshKey]);

  useEffect(() => {
    if (selectedDate) {
      getCategorySummary({ date: selectedDate })
        .then(setCategorySummary)
        .catch(() => {});
    } else {
      getCategorySummary({ year, month: monthNum })
        .then(setCategorySummary)
        .catch(() => {});
    }
  }, [year, monthNum, selectedDate, refreshKey]);

  useEffect(() => {
    getReceipts({ year, month: monthNum, size: 100 })
      .then((res) => setMonthReceipts(res.receipts))
      .catch(() => {});
  }, [year, monthNum, refreshKey]);

  const monthTotalSpend = dailyData?.totalSpend ?? 0;
  const totalSpend = categorySummary?.totalSpend ?? 0;

  const prevMonthNum = monthNum === 1 ? 12 : monthNum - 1;
  const prevYear = monthNum === 1 ? year - 1 : year;

  const previousMonthSpend = useMemo(() => {
    if (!monthlyData || prevYear !== year) return 0;
    return (
      monthlyData.months.find((m) => m.month === prevMonthNum)?.totalSpend ?? 0
    );
  }, [monthlyData, prevMonthNum, prevYear, year]);

  const previousMonthReceiptCount = useMemo(() => {
    if (!monthlyData || prevYear !== year) return 0;
    return (
      monthlyData.months.find((m) => m.month === prevMonthNum)?.receiptCount ??
      0
    );
  }, [monthlyData, prevMonthNum, prevYear, year]);

  const monthChangeRate =
    previousMonthSpend > 0
      ? ((monthTotalSpend - previousMonthSpend) / previousMonthSpend) * 100
      : monthTotalSpend > 0
        ? 100
        : 0;

  const lineData = useMemo(
    () =>
      (dailyData?.days ?? []).map((d) => ({
        month: `${d.day}일`,
        amount: d.totalSpend,
        date: d.date,
      })),
    [dailyData],
  );

  const categoryData = useMemo(
    () =>
      (categorySummary?.categories ?? []).map((category) => {
        const item = category as unknown as {
          categoryName?: string;
          name?: string;
          totalSpend?: number | string;
        };

        return {
          name: item.categoryName ?? item.name ?? "기타",
          value: Number(item.totalSpend ?? 0),
        };
      }),
    [categorySummary],
  );
  const sortedCategoryData = useMemo(
    () => [...categoryData].sort((a, b) => b.value - a.value),
    [categoryData],
  );

  const categoryTotal = categorySummary?.totalSpend ?? 0;
  const topCategory = sortedCategoryData[0];

  const periodReceiptCount =
    categorySummary?.categories.reduce((sum, c) => sum + c.receiptCount, 0) ??
    0;

  const daysInMonth = dailyData?.days.length ?? 30;

  const lastReceiptDay = useMemo(() => {
    const days = dailyData?.days ?? [];
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].totalSpend > 0) return days[i].day;
    }
    return 1;
  }, [dailyData]);

  const expectedMonthlySpend =
    monthTotalSpend > 0
      ? Math.round((monthTotalSpend / lastReceiptDay) * daysInMonth)
      : 0;

  const monthReceiptCount =
    dailyData?.days.reduce((sum, d) => sum + d.receiptCount, 0) ?? 0;
  const predictionConfidence =
    monthReceiptCount >= 10 ? 82 : monthReceiptCount >= 5 ? 78 : 65;

  const recentReceipts = useMemo(() => {
    const filtered = selectedDate
      ? monthReceipts.filter((r) => r.purchaseDate === selectedDate)
      : monthReceipts;
    return [...filtered]
      .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))
      .slice(0, 5);
  }, [monthReceipts, selectedDate]);

  const reportKey = selectedDate || selectedMonth;

  const aiAnalysisText = useMemo(() => {
    if (!categorySummary || categorySummary.categories.length === 0) {
      return selectedDate
        ? "선택한 날짜에는 소비 데이터가 없습니다. 다른 날짜를 선택하거나 월 전체 보기로 돌아가 소비패턴을 확인해보세요."
        : "선택한 기준에 해당하는 소비 데이터가 없습니다. 영수증을 등록하면 AI 소비패턴 분석을 확인할 수 있습니다.";
    }

    const compareText = selectedDate
      ? `${formatDate(selectedDate)}에는 총 ${formatKRW(totalSpend)}를 지출했습니다.`
      : monthChangeRate >= 0
        ? `전월 대비 소비가 ${monthChangeRate.toFixed(1)}% 증가했습니다.`
        : `전월 대비 소비가 ${Math.abs(monthChangeRate).toFixed(1)}% 감소했습니다.`;

    const categoryText = topCategory
      ? `${topCategory.name} 지출 비중이 가장 높습니다. 전체 지출 중 약 ${
          categoryTotal > 0
            ? Math.round((topCategory.value / categoryTotal) * 100)
            : 0
        }%를 차지하고 있습니다.`
      : "주요 소비 카테고리를 분석할 데이터가 부족합니다.";

    const adviceText = topCategory
      ? selectedDate
        ? `${topCategory.name} 지출이 집중된 날입니다. 같은 유형의 소비가 반복되는지 월 전체 기준으로도 확인해보세요.`
        : `${topCategory.name} 관련 소비 횟수나 금액을 한 번만 줄여도 다음 달 지출 관리에 도움이 됩니다.`
      : "소비 데이터를 더 등록하면 맞춤형 절약 제안을 받을 수 있습니다.";

    return `${compareText} ${categoryText} ${adviceText}`;
  }, [
    categorySummary,
    selectedDate,
    monthChangeRate,
    totalSpend,
    topCategory,
    categoryTotal,
  ]);

  const handlePreviousMonth = () => {
    setSelectedMonth((prev: string) => getPreviousMonth(prev));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev: string) => getNextMonth(prev));
    setSelectedDate(null);
  };

  return (
    <>
      <div className="finance-report__header">
        <div>
          <p className="finance-report__eyebrow">월간 소비 인사이트</p>
          <p className="finance-report__subtitle">
            선택한 월의 소비 흐름과 AI 인사이트를 확인하세요.
          </p>
        </div>

        <div className="finance-report__month-control">
          <button type="button" onClick={handlePreviousMonth}>
            <ChevronLeft size={16} />
            이전 달
          </button>
          <strong>{getMonthLabel(selectedMonth)}</strong>
          <button type="button" onClick={handleNextMonth}>
            다음 달
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {selectedDate && (
        <div className="finance-report__selected-date">
          <span>
            {formatDate(selectedDate)} 기준으로 일별 리포트를 확인 중입니다.
          </span>
          <button type="button" onClick={() => setSelectedDate(null)}>
            월 전체 보기
          </button>
        </div>
      )}

      <div className="finance-report__summary-grid">
        <Card className="finance-report__summary-card">
          <div className="finance-report__summary-icon finance-report__summary-icon--primary">
            <Wallet size={20} />
          </div>
          <p className="finance-report__summary-value">
            {formatKRW(totalSpend)}
          </p>
          <p className="finance-report__summary-label">
            {selectedDate ? "일별 소비 요약" : "월별 소비 요약"}
          </p>
          <p className="finance-report__summary-sub">
            {selectedDate
              ? "선택 날짜 기준"
              : `전월 대비 ${
                  monthChangeRate >= 0 ? "+" : ""
                }${monthChangeRate.toFixed(1)}%`}
          </p>
        </Card>

        <Card className="finance-report__summary-card">
          <div className="finance-report__summary-icon finance-report__summary-icon--purple">
            <ReceiptText size={20} />
          </div>
          <p className="finance-report__summary-value">
            {periodReceiptCount}건
          </p>
          <p className="finance-report__summary-label">
            {selectedDate ? "선택 날짜 영수증" : "영수증 등록 건수"}
          </p>
          <p className="finance-report__summary-sub">
            {selectedDate
              ? `${getMonthLabel(selectedMonth)} 전체 ${monthReceiptCount}건 중`
              : `지난 달 ${previousMonthReceiptCount}건`}
          </p>
        </Card>

        <Card className="finance-report__summary-card">
          <div className="finance-report__summary-icon finance-report__summary-icon--orange">
            <Sparkles size={20} />
          </div>
          <p className="finance-report__summary-value">
            {formatKRW(expectedMonthlySpend)}
          </p>
          <p className="finance-report__summary-label">예상 월 지출</p>
          <p className="finance-report__summary-sub">
            AI 예측 · 신뢰도 {predictionConfidence}%
          </p>
        </Card>
      </div>

      <Card>
        <div className="finance-report__section-header">
          <div>
            <h3 className="finance-report__section-title">
              {getMonthLabel(selectedMonth)} 지출 추이
            </h3>
            <p className="finance-report__section-desc">
              그래프의 날짜를 클릭해 해당 날짜의 상세 리포트를 확인할 수
              있습니다.
            </p>
          </div>
        </div>

        <MonthlyLineChart
          data={lineData}
          selectedDate={selectedDate}
          onPointClick={setSelectedDate}
        />
      </Card>

      <div className="finance-report__grid" key={`category-grid-${reportKey}`}>
        <Card>
          <h3 className="finance-report__section-title">
            {selectedDate ? "선택 날짜 카테고리별 지출" : "카테고리별 지출"}
          </h3>

          {categoryTotal === 0 ? (
            <p className="finance-report__empty-text">
              선택한 기준에 해당하는 카테고리 데이터가 없습니다.
            </p>
          ) : (
            <CategoryPieChart key={`pie-${reportKey}`} data={categoryData} />
          )}
        </Card>

        <Card>
          <h3 className="finance-report__section-title">
            {selectedDate ? "선택 날짜 카테고리별 상세" : "카테고리별 상세"}
          </h3>
          <div className="finance-report__category-list">
            {sortedCategoryData.length === 0 || categoryTotal === 0 ? (
              <p className="finance-report__empty-text">
                선택한 기준에 해당하는 카테고리 데이터가 없습니다.
              </p>
            ) : (
              sortedCategoryData.map((c) => {
                const pct =
                  categoryTotal > 0
                    ? Math.round((c.value / categoryTotal) * 100)
                    : 0;
                const categoryColor = getCategoryColor(c.name);

                return (
                  <div
                    key={`${reportKey}-${c.name}`}
                    className="finance-report__category-row"
                  >
                    <span
                      className="finance-report__category-name"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: categoryColor,
                          flexShrink: 0,
                        }}
                      />
                      {c.name}
                    </span>
                    <div className="finance-report__category-bar-wrap">
                      <div
                        className="finance-report__category-bar"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: categoryColor,
                        }}
                      />
                    </div>
                    <span className="finance-report__category-pct">{pct}%</span>
                    <span className="finance-report__category-amount">
                      {formatKRW(c.value)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      <Card key={`receipt-list-${reportKey}`}>
        <div className="finance-report__section-header">
          <div>
            <h3 className="finance-report__section-title">
              {selectedDate ? "선택 날짜 영수증 목록" : "최근 영수증 목록"}
            </h3>
            <p className="finance-report__section-desc">
              {selectedDate
                ? "선택한 날짜에 등록된 영수증을 확인할 수 있습니다."
                : "선택한 기준에 해당하는 최근 영수증을 확인할 수 있습니다."}
            </p>
          </div>

          <button
            type="button"
            className="finance-report__text-button"
            onClick={() => navigate("/receipts")}
          >
            더보기
          </button>
        </div>

        {recentReceipts.length === 0 ? (
          <p className="finance-report__empty-text">
            선택한 기준에 해당하는 영수증이 없습니다.
          </p>
        ) : (
          <div className="finance-report__receipt-list">
            {recentReceipts.map((receipt) => (
              <button
                key={`${reportKey}-${receipt.receiptId}`}
                type="button"
                className="finance-report__receipt-row"
                onClick={() => navigate(`/receipts/${receipt.receiptId}`)}
              >
                <span>{formatDate(receipt.purchaseDate)}</span>
                <strong>{receipt.storeName}</strong>
                <span>{receipt.categoryName || "-"}</span>
                <strong>{formatKRW(Number(receipt.totalAmount))}</strong>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card key={`ai-${reportKey}`}>
        <h3 className="finance-report__section-title">
          {selectedDate ? "선택 날짜 AI 소비패턴 분석" : "AI 소비패턴 분석"}
        </h3>
        <p className="finance-report__ai-text">{aiAnalysisText}</p>
      </Card>

      {!selectedDate && sortedCategoryData.length > 0 && categoryTotal > 0 && (
        <Card>
          <h3 className="finance-report__section-title">이번 달 소비 랭킹</h3>
          <div className="finance-report__rank-list">
            {sortedCategoryData.slice(0, 3).map((c, i) => {
              const pct =
                categoryTotal > 0
                  ? Math.round((c.value / categoryTotal) * 100)
                  : 0;
              return (
                <div key={c.name} className="finance-report__rank-row">
                  <span
                    className={`finance-report__rank-badge finance-report__rank-badge--${i + 1}`}
                  >
                    {i + 1}
                  </span>
                  <strong className="finance-report__rank-name">
                    {c.name}
                  </strong>
                  <span className="finance-report__rank-amount">
                    {formatKRW(c.value)}
                  </span>
                  <span className="finance-report__rank-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
};

export default MonthlyTab;
