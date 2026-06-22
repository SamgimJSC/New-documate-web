import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./MyPageLayout.css";

const PAGE_TITLES: Record<string, string> = {
  "/mypage": "마이페이지",
  "/mypage/profile": "회원정보 변경",
  "/mypage/settings": "설정",
  "/mypage/plan": "요금제 관리",
  "/mypage/withdraw": "회원탈퇴",
};

const PAGE_SUBTITLES: Record<string, string> = {
  "/mypage": "계정 상태와 주요 설정을 간단하게 확인해보세요.",
  "/mypage/profile": "닉네임, 프로필 사진, 계정 정보를 수정할 수 있어요.",
  "/mypage/settings": "알림, 보안, 동의사항을 관리할 수 있어요.",
  "/mypage/plan": "현재 요금제와 결제 정보를 확인할 수 있어요.",
  "/mypage/withdraw": "회원탈퇴 전 안내사항을 확인해주세요.",
};

const MyPageLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/mypage";
  const pageTitle = PAGE_TITLES[location.pathname] ?? "마이페이지";
  const pageSubtitle =
    PAGE_SUBTITLES[location.pathname] ??
    "계정 정보를 확인하고 설정을 관리할 수 있어요.";

  const handleLogout = () => {
    localStorage.removeItem("documate_access_token");
    localStorage.removeItem("documate_refresh_token");
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mypage-layout">
      <header className="mypage-topbar">
        <button
          type="button"
          className="mypage-topbar__brand"
          onClick={() => navigate("/dashboard")}
        >
          <span className="mypage-topbar__logo">D</span>
          <span className="mypage-topbar__brand-text">DocuMate</span>
        </button>

        <div className="mypage-topbar__actions">
          <button
            type="button"
            className="mypage-topbar__icon-btn"
            aria-label="알림"
          >
            🔔
          </button>

          <button
            type="button"
            className="mypage-topbar__profile-btn"
            onClick={() => navigate("/mypage")}
          >
            <span>👤</span>
            <span>내 계정</span>
          </button>
        </div>
      </header>

      <main className="mypage-shell">
        <div className="mypage-shell__inner">
          <section className="mypage-page-head">
            <div className="mypage-page-head__left">
              {!isHome && (
                <button
                  type="button"
                  className="mypage-back-btn"
                  onClick={() => navigate("/mypage")}
                >
                  ← 마이페이지
                </button>
              )}

              <div>
                <p className="mypage-page-head__eyebrow">My Page</p>
                <h1 className="mypage-page-head__title">{pageTitle}</h1>
                <p className="mypage-page-head__desc">{pageSubtitle}</p>
              </div>
            </div>

            <button
              type="button"
              className="mypage-logout-btn"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </section>

          <div className="mypage-content">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyPageLayout;
