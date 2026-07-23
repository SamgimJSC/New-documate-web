import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import {
  formatCountdown,
  PASSWORD_RULE_MESSAGE,
  validatePassword,
} from "../../utils/authValidation";
import "./Login.css";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [verCode, setVerCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!codeSent || emailVerified || seconds <= 0) return;

    const timerId = window.setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [codeSent, emailVerified, seconds]);

  const sendCode = () => {
    setCodeSent(true);
    setEmailVerified(false);
    setSeconds(180);
    setVerCode("");
    showToast("비밀번호 재설정 인증번호가 전송되었습니다.", "success");
  };

  const verifyCode = () => {
    if (verCode.length !== 6 || seconds <= 0) return;
    setEmailVerified(true);
    showToast("이메일 인증이 완료되었습니다.", "success");
  };

  const canReset =
    emailVerified && validatePassword(password) && password === confirmPw;

  const handleReset = () => {
    if (!canReset) return;
    setComplete(true);
    showToast("비밀번호가 재설정되었습니다.", "success");
    window.setTimeout(() => navigate("/login", { replace: true }), 900);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img className="login-logo__mark" src="/favicon.png" alt="" />
          <span className="login-logo__text brand-wordmark">
            <span>Docu</span>
            <span className="brand-wordmark__accent">Mate</span>
          </span>
        </div>
        <h1 className="login-title">비밀번호 재설정</h1>
        <div className="login-form">
          <span className="reset-step-badge">
            이메일 인증 후 새 비밀번호 입력
          </span>
          <div className="signup-email-row">
            <Input
              type="email"
              label="이메일"
              placeholder="가입한 이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailVerified}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={sendCode}
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
                onClick={verifyCode}
              >
                확인
              </Button>
            </div>
          )}

          {emailVerified && (
            <p className="login-helper">
              이메일 인증 완료. 새 비밀번호를 입력해주세요.
            </p>
          )}

          <Input
            type={showPw ? "text" : "password"}
            label="새 비밀번호"
            placeholder="8~20자, 3종류 중 2종류 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={20}
            error={
              password && !validatePassword(password)
                ? PASSWORD_RULE_MESSAGE
                : undefined
            }
            disabled={!emailVerified}
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
            label="새 비밀번호 확인"
            placeholder="비밀번호 재입력"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            maxLength={20}
            disabled={!emailVerified}
            error={
              confirmPw && password !== confirmPw
                ? "비밀번호가 일치하지 않습니다."
                : undefined
            }
          />

          {complete && (
            <div className="reset-complete">
              <strong>재설정 완료</strong>
              <p className="reset-helper">
                잠시 후 로그인 화면으로 이동합니다.
              </p>
            </div>
          )}

          <Button
            variant="primary"
            fullWidth
            disabled={!canReset}
            onClick={handleReset}
          >
            비밀번호 재설정 완료
          </Button>
        </div>
        <div className="login-links">
          <Link to="/login">로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
