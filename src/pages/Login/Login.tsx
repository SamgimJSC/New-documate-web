import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { authService } from "../../services/authService";
import { userService } from "../../services/userService";
import { useUserStore } from "../../store/userStore";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  const setUser = useUserStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !password) return;
    setError("");
    try {
      await authService.login(email, password, remember);
      const user = await userService.getMe();
      setUser(user);
      const redirect = new URLSearchParams(location.search).get("redirect");
      navigate(redirect || "/dashboard");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
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
          <label className="login-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            로그인 상태 계속 유지
          </label>
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
