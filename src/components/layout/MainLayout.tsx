import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ReceiptBranchModal from "../modal/ReceiptBranchModal";
import "./MainLayout.css";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [receiptBranchOpen, setReceiptBranchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isMyPage = location.pathname.startsWith("/mypage");

  // 라우트 변경 시 모바일 드로어 자동 닫힘
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // 드로어 열림 동안 body 스크롤 잠금
  useEffect(() => {
    if (!isSidebarOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isSidebarOpen]);

  // ESC로 드로어 닫기
  useEffect(() => {
    if (!isSidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);
  const isReceiptFabPage =
    location.pathname === "/receipts" ||
    location.pathname === "/finance/report" ||
    location.pathname === "/cards";

  const hideFab =
    isMyPage ||
    location.pathname === "/upload" ||
    location.pathname === "/upload/manual" ||
    location.pathname === "/processing-center";

  const handleFabClick = () => {
    if (isReceiptFabPage) {
      setReceiptBranchOpen(true);
      return;
    }

    navigate("/upload");
  };

  const handleReceiptSaved = () => {
    window.dispatchEvent(new Event("documate:receipt-saved"));
  };

  return (
    <div className={`main-layout${isMyPage ? " main-layout--top-only" : ""}`}>
      {!isMyPage && (
        <>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          {isSidebarOpen && (
            <div
              className="main-layout__overlay"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
        </>
      )}
      <div className="main-layout__content">
        <Header
          onFabClick={hideFab ? undefined : handleFabClick}
          fabVariant={isReceiptFabPage ? "receipt" : "default"}
          fabAriaLabel={isReceiptFabPage ? "영수증 추가" : "업로드"}
          onMenuClick={isMyPage ? undefined : () => setIsSidebarOpen(true)}
        />
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>

      <ReceiptBranchModal
        isOpen={receiptBranchOpen}
        onClose={() => setReceiptBranchOpen(false)}
        onSaved={handleReceiptSaved}
      />
    </div>
  );
};

export default MainLayout;
