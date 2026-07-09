import { LandingPage } from "../pages/LandingPage";
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import MyPageLayout from "../components/layout/MyPageLayout";
import PrivateRoute from "./PrivateRoute";

import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import Documents from "../pages/Documents/Documents";
import { UploadPage } from "../pages/Documents/UploadPage";
import { ManualRegisterPage } from "../pages/Documents/ManualRegisterPage";
import { ProcessingCenterPage } from "../pages/Documents/ProcessingCenterPage";
import DocumentDetail from "../pages/DocumentDetail/DocumentDetail";
import Receipts from "../pages/Receipts/Receipts";
import ReceiptDetail from "../pages/ReceiptDetail/ReceiptDetail";
import Finance from "../pages/Finance/Finance";
import FinanceReport from "../pages/FinanceReport/FinanceReport";
import Cards from "../pages/Cards/Cards";
import MyPageHome from "../pages/MyPage/MyPageHome";
import MyPageProfile from "../pages/MyPage/MyPageProfile";
import MyPageSettings from "../pages/MyPage/MyPageSettings";
import MyPagePlan from "../pages/MyPage/MyPagePlan";
import MyPageWithdraw from "../pages/MyPage/MyPageWithdraw";
import ResetPassword from "../pages/Login/ResetPassword";

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/upload/manual" element={<ManualRegisterPage />} />
          <Route path="/processing-center" element={<ProcessingCenterPage />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:document_id" element={<DocumentDetail />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/receipts/new/confirm" element={<ReceiptDetail />} />
          <Route path="/receipts/:receipt_id" element={<ReceiptDetail />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/finance/report" element={<FinanceReport />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/subscription" element={<MyPagePlan />} />

          <Route element={<MyPageLayout />}>
            <Route path="/mypage" element={<MyPageHome />} />
            <Route path="/mypage/profile" element={<MyPageProfile />} />
            <Route path="/mypage/settings" element={<MyPageSettings />} />
            <Route path="/mypage/plan" element={<MyPagePlan />} />
            <Route path="/mypage/withdraw" element={<MyPageWithdraw />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;
