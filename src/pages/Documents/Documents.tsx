import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, Grid, List, Upload } from "lucide-react";
import FilterChip from "../../components/common/FilterChip";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { mockDocumentCategories } from "../../data/mockDocuments";
import { documentService } from "../../services/documentService";
import { filterDocuments } from "../../utils/filterUtils";
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

const AI_STATUS_VARIANT: Record<AiStatus, "default" | "warning" | "success" | "danger"> = {
  PENDING: "default",
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sort, setSort] = useState("latest");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService.getDocuments()
      .then(setAllDocs)
      .catch(() => setAllDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const docs = filterDocuments(allDocs, query, categoryId);

  const sorted = [...docs].sort((a, b) => {
    if (sort === "latest") return b.created_at.localeCompare(a.created_at);
    return a.title.localeCompare(b.title, "ko");
  });

  if (loading) {
    return <div className="documents" style={{ padding: 48, textAlign: "center", color: "var(--color-muted)" }}>문서를 불러오는 중...</div>;
  }

  return (
    <div className="documents">
      <div className="documents__header">
        <div className="documents__header-left">
          <h2 className="documents__count">전체 문서 <span>{docs.length}</span>건</h2>
          <div className="documents__search">
            <Search size={16} className="documents__search-icon" />
            <input
              className="documents__search-input"
              placeholder="문서명, 태그, OCR 본문 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <button className="documents__upload-btn" onClick={() => navigate("/upload")}>
          <Upload size={16} /> 업로드
        </button>
      </div>

      <p className="documents__policy-note">JPG / PNG 이미지만 업로드할 수 있으며, PDF는 내려받기 기능에서만 사용합니다. 영수증은 영수증 관리 페이지에서 별도로 관리됩니다.</p>

      <div className="documents__filters">
        <FilterChip label="전체" selected={!categoryId} onClick={() => setCategoryId(undefined)} />
        {mockDocumentCategories.map((c) => (
          <FilterChip
            key={c.category_id}
            label={c.name}
            selected={categoryId === c.category_id}
            onClick={() => setCategoryId(categoryId === c.category_id ? undefined : c.category_id)}
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
          ><Grid size={16} /></button>
          <button
            className={`documents__view-btn${viewMode === "list" ? " documents__view-btn--active" : ""}`}
            onClick={() => setViewMode("list")}
          ><List size={16} /></button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="문서가 없습니다"
          description="문서를 업로드하여 디지털 캐비닛을 채워보세요."
          action={{ label: "문서 업로드", onClick: () => navigate("/upload") }}
        />
      ) : viewMode === "card" ? (
        <div className="documents__card-grid">
          {sorted.map((doc) => {
            const category = mockDocumentCategories.find((c) => c.category_id === doc.category_id);
            return (
              <div
                key={doc.document_id}
                className="document-card"
                onClick={() => navigate(`/documents/${doc.document_id}`)}
              >
                <div className="document-card__top">
                  <div className="document-card__file-type">{doc.file_type}</div>
                  {doc.is_favorite && <Star size={14} className="document-card__star" fill="currentColor" />}
                </div>
                <p className="document-card__title">{doc.title}</p>
                <p className="document-card__category">{category?.name}</p>
                <div className="document-card__footer">
                  {doc.expiry_date && (
                    <Badge variant={getDday(doc.expiry_date).startsWith("D+") ? "danger" : "default"}>
                      {getDday(doc.expiry_date)}
                    </Badge>
                  )}
                  <Badge variant={AI_STATUS_VARIANT[doc.ai_status]}>
                    {AI_STATUS_LABEL[doc.ai_status]}
                  </Badge>
                </div>
                <p className="document-card__date">{formatDate(doc.created_at)}</p>
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
            const category = mockDocumentCategories.find((c) => c.category_id === doc.category_id);
            return (
              <div
                key={doc.document_id}
                className="documents__list-row"
                onClick={() => navigate(`/documents/${doc.document_id}`)}
              >
                <span className="documents__list-title">
                  {doc.is_favorite && <Star size={12} fill="currentColor" style={{ color: "#f59e0b", marginRight: 4 }} />}
                  {doc.title}
                </span>
                <span>{category?.name}</span>
                <span>{doc.expiry_date ? `${doc.expiry_date} (${getDday(doc.expiry_date)})` : "-"}</span>
                <span><Badge variant={AI_STATUS_VARIANT[doc.ai_status]}>{AI_STATUS_LABEL[doc.ai_status]}</Badge></span>
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
