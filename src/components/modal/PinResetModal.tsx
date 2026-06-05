import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PinResetModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSave = () => {
    if (newPin !== confirmPin) {
      showToast("새 PIN이 일치하지 않습니다.", "error");
      return;
    }
    showToast("PIN이 변경되었습니다.", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="캐비닛 PIN 재설정" size="sm">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="현재 PIN" type="password" maxLength={6} placeholder="현재 PIN 6자리" value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} />
        <Input label="새 PIN" type="password" maxLength={6} placeholder="새 PIN 6자리" value={newPin} onChange={(e) => setNewPin(e.target.value)} />
        <Input label="새 PIN 확인" type="password" maxLength={6} placeholder="새 PIN 확인" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)}
          error={confirmPin && newPin !== confirmPin ? "PIN이 일치하지 않습니다." : undefined} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={!currentPin || !newPin || !confirmPin}>변경</Button>
        </div>
      </div>
    </Modal>
  );
};

export default PinResetModal;
