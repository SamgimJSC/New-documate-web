import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { User, Settings, CreditCard, LogOut, UserX } from "lucide-react";
import "./MyPageLayout.css";

const myPageNav = [
  { to: "/mypage/profile", icon: <User size={16} />, label: "프로필" },
  { to: "/mypage/settings", icon: <Settings size={16} />, label: "설정" },
  { to: "/mypage/plan", icon: <CreditCard size={16} />, label: "요금제 관리" },
  { to: "/mypage/logout", icon: <LogOut size={16} />, label: "로그아웃" },
  { to: "/mypage/withdraw", icon: <UserX size={16} />, label: "회원탈퇴" },
];

const MyPageLayout: React.FC = () => {
  return (
    <div className="mypage-layout">
      <aside className="mypage-sidebar">
        <h2 className="mypage-sidebar__title">마이페이지</h2>
        <nav className="mypage-sidebar__nav">
          {myPageNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `mypage-sidebar__item${isActive ? " mypage-sidebar__item--active" : ""}${
                  item.to === "/mypage/withdraw" ? " mypage-sidebar__item--danger" : ""
                }`
              }
            >
              <span className="mypage-sidebar__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="mypage-content">
        <Outlet />
      </div>
    </div>
  );
};

export default MyPageLayout;
