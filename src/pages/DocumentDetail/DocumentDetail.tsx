import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BellRing,
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

const EXCLUDED_EXTRACTED_KEYS = new Set(["_meta"]);

type ExtractedFieldConfig = {
  key: string;
  label: string;
  aliases: string[];
};

const createExtractedField = (
  key: string,
  label: string,
  aliases: string[] = [],
): ExtractedFieldConfig => ({
  key,
  label,
  aliases: [key, label, ...aliases],
});

const CATEGORY_EXTRACTED_FIELDS: Record<string, ExtractedFieldConfig[]> = {
  계약서: [
    createExtractedField("contract_date", "계약일", ["contractDate", "Contract Date"]),
    createExtractedField("expiry_date", "만료일", ["expiryDate", "Expiration Date", "Expire Date"]),
    createExtractedField("renewal_date", "갱신일", ["renewalDate", "Renewal Date"]),
    createExtractedField("contractor", "계약자", ["contractor_name", "Contractor", "Contractor Name"]),
  ],
  영수증: [
    createExtractedField("payment_date", "날짜", ["date", "receipt_date", "purchase_date", "Payment Date", "Purchase Date", "Date"]),
    createExtractedField("store_name", "가게명", ["merchant_name", "shop_name", "Store Name", "Merchant Name"]),
    createExtractedField("amount", "금액", ["total_amount", "price", "Total Amount", "Amount", "Price"]),
    createExtractedField("item_name", "품목", ["items", "product_name", "Item Name", "Product Name", "Items"]),
  ],
  "병원/약국": [
    createExtractedField("hospital_name", "병원명", ["pharmacy_name", "medical_institution", "Medical Institution", "Medical Institution Name", "Hospital Name", "Pharmacy Name"]),
    createExtractedField("visit_date", "진료일", ["treatment_date", "prescription_date", "Prescription Date", "Treatment Date", "Visit Date"]),
    createExtractedField("amount", "금액", ["total_amount", "price", "medical_fee", "Total Amount", "Amount", "Price"]),
    createExtractedField("drug_name", "약품명", ["medication", "medicine_name", "Drug Name", "Medication", "Medicine Name"]),
  ],
  "보증서/A·S": [
    createExtractedField("product_name", "제품명", ["model_name", "Product Name", "Model Name"]),
    createExtractedField("purchase_date", "구매일", ["Purchase Date", "buy_date", "purchaseDate"]),
    createExtractedField("warranty_period", "보증기간", ["Warranty Period", "warrantyPeriod"]),
    createExtractedField("repair_date", "수리일", ["service_date", "Repair Date", "Service Date"]),
  ],
  기타: [
    createExtractedField("title", "제목", ["Title", "document_title"]),
    createExtractedField("upload_date", "업로드일", ["created_at", "createdAt", "Upload Date", "Created At"]),
  ],
};

const normalizeCategoryName = (categoryName?: string) => {
  if (categoryName === "계약서") return "계약서";
  if (categoryName === "영수증") return "영수증";
  if (categoryName === "병원/약국") return "병원/약국";
  if (categoryName === "보증서/A·S" || categoryName === "보증서/A/S") return "보증서/A·S";
  return "기타";
};

const getExtractedFieldsByCategory = (categoryName?: string) =>
  CATEGORY_EXTRACTED_FIELDS[normalizeCategoryName(categoryName)] ?? CATEGORY_EXTRACTED_FIELDS.기타;

const normalizeExtractedKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s \-]+/g, "_")
    .replace(/[^a-zA-Z0-9가-힣_]/g, "")
    .toLowerCase();

const getExtractedValueByField = (
  data: Record<string, string>,
  field: ExtractedFieldConfig,
) => {
  const normalizedAliases = new Set(field.aliases.map(normalizeExtractedKey));
  const matchedEntry = Object.entries(data).find(([key]) =>
    normalizedAliases.has(normalizeExtractedKey(key)),
  );

  return matchedEntry?.[1] ?? "";
};

const buildExtractedDataByCategory = (
  data: Record<string, string>,
  categoryName?: string,
) =>
  Object.fromEntries(
    getExtractedFieldsByCategory(categoryName).map((field) => [
      field.key,
      getExtractedValueByField(data, field),
    ]),
  );

