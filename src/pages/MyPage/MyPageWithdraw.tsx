import React, { useState } from "react";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import WithdrawConfirmModal from "../../components/modal/WithdrawConfirmModal";
import { mockCurrentUser } from "../../data/mockUsers";
import "./MyPage.css";

const REASONS = [
  { value: "not_using", label: "서비스를 잘 사용하지 않아서" },
  { value: "alternative", label: "다른 서비스로 이동" },
  { value: "privacy", label: "개인정보 보호 우려" },
  { value: "cost", label: "요금이 부담스러워서" },
  { value: "other", label: "기타" },
];

const MyPageWithdraw: React.FC = () => {
  const user = mockCurrentUser;
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const isValid = reason && confirmText === user.nickname;

  return (
    <div className="mypage-section">
      <h2
        className="mypage-section__title"
        style={{ color: "var(--color-danger)" }}
      >
        회원탈퇴
      </h2>

      <div className="mypage-withdraw__warning">
        <p className="mypage-withdraw__warning-title">
          ⚠️ 탈퇴 전 확인해주세요
        </p>
        <ul className="mypage-withdraw__warning-list">
          <li>모든 문서와 영수증 데이터가 영구 삭제됩니다</li>
          <li>PRO 구독 중인 경우 즉시 해지됩니다</li>
          <li>삭제된 데이터는 복구할 수 없습니다</li>
        </ul>
        <p className="mypage-withdraw__demo-note">
          현재 회원탈퇴는 시연용 UI만 구현되어 있으며, 실제 데이터 삭제 요청은
          서버 연동 후 처리됩니다.
        </p>
      </div>

      <div className="mypage-withdraw__form">
        <Select
          label="탈퇴 사유"
          value={reason}
          options={REASONS}
          onChange={(e) => setReason(e.target.value)}
          placeholder="사유를 선택하세요"
        />
        <Input
          label={`닉네임 확인 (${user.nickname} 입력)`}
          placeholder={`"${user.nickname}" 입력 시 활성화`}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          error={
            confirmText && confirmText !== user.nickname
              ? "닉네임이 일치하지 않습니다."
              : undefined
          }
        />
        <Button
          variant="danger"
          fullWidth
          disabled={!isValid}
          onClick={() => setModalOpen(true)}
        >
          탈퇴하기
        </Button>
      </div>

      <WithdrawConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default MyPageWithdraw;
