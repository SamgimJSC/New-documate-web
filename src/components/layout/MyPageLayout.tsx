import React from "react";
import { Outlet } from "react-router-dom";
import "./MyPageLayout.css";

const MyPageLayout: React.FC = () => {
  return (
    <div className="mypage-layout">
      <main className="mypage-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MyPageLayout;
