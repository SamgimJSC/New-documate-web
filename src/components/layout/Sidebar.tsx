import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Archive,
  Receipt,
  TrendingUp,
  MoreHorizontal,
  UserRound,
  Settings,
  CreditCard,
  LogOut,
} from "lucide-react";
import Badge from "../common/Badge";
import { useUserStore } from "../../store/userStore";
import { authService } from "../../services/authService";
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

const quickMenuItems = [
  {
    to: "/mypage/profile",
    icon: <UserRound size={16} />,
    label: "회원정보 변경",
  },
  {
    to: "/mypage/settings",
    icon: <Settings size={16} />,
    label: "설정",
  },
  {
    to: "/mypage/plan",
    icon: <CreditCard size={16} />,
    label: "요금제 관리",
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const quickMenuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.nickname || user?.real_name || "게스트";
  const planText = formatPlanName(user?.plan);
  const initial = displayName.trim().charAt(0).toUpperCase() || "D";

  useEffect(() => {
    if (!isQuickMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        quickMenuRef.current &&
        !quickMenuRef.current.contains(e.target as Node)
      ) {
        setIsQuickMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isQuickMenuOpen]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("stayLoggedIn");
      sessionStorage.removeItem("sessionActive");
      setIsQuickMenuOpen(false);
      navigate("/login", { replace: true });
    }
  };

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

      <div className="sidebar__profile-wrap" ref={quickMenuRef}>
        {isQuickMenuOpen && (
          <div className="sidebar__quick-menu" role="menu">
            {quickMenuItems.map((item) => (
              <button
                key={item.to}
                type="button"
                className="sidebar__quick-menu-item"
                role="menuitem"
                onClick={() => {
                  setIsQuickMenuOpen(false);
                  navigate(item.to);
                }}
              >
                <span className="sidebar__quick-menu-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="sidebar__quick-menu-divider" />

            <button
              type="button"
              className="sidebar__quick-menu-item sidebar__quick-menu-item--danger"
              role="menuitem"
              onClick={() => void handleLogout()}
            >
              <span className="sidebar__quick-menu-icon">
                <LogOut size={16} />
              </span>
              로그아웃
            </button>
          </div>
        )}

        <div className="sidebar__profile">
          <button
            type="button"
            className="sidebar__profile-main"
            onClick={() => {
              setIsQuickMenuOpen(false);
              navigate("/mypage");
            }}
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
          </button>

          <button
            type="button"
            className="sidebar__profile-more"
            onClick={() => setIsQuickMenuOpen((prev) => !prev)}
            aria-label="마이페이지 퀵메뉴"
            aria-expanded={isQuickMenuOpen}
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
