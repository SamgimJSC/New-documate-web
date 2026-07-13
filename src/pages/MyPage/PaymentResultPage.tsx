import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { consumeKakaoPaymentFlow, paymentService } from "../../services/paymentService";
import { userService } from "../../services/userService";
import { useUserStore } from "../../store/userStore";
import type { PaymentResultVariant } from "../../components/modal/PaymentResultModal";
import "./MyPage.css";

interface Props {
  variant: PaymentResultVariant;
}

const PaymentResultPage: React.FC<Props> = ({ variant }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useUserStore((s) => s.setUser);

  const status = searchParams.get("status");
  const approvedAt = searchParams.get("approvedAt");
  const reason = searchParams.get("reason");

  useEffect(() => {
    // 쿼리 값은 화면 표시용으로만 쓰고, 실제 반영 여부는 구독/유저를 다시 조회해 확인한다.
    // 카카오페이 리다이렉션으로 도착하는 이 라우트는 별도 화면 없이
    // 요금제 관리 페이지로 이동해 결과를 모달로 보여준다.
    const flow = consumeKakaoPaymentFlow();

    Promise.allSettled([
      paymentService.getSubscription(),
      userService.getMe().then(setUser),
    ]).finally(() => {
      navigate("/mypage/plan", {
        replace: true,
        state: { paymentResult: { variant, flow, status, approvedAt, reason } },
      });
    });
  }, [setUser, navigate, variant, status, approvedAt, reason]);

  return (
    <div className="mypage-section mypage-payment-result">
      <p className="mypage-payment-result__note">결제 결과를 확인하고 있어요...</p>
    </div>
  );
};

export default PaymentResultPage;
