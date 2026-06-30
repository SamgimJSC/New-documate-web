import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Calendar, TrendingDown, AlertCircle } from "lucide-react";
import Card from "../../components/common/Card";
import FilterChip from "../../components/common/FilterChip";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import ReceiptBranchModal from "../../components/modal/ReceiptBranchModal";
import { mockSpendCategories } from "../../data/mockReceipts";
import { getReceipts } from "../../api/receipt";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import type { Receipt } from "../../types/receipt";
import "./Receipts.css";

const PAGE_SIZE = 10;

const isNullVal = (v: string | null | undefined) =>
  v == null || v === "" || v === "null" || v === "undefined";

const hasMissingFields = (r: Receipt) =>
  isNullVal(r.storeName) || r.totalAmount == null || isNullVal(r.purchaseDate) || isNullVal(r.categoryName);

const Receipts: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState<"latest" | "purchaseDate" | "amountDesc" | "amountAsc">("latest");
  const [page, setPage] = useState(1);
  const [branchOpen, setBranchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [thisMonthSpend, setThisMonthSpend] = useState(0);
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [topCategoryName, setTopCategoryName] = useState<string>("-");

  useEffect(() => {
    const now = new Date();
    getReceipts({ year: now.getFullYear(), month: now.getMonth() + 1, size: 100 }).then((res) => {
      const list = res.receipts;
      setThisMonthSpend(list.reduce((s, r) => s + Number(r.totalAmount), 0));
      setThisMonthCount(list.length);
      const catTotals: Record<number, number> = {};
      list.forEach((r) => {
        if (r.spendCategoryId) {
          catTotals[r.spendCategoryId] = (catTotals[r.spendCategoryId] || 0) + Number(r.totalAmount);
        }
      });
      const topEntry = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
      if (topEntry) {
        const found = list.find((r) => r.spendCategoryId === Number(topEntry[0]));
        setTopCategoryName(found?.categoryName ?? "-");
      }
    }).catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    setLoading(true);
    getReceipts({
      keyword: query || undefined,
      categoryId,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sort,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        setReceipts(res.receipts);
        setTotalCount(res.totalCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query, categoryId, fromDate, toDate, sort, page, refreshKey]);

  const handleBranchClose = () => {
    setBranchOpen(false);
  };

  return (
    <div className="receipts">
      <div className="receipts__summary-grid">
        <Card className="receipts__summary-card">
          <div className="receipts__summary-icon receipts__summary-icon--blue"><ShoppingCart size={20} /></div>
          <p className="receipts__summary-value">{formatKRW(thisMonthSpend)}</p>
          <p className="receipts__summary-label">이번달 총지출</p>
        </Card>
        <Card className="receipts__summary-card">
          <div className="receipts__summary-icon receipts__summary-icon--purple"><Calendar size={20} /></div>
          <p className="receipts__summary-value">{thisMonthCount}건</p>
          <p className="receipts__summary-label">이번달 영수증</p>
        </Card>
        <Card className="receipts__summary-card">
          <div className="receipts__summary-icon receipts__summary-icon--orange"><TrendingDown size={20} /></div>
          <p className="receipts__summary-value">{topCategoryName}</p>
          <p className="receipts__summary-label">최다 지출 카테고리</p>
        </Card>
      </div>

      <div className="receipts__toolbar">
        <div className="receipts__search">
          <Search size={16} className="receipts__search-icon" />
          <input
            className="receipts__search-input"
            placeholder="가맹점명, 메모 검색..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="receipts__date-filter">
          <input type="date" className="receipts__date-input" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
          <span>~</span>
          <input type="date" className="receipts__date-input" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
        </div>
        <button className="receipts__upload-btn" onClick={() => setBranchOpen(true)}>+ 영수증 추가</button>
      </div>

      <div className="receipts__filters">
        <FilterChip label="전체" selected={!categoryId} onClick={() => { setCategoryId(undefined); setPage(1); }} />
        {mockSpendCategories.map((c) => (
          <FilterChip
            key={c.spendCategoryId}
            label={c.name}
            selected={categoryId === c.spendCategoryId}
            onClick={() => { setCategoryId(categoryId === c.spendCategoryId ? undefined : c.spendCategoryId); setPage(1); }}
          />
        ))}
      </div>

      <div className="receipts__sort-row">
        <span className="receipts__count">{totalCount}건</span>
        <Select
          value={sort}
          options={[
            { value: "latest", label: "최신 등록순" },
            { value: "purchaseDate", label: "결제일순" },
            { value: "amountDesc", label: "금액 높은순" },
            { value: "amountAsc", label: "금액 낮은순" },
          ]}
          onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1); }}
        />
      </div>

      {!loading && (() => {
        const missingReceipts = receipts.filter(hasMissingFields);
        return missingReceipts.length > 0 ? (
          <div className="receipts__missing-banner">
            <AlertCircle size={15} className="receipts__missing-banner-icon" />
            <span>
              <strong>{missingReceipts.length}개</strong> 영수증에 OCR 미인식 항목이 있어요.
              아래 표시된 영수증을 클릭해서 직접 입력해주세요.
            </span>
          </div>
        ) : null;
      })()}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--color-muted)" }}>불러오는 중...</div>
      ) : receipts.length === 0 ? (
        <EmptyState
          title="영수증이 없습니다"
          description="영수증을 추가하여 지출을 관리해보세요."
          action={{ label: "영수증 추가", onClick: () => setBranchOpen(true) }}
        />
      ) : (
        <div className="receipts__list">
          {receipts.map((r) => {
            const missing = hasMissingFields(r);
            return (
              <div
                key={r.receiptId}
                className={`receipt-card${missing ? " receipt-card--missing" : ""}`}
                onClick={() => navigate(`/receipts/${r.receiptId}`)}
              >
                <div className="receipt-card__cat-badge">{r.categoryName?.slice(0, 2) ?? "기타"}</div>
                <div className="receipt-card__info">
                  <p className="receipt-card__store">
                    {isNullVal(r.storeName)
                      ? <span className="receipt-card__store-missing">가게명 미인식</span>
                      : r.storeName}
                  </p>
                  <p className="receipt-card__meta">
                    {isNullVal(r.categoryName) ? "카테고리 미인식" : r.categoryName}
                    {" · "}
                    {isNullVal(r.purchaseDate) ? "날짜 미인식" : formatDate(r.purchaseDate)}
                  </p>
                </div>
                {missing && <span className="receipt-card__missing-badge">미인식</span>}
                <p className="receipt-card__amount">
                  {r.totalAmount != null ? formatKRW(r.totalAmount) : "-"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <Pagination total={totalCount} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />

      <ReceiptBranchModal
        isOpen={branchOpen}
        onClose={handleBranchClose}
        onSaved={() => { setPage(1); setRefreshKey((k) => k + 1); }}
      />
    </div>
  );
};

export default Receipts;
