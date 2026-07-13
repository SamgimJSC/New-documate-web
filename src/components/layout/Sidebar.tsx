import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Archive,
  Receipt,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react";
import Badge from "../common/Badge";
import { useUserStore } from "../../store/userStore";
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
  {
    to: "/finance/report",
    icon: <TrendingUp size={18} />,
    label: "소비 리포트",
  },
];

const formatPlanName = (plan?: string) => {
  if (!plan) return "Free";

  const normalized = plan.toLowerCase();

  if (normalized.includes("plus")) return "Plus";
  if (normalized.includes("pro")) return "Pro";
  if (normalized.includes("free")) return "Free";

  return plan;
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

  const displayName = user?.nickname || user?.real_name || "게스트";
  const planText = formatPlanName(user?.plan);
  const initial = displayName.trim().charAt(0).toUpperCase() || "D";

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

      <button
        type="button"
        className="sidebar__profile"
        onClick={() => navigate("/mypage")}
        aria-label="마이페이지로 이동"
      >
        <span className="sidebar__profile-avatar">
          {user?.profile_img_url ? (
            <img src={user.profile_img_url} alt="프로필" />
          ) : (
            initial
          )}
        </span>

        <span className="sidebar__profile-info">
          <span className="sidebar__profile-name">{displayName}</span>
          <span className="sidebar__profile-plan">{planText}</span>
        </span>

        <span className="sidebar__profile-more" aria-hidden="true">
          <MoreHorizontal size={17} />
        </span>
      </button>
    </aside>
  );
};

export default Sidebar;
