import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  Edit3,
  Plus,
  Save,
  Share2,
  Star,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import AlertSettingModal from "../../components/modal/AlertSettingModal";
import CategoryEditModal from "../../components/modal/CategoryEditModal";
import { documentService } from "../../services/documentService";
import {
  mockDocuments,
  mockDocumentCategories,
  mockDocumentTags,
  mockTags,
  mockDocumentAlerts,
} from "../../data/mockDocuments";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import type { Document } from "../../types/document";
import type { AiStatus } from "../../types/common";
import "./DocumentDetail.css";

const AI_STATUS_VARIANT: Record<
  AiStatus,
  "default" | "warning" | "success" | "danger"
> = {
  PENDING: "default",
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

type EditableDocumentState = {
  title: string;
  categoryId: number;
  issueDate: string;
  expiryDate: string;
  renewalDate: string;
  extractedData: Record<string, string>;
  tagsText: string;
};

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }

  return `${Math.round(bytes / 1024)}KB`;
};

const getPreviewTitle = (categoryName?: string) => {
  if (categoryName === "계약서") return "계약서 미리보기";
  if (categoryName === "영수증") return "영수증 미리보기";
  if (categoryName === "병원/약국") return "의료 문서 미리보기";
  if (categoryName === "보증서/A·S") return "보증/A·S 문서 미리보기";
  return "문서 미리보기";
};

const getEmptyExtractedData = (
  categoryName?: string,
): Record<string, string> => {
  switch (categoryName) {
    case "계약서":
      return {
        계약일: "",
        만료일: "",
        계약자: "",
        금액: "",
      };
    case "영수증":
      return {
        날짜: "",
        가맹점: "",
        금액: "",
        품목: "",
      };
    case "병원/약국":
      return {
        병원명: "",
        진료일: "",
        금액: "",
        약품명: "",
      };
    case "보증서/A·S":
      return {
        제품명: "",
        구입일: "",
        보증기간: "",
        수리일: "",
      };
    default:
      return {
        제목: "",
        업로드일: "",
      };
  }
};

