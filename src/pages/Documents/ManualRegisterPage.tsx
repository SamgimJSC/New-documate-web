import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { RegistrationSuccessModal } from "../../components/upload/RegistrationSuccessModal";
import type { ManualRegistrationInput } from "../../services/uploadLocalService";
import type { UploadDocumentCategory } from "../../types/upload";
import {
  categoryToId,
  MANUAL_UPLOAD_DRAFT_KEY,
  getSaveLocationLabel,
} from "../../utils/uploadWorkflow";
import { uploadService } from "../../services/uploadService";
import "./ManualRegisterPage.css";

type ManualExtraKey =
  | "contractDate"
  | "expiryDate"
  | "renewalDate"
  | "contractor"
  | "items"
  | "medicineName"
  | "productName"
  | "warrantyPeriod"
  | "repairDate";

type ManualFormState = ManualRegistrationInput &
  Partial<Record<ManualExtraKey, string>>;

type FieldConfig = {
  key: keyof ManualFormState;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "date" | "amount";
};

type CategoryConfig = {
  category: UploadDocumentCategory;
  examples: string;
  extractedData: string;
  saveHint: string;
  fields: FieldConfig[];
  tip: string;
};

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    category: "계약서",
    examples: "임대차계약서, 근로계약서, 통신계약서",
    extractedData: "계약일, 만료일, 갱신일, 계약자",
    saveHint: "디지털 캐비닛 > 계약서",
    tip: "만료일이나 갱신일을 입력하면 나중에 기한 관리가 쉬워요.",
    fields: [
      {
        key: "title",
        label: "문서 이름",
        placeholder: "예: 임대차계약서_202606",
        required: true,
      },
      {
        key: "contractor",
        label: "계약자",
        placeholder: "예: 김민준 / ○○부동산",
        required: true,
      },
      {
        key: "issuer",
        label: "거래처 / 발행처",
        placeholder: "예: ○○부동산",
      },
      {
        key: "contractDate",
        label: "계약일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
      },
      {
        key: "expiryDate",
        label: "만료일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
      },
      {
        key: "renewalDate",
        label: "갱신일",
        placeholder: "연도-월-일",
        type: "date",
      },
      {
        key: "amount",
        label: "계약 금액",
        placeholder: "예: 500000",
        type: "amount",
      },
    ],
  },
  {
    category: "영수증",
    examples: "카드 영수증, 현금영수증, 결제내역",
    extractedData: "날짜, 가게명, 금액, 품목",
    saveHint: "영수증 보드",
    tip: "가맹점명, 결제일, 금액을 정확히 입력하면 소비 리포트에 바로 반영하기 좋아요.",
    fields: [
      {
        key: "title",
        label: "문서 이름",
        placeholder: "예: 2026년 6월 생활비 영수증",
        required: true,
      },
      {
        key: "issuer",
        label: "가게명",
        placeholder: "예: 스타벅스 코리아",
        required: true,
      },
      {
        key: "documentDate",
        label: "날짜",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
      },
      {
        key: "amount",
        label: "금액",
        placeholder: "예: 25000",
        required: true,
        type: "amount",
      },
      {
        key: "items",
        label: "품목",
        placeholder: "예: 아메리카노, 샌드위치",
      },
    ],
  },
  {
    category: "병원/약국",
    examples: "처방전, 진료비 영수증, 약국 영수증",
    extractedData: "병원명, 진료일, 금액, 약품명",
    saveHint: "디지털 캐비닛 > 의료 문서",
    tip: "진료일과 약품명을 적어두면 나중에 의료 기록을 찾기 쉬워요.",
    fields: [
      {
        key: "title",
        label: "문서 이름",
        placeholder: "예: 감기 진료비 영수증",
        required: true,
      },
      {
        key: "issuer",
        label: "병원명 / 약국명",
        placeholder: "예: 세브란스병원",
        required: true,
      },
      {
        key: "documentDate",
        label: "진료일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
      },
      {
        key: "amount",
        label: "금액",
        placeholder: "예: 12800",
        required: true,
        type: "amount",
      },
      {
        key: "medicineName",
        label: "약품명 / 진료 내용",
        placeholder: "예: 감기약, 내과 진료",
      },
    ],
  },
  {
    category: "보증서/A·S",
    examples: "제품 보증서, 수리 접수증, A/S 내역서",
    extractedData: "제품명, 구매일, 보증기간, 수리일",
    saveHint: "디지털 캐비닛 > 보증서/A·S",
    tip: "구매일과 보증기간을 입력하면 보증 만료 전에 확인하기 좋아요.",
    fields: [
      {
        key: "title",
        label: "문서 이름",
        placeholder: "예: 노트북 보증서",
        required: true,
      },
      {
        key: "productName",
        label: "제품명",
        placeholder: "예: LG gram 16",
        required: true,
      },
      {
        key: "issuer",
        label: "구매처 / 서비스센터",
        placeholder: "예: 하이마트 강남점",
      },
      {
        key: "documentDate",
        label: "구매일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
      },
      {
        key: "warrantyPeriod",
        label: "보증기간",
        placeholder: "예: 2년 / 2028-06-18까지",
        required: true,
      },
      {
        key: "repairDate",
        label: "수리일",
        placeholder: "연도-월-일",
        type: "date",
      },
    ],
  },
  {
    category: "기타",
    examples: "분류 불가 문서, 일반 안내문, 메모",
    extractedData: "제목, 업로드일",
    saveHint: "디지털 캐비닛 > 기타",
    tip: "나중에 찾기 쉽도록 제목과 발행처를 구체적으로 적어두면 좋아요.",
    fields: [
      {
        key: "title",
        label: "제목",
        placeholder: "예: 학교 안내문",
        required: true,
      },
      {
        key: "issuer",
        label: "발행처",
        placeholder: "예: 관리사무소",
      },
      {
        key: "documentDate",
        label: "업로드일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
      },
    ],
  },
];

