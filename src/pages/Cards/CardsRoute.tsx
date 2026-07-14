import React from "react";
import { useUserStore } from "../../store/userStore";
import CardsProLocked from "../../components/common/CardsProLocked";
import Cards from "./Cards";

const CardsRoute: React.FC = () => {
  const isPro = useUserStore((s) => s.user)?.plan === "PRO";

  if (!isPro) return <CardsProLocked />;

  return <Cards />;
};

export default CardsRoute;