const DocumentDetail: React.FC = () => {
  const { document_id } = useParams<{ document_id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  // const [alertOpen, setAlertOpen] = useState(false);
  // const [categoryOpen, setCategoryOpen] = useState(false);
  // const [isFavorite, setIsFavorite] = useState(false);
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document_id) return;
    documentService
      .getDocument(document_id)
      .then((d) => {
        setDoc(d);
        setIsFavorite(d.is_favorite);
      })
      .catch(() => setDoc(null))
      .finally(() => setLoading(false));
  }, [document_id]);

  if (loading) {
    return (
      <div
        style={{
          padding: 48,
          textAlign: "center",
          color: "var(--color-muted)",
        }}
      >
        문서를 불러오는 중...
      </div>
    );
  }

  const initialCategory = doc
    ? mockDocumentCategories.find((c) => c.category_id === doc.category_id)
    : undefined;

  const docTagIds = doc
    ? mockDocumentTags
        .filter((dt) => dt.document_id === doc.document_id)
        .map((dt) => dt.tag_id)
    : [];
  const docTags = mockTags.filter((t) => docTagIds.includes(t.tag_id));
  const alerts = doc
    ? mockDocumentAlerts.filter((a) => a.document_id === doc.document_id)
    : [];

  const [alertOpen, setAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(doc?.is_favorite ?? false);
  const [zoom, setZoom] = useState(100);

  const initialForm = useMemo<EditableDocumentState>(() => {
    if (!doc) {
      return {
        title: "",
        categoryId: 1,
        issueDate: "",
        expiryDate: "",
        renewalDate: "",
        extractedData: {},
        tagsText: "",
      };
    }

    const extracted = doc.extracted_data
      ? Object.fromEntries(
          Object.entries(doc.extracted_data).map(([key, value]) => [
            key,
            String(value ?? ""),
          ]),
        )
      : getEmptyExtractedData(initialCategory?.name);

    return {
      title: doc.title,
      categoryId: doc.category_id,
      issueDate: doc.issue_date ?? "",
      expiryDate: doc.expiry_date ?? "",
      renewalDate: doc.renewal_date ?? "",
      extractedData: extracted,
      tagsText: docTags.map((tag) => tag.name).join(", "),
    };
  }, [doc, docTags, initialCategory?.name]);

  const [form, setForm] = useState<EditableDocumentState>(initialForm);
  const activeCategory =
    mockDocumentCategories.find((c) => c.category_id === form.categoryId) ??
    initialCategory;

  if (!doc) {
    return (
      <div className="doc-detail doc-detail--empty">
        <p>문서를 찾을 수 없습니다.</p>
        <Button
          variant="primary"
          onClick={() => navigate("/documents")}
          size="sm"
        >
          목록으로
        </Button>
      </div>
    );
  }

  const handleFavorite = () => {
    setIsFavorite((prev) => {
      showToast(
        prev ? "즐겨찾기가 해제되었습니다." : "즐겨찾기에 추가되었습니다.",
        "success",
      );
      return !prev;
    });
  };

  const handleDelete = () => {
    showToast("문서가 삭제되었습니다.", "info");
    navigate("/documents");
  };

  const handleShare = () => {
    showToast("공유 기능은 준비 중입니다.", "info");
  };

  const handleDownload = () => {
    showToast("다운로드 기능은 준비 중입니다.", "info");
  };

  const handleEditStart = () => {
    setForm(initialForm);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    showToast("문서 정보가 수정되었습니다.", "success");
  };

  const handleCategoryChange = (categoryId: number) => {
    const nextCategory = mockDocumentCategories.find(
      (category) => category.category_id === categoryId,
    );

    setForm((prev) => ({
      ...prev,
      categoryId,
      extractedData:
        Object.keys(prev.extractedData).length > 0
          ? prev.extractedData
          : getEmptyExtractedData(nextCategory?.name),
    }));
  };

  const handleExtractedChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      extractedData: {
        ...prev.extractedData,
        [key]: value,
      },
    }));
  };

  const fileSizeText = formatFileSize(doc.file_size_bytes);
  const statusConfidence =
    typeof doc.ai_confidence === "number"
      ? `신뢰도 ${Math.round(doc.ai_confidence * 100)}%`
      : "신뢰도 확인 중";
  const tagNames = form.tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const previewUrl = (doc.file_url ?? "").trim();
  const hasPreviewFile = previewUrl.length > 0;
  const previewPageCount = hasPreviewFile
    ? Math.max(1, doc.page_count ?? 1)
    : 0;

  return (
    <section className="doc-detail">
      <div className="doc-detail__hero">
        <button
          type="button"
          className="doc-detail__back"
          onClick={() => navigate("/documents")}
        >
          <ArrowLeft size={16} /> 전체 문서
        </button>

        <div className="doc-detail__hero-row">
          <div>
            <p className="doc-detail__eyebrow">문서 상세</p>
            <h1>{isEditing ? form.title || "문서명 입력" : form.title}</h1>
            <p className="doc-detail__hero-meta">
              업로드일 {formatDate(doc.created_at)} · AI 상태 {doc.ai_status}
            </p>
          </div>

          {!isEditing ? (
            <button
              type="button"
              className="doc-detail__edit-primary"
              onClick={handleEditStart}
            >
              <Edit3 size={16} /> 수정
            </button>
          ) : (
            <div className="doc-detail__edit-actions">
              <button
                type="button"
                className="doc-detail__button doc-detail__button--ghost"
                onClick={handleEditCancel}
              >
                <X size={15} /> 취소
              </button>
              <button
                type="button"
                className="doc-detail__button doc-detail__button--primary"
                onClick={handleEditSave}
              >
                <Save size={15} /> 저장
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="doc-detail__layout">
        <article className="doc-detail__viewer-card">
          <header className="doc-detail__viewer-header">
            <div>
              <h2>{getPreviewTitle(activeCategory?.name)}</h2>
              <p>
                {doc.file_name} · {doc.file_type} · {fileSizeText}
              </p>
            </div>

            {hasPreviewFile && (
              <div
                className="doc-detail__viewer-tools"
                aria-label="문서 미리보기 도구"
              >
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.max(prev - 10, 70))}
                  aria-label="축소"
                >
                  <ZoomOut size={16} />
                </button>
                <span>{zoom}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((prev) => Math.min(prev + 10, 150))}
                  aria-label="확대"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label="다운로드"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </header>

          <div
            className={`doc-detail__viewer-body${
              previewPageCount > 1 ? " doc-detail__viewer-body--paged" : ""
            }`}
          >
            {previewPageCount > 1 && (
              <aside className="doc-detail__page-strip">
                {Array.from({ length: previewPageCount }).map((_, index) => (
                  <button
                    type="button"
                    key={index + 1}
                    className={index === 0 ? "is-active" : ""}
                  >
                    <span>
                      <i />
                      <i />
                      <i />
                    </span>
                    <b>{index + 1}</b>
                  </button>
                ))}
              </aside>
            )}

            <div className="doc-detail__document-canvas">
              {hasPreviewFile ? (
                <img
                  className="doc-detail__preview-image"
                  src={previewUrl}
                  alt={form.title || doc.title}
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              ) : (
                <div
                  className="doc-detail__preview-empty"
                  aria-label="문서 이미지 미리보기 영역"
                />
              )}
            </div>
          </div>
        </article>

        <aside className="doc-detail__info-column">
          <article className="doc-detail__panel doc-detail__panel--info">
            <header className="doc-detail__panel-header">
              <div>
                <h2>문서 정보</h2>
                <p>기본 정보와 분류 기준을 확인합니다.</p>
              </div>
              <div className="doc-detail__mini-actions">
                <button
                  type="button"
                  className={isFavorite ? "is-active" : ""}
                  onClick={handleFavorite}
                  title="즐겨찾기"
                >
                  <Star size={17} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button type="button" onClick={handleShare} title="공유">
                  <Share2 size={17} />
                </button>
              </div>
            </header>

            <div className="doc-detail__form-grid">
              <label>
                <span>문서명</span>
                {isEditing ? (
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <b>{form.title}</b>
                )}
              </label>

              <label>
                <span>카테고리</span>
                {isEditing ? (
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      handleCategoryChange(Number(event.target.value))
                    }
                  >
                    {mockDocumentCategories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <b>{activeCategory?.name ?? "-"}</b>
                )}
              </label>

              <label>
                <span>파일</span>
                <b>
                  {doc.file_type} · {fileSizeText}
                  {doc.page_count ? ` · ${doc.page_count}페이지` : ""}
                </b>
              </label>

              <label>
                <span>발급일</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        issueDate: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <b>{form.issueDate || "-"}</b>
                )}
              </label>

              <label>
                <span>만료일</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        expiryDate: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <b>{form.expiryDate || "-"}</b>
                )}
              </label>

              <label>
                <span>갱신일</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={form.renewalDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        renewalDate: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <b>{form.renewalDate || "-"}</b>
                )}
              </label>

              <label>
                <span>AI 상태</span>
                <b className="doc-detail__status-line">
                  <Badge variant={AI_STATUS_VARIANT[doc.ai_status]}>
                    {doc.ai_status}
                  </Badge>
                  <em>{statusConfidence}</em>
                </b>
              </label>
            </div>
          </article>
        </aside>

        <aside className="doc-detail__info-column doc-detail__info-column--stack">
          <article className="doc-detail__panel doc-detail__panel--extract">
            <header className="doc-detail__section-header">
              <div>
                <h2>AI 추출 정보</h2>
                <p>실제 내용과 다르면 수정해 주세요.</p>
              </div>
            </header>

            <div className="doc-detail__extract-list">
              {Object.entries(form.extractedData).map(([key, value]) => (
                <label key={key}>
                  <span>{key}</span>
                  {isEditing ? (
                    <input
                      value={value}
                      onChange={(event) =>
                        handleExtractedChange(key, event.target.value)
                      }
                    />
                  ) : (
                    <b>{value || "-"}</b>
                  )}
                </label>
              ))}
            </div>
          </article>

          <article className="doc-detail__panel doc-detail__panel--manage">
            <header className="doc-detail__section-header doc-detail__section-header--row">
              <div>
                <h2>관리</h2>
                <p>알림과 태그를 간단히 확인합니다.</p>
              </div>
              <button
                type="button"
                className="doc-detail__text-button"
                onClick={() => setAlertOpen(true)}
              >
                <Plus size={14} /> 알림 추가
              </button>
            </header>

            <div className="doc-detail__manage-block">
              <div className="doc-detail__manage-label">알림 설정</div>
              {alerts.length === 0 ? (
                <p className="doc-detail__empty-text">
                  설정된 알림이 없습니다.
                </p>
              ) : (
                <div className="doc-detail__alert-list">
                  {alerts.map((alert) => (
                    <div
                      key={alert.alert_id}
                      className="doc-detail__alert-item"
                    >
                      <Calendar size={15} />
                      <div>
                        <b>{alert.notify_date}</b>
                        <span>{alert.reason}</span>
                      </div>
                      <Badge variant={alert.is_sent ? "success" : "default"}>
                        {alert.is_sent ? "발송됨" : "대기"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="doc-detail__manage-block">
              <div className="doc-detail__manage-label">태그</div>
              {isEditing ? (
                <input
                  className="doc-detail__tag-input"
                  value={form.tagsText}
                  placeholder="예: 계약서, 중요, 병원/약국"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tagsText: event.target.value,
                    }))
                  }
                />
              ) : tagNames.length > 0 ? (
                <div className="doc-detail__tag-list">
                  {tagNames.map((tag) => (
                    <span key={tag} className="doc-detail__tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="doc-detail__empty-text">
                  등록된 태그가 없습니다.
                </p>
              )}
            </div>

            <button
              type="button"
              className="doc-detail__delete-button"
              onClick={handleDelete}
            >
              <Trash2 size={16} /> 문서 삭제
            </button>
          </article>
        </aside>
      </div>

      <AlertSettingModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        documentId={doc.document_id}
      />
    </section>
  );
};

export default DocumentDetail;
