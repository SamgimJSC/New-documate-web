import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { formatDateTime } from "../../utils/formatDate";
import type { PaymentFlow } from "../../types/payment";
import "../../pages/MyPage/MyPage.css";

export type PaymentResultVariant = "success" | "cancel" | "fail";

export interface PaymentResultInfo {
  variant: PaymentResultVariant;
  flow?: PaymentFlow;
  status?: string | null;
  approvedAt?: string | null;
  reason?: string | null;
}

const VARIANT_ICON: Record<
  PaymentResultVariant,
  { icon: React.ReactNode; className: string }
> = {
  success: {
    icon: <CheckCircle2 size={44} />,
    className: "mypage-payment-result--success",
  },
  cancel: {
    icon: <AlertTriangle size={44} />,
    className: "mypage-payment-result--cancel",
  },
  fail: {
    icon: <XCircle size={44} />,
    className: "mypage-payment-result--fail",
  },
};

const TITLE_BY_FLOW: Record<PaymentFlow, Record<PaymentResultVariant, string>> = {
  SUBSCRIBE: {
    success: "결제가 완료되었습니다",
    cancel: "결제가 취소되었습니다",
    fail: "결제에 실패했습니다",
  },
  METHOD_CHANGE: {
    success: "결제 수단이 변경되었습니다",
    cancel: "결제 수단 변경이 취소되었습니다",
    fail: "결제 수단 변경에 실패했습니다",
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: PaymentResultInfo | null;
}

const PaymentResultModal: React.FC<Props> = ({ isOpen, onClose, result }) => {
  if (!result) return null;

  const flow = result.flow ?? "SUBSCRIBE";
  const content = VARIANT_ICON[result.variant];
  const title = TITLE_BY_FLOW[flow][result.variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className={`mypage-payment-result-modal__content ${content.className}`}>
        <div className="mypage-payment-result__icon">{content.icon}</div>
        <h2>{title}</h2>

        {result.variant === "success" && (
          <p className="mypage-payment-result__detail">
            {result.status && <span>상태: {result.status}</span>}
            {result.approvedAt && (
              <span>승인 시각: {formatDateTime(result.approvedAt)}</span>
            )}
          </p>
        )}

        {result.variant !== "success" && result.reason && (
          <p className="mypage-payment-result__detail">사유: {result.reason}</p>
        )}

        <p className="mypage-payment-result__note">
          요금제 관리 페이지에서 최신 상태를 확인할 수 있어요.
        </p>

        <Button variant="primary" fullWidth onClick={onClose}>
          확인
        </Button>
      </div>
    </Modal>
  );
};

export default PaymentResultModal;
