import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { mockCurrentUser } from "../../data/mockUsers";
import "./MyPage.css";

const MyPageLogout: React.FC = () => {
  const navigate = useNavigate();
  const user = mockCurrentUser;

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="mypage-section mypage-logout">
      <div className="mypage-logout__box">
        <p className="mypage-logout__icon">👋</p>
        <h2 className="mypage-section__title">로그아웃</h2>
        <p className="mypage-logout__desc">
          <strong>{user.nickname}</strong>님, 로그아웃 하시겠습니까?
        </p>
        <div className="mypage-logout__actions">
          <Button variant="ghost" onClick={() => navigate(-1)}>취소</Button>
          <Button variant="primary" onClick={handleLogout}>로그아웃</Button>
        </div>
      </div>
    </div>
  );
};

export default MyPageLogout;
