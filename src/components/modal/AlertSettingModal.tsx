import React, { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { useToast } from "../common/Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
}

const AlertSettingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [notifyDate, setNotifyDate] = useState("");
  const [reason, setReason] = useState("");
  const [offsetType, setOffsetType] = useState("M1");
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelPush, setChannelPush] = useState(true);

  const handleSave = () => {
    showToast("알림이 설정되었습니다.", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="알림 설정">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Select
          label="알림 시점"
          value={offsetType}
          options={[
            { value: "M1", label: "만료 1개월 전" },
            { value: "M3", label: "만료 3개월 전" },
            { value: "M6", label: "만료 6개월 전" },
            { value: "CUSTOM", label: "직접 지정" },
          ]}
          onChange={(e) => setOffsetType(e.target.value)}
        />
        {offsetType === "CUSTOM" && (
          <Input
            label="알림 날짜"
            type="date"
            value={notifyDate}
            onChange={(e) => setNotifyDate(e.target.value)}
          />
        )}
        <Input
          label="알림 사유"
          placeholder="알림 사유를 입력하세요"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div>
          <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-text-sub)", marginBottom: 8 }}>
            알림 채널
          </p>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} />
            이메일
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={channelPush} onChange={(e) => setChannelPush(e.target.checked)} />
            앱 푸시
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={handleSave}>저장</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertSettingModal;
