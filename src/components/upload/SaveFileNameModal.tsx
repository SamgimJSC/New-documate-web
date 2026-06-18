import { useState } from "react";
import { uploadCategoryGuide } from "../../data/uploadCategories";
import type { UploadDocumentCategory } from "../../types/upload";
import { getSaveLocationLabel } from "../../utils/uploadWorkflow";
import "./UploadFlowModal.css";

type SaveFileNameModalProps = {
  initialName: string;
  initialCategory: UploadDocumentCategory;
  onClose: () => void;
  onSave: (payload: {
    fileName: string;
    category: UploadDocumentCategory;
  }) => void;
};

export function SaveFileNameModal({
  initialName,
  initialCategory,
  onClose,
  onSave,
}: SaveFileNameModalProps) {
  const [fileName, setFileName] = useState(initialName);
  const [category, setCategory] = useState<UploadDocumentCategory>(initialCategory);

  return (
    <div className="upload-flow-modal-backdrop" role="presentation">
      <section
        className="upload-flow-modal upload-flow-modal--wide"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="upload-flow-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <h2>파일 이름을 저장하세요</h2>
        <p>저장 이름과 카테고리를 확인하면 알맞은 위치에 등록됩니다.</p>

        <label className="upload-flow-modal__label">
          파일 이름
          <input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            placeholder="저장할 파일 이름을 입력하세요"
          />
        </label>

        <div className="upload-flow-modal__category-list">
          {uploadCategoryGuide.map((guide) => (
            <button
              key={guide.category}
              type="button"
              className={category === guide.category ? "is-selected" : ""}
              onClick={() => setCategory(guide.category)}
            >
              {guide.category}
            </button>
          ))}
        </div>

        <div className="upload-flow-modal__info">
          <strong>저장 위치</strong>
          <span>{getSaveLocationLabel(category)}</span>
        </div>

        <div className="upload-flow-modal__actions">
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--ghost"
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--primary"
            onClick={() =>
              onSave({
                fileName: fileName.trim() || initialName,
                category,
              })
            }
          >
            저장하기
          </button>
        </div>
      </section>
    </div>
  );
}
