import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";
import Badge from "../common/Badge";
import "./Header.css";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard": "대시보드",
  "/upload": "문서 업로드",
  "/upload/manual": "수기 등록",
  "/processing-center": "처리 센터",
  "/documents": "디지털 캐비닛",
  "/receipts": "영수증 관리",
  "/finance": "가계부",
  "/finance/report": "소비 리포트",
  "/subscription": "요금제",
};

const getPageName = (pathname: string): string => {
  if (pathname.startsWith("/documents/")) return "문서 상세";
  if (pathname.startsWith("/receipts/")) return "영수증 상세";
  if (pathname.startsWith("/mypage")) return "마이페이지";
  return PAGE_NAMES[pathname] || "";
};

type HeaderBreadcrumb = {
  parentLabel: string;
  parentPath: string;
  currentLabel: string;
};

const getHeaderBreadcrumb = (pathname: string): HeaderBreadcrumb | null => {
  if (pathname === "/upload") {
    return {
      parentLabel: "문서 관리",
      parentPath: "/documents",
      currentLabel: "업로드 스튜디오",
    };
  }

  if (pathname === "/upload/manual") {
    return {
      parentLabel: "문서 관리",
      parentPath: "/documents",
      currentLabel: "수기 등록",
    };
  }

  if (pathname === "/processing-center") {
    return {
      parentLabel: "문서 관리",
      parentPath: "/documents",
      currentLabel: "처리 센터",
    };
  }

  if (pathname === "/mypage/profile") {
    return {
      parentLabel: "마이페이지",
      parentPath: "/mypage",
      currentLabel: "회원정보 변경",
    };
  }

  if (pathname === "/mypage/settings") {
    return {
      parentLabel: "마이페이지",
      parentPath: "/mypage",
      currentLabel: "설정",
    };
  }

  if (pathname === "/mypage/plan") {
    return {
      parentLabel: "마이페이지",
      parentPath: "/mypage",
      currentLabel: "요금제 관리",
    };
  }

  if (pathname === "/mypage/withdraw") {
    return {
      parentLabel: "마이페이지",
      parentPath: "/mypage",
      currentLabel: "회원탈퇴",
    };
  }

  return null;
};

interface HeaderProps {
  onFabClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onFabClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pageName = getPageName(location.pathname);
  const breadcrumb = getHeaderBreadcrumb(location.pathname);
  const isMyPage = location.pathname.startsWith("/mypage");
  const isProPage = location.pathname === "/finance/report";

  return (
    <>
      <header className={`header${isMyPage ? " header--mypage" : ""}`}>
        {isMyPage && (
          <button
            type="button"
            className="header__brand"
            onClick={() => navigate("/mypage")}
            aria-label="마이페이지로 이동"
          >
            <span>D</span>
            <strong>DocuMate</strong>
          </button>
        )}

        <div className="header__left">
          {breadcrumb ? (
            <nav className="header__breadcrumb" aria-label="현재 위치">
              <button
                type="button"
                onClick={() => navigate(breadcrumb.parentPath)}
              >
                {breadcrumb.parentLabel}
              </button>
              <span>/</span>
              <b>{breadcrumb.currentLabel}</b>
            </nav>
          ) : (
            <span className="header__page-title">
              <span className="header__page-name">{pageName}</span>
              {isProPage && <Badge variant="pro">PRO</Badge>}
            </span>
          )}
        </div>

        <div className="header__actions">
          <button
            className="header__icon-btn"
            aria-label="처리 센터"
            title="처리 센터"
            onClick={() => navigate("/processing-center")}
          >
            <FileText size={20} />
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
