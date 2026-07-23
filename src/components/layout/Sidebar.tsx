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
  PanelLeftClose,
  PanelLeftOpen,
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "true",
  );
  const quickMenuRef = useRef<HTMLDivElement>(null);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

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
    <aside
      className={`sidebar${isOpen ? " sidebar--open" : ""}${
        isCollapsed ? " sidebar--collapsed" : ""
      }`}
    >
      <div className="sidebar__top">
        <button
          type="button"
          className="sidebar__logo"
          onClick={() => {
            onClose?.();
            navigate("/dashboard");
          }}
        >
          <img
            src="/favicon.png"
            alt=""
            className="sidebar__logo-mark"
          />
          <span className="sidebar__logo-text brand-wordmark">
            <span>Docu</span>
            <span className="brand-wordmark__accent">Mate</span>
          </span>
        </button>
        <button
          type="button"
          className="sidebar__collapse-toggle"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
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
