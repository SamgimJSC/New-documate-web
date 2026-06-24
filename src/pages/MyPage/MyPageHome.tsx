import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HardDrive,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import { mockUserSettings } from "../../data/mockUsers";
import { useUserStore } from "../../store/userStore";
import { formatDate } from "../../utils/formatDate";
import { authService } from "../../services/authService";
import "./MyPage.css";

type StatusCard = {
  type: "storage" | "plan" | "notification";
  title: string;
  value: string;
  desc: string;
  sub?: string;
  icon: React.ReactNode;
  to: string;
};

type MenuCard = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  to?: string;
  action?: () => void | Promise<void>;
  danger?: boolean;
};

const MyPageHome: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  if (!user) return null;

  const storagePercent =
    user.storage_quota_bytes > 0
      ? Math.min(
          100,
          Math.round(
            (user.storage_used_bytes / user.storage_quota_bytes) * 100,
          ),
        )
      : 0;

  const usedGB = (user.storage_used_bytes / 1024 / 1024 / 1024).toFixed(1);
  const quotaGB =
    user.storage_quota_bytes > 0
      ? (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0)
      : "-";

  const hasAnyNotification =
    mockUserSettings.email_noti_enabled || mockUserSettings.push_enabled;

  const statusCards: StatusCard[] = [
    {
      type: "storage",
      title: "스토리지",
      value: `${usedGB} GB`,
      desc: `${quotaGB}GB 중 ${storagePercent}% 사용`,
      sub: "문서/영수증 저장 공간",
      icon: <HardDrive size={20} />,
      to: "/documents",
    },
    {
      type: "plan",
      title: "요금제",
      value: user.plan === "PRO" ? "PRO 플랜" : "FREE 플랜",
      desc: user.plan === "PRO" ? "PRO 기능 사용 중" : "기본 기능 사용 중",
      icon: <CreditCard size={20} />,
      to: "/mypage/plan",
    },
    {
      type: "notification",
      title: "알림 설정",
      value: "이메일 · 푸시 알림",
      desc: hasAnyNotification ? "중요 알림 수신 중" : "알림 꺼짐",
      icon: <Bell size={20} />,
      to: "/mypage/settings",
    },
  ];

  const menuCards: MenuCard[] = [
    {
      title: "회원정보 변경",
      desc: "닉네임, 프로필 사진, 계정 정보 수정",
      icon: <UserRound size={21} />,
      to: "/mypage/profile",
    },
    {
      title: "설정",
      desc: "이메일 알림, FCM 푸시, 동의사항 관리",
      icon: <Settings size={21} />,
      to: "/mypage/settings",
    },
    {
      title: "요금제 관리",
      desc: "PRO 플랜, 카카오페이 결제 확인",
      icon: <CreditCard size={21} />,
      to: "/mypage/plan",
    },
    {
      title: "로그아웃",
      desc: "현재 계정에서 로그아웃합니다",
      icon: <LogOut size={21} />,
      action: handleLogout,
    },
  ];

  return (
    <div className="mypage-section mypage-home mypage-home--wide">
      <section className="mypage-home__hero">
        <div className="mypage-home__profile">
          <div className="mypage-home__avatar">
            {user.profile_img_url ? (
              <img src={user.profile_img_url} alt="프로필" />
            ) : (
              <UserRound size={38} />
            )}
          </div>

          <div>
            <div className="mypage-home__name-row">
              <h3>안녕하세요, {user.nickname}님 👋</h3>
              <Badge variant={user.plan === "PRO" ? "pro" : "default"}>
                {user.plan}
              </Badge>
            </div>
            <p>{user.email}</p>
            <span>가입일 {formatDate(user.created_at)}</span>
          </div>
        </div>
      </section>

      <div className="mypage-home__overview-grid">
        <section className="mypage-home__status-panel">
          <div className="mypage-home__section-heading">
            <h3>계정 상태</h3>
          </div>

          <div className="mypage-home__status-grid">
            {statusCards.map((card) => (
              <button
                key={card.title}
                className={`mypage-home__status-card mypage-home__status-card--${card.type}`}
                onClick={() => navigate(card.to)}
              >
                <span className="mypage-home__status-icon">{card.icon}</span>
                <span className="mypage-home__status-content">
                  <em>{card.title}</em>
                  <strong>{card.value}</strong>
                  <span>{card.desc}</span>
                  {card.sub && <small>{card.sub}</small>}

                  {card.type === "storage" && (
                    <span className="mypage-home__storage-bar">
                      <span style={{ width: `${storagePercent}%` }} />
                    </span>
                  )}
                </span>

                {card.type === "storage" && (
                  <span className="mypage-home__storage-percent">
                    {storagePercent}%
                  </span>
                )}

                {card.type === "plan" && (
                  <ChevronRight className="mypage-home__status-chevron" size={18} />
                )}

                {card.type === "notification" && (
                  <span
                    className={`mypage-home__status-switch${
                      hasAnyNotification
                        ? " mypage-home__status-switch--on"
                        : ""
                    }`}
                    aria-hidden="true"
                  >
                    <span />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mypage-home__menu-panel">
          <div className="mypage-home__section-heading">
            <h3>설정 메뉴</h3>
          </div>

          <div className="mypage-home__menu-grid">
            {menuCards.map((menu) => (
              <button
                key={menu.title}
                className={`mypage-home__menu-card${
                  menu.danger ? " mypage-home__menu-card--danger" : ""
                }`}
                onClick={() => {
                  if (menu.action) {
                    void menu.action();
                    return;
                  }

                  if (menu.to) {
                    navigate(menu.to);
                  }
                }}
              >
                <span className="mypage-home__menu-icon">{menu.icon}</span>
                <span>
                  <strong>{menu.title}</strong>
                  <em>{menu.desc}</em>
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="mypage-home__security-note">
        <div className="mypage-home__security-main">
          <ShieldCheck size={20} />
          <div>
            <strong>회원정보 변경 전 재인증이 필요해요.</strong>
            <p>PIN 또는 비밀번호 확인 후 개인정보 수정 화면으로 이동합니다.</p>
          </div>
        </div>

        <button
          type="button"
          className="mypage-home__security-action"
          onClick={() => navigate("/mypage/profile")}
        >
          재인증 하기
        </button>
      </section>
    </div>
  );
};

export default MyPageHome;