const formatExtractedValue = (value: string, fieldKey?: string) => {
  if (!value) return "-";
  if (value === "true") return "예";
  if (value === "false") return "아니오";

  if (fieldKey === "amount" && /^-?\d+(\.\d+)?$/.test(value)) {
    return `${Number(value).toLocaleString("ko-KR")}원`;
  }

  return value;
};

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
        setIsProtected(getDocumentLockedFromServer(d));
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
          Object.entries(doc.extracted_data)
            .filter(([key]) => !EXCLUDED_EXTRACTED_KEYS.has(key))
            .map(([key, value]) => [key, String(value ?? "")]),
        )
      : {};

    return {
      title: doc.title,
      categoryId: doc.category_id,
      issueDate: doc.issue_date ?? "",
      expiryDate: doc.expiry_date ?? "",
      renewalDate: doc.renewal_date ?? "",
      extractedData: extracted,
    };
  }, [doc]);

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

  // PIN 검증과 잠금 상태 변경을 백엔드에서 한 번에 처리 (검증 성공 없이는 잠금 상태가 바뀌지 않음)
  const verifyForAction = async (pin: string) => {
    if (pinAction === "view") {
      // PIN 검증 성공 시 서버가 언락 쿠키를 심어줌. 이후 같은 문서를 다시 조회하면
      // 그 쿠키가 자동으로 실려가야만 실제 내용(ocr, 첨부파일 등)을 받아올 수 있음.
      await documentService.unlockDocument(doc.document_id, pin);
      const unlockedDoc = await documentService.getDocument(doc.document_id);
      setDoc(unlockedDoc);
      return;
    }

    const updated = await documentService.updateLock(
      doc.document_id,
      pinAction === "enable",
      pin,
    );
    setDoc(updated);
  };

  const handlePinVerified = () => {
    if (pinAction === "view") {
      setPinUnlocked(true);
      showToast("문서 잠금이 해제되었습니다.", "success");
      return;
    }

    const nowLocked = pinAction === "enable";
    setIsProtected(nowLocked);
    setPinUnlocked(false);
    setIsEditing(false);
    showToast(
      nowLocked
        ? "문서가 캐비닛 PIN으로 보호됩니다."
        : "문서 PIN 보호가 해제되었습니다.",
      "success",
    );
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
        extractedData: buildExtractedDataByCategory(
          form.extractedData,
          activeCategory?.name,
        ),
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
    setForm((prev) => ({
      ...prev,
      categoryId,
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
                  문서 유형에 따라 아래 AI 추출 정보 항목이 자동으로 정리됩니다.
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
              업로드일 {formatDate(doc.created_at)}
              {!doc.is_confirmed && ` · AI 상태 ${doc.ai_status}`}
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
                <p className="doc-detail__ai-note">
                  {normalizeCategoryName(activeCategory?.name)} 문서 기준으로 주요 추출 데이터만 표시합니다.
                </p>

                <div className="doc-detail__field-grid doc-detail__field-grid--ai">
                  {getExtractedFieldsByCategory(activeCategory?.name).map((field) => {
                    const value = getExtractedValueByField(form.extractedData, field);

                    return (
                      <label key={field.key} className="doc-detail__field">
                        <span>{field.label}</span>
                        {isEditing ? (
                          <input
                            value={value}
                            onChange={(event) =>
                              handleExtractedChange(field.key, event.target.value)
                            }
                          />
                        ) : (
                          <b>{formatExtractedValue(value, field.key)}</b>
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
                          <span className="doc-detail__alert-item-icon">
                            <BellRing size={15} />
                          </span>
                          <div className="doc-detail__alert-item-info">
                            <b>{alert.notify_date.slice(0, 10)}</b>
                            {alert.reason && <span>{alert.reason}</span>}
                          </div>
                          <div className="doc-detail__alert-item-actions">
                            <button
                              type="button"
                              className="doc-detail__text-button"
                              onClick={() => setAlertOpen(true)}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              className="doc-detail__text-button doc-detail__text-button--danger"
                              onClick={() => handleAlertDelete(alert.alert_id)}
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
        verify={verifyForAction}
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
