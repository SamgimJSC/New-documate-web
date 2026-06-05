import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, UserCircle } from "lucide-react";
import "./Header.css";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "대시보드",
  "/upload": "문서 업로드",
  "/documents": "디지털 캐비닛",
  "/receipts": "영수증 관리",
  "/finance": "가계부",
  "/finance/report": "소비 리포트",
  "/subscription": "요금제",
};

const getPageName = (pathname: string): string => {
  if (pathname.startsWith("/documents/")) return "문서 상세";
  if (pathname.startsWith("/receipts/")) return "영수증 상세";
  return PAGE_NAMES[pathname] || "";
};

interface HeaderProps {
  onFabClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onFabClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = getPageName(location.pathname);

  return (
    <>
      <header className="header">
        <span className="header__page-name">{pageName}</span>
        <div className="header__actions">
          <button className="header__icon-btn" aria-label="알림">
            <Bell size={20} />
          </button>
          <button
            className="header__icon-btn"
            aria-label="마이페이지"
            onClick={() => navigate("/mypage/profile")}
          >
            <UserCircle size={22} />
          </button>
        </div>
      </header>
      {onFabClick && (
        <button className="fab" onClick={onFabClick} aria-label="업로드">
          +
        </button>
      )}
    </>
  );
};

export default Header;
