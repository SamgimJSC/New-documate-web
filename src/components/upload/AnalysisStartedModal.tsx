import "./UploadFlowModal.css";

type AnalysisStartedModalProps = {
  fileCount: number;
  onStay: () => void;
  onMoveCenter: () => void;
};

export function AnalysisStartedModal({
  fileCount,
  onStay,
  onMoveCenter,
}: AnalysisStartedModalProps) {
  return (
    <div className="upload-flow-modal-backdrop" role="presentation">
      <section className="upload-flow-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="upload-flow-modal__close"
          onClick={onStay}
          aria-label="닫기"
        >
          ×
        </button>

        <div className="upload-flow-modal__icon upload-flow-modal__icon--started">
          ✦
        </div>

        <h2>AI 분석이 시작되었습니다.</h2>
        <p>진행 상태는 처리 센터에서 언제든지 확인할 수 있어요.</p>

        <div className="upload-flow-modal__notice">
          <strong>이 페이지를 나가도 괜찮아요!</strong>
          <span>
            {fileCount}개의 파일이 처리 센터의 분석 대기열에 등록되었습니다.
          </span>
        </div>

        <div className="upload-flow-modal__actions upload-flow-modal__actions--split">
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--ghost"
            onClick={onStay}
          >
            이 페이지에 머무르기
          </button>
          <button
            type="button"
            className="upload-flow-modal__button upload-flow-modal__button--primary"
            onClick={onMoveCenter}
          >
            처리 센터로 이동
          </button>
        </div>
      </section>
    </div>
  );
}
