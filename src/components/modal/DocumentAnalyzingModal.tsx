import React from "react";
import Modal from "../common/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentAnalyzingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div className="analyzing-spinner" />
        <p style={{ marginTop: 16, fontWeight: 600, fontSize: "var(--font-size-base)" }}>AI 분석 중...</p>
        <p style={{ marginTop: 8, fontSize: "var(--font-size-sm)", color: "var(--color-muted)" }}>
          문서를 분석하고 있습니다. 잠시만 기다려주세요.
        </p>
      </div>
      <style>{`
        .analyzing-spinner {
          width: 48px; height: 48px; margin: 0 auto;
          border: 4px solid #e5e7eb;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Modal>
  );
};

export default DocumentAnalyzingModal;
