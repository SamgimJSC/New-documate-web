import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Download,
  Edit3,
  LockKeyhole,
  Maximize2,
  Plus,
  Save,
  ShieldCheck,
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
import type { DocumentAlert, DocumentTagItem } from "../../types/document";
import { useCategories } from "../../hooks/useCategories";
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

type PinAction = "view" | "enable" | "disable";

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

type ExtractedFieldConfig = {
  key: string;
  label: string;
  aliases: string[];
  wide?: boolean;
};

const EXTRACTED_FIELD_CONFIG: Record<string, ExtractedFieldConfig[]> = {
  contract: [
    { key: "계약일", label: "계약일", aliases: ["계약일", "contract_date", "contractDate", "date"] },
    { key: "만료일", label: "만료일", aliases: ["만료일", "expiry_date", "expiryDate", "expiration_date"] },
    { key: "갱신일", label: "갱신일", aliases: ["갱신일", "renewal_date", "renewalDate", "renew_date"] },
    { key: "계약자", label: "계약자", aliases: ["계약자", "contractor", "contractor_name", "party_name"] },
    { key: "발행처", label: "발행처 / 거래처", aliases: ["발행처", "거래처", "issuer"] },
    { key: "금액", label: "계약 금액", aliases: ["금액", "계약금액", "amount", "total_amount", "price"] },
    { key: "메모", label: "메모", aliases: ["메모", "memo", "note"], wide: true },
  ],
  receipt: [
    { key: "날짜", label: "날짜", aliases: ["날짜", "결제일", "date", "payment_date", "purchase_date"] },
    { key: "가게명", label: "가게명", aliases: ["가게명", "가맹점", "상호명", "발행처", "store_name", "merchant_name"] },
    { key: "금액", label: "금액", aliases: ["금액", "총액", "합계", "amount", "total_amount", "price"] },
    { key: "품목", label: "품목", aliases: ["품목", "상품명", "items", "item_name", "product_name"], wide: true },
    { key: "메모", label: "메모", aliases: ["메모", "memo", "note"], wide: true },
  ],
  medical: [
    { key: "병원명", label: "병원명", aliases: ["병원명", "약국명", "기관명", "발행처", "hospital_name", "pharmacy_name", "medical_institution", "hospital", "clinic_name"] },
    { key: "진료일", label: "진료일", aliases: ["진료일", "처방일", "date", "visit_date", "treatment_date", "issue_date", "prescription_date"] },
    { key: "금액", label: "금액", aliases: ["금액", "진료비", "결제금액", "amount", "total_amount", "payment_amount", "total_price"] },
    { key: "약품명", label: "약품명 / 진료 내용", aliases: ["약품명", "약명", "처방약", "약품명 / 진료 내용", "medicine_name", "drug_name", "medication", "drug_code", "prescription_number"], wide: true },
    { key: "메모", label: "메모", aliases: ["메모", "memo", "note"], wide: true },
  ],
  warranty: [
    { key: "제품명", label: "제품명", aliases: ["제품명", "품목", "상품명", "product_name", "item_name", "model_name"], wide: true },
    { key: "구매일", label: "구매일", aliases: ["구매일", "구입일", "purchase_date", "buy_date", "date"] },
    { key: "보증기간", label: "보증기간", aliases: ["보증기간", "보증 기간", "warranty_period", "guarantee_period"], wide: true },
    { key: "수리일", label: "수리일", aliases: ["수리일", "A/S일", "AS일", "repair_date", "service_date"] },
    { key: "발행처", label: "구매처 / 서비스센터", aliases: ["발행처", "구매처", "서비스센터", "issuer"] },
    { key: "메모", label: "메모", aliases: ["메모", "memo", "note"], wide: true },
  ],
  etc: [
    { key: "제목", label: "제목", aliases: ["제목", "title", "name"], wide: true },
    { key: "발행처", label: "발행처", aliases: ["발행처", "issuer"] },
    { key: "업로드일", label: "업로드일", aliases: ["업로드일", "upload_date", "created_at", "createdAt"] },
    { key: "메모", label: "메모", aliases: ["메모", "memo", "note"], wide: true },
  ],
};

const getCategoryExtractKey = (categoryName?: string) => {
  if (categoryName === "계약서") return "contract";
  if (categoryName === "영수증") return "receipt";
  if (categoryName === "병원/약국") return "medical";
  if (categoryName === "보증서/A·S" || categoryName === "보증서/A/S") return "warranty";
  return "etc";
};

const getExtractedFields = (categoryName?: string) =>
  EXTRACTED_FIELD_CONFIG[getCategoryExtractKey(categoryName)];

const getExtractedValue = (
  data: Record<string, string>,
  field: ExtractedFieldConfig,
) => {
  const matchedKey = field.aliases.find((alias) => data[alias]?.trim());

  return matchedKey ? data[matchedKey] : "";
};

