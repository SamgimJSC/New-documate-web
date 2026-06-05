import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useToast } from "../../components/common/Toast";
import "./Signup.css";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [verCode, setVerCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");

  const handleSendCode = () => {
    setCodeSent(true);
    showToast("인증번호가 전송되었습니다.", "success");
  };

  const isValid = email && verCode && password && confirmPw && password === confirmPw && nickname && pin.length === 6;

  const handleSignup = () => {
    if (!isValid) return;
    showToast("회원가입이 완료되었습니다.", "success");
    navigate("/login");
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
          <div className="signup-email-row">
            <Input
              type="email"
              label="이메일"
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="secondary" size="sm" onClick={handleSendCode} disabled={!email}>
              인증번호 전송
            </Button>
          </div>
          {codeSent && (
            <div className="signup-email-row">
              <Input
                label="인증번호"
                placeholder="6자리 인증번호"
                value={verCode}
                onChange={(e) => setVerCode(e.target.value)}
                maxLength={6}
              />
              <Button variant="secondary" size="sm" disabled={!verCode}>
                확인
              </Button>
            </div>
          )}
          <Input
            type={showPw ? "text" : "password"}
            label="비밀번호"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            suffix={
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호 재입력"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            error={confirmPw && password !== confirmPw ? "비밀번호가 일치하지 않습니다." : undefined}
          />
          <Input
            label="닉네임"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <div>
            <p className="signup-pin-label">캐비닛 PIN (6자리)</p>
            <div className="signup-pin-row">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`signup-pin-dot${pin.length > i ? " signup-pin-dot--filled" : ""}`}
                />
              ))}
            </div>
            <Input
              type="password"
              placeholder="PIN 6자리 입력"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
          </div>
          <Button variant="primary" fullWidth disabled={!isValid} onClick={handleSignup}>
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
