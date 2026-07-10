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
import { paymentService, pickKakaoRedirectUrl } from "../../services/paymentService";
import type { Payment, PaymentStatus, Subscription } from "../../types/payment";
import { useUserStore } from "../../store/userStore";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import { useToast } from "../../components/common/Toast";
import "./MyPage.css";

const PRO_MONTHLY_PRICE = 9900;

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  READY: "결제 대기",
  APPROVED: "결제 완료",
  CANCELED: "취소됨",
  FAILED: "실패",
};

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
  const { showToast } = useToast();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isChangingMethod, setIsChangingMethod] = useState(false);
  const [isUndoingCancel, setIsUndoingCancel] = useState(false);

  useEffect(() => {
    paymentService
      .getSubscription()
      .then(setSubscription)
      .catch(() => {
        // 조회 실패 시 user.plan 기반 폴백 렌더링 유지
      });

    paymentService
      .getPayments({ page: 1, limit: 20 })
      .then((res) => setPayments(res.items))
      .catch(() => {
        // 결제 내역 조회 실패는 조용히 빈 목록으로 유지
      });
  }, []);

  if (!user) return null;

  const isPro = subscription ? subscription.plan === "PRO" : user.plan === "PRO";
  const isCanceled = subscription?.is_canceled ?? false;
  const nextBillingDate =
    subscription?.next_billing_at ?? subscription?.current_period_end;

  const refreshSubscription = async () => {
    const next = await paymentService.getSubscription();
    setSubscription(next);
    return next;
  };

  const handleUpgrade = async () => {
    if (isPro || isUpgrading) return;

    setIsUpgrading(true);
    try {
      const ready = await paymentService.readyKakaoPay("MONTHLY");
      window.location.href = pickKakaoRedirectUrl(ready);
    } catch {
      showToast("결제 준비에 실패했어요. 다시 시도해 주세요.", "error");
      setIsUpgrading(false);
    }
  };

  const handleCancelReserved = async () => {
    try {
      await paymentService.cancelSubscription(true);
      await refreshSubscription();
      showToast("요금제가 해지 예약되었습니다.", "info");
    } catch {
      showToast("해지 요청에 실패했어요. 다시 시도해 주세요.", "error");
      throw new Error("cancel failed");
    }
  };

  const handleUndoCancel = async () => {
    setIsUndoingCancel(true);
    try {
      await paymentService.undoCancelSubscription();
      await refreshSubscription();
      showToast("해지 예약이 취소되었습니다.", "success");
    } catch {
      showToast("해지 예약 취소에 실패했어요. 다시 시도해 주세요.", "error");
    } finally {
      setIsUndoingCancel(false);
    }
  };

  const handlePaymentChange = async () => {
    if (isChangingMethod) return;

    setIsChangingMethod(true);
    try {
      const ready = await paymentService.readyKakaoPayMethodChange();
      window.location.href = pickKakaoRedirectUrl(ready);
    } catch {
      showToast("결제 수단 변경 준비에 실패했어요. 다시 시도해 주세요.", "error");
      setIsChangingMethod(false);
    }
  };

  const renderPrimaryAction = () => {
    if (isPro && isCanceled) {
      return (
        <Button
          variant="ghost"
          fullWidth
          loading={isUndoingCancel}
          onClick={handleUndoCancel}
        >
          해지예약 취소
        </Button>
      );
    }

    if (isPro) {
      return (
        <Button variant="ghost" fullWidth onClick={() => setCancelOpen(true)}>
          플랜 해지
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        fullWidth
        loading={isUpgrading}
        onClick={handleUpgrade}
      >
        PRO 업그레이드
      </Button>
    );
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
              {isPro ? "PRO" : "FREE"}
            </span>
          </div>

          <div className="mypage-plan-modern__status-main">
            <div>
              <strong>{isPro ? "PRO" : "FREE"}</strong>
              <p>
                {isPro
                  ? `월 ${formatKRW(PRO_MONTHLY_PRICE)} · 고급 기능 사용 중`
                  : "0원 · 무료 플랜 사용 중"}
              </p>
            </div>

            <span className="mypage-plan-modern__status-icon">
              <Crown size={26} />
            </span>
          </div>

          <div className="mypage-plan-modern__meta-row">
            <span>다음 결제일</span>
            <strong>
              {isPro && nextBillingDate ? formatDate(nextBillingDate) : "없음"}
            </strong>
          </div>

          {renderPrimaryAction()}

          {isPro && isCanceled && (
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
              <strong>
                {subscription?.payment_method?.display_name ?? "카카오페이"}
              </strong>
              <p>{user.email}</p>
            </div>

            <CreditCard size={20} />
          </div>

          <button
            type="button"
            className="mypage-plan-modern__subtle-btn"
            onClick={handlePaymentChange}
            disabled={isChangingMethod}
          >
            {isChangingMethod ? "이동 중..." : "결제 수단 변경"}
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
                {formatKRW(PRO_MONTHLY_PRICE)}
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

            {renderPrimaryAction()}
          </article>
        </div>
      </section>

      <section className="mypage-plan-modern__compare">
        <div className="mypage-plan-modern__section-head">
          <div>
            <h3>결제 내역</h3>
            <p>최근 결제 내역을 확인할 수 있어요.</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <p className="mypage-plan-modern__history-empty">
            결제 내역이 없어요.
          </p>
        ) : (
          <ul className="mypage-plan-modern__history-list">
            {payments.map((payment) => (
              <li key={payment.payment_id} className="mypage-plan-modern__history-row">
                <div>
                  <strong>{payment.method_name ?? "카카오페이"}</strong>
                  <span>
                    {formatDate(payment.approved_at ?? payment.created_at)}
                  </span>
                </div>
                <div>
                  <span
                    className={`mypage-plan-modern__history-status mypage-plan-modern__history-status--${payment.status.toLowerCase()}`}
                  >
                    {PAYMENT_STATUS_LABEL[payment.status]}
                  </span>
                  <strong>{formatKRW(payment.amount)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
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
