import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { CreditCard, Home, LogOut, Settings, User, UserX } from "lucide-react";
import { authService } from "../../services/authService";
import "./MyPageLayout.css";

const myPageNav = [
  { to: "/mypage", icon: <Home size={16} />, label: "프로필 메인", end: true },
  { to: "/mypage/profile", icon: <User size={16} />, label: "회원정보 변경" },
  { to: "/mypage/settings", icon: <Settings size={16} />, label: "설정" },
  { to: "/mypage/plan", icon: <CreditCard size={16} />, label: "요금제 관리" },
  {
    to: "/mypage/withdraw",
    icon: <UserX size={16} />,
    label: "회원탈퇴",
    danger: true,
  },
];

const MyPageLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="mypage-layout">
      <aside className="mypage-sidebar">
        <div className="mypage-sidebar__brand">
          <span>D</span>
          <div>
            <strong>DocuMate</strong>
            <p>마이페이지</p>
          </div>
        </div>

        <nav className="mypage-sidebar__nav" aria-label="마이페이지 메뉴">
          {myPageNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `mypage-sidebar__item${isActive ? " mypage-sidebar__item--active" : ""}${
                  item.danger ? " mypage-sidebar__item--danger" : ""
                }`
              }
            >
              <span className="mypage-sidebar__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mypage-sidebar__footer">
          <button
            type="button"
            className="mypage-sidebar__logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            로그아웃
          </button>
          <p>로그아웃 클릭 시 바로 로그인 화면으로 이동합니다.</p>
        </div>
      </aside>

      <main className="mypage-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MyPageLayout;
