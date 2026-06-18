import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { uploadCategoryGuide } from "../../data/uploadCategories";
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

const emptyManualForm: ManualRegistrationInput = {
  category: "계약서",
  title: "",
  issuer: "",
  documentDate: "",
  amount: "",
  memo: "",
  attachmentName: "",
};

const readManualDraft = (): ManualRegistrationInput => {
  try {
    const raw = window.localStorage.getItem(MANUAL_UPLOAD_DRAFT_KEY);
    return raw ? { ...emptyManualForm, ...JSON.parse(raw) } : emptyManualForm;
  } catch {
    return emptyManualForm;
  }
};

export function ManualRegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [manualForm, setManualForm] = useState<ManualRegistrationInput>(() =>
    readManualDraft(),
  );
  const [manualErrors, setManualErrors] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCategory, setSuccessCategory] = useState<UploadDocumentCategory | null>(null);

  const selectedGuide = useMemo(
    () => uploadCategoryGuide.find((guide) => guide.category === manualForm.category),
    [manualForm.category],
  );

  const updateManual = <K extends keyof ManualRegistrationInput>(
    key: K,
    value: ManualRegistrationInput[K],
  ) => {
    setManualForm((current) => ({ ...current, [key]: value }));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2200);
  };

  const saveManualDraft = () => {
    window.localStorage.setItem(MANUAL_UPLOAD_DRAFT_KEY, JSON.stringify(manualForm));
    showToast("수기 작성 내용을 임시 저장했어요.");
  };

  const resetManualForm = () => {
    setManualForm(emptyManualForm);
    setManualErrors([]);
    window.localStorage.removeItem(MANUAL_UPLOAD_DRAFT_KEY);
  };

  const saveManualDocument = async () => {
    const errors: string[] = [];

    if (!manualForm.title.trim()) errors.push("문서 이름을 입력해 주세요.");
    if (!manualForm.issuer.trim()) errors.push("발행처/거래처를 입력해 주세요.");
    if (!manualForm.documentDate) errors.push("문서 날짜를 선택해 주세요.");
    if (manualForm.category === "영수증" && !manualForm.amount.trim()) {
      errors.push("영수증은 금액을 입력해 주세요.");
    }

    setManualErrors(errors);
    if (errors.length > 0) return;

    setIsSubmitting(true);
    try {
      const extractedData: Record<string, string> = {};
      if (manualForm.issuer) extractedData["발행처"] = manualForm.issuer;
      if (manualForm.amount) extractedData["금액"] = manualForm.amount;
      if (manualForm.memo) extractedData["메모"] = manualForm.memo;

      await uploadService.createDocument({
        inputMethod: "MANUAL",
        categoryId: categoryToId(manualForm.category),
        title: manualForm.title.trim(),
        issueDate: manualForm.documentDate || undefined,
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

  return (
    <section className="manual-register-page">
      <header className="manual-register-page__topbar">
        <nav className="manual-register-page__breadcrumb" aria-label="현재 위치">
          <button type="button" onClick={() => navigate("/documents")}>문서 관리</button>
          <span>/</span>
          <button type="button" onClick={() => navigate("/upload")}>업로드 스튜디오</button>
          <span>/</span>
          <b>빠른 수기 등록</b>
        </nav>
      </header>

      {toastMessage && <div className="manual-register-page__toast">{toastMessage}</div>}

      <div className="manual-register-layout">
        <main className="manual-register-card">
          <div className="manual-register-card__title">
            <div>
              <p className="manual-register-page__kicker">2. 빠른 수기 등록</p>
              <h1>문서 정보를 직접 입력하세요</h1>
              <p>AI 분석 없이 사용자가 입력한 정보 그대로 저장됩니다.</p>
            </div>
            <button type="button" onClick={() => navigate("/upload")}>업로드로 돌아가기</button>
          </div>

          <div className="manual-category-selector" aria-label="문서 유형 선택">
            {uploadCategoryGuide.map((guide) => (
              <button
                key={guide.category}
                type="button"
                className={manualForm.category === guide.category ? "is-selected" : ""}
                onClick={() => updateManual("category", guide.category)}
              >
                {guide.category}
              </button>
            ))}
          </div>

          <div className="manual-selected-guide">
            <strong>저장 위치</strong>
            <span>{getSaveLocationLabel(manualForm.category)}</span>
            {selectedGuide && <p>필수 확인 항목: {selectedGuide.extractedData}</p>}
          </div>

          <form
            className="manual-form"
            onSubmit={(event) => {
              event.preventDefault();
              saveManualDocument();
            }}
          >
            <label>
              문서 이름 *
              <input
                value={manualForm.title}
                onChange={(event) => updateManual("title", event.target.value)}
                placeholder="예: 2026년 6월 생활비 영수증"
              />
            </label>

            <label>
              발행처 / 거래처 *
              <input
                value={manualForm.issuer}
                onChange={(event) => updateManual("issuer", event.target.value)}
                placeholder="예: 스타벅스 코리아"
              />
            </label>

            <div className="manual-form__two-columns">
              <label>
                문서 날짜 *
                <input
                  type="date"
                  value={manualForm.documentDate}
                  onChange={(event) => updateManual("documentDate", event.target.value)}
                />
              </label>

              <label>
                금액 {manualForm.category === "영수증" ? "*" : ""}
                <div className="manual-amount-input">
                  <input
                    value={manualForm.amount}
                    onChange={(event) => updateManual("amount", event.target.value)}
                    placeholder="예: 25000"
                  />
                  <b>원</b>
                </div>
              </label>
            </div>

            <label>
              메모
              <textarea
                value={manualForm.memo}
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
                onChange={handleAttachment}
              />
              <span>{manualForm.attachmentName || "첨부 이미지 선택"}</span>
              <i>선택 사항 · JPG/PNG 최대 10MB</i>
              <button type="button" onClick={() => fileInputRef.current?.click()}>
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
              <button type="button" className="manual-form-actions__ghost" onClick={resetManualForm}>초기화</button>
              <button type="button" className="manual-form-actions__ghost" onClick={saveManualDraft}>임시 저장</button>
              <button type="submit" className="manual-form-actions__primary" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "작성 완료 후 등록"}
              </button>
            </div>
          </form>
        </main>

        <aside className="manual-guide-panel">
          <h2>작성 안내</h2>
          <article>
            <b>01</b>
            <div>
              <strong>카테고리에 따라 저장 위치가 달라져요.</strong>
              <p>영수증은 영수증 보드로, 그 외 문서는 디지털 캐비닛으로 저장됩니다.</p>
            </div>
          </article>
          <article>
            <b>02</b>
            <div>
              <strong>임시 저장을 사용할 수 있어요.</strong>
              <p>작성 중인 내용은 브라우저에 보관되고 다시 열었을 때 불러와집니다.</p>
            </div>
          </article>
          <article>
            <b>03</b>
            <div>
              <strong>AI 분석 없이 바로 저장돼요.</strong>
              <p>수기 등록은 사용자가 입력한 정보 그대로 저장됩니다.</p>
            </div>
          </article>
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
