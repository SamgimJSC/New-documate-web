import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, HardDrive, Lock } from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { useUserStore } from "../../store/userStore";
import { documentService } from "../../services/documentService";
import { mockReceipts } from "../../data/mockReceipts";
import { mockMonthlyReports } from "../../data/mockReports";
import type { Document } from "../../types/document";
import { formatDate, getDday } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"recent" | "favorite">("recent");
  const [documents, setDocuments] = useState<Document[]>([]);

  const user = useUserStore((s) => s.user);

  useEffect(() => {
    documentService.getDocuments()
      .then((list) => setDocuments(list.filter((d) => d.is_deleted === "N")))
      .catch(() => setDocuments([]));
  }, []);

  if (!user) return null;

  const docs = documents;
  const expiringDocs = docs.filter((d) => {
    if (!d.expiry_date) return false;
    const today = new Date();
    const exp = new Date(d.expiry_date);
    const diffDays = Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  });
  const thisMonthReceipts = mockReceipts.filter((r) => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    console.log(month)
    return r.purchaseDate.startsWith(month);
  });
  const thisMonthSpend = thisMonthReceipts.reduce((s, r) => s + r.totalAmount, 0);
  const latestReport = mockMonthlyReports[mockMonthlyReports.length - 1];
  const storagePercent = user.storage_quota_bytes > 0
    ? Math.round((user.storage_used_bytes / user.storage_quota_bytes) * 100)
    : 0;
  const usedMB = (user.storage_used_bytes / 1024 / 1024).toFixed(0);
  const quotaGB = user.storage_quota_bytes > 0
    ? (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0)
    : "-";
  const isPro = user.plan === "PRO";

  const displayDocs = tab === "recent"
    ? [...docs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4)
    : docs.filter((d) => d.is_favorite).slice(0, 4);

  const todayText = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <div>
          <p className="dashboard__eyebrow">오늘의 문서 현황</p>
          <h2 className="dashboard__greeting">안녕하세요, {user.nickname}님 👋</h2>
          <p className="dashboard__date">{todayText}</p>
        </div>
        {isPro && <Badge variant="pro">PRO</Badge>}
      </div>

      <div className="dashboard__summary-grid">
        <Card className="dashboard__summary-card dashboard__summary-card--docs">
          <div className="dashboard__summary-icon dashboard__summary-icon--blue"><FileText size={20} /></div>
          <div>
            <p className="dashboard__summary-value">{docs.length}</p>
            <p className="dashboard__summary-label">총 문서</p>
            <p className="dashboard__summary-note">보관 중인 전체 문서</p>
          </div>
        </Card>
        <Card className="dashboard__summary-card dashboard__summary-card--expiry">
          <div className="dashboard__summary-icon dashboard__summary-icon--orange"><Clock size={20} /></div>
          <div>
            <p className="dashboard__summary-value">{expiringDocs.length}</p>
            <p className="dashboard__summary-label">만료 임박</p>
            <p className="dashboard__summary-note">90일 이내 확인 필요</p>
          </div>
        </Card>
        <Card className="dashboard__summary-card dashboard__summary-card--storage">
          <div className="dashboard__summary-icon dashboard__summary-icon--green"><HardDrive size={20} /></div>
          <div className="dashboard__summary-content">
            <p className="dashboard__summary-value">{usedMB}MB</p>
            <p className="dashboard__summary-label">{quotaGB}GB 중 {storagePercent}% 사용</p>
            <div className="dashboard__storage-bar" aria-label="저장 공간 사용량">
              <div className="dashboard__storage-fill" style={{ width: `${storagePercent}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="dashboard__grid">
        <section className="dashboard__section dashboard__documents-card">
          <div className="dashboard__section-header">
            <div>
              <h3 className="dashboard__section-title">문서 목록</h3>
              <p className="dashboard__section-subtitle">최근 문서와 즐겨찾기를 빠르게 확인하세요.</p>
            </div>
            <button className="dashboard__view-all" onClick={() => navigate("/documents")}>전체 보기</button>
          </div>

          <div className="dashboard__tabs" role="tablist" aria-label="문서 목록 필터">
            <button className={`dashboard__tab${tab === "recent" ? " dashboard__tab--active" : ""}`} onClick={() => setTab("recent")}>최근 업로드</button>
            <button className={`dashboard__tab${tab === "favorite" ? " dashboard__tab--active" : ""}`} onClick={() => setTab("favorite")}>즐겨찾기</button>
          </div>

          <div className="dashboard__doc-list">
            {displayDocs.length === 0 ? (
              <p className="dashboard__empty">표시할 문서가 없습니다.</p>
            ) : (
              displayDocs.map((doc) => (
                <button
                  key={doc.document_id}
                  type="button"
                  className="dashboard__doc-item"
                  onClick={() => navigate(`/documents/${doc.document_id}`)}
                >
                  <span className="dashboard__doc-icon">{doc.file_type}</span>
                  <span className="dashboard__doc-info">
                    <span className="dashboard__doc-title">{doc.title}</span>
                    <span className="dashboard__doc-meta">{formatDate(doc.created_at)}</span>
                  </span>
                  {doc.expiry_date && (
                    <Badge variant={getDday(doc.expiry_date).startsWith("D-") && parseInt(getDday(doc.expiry_date).slice(2)) <= 30 ? "danger" : "default"}>
                      {getDday(doc.expiry_date)}
                    </Badge>
                  )}
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            className="dashboard__upload-zone"
            onClick={() => navigate("/upload")}
          >
            <span className="dashboard__upload-plus">+</span>
            <span className="dashboard__upload-text">새 문서를 업로드하고 AI 분석을 시작하세요.</span>
          </button>
        </section>

        <aside className="dashboard__right">
          <Card className="dashboard__spend-card">
            <div>
              <h3 className="dashboard__section-title">이번 달 지출</h3>
              <p className="dashboard__section-subtitle">영수증 기반 소비 요약</p>
            </div>
            <p className="dashboard__spend-amount">{formatKRW(thisMonthSpend)}</p>
            <p className="dashboard__spend-count">영수증 {thisMonthReceipts.length}건</p>
            <button className="dashboard__view-all dashboard__view-all--center" onClick={() => navigate("/finance")}>가계부 보기</button>
          </Card>

          <Card className={`dashboard__pro-card${!isPro ? " dashboard__pro-card--locked" : ""}`}>
            <div className="dashboard__pro-header">
              <div>
                <h3 className="dashboard__section-title">소비 리포트</h3>
                <p className="dashboard__section-subtitle">AI 인사이트</p>
              </div>
              {!isPro && <Badge variant="pro">PRO</Badge>}
            </div>
            {isPro ? (
              <>
                <p className="dashboard__pro-analysis">{latestReport.ai_analysis}</p>
                <button className="dashboard__view-all dashboard__view-all--center" onClick={() => navigate("/finance/report")}>리포트 보기</button>
              </>
            ) : (
              <div className="dashboard__pro-locked">
                <Lock size={24} />
                <p>PRO 업그레이드 후 이용 가능합니다</p>
                <button className="dashboard__upgrade-btn" onClick={() => navigate("/mypage/plan")}>업그레이드</button>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
