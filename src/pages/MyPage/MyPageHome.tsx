import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HardDrive,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import {
  mockCurrentUser,
  mockUserConsents,
  mockUserSettings,
} from "../../data/mockUsers";
import { mockSubscription } from "../../data/mockPayments";
import { formatDate } from "../../utils/formatDate";
import "./MyPage.css";

const MyPageHome: React.FC = () => {
  const navigate = useNavigate();
  const user = mockCurrentUser;

  const storagePercent = Math.min(
    100,
    Math.round((user.storage_used_bytes / user.storage_quota_bytes) * 100),
  );

  const usedGB = (user.storage_used_bytes / 1024 / 1024 / 1024).toFixed(1);
  const quotaGB = (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0);

  const marketingConsent = mockUserConsents.find(
    (consent) => consent.consent_type === "MARKETING",
  );

  const statusCards = [
    {
      title: "스토리지",
      value: `${usedGB} GB`,
      desc: `${quotaGB}GB 중 ${storagePercent}% 사용`,
      sub: "문서/영수증 저장 공간",
      icon: <HardDrive size={20} />,
      to: "/documents",
    },
    {
      title: "현재 요금제",
      value: `${user.plan} 플랜`,
      desc: user.plan === "PRO" ? "카카오페이 결제 지원" : "기본 플랜 사용 중",
      sub: `다음 결제일 ${
        mockSubscription.current_period_end
          ? formatDate(mockSubscription.current_period_end)
          : "-"
      }`,
      icon: <CreditCard size={20} />,
      to: "/mypage/plan",
    },
    {
      title: "알림 설정",
      value:
        mockUserSettings.email_noti_enabled || mockUserSettings.push_enabled
          ? "사용 중"
          : "꺼짐",
      desc: `이메일 ${mockUserSettings.email_noti_enabled ? "ON" : "OFF"} · FCM ${
        mockUserSettings.push_enabled ? "ON" : "OFF"
      }`,
      sub: `마케팅 수신 ${marketingConsent?.is_agreed ? "동의" : "미동의"}`,
      icon: <Bell size={20} />,
      to: "/mypage/settings",
    },
  ];

  const menuCards = [
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
      title: "회원탈퇴",
      desc: "시연용 UI만 제공됩니다",
      icon: <Trash2 size={21} />,
      to: "/mypage/withdraw",
      danger: true,
    },
  ];

  return (
    <div className="mypage-section mypage-home mypage-home--simple">
      <header className="mypage-home__header">
        <div>
          <p className="mypage-home__eyebrow">DocuMate · 마이페이지</p>
          <h2 className="mypage-section__title">프로필 메인</h2>
          <p className="mypage-home__desc">
            계정 상태와 주요 설정만 간단하게 확인해보세요.
          </p>
        </div>
      </header>

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

        <div className="mypage-home__hero-actions">
          <Button variant="primary" onClick={() => navigate("/mypage/profile")}>
            회원정보 변경
          </Button>
          <Button variant="ghost" onClick={() => navigate("/mypage/settings")}>
            설정
          </Button>
        </div>
      </section>

      <section>
        <div className="mypage-home__section-heading">
          <h3>계정 상태</h3>
          <span>대시보드와 겹치지 않는 정보만 표시합니다</span>
        </div>

        <div className="mypage-home__status-grid">
          {statusCards.map((card) => (
            <button
              key={card.title}
              className="mypage-home__status-card"
              onClick={() => navigate(card.to)}
            >
              <span className="mypage-home__status-icon">{card.icon}</span>
              <span className="mypage-home__status-content">
                <em>{card.title}</em>
                <strong>{card.value}</strong>
                <span>{card.desc}</span>
                <small>{card.sub}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mypage-home__section-heading">
          <h3>설정 메뉴</h3>
          <span>필요한 메뉴로 바로 이동</span>
        </div>

        <div className="mypage-home__menu-grid">
          {menuCards.map((menu) => (
            <button
              key={menu.title}
              className={`mypage-home__menu-card${
                menu.danger ? " mypage-home__menu-card--danger" : ""
              }`}
              onClick={() => navigate(menu.to)}
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

      <section className="mypage-home__security-note">
        <ShieldCheck size={20} />
        <div>
          <strong>회원정보 변경 전 재인증이 필요해요.</strong>
          <p>PIN 또는 비밀번호 확인 후 개인정보 수정 화면으로 이동합니다.</p>
        </div>
      </section>
    </div>
  );
};

export default MyPageHome;
