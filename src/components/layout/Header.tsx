import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, FileText } from "lucide-react";
import "./Header.css";
import NotificationPanel from "./NotificationPanel";
import { notificationService } from "../../services/notificationService";

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
  if (pathname.startsWith("/documents/")) return "디지털 캐비닛";
  if (pathname.startsWith("/receipts/")) return "영수증 상세";
  if (pathname.startsWith("/mypage")) return "마이페이지";
  return PAGE_NAMES[pathname] || "";
};

type HeaderBreadcrumb = {
  parentLabel: string;
  parentPath: string;
  currentLabel: string;
};

const getHeaderBreadcrumb = (
  pathname: string,
  documentTitle = "",
): HeaderBreadcrumb | null => {
  if (pathname.startsWith("/documents/")) {
    return {
      parentLabel: "디지털 캐비닛",
      parentPath: "/documents",
      currentLabel: documentTitle || "문서 상세",
    };
  }

  if (pathname === "/upload") {
    return {
      parentLabel: "디지털 캐비닛",
      parentPath: "/documents",
      currentLabel: "업로드 스튜디오",
    };
  }

  if (pathname === "/upload/manual") {
    return {
      parentLabel: "디지털 캐비닛",
      parentPath: "/documents",
      currentLabel: "수기 등록",
    };
  }

  if (pathname === "/processing-center") {
    return {
      parentLabel: "디지털 캐비닛",
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
  const isDocumentDetail = location.pathname.startsWith("/documents/");
  const isMyPage = location.pathname.startsWith("/mypage");

  const [documentTitle, setDocumentTitle] = useState("");
  const breadcrumb = getHeaderBreadcrumb(location.pathname, documentTitle);
  const [panelOpen, setPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const list = await notificationService.getMyNotifications();
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!isDocumentDetail) {
      setDocumentTitle("");
      return;
    }

    const savedTitle = sessionStorage.getItem("documate:header:documentTitle");
    setDocumentTitle(savedTitle || "문서 상세");

    const handleDocumentTitleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        pathname?: string;
        title?: string;
      }>;

      if (customEvent.detail?.pathname !== location.pathname) return;
      setDocumentTitle(customEvent.detail.title || "문서 상세");
    };

    window.addEventListener(
      "documate:document-title-change",
      handleDocumentTitleChange,
    );

    return () => {
      window.removeEventListener(
        "documate:document-title-change",
        handleDocumentTitleChange,
      );
    };
  }, [isDocumentDetail, location.pathname]);

  const handleLogoClick = () => {
    if (location.pathname === "/mypage") {
      navigate("/dashboard");
      return;
    }

    if (location.pathname.startsWith("/mypage")) {
      navigate("/mypage");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <>
      <header className={`header${isMyPage ? " header--mypage" : ""}`}>
        {isMyPage ? (
          <div className="header__mypage-start">
            <button
              type="button"
              className="header__brand header__brand--mypage"
              onClick={handleLogoClick}
            >
              <span>D</span>
              <strong>DocuMate</strong>
            </button>

            {breadcrumb ? (
              <nav className="header__mypage-path" aria-label="현재 위치">
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
              <span className="header__mypage-title">마이페이지</span>
            )}
          </div>
        ) : breadcrumb ? (
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
          <span className="header__page-name">{pageName}</span>
        )}
        <div className="header__actions">
          <div className="notif-bell-wrap">
            <button
              className="header__icon-btn"
              aria-label="알림"
              title="알림"
              onClick={() => setPanelOpen((v) => !v)}
            >
              <Bell size={20} />
            </button>
            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
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

      {panelOpen && (
        <NotificationPanel
          onClose={() => setPanelOpen(false)}
          onUnreadCountChange={setUnreadCount}
        />
      )}
    </>
  );
};

export default Header;
