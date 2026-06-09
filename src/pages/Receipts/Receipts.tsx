import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Calendar,
  TrendingDown,
  ChevronDown,
} from "lucide-react";
import Card from "../../components/common/Card";
import FilterChip from "../../components/common/FilterChip";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import ReceiptBranchModal from "../../components/modal/ReceiptBranchModal";
import { mockReceipts, mockSpendCategories } from "../../data/mockReceipts";
import { filterReceipts } from "../../utils/filterUtils";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import "./Receipts.css";

const PAGE_SIZE = 10;

type SummaryType = "daily" | "weekly" | "monthly" | "yearly";

const getDateKey = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

const getMonthKey = (date: Date) => {
  return date.toISOString().slice(0, 7);
};

const getYearKey = (date: Date) => {
  return String(date.getFullYear());
};

const formatDisplayDate = (dateString: string) => {
  return dateString.replaceAll("-", ".");
};

const getDateRangeLabel = (fromDate: string, toDate: string) => {
  if (fromDate && toDate) {
    return `${formatDisplayDate(fromDate)} ~ ${formatDisplayDate(toDate)} 기준`;
  }

  if (fromDate) {
    return `${formatDisplayDate(fromDate)} 이후 기준`;
  }

  if (toDate) {
    return `${formatDisplayDate(toDate)} 이전 기준`;
  }

  return "";
};

const getStartOfWeek = (date: Date) => {
  const copiedDate = new Date(date);
  const day = copiedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copiedDate.setDate(copiedDate.getDate() + diff);
  copiedDate.setHours(0, 0, 0, 0);

  return copiedDate;
};

const getEndOfWeek = (date: Date) => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);

  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return endOfWeek;
};

const isSamePeriod = (
  dateString: string,
  type: SummaryType,
  baseDate: Date,
) => {
  const purchaseDate = new Date(dateString);

  if (type === "daily") {
    return dateString.startsWith(getDateKey(baseDate));
  }

  if (type === "weekly") {
    const startOfWeek = getStartOfWeek(baseDate);
    const endOfWeek = getEndOfWeek(baseDate);

    return purchaseDate >= startOfWeek && purchaseDate <= endOfWeek;
  }

  if (type === "monthly") {
    return dateString.startsWith(getMonthKey(baseDate));
  }

  return dateString.startsWith(getYearKey(baseDate));
};

const getPreviousBaseDate = (type: SummaryType, baseDate: Date) => {
  const previousDate = new Date(baseDate);

  if (type === "daily") {
    previousDate.setDate(previousDate.getDate() - 1);
  }

  if (type === "weekly") {
    previousDate.setDate(previousDate.getDate() - 7);
  }

  if (type === "monthly") {
    previousDate.setMonth(previousDate.getMonth() - 1);
  }

  if (type === "yearly") {
    previousDate.setFullYear(previousDate.getFullYear() - 1);
  }

  return previousDate;
};

