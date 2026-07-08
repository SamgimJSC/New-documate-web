import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  CreditCard,
  HardDrive,
  Info,
  LockKeyhole,
  Mail,
  PencilLine,
  ShieldCheck,
  UserRound,
  UserX,
} from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PinResetModal from "../../components/modal/PinResetModal";
import { useUserStore } from "../../store/userStore";
import { useToast } from "../../components/common/Toast";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import "./MyPage.css";

const MyPageProfile: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { showToast } = useToast();

  const [isReauthed, setIsReauthed] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [isReauthing, setIsReauthing] = useState(false);

  const [editNickname, setEditNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  const [editPassword, setEditPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [pinOpen, setPinOpen] = useState(false);

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

  const planLabel = user.plan === "PRO" ? "PRO 플랜" : "FREE 플랜";
  const planCaption =
    user.plan === "PRO"
      ? "확장된 저장 공간과 고급 기능을 사용 중입니다."
      : "기본 문서 관리 기능을 사용 중입니다.";
  const paymentLabel =
    user.plan === "PRO" ? "등록된 결제 수단" : "PRO 결제 시 등록";
  const paymentCaption =
    user.plan === "PRO"
      ? "결제 수단 관리는 요금제 관리에서 변경할 수 있어요."
      : "업그레이드할 때 결제 수단을 등록할 수 있어요.";

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleReauth = async () => {
    if (!reauthPassword.trim()) {
      showToast("비밀번호를 입력해주세요.", "error");
      return;
    }

    setIsReauthing(true);
    try {
      const valid = await authService.verifyPassword(reauthPassword);
      if (!valid) {
        showToast("비밀번호가 일치하지 않습니다.", "error");
        return;
      }

      setIsReauthed(true);
      setReauthPassword("");
      showToast("재인증이 완료되었습니다.", "success");
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode === "INVALID_PASSWORD") {
        showToast("비밀번호가 일치하지 않습니다.", "error");
      } else {
        showToast("재인증에 실패했습니다. 다시 시도해주세요.", "error");
      }
    } finally {
      setIsReauthing(false);
    }
  };

  const handleSaveNickname = async () => {
    const trimmed = nickname.trim();

    if (!trimmed) {
      showToast("닉네임을 입력해주세요.", "error");
      return;
    }

    setIsSavingNickname(true);
    try {
      const updatedNickname = await userService.updateNickname(trimmed);
      setNickname(updatedNickname);
      setEditNickname(false);
      if (user) {
        setUser({ ...user, nickname: updatedNickname });
      }
      showToast("닉네임이 변경되었습니다.", "success");
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode === "NICKNAME_ALREADY_USED") {
        showToast("이미 사용 중인 닉네임입니다.", "error");
      } else if (errorCode === "INVALID_NICKNAME") {
        showToast("닉네임 형식을 확인해주세요. (2~8자, 한글 또는 영문)", "error");
      } else {
        showToast("닉네임 변경에 실패했습니다.", "error");
      }
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleCancelNickname = () => {
    setNickname(user.nickname ?? "");
    setEditNickname(false);
  };

  const handleSavePassword = async () => {
    if (!currentPassword.trim()) {
      showToast("현재 비밀번호를 입력해주세요.", "error");
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      showToast("새 비밀번호를 모두 입력해주세요.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showToast("새 비밀번호는 8자 이상 입력해주세요.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("새 비밀번호가 일치하지 않습니다.", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      resetPasswordForm();
      setEditPassword(false);
      showToast("비밀번호가 변경되었습니다.", "success");
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode === "INVALID_PASSWORD") {
        showToast("현재 비밀번호가 일치하지 않습니다.", "error");
      } else if (errorCode === "INVALID_NEW_PASSWORD_FORMAT") {
        showToast("새 비밀번호 형식을 확인해주세요.", "error");
      } else {
        showToast("비밀번호 변경에 실패했습니다.", "error");
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    resetPasswordForm();
    setEditPassword(false);
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
              개인정보 보호를 위해 비밀번호 확인 후 회원정보를 수정할 수 있어요.
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
              value={reauthPassword}
              onChange={(e) => setReauthPassword(e.target.value)}
              prefix={<LockKeyhole size={16} />}
              autoComplete="current-password"
            />

            <Button
              variant="primary"
              disabled={!reauthPassword.trim() || isReauthing}
              onClick={handleReauth}
              fullWidth
            >
              {isReauthing ? "확인 중..." : "확인하고 회원정보 보기"}
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
      <section className="mypage-profile__unified-card mypage-profile__unified-card--no-photo">
        <div className="mypage-profile__unified-account">
          <div className="mypage-profile__card-title">
            <h3>기본 정보</h3>
            <p>자주 변경하는 정보와 보안 설정만 모아두었어요.</p>
          </div>

          <div className="mypage-profile__account-rows">
            <div className="mypage-profile__account-row">
              <span className="mypage-profile__row-icon">
                <UserRound size={18} />
              </span>

              <span className="mypage-profile__row-title">닉네임</span>

              <div className="mypage-profile__row-main">
                {editNickname ? (
                  <div className="mypage-profile__inline-edit">
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="닉네임을 입력해주세요"
                    />
                    <div className="mypage-profile__inline-actions">
                      <Button
                        size="sm"
                        onClick={handleSaveNickname}
                        disabled={isSavingNickname}
                      >
                        {isSavingNickname ? "저장 중..." : "저장"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelNickname}
                        disabled={isSavingNickname}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mypage-profile__row-value-line">
                    <strong>{nickname || user.nickname}</strong>
                    <button
                      type="button"
                      className="mypage-profile__row-action"
                      onClick={() => setEditNickname(true)}
                    >
                      <PencilLine size={15} />
                      수정
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mypage-profile__account-row">
              <span className="mypage-profile__row-icon">
                <Mail size={18} />
              </span>

              <span className="mypage-profile__row-title">이메일</span>

              <div className="mypage-profile__row-main">
                <div className="mypage-profile__row-value-line">
                  <strong className="mypage-profile__muted-value">
                    {user.email}
                  </strong>
                  <span className="mypage-profile__disabled-chip">
                    변경 불가
                  </span>
                </div>
                <small>이메일은 변경할 수 없습니다.</small>
              </div>
            </div>

            <div className="mypage-profile__account-subtitle">보안 정보</div>

            <div
              className={`mypage-profile__account-row mypage-profile__account-row--password${
                editPassword ? " mypage-profile__account-row--expanded" : ""
              }`}
            >
              <span className="mypage-profile__row-icon">
                <LockKeyhole size={18} />
              </span>

              <span className="mypage-profile__row-title">비밀번호</span>

              <div className="mypage-profile__row-main">
                {!editPassword && (
                  <div className="mypage-profile__row-value-line">
                    <strong>••••••••</strong>
                    <button
                      type="button"
                      className="mypage-profile__row-action"
                      aria-expanded={editPassword}
                      onClick={() => setEditPassword(true)}
                    >
                      <PencilLine size={15} />
                      수정
                    </button>
                  </div>
                )}

                {editPassword && (
                  <div className="mypage-profile__password-edit">
                    <div className="mypage-profile__password-edit-grid">
                      <Input
                        type="password"
                        label="현재 비밀번호"
                        placeholder="현재 비밀번호를 입력해주세요"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        prefix={<LockKeyhole size={16} />}
                        autoComplete="current-password"
                      />

                      <Input
                        type="password"
                        label="새 비밀번호"
                        placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        prefix={<LockKeyhole size={16} />}
                        autoComplete="new-password"
                      />

                      <Input
                        type="password"
                        label="새 비밀번호 확인"
                        placeholder="새 비밀번호를 다시 입력해주세요"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        prefix={<LockKeyhole size={16} />}
                        autoComplete="new-password"
                      />
                    </div>

                    <div className="mypage-profile__password-help">
                      <Info size={16} />
                      <span>
                        비밀번호 변경 시 현재 비밀번호 확인이 필요합니다.
                      </span>
                    </div>

                    <div className="mypage-profile__inline-actions mypage-profile__password-actions">
                      <Button
                        size="sm"
                        onClick={handleSavePassword}
                        disabled={isSavingPassword}
                      >
                        {isSavingPassword ? "변경 중..." : "변경하기"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelPassword}
                        disabled={isSavingPassword}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mypage-profile__account-row">
              <span className="mypage-profile__row-icon">
                <LockKeyhole size={18} />
              </span>

              <span className="mypage-profile__row-title">캐비닛 PIN</span>

              <div className="mypage-profile__row-main">
                <div className="mypage-profile__row-value-line">
                  <strong>설정됨</strong>
                  <button
                    type="button"
                    className="mypage-profile__row-action"
                    onClick={() => setPinOpen(true)}
                  >
                    <PencilLine size={15} />
                    재설정
                  </button>
                </div>
                <small>문서를 잠글 때 사용하는 디지털 캐비닛 PIN입니다.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mypage-profile__usage-card">
        <div className="mypage-profile__usage-head">
          <div>
            <h3>이용 정보</h3>
            <p>현재 계정 상태를 한눈에 확인할 수 있어요.</p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate("/mypage/plan")}
          >
            요금제 관리
          </Button>
        </div>

        <div className="mypage-profile__usage-grid">
          <div className="mypage-profile__usage-item">
            <span className="mypage-profile__usage-icon">
              <CreditCard size={18} />
            </span>

            <div className="mypage-profile__usage-body">
              <span>현재 플랜</span>
              <div className="mypage-profile__usage-value-line">
                <strong>{planLabel}</strong>
                <em className={user.plan === "PRO" ? "is-pro" : ""}>
                  {user.plan}
                </em>
              </div>
              <p>{planCaption}</p>
            </div>
          </div>

          <div className="mypage-profile__usage-item">
            <span className="mypage-profile__usage-icon">
              <HardDrive size={18} />
            </span>

            <div className="mypage-profile__usage-body">
              <span>스토리지</span>
              <div className="mypage-profile__usage-value-line">
                <strong>{usedMB}MB</strong>
                <small>/ {quotaGB}GB 사용 중</small>
              </div>
              <div className="mypage-profile__mini-storage-bar">
                <span style={{ width: `${storagePercent}%` }} />
              </div>
            </div>
          </div>

          <div className="mypage-profile__usage-item">
            <span className="mypage-profile__usage-icon">
              <CreditCard size={18} />
            </span>

            <div className="mypage-profile__usage-body">
              <span>결제 수단</span>
              <strong>{paymentLabel}</strong>
              <p>{paymentCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mypage-profile__footer-grid">
        <section className="mypage-profile__safe-note mypage-profile__safe-note--single">
          <ShieldCheck size={20} />
          <div>
            <strong>안전한 계정 관리</strong>
            <p>
              회원정보는 안전하게 암호화되어 저장되며, 개인정보 보호를
              최우선으로 합니다.
            </p>
          </div>
        </section>

        <button
          type="button"
          className="mypage-profile__withdraw-card"
          onClick={() => navigate("/mypage/withdraw")}
        >
          <span className="mypage-profile__withdraw-icon">
            <UserX size={18} />
          </span>

          <span className="mypage-profile__withdraw-copy">
            <strong>회원탈퇴</strong>
            <p>계정과 모든 문서, 영수증, 분석 데이터가 삭제됩니다.</p>
          </span>

          <ChevronRight size={18} />
        </button>
      </section>

      <PinResetModal isOpen={pinOpen} onClose={() => setPinOpen(false)} />
    </div>
  );
};

export default MyPageProfile;
