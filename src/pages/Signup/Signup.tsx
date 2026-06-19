import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import {
  formatCountdown,
  getPasswordRuleState,
  PASSWORD_RULE_MESSAGE,
} from "../../utils/authValidation";
import { authService } from "../../services/authService";
import "./Signup.css";

type PinStep = "input" | "confirm" | "done";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [verCode, setVerCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationId, setEmailVerificationId] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinStep, setPinStep] = useState<PinStep>("input");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const passwordRule = getPasswordRuleState(password);
  const pinConfirmed = pinStep === "done";

  useEffect(() => {
    if (!codeSent || emailVerified || seconds <= 0) return;

    const timerId = window.setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [codeSent, emailVerified, seconds]);

  const handleSendCode = async () => {
    try {
      const res = await authService.sendEmailVerification(email, "SIGNUP");
      setEmailVerificationId(res.data.emailVerificationId);
      setCodeSent(true);
      setEmailVerified(false);
      setSeconds(180);
      setVerCode("");
      showToast("인증번호가 전송되었습니다.", "success");
    } catch {
      showToast("인증번호 전송에 실패했습니다.", "error");
    }
  };

  const handleVerifyCode = async () => {
    if (verCode.length !== 6 || seconds <= 0) return;
    try {
      await authService.verifyEmail(emailVerificationId, verCode);
      setEmailVerified(true);
      showToast("이메일 인증이 완료되었습니다.", "success");
    } catch {
      showToast("인증번호가 올바르지 않습니다.", "error");
    }
  };

  const handlePinInput = (value: string) => {
    setPin(value.replace(/\D/g, "").slice(0, 6));
    setPinConfirm("");
    setPinStep("input");
    setBiometricEnabled(false);
  };

  const handlePinConfirmInput = (value: string) => {
    setPinConfirm(value.replace(/\D/g, "").slice(0, 6));
  };

  const moveToPinConfirm = () => {
    if (pin.length !== 6) return;
    setPinStep("confirm");
  };

  const completePinConfirm = () => {
    if (pinConfirm.length !== 6 || pin !== pinConfirm) return;
    setPinStep("done");
    showToast("PIN 확인이 완료되었습니다.", "success");
  };

  const isValid =
    emailVerified &&
    passwordRule.isValid &&
    password === confirmPw &&
    nickname.trim().length > 0 &&
    pinConfirmed &&
    termsAgreed &&
    privacyAgreed;

  const handleSignup = async () => {
    if (!isValid) return;
    try {
      await authService.signup({
        email,
        password,
        nickname,
        pinNumber: pin,
        emailVerificationId,
      });
      showToast("회원가입이 완료되었습니다.", "success");
      navigate("/login");
    } catch {
      showToast("회원가입에 실패했습니다.", "error");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <div className="signup-logo">
          <span className="signup-logo__mark">D</span>
          <span className="signup-logo__text">DocuMate</span>
        </div>
        <h1 className="signup-title">회원가입</h1>
        <div className="signup-form">
          <section className="signup-section">
            <div className="signup-section__head">
              <strong>1. 이메일 인증</strong>
              {emailVerified && <span>인증 완료</span>}
            </div>
            <div className="signup-email-row">
              <Input
                type="email"
                label="이메일"
                placeholder="이메일 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={emailVerified}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendCode}
                disabled={!email || emailVerified}
              >
                {codeSent ? "재발송" : "인증번호 전송"}
              </Button>
            </div>
            {codeSent && !emailVerified && (
              <div className="signup-email-row">
                <Input
                  label={`인증번호 ${seconds > 0 ? formatCountdown(seconds) : "만료"}`}
                  placeholder="6자리 인증번호"
                  value={verCode}
                  onChange={(e) =>
                    setVerCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  error={
                    seconds === 0
                      ? "인증 시간이 만료되었습니다. 재발송해주세요."
                      : undefined
                  }
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={verCode.length !== 6 || seconds === 0}
                  onClick={handleVerifyCode}
                >
                  확인
                </Button>
              </div>
            )}
          </section>

          <section className="signup-section">
            <div className="signup-section__head">
              <strong>2. 계정 정보</strong>
            </div>
            <Input
              type={showPw ? "text" : "password"}
              label="비밀번호"
              placeholder="8~20자, 3종류 중 2종류 이상"
              value={password}
              maxLength={20}
              onChange={(e) => setPassword(e.target.value)}
              error={
                password && !passwordRule.isValid
                  ? PASSWORD_RULE_MESSAGE
                  : undefined
              }
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="signup-eye-button"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <div className="signup-password-rules">
              <span className={passwordRule.isLengthValid ? "is-ok" : ""}>
                8~20자
              </span>
              <span className={passwordRule.typeCount >= 2 ? "is-ok" : ""}>
                영문/숫자/특수기호 중 2가지 이상
              </span>
              <span className={passwordRule.hasNoSpace ? "is-ok" : ""}>
                공백 제외
              </span>
            </div>
            <Input
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호 재입력"
              value={confirmPw}
              maxLength={20}
              onChange={(e) => setConfirmPw(e.target.value)}
              error={
                confirmPw && password !== confirmPw
                  ? "비밀번호가 일치하지 않습니다."
                  : undefined
              }
            />
            <Input
              label="닉네임"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <p className="signup-helper">닉네임 중복은 허용됩니다.</p>
          </section>

          <section className="signup-section">
            <div className="signup-section__head">
              <strong>3. 캐비닛 PIN 설정</strong>
              {pinConfirmed && <span>설정 완료</span>}
            </div>
            <p className="signup-pin-label">
              PIN 번호는 6자리 숫자로 설정해주세요.
            </p>
            <div className="signup-pin-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`signup-pin-dot${(pinStep === "confirm" ? pinConfirm : pin).length > i ? " signup-pin-dot--filled" : ""}`}
                />
              ))}
            </div>
            {pinStep === "input" && (
              <div className="signup-pin-action-row">
                <Input
                  type="password"
                  placeholder="PIN 6자리 입력"
                  value={pin}
                  onChange={(e) => handlePinInput(e.target.value)}
                  maxLength={6}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pin.length !== 6}
                  onClick={moveToPinConfirm}
                >
                  확인
                </Button>
              </div>
            )}
            {pinStep === "confirm" && (
              <div className="signup-pin-action-row">
                <Input
                  type="password"
                  placeholder="PIN 6자리 재입력"
                  value={pinConfirm}
                  onChange={(e) => handlePinConfirmInput(e.target.value)}
                  maxLength={6}
                  error={
                    pinConfirm.length === 6 && pin !== pinConfirm
                      ? "PIN 번호가 일치하지 않습니다."
                      : undefined
                  }
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pinConfirm.length !== 6 || pin !== pinConfirm}
                  onClick={completePinConfirm}
                >
                  확인 완료
                </Button>
              </div>
            )}
            {pinConfirmed && (
              <p className="signup-helper signup-helper--success">
                PIN 재입력 확인이 완료되었습니다.
              </p>
            )}
            <label
              className={`signup-checkbox${!pinConfirmed ? " signup-checkbox--disabled" : ""}`}
            >
              <input
                type="checkbox"
                checked={biometricEnabled}
                disabled={!pinConfirmed}
                onChange={(e) => setBiometricEnabled(e.target.checked)}
              />
              생체인증 등록하기 <span>PIN 확인 완료 후 등록 가능</span>
            </label>
          </section>

          <section className="signup-section">
            <div className="signup-section__head">
              <strong>4. 동의사항</strong>
            </div>
            <label className="signup-checkbox">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
              />
              서비스 이용약관 동의 <strong>필수</strong>
            </label>
            <label className="signup-checkbox">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
              />
              개인정보 처리방침 동의 <strong>필수</strong>
            </label>
            <label className="signup-checkbox">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
              />
              마케팅 정보 수신 동의 <em>선택 · 이메일/FCM</em>
            </label>
            {!marketingAgreed && (
              <p className="signup-helper">
                마케팅 동의 미체크 시 가입 후 푸시 알림 설정이 비활성화됩니다.
              </p>
            )}
          </section>

          <Button
            variant="primary"
            fullWidth
            disabled={!isValid}
            onClick={handleSignup}
          >
            회원가입
          </Button>
        </div>
        <div className="signup-links">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
