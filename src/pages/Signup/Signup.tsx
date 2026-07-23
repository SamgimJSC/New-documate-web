import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import PinKeypad from "../../components/common/PinKeypad";
import { useToast } from "../../components/common/Toast";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { useUserStore } from "../../store/userStore";
import {
  formatCountdown,
  PASSWORD_RULE_MESSAGE,
  validatePassword,
} from "../../utils/authValidation";
import "../Login/Login.css";
import "./Signup.css";

type PinStage = "input" | "confirm" | "done";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const setUser = useUserStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [verCode, setVerCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationId, setEmailVerificationId] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [nickname, setNickname] = useState("");

  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinStage, setPinStage] = useState<PinStage>("input");

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!codeSent || emailVerified || seconds <= 0) return;

    const timerId = window.setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [codeSent, emailVerified, seconds]);

  const pinConfirmed = pinStage === "done";
  const passwordValid = validatePassword(password);
  const passwordMatched = password.length > 0 && password === confirmPw;
  const nicknameValid = nickname.trim().length >= 2;

  const canSignup = useMemo(
    () =>
      emailVerified &&
      passwordValid &&
      passwordMatched &&
      nicknameValid &&
      pinConfirmed &&
      termsAgreed &&
      privacyAgreed,
    [
      emailVerified,
      nicknameValid,
      passwordMatched,
      passwordValid,
      pinConfirmed,
      privacyAgreed,
      termsAgreed,
    ],
  );

  const handleSendCode = async () => {
    if (!email.trim() || isSendingCode) return;

    setIsSendingCode(true);
    try {
      const res = await authService.sendEmailVerification(email, "SIGNUP");
      setEmailVerificationId(res.data.emailVerificationId);
      setCodeSent(true);
      setEmailVerified(false);
      setSeconds(180);
      setVerCode("");
      showToast("인증번호가 전송되었습니다.", "success");
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode === "EMAIL_ALREADY_USED") {
        showToast("이미 가입된 이메일입니다.", "error");
      } else {
        showToast("인증번호 전송에 실패했습니다. 다시 시도해주세요.", "error");
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verCode.length !== 6 || seconds <= 0 || isVerifyingCode) return;

    setIsVerifyingCode(true);
    try {
      await authService.verifyEmail(emailVerificationId, verCode);
      setEmailVerified(true);
      showToast("이메일 인증이 완료되었습니다.", "success");
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      // 백엔드는 "코드 틀림"과 "코드 만료"를 구분하지 않고
      // INVALID_EMAIL_VERIFICATION(409) 하나로 합쳐서 던진다.
      if (errorCode === "INVALID_EMAIL_VERIFICATION") {
        showToast("이메일 인증이 유효하지 않습니다. 재전송해주세요.", "error");
      } else {
        showToast("이메일 인증에 실패했습니다. 다시 시도해주세요.", "error");
      }
      setVerCode("");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handlePinSubmit = (value: string) => {
    if (value.length !== 6) {
      showToast("PIN 6자리를 입력해주세요.", "error");
      return;
    }

    if (pinStage === "input") {
      setPin(value);
      setPinConfirm("");
      setPinStage("confirm");
      return;
    }

    if (pinStage === "confirm") {
      if (pin !== value) {
        setPinConfirm("");
        showToast("PIN이 일치하지 않습니다. 다시 입력해주세요.", "error");
        return;
      }

      setPinConfirm(value);
      setPinStage("done");
      showToast("캐비닛 PIN이 설정되었습니다.", "success");
    }
  };

  const resetPin = () => {
    setPin("");
    setPinConfirm("");
    setPinStage("input");
  };

  const handleSignup = async () => {
    if (!canSignup || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await authService.signup({
        email,
        password,
        nickname,
        pinNumber: pin,
        emailVerificationId,
      });

      // 회원가입 응답만으로는 로그인 처리가 되지 않으므로, 동의 항목을 반영하려면
      // 먼저 로그인해서 세션(JWT 쿠키)을 확보해야 한다.
      await authService.login(email, password, false);
      sessionStorage.setItem("sessionActive", "true");

      const user = await userService.getMe();
      setUser(user);

      // 필수 약관은 가입 버튼이 눌린 시점에 이미 체크된 상태이므로 항상 true로 반영한다.
      // 동의 반영이 실패해도 가입 자체는 끝난 상태라 사용자를 막지 않고 조용히 넘어간다.
      const consentUpdates: Promise<unknown>[] = [
        userService.updateConsent("TERMS", true),
        userService.updateConsent("PRIVACY", true),
      ];
      if (marketingAgreed) {
        consentUpdates.push(userService.updateConsent("MARKETING", true));
      }
      await Promise.allSettled(consentUpdates);

      showToast("회원가입이 완료되었습니다!", "success");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const errorCode = err?.response?.data?.errorCode;
      if (errorCode === "EMAIL_ALREADY_USED") {
        showToast("이미 가입된 이메일입니다.", "error");
      } else {
        showToast("회원가입에 실패했습니다. 다시 시도해주세요.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePinValue = pinStage === "input" ? pin : pinConfirm;

  return (
    <div className="login-page signup-page">
      <div className="login-box signup-box">
        <div className="login-logo">
          <img className="login-logo__mark" src="/favicon.png" alt="" />
          <span className="login-logo__text brand-wordmark">
            <span>Docu</span>
            <span className="brand-wordmark__accent">Mate</span>
          </span>
        </div>

        <h1 className="login-title">회원가입</h1>

        <div className="login-form signup-form">
          <span className="signup-step-badge">1단계 · 기본 정보</span>

          <div className="signup-email-row">
            <Input
              type="email"
              label="이메일"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailVerified}
              autoComplete="email"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSendCode}
              disabled={!email.trim() || emailVerified || isSendingCode}
            >
              {isSendingCode ? "전송 중..." : codeSent ? "재전송" : "인증번호 전송"}
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
                    ? "인증 시간이 만료되었습니다. 재전송해주세요."
                    : undefined
                }
              />
              <Button
                variant="secondary"
                size="sm"
                disabled={verCode.length !== 6 || seconds === 0 || isVerifyingCode}
                onClick={handleVerifyCode}
              >
                {isVerifyingCode ? "확인 중..." : "확인"}
              </Button>
            </div>
          )}

          {emailVerified && (
            <p className="signup-success-text">이메일 인증이 완료되었습니다.</p>
          )}

          <Input
            label="닉네임"
            placeholder="2자 이상 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            error={
              nickname && !nicknameValid
                ? "닉네임은 2자 이상 입력해주세요."
                : undefined
            }
          />

          <Input
            type={showPw ? "text" : "password"}
            label="비밀번호"
            placeholder="8~20자, 3종류 중 2종류 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={20}
            error={password && !passwordValid ? PASSWORD_RULE_MESSAGE : undefined}
            suffix={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="login-eye-button"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            maxLength={20}
            error={
              confirmPw && !passwordMatched
                ? "비밀번호가 일치하지 않습니다."
                : undefined
            }
          />

          <section className="signup-pin-card">
            <div className="signup-pin-card__head">
              <div>
                <span className="signup-step-badge">2단계 · 캐비닛 PIN</span>
                <h2>문서 잠금용 PIN 설정</h2>
                <p>민감한 문서를 열 때 사용할 6자리 PIN을 설정해주세요.</p>
              </div>
              {pinConfirmed && <ShieldCheck size={24} />}
            </div>

            {pinConfirmed ? (
              <div className="signup-pin-done">
                <strong>PIN 설정 완료</strong>
                <p>문서 잠금 해제와 PIN 변경에 사용할 준비가 끝났어요.</p>
                <Button variant="secondary" size="sm" onClick={resetPin}>
                  다시 설정
                </Button>
              </div>
            ) : (
              <PinKeypad
                value={activePinValue}
                onChange={pinStage === "input" ? setPin : setPinConfirm}
                onSubmit={handlePinSubmit}
                title={pinStage === "input" ? "PIN 번호 입력" : "PIN 번호 확인"}
                description={
                  pinStage === "input"
                    ? "사용할 PIN 6자리를 입력해주세요."
                    : "같은 PIN을 한 번 더 입력해주세요."
                }
                submitLabel={pinStage === "input" ? "다음" : "확인"}
                showHeader={false}
                helperText="숫자 패드 입력 방식으로 실제 PIN 값은 화면에 노출되지 않습니다."
              />
            )}
          </section>

          <section className="signup-consents">
            <label className="signup-checkbox">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
              />
              <span>
                <strong>[필수]</strong> 서비스 이용약관에 동의합니다.
              </span>
            </label>

            <label className="signup-checkbox">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
              />
              <span>
                <strong>[필수]</strong> 개인정보 처리방침에 동의합니다.
              </span>
            </label>

            <label className="signup-checkbox">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
              />
              <span>
                <em>[선택]</em> 이벤트와 혜택 알림 수신에 동의합니다.
              </span>
            </label>
          </section>

          <Button
            variant="primary"
            fullWidth
            disabled={!canSignup || isSubmitting}
            onClick={handleSignup}
          >
            {isSubmitting ? "가입 처리 중..." : "회원가입 완료"}
          </Button>
        </div>

        <div className="login-links">
          <Link to="/login">이미 계정이 있으신가요?</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
