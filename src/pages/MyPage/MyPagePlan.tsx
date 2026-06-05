import React, { useState } from "react";
import { Check } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PlanCancelModal from "../../components/modal/PlanCancelModal";
import { mockCurrentUser } from "../../data/mockUsers";
import { mockSubscription, mockPayments } from "../../data/mockPayments";
import { formatDate } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import { useToast } from "../../components/common/Toast";
import "./MyPage.css";

const FREE_FEATURES = ["문서 저장 (5GB)", "기본 OCR", "영수증 관리", "가계부 기본"];
const PRO_FEATURES = ["문서 저장 (10GB)", "고급 OCR + AI 분석", "소비 리포트", "AI 인사이트", "지출 예측", "카드 추천", "모든 FREE 기능 포함"];

const MyPagePlan: React.FC = () => {
  const user = mockCurrentUser;
  const { showToast } = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleUpgrade = () => {
    showToast("결제가 완료되었습니다.", "success");
  };

  return (
    <div className="mypage-section">
      <h2 className="mypage-section__title">요금제 관리</h2>

      <div className="mypage-plan__current">
        <p className="mypage-section__subtitle">현재 플랜</p>
        <div className="mypage-plan__current-card">
          <Badge variant={user.plan === "PRO" ? "pro" : "default"}>{user.plan}</Badge>
          <div>
            <p className="mypage-plan__plan-name">{user.plan === "PRO" ? "PRO 플랜" : "FREE 플랜"}</p>
            {user.plan === "PRO" && mockSubscription.current_period_end && (
              <p className="mypage-plan__plan-expire">다음 갱신일: {formatDate(mockSubscription.current_period_end)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mypage-plan__compare">
        <div className="mypage-plan__col">
          <div className="mypage-plan__col-header">
            <h3>FREE</h3>
            <p className="mypage-plan__price">무료</p>
          </div>
          <ul className="mypage-plan__feature-list">
            {FREE_FEATURES.map((f) => (
              <li key={f}><Check size={14} color="var(--color-success)" /> {f}</li>
            ))}
          </ul>
          {user.plan !== "FREE" && (
            <Button variant="ghost" fullWidth disabled>현재 상위 플랜 사용 중</Button>
          )}
        </div>

        <div className={`mypage-plan__col mypage-plan__col--pro`}>
          <div className="mypage-plan__col-header">
            <h3>PRO <Badge variant="pro">PRO</Badge></h3>
            <p className="mypage-plan__price">5,900원<span>/월</span></p>
          </div>
          <ul className="mypage-plan__feature-list">
            {PRO_FEATURES.map((f) => (
              <li key={f}><Check size={14} color="var(--color-pro)" /> {f}</li>
            ))}
          </ul>
          {user.plan === "PRO" ? (
            <Button variant="ghost" fullWidth onClick={() => setCancelOpen(true)}>플랜 해지</Button>
          ) : (
            <Button variant="primary" fullWidth onClick={handleUpgrade}>PRO 업그레이드</Button>
          )}
        </div>
      </div>

      {mockPayments.length > 0 && (
        <div className="mypage-plan__history">
          <h3 className="mypage-section__subtitle">결제 내역</h3>
          <div className="mypage-plan__history-list">
            {mockPayments.map((p) => (
              <div key={p.payment_id} className="mypage-plan__history-row">
                <span>{p.approved_at ? formatDate(p.approved_at) : "-"}</span>
                <span>{formatKRW(p.amount)}</span>
                <Badge variant={p.status === "APPROVED" ? "success" : "danger"}>
                  {p.status === "APPROVED" ? "결제 완료" : p.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <PlanCancelModal isOpen={cancelOpen} onClose={() => setCancelOpen(false)} />
    </div>
  );
};

export default MyPagePlan;
