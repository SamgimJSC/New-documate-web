import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Crown,
  Database,
  ShieldCheck,
} from "lucide-react";
import Button from "../../components/common/Button";
import PlanCancelModal from "../../components/modal/PlanCancelModal";
import { mockSubscription } from "../../data/mockPayments";
import { useUserStore } from "../../store/userStore";
import type { UserPlan } from "../../types/user";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import "./MyPage.css";

const FREE_STORAGE_BYTES = 1 * 1024 * 1024 * 1024;
const PRO_STORAGE_BYTES = 10 * 1024 * 1024 * 1024;

const FREE_FEATURES = [
  "문서 업로드 · 자동 분류",
  "만료일 알림",
  "문서 검색 · 보관",
  "저장 공간 1GB",
  "기본 영수증 관리",
];

const PRO_FEATURES = [
  "Free의 모든 기능",
  "일별 소비 리포트",
  "AI 소비패턴 분석",
  "월별 그래프 · 상세 내역",
  "카드 추천",
  "저장 공간 10GB",
  "우선 문서 처리",
];

const MyPagePlan: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const { showToast } = useToast();

  const [currentPlan, setCurrentPlan] = useState<UserPlan>(
    user?.plan ?? "FREE",
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReserved, setCancelReserved] = useState(false);

  useEffect(() => {
    if (user?.plan) {
      setCurrentPlan(user.plan);
    }
  }, [user?.plan]);

  if (!user) return null;

  const isPro = currentPlan === "PRO";

  const nextBillingDate = mockSubscription.current_period_end
    ? formatDate(mockSubscription.current_period_end)
    : "2026-07-15";

  const updateLocalPlan = (nextPlan: UserPlan) => {
    setCurrentPlan(nextPlan);
    setCancelReserved(false);

    setUser({
      ...user,
      plan: nextPlan,
      storage_quota_bytes:
        nextPlan === "PRO" ? PRO_STORAGE_BYTES : FREE_STORAGE_BYTES,
      updated_at: new Date().toISOString(),
    });
  };

  const handleUpgrade = () => {
    if (isPro) return;

    updateLocalPlan("PRO");
    showToast("PRO 플랜으로 변경되었습니다.", "success");
  };

  const handleCancelReserved = () => {
    setCancelReserved(true);
  };

  const handlePaymentChange = () => {
    showToast("결제 수단 변경은 추후 연결 예정입니다.", "success");
  };

  return (
    <div className="mypage-section mypage-plan-page mypage-plan-page--modern">
      <div className="mypage-plan-modern__page-head">
        <h2>요금제 관리</h2>
        <p>현재 이용 중인 플랜과 결제 정보를 확인할 수 있어요.</p>
      </div>

      <section className="mypage-plan-modern__overview">
        <article className="mypage-plan-modern__status-card">
          <div className="mypage-plan-modern__card-top">
            <span className="mypage-plan-modern__eyebrow">
              현재 이용 중인 플랜
            </span>
            <span
              className={`mypage-plan-modern__chip ${
                isPro ? "mypage-plan-modern__chip--pro" : ""
              }`}
            >
              {currentPlan}
            </span>
          </div>

          <div className="mypage-plan-modern__status-main">
            <div>
              <strong>{isPro ? "PRO" : "FREE"}</strong>
              <p>{isPro ? "월 9,900원 · 고급 기능 사용 중" : "0원 · 무료 플랜 사용 중"}</p>
            </div>

            <span className="mypage-plan-modern__status-icon">
              <Crown size={26} />
            </span>
          </div>

          <div className="mypage-plan-modern__meta-row">
            <span>다음 결제일</span>
            <strong>{isPro ? nextBillingDate : "없음"}</strong>
          </div>

          {isPro ? (
            <Button variant="ghost" fullWidth onClick={() => setCancelOpen(true)}>
              플랜 해지
            </Button>
          ) : (
            <Button variant="primary" fullWidth onClick={handleUpgrade}>
              PRO 업그레이드
            </Button>
          )}

          {isPro && cancelReserved && (
            <p className="mypage-plan-modern__reserved">
              해지가 예약되었습니다.
            </p>
          )}
        </article>

        <article className="mypage-plan-modern__payment-card">
          <div className="mypage-plan-modern__card-top">
            <span className="mypage-plan-modern__eyebrow">결제 정보</span>
            <span className="mypage-plan-modern__chip">기본 수단</span>
          </div>

          <div className="mypage-plan-modern__payment-method">
            <span className="mypage-plan-modern__pay-mark">pay</span>

            <div>
              <strong>카카오페이</strong>
              <p>{user.email}</p>
            </div>

            <CreditCard size={20} />
          </div>

          <button
            type="button"
            className="mypage-plan-modern__subtle-btn"
            onClick={handlePaymentChange}
          >
            결제 수단 변경
            <ArrowRight size={16} />
          </button>

          <p className="mypage-plan-modern__payment-note">
            안전한 결제를 위해 모든 결제 정보는 암호화되어 처리됩니다.
          </p>
        </article>
      </section>

      <section className="mypage-plan-modern__compare">
        <div className="mypage-plan-modern__section-head">
          <div>
            <h3>플랜 비교</h3>
            <p>필요한 기능에 맞는 플랜을 선택해 주세요.</p>
          </div>
        </div>

        <div className="mypage-plan-modern__compare-grid">
          <article className="mypage-plan-modern__plan-option">
            <div className="mypage-plan-modern__plan-head">
              <span>Free</span>
              <strong>0원</strong>
              <p>기본 문서 관리에 필요한 기능을 제공합니다.</p>
            </div>

            <ul>
              {FREE_FEATURES.map((feature) => (
                <li key={feature}>
                  <Check size={15} />
                  {feature}
                </li>
              ))}
            </ul>

            <Button variant="ghost" fullWidth disabled={!isPro}>
              {isPro ? "다운그레이드 시 사용" : "현재 플랜"}
            </Button>
          </article>

          <article className="mypage-plan-modern__plan-option mypage-plan-modern__plan-option--pro">
            <div className="mypage-plan-modern__recommend-line">
              {isPro ? "현재 이용 중" : "추천 플랜"}
            </div>

            <div className="mypage-plan-modern__plan-head">
              <span>Pro</span>
              <strong>
                9,900원
                <em>/월</em>
              </strong>
              <p>리포트와 분석 기능까지 사용하는 확장 플랜입니다.</p>
            </div>

            <ul>
              {PRO_FEATURES.map((feature) => (
                <li key={feature}>
                  <Check size={15} />
                  {feature}
                </li>
              ))}
            </ul>

            {isPro ? (
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setCancelOpen(true)}
              >
                플랜 해지
              </Button>
            ) : (
              <Button variant="primary" fullWidth onClick={handleUpgrade}>
                PRO 업그레이드
              </Button>
            )}
          </article>
        </div>
      </section>

      <section className="mypage-plan-modern__safe-note">
        <ShieldCheck size={18} />
        <div>
          <strong>플랜 변경 후 즉시 계정에 반영됩니다.</strong>
          <p>결제 승인 결과에 따라 PRO 기능 이용 여부가 결정됩니다.</p>
        </div>

        <span>
          저장 공간 {isPro ? "10GB" : "1GB"}
          <Database size={15} />
        </span>
      </section>

      <PlanCancelModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelReserved}
      />
    </div>
  );
};

export default MyPagePlan;
