import React, { useState } from "react";
import {
  Bell,
  FileCheck2,
  Mail,
  Megaphone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import { mockUserSettings, mockUserConsents } from "../../data/mockUsers";
import { useToast } from "../../components/common/Toast";
import type { ConsentType } from "../../types/user";
import "./MyPage.css";

const CONSENT_LABELS: Record<ConsentType, string> = {
  TERMS: "서비스 이용약관",
  PRIVACY: "개인정보 처리방침",
  MARKETING: "마케팅 정보 수신 동의",
  THIRD_PARTY: "제3자 정보 제공 동의",
};

const CONSENT_DESCS: Record<ConsentType, string> = {
  TERMS: "서비스 이용을 위한 필수 약관입니다.",
  PRIVACY: "개인정보 처리 및 보관에 대한 필수 동의입니다.",
  MARKETING: "혜택, 이벤트, 기능 안내를 받을 수 있습니다.",
  THIRD_PARTY: "제휴 서비스 제공 시 필요한 선택 동의입니다.",
};

const MyPageSettings: React.FC = () => {
  const { showToast } = useToast();

  const [settings, setSettings] = useState(mockUserSettings);
  const [consents, setConsents] = useState(mockUserConsents);
  const [showSavedNote, setShowSavedNote] = useState(false);

  const marketingConsent =
    consents.find((c) => c.consent_type === "MARKETING")?.is_agreed ?? false;

  const toggleSetting = (key: keyof typeof settings) => {
    if (key === "push_enabled" && !marketingConsent) {
      showToast(
        "마케팅 정보 수신 동의 후 FCM 푸시 알림을 켤 수 있습니다.",
        "error",
      );
      return;
    }

    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
      updated_at: new Date().toISOString(),
    }));

    setShowSavedNote(true);
    showToast("설정이 변경되었습니다.", "success");
  };

  const toggleConsent = (consentId: string) => {
    setConsents((prev) =>
      prev.map((consent) => {
        if (consent.consent_id !== consentId) return consent;
        if (consent.is_required) return consent;

        const nextAgreed = !consent.is_agreed;

        if (consent.consent_type === "MARKETING" && !nextAgreed) {
          setSettings((current) => ({
            ...current,
            push_enabled: false,
            updated_at: new Date().toISOString(),
          }));
        }

        return {
          ...consent,
          is_agreed: nextAgreed,
          agreed_at: nextAgreed ? new Date().toISOString() : undefined,
        };
      }),
    );

    setShowSavedNote(true);
    showToast("동의 설정이 변경되었습니다.", "success");
  };

  return (
    <div className="mypage-section mypage-settings-figma">
      <section className="mypage-settings-figma__panel">
        <div className="mypage-settings-figma__panel-head">
          <div>
            <h3>알림 설정</h3>
            <p>중요 알림과 서비스 안내 수신 방식을 선택하세요.</p>
          </div>
          <Bell size={20} />
        </div>

        <div className="mypage-settings-figma__rows">
          <div className="mypage-settings-figma__row">
            <span className="mypage-settings-figma__icon">
              <Mail size={18} />
            </span>

            <div className="mypage-settings-figma__copy">
              <strong>이메일 알림</strong>
              <p>문서 만료, 결제, 보안 관련 중요 알림을 이메일로 받습니다.</p>
            </div>

            <label className="mypage-settings__switch">
              <input
                type="checkbox"
                checked={settings.email_noti_enabled}
                onChange={() => toggleSetting("email_noti_enabled")}
              />
              <span className="mypage-settings__slider" />
            </label>
          </div>

          <div className="mypage-settings-figma__row">
            <span className="mypage-settings-figma__icon">
              <Smartphone size={18} />
            </span>

            <div className="mypage-settings-figma__copy">
              <strong>FCM 푸시 알림</strong>
              <p>
                웹/앱 공통 푸시 알림을 받습니다. 마케팅 동의가 꺼져 있으면
                사용할 수 없어요.
              </p>
            </div>

            <label
              className={`mypage-settings__switch${
                !marketingConsent ? " mypage-settings__switch--disabled" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={marketingConsent && settings.push_enabled}
                onChange={() => toggleSetting("push_enabled")}
                disabled={!marketingConsent}
              />
              <span className="mypage-settings__slider" />
            </label>
          </div>

          {!marketingConsent && (
            <div className="mypage-settings-figma__warning">
              <Megaphone size={16} />
              <p>
                마케팅 정보 수신 동의가 꺼져 있어 FCM 푸시 알림이
                비활성화되었습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mypage-settings-figma__panel">
        <div className="mypage-settings-figma__panel-head">
          <div>
            <h3>약관 및 정보 수신 동의</h3>
            <p>필수 약관과 선택 동의 상태를 확인할 수 있어요.</p>
          </div>
          <FileCheck2 size={20} />
        </div>

        <div className="mypage-settings-figma__consent-list">
          {consents.map((consent) => (
            <div
              key={consent.consent_id}
              className="mypage-settings-figma__consent-row"
            >
              <div className="mypage-settings-figma__copy">
                <div className="mypage-settings-figma__title-line">
                  <strong>{CONSENT_LABELS[consent.consent_type]}</strong>
                  <Badge variant={consent.is_required ? "default" : "primary"}>
                    {consent.is_required ? "필수" : "선택"}
                  </Badge>
                </div>
                <p>{CONSENT_DESCS[consent.consent_type]}</p>
              </div>

              <label
                className={`mypage-settings__switch${
                  consent.is_required ? " mypage-settings__switch--disabled" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={consent.is_agreed}
                  onChange={() => toggleConsent(consent.consent_id)}
                  disabled={consent.is_required}
                />
                <span className="mypage-settings__slider" />
              </label>
            </div>
          ))}
        </div>
      </section>

      {showSavedNote && (
        <section className="mypage-settings-figma__safe-note">
          <ShieldCheck size={18} />
          <div>
            <strong>설정 변경 내용이 저장되었습니다.</strong>
            <p>필수 동의 항목은 서비스 이용을 위해 해제할 수 없습니다.</p>
          </div>
        </section>
      )}

    </div>
  );
};

export default MyPageSettings;
