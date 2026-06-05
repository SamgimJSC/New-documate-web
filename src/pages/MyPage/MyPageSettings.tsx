import React, { useState } from "react";
import PinResetModal from "../../components/modal/PinResetModal";
import { mockUserSettings, mockUserConsents } from "../../data/mockUsers";
import { useToast } from "../../components/common/Toast";
import type { ConsentType } from "../../types/user";
import "./MyPage.css";

const CONSENT_LABELS: Record<ConsentType, string> = {
  TERMS: "이용약관",
  PRIVACY: "개인정보 처리방침",
  MARKETING: "마케팅 수신 동의",
  THIRD_PARTY: "제3자 정보 제공 동의",
};

const MyPageSettings: React.FC = () => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState(mockUserSettings);
  const [consents, setConsents] = useState(mockUserConsents);
  const [pinOpen, setPinOpen] = useState(false);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    showToast("설정이 변경되었습니다.", "success");
  };

  const toggleConsent = (consentId: string) => {
    setConsents((prev) =>
      prev.map((c) => (c.consent_id === consentId ? { ...c, is_agreed: !c.is_agreed } : c))
    );
    showToast("동의 설정이 변경되었습니다.", "success");
  };

  return (
    <div className="mypage-section">
      <h2 className="mypage-section__title">설정</h2>

      <div className="mypage-settings__group">
        <h3 className="mypage-section__subtitle">알림</h3>
        <div className="mypage-settings__toggle-row">
          <div>
            <p className="mypage-settings__toggle-label">푸시 알림</p>
            <p className="mypage-settings__toggle-desc">앱 푸시 알림을 받습니다</p>
          </div>
          <label className="mypage-settings__switch">
            <input type="checkbox" checked={settings.push_enabled} onChange={() => toggleSetting("push_enabled")} />
            <span className="mypage-settings__slider" />
          </label>
        </div>
        <div className="mypage-settings__toggle-row">
          <div>
            <p className="mypage-settings__toggle-label">이메일 알림</p>
            <p className="mypage-settings__toggle-desc">중요 알림을 이메일로 받습니다</p>
          </div>
          <label className="mypage-settings__switch">
            <input type="checkbox" checked={settings.email_noti_enabled} onChange={() => toggleSetting("email_noti_enabled")} />
            <span className="mypage-settings__slider" />
          </label>
        </div>
      </div>

      <div className="mypage-settings__group">
        <h3 className="mypage-section__subtitle">동의 항목</h3>
        {consents.map((c) => (
          <div key={c.consent_id} className="mypage-settings__toggle-row">
            <div>
              <p className="mypage-settings__toggle-label">{CONSENT_LABELS[c.consent_type]}</p>
              {c.is_required && <p className="mypage-settings__toggle-required">필수</p>}
            </div>
            <label className={`mypage-settings__switch${c.is_required ? " mypage-settings__switch--disabled" : ""}`}>
              <input type="checkbox" checked={c.is_agreed} onChange={() => !c.is_required && toggleConsent(c.consent_id)} disabled={c.is_required} />
              <span className="mypage-settings__slider" />
            </label>
          </div>
        ))}
      </div>

      <div className="mypage-settings__group">
        <h3 className="mypage-section__subtitle">보안</h3>
        <div className="mypage-settings__toggle-row">
          <div>
            <p className="mypage-settings__toggle-label">캐비닛 PIN 재설정</p>
            <p className="mypage-settings__toggle-desc">디지털 캐비닛 잠금 PIN을 변경합니다</p>
          </div>
          <button className="mypage-profile__edit-btn" onClick={() => setPinOpen(true)}>재설정</button>
        </div>
      </div>

      <PinResetModal isOpen={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  );
};

export default MyPageSettings;
