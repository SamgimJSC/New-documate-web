import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import "./CardsProLocked.css";

const CardsProLocked: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="cards-pro-locked">
      <div className="cards-pro-locked__ghost">
        <div className="cards-pro-locked__ghost-cards">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cards-pro-locked__ghost-card-row">
              <div className="cards-pro-locked__ghost-card-icon" />
              <div className="cards-pro-locked__ghost-card-lines">
                <span className="cards-pro-locked__ghost-line cards-pro-locked__ghost-line--wide" />
                <span className="cards-pro-locked__ghost-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="cards-pro-locked__overlay">
        <Lock size={28} />
        <p className="cards-pro-locked__overlay-title">카드 추천은 PRO 전용입니다</p>
        <p className="cards-pro-locked__overlay-text">
          주요 소비 카테고리를 기반으로 혜택이 높은 카드를 추천해 드려요.
        </p>
        <Button variant="primary" onClick={() => navigate("/mypage/plan")}>
          PRO 업그레이드
        </Button>
      </div>
    </Card>
  );
};

export default CardsProLocked;