const emptyManualForm: ManualFormState = {
  category: "계약서",
  title: "",
  issuer: "",
  documentDate: "",
  amount: "",
  memo: "",
  attachmentName: "",
  contractDate: "",
  expiryDate: "",
  renewalDate: "",
  contractor: "",
  items: "",
  medicineName: "",
  productName: "",
  warrantyPeriod: "",
  repairDate: "",
};

const readManualDraft = (): ManualFormState => {
  try {
    const raw = window.localStorage.getItem(MANUAL_UPLOAD_DRAFT_KEY);
    return raw ? { ...emptyManualForm, ...JSON.parse(raw) } : emptyManualForm;
  } catch {
    return emptyManualForm;
  }
};

const formatExtraMemo = (form: ManualFormState, config: CategoryConfig) => {
  const extraLines = config.fields
    .filter(
      (field) =>
        !["title", "issuer", "documentDate", "amount"].includes(
          String(field.key),
        ),
    )
    .map((field) => {
      const value = String(form[field.key] ?? "").trim();
      return value ? `${field.label}: ${value}` : "";
    })
    .filter(Boolean);

  const memo = form.memo.trim();

  if (extraLines.length === 0) return memo;

  return [memo, "[수기 등록 추가 정보]", ...extraLines]
    .filter(Boolean)
    .join("\n");
};

