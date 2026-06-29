import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Grid, List, LockKeyhole } from "lucide-react";
import FilterChip from "../../components/common/FilterChip";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { SearchBar } from "../../components/common/SearchBar";
import { documentService } from "../../services/documentService";
import { useCategories } from "../../hooks/useCategories";
import { formatDate, getDday } from "../../utils/formatDate";
import type { Document } from "../../types/document";
import type { AiStatus } from "../../types/common";
import "./Documents.css";

const AI_STATUS_LABEL: Record<AiStatus, string> = {
  PENDING: "대기",
  PROCESSING: "분석 중",
  DONE: "완료",
  FAILED: "실패",
};

const AI_STATUS_VARIANT: Record<
  AiStatus,
  "default" | "warning" | "success" | "danger"
> = {
  PENDING: "default",
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

const getDocumentProtected = (doc: Document) =>
  doc.is_locked === true ||
  doc.locked === true ||
  doc.cabinet_locked === true ||
  doc.is_locked === "Y" ||
  doc.cabinet_locked === "Y" ||
  doc.lock_status === "LOCKED" ||
  documentService.isDocumentLocallyProtected(doc.document_id);

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const categories = useCategories();
  const [keyword, setKeyword] = useState("");
  const [searchField, setSearchField] = useState<"title" | "tag" | "ocr" | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sort, setSort] = useState("latest");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef(0);

  useEffect(() => {
    const id = ++fetchRef.current;
    setLoading(true);
    documentService
      .getDocuments({
        keyword: keyword || undefined,
        searchField,
        categoryId,
      })
      .then((data) => {
        if (fetchRef.current === id) setDocs(data);
      })
      .catch(() => {
        if (fetchRef.current === id) setDocs([]);
      })
      .finally(() => {
        if (fetchRef.current === id) setLoading(false);
      });
  }, [keyword, searchField, categoryId]);

  const handleSearch = (kw: string, field?: "title" | "tag" | "ocr") => {
    setKeyword(kw);
    setSearchField(field);
  };

  const sorted = [...docs].sort((a, b) => {
    if (sort === "latest") return b.created_at.localeCompare(a.created_at);
    return a.title.localeCompare(b.title, "ko");
  });

  return (
    <div className="documents">
      <div className="documents__header">
        <div className="documents__header-left">
          <h2 className="documents__count">
            전체 문서 <span>{docs.length}</span>건
          </h2>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <p className="documents__policy-note">
        계약서, 병원/약국, 보증서/A·S, 기타 문서를 한 곳에서 확인할 수
        있습니다.
      </p>

      <div className="documents__filters">
        <FilterChip
          label="전체"
          selected={!categoryId}
          onClick={() => setCategoryId(undefined)}
        />
        {categories.filter((c) => c.name !== "영수증").map((c) => (
          <FilterChip
            key={c.category_id}
            label={c.name}
            selected={categoryId === c.category_id}
            onClick={() =>
              setCategoryId(
                categoryId === c.category_id ? undefined : c.category_id,
              )
            }
          />
        ))}
      </div>

      <div className="documents__toolbar">
        <Select
          value={sort}
          options={[
            { value: "latest", label: "최신순" },
            { value: "name", label: "이름순" },
          ]}
          onChange={(e) => setSort(e.target.value)}
        />
        <div className="documents__view-toggle">
          <button
            className={`documents__view-btn${viewMode === "card" ? " documents__view-btn--active" : ""}`}
            onClick={() => setViewMode("card")}
          >
            <Grid size={16} />
          </button>
          <button
            className={`documents__view-btn${viewMode === "list" ? " documents__view-btn--active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{ padding: 48, textAlign: "center", color: "var(--color-muted)" }}
        >
          문서를 불러오는 중...
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          title="문서가 없습니다"
          description="문서를 업로드하여 디지털 캐비닛을 채워보세요."
          action={{ label: "문서 업로드", onClick: () => navigate("/upload") }}
        />
      ) : viewMode === "card" ? (
        <div className="documents__card-grid">
          {sorted.map((doc) => {
            const category = categories.find(
              (c) => c.category_id === doc.category_id,
            );
            const aiStatus = doc.ai_status as AiStatus;
            const isProtected = getDocumentProtected(doc);

            return (
              <div
                key={doc.document_id}
                className={`document-card${isProtected ? " document-card--protected" : ""}`}
                onClick={() => navigate(`/documents/${doc.document_id}`)}
              >
                <div className="document-card__top">
                  <div className="document-card__file-type">
                    {doc.file_type}
                  </div>
                  <div className="document-card__icons">
                    {isProtected && (
                      <span
                        className="document-card__lock"
                        title="PIN 보호 문서"
                      >
                        <LockKeyhole size={13} />
                      </span>
                    )}
                    {doc.is_favorite && (
                      <Star
                        size={14}
                        className="document-card__star"
                        fill="currentColor"
                      />
                    )}
                  </div>
                </div>
                <p className="document-card__title">
                  {doc.title}
                  {isProtected && <span>보호됨</span>}
                </p>
                <p className="document-card__category">{category?.name}</p>
                <div className="document-card__footer">
                  {doc.expiry_date && (
                    <Badge
                      variant={
                        getDday(doc.expiry_date).startsWith("D+")
                          ? "danger"
                          : "default"
                      }
                    >
                      {getDday(doc.expiry_date)}
                    </Badge>
                  )}
                  <Badge variant={AI_STATUS_VARIANT[aiStatus]}>
                    {AI_STATUS_LABEL[aiStatus]}
                  </Badge>
                </div>
                <p className="document-card__date">
                  {formatDate(doc.created_at)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="documents__list">
          <div className="documents__list-header">
            <span>제목</span>
            <span>카테고리</span>
            <span>만료일</span>
            <span>상태</span>
            <span>업로드일</span>
          </div>
          {sorted.map((doc) => {
            const category = categories.find(
              (c) => c.category_id === doc.category_id,
            );
            const aiStatus = doc.ai_status as AiStatus;
            const isProtected = getDocumentProtected(doc);

            return (
              <div
                key={doc.document_id}
                className={`documents__list-row${isProtected ? " documents__list-row--protected" : ""}`}
                onClick={() => navigate(`/documents/${doc.document_id}`)}
              >
                <span className="documents__list-title">
                  {doc.is_favorite && (
                    <Star
                      size={12}
                      fill="currentColor"
                      style={{ color: "#f59e0b", marginRight: 4 }}
                    />
                  )}
                  {isProtected && (
                    <LockKeyhole
                      size={12}
                      style={{ color: "var(--color-primary-dark)", marginRight: 5 }}
                    />
                  )}
                  {doc.title}
                </span>
                <span>{category?.name}</span>
                <span>
                  {doc.expiry_date
                    ? `${doc.expiry_date} (${getDday(doc.expiry_date)})`
                    : "-"}
                </span>
                <span>
                  <Badge variant={AI_STATUS_VARIANT[aiStatus]}>
                    {AI_STATUS_LABEL[aiStatus]}
                  </Badge>
                  {isProtected && (
                    <span className="documents__protected-chip">보호</span>
                  )}
                </span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Documents;
