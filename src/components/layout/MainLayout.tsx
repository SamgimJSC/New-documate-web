import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./MainLayout.css";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isMyPage = location.pathname.startsWith("/mypage");

  const hideFab =
    isMyPage ||
    location.pathname === "/upload" ||
    location.pathname === "/upload/manual" ||
    location.pathname === "/processing-center";
  return (
    <div className={`main-layout${isMyPage ? " main-layout--top-only" : ""}`}>
      {!isMyPage && <Sidebar />}
      <div className="main-layout__content">
        <Header onFabClick={hideFab ? undefined : () => navigate("/upload")} />
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
