import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Crown,
  Database,
  ShieldCheck,
} from "lucide-react";
import Badge from "../../components/common/Badge";
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
  const navigate = useNavigate();
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

  return (
    <div className="mypage-section mypage-plan-page mypage-plan-page--figma">
      <section className="mypage-plan-figma__current">
        <div className="mypage-plan-figma__current-block">
          <span>현재 이용 중인 플랜</span>

          <div className="mypage-plan-figma__plan-inline">
            <Badge variant={isPro ? "pro" : "default"}>{currentPlan}</Badge>
            <strong>{isPro ? "월 5,900원" : "0원"}</strong>
          </div>
        </div>

        <div className="mypage-plan-figma__divider" />

        <div className="mypage-plan-figma__current-block">
          <span>다음 결제일</span>
          <strong>{isPro ? nextBillingDate : "-"}</strong>
          <em>{isPro ? "월 단위 자동 결제" : "무료 플랜 사용 중"}</em>
        </div>

        <div className="mypage-plan-figma__current-action">
          {isPro ? (
            <Button variant="ghost" onClick={() => setCancelOpen(true)}>
              플랜 해지
            </Button>
          ) : (
            <Button variant="primary" onClick={handleUpgrade}>
              PRO 업그레이드
            </Button>
          )}

          {isPro && cancelReserved && <p>해지가 예약되었습니다.</p>}
        </div>
      </section>

      <section className="mypage-plan-figma__payment">
        <h3>결제 수단</h3>

        <div className="mypage-plan-figma__payment-list">
          <div className="mypage-plan-figma__payment-row mypage-plan-figma__payment-row--active">
            <span className="mypage-plan-figma__payment-badge">PAY</span>

            <strong>카카오페이</strong>

            <Badge variant="success">기본 수단</Badge>
          </div>

          <div className="mypage-plan-figma__payment-row mypage-plan-figma__payment-row--disabled">
            <span className="mypage-plan-figma__payment-badge" />

            <strong>신용·체크카드</strong>

            <Badge variant="default">준비 중</Badge>
          </div>
        </div>

        <p className="mypage-plan-figma__payment-note">
          현재 카카오페이로만 결제가 가능합니다. 신용카드 결제는 추후 지원
          예정입니다.
        </p>
      </section>

      <section className="mypage-plan-figma__compare">
        <h3>플랜 비교</h3>

        <div className="mypage-plan-figma__compare-grid">
          <article className="mypage-plan-figma__plan-card">
            <div className="mypage-plan-figma__plan-card-head">
              <div>
                <span>Free</span>
                <strong>0원</strong>
              </div>
            </div>

            <ul>
              {FREE_FEATURES.map((feature) => (
                <li key={feature}>
                  <Check size={14} />
                  {feature}
                </li>
              ))}
            </ul>

            <Button variant="ghost" fullWidth disabled={!isPro}>
              {isPro ? "다운그레이드 시 사용" : "현재 플랜"}
            </Button>
          </article>

          <article className="mypage-plan-figma__plan-card mypage-plan-figma__plan-card--pro">
            <div className="mypage-plan-figma__pro-band">
              <span>{isPro ? "현재 이용 중" : "추천 플랜"}</span>
              <Badge variant="pro">PRO</Badge>
            </div>

            <div className="mypage-plan-figma__plan-card-head">
              <div>
                <span>Pro</span>
                <strong>
                  9,900원
                  <em>/월</em>
                </strong>
              </div>
            </div>

            <ul>
              {PRO_FEATURES.map((feature) => (
                <li key={feature}>
                  <Check size={14} />
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

      <section className="mypage-plan-figma__safe-note">
        <ShieldCheck size={18} />
        <div>
          <strong>플랜 변경 후 즉시 계정에 반영됩니다.</strong>
          <p>결제 승인 결과에 따라 PRO 기능 이용 여부가 결정됩니다.</p>
        </div>
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