const getEmptyExtractedData = (
  categoryName?: string,
): Record<string, string> =>
  Object.fromEntries(
    getExtractedFields(categoryName).map((field) => [field.key, ""]),
  );

const rebuildExtractedDataByCategory = (
  categoryName: string | undefined,
  data: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    getExtractedFields(categoryName).map((field) => [
      field.key,
      getExtractedValue(data, field),
    ]),
  );

const getDocumentLockedFromServer = (document: Document | null) => {
  if (!document) return false;

  return (
    document.is_locked === true ||
    document.locked === true ||
    document.cabinet_locked === true ||
    document.is_locked === "Y" ||
    document.cabinet_locked === "Y" ||
    document.lock_status === "LOCKED"
  );
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
  const [isProtected, setIsProtected] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinAction, setPinAction] = useState<PinAction>("view");
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

  useEffect(() => {
    if (!doc) return;

    const protectedByServer = getDocumentLockedFromServer(doc);
    const protectedLocally = documentService.isDocumentLocallyProtected(
      doc.document_id,
    );

    setIsProtected(protectedByServer || protectedLocally);
    setPinUnlocked(false);
    setPinOpen(false);
    setPinAction("view");
    setIsEditing(false);
  }, [doc?.document_id]);

  const initialCategory = useMemo(() => {
    if (!doc) return undefined;

    return categories.find(
      (category) => category.category_id === doc.category_id,
    );
  }, [doc, categories]);

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
    if (!doc) return;

    const title = doc.title || "문서 상세";
    sessionStorage.setItem("documate:header:documentTitle", title);
    window.dispatchEvent(
      new CustomEvent("documate:document-title-change", {
        detail: {
          pathname: window.location.pathname,
          title,
        },
      }),
    );
  }, [doc?.document_id, doc?.title]);

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

  const fileSizeText = formatFileSize(doc.file_size_bytes);
  const docFiles = doc.document_files ?? [];
  const previewUrl = docFiles.length > 0
    ? docFiles[selectedPage]?.file_url ?? docFiles[0].file_url
    : (doc.file_url ?? "").trim();
  const hasPreviewFile = previewUrl.length > 0;
  const previewPageCount =
    docFiles.length > 0
      ? docFiles.length
      : hasPreviewFile
        ? Math.max(1, doc.page_count ?? 1)
        : 0;
  const isContentLocked = isProtected && !pinUnlocked;

  const openPinModal = (action: PinAction) => {
    setPinAction(action);
    setPinOpen(true);
  };

  const handlePinVerified = () => {
    if (pinAction === "view") {
      setPinUnlocked(true);
      showToast("문서 잠금이 해제되었습니다.", "success");
      return;
    }

    if (pinAction === "enable") {
      documentService.setDocumentLocallyProtected(doc.document_id, true);
      setIsProtected(true);
      setPinUnlocked(false);
      setIsEditing(false);
      showToast("문서가 캐비닛 PIN으로 보호됩니다.", "success");
      return;
    }

    documentService.setDocumentLocallyProtected(doc.document_id, false);
    setIsProtected(false);
    setPinUnlocked(false);
    setIsEditing(false);
    showToast("문서 PIN 보호가 해제되었습니다.", "success");
  };

  const handleProtectionToggle = () => {
    openPinModal(isProtected ? "disable" : "enable");
  };

  const handleFavorite = async () => {
    if (!document_id) return;
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      await documentService.toggleFavorite(document_id, next);
      showToast(
        next ? "즐겨찾기에 추가되었습니다." : "즐겨찾기가 해제되었습니다.",
        "success",
      );
    } catch {
      setIsFavorite(!next);
      showToast("즐겨찾기 변경에 실패했습니다.", "error");
    }
  };

  const handleAddTag = async () => {
    if (!document_id || isContentLocked) return;
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
    if (!document_id || isContentLocked) return;
    setTags((prev) => prev.filter((t) => t.tag_id !== tagId));
    try {
      await documentService.removeTag(document_id, tagId);
    } catch {
      showToast("태그 삭제에 실패했습니다.", "error");
      documentService
        .getDocument(document_id)
        .then((d) => setTags(d.tags))
        .catch(() => {});
    }
  };

  const handleDelete = async () => {
    if (!document_id || isContentLocked) return;
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
    if (!document_id || isContentLocked) return;
    try {
      await documentService.deleteAlert(document_id, alertId);
      setAlerts([]);
    } catch {
      showToast("알림 삭제에 실패했습니다.", "error");
    }
  };

  const handleDownload = async () => {
    if (isContentLocked) return;
    try {
      await documentService.downloadAsPdf(doc.document_id, doc.title);
    } catch {
      showToast("PDF 다운로드에 실패했습니다.", "error");
    }
  };

  const handleEditStart = () => {
    if (isContentLocked) {
      openPinModal("view");
      return;
    }

    setForm(initialForm);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setForm(initialForm);
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!document_id || isContentLocked) return;
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

  const handleCategoryChange = (categoryId: number) => {
    const nextCategory = categories.find(
      (category) => category.category_id === categoryId,
    );

    setForm((prev) => ({
      ...prev,
      categoryId,
      extractedData: rebuildExtractedDataByCategory(
        nextCategory?.name,
        prev.extractedData,
      ),
    }));
  };

  const renderProtectionCard = (compact = false) => (
    <section
      className={`doc-detail__protection-card${
        isProtected ? " is-protected" : ""
      }${compact ? " doc-detail__protection-card--compact" : ""}`}
    >
      <div className="doc-detail__protection-head">
        <div>
          <span className="doc-detail__section-title">문서 보호</span>
          <p>
            {isProtected
              ? "이 문서는 디지털 캐비닛 PIN으로 보호되고 있습니다."
              : "민감한 문서는 PIN 확인 후 열람하도록 설정할 수 있어요."}
          </p>
        </div>
        <span className="doc-detail__protection-icon">
          <LockKeyhole size={20} />
        </span>
      </div>

      <div className="doc-detail__protection-toggle-row">
        <div>
          <strong>PIN 보호 사용</strong>
          <span>{isProtected ? "보호 중" : "공개 상태"}</span>
        </div>

        <button
          type="button"
          className={`doc-detail__toggle${isProtected ? " is-on" : ""}`}
          aria-pressed={isProtected}
          onClick={handleProtectionToggle}
        >
          <span />
        </button>
      </div>

      {isProtected && !pinUnlocked && (
        <button
          type="button"
          className="doc-detail__unlock-button doc-detail__unlock-button--wide"
          onClick={() => openPinModal("view")}
        >
          <LockKeyhole size={15} />
          PIN 입력하고 보기
        </button>
      )}

      {isProtected && pinUnlocked && (
        <p className="doc-detail__protection-safe">
          <ShieldCheck size={14} />
          이번 열람 세션에서만 문서 내용을 표시하고 있어요.
        </p>
      )}
    </section>
  );

  const renderBasicInfo = (lockedMode = false) => (
    <section className="doc-detail__form-section">
      <div className="doc-detail__section-title">기본 정보</div>

      <div className="doc-detail__field-grid doc-detail__field-grid--basic">
        <label className="doc-detail__field doc-detail__field--wide">
          <span>문서명</span>
          {isEditing && !lockedMode ? (
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
            <b>
              {form.title}
              {isProtected && (
                <em className="doc-detail__inline-lock">
                  <LockKeyhole size={11} />
                  보호
                </em>
              )}
            </b>
          )}
        </label>

        {!lockedMode && (
          <label className="doc-detail__field doc-detail__field--wide doc-detail__field--category-select">
            <span>문서 유형</span>
            {isEditing ? (
              <>
                <div className="doc-detail__select-wrap">
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      handleCategoryChange(Number(event.target.value))
                    }
                    aria-label="문서 유형 선택"
                  >
                    {categories.map((category) => (
                      <option
                        key={category.category_id}
                        value={category.category_id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="doc-detail__field-note">
                  문서 유형을 변경하면 AI 추출 정보 항목이 해당 유형 기준으로
                  재구성됩니다.
                </p>
              </>
            ) : (
              <b>{activeCategory?.name ?? "-"}</b>
            )}
          </label>
        )}

        <label className="doc-detail__field">
          <span>파일 형식</span>
          <b>
            {doc.file_type} · {fileSizeText}
            {doc.page_count ? ` · ${doc.page_count}p` : ""}
          </b>
        </label>

        {!lockedMode && !doc?.is_confirmed && (
          <>
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
          </>
        )}
      </div>
    </section>
  );

  const pinTitle =
    pinAction === "enable"
      ? "문서 보호 설정"
      : pinAction === "disable"
        ? "문서 보호 해제"
        : "캐비닛 PIN 입력";

  const pinDescription =
    pinAction === "enable"
      ? "PIN 확인 후 이 문서를 보호 상태로 전환합니다."
      : pinAction === "disable"
        ? "PIN 확인 후 이 문서의 보호 설정을 해제합니다."
        : "이 문서는 캐비닛 PIN으로 보호되고 있습니다.";

  const pinSubmitLabel =
    pinAction === "enable"
      ? "보호 설정"
      : pinAction === "disable"
        ? "보호 해제"
        : "문서 열기";

  return (
    <section className="doc-detail">
      <div className="doc-detail__hero">

        <div className="doc-detail__hero-row">
          <div>
            <p className="doc-detail__eyebrow">문서 상세</p>
            <h1>
              {isEditing ? form.title || "문서명 입력" : form.title}
              {isProtected && (
                <span className="doc-detail__lock-badge">
                  <LockKeyhole size={13} />
                  보호 중
                </span>
              )}
            </h1>
            <p className="doc-detail__hero-meta">
              업로드일 {formatDate(doc.created_at)} · AI 상태 {doc.ai_status}
            </p>
          </div>

        </div>
      </div>

      <div className="doc-detail__editor-layout">
        <article
          className={`doc-detail__viewer-card${
            isContentLocked ? " doc-detail__viewer-card--protected" : ""
          }`}
        >
          <header className="doc-detail__viewer-header">
            <div>
              <h2>{getPreviewTitle(activeCategory?.name)}</h2>
              <p>
                {isContentLocked
                  ? "PIN 입력 후 문서를 확인할 수 있어요."
                  : `${doc.file_name} · ${doc.file_type} · ${fileSizeText}`}
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
                disabled={!hasPreviewFile || isContentLocked}
              >
                <ZoomOut size={15} />
              </button>
              <span>{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(prev + 10, 150))}
                aria-label="확대"
                disabled={!hasPreviewFile || isContentLocked}
              >
                <ZoomIn size={15} />
              </button>
              <div className="doc-detail__viewer-tools-divider" />
              <button
                type="button"
                className="doc-detail__viewer-download-btn"
                onClick={handleDownload}
                disabled={!hasPreviewFile || isContentLocked}
                aria-label="다운로드"
              >
                <Download size={14} /> 다운로드
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                disabled={!hasPreviewFile || isContentLocked}
                aria-label="전체화면"
              >
                <Maximize2 size={15} />
              </button>
            </div>
          </header>

          <div
            className={`doc-detail__viewer-body${
              !isContentLocked && previewPageCount > 1
                ? " doc-detail__viewer-body--paged"
                : ""
            }`}
          >
            {!isContentLocked && previewPageCount > 1 && (
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
              {isContentLocked ? (
                <div className="doc-detail__protected-gate">
                  <span className="doc-detail__protected-icon">
                    <LockKeyhole size={34} />
                  </span>
                  <strong>보호된 문서입니다</strong>
                  <p>
                    이 문서는 디지털 캐비닛 PIN으로 보호되고 있습니다.
                    <br />
                    PIN 입력 후 문서를 확인할 수 있어요.
                  </p>
                  <button
                    type="button"
                    className="doc-detail__unlock-button"
                    onClick={() => openPinModal("view")}
                  >
                    <LockKeyhole size={16} />
                    PIN 입력하기
                  </button>
                  <small>
                    <ShieldCheck size={14} />
                    안전한 보안을 위해 PIN은 화면에 표시되지 않습니다.
                  </small>
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

            <div className="doc-detail__mini-actions doc-detail__panel-actions">
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
          </header>

          {isContentLocked ? (
            <>
              {renderBasicInfo(true)}
              {renderProtectionCard(true)}
            </>
          ) : (
            <>
              {renderBasicInfo(false)}

              <section className="doc-detail__form-section">
                <div className="doc-detail__section-title">
                  {doc?.is_confirmed ? "수기 입력 정보" : "AI 추출 정보"}
                </div>
                {isEditing && (
                  <p className="doc-detail__ai-note">
                    {activeCategory?.name ?? "선택한 문서 유형"} 기준으로 입력
                    항목을 정리합니다.
                  </p>
                )}

                <div className="doc-detail__field-grid doc-detail__field-grid--ai">
                  {getExtractedFields(activeCategory?.name).map((field) => {
                    const value = getExtractedValue(form.extractedData, field);

                    return (
                      <label
                        key={field.key}
                        className={`doc-detail__field${
                          field.wide ? " doc-detail__field--wide" : ""
                        }`}
                      >
                        <span>{field.label}</span>
                        {isEditing ? (
                          <input
                            value={value}
                            onChange={(event) =>
                              handleExtractedChange(
                                field.key,
                                event.target.value,
                              )
                            }
                          />
                        ) : (
                          <b>{value || "-"}</b>
                        )}
                      </label>
                    );
                  })}
                </div>
              </section>

              {renderProtectionCard(false)}

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
                          <div
                            style={{
                              display: "flex",
                              gap: 4,
                              flexShrink: 0,
                            }}
                          >
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
                              style={{
                                fontSize: "var(--font-size-xs)",
                                color: "var(--color-danger, #ef4444)",
                              }}
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
                    <p className="doc-detail__empty-text">
                      등록된 태그가 없습니다.
                    </p>
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

      {isFullscreen && !isContentLocked && (
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
        isOpen={pinOpen}
        onClose={() => setPinOpen(false)}
        onVerified={handlePinVerified}
        title={pinTitle}
        description={pinDescription}
        submitLabel={pinSubmitLabel}
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
