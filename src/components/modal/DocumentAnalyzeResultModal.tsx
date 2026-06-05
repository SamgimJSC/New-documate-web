import React from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentAnalyzeResultModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();

  const handleSave = () => {
    showToast("문서가 저장되었습니다.", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI 분석 결과" size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ padding: 16, background: "var(--color-bg)", borderRadius: 8 }}>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-muted)", marginBottom: 8 }}>추출된 정보</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <p style={{ fontSize: "var(--font-size-md)" }}><strong>제목:</strong> 임대차계약서</p>
            <p style={{ fontSize: "var(--font-size-md)" }}><strong>발급일:</strong> 2026-01-01</p>
            <p style={{ fontSize: "var(--font-size-md)" }}><strong>만료일:</strong> 2028-01-01</p>
            <p style={{ fontSize: "var(--font-size-md)" }}><strong>신뢰도:</strong> 95%</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave}>저장</Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentAnalyzeResultModal;
