import React, { useState, useEffect } from "react";
import Badge from "../../components/common/Badge";
import { useUserStore } from "../../store/userStore";
import MonthlyTab from "./tabs/MonthlyTab";
import CardRecommendTab from "./tabs/CardRecommendTab";
import AnnualPatternTab from "./tabs/AnnualPatternTab";
import "./FinanceReport.css";

type ReportTab = "monthly" | "cards" | "annual";

const FinanceReport: React.FC = () => {
  const isPro = useUserStore((s) => s.user)?.plan === "PRO";

  const [activeTab, setActiveTab] = useState<ReportTab>("monthly");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleReceiptSaved = () => {
      setRefreshKey((key) => key + 1);
    };

    window.addEventListener("documate:receipt-saved", handleReceiptSaved);
    return () =>
      window.removeEventListener("documate:receipt-saved", handleReceiptSaved);
  }, []);

  return (
    <div className="finance-report">
      <div className="finance-report__tabs">
        <button
          type="button"
          className={`finance-report__tab${
            activeTab === "monthly" ? " finance-report__tab--active" : ""
          }`}
          onClick={() => setActiveTab("monthly")}
        >
          월간소비
        </button>
        <button
          type="button"
          className={`finance-report__tab${
            activeTab === "annual" ? " finance-report__tab--active" : ""
          }`}
          onClick={() => setActiveTab("annual")}
        >
          연간소비패턴
          <Badge variant="pro">PRO</Badge>
        </button>
        <button
          type="button"
          className={`finance-report__tab${
            activeTab === "cards" ? " finance-report__tab--active" : ""
          }`}
          onClick={() => setActiveTab("cards")}
        >
          카드추천
          <Badge variant="pro">PRO</Badge>
        </button>
      </div>

      {activeTab === "monthly" && <MonthlyTab refreshKey={refreshKey} />}
      {activeTab === "annual" && (
        <AnnualPatternTab isPro={isPro} refreshKey={refreshKey} />
      )}
      {activeTab === "cards" && <CardRecommendTab isPro={isPro} />}
    </div>
  );
};

export default FinanceReport;
