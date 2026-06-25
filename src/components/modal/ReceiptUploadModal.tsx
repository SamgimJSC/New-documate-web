import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";
import { startUpload, uploadTempFile, requestAiAnalyse } from "../../api/upload";
import { AnalysisStartedModal } from "../upload/AnalysisStartedModal";
import { uploadLocalService } from "../../services/uploadLocalService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptUploadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const { tempDocumentId } = await startUpload();
      const { files } = await uploadTempFile(tempDocumentId, file, 1);
      const uploadedFileIds = [{ id: files[0].id, pageNo: 1 }];
      await requestAiAnalyse(tempDocumentId, uploadedFileIds);

      // 처리 센터가 폴링으로 추적할 수 있도록 로컬스토리지에 등록
      uploadLocalService.writeProcessItems([
        ...uploadLocalService.readProcessItems(),
        uploadLocalService.buildProcessDocument({
          fileName: file.name,
          sizeMb: file.size / (1024 * 1024),
          fileSizeBytes: file.size,
          pageCount: 1,
          status: "analyzing",
          savedRecordId: tempDocumentId,
          uploadedFileIds,
        }),
      ]);

      setAnalysisStarted(true);
    } catch {
      showToast("업로드 중 오류가 발생했습니다.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStay = () => {
    setAnalysisStarted(false);
    setFile(null);
    onClose();
  };

  const handleMoveCenter = () => {
    setAnalysisStarted(false);
    setFile(null);
    onClose();
    navigate("/processing-center");
  };

  if (analysisStarted) {
    return (
      <AnalysisStartedModal
        fileCount={1}
        onStay={handleStay}
        onMoveCenter={handleMoveCenter}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영수증 업로드 (OCR)">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          {file ? (
            <p style={{ color: "var(--color-primary)", fontWeight: 500 }}>{file.name}</p>
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
            <input type="file" accept="image/jpeg,image/png" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={analyzing}>취소</Button>
          <Button variant="primary" onClick={handleAnalyze} disabled={!file || analyzing}>
            {analyzing ? "업로드 중..." : "분석 시작"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptUploadModal;
