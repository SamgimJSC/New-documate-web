import type { UploadDocumentCategory } from "../../types/upload";
import {
  getMoveButtonLabel,
  getSaveLocationLabel,
  getSaveRoute,
} from "../../utils/uploadWorkflow";
import "./UploadFlowModal.css";

type RegistrationSuccessModalProps = {
  category: UploadDocumentCategory;
  onClose: () => void;
  onMove: (path: string) => void;
  title?: string;
  description?: string;
};

export function RegistrationSuccessModal({
  category,
  onClose,
  onMove,
  title = "문서가 등록되었습니다!",
  description = "저장한 문서를 바로 확인할 수 있어요.",
}: RegistrationSuccessModalProps) {
  const route = getSaveRoute(category);

  return (
    <div className="upload-flow-modal-backdrop" role="presentation">
      <section className="upload-flow-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="upload-flow-modal__close"
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <div className="upload-flow-modal__icon upload-flow-modal__icon--success">
          ✓
        </div>
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="upload-flow-modal__info upload-flow-modal__info--center">
          <strong>저장 위치</strong>
          <span>{getSaveLocationLabel(category)}</span>
        </div>

        <div className="upload-flow-modal__actions upload-flow-modal__actions--split">
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--ghost"
            onClick={onClose}
          >
            계속 작업하기
          </button>
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--primary"
            onClick={() => onMove(route)}
          >
            {getMoveButtonLabel(category)}
          </button>
        </div>
      </section>
    </div>
  );
}
