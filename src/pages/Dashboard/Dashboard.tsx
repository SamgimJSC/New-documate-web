import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, HardDrive, Lock } from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import DocumentUploadModal from "../../components/modal/DocumentUploadModal";
import { mockCurrentUser } from "../../data/mockUsers";
import { mockDocuments } from "../../data/mockDocuments";
import { mockReceipts } from "../../data/mockReceipts";
import { mockMonthlyReports } from "../../data/mockReports";
import { formatDate, getDday } from "../../utils/formatDate";
import { formatKRW } from "../../utils/formatCurrency";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"recent" | "favorite">("recent");
  const [uploadOpen, setUploadOpen] = useState(false);

  const user = mockCurrentUser;
  const docs = mockDocuments.filter((d) => d.is_deleted === "N");
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
    return r.purchase_date.startsWith(month) && r.is_deleted === "N";
  });
  const thisMonthSpend = thisMonthReceipts.reduce((s, r) => s + r.total_amount, 0);
  const latestReport = mockMonthlyReports[mockMonthlyReports.length - 1];
  const storagePercent = Math.round((user.storage_used_bytes / user.storage_quota_bytes) * 100);
  const usedMB = (user.storage_used_bytes / 1024 / 1024).toFixed(0);
  const quotaGB = (user.storage_quota_bytes / 1024 / 1024 / 1024).toFixed(0);
  const isPro = user.plan === "PRO";

  const displayDocs = tab === "recent"
    ? [...docs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4)
    : docs.filter((d) => d.is_favorite).slice(0, 4);

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <div>
          <h2 className="dashboard__greeting">안녕하세요, {user.nickname}님 👋</h2>
          <p className="dashboard__date">{new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</p>
        </div>
        {isPro && <Badge variant="pro">PRO</Badge>}
      </div>

      <div className="dashboard__summary-grid">
        <Card className="dashboard__summary-card">
          <div className="dashboard__summary-icon dashboard__summary-icon--blue"><FileText size={20} /></div>
          <p className="dashboard__summary-value">{docs.length}</p>
          <p className="dashboard__summary-label">총 문서</p>
        </Card>
        <Card className="dashboard__summary-card">
          <div className="dashboard__summary-icon dashboard__summary-icon--orange"><Clock size={20} /></div>
          <p className="dashboard__summary-value">{expiringDocs.length}</p>
          <p className="dashboard__summary-label">만료 임박</p>
        </Card>
        <Card className="dashboard__summary-card">
          <div className="dashboard__summary-icon dashboard__summary-icon--green"><HardDrive size={20} /></div>
          <p className="dashboard__summary-value">{usedMB}MB</p>
          <p className="dashboard__summary-label">/{quotaGB}GB 사용</p>
          <div className="dashboard__storage-bar">
            <div className="dashboard__storage-fill" style={{ width: `${storagePercent}%` }} />
          </div>
        </Card>
      </div>

      <div className="dashboard__grid">
        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h3 className="dashboard__section-title">문서 목록</h3>
            <button className="dashboard__view-all" onClick={() => navigate("/documents")}>전체 보기</button>
          </div>
          <div className="dashboard__tabs">
            <button className={`dashboard__tab${tab === "recent" ? " dashboard__tab--active" : ""}`} onClick={() => setTab("recent")}>최근 업로드</button>
            <button className={`dashboard__tab${tab === "favorite" ? " dashboard__tab--active" : ""}`} onClick={() => setTab("favorite")}>즐겨찾기</button>
          </div>
          <div className="dashboard__doc-list">
            {displayDocs.length === 0 ? (
              <p className="dashboard__empty">문서가 없습니다.</p>
            ) : (
              displayDocs.map((doc) => (
                <div key={doc.document_id} className="dashboard__doc-item" onClick={() => navigate(`/documents/${doc.document_id}`)}>
                  <div className="dashboard__doc-icon">{doc.file_type}</div>
                  <div className="dashboard__doc-info">
                    <p className="dashboard__doc-title">{doc.title}</p>
                    <p className="dashboard__doc-meta">{formatDate(doc.created_at)}</p>
                  </div>
                  {doc.expiry_date && (
                    <Badge variant={getDday(doc.expiry_date).startsWith("D-") && parseInt(getDday(doc.expiry_date).slice(2)) <= 30 ? "danger" : "default"}>
                      {getDday(doc.expiry_date)}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
          <div
            className="dashboard__upload-zone"
            onClick={() => setUploadOpen(true)}
          >
            <span className="dashboard__upload-plus">+</span>
            <p>문서를 드래그하거나 클릭하여 업로드</p>
          </div>
        </div>

        <div className="dashboard__right">
          <Card className="dashboard__spend-card">
            <h3 className="dashboard__section-title">이번달 지출</h3>
            <p className="dashboard__spend-amount">{formatKRW(thisMonthSpend)}</p>
            <p className="dashboard__spend-count">영수증 {thisMonthReceipts.length}건</p>
            <button className="dashboard__view-all" onClick={() => navigate("/finance")}>가계부 보기</button>
          </Card>

          <Card className={`dashboard__pro-card${!isPro ? " dashboard__pro-card--locked" : ""}`}>
            <div className="dashboard__pro-header">
              <h3 className="dashboard__section-title">소비 리포트</h3>
              {!isPro && <Badge variant="pro">PRO</Badge>}
            </div>
            {isPro ? (
              <>
                <p className="dashboard__pro-analysis">{latestReport.ai_analysis}</p>
                <button className="dashboard__view-all" onClick={() => navigate("/finance/report")}>리포트 보기</button>
              </>
            ) : (
              <div className="dashboard__pro-locked">
                <Lock size={24} />
                <p>PRO 업그레이드 후 이용 가능합니다</p>
                <button className="dashboard__upgrade-btn" onClick={() => navigate("/mypage/plan")}>
                  업그레이드
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <DocumentUploadModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
};

export default Dashboard;
