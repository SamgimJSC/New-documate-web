import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Calendar, TrendingDown } from "lucide-react";
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

const Receipts: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [branchOpen, setBranchOpen] = useState(false);

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const activeReceipts = mockReceipts.filter((r) => r.is_deleted === "N");
  const thisMonthReceipts = activeReceipts.filter((r) => r.purchase_date.startsWith(thisMonth));
  const thisMonthSpend = thisMonthReceipts.reduce((s, r) => s + r.total_amount, 0);

  const topCategoryId = thisMonthReceipts.length > 0
    ? Object.entries(thisMonthReceipts.reduce<Record<number, number>>((acc, r) => {
        acc[r.spend_category_id] = (acc[r.spend_category_id] || 0) + r.total_amount;
        return acc;
      }, {})).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;
  const topCategory = topCategoryId ? mockSpendCategories.find((c) => c.spend_category_id === Number(topCategoryId)) : null;

  const filtered = filterReceipts(activeReceipts, query, categoryId, fromDate || undefined, toDate || undefined);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "latest") return b.created_at.localeCompare(a.created_at);
    if (sort === "purchase") return b.purchase_date.localeCompare(a.purchase_date);
    return b.total_amount - a.total_amount;
  });

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <p className="receipts__summary-value">{thisMonthReceipts.length}건</p>
          <p className="receipts__summary-label">이번달 영수증</p>
        </Card>
        <Card className="receipts__summary-card">
          <div className="receipts__summary-icon receipts__summary-icon--orange"><TrendingDown size={20} /></div>
          <p className="receipts__summary-value">{topCategory?.name || "-"}</p>
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
            key={c.spend_category_id}
            label={c.name}
            selected={categoryId === c.spend_category_id}
            onClick={() => { setCategoryId(categoryId === c.spend_category_id ? undefined : c.spend_category_id); setPage(1); }}
          />
        ))}
      </div>

      <div className="receipts__sort-row">
        <span className="receipts__count">{filtered.length}건</span>
        <Select
          value={sort}
          options={[
            { value: "latest", label: "최신 등록순" },
            { value: "purchase", label: "결제일순" },
            { value: "amount", label: "금액순" },
          ]}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
        />
      </div>

      {paged.length === 0 ? (
        <EmptyState
          title="영수증이 없습니다"
          description="영수증을 추가하여 지출을 관리해보세요."
          action={{ label: "영수증 추가", onClick: () => setBranchOpen(true) }}
        />
      ) : (
        <div className="receipts__list">
          {paged.map((r) => {
            const cat = mockSpendCategories.find((c) => c.spend_category_id === r.spend_category_id);
            return (
              <div
                key={r.receipt_id}
                className="receipt-card"
                onClick={() => navigate(`/receipts/${r.receipt_id}`)}
              >
                <div className="receipt-card__cat-badge">{cat?.name?.slice(0, 2)}</div>
                <div className="receipt-card__info">
                  <p className="receipt-card__store">{r.store_name}</p>
                  <p className="receipt-card__meta">{cat?.name} · {formatDate(r.purchase_date)}</p>
                </div>
                <p className="receipt-card__amount">{formatKRW(r.total_amount)}</p>
              </div>
            );
          })}
        </div>
      )}

      <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />

      <ReceiptBranchModal isOpen={branchOpen} onClose={() => setBranchOpen(false)} />
    </div>
  );
};

export default Receipts;
