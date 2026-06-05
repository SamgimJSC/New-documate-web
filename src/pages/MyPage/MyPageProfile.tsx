import React, { useState } from "react";
import { UserCircle } from "lucide-react";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import ProfilePhotoModal from "../../components/modal/ProfilePhotoModal";
import PaymentMethodModal from "../../components/modal/PaymentMethodModal";
import { mockCurrentUser } from "../../data/mockUsers";
import { mockSubscription } from "../../data/mockPayments";
import { formatDate } from "../../utils/formatDate";
import { useToast } from "../../components/common/Toast";
import "./MyPage.css";

const MyPageProfile: React.FC = () => {
  const user = mockCurrentUser;
  const { showToast } = useToast();
  const [editNickname, setEditNickname] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const storagePercent = Math.round((user.storage_used_bytes / user.storage_quota_bytes) * 100);
  const usedMB = (user.storage_used_bytes / 1024 / 1024).toFixed(0);
  const quotaGB = (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0);

  const handleSaveNickname = () => {
    setEditNickname(false);
    showToast("닉네임이 변경되었습니다.", "success");
  };

  return (
    <div className="mypage-section">
      <h2 className="mypage-section__title">프로필</h2>

      <div className="mypage-profile__photo-area">
        <div className="mypage-profile__avatar">
          {user.profile_img_url ? (
            <img src={user.profile_img_url} alt="프로필" />
          ) : (
            <UserCircle size={64} color="var(--color-muted)" />
          )}
        </div>
        <button className="mypage-profile__change-photo" onClick={() => setPhotoOpen(true)}>
          사진 변경
        </button>
      </div>

      <div className="mypage-profile__info">
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">닉네임</span>
          {editNickname ? (
            <div className="mypage-profile__edit-row">
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
              <Button size="sm" onClick={handleSaveNickname}>저장</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditNickname(false)}>취소</Button>
            </div>
          ) : (
            <div className="mypage-profile__edit-row">
              <span>{nickname}</span>
              <button className="mypage-profile__edit-btn" onClick={() => setEditNickname(true)}>수정</button>
            </div>
          )}
        </div>
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">이메일</span>
          <span>{user.email}</span>
        </div>
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">플랜</span>
          <Badge variant={user.plan === "PRO" ? "pro" : "default"}>{user.plan}</Badge>
        </div>
        <div className="mypage-profile__field">
          <span className="mypage-profile__label">가입일</span>
          <span>{formatDate(user.created_at)}</span>
        </div>
      </div>

      <div className="mypage-profile__storage">
        <div className="mypage-profile__storage-header">
          <span className="mypage-profile__label">스토리지 사용량</span>
          <span className="mypage-profile__storage-text">{usedMB}MB / {quotaGB}GB ({storagePercent}%)</span>
        </div>
        <div className="mypage-profile__storage-bar">
          <div className="mypage-profile__storage-fill" style={{ width: `${storagePercent}%` }} />
        </div>
      </div>

      <div className="mypage-profile__payment-section">
        <div className="mypage-profile__payment-header">
          <span className="mypage-section__subtitle">결제 수단</span>
          <button className="mypage-profile__edit-btn" onClick={() => setPaymentOpen(true)}>변경</button>
        </div>
        <div className="mypage-profile__payment-card">
          <p className="mypage-profile__payment-method">카카오페이</p>
          <p className="mypage-profile__payment-sub">
            다음 결제일: {mockSubscription.current_period_end ? formatDate(mockSubscription.current_period_end) : "-"}
          </p>
        </div>
      </div>

      <ProfilePhotoModal isOpen={photoOpen} onClose={() => setPhotoOpen(false)} />
      <PaymentMethodModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
};

export default MyPageProfile;
