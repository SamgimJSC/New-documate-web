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
  const [remember, setRemember] = useState(false);

  const handleLogin = () => {
    if (!email || !password) return;
    setError("");
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
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)", display: "flex" }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <label className="login-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            로그인 상태 유지
          </label>
          {error && <p className="login-error">{error}</p>}
          <Button variant="primary" fullWidth disabled={!email || !password} onClick={handleLogin}>
            로그인
          </Button>
        </div>
        <div className="login-links">
          <Link to="/signup">회원가입</Link>
          <span className="login-links__sep">·</span>
          <a href="#">비밀번호 찾기</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
