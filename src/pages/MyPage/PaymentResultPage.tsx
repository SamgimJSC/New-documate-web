import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Button from "../../components/common/Button";
import { paymentService } from "../../services/paymentService";
import { userService } from "../../services/userService";
import { useUserStore } from "../../store/userStore";
import { formatDateTime } from "../../utils/formatDate";
import "./MyPage.css";

type ResultVariant = "success" | "cancel" | "fail";

const VARIANT_CONTENT: Record<
  ResultVariant,
  { icon: React.ReactNode; title: string; className: string }
> = {
  success: {
    icon: <CheckCircle2 size={48} />,
    title: "결제가 완료되었습니다",
    className: "mypage-payment-result--success",
  },
  cancel: {
    icon: <AlertTriangle size={48} />,
    title: "결제가 취소되었습니다",
    className: "mypage-payment-result--cancel",
  },
  fail: {
    icon: <XCircle size={48} />,
    title: "결제에 실패했습니다",
    className: "mypage-payment-result--fail",
  },
};

interface Props {
  variant: ResultVariant;
}

const PaymentResultPage: React.FC<Props> = ({ variant }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const status = searchParams.get("status");
  const approvedAt = searchParams.get("approvedAt");
  const reason = searchParams.get("reason");

  useEffect(() => {
    // 쿼리 값은 화면 표시용으로만 쓰고, 실제 반영 여부는 구독/유저를 다시 조회해 확인한다.
    Promise.allSettled([
      paymentService.getSubscription(),
      userService.getMe().then(setUser),
    ]).finally(() => setIsRefreshing(false));
  }, [setUser]);

  const content = VARIANT_CONTENT[variant];

  return (
    <div className="mypage-section mypage-payment-result">
      <div className={`mypage-payment-result__card ${content.className}`}>
        <div className="mypage-payment-result__icon">{content.icon}</div>
        <h2>{content.title}</h2>

        {variant === "success" && (
          <p className="mypage-payment-result__detail">
            {status && <span>상태: {status}</span>}
            {approvedAt && <span>승인 시각: {formatDateTime(approvedAt)}</span>}
          </p>
        )}

        {variant !== "success" && reason && (
          <p className="mypage-payment-result__detail">사유: {reason}</p>
        )}

        <p className="mypage-payment-result__note">
          {isRefreshing
            ? "최신 구독 상태를 확인하고 있어요..."
            : "요금제 관리 페이지에서 최신 상태를 확인할 수 있어요."}
        </p>

        <Button variant="primary" onClick={() => navigate("/mypage/plan")}>
          요금제 관리로 돌아가기
        </Button>
      </div>
    </div>
  );
};

export default PaymentResultPage;
