import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  uploadLocalService,
  type UploadProcessItem,
  type UploadProcessStatus,
} from "../../services/uploadLocalService";
import { uploadService } from "../../services/uploadService";
import { documentService } from "../../services/documentService";
import { useCategories } from "../../hooks/useCategories";
import type { UploadDocumentCategory } from "../../types/upload";
import {
  formatUploadedAt,
  getMoveButtonLabel,
  PROCESS_STATUS_HELPER,
  PROCESS_STATUS_LABEL,
} from "../../utils/uploadWorkflow";
import "./ProcessingCenterPage.css";

type ProcessTab = "all" | UploadProcessStatus;

const statusTabs: ProcessTab[] = [
  "all",
  "analyzing",
  "failed",
  "completed",
];

const getTabLabel = (tab: ProcessTab) =>
  tab === "all" ? "전체" : PROCESS_STATUS_LABEL[tab];

const getPageCount = (item: UploadProcessItem) => item.pageCount ?? 1;

const getSummaryFields = (item: UploadProcessItem) => {
  const fields = item.extractedFields.filter(
    (field) => field.label.trim() && String(field.value).trim(),
  );

  if (fields.length >= 4) {
    return fields.slice(0, 4);
  }

  return [
    ...fields,
    { label: "문서명", value: item.displayName },
    { label: "AI 분류", value: item.category },
    { label: "업로드일", value: formatUploadedAt(item.uploadedAt) },
  ].slice(0, 4);
};

const getStatusCardClass = (tab: ProcessTab, activeTab: ProcessTab) => {
  const classes = [activeTab === tab ? "is-selected" : ""];

  if (tab === "failed") classes.push("is-danger");
  if (tab === "waitingSave") classes.push("is-waiting");
  if (tab === "completed") classes.push("is-success");
  if (tab === "analyzing") classes.push("is-info");

  return classes.filter(Boolean).join(" ");
};

