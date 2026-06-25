import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CreditCard,
  HardDrive,
  LockKeyhole,
  Mail,
  PencilLine,
  ShieldCheck,
  UserCircle,
  UserRound,
} from "lucide-react";
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

const MyPageProfile: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const { showToast } = useToast();

  const [isReauthed, setIsReauthed] = useState(false);
  const [password, setPassword] = useState("");
  const [editNickname, setEditNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [photoOpen, setPhotoOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    if (user?.nickname) {
      setNickname(user.nickname);
    }
  }, [user?.nickname]);

  if (!user) return null;

  const storagePercent =
    user.storage_quota_bytes > 0
      ? Math.min(
          100,
          Math.round(
            (user.storage_used_bytes / user.storage_quota_bytes) * 100,
          ),
        )
      : 0;

  const usedMB = (user.storage_used_bytes / 1024 / 1024).toFixed(0);
  const quotaGB =
    user.storage_quota_bytes > 0
      ? (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0)
      : "-";

  const isPasswordValid = password.trim().length >= 1;

  const handleReauth = () => {
    if (!isPasswordValid) {
      showToast("비밀번호를 입력해주세요.", "error");
      return;
    }

    setIsReauthed(true);
    setPassword("");
    showToast("재인증이 완료되었습니다.", "success");
  };

  const handleSaveNickname = () => {
    if (!nickname.trim()) {
      showToast("닉네임을 입력해주세요.", "error");
      return;
    }

    setEditNickname(false);
    showToast("닉네임이 변경되었습니다.", "success");
  };

  const handleCancelNickname = () => {
    setNickname(user.nickname);
    setEditNickname(false);
  };

  if (!isReauthed) {
    return (
      <div className="mypage-section mypage-profile mypage-profile--reauth-page">
        <section className="mypage-profile__password-gate">
          <div className="mypage-profile__gate-icon">
            <ShieldCheck size={30} />
          </div>

          <div className="mypage-profile__gate-copy">
            <h2>회원 확인이 필요해요</h2>
            <p>
              마이페이지는 개인정보 보호를 위해 비밀번호 확인 후 접근할 수
              있어요.
            </p>
          </div>

          <div className="mypage-profile__gate-form">
            <Input
              label="이메일"
              value={user.email}
              disabled
              prefix={<Mail size={16} />}
            />

            <Input
              type="password"
              label="비밀번호"
              placeholder="현재 비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              prefix={<LockKeyhole size={16} />}
              autoComplete="current-password"
            />

            <Button
              variant="primary"
              disabled={!isPasswordValid}
              onClick={handleReauth}
              fullWidth
            >
              확인하고 회원정보 보기
            </Button>

            <button
              type="button"
              className="mypage-profile__forgot-link"
              onClick={() =>
                showToast(
                  "비밀번호 찾기 화면은 추후 연결 예정입니다.",
                  "success",
                )
              }
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mypage-section mypage-profile mypage-profile--edit-page">
      <section className="mypage-profile__top-card">
        <div className="mypage-profile__top-main">
          <div className="mypage-profile__avatar mypage-profile__avatar--square">
            {user.profile_img_url ? (
              <img src={user.profile_img_url} alt="프로필" />
            ) : (
              <UserCircle size={54} />
            )}
          </div>

          <div>
            <div className="mypage-profile__title-row">
              <h2>회원정보 변경</h2>
              <Badge variant={user.plan === "PRO" ? "pro" : "default"}>
                {user.plan}
              </Badge>
            </div>
            <p>{user.email}</p>
            <span>가입일 {formatDate(user.created_at)}</span>
          </div>
        </div>

        <Button variant="secondary" onClick={() => setPhotoOpen(true)}>
          프로필 사진 변경
        </Button>
      </section>

      <section className="mypage-profile__content-grid">
        <div className="mypage-profile__panel mypage-profile__panel--main">
          <div className="mypage-profile__panel-header">
            <div>
              <h3>기본 정보</h3>
              <p>닉네임과 계정 정보를 확인하고 수정할 수 있어요.</p>
            </div>
          </div>

          <div className="mypage-profile__field-list">
            <div className="mypage-profile__info-row">
              <span className="mypage-profile__row-icon">
                <UserRound size={18} />
              </span>

              <div className="mypage-profile__row-body">
                <span className="mypage-profile__row-label">닉네임</span>

                {editNickname ? (
                  <div className="mypage-profile__nickname-edit">
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="닉네임 입력"
                    />
                    <div className="mypage-profile__nickname-actions">
                      <Button size="sm" onClick={handleSaveNickname}>
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelNickname}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mypage-profile__row-value-wrap">
                    <strong>{nickname}</strong>
                    <button
                      type="button"
                      className="mypage-profile__text-btn"
                      onClick={() => setEditNickname(true)}
                    >
                      <PencilLine size={14} />
                      수정
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mypage-profile__info-row">
              <span className="mypage-profile__row-icon">
                <Mail size={18} />
              </span>

              <div className="mypage-profile__row-body">
                <span className="mypage-profile__row-label">이메일</span>
                <div className="mypage-profile__row-value-wrap">
                  <strong>{user.email}</strong>
                  <Badge
                    variant={user.is_email_verified ? "success" : "warning"}
                  >
                    {user.is_email_verified ? "인증 완료" : "미인증"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mypage-profile__info-row">
              <span className="mypage-profile__row-icon">
                <CreditCard size={18} />
              </span>

              <div className="mypage-profile__row-body">
                <span className="mypage-profile__row-label">현재 플랜</span>
                <div className="mypage-profile__row-value-wrap">
                  <strong>
                    {user.plan === "PRO" ? "PRO 플랜" : "FREE 플랜"}
                  </strong>
                  <Badge variant={user.plan === "PRO" ? "pro" : "default"}>
                    {user.plan}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mypage-profile__info-row">
              <span className="mypage-profile__row-icon">
                <CalendarDays size={18} />
              </span>

              <div className="mypage-profile__row-body">
                <span className="mypage-profile__row-label">가입일</span>
                <strong>{formatDate(user.created_at)}</strong>
              </div>
            </div>
          </div>
        </div>

        <aside className="mypage-profile__side">
          <div className="mypage-profile__panel">
            <div className="mypage-profile__panel-header">
              <div>
                <h3>스토리지</h3>
                <p>문서/영수증 저장 공간</p>
              </div>
              <span className="mypage-profile__storage-chip">
                {storagePercent}%
              </span>
            </div>

            <div className="mypage-profile__storage-summary">
              <HardDrive size={20} />
              <strong>{usedMB}MB</strong>
              <span>/ {quotaGB}GB 사용 중</span>
            </div>

            <div className="mypage-profile__storage-bar">
              <div
                className="mypage-profile__storage-fill"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          <div className="mypage-profile__panel">
            <div className="mypage-profile__panel-header">
              <div>
                <h3>결제 수단</h3>
                <p>PRO 결제에 사용되는 수단</p>
              </div>
              <button
                type="button"
                className="mypage-profile__text-btn"
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
        </aside>
      </section>

      <section className="mypage-profile__safe-note">
        <ShieldCheck size={18} />
        <div>
          <strong>회원정보는 재인증 후에만 수정할 수 있어요.</strong>
          <p>비밀번호 확인 후 안전하게 개인정보를 수정할 수 있습니다.</p>
        </div>
      </section>
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
