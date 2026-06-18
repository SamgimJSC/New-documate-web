import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Download, Trash2, Plus } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import AlertSettingModal from "../../components/modal/AlertSettingModal";
import CategoryEditModal from "../../components/modal/CategoryEditModal";
import { mockDocumentCategories, mockDocumentTags, mockTags, mockDocumentAlerts } from "../../data/mockDocuments";
import { documentService } from "../../services/documentService";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import type { Document } from "../../types/document";
import type { AiStatus } from "../../types/common";
import "./DocumentDetail.css";

const AI_STATUS_VARIANT: Record<AiStatus, "default" | "warning" | "success" | "danger"> = {
  PENDING: "default",
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

const DocumentDetail: React.FC = () => {
  const { document_id } = useParams<{ document_id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [alertOpen, setAlertOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document_id) return;
    documentService.getDocument(document_id)
      .then((d) => { setDoc(d); setIsFavorite(d.is_favorite); })
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [document_id]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: "center", color: "var(--color-muted)" }}>문서를 불러오는 중...</div>;
  }

  if (!doc) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>문서를 찾을 수 없습니다.</p>
        <Button variant="primary" onClick={() => navigate("/documents")} size="sm">목록으로</Button>
      </div>
    );
  }

  const category = mockDocumentCategories.find((c) => c.category_id === doc.category_id);
  const docTagIds = mockDocumentTags.filter((dt) => dt.document_id === doc.document_id).map((dt) => dt.tag_id);
  const docTags = mockTags.filter((t) => docTagIds.includes(t.tag_id));
  const alerts = mockDocumentAlerts.filter((a) => a.document_id === doc.document_id);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    showToast(isFavorite ? "즐겨찾기가 해제되었습니다." : "즐겨찾기에 추가되었습니다.", "success");
  };

  const handleDelete = () => {
    showToast("문서가 삭제되었습니다.", "info");
    navigate("/documents");
  };

  return (
    <div className="doc-detail">
      <button className="doc-detail__back" onClick={() => navigate("/documents")}>
        <ArrowLeft size={16} /> 전체 문서
      </button>

      <div className="doc-detail__layout">
        <div className="doc-detail__preview">
          <div className="doc-detail__preview-box">
            <span className="doc-detail__preview-type">{doc.file_type}</span>
            <p className="doc-detail__preview-name">{doc.file_name}</p>
          </div>
        </div>

        <div className="doc-detail__meta">
          <div className="doc-detail__meta-header">
            <h2 className="doc-detail__title">{doc.title}</h2>
            <div className="doc-detail__actions">
              <button className={`doc-detail__icon-btn${(doc.is_favorite || isFavorite) ? " doc-detail__icon-btn--active" : ""}`} onClick={handleFavorite} title="즐겨찾기">
                <Star size={18} fill={(doc.is_favorite || isFavorite) ? "currentColor" : "none"} />
              </button>
              <button className="doc-detail__icon-btn" onClick={() => showToast("다운로드 기능은 준비 중입니다.", "info")} title="다운로드">
                <Download size={18} />
              </button>
              <button className="doc-detail__icon-btn doc-detail__icon-btn--danger" onClick={handleDelete} title="삭제">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="doc-detail__info-grid">
            <div className="doc-detail__info-row">
              <span className="doc-detail__info-label">카테고리</span>
              <span className="doc-detail__info-value">
                {category?.name}
                <button className="doc-detail__edit-btn" onClick={() => setCategoryOpen(true)}>수정</button>
              </span>
            </div>
            <div className="doc-detail__info-row">
              <span className="doc-detail__info-label">파일 정보</span>
              <span className="doc-detail__info-value">{doc.file_type} · {(doc.file_size_bytes / 1024).toFixed(0)}KB{doc.page_count ? ` · ${doc.page_count}페이지` : ""}</span>
            </div>
            <div className="doc-detail__info-row">
              <span className="doc-detail__info-label">발급일</span>
              <span className="doc-detail__info-value">{doc.issue_date || "-"}</span>
            </div>
            <div className="doc-detail__info-row">
              <span className="doc-detail__info-label">만료일</span>
              <span className="doc-detail__info-value">{doc.expiry_date || "-"}</span>
            </div>
            <div className="doc-detail__info-row">
              <span className="doc-detail__info-label">AI 상태</span>
              <span className="doc-detail__info-value">
                <Badge variant={AI_STATUS_VARIANT[doc.ai_status]}>{doc.ai_status}</Badge>
                {doc.ai_confidence && <span style={{ marginLeft: 8, fontSize: "var(--font-size-xs)", color: "var(--color-muted)" }}>신뢰도 {Math.round(doc.ai_confidence * 100)}%</span>}
              </span>
            </div>
            <div className="doc-detail__info-row">
              <span className="doc-detail__info-label">업로드일</span>
              <span className="doc-detail__info-value">{formatDate(doc.created_at)}</span>
            </div>
          </div>

          {docTags.length > 0 && (
            <div className="doc-detail__tags">
              <p className="doc-detail__info-label">태그</p>
              <div className="doc-detail__tag-list">
                {docTags.map((t) => (
                  <span key={t.tag_id} className="doc-detail__tag">{t.name}</span>
                ))}
              </div>
            </div>
          )}

          {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 && (
            <div className="doc-detail__extracted">
              <p className="doc-detail__section-title">AI 추출 정보</p>
              <div className="doc-detail__extracted-grid">
                {Object.entries(doc.extracted_data).map(([k, v]) => (
                  <div key={k} className="doc-detail__extracted-row">
                    <span className="doc-detail__info-label">{k}</span>
                    <span className="doc-detail__info-value">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="doc-detail__alerts">
            <div className="doc-detail__alerts-header">
              <p className="doc-detail__section-title">알림 설정</p>
              <button className="doc-detail__add-alert" onClick={() => setAlertOpen(true)}>
                <Plus size={14} /> 알림 추가
              </button>
            </div>
            {alerts.length === 0 ? (
              <p className="doc-detail__no-alert">설정된 알림이 없습니다.</p>
            ) : (
              alerts.map((a) => (
                <div key={a.alert_id} className="doc-detail__alert-item">
                  <span>{a.notify_date}</span>
                  <span className="doc-detail__alert-reason">{a.reason}</span>
                  <Badge variant={a.is_sent ? "success" : "default"}>{a.is_sent ? "발송됨" : "대기"}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AlertSettingModal isOpen={alertOpen} onClose={() => setAlertOpen(false)} documentId={doc.document_id} />
      <CategoryEditModal isOpen={categoryOpen} onClose={() => setCategoryOpen(false)} currentCategoryId={doc.category_id} />
    </div>
  );
};

export default DocumentDetail;
