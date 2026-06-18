import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [remember] = useState(true);

  const handleLogin = () => {
    if (!email || !password) return;
    setError("");
    localStorage.setItem(
      "documate_access_token",
      "demo-jwt-token-without-expiry",
    );
    localStorage.setItem("documate_login_device", window.navigator.userAgent);
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="login-logo__mark">D</span>
          <span className="login-logo__text">DocuMate</span>
        </div>
        <h1 className="login-title">로그인</h1>
        <div className="login-form">
          <Input
            type="email"
            label="이메일"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type={showPw ? "text" : "password"}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
          <label className="login-remember login-remember--fixed">
            <input type="checkbox" checked={remember} readOnly />
            로그인 상태 계속 유지
          </label>
          <p className="login-helper">
            JWT 토큰은 시연 정책상 컴퓨터 변경 전까지 유지됩니다. 웹/앱 로그인
            정책은 동일하게 적용됩니다.
          </p>
          {error && <p className="login-error">{error}</p>}
          <Button
            variant="primary"
            fullWidth
            disabled={!email || !password}
            onClick={handleLogin}
          >
            로그인
          </Button>
        </div>
        <div className="login-links">
          <Link to="/signup">회원가입</Link>
          <span className="login-links__sep">·</span>
          <Link to="/reset-password">비밀번호 재설정</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
