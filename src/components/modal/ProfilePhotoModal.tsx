import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePhotoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleSave = () => {
    showToast("프로필 사진이 변경되었습니다.", "success");
    onClose();
  };

  const handleDelete = () => {
    setPreview(null);
    showToast("프로필 사진이 삭제되었습니다.", "info");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="프로필 사진" size="sm">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "var(--color-bg)", border: "2px solid var(--color-border)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {preview ? (
            <img src={preview} alt="프로필 미리보기" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 40, color: "var(--color-muted)" }}>👤</span>
          )}
        </div>
        <label style={{ padding: "8px 16px", background: "var(--color-bg)", border: "1.5px solid var(--color-border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: "var(--font-size-sm)" }}>
          사진 선택
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={handleDelete}>사진 삭제</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!preview}>저장</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfilePhotoModal;