const Receipts: React.FC = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [branchOpen, setBranchOpen] = useState(false);

  const [summaryType, setSummaryType] = useState<SummaryType>("monthly");
  const [summaryDropdownOpen, setSummaryDropdownOpen] = useState(false);

  const activeReceipts = mockReceipts.filter((r) => r.is_deleted === "N");

  const hasDateRange = Boolean(fromDate || toDate);

  const textMap = {
    daily: {
      totalTitle: "오늘 지출 합계",
      receiptLabel: "오늘 영수증",
      compareLabel: "전일 대비",
    },
    weekly: {
      totalTitle: "이번 주 지출 합계",
      receiptLabel: "이번 주 영수증",
      compareLabel: "전주 대비",
    },
    monthly: {
      totalTitle: "이번 달 지출 합계",
      receiptLabel: "이번 달 영수증",
      compareLabel: "전월 대비",
    },
    yearly: {
      totalTitle: "올해 지출 합계",
      receiptLabel: "올해 영수증",
      compareLabel: "전년 대비",
    },
  };

  const summaryInfo = useMemo(() => {
    const today = new Date();
    const previousBaseDate = getPreviousBaseDate(summaryType, today);

    const currentBaseReceipts = hasDateRange
      ? filterReceipts(
          activeReceipts,
          "",
          undefined,
          fromDate || undefined,
          toDate || undefined,
        )
      : activeReceipts.filter((r) =>
          isSamePeriod(r.purchase_date, summaryType, today),
        );

    const previousBaseReceipts = hasDateRange
      ? []
      : activeReceipts.filter((r) =>
          isSamePeriod(r.purchase_date, summaryType, previousBaseDate),
        );

    const currentFilteredReceipts = filterReceipts(
      currentBaseReceipts,
      query,
      categoryId,
      undefined,
      undefined,
    );

    const previousFilteredReceipts = filterReceipts(
      previousBaseReceipts,
      query,
      categoryId,
      undefined,
      undefined,
    );

    const currentSpend = currentFilteredReceipts.reduce(
      (sum, r) => sum + r.total_amount,
      0,
    );

    const previousSpend = previousFilteredReceipts.reduce(
      (sum, r) => sum + r.total_amount,
      0,
    );

    const changeRate =
      previousSpend > 0
        ? ((currentSpend - previousSpend) / previousSpend) * 100
        : currentSpend > 0
          ? 100
          : 0;

    const categorySpendMap = currentFilteredReceipts.reduce<
      Record<number, number>
    >((acc, r) => {
      acc[r.spend_category_id] =
        (acc[r.spend_category_id] || 0) + r.total_amount;
      return acc;
    }, {});

    const topCategoryEntry = Object.entries(categorySpendMap).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const topCategoryId = topCategoryEntry?.[0];
    const topCategorySpend = topCategoryEntry?.[1] || 0;

    const topCategory = topCategoryId
      ? mockSpendCategories.find(
          (c) => c.spend_category_id === Number(topCategoryId),
        )
      : null;

    const topCategoryPercent =
      currentSpend > 0
        ? Math.round((topCategorySpend / currentSpend) * 100)
        : 0;

    return {
      currentFilteredReceipts,
      currentSpend,
      receiptCount: currentFilteredReceipts.length,
      topCategoryName: topCategory?.name || "-",
      topCategoryPercent,
      changeRate,
      totalTitle: hasDateRange
        ? "선택 기간 지출 합계"
        : textMap[summaryType].totalTitle,
      receiptLabel: hasDateRange
        ? "선택 기간 영수증"
        : textMap[summaryType].receiptLabel,
      summarySubText: hasDateRange
        ? getDateRangeLabel(fromDate, toDate)
        : `${textMap[summaryType].compareLabel} ${
            changeRate >= 0 ? "+" : ""
          }${changeRate.toFixed(1)}%`,
    };
  }, [
    activeReceipts,
    categoryId,
    fromDate,
    hasDateRange,
    query,
    summaryType,
    toDate,
  ]);

  const handleSummaryTypeChange = (type: SummaryType) => {
    setSummaryType(type);
    setSummaryDropdownOpen(false);
    setPage(1);
  };

  const sorted = [...summaryInfo.currentFilteredReceipts].sort((a, b) => {
    if (sort === "latest") return b.created_at.localeCompare(a.created_at);
    if (sort === "purchase")
      return b.purchase_date.localeCompare(a.purchase_date);
    return b.total_amount - a.total_amount;
  });

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="receipts">
      <div className="receipts__summary-grid">
        <Card className="receipts__summary-card">
          <div className="receipts__summary-card-top">
            <div className="receipts__summary-icon receipts__summary-icon--blue">
              <ShoppingCart size={20} />
            </div>

            <div className="receipts__summary-dropdown">
              <button
                type="button"
                className="receipts__summary-dropdown-button"
                onClick={() => setSummaryDropdownOpen((prev) => !prev)}
              >
                <ChevronDown size={18} />
              </button>

              {summaryDropdownOpen && (
                <div className="receipts__summary-dropdown-menu">
                  <button
                    type="button"
                    onClick={() => handleSummaryTypeChange("daily")}
                  >
                    일별 합계
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSummaryTypeChange("weekly")}
                  >
                    주별 합계
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSummaryTypeChange("monthly")}
                  >
                    월별 합계
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSummaryTypeChange("yearly")}
                  >
                    년도별 합계
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="receipts__summary-value">
            {formatKRW(summaryInfo.currentSpend)}
          </p>
          <p className="receipts__summary-label">{summaryInfo.totalTitle}</p>
          <p className="receipts__summary-change">
            {summaryInfo.summarySubText}
          </p>
        </Card>

        <Card className="receipts__summary-card">
          <div className="receipts__summary-icon receipts__summary-icon--purple">
            <Calendar size={20} />
          </div>
          <p className="receipts__summary-value">
            {summaryInfo.receiptCount}건
          </p>
          <p className="receipts__summary-label">{summaryInfo.receiptLabel}</p>
        </Card>

        <Card className="receipts__summary-card">
          <div className="receipts__summary-icon receipts__summary-icon--orange">
            <TrendingDown size={20} />
          </div>
          <p className="receipts__summary-value">
            {summaryInfo.topCategoryName}
          </p>
          <p className="receipts__summary-label">최다 지출 카테고리</p>
          <p className="receipts__summary-change">
            전체 지출의 {summaryInfo.topCategoryPercent}%
          </p>
        </Card>
      </div>

      <div className="receipts__toolbar">
        <div className="receipts__search">
          <Search size={16} className="receipts__search-icon" />
          <input
            className="receipts__search-input"
            placeholder="가맹점명, 메모 검색..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="receipts__date-filter">
          <input
            type="date"
            className="receipts__date-input"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
          <span>~</span>
          <input
            type="date"
            className="receipts__date-input"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="receipts__filters">
        <FilterChip
          label="전체"
          selected={!categoryId}
          onClick={() => {
            setCategoryId(undefined);
            setPage(1);
          }}
        />
        {mockSpendCategories.map((c) => (
          <FilterChip
            key={c.spend_category_id}
            label={c.name}
            selected={categoryId === c.spend_category_id}
            onClick={() => {
              setCategoryId(
                categoryId === c.spend_category_id
                  ? undefined
                  : c.spend_category_id,
              );
              setPage(1);
            }}
          />
        ))}
      </div>

      <div className="receipts__sort-row">
        <span className="receipts__count">
          {summaryInfo.currentFilteredReceipts.length}건
        </span>
        <Select
          value={sort}
          options={[
            { value: "latest", label: "최신 등록순" },
            { value: "purchase", label: "결제일순" },
            { value: "amount", label: "금액순" },
          ]}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {paged.length === 0 ? (
        <EmptyState
          title="영수증이 없습니다"
          description="선택한 조건에 해당하는 영수증이 없습니다."
          action={{ label: "영수증 추가", onClick: () => setBranchOpen(true) }}
        />
      ) : (
        <div className="receipts__list">
          {paged.map((r) => {
            const cat = mockSpendCategories.find(
              (c) => c.spend_category_id === r.spend_category_id,
            );

            return (
              <div
                key={r.receipt_id}
                className="receipt-card"
                onClick={() => navigate(`/receipts/${r.receipt_id}`)}
              >
                <div className="receipt-card__cat-badge">
                  {cat?.name?.slice(0, 2)}
                </div>
                <div className="receipt-card__info">
                  <p className="receipt-card__store">{r.store_name}</p>
                  <p className="receipt-card__meta">
                    {cat?.name} · {formatDate(r.purchase_date)}
                  </p>
                </div>
                <p className="receipt-card__amount">
                  {formatKRW(r.total_amount)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        total={summaryInfo.currentFilteredReceipts.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <ReceiptBranchModal
        isOpen={branchOpen}
        onClose={() => setBranchOpen(false)}
      />
    </div>
  );
};

export default Receipts;
