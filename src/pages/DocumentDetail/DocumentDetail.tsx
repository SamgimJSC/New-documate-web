import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Download,
  LockKeyhole,
  Edit3,
  Maximize2,
  Plus,
  Save,
  Star,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Button from "../../components/common/Button";
import AlertSettingModal from "../../components/modal/AlertSettingModal";
import PinVerifyModal from "../../components/modal/PinVerifyModal";
import { documentService } from "../../services/documentService";
import type { DocumentAlert } from "../../types/document";
import { useCategories } from "../../hooks/useCategories";
import type { DocumentTagItem } from "../../types/document";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import type { Document } from "../../types/document";
import "./DocumentDetail.css";

type EditableDocumentState = {
  title: string;
  categoryId: number;
  issueDate: string;
  expiryDate: string;
  renewalDate: string;
  extractedData: Record<string, string>;
};


type LockableDocument = Document & {
  is_locked?: boolean | "Y" | "N";
  locked?: boolean;
  cabinet_locked?: boolean | "Y" | "N";
  lock_status?: "LOCKED" | "UNLOCKED" | string;
};

const getDocumentLocked = (document: Document | null) => {
  if (!document) return false;

  const lockable = document as LockableDocument;

  return (
    lockable.is_locked === true ||
    lockable.is_locked === "Y" ||
    lockable.locked === true ||
    lockable.cabinet_locked === true ||
    lockable.cabinet_locked === "Y" ||
    lockable.lock_status === "LOCKED"
  );
};

