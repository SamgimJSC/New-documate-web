import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { useToast } from "../common/Toast";
import { documentService } from "../../services/documentService";
import type { DocumentAlert } from "../../types/document";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  existingAlert?: DocumentAlert | null;
  expiryDate?: string | null;
  onSaved: (alert: DocumentAlert) => void;
}

const computeNotifyDate = (offsetType: string, expiryDate?: string | null): string => {
  if (!expiryDate) return "";
  const date = new Date(expiryDate);
  if (offsetType === "M1") date.setMonth(date.getMonth() - 1);
  else if (offsetType === "M3") date.setMonth(date.getMonth() - 3);
  else if (offsetType === "M6") date.setMonth(date.getMonth() - 6);
  return date.toISOString().slice(0, 10);
};

const AlertSettingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentId,
  existingAlert,
  expiryDate,
  onSaved,
}) => {
  const { showToast } = useToast();
  const [offsetType, setOffsetType] = useState("M1");
  const [notifyDate, setNotifyDate] = useState("");
  const [reason, setReason] = useState("");
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelPush, setChannelPush] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (existingAlert) {
      setOffsetType(existingAlert.offset_type);
      setNotifyDate(existingAlert.notify_date.slice(0, 10));
      setReason(existingAlert.reason ?? "");
      setChannelEmail(existingAlert.channel_email);
      setChannelPush(existingAlert.channel_app_push);
    } else {
      const type = "M1";
      setOffsetType(type);
      setNotifyDate(computeNotifyDate(type, expiryDate));
      setReason("");
      setChannelEmail(true);
      setChannelPush(true);
    }
  }, [isOpen, existingAlert, expiryDate]);

  const handleOffsetChange = (value: string) => {
    setOffsetType(value);
    if (value !== "CUSTOM") {
      setNotifyDate(computeNotifyDate(value, expiryDate));
    }
  };

  const handleSave = async () => {
    const finalDate = offsetType === "CUSTOM" ? notifyDate : computeNotifyDate(offsetType, expiryDate);
    if (!finalDate) {
      showToast("알림 날짜를 설정할 수 없습니다. 만료일을 먼저 입력하거나 날짜를 직접 지정해주세요.", "error");
      return;
    }
    setSaving(true);
    try {
      const body = {
        offsetType,
        notifyDate: finalDate,
        reason: reason.trim() || null,
        channelEmail,
        channelAppPush: channelPush,
        channelWebPush: false,
      };
      const saved = existingAlert
        ? await documentService.updateAlert(documentId, existingAlert.alert_id, body)
        : await documentService.createAlert(documentId, body);
      showToast("알림이 설정되었습니다.", "success");
      onSaved(saved);
      onClose();
    } catch {
      showToast("알림 저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const noExpiryWarning = offsetType !== "CUSTOM" && !expiryDate;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingAlert ? "알림 수정" : "알림 설정"}>
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
          onChange={(e) => handleOffsetChange(e.target.value)}
        />
        {noExpiryWarning && (
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-warning, #f59e0b)", margin: 0 }}>
            문서에 만료일이 없습니다. 알림 날짜를 직접 지정해주세요.
          </p>
        )}
        {(offsetType === "CUSTOM" || notifyDate) && (
          <Input
            label="알림 날짜"
            type="date"
            value={notifyDate}
            onChange={(e) => setNotifyDate(e.target.value)}
            disabled={offsetType !== "CUSTOM"}
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
          <Button variant="ghost" onClick={onClose} disabled={saving}>취소</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertSettingModal;
