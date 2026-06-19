import React, { useState } from "react";
import { LockKeyhole, ShieldCheck, UserCircle } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ProfilePhotoModal from "../../components/modal/ProfilePhotoModal";
import PaymentMethodModal from "../../components/modal/PaymentMethodModal";
import { useUserStore } from "../../store/userStore";
import { mockSubscription } from "../../data/mockPayments";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import "./MyPage.css";

type ReauthMethod = "password" | "pin";

const MyPageProfile: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const { showToast } = useToast();
  const [isReauthed, setIsReauthed] = useState(false);
  const [reauthMethod, setReauthMethod] = useState<ReauthMethod>("password");
  const [reauthValue, setReauthValue] = useState("");
  const [editNickname, setEditNickname] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? "");

  if (!user) return null;
  const [photoOpen, setPhotoOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const storagePercent = user.storage_quota_bytes > 0
    ? Math.round((user.storage_used_bytes / user.storage_quota_bytes) * 100)
    : 0;
  const usedMB = (user.storage_used_bytes / 1024 / 1024).toFixed(0);
  const quotaGB = (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0);
  const isReauthValid =
    reauthMethod === "pin"
      ? /^\d{6}$/.test(reauthValue)
      : reauthValue.length >= 1;

  const handleReauth = () => {
    if (!isReauthValid) return;
    setIsReauthed(true);
    setReauthValue("");
    showToast("재인증이 완료되었습니다.", "success");
  };

  const handleSaveNickname = () => {
    setEditNickname(false);
    showToast("닉네임이 변경되었습니다.", "success");
  };

  if (!isReauthed) {
    return (
      <div className="mypage-section">
        <h2 className="mypage-section__title">회원정보 변경</h2>
        <div className="mypage-profile__reauth">
          <div className="mypage-profile__reauth-icon">
            <ShieldCheck size={26} />
          </div>
          <h3 className="mypage-section__subtitle">
            계정 보호를 위해 재인증이 필요합니다
          </h3>
          <p className="mypage-profile__reauth-desc">
            프로필 사진, 닉네임, 결제수단 등 민감한 계정 정보를 변경하기 전에
            PIN 또는 비밀번호를 한 번 더 확인합니다.
          </p>

          <div
            className="mypage-profile__reauth-tabs"
            role="tablist"
            aria-label="재인증 방식 선택"
          >
            <button
              type="button"
              className={`mypage-profile__reauth-tab${reauthMethod === "password" ? " mypage-profile__reauth-tab--active" : ""}`}
              onClick={() => {
                setReauthMethod("password");
                setReauthValue("");
              }}
            >
              비밀번호
            </button>
            <button
              type="button"
              className={`mypage-profile__reauth-tab${reauthMethod === "pin" ? " mypage-profile__reauth-tab--active" : ""}`}
              onClick={() => {
                setReauthMethod("pin");
                setReauthValue("");
              }}
            >
              PIN 6자리
            </button>
          </div>

          <div className="mypage-profile__reauth-form">
            <Input
              type={reauthMethod === "pin" ? "password" : "password"}
              label={reauthMethod === "pin" ? "PIN 번호" : "비밀번호"}
              placeholder={
                reauthMethod === "pin" ? "PIN 6자리 입력" : "현재 비밀번호 입력"
              }
              value={reauthValue}
              onChange={(e) =>
                setReauthValue(
                  reauthMethod === "pin"
                    ? e.target.value.replace(/\D/g, "").slice(0, 6)
                    : e.target.value,
                )
              }
              maxLength={reauthMethod === "pin" ? 6 : 20}
              prefix={<LockKeyhole size={16} />}
            />
            <Button
              variant="primary"
              disabled={!isReauthValid}
              onClick={handleReauth}
            >
              재인증 후 회원정보 보기
            </Button>
            <p className="mypage-profile__reauth-note">
              현재는 시연용 화면으로, 입력 형식만 확인합니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mypage-section">
      <h2 className="mypage-section__title">회원정보 변경</h2>

      <div className="mypage-profile__photo-area">
        <div className="mypage-profile__avatar">
          {user.profile_img_url ? (
            <img src={user.profile_img_url} alt="프로필" />
          ) : (
            <UserCircle size={64} color="var(--color-muted)" />
          )}
        </div>
        <button
          className="mypage-profile__change-photo"
          onClick={() => setPhotoOpen(true)}
        >
          사진 변경
        </button>
      </div>

      <div className="mypage-profile__info">
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">닉네임</span>
          {editNickname ? (
            <div className="mypage-profile__edit-row">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <Button size="sm" onClick={handleSaveNickname}>
                저장
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditNickname(false)}
              >
                취소
              </Button>
            </div>
          ) : (
            <div className="mypage-profile__edit-row">
              <span>{nickname}</span>
              <button
                className="mypage-profile__edit-btn"
                onClick={() => setEditNickname(true)}
              >
                수정
              </button>
            </div>
          )}
        </div>
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">이메일</span>
          <span>{user.email}</span>
        </div>
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">플랜</span>
          <Badge variant={user.plan === "PRO" ? "pro" : "default"}>
            {user.plan}
          </Badge>
        </div>
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">가입일</span>
          <span>{formatDate(user.created_at)}</span>
        </div>
      </div>

      <div className="mypage-profile__storage">
        <div className="mypage-profile__storage-header">
          <span className="mypage-profile__label">스토리지 사용량</span>
          <span className="mypage-profile__storage-text">
            {usedMB}MB / {quotaGB}GB ({storagePercent}%)
          </span>
        </div>
        <div className="mypage-profile__storage-bar">
          <div
            className="mypage-profile__storage-fill"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
      </div>

      <div className="mypage-profile__payment-section">
        <div className="mypage-profile__payment-header">
          <span className="mypage-section__subtitle">결제 수단</span>
          <button
            className="mypage-profile__edit-btn"
            onClick={() => setPaymentOpen(true)}
          >
            변경
          </button>
        </div>
        <div className="mypage-profile__payment-card">
          <p className="mypage-profile__payment-method">카카오페이</p>
          <p className="mypage-profile__payment-sub">
            다음 결제일:{" "}
            {mockSubscription.current_period_end
              ? formatDate(mockSubscription.current_period_end)
              : "-"}
          </p>
        </div>
      </div>

      <ProfilePhotoModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
      />
      <PaymentMethodModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  );
};

export default MyPageProfile;