const EMPTY_FORM: EditableDocumentState = {
  title: "",
  categoryId: 1,
  issueDate: "",
  expiryDate: "",
  renewalDate: "",
  extractedData: {},
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

  const categories = useCategories();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alerts, setAlerts] = useState<DocumentAlert[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState<DocumentTagItem[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const [pinUnlockOpen, setPinUnlockOpen] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [form, setForm] = useState<EditableDocumentState>(EMPTY_FORM);

  useEffect(() => {
    if (!document_id) {
      setDoc(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      documentService.getDocument(document_id),
      documentService.getAlerts(document_id),
    ])
      .then(([d, a]) => {
        setDoc(d);
        setIsFavorite(d.is_favorite);
        setTags(d.tags);
        setAlerts(a);
      })
      .catch(() => {
        setDoc(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [document_id]);

  const initialCategory = useMemo(() => {
    if (!doc) return undefined;

    return categories.find(
      (category) => category.category_id === doc.category_id,
    );
  }, [doc]);

  const initialForm = useMemo<EditableDocumentState>(() => {
    if (!doc) {
      return EMPTY_FORM;
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
    };
  }, [doc, initialCategory?.name]);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    setPinUnlocked(false);
    setPinUnlockOpen(false);
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

  const activeCategory =
    categories.find(
      (category) => category.category_id === form.categoryId,
    ) ?? initialCategory;

  const handleFavorite = async () => {
    if (!document_id) return;
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      await documentService.toggleFavorite(document_id, next);
      showToast(next ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다.", "success");
    } catch {
      setIsFavorite(!next);
      showToast("즐겨찾기 변경에 실패했습니다.", "error");
    }
  };

  const handleAddTag = async () => {
    if (!document_id) return;
    const name = tagInput.trim();
    if (!name) return;
    try {
      const newTag = await documentService.addTag(document_id, name);
      setTags((prev) => [...prev, newTag]);
      setTagInput("");
    } catch {
      showToast("태그 추가에 실패했습니다.", "error");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    if (!document_id) return;
    setTags((prev) => prev.filter((t) => t.tag_id !== tagId));
    try {
      await documentService.removeTag(document_id, tagId);
    } catch {
      showToast("태그 삭제에 실패했습니다.", "error");
      documentService.getDocument(document_id).then((d) => setTags(d.tags)).catch(() => {});
    }
  };

  const handleDelete = async () => {
    if (!document_id) return;
    try {
      await documentService.deleteDocument(document_id);
      showToast("문서가 삭제되었습니다.", "info");
      navigate("/documents");
    } catch {
      showToast("문서 삭제에 실패했습니다.", "error");
    }
  };

  const handleAlertSaved = (saved: DocumentAlert) => {
    setAlerts([saved]);
  };

  const handleAlertDelete = async (alertId: string) => {
    if (!document_id) return;
    try {
      await documentService.deleteAlert(document_id, alertId);
      setAlerts([]);
    } catch {
      showToast("알림 삭제에 실패했습니다.", "error");
    }
  };

  const handleDownload = async () => {
    try {
      await documentService.downloadAsPdf(doc.document_id, doc.title);
    } catch {
      showToast("PDF 다운로드에 실패했습니다.", "error");
    }
  };

  const handleEditStart = () => {
    setForm(initialForm);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!document_id) return;
    try {
      const updated = await documentService.updateDocument(document_id, {
        title: form.title,
        categoryId: form.categoryId,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate || undefined,
        renewalDate: form.renewalDate || undefined,
        extractedData: form.extractedData,
      });
      setDoc(updated);
      setIsEditing(false);
      showToast("문서 정보가 수정되었습니다.", "success");
    } catch {
      showToast("수정에 실패했습니다.", "error");
    }
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

  const docFiles = doc.document_files ?? [];
  const previewUrl = docFiles.length > 0
    ? docFiles[selectedPage]?.file_url ?? docFiles[0].file_url
    : (doc.file_url ?? "").trim();
  const hasPreviewFile = previewUrl.length > 0;
  const previewPageCount = docFiles.length > 0 ? docFiles.length : hasPreviewFile ? Math.max(1, doc.page_count ?? 1) : 0;
  const isDocumentLocked = getDocumentLocked(doc);
  const shouldLockPreview = isDocumentLocked && !pinUnlocked;

  const handlePinVerified = () => {
    setPinUnlocked(true);
    showToast("문서 잠금이 해제되었습니다.", "success");
  };

  return (
    <section className="doc-detail">
      <div className="doc-detail__hero">
        <button
          type="button"
          className="doc-detail__back"
          onClick={() => navigate("/documents")}
        >
          <ArrowLeft size={15} /> 전체 문서
        </button>

        <div className="doc-detail__hero-row">
          <div>
            <p className="doc-detail__eyebrow">문서 상세</p>
            <h1>{isEditing ? form.title || "문서명 입력" : form.title}</h1>
            <p className="doc-detail__hero-meta">
              업로드일 {formatDate(doc.created_at)} · AI 상태 {doc.ai_status}
            </p>
          </div>

          <div className="doc-detail__mini-actions">
            {isDocumentLocked && (
              <button
                type="button"
                className="doc-detail__mini-lock"
                onClick={() => setPinUnlockOpen(true)}
                title={pinUnlocked ? "잠금 해제됨" : "PIN으로 잠금 해제"}
              >
                <LockKeyhole size={16} />
              </button>
            )}

            <button
              type="button"
              className={isFavorite ? "is-active" : ""}
              onClick={handleFavorite}
              title="즐겨찾기"
            >
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>

            {!isEditing ? (
              <button
                type="button"
                className="doc-detail__mini-edit"
                onClick={handleEditStart}
                title="수정"
              >
                <Edit3 size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="doc-detail__mini-cancel"
                  onClick={handleEditCancel}
                  title="취소"
                >
                  <X size={16} />
                </button>
                <button
                  type="button"
                  className="doc-detail__mini-save"
                  onClick={handleEditSave}
                  title="저장"
                >
                  <Save size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="doc-detail__editor-layout">
        <article className={`doc-detail__viewer-card${shouldLockPreview ? " doc-detail__viewer-card--locked" : ""}`}>
          <header className="doc-detail__viewer-header">
            <div>
              <h2>{getPreviewTitle(activeCategory?.name)}</h2>
              <p>
                {doc.file_name} · {doc.file_type} · {fileSizeText}
              </p>
            </div>

            <div
              className="doc-detail__viewer-tools"
              aria-label="문서 미리보기 도구"
            >
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(prev - 10, 70))}
                aria-label="축소"
                disabled={!hasPreviewFile || shouldLockPreview}
              >
                <ZoomOut size={15} />
              </button>
              <span>{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(prev + 10, 150))}
                aria-label="확대"
                disabled={!hasPreviewFile || shouldLockPreview}
              >
                <ZoomIn size={15} />
              </button>
              <div className="doc-detail__viewer-tools-divider" />
              <button
                type="button"
                className="doc-detail__viewer-download-btn"
                onClick={handleDownload}
                disabled={!hasPreviewFile || shouldLockPreview}
                aria-label="다운로드"
              >
                <Download size={14} /> 다운로드
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                disabled={!hasPreviewFile || shouldLockPreview}
                aria-label="전체화면"
              >
                <Maximize2 size={15} />
              </button>
            </div>
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
                    className={index === selectedPage ? "is-active" : ""}
                    onClick={() => setSelectedPage(index)}
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
              {shouldLockPreview ? (
                <div className="doc-detail__locked-view">
                  <span className="doc-detail__locked-icon">
                    <LockKeyhole size={28} />
                  </span>
                  <strong>잠긴 문서입니다</strong>
                  <p>문서 내용을 보려면 캐비닛 PIN을 입력해주세요.</p>
                  <button
                    type="button"
                    className="doc-detail__unlock-button"
                    onClick={() => setPinUnlockOpen(true)}
                  >
                    PIN 입력하고 열기
                  </button>
                </div>
              ) : hasPreviewFile ? (
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
                >
                  <span className="doc-detail__preview-dot" />
                  <span className="doc-detail__preview-mountain doc-detail__preview-mountain--left" />
                  <span className="doc-detail__preview-mountain doc-detail__preview-mountain--right" />
                  <b>{doc.file_name}</b>
                </div>
              )}
            </div>
          </div>
        </article>

        <aside className="doc-detail__editor-panel">
          <header className="doc-detail__panel-header">
            <h2>문서 정보</h2>
          </header>

          {shouldLockPreview ? (
            <div className="doc-detail__locked-side">
              <span className="doc-detail__locked-side-icon">
                <LockKeyhole size={22} />
              </span>
              <strong>보안 정보 보호 중</strong>
              <p>
                잠긴 문서의 상세 정보는 PIN 확인 후 표시됩니다. 현재는 프론트
                단계이므로 6자리 입력 시 해제 처리됩니다.
              </p>
              <button
                type="button"
                className="doc-detail__unlock-button doc-detail__unlock-button--side"
                onClick={() => setPinUnlockOpen(true)}
              >
                PIN 입력
              </button>
            </div>
          ) : (
            <>
          <section className="doc-detail__form-section">
            <div className="doc-detail__section-title">기본 정보</div>

            <div className="doc-detail__field-grid doc-detail__field-grid--basic">
              <label className="doc-detail__field doc-detail__field--wide">
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

              <label className="doc-detail__field">
                <span>파일 형식</span>
                <b>
                  {doc.file_type} · {fileSizeText}
                  {doc.page_count ? ` · ${doc.page_count}p` : ""}
                </b>
              </label>

              <label className="doc-detail__field">
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

              <label className="doc-detail__field">
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

              <label className="doc-detail__field">
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

            </div>
          </section>

          <section className="doc-detail__form-section">
            <div className="doc-detail__section-title">AI 추출 정보</div>

            <div className="doc-detail__field-grid">
              {Object.entries(form.extractedData).filter(([key]) => key !== "_meta").map(([key, value]) => (
                <label key={key} className="doc-detail__field">
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
          </section>

          <section className="doc-detail__form-section doc-detail__form-section--manage">
            <div className="doc-detail__manage-block">
              <div className="doc-detail__manage-block-header">
                <span>알림 설정</span>
                {alerts.length === 0 && (
                  <button
                    type="button"
                    className="doc-detail__text-button"
                    onClick={() => setAlertOpen(true)}
                  >
                    <Plus size={12} /> 알림 추가
                  </button>
                )}
              </div>

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
                      <div style={{ flex: 1 }}>
                        <b>{alert.notify_date.slice(0, 10)}</b>
                        {alert.reason && <span>{alert.reason}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        <button
                          type="button"
                          className="doc-detail__text-button"
                          onClick={() => setAlertOpen(true)}
                          style={{ fontSize: "var(--font-size-xs)" }}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="doc-detail__text-button"
                          onClick={() => handleAlertDelete(alert.alert_id)}
                          style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger, #ef4444)" }}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="doc-detail__manage-block">
              <div className="doc-detail__manage-block-header">
                <span>태그</span>
              </div>

              <div className="doc-detail__tag-input-row">
                <input
                  className="doc-detail__tag-input"
                  value={tagInput}
                  placeholder="태그 입력 후 Enter"
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  className="doc-detail__tag-add-btn"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  추가
                </button>
              </div>

              {tags.length > 0 ? (
                <div className="doc-detail__tag-list">
                  {tags.map((tag) => (
                    <span key={tag.tag_id} className="doc-detail__tag">
                      #{tag.name}
                      <button
                        type="button"
                        className="doc-detail__tag-remove"
                        onClick={() => handleRemoveTag(tag.tag_id)}
                        aria-label={`${tag.name} 태그 삭제`}
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="doc-detail__empty-text">등록된 태그가 없습니다.</p>
              )}
            </div>
          </section>

          {!isEditing && (
            <footer className="doc-detail__editor-footer">
              <button
                type="button"
                className="doc-detail__delete-button"
                onClick={handleDelete}
              >
                <Trash2 size={15} /> 문서 삭제
              </button>
            </footer>
          )}
            </>
          )}
        </aside>
      </div>

      {isFullscreen && !shouldLockPreview && (
        <div
          className="doc-detail__fullscreen-overlay"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            type="button"
            className="doc-detail__fullscreen-close"
            onClick={() => setIsFullscreen(false)}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
          <img
            src={previewUrl}
            alt={form.title || doc.title}
            className="doc-detail__fullscreen-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <PinVerifyModal
        isOpen={pinUnlockOpen}
        onClose={() => setPinUnlockOpen(false)}
        onVerified={handlePinVerified}
        title="문서 잠금 해제"
        description="이 문서는 캐비닛 PIN으로 보호되고 있습니다."
      />

      <AlertSettingModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        documentId={doc.document_id}
        existingAlert={alerts[0] ?? null}
        expiryDate={doc.expiry_date ?? null}
        onSaved={handleAlertSaved}
      />
    </section>
  );
};

export default DocumentDetail;