export function ProcessingCenterPage() {
  const navigate = useNavigate();
  const categories = useCategories();

  const [processItems, setProcessItems] = useState<UploadProcessItem[]>(() =>
    uploadLocalService.readProcessItems(),
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    () => uploadLocalService.readProcessItems()[0]?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<ProcessTab>("all");
  const [processQuery, setProcessQuery] = useState("");

  const selectedItem =
    processItems.find((item) => item.id === selectedItemId) ??
    processItems[0] ??
    null;

  useEffect(() => {
    uploadLocalService.writeProcessItems(processItems);
  }, [processItems]);

  useEffect(() => {
    if (
      selectedItemId &&
      processItems.some((item) => item.id === selectedItemId)
    ) {
      return;
    }

    setSelectedItemId(processItems[0]?.id ?? null);
  }, [processItems, selectedItemId]);

  useEffect(() => {
    const analyzingItems = processItems.filter(
      (item) => item.status === "analyzing" && item.savedRecordId,
    );

    if (analyzingItems.length === 0) return;

    const timer = window.setInterval(() => {
      uploadService
        .getTempList()
        .then((list) => {
          analyzingItems.forEach((item) => {
            const found = list.find((d) => d.tempDocumentId === item.savedRecordId);
            if (!found) return;

            if (found.aiStatus === "DONE") {
              documentService
                .getDocuments()
                .then((docs) => {
                  const sorted = [...docs].sort((a, b) =>
                    b.created_at.localeCompare(a.created_at),
                  );
                  const matched =
                    sorted.find((d) => d.file_name === item.fileName) ?? sorted[0];

                  let category: UploadDocumentCategory = "기타";
                  if (matched) {
                    const cat = categories.find(
                      (c) => c.category_id === matched.category_id,
                    );
                    if (cat) category = cat.name as UploadDocumentCategory;
                  }

                  updateItem(item.id, {
                    status: "completed",
                    progress: 100,
                    savedTarget: "documents",
                    category,
                    memo: "AI 분석이 완료되어 디지털 캐비닛에 저장되었습니다.",
                  });
                })
                .catch(() => {
                  updateItem(item.id, {
                    status: "completed",
                    progress: 100,
                    savedTarget: "documents",
                    memo: "AI 분석이 완료되어 디지털 캐비닛에 저장되었습니다.",
                  });
                });
            } else if (found.aiStatus === "FAILED") {
              updateItem(item.id, {
                status: "failed",
                progress: 0,
                confidence: 0,
                errorMessage: "AI 분석에 실패했어요.",
              });
            }
          });
        })
        .catch(() => {/* 네트워크 오류는 다음 폴링에서 재시도 */});
    }, 5000);

    return () => window.clearInterval(timer);
  }, [processItems, categories]);

  const stats = useMemo(
    () => ({
      total: processItems.length,
      analyzing: processItems.filter((item) => item.status === "analyzing").length,
      failed: processItems.filter((item) => item.status === "failed").length,
      completed: processItems.filter((item) => item.status === "completed").length,
    }),
    [processItems],
  );

  const filteredItems = useMemo(() => {
    const query = processQuery.trim().toLowerCase();

    return processItems
      .filter((item) => {
        const matchesTab = activeTab === "all" || item.status === activeTab;
        const matchesQuery =
          !query ||
          item.displayName.toLowerCase().includes(query) ||
          item.fileName.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query);

        return matchesTab && matchesQuery;
      })
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [activeTab, processItems, processQuery]);

  const updateItem = (itemId: string, patch: Partial<UploadProcessItem>) => {
    setProcessItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    );
  };

  const retryAnalysis = (itemId: string) => {
    const item = processItems.find((i) => i.id === itemId);
    if (!item?.savedRecordId || !item.uploadedFileIds?.length) {
      updateItem(itemId, {
        status: "failed",
        errorMessage: "재분석에 필요한 파일 정보가 없습니다. 다시 업로드해 주세요.",
      });
      return;
    }

    updateItem(itemId, {
      status: "analyzing",
      progress: 25,
      confidence: 0,
      errorMessage: undefined,
      memo: "재분석을 시작했어요.",
    });

    uploadService
      .requestAi(item.savedRecordId, item.uploadedFileIds)
      .catch(() => {
        updateItem(itemId, {
          status: "failed",
          progress: 0,
          errorMessage: "재분석 요청에 실패했어요. 다시 시도해 주세요.",
        });
      });
  };

  const deleteProcessItem = (itemId: string) => {
    setProcessItems((current) => current.filter((item) => item.id !== itemId));
  };


  const renderDetailPanel = () => {
    if (!selectedItem) {
      return (
        <aside className="process-detail-panel process-detail-panel--empty">
          <strong>선택된 문서가 없어요.</strong>
          <p>왼쪽 목록에서 문서를 선택해 주세요.</p>
          <button type="button" onClick={() => navigate("/upload")}>
            업로드하러 가기
          </button>
        </aside>
      );
    }

    const summaryFields = getSummaryFields(selectedItem);
    const pageCount = getPageCount(selectedItem);

    return (
      <aside className="process-detail-panel">
        <section className="process-document-card">
          <div className="process-document-card__icon" aria-hidden="true">
            ▤
          </div>
          <div>
            <h2>{selectedItem.displayName}</h2>
            <p>
              페이지 수: {pageCount}장 · AI 결과: {selectedItem.category} ·
              업로드: {formatUploadedAt(selectedItem.uploadedAt)}
            </p>
          </div>
          <button type="button" aria-label="문서 즐겨찾기">
            ♡
          </button>
        </section>

        <section className="process-preview-card">
          <div className="process-detail-section-title">
            <h3>페이지 미리보기</h3>
            <span>{pageCount}장</span>
          </div>
          <div
            className="process-preview-strip"
            aria-label="문서 페이지 미리보기"
          >
            {Array.from({ length: Math.min(pageCount, 4) }).map((_, index) => (
              <figure key={index}>
                <div className="process-page-thumbnail">
                  <i />
                  <i />
                  <i />
                </div>
                <figcaption>{index + 1}</figcaption>
              </figure>
            ))}
            {pageCount > 4 && (
              <figure className="process-page-more">
                <div>+{pageCount - 4}</div>
                <figcaption>더 보기</figcaption>
              </figure>
            )}
          </div>
        </section>

        <section className="process-analysis-card">
          <div
            className={`process-status-box process-status-box--${selectedItem.status}`}
          >
            <strong>{PROCESS_STATUS_LABEL[selectedItem.status]}</strong>
            <p>
              {selectedItem.errorMessage ??
                selectedItem.memo ??
                PROCESS_STATUS_HELPER[selectedItem.status]}
            </p>
          </div>

          <div className="process-detail-section-title">
            <h3>분석 요약</h3>
            <span>{selectedItem.category}</span>
          </div>
          <p className="process-analysis-description">
            {selectedItem.status === "failed"
              ? "분석에 실패했습니다. 재시도하거나 수기로 등록해 주세요."
              : `${selectedItem.category} 문서의 주요 정보가 추출되었습니다.`}
          </p>

          <dl className="process-summary-grid">
            {summaryFields.map((field) => (
              <div key={field.label}>
                <dt>{field.label}</dt>
                <dd>{field.value || "-"}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="process-detail-actions">
          {selectedItem.status === "failed" ? (
            <>
              <button
                type="button"
                className="process-ghost-button"
                onClick={() => navigate("/upload/manual")}
              >
                수기로 등록하기
              </button>
              <button
                type="button"
                className="process-danger-button"
                onClick={() => retryAnalysis(selectedItem.id)}
              >
                재시도
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="process-ghost-button"
                onClick={() => setSelectedItemId(selectedItem.id)}
              >
                문서 상세 보기
              </button>

              {selectedItem.status === "completed" && (
                <button
                  type="button"
                  className="process-primary-button"
                  onClick={() =>
                    navigate(
                      selectedItem.savedTarget === "receipts"
                        ? "/receipts"
                        : "/documents",
                    )
                  }
                >
                  {getMoveButtonLabel(selectedItem.category)}
                </button>
              )}
            </>
          )}

          <button
            type="button"
            className="process-text-button"
            onClick={() => deleteProcessItem(selectedItem.id)}
          >
            업로드 목록에서 삭제
          </button>
        </div>
      </aside>
    );
  };

  return (
    <section className="processing-center-page">
      <div className="processing-center-page__header">
        <div>
          <p className="processing-center-page__kicker">
            문서 관리 · AI 분석 현황
          </p>
          <h1>업로드 현황</h1>
          <p>분석 상태를 확인하고 완료된 문서를 디지털 캐비닛에서 확인하세요.</p>
        </div>
      </div>

      <div className="process-status-cards">
        <button
          type="button"
          className={getStatusCardClass("all", activeTab)}
          onClick={() => setActiveTab("all")}
        >
          <span>전체 문서</span>
          <b>{stats.total}</b>
          <small>업로드된 전체 문서</small>
        </button>
        <button
          type="button"
          className={getStatusCardClass("analyzing", activeTab)}
          onClick={() => setActiveTab("analyzing")}
        >
          <span>분석 중</span>
          <b>{stats.analyzing}</b>
          <small>AI 분석 진행 중</small>
        </button>
        <button
          type="button"
          className={getStatusCardClass("failed", activeTab)}
          onClick={() => setActiveTab("failed")}
        >
          <span>분석 실패</span>
          <b>{stats.failed}</b>
          <small>재시도 필요</small>
        </button>
        <button
          type="button"
          className={getStatusCardClass("completed", activeTab)}
          onClick={() => setActiveTab("completed")}
        >
          <span>등록 완료</span>
          <b>{stats.completed}</b>
          <small>저장 완료 문서</small>
        </button>
      </div>

      {processItems.length === 0 ? (
        <section className="process-empty-card">
          <strong>처리 중인 문서가 없어요.</strong>
          <p>업로드 스튜디오에서 파일을 선택하고 AI 분석을 시작해 주세요.</p>
          <button type="button" onClick={() => navigate("/upload")}>
            업로드하러 가기
          </button>
        </section>
      ) : (
        <div className="processing-center-layout">
          <main className="process-list-panel">
            <div className="process-list-toolbar">
              <div className="process-tabs">
                {statusTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={activeTab === tab ? "is-active" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {getTabLabel(tab)}
                  </button>
                ))}
              </div>
              <div className="process-toolbar-actions">
                <input
                  value={processQuery}
                  onChange={(event) => setProcessQuery(event.target.value)}
                  placeholder="문서명 검색"
                />
                <button type="button">필터</button>
              </div>
            </div>

            <div className="process-table">
              <div className="process-table__head">
                <span>문서명</span>
                <span>페이지 수</span>
                <span>업로드 시간</span>
                <span>상태</span>
                <span>AI 분석 결과</span>
                <span>액션</span>
              </div>

              {filteredItems.length === 0 ? (
                <div className="process-table-empty">
                  <strong>검색 결과가 없어요.</strong>
                  <p>다른 문서명이나 상태 필터를 선택해 주세요.</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className={
                      selectedItem?.id === item.id ? "is-selected" : ""
                    }
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div className="process-document-name">
                      <i
                        className={`process-document-icon process-document-icon--${item.status}`}
                      >
                        ▤
                      </i>
                      <div>
                        <b>{item.displayName}</b>
                        <small>{item.fileName}</small>
                      </div>
                    </div>
                    <span>{getPageCount(item)}장</span>
                    <span>{formatUploadedAt(item.uploadedAt)}</span>
                    <i className={`process-chip process-chip--${item.status}`}>
                      {PROCESS_STATUS_LABEL[item.status]}
                    </i>
                    <span>{item.category}</span>
                    <div
                      className="process-row-actions"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {item.status === "failed" && (
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => retryAnalysis(item.id)}
                        >
                          재시도
                        </button>
                      )}
                      {item.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => setSelectedItemId(item.id)}
                        >
                          상세 보기
                        </button>
                      )}
                      {item.status === "analyzing" && <span>—</span>}
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="process-list-footer">
              <span>전체 {filteredItems.length}건</span>
              <div>
                <button type="button" aria-label="이전 페이지">
                  ‹
                </button>
                <b>1</b>
                <button type="button" aria-label="다음 페이지">
                  ›
                </button>
              </div>
            </div>
          </main>

          {renderDetailPanel()}
        </div>
      )}
    </section>
  );
}
