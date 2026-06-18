import "./UploadFlowModal.css";

type AnalysisStartModalProps = {
  fileCount: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AnalysisStartModal({
  fileCount,
  onCancel,
  onConfirm,
}: AnalysisStartModalProps) {
  return (
    <div className="upload-flow-modal-backdrop" role="presentation">
      <section className="upload-flow-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="upload-flow-modal__close"
          onClick={onCancel}
          aria-label="닫기"
        >
          ×
        </button>

        <div className="upload-flow-modal__icon upload-flow-modal__icon--ai">
          AI
        </div>
        <h2>AI 분석을 시작할까요?</h2>
        <p>
          {fileCount}개의 파일을 분석 대기열에 등록하고 AI 분석을 시작합니다.
        </p>

        <div className="upload-flow-modal__info">
          <strong>업로드 페이지를 벗어나도 괜찮아요.</strong>
          <span>
            분석 상태는 상단바의 처리 센터에서 다시 확인할 수 있습니다.
          </span>
        </div>

        <div className="upload-flow-modal__actions">
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--ghost"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--primary"
            onClick={onConfirm}
          >
            분석 시작하기
          </button>
        </div>
      </section>
    </div>
  );
}
