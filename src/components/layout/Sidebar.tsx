import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Archive, Receipt, TrendingUp } from "lucide-react";
import Badge from "../common/Badge";
import "./Sidebar.css";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  isPro?: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: <LayoutDashboard size={18} />, label: "대시보드" },
  { to: "/documents", icon: <Archive size={18} />, label: "디지털 캐비닛" },
  { to: "/receipts", icon: <Receipt size={18} />, label: "영수증 관리" },
  { to: "/finance/report", icon: <TrendingUp size={18} />, label: "소비 리포트", isPro: true },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar__logo" onClick={() => navigate("/dashboard")}>
        <span className="sidebar__logo-mark">D</span>
        <span className="sidebar__logo-text">DocuMate</span>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`
            }
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-label">{item.label}</span>
            {item.isPro && <Badge variant="pro">PRO</Badge>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
