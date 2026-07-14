import React from "react";
import CardsProLocked from "../../../components/common/CardsProLocked";
import Cards from "../../Cards/Cards";

interface CardRecommendTabProps {
  isPro: boolean;
}

const CardRecommendTab: React.FC<CardRecommendTabProps> = ({ isPro }) => {
  if (!isPro) return <CardsProLocked />;

  return <Cards />;
};

export default CardRecommendTab;
