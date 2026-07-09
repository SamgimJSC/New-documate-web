import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileImage, Sparkles, UploadCloud, X } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";
import { startUpload, uploadTempFile, requestAiAnalyse } from "../../api/upload";
import { AnalysisStartedModal } from "../upload/AnalysisStartedModal";
import "./ReceiptUploadModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiptUploadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setPreviewUrl(null);
    setAnalyzing(false);
    setAnalysisStarted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const applyFile = (selected?: File) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      showToast("JPG 또는 PNG 이미지를 선택해주세요.", "error");
      return;
    }

    setFile(selected);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    applyFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (analyzing) return;
    handleRemoveFile();
    onClose();
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const { tempDocumentId } = await startUpload();
      const { files } = await uploadTempFile(tempDocumentId, file, 1);
      const uploadedFileIds = [{ id: files[0].id, pageNo: 1 }];
      await requestAiAnalyse(tempDocumentId, uploadedFileIds);

      setAnalysisStarted(true);
    } catch {
      showToast("업로드 중 오류가 발생했습니다.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStay = () => {
    setAnalysisStarted(false);
    handleRemoveFile();
    onClose();
  };

  const handleMoveCenter = () => {
    setAnalysisStarted(false);
    handleRemoveFile();
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
    <Modal isOpen={isOpen} onClose={handleClose} title="사진으로 영수증 추가" size="md">
      <div className="receipt-upload-modal">
        <div className="receipt-upload-modal__notice">
          <span className="receipt-upload-modal__notice-icon">
            <Sparkles size={17} />
          </span>
          <div>
            <strong>OCR로 영수증 정보를 자동 추출해요</strong>
            <p>JPG, PNG 이미지를 올리면 처리 센터에서 분석 결과를 확인할 수 있습니다.</p>
          </div>
        </div>

        <button
          type="button"
          className={`receipt-upload-modal__drop${file ? " is-selected" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            className="receipt-upload-modal__input"
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
          />

          {file && previewUrl ? (
            <>
              <img src={previewUrl} alt="영수증 미리보기" className="receipt-upload-modal__preview" />
              <span className="receipt-upload-modal__file-name">{file.name}</span>
            </>
          ) : (
            <>
              <span className="receipt-upload-modal__drop-icon">
                <UploadCloud size={26} />
              </span>
              <strong>영수증 이미지를 업로드하세요</strong>
              <span>클릭하거나 파일을 이곳에 드래그해주세요.</span>
            </>
          )}
        </button>

        {file && (
          <button type="button" className="receipt-upload-modal__remove" onClick={handleRemoveFile}>
            <X size={14} /> 파일 다시 선택
          </button>
        )}

        <div className="receipt-upload-modal__policy">
          <FileImage size={16} />
          <span>지원 형식: JPG, PNG · 권장 크기: 10MB 이하</span>
        </div>

        <div className="receipt-upload-modal__actions">
          <Button variant="ghost" onClick={handleClose} disabled={analyzing}>
            취소
          </Button>
          <Button variant="primary" onClick={handleAnalyze} disabled={!file || analyzing} loading={analyzing}>
            분석 시작
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptUploadModal;
