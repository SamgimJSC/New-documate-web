import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock, CreditCard } from "lucide-react";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";

interface CardRecommendTabProps {
  isPro: boolean;
}

const CardRecommendTab: React.FC<CardRecommendTabProps> = ({ isPro }) => {
  const navigate = useNavigate();

  if (!isPro) {
    return (
      <Card className="finance-report__pro-locked">
        <div className="finance-report__pro-ghost">
          <div className="finance-report__pro-ghost-cards">
            {[0, 1, 2].map((i) => (
              <div key={i} className="finance-report__pro-ghost-card-row">
                <div className="finance-report__pro-ghost-card-icon" />
                <div className="finance-report__pro-ghost-card-lines">
                  <span className="finance-report__pro-ghost-line finance-report__pro-ghost-line--wide" />
                  <span className="finance-report__pro-ghost-line" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="finance-report__pro-overlay">
          <Lock size={28} />
          <p className="finance-report__pro-overlay-title">카드 추천은 PRO 전용입니다</p>
          <p className="finance-report__pro-overlay-text">
            주요 소비 카테고리를 기반으로 혜택이 높은 카드를 추천해 드려요.
          </p>
          <Button variant="primary" onClick={() => navigate("/mypage/plan")}>
            PRO 업그레이드
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="finance-report__card-rec-box">
        <div className="finance-report__card-rec-left">
          <div className="finance-report__summary-icon finance-report__summary-icon--primary">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="finance-report__section-title">카드 추천</h3>
            <p className="finance-report__card-rec-text">
              주요 소비 카테고리를 기반으로 혜택이 높은 카드를 확인할 수
              있습니다. (준비 중)
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CardRecommendTab;
