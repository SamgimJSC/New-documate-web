import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptUploadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleAnalyze = () => {
    showToast("영수증 OCR 분석을 시작합니다.", "info");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영수증 업로드 (OCR)">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          {fileName ? (
            <p style={{ color: "var(--color-primary)", fontWeight: 500 }}>{fileName}</p>
          ) : (
            <p style={{ color: "var(--color-muted)", fontSize: "var(--font-size-sm)" }}>
              영수증 이미지를 드래그하거나 파일을 선택하세요
            </p>
          )}
          <label
            style={{
              display: "inline-flex", marginTop: 12, padding: "8px 16px",
              background: "var(--color-bg)", border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "var(--font-size-sm)",
            }}
          >
            파일 선택
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleAnalyze} disabled={!fileName}>분석 시작</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptUploadModal;