export function ManualRegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [manualForm, setManualForm] = useState<ManualFormState>(() =>
    readManualDraft(),
  );
  const [manualErrors, setManualErrors] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCategory, setSuccessCategory] =
    useState<UploadDocumentCategory | null>(null);

  const selectedConfig = useMemo(
    () =>
      CATEGORY_CONFIGS.find(
        (config) => config.category === manualForm.category,
      ) ?? CATEGORY_CONFIGS[0],
    [manualForm.category],
  );

  const updateManual = <K extends keyof ManualFormState>(
    key: K,
    value: ManualFormState[K],
  ) => {
    setManualForm((current) => ({ ...current, [key]: value }));
  };

  const changeCategory = (category: UploadDocumentCategory) => {
    if (isSubmitting) return;

    setManualForm((current) => ({
      ...emptyManualForm,
      category,
      title: current.title,
      attachmentName: current.attachmentName,
      memo: current.memo,
    }));
    setManualErrors([]);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2200);
  };

  const saveManualDraft = () => {
    if (isSubmitting) return;

    window.localStorage.setItem(
      MANUAL_UPLOAD_DRAFT_KEY,
      JSON.stringify(manualForm),
    );
    showToast("수기 작성 내용을 임시 저장했어요.");
  };

  const resetManualForm = () => {
    if (isSubmitting) return;

    setManualForm({ ...emptyManualForm, category: manualForm.category });
    setManualErrors([]);
    window.localStorage.removeItem(MANUAL_UPLOAD_DRAFT_KEY);
  };

  const saveManualDocument = async () => {
    if (isSubmitting) return;

    const errors = selectedConfig.fields
      .filter((field) => field.required)
      .filter((field) => !String(manualForm[field.key] ?? "").trim())
      .map((field) => `${field.label}을(를) 입력해 주세요.`);

    setManualErrors(errors);
    if (errors.length > 0) return;

    setIsSubmitting(true);

    try {
      const normalizedDate =
        manualForm.documentDate ||
        manualForm.contractDate ||
        manualForm.expiryDate ||
        manualForm.repairDate ||
        "";

      const normalizedIssuer =
        manualForm.issuer ||
        manualForm.contractor ||
        manualForm.productName ||
        "";

      const memoForSave = formatExtraMemo(manualForm, selectedConfig);

      const extractedData: Record<string, string> = {};

      if (normalizedIssuer) extractedData["발행처"] = normalizedIssuer;
      if (manualForm.amount) extractedData["금액"] = manualForm.amount;
      if (manualForm.contractor)
        extractedData["계약자"] = manualForm.contractor;
      if (manualForm.items) extractedData["품목"] = manualForm.items;
      if (manualForm.medicineName) {
        extractedData["약품명 / 진료 내용"] = manualForm.medicineName;
      }
      if (manualForm.productName)
        extractedData["제품명"] = manualForm.productName;
      if (manualForm.warrantyPeriod) {
        extractedData["보증기간"] = manualForm.warrantyPeriod;
      }
      if (manualForm.repairDate)
        extractedData["수리일"] = manualForm.repairDate;
      if (memoForSave) extractedData["메모"] = memoForSave;

      await uploadService.createDocument({
        inputMethod: "MANUAL",
        categoryId: categoryToId(manualForm.category),
        title: manualForm.title.trim(),
        issueDate: normalizedDate || undefined,
        extractedData,
      });

      window.localStorage.removeItem(MANUAL_UPLOAD_DRAFT_KEY);
      setSuccessCategory(manualForm.category);
    } catch {
      setManualErrors(["서버 저장에 실패했어요. 잠시 후 다시 시도해 주세요."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) updateManual("attachmentName", file.name);
    event.target.value = "";
  };

  const renderField = (field: FieldConfig) => {
    const value = String(manualForm[field.key] ?? "");

    if (field.type === "amount") {
      return (
        <label key={String(field.key)}>
          {field.label} {field.required ? "*" : ""}
          <div className="manual-amount-input">
            <input
              value={value}
              inputMode="numeric"
              disabled={isSubmitting}
              onChange={(event) => updateManual(field.key, event.target.value)}
              placeholder={field.placeholder}
            />
            <b>원</b>
          </div>
        </label>
      );
    }

    return (
      <label key={String(field.key)}>
        {field.label} {field.required ? "*" : ""}
        <input
          type={field.type === "date" ? "date" : "text"}
          value={value}
          disabled={isSubmitting}
          onChange={(event) => updateManual(field.key, event.target.value)}
          placeholder={field.placeholder}
        />
      </label>
    );
  };

  return (
    <section className="manual-register-page">
      {toastMessage && (
        <div className="manual-register-page__toast">{toastMessage}</div>
      )}

      <div className="manual-register-layout">
        <main className="manual-register-card">
          <div className="manual-register-card__title">
            <div>
              <p className="manual-register-page__kicker">2. 빠른 수기 등록</p>
              <h1>문서 정보를 직접 입력하세요</h1>
              <p>AI 분석 없이 사용자가 입력한 정보 그대로 저장됩니다.</p>
            </div>
          </div>

          <section
            className="manual-category-block"
            aria-label="문서 유형 선택"
          >
            <div className="manual-category-block__label">
              <strong>문서 유형 선택</strong>
              <span>저장할 문서의 종류를 먼저 선택해 주세요.</span>
            </div>

            <div className="manual-category-selector">
              {CATEGORY_CONFIGS.map((config) => (
                <button
                  key={config.category}
                  type="button"
                  disabled={isSubmitting}
                  className={
                    manualForm.category === config.category ? "is-selected" : ""
                  }
                  onClick={() => changeCategory(config.category)}
                >
                  {config.category}
                </button>
              ))}
            </div>
          </section>

          <div className="manual-selected-guide">
            <div>
              <strong>저장 위치</strong>
              <span>{getSaveLocationLabel(manualForm.category)}</span>
            </div>
            <p>주요 추출 데이터: {selectedConfig.extractedData}</p>
          </div>

          <form
            className="manual-form"
            onSubmit={(event) => {
              event.preventDefault();
              saveManualDocument();
            }}
          >
            <div className="manual-form__dynamic-grid">
              {selectedConfig.fields.map(renderField)}
            </div>

            <label>
              메모
              <textarea
                value={manualForm.memo}
                disabled={isSubmitting}
                onChange={(event) => updateManual("memo", event.target.value)}
                maxLength={500}
                placeholder="문서와 관련된 내용을 입력해 주세요."
              />
              <small>{manualForm.memo.length} / 500</small>
            </label>

            <label className="manual-attachment-box">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                disabled={isSubmitting}
                onChange={handleAttachment}
              />
              <span>{manualForm.attachmentName || "첨부 이미지 선택"}</span>
              <i>선택 사항 · JPG/PNG 최대 10MB</i>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => fileInputRef.current?.click()}
              >
                이미지 첨부
              </button>
            </label>

            {manualErrors.length > 0 && (
              <div className="manual-error-box">
                {manualErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}

            <div className="manual-form-actions">
              <button
                type="button"
                className="manual-form-actions__ghost"
                onClick={resetManualForm}
                disabled={isSubmitting}
              >
                초기화
              </button>

              <button
                type="button"
                className="manual-form-actions__ghost"
                onClick={saveManualDraft}
                disabled={isSubmitting}
              >
                임시 저장
              </button>

              <button
                type="submit"
                className="manual-form-actions__primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "저장 중..." : "저장하고 완료하기"}
              </button>
            </div>
          </form>
        </main>

        <aside className="manual-guide-panel">
          <div className="manual-guide-panel__headline">
            <span className="manual-guide-panel__info-icon">i</span>
            <div>
              <h2>
                수기 등록은 AI 분석 없이
                <br />
                바로 저장됩니다.
              </h2>
              <p>
                직접 입력한 정보로 문서를 등록하며,
                <br />
                AI 분석 및 자동 분류는 적용되지 않습니다.
              </p>
            </div>
          </div>

          <div className="manual-guide-divider" />

          <section
            className="manual-guide-checklist"
            aria-label="수기 등록 안내"
          >
            <h3>수기 등록 안내</h3>
            <ul>
              <li>직접 입력한 정보로 즉시 등록됩니다.</li>
              <li>AI 분석, 자동 분류, 데이터 추출은 적용되지 않습니다.</li>
              <li>
                정확한 분류 및 검색을 위해 필수 항목을 빠짐없이 입력해 주세요.
              </li>
              <li>등록 후에도 문서 정보는 수정할 수 있습니다.</li>
            </ul>
          </section>

          <div className="manual-guide-tip">
            <div className="manual-guide-tip__title">
              <span>💡</span>
              <strong>Tip</strong>
            </div>
            <p>
              파일이 있다면 업로드 후 AI 분석을 이용하면 더 빠르고 정확하게
              등록할 수 있어요.
            </p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate("/upload")}
            >
              업로드 페이지로 이동
            </button>
          </div>
        </aside>
      </div>

      {successCategory && (
        <RegistrationSuccessModal
          category={successCategory}
          onClose={() => {
            setSuccessCategory(null);
            resetManualForm();
          }}
          onMove={(path) => navigate(path)}
          title="문서가 등록되었습니다!"
          description="수기 등록이 성공적으로 완료되었습니다."
        />
      )}
    </section>
  );
}
