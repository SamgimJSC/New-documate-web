import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ReceiptBranchModal from "../modal/ReceiptBranchModal";
import "./MainLayout.css";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [receiptBranchOpen, setReceiptBranchOpen] = useState(false);

  const isMyPage = location.pathname.startsWith("/mypage");
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
      {!isMyPage && <Sidebar />}
      <div className="main-layout__content">
        <Header
          onFabClick={hideFab ? undefined : handleFabClick}
          fabVariant={isReceiptFabPage ? "receipt" : "default"}
          fabAriaLabel={isReceiptFabPage ? "영수증 추가" : "업로드"}
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
