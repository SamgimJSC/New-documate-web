import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./MainLayout.css";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout__content">
        <Header onFabClick={() => navigate("/upload")} />
        <main className="main-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
