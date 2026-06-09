import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ReceiptText,
  Sparkles,
  CreditCard,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import MonthlyLineChart from "../../components/chart/MonthlyLineChart";
import CategoryPieChart from "../../components/chart/CategoryPieChart";
import { mockCurrentUser } from "../../data/mockUsers";
import { mockReceipts, mockSpendCategories } from "../../data/mockReceipts";
import { sumByCategory } from "../../utils/filterUtils";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import "./FinanceReport.css";

const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getLatestReceiptMonth = () => {
  const activeReceipts = mockReceipts.filter((r) => r.is_deleted === "N");

  if (activeReceipts.length === 0) {
    return getMonthKey(new Date());
  }

  const latestReceipt = [...activeReceipts].sort((a, b) =>
    b.purchase_date.localeCompare(a.purchase_date),
  )[0];

  return latestReceipt.purchase_date.slice(0, 7);
};

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

const getDaysInMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber, 0).getDate();
};

const getDayNumber = (dateString: string) => {
  return Number(dateString.slice(8, 10));
};

const FinanceReport: React.FC = () => {
  const navigate = useNavigate();
  const isPro = mockCurrentUser.plan === "PRO";

  const [selectedMonth, setSelectedMonth] = useState(getLatestReceiptMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const activeReceipts = mockReceipts.filter((r) => r.is_deleted === "N");

  const monthReceipts = useMemo(() => {
    return activeReceipts.filter((r) =>
      r.purchase_date.startsWith(selectedMonth),
    );
  }, [activeReceipts, selectedMonth]);

  const previousMonthReceipts = useMemo(() => {
    const previousMonth = getPreviousMonth(selectedMonth);

    return activeReceipts.filter((r) =>
      r.purchase_date.startsWith(previousMonth),
    );
  }, [activeReceipts, selectedMonth]);

  const reportReceipts = useMemo(() => {
    if (!selectedDate) {
      return monthReceipts;
    }

    return monthReceipts.filter((r) => r.purchase_date === selectedDate);
  }, [monthReceipts, selectedDate]);

  const totalSpend = reportReceipts.reduce((sum, r) => sum + r.total_amount, 0);

  const monthTotalSpend = monthReceipts.reduce(
    (sum, r) => sum + r.total_amount,
    0,
  );

  const previousMonthSpend = previousMonthReceipts.reduce(
    (sum, r) => sum + r.total_amount,
    0,
  );

  const monthChangeRate =
    previousMonthSpend > 0
      ? ((monthTotalSpend - previousMonthSpend) / previousMonthSpend) * 100
      : monthTotalSpend > 0
        ? 100
        : 0;

  const daysInMonth = getDaysInMonth(selectedMonth);
  const lastReceiptDay =
    monthReceipts.length > 0
      ? Math.max(...monthReceipts.map((r) => getDayNumber(r.purchase_date)))
      : 1;

  const expectedMonthlySpend =
    monthTotalSpend > 0
      ? Math.round((monthTotalSpend / lastReceiptDay) * daysInMonth)
      : 0;

  const predictionConfidence =
    monthReceipts.length >= 10 ? 82 : monthReceipts.length >= 5 ? 78 : 65;

  const lineData = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateKey = `${selectedMonth}-${String(day).padStart(2, "0")}`;
    const amount = monthReceipts
      .filter((r) => r.purchase_date === dateKey)
      .reduce((sum, r) => sum + r.total_amount, 0);

    return {
      month: `${day}일`,
      amount,
      date: dateKey,
    };
  });

  const receiptDateOptions = [
    ...new Set(monthReceipts.map((r) => r.purchase_date)),
  ].sort((a, b) => b.localeCompare(a));

  const categoryData = sumByCategory(reportReceipts, mockSpendCategories);

  const sortedCategoryData = [...categoryData].sort(
    (a, b) => b.value - a.value,
  );

  const categoryTotal = categoryData.reduce((sum, c) => sum + c.value, 0);

  const topCategory = sortedCategoryData[0];

  const recentReceipts = [...reportReceipts]
    .sort((a, b) => b.purchase_date.localeCompare(a.purchase_date))
    .slice(0, 5);

  const aiAnalysisText = useMemo(() => {
    if (reportReceipts.length === 0) {
      return "선택한 기준에 해당하는 소비 데이터가 없습니다. 영수증을 등록하면 AI 소비패턴 분석을 확인할 수 있습니다.";
    }

    const compareText =
      monthChangeRate >= 0
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
      ? `${topCategory.name} 관련 소비 횟수나 금액을 한 번만 줄여도 다음 달 지출 관리에 도움이 됩니다.`
      : "소비 데이터를 더 등록하면 맞춤형 절약 제안을 받을 수 있습니다.";

    return `${compareText} ${categoryText} ${adviceText}`;
  }, [categoryTotal, monthChangeRate, reportReceipts.length, topCategory]);

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => getPreviousMonth(prev));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => getNextMonth(prev));
    setSelectedDate(null);
  };

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
        <div>
          <div className="finance-report__title-row">
            <h2 className="finance-report__title">소비 리포트</h2>
            <Badge variant="pro">PRO</Badge>
          </div>
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
            {formatDate(selectedDate)} 기준으로 리포트를 확인 중입니다.
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
            {selectedDate ? "선택 날짜 총 지출" : "월별 소비 요약"}
          </p>
          <p className="finance-report__summary-sub">
            전월 대비 {monthChangeRate >= 0 ? "+" : ""}
            {monthChangeRate.toFixed(1)}%
          </p>
        </Card>

        <Card className="finance-report__summary-card">
          <div className="finance-report__summary-icon finance-report__summary-icon--purple">
            <ReceiptText size={20} />
          </div>
          <p className="finance-report__summary-value">
            {reportReceipts.length}건
          </p>
          <p className="finance-report__summary-label">
            {selectedDate ? "선택 날짜 영수증" : "영수증 등록 건수"}
          </p>
          <p className="finance-report__summary-sub">
            지난 달 {previousMonthReceipts.length}건
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
              소비가 발생한 날짜를 선택해 상세 리포트를 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <MonthlyLineChart data={lineData} />

        <div className="finance-report__date-chip-row">
          <button
            type="button"
            className={
              !selectedDate
                ? "finance-report__date-chip active"
                : "finance-report__date-chip"
            }
            onClick={() => setSelectedDate(null)}
          >
            월 전체
          </button>

          {receiptDateOptions.map((date) => (
            <button
              key={date}
              type="button"
              className={
                selectedDate === date
                  ? "finance-report__date-chip active"
                  : "finance-report__date-chip"
              }
              onClick={() => setSelectedDate(date)}
            >
              {Number(date.slice(8, 10))}일
            </button>
          ))}
        </div>
      </Card>

      <div className="finance-report__grid">
        <Card>
          <h3 className="finance-report__section-title">카테고리별 지출</h3>
          <CategoryPieChart data={categoryData} />
        </Card>

        <Card>
          <h3 className="finance-report__section-title">카테고리별 상세</h3>
          <div className="finance-report__category-list">
            {sortedCategoryData.length === 0 ? (
              <p className="finance-report__empty-text">
                선택한 기준에 해당하는 카테고리 데이터가 없습니다.
              </p>
            ) : (
              sortedCategoryData.map((c) => {
                const pct =
                  categoryTotal > 0
                    ? Math.round((c.value / categoryTotal) * 100)
                    : 0;

                return (
                  <div key={c.name} className="finance-report__category-row">
                    <span className="finance-report__category-name">
                      {c.name}
                    </span>
                    <div className="finance-report__category-bar-wrap">
                      <div
                        className="finance-report__category-bar"
                        style={{ width: `${pct}%` }}
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

      <Card>
        <div className="finance-report__section-header">
          <div>
            <h3 className="finance-report__section-title">최근 영수증 목록</h3>
            <p className="finance-report__section-desc">
              선택한 기준에 해당하는 최근 영수증을 확인할 수 있습니다.
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
            {recentReceipts.map((receipt) => {
              const category = mockSpendCategories.find(
                (c) => c.spend_category_id === receipt.spend_category_id,
              );

              return (
                <button
                  key={receipt.receipt_id}
                  type="button"
                  className="finance-report__receipt-row"
                  onClick={() => navigate(`/receipts/${receipt.receipt_id}`)}
                >
                  <span>{formatDate(receipt.purchase_date)}</span>
                  <strong>{receipt.store_name}</strong>
                  <span>{category?.name || "-"}</span>
                  <strong>{formatKRW(receipt.total_amount)}</strong>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="finance-report__section-title">AI 소비패턴 분석</h3>
        <p className="finance-report__ai-text">{aiAnalysisText}</p>
      </Card>

      <Card>
        <div className="finance-report__card-rec-box">
          <div className="finance-report__card-rec-left">
            <div className="finance-report__summary-icon finance-report__summary-icon--primary">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="finance-report__card-rec-header">
                <h3 className="finance-report__section-title">
                  카드 추천 보기
                </h3>
                <Badge variant="pro">PRO</Badge>
              </div>
              <p className="finance-report__card-rec-text">
                주요 소비 카테고리를 기반으로 혜택이 높은 카드를 확인할 수
                있습니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="finance-report__card-rec-button"
            onClick={() => navigate("/cards")}
          >
            추천 보기
          </button>
        </div>
      </Card>
    </div>
  );
};

export default FinanceReport;
