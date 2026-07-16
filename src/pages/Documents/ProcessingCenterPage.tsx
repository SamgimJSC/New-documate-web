import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import type {
  UploadProcessItem,
  UploadProcessStatus,
} from "../../services/uploadLocalService";
import { uploadService, type TempDocumentItem } from "../../services/uploadService";
import { documentService } from "../../services/documentService";
import { getReceipts } from "../../api/receipt";
import { useCategories } from "../../hooks/useCategories";
import { useToast } from "../../components/common/Toast";
import type { DocumentCategory } from "../../types/document";
import type { UploadDocumentCategory } from "../../types/upload";
import {
  formatUploadedAt,
  getMoveButtonLabel,
  PROCESS_STATUS_HELPER,
  PROCESS_STATUS_LABEL,
} from "../../utils/uploadWorkflow";
import "./ProcessingCenterPage.css";

type ProcessTab = "all" | UploadProcessStatus;

const statusTabs: ProcessTab[] = ["all", "analyzing", "failed", "completed"];

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
    ...(item.status === "completed"
      ? [{ label: "AI 분류", value: item.category }]
      : []),
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

const buildFileName = (files: TempDocumentItem["files"]) =>
  files[0]?.fileName ?? "업로드 문서";

const buildItemFromTemp = (temp: TempDocumentItem): UploadProcessItem => {
  const totalSizeBytes = temp.files.reduce(
    (sum, f) => sum + Number(f.fileSizeBytes || 0),
    0,
  );
  const fileName = buildFileName(temp.files);
  const status: UploadProcessStatus =
    temp.aiStatus === "FAILED" ? "failed" : "analyzing";

  return {
    id: temp.tempDocumentId,
    fileName,
    displayName: fileName.replace(/\.(jpg|jpeg|png)$/i, ""),
    fileType: fileName.toLowerCase().endsWith(".png") ? "PNG" : "JPG",
    fileSizeBytes: totalSizeBytes,
    sizeMb: Number((totalSizeBytes / (1024 * 1024)).toFixed(1)),
    pageCount: temp.files.length || 1,
    uploadedAt: temp.createdAt,
    status,
    category: "기타",
    extractedFields: [],
    confidence: status === "failed" ? 0 : 0.88,
    progress: status === "failed" ? 0 : 50,
    errorMessage: status === "failed" ? "AI 분석에 실패했어요." : undefined,
    savedRecordId: temp.tempDocumentId,
    uploadedFileIds: temp.files.map((f) => ({ id: f.id, pageNo: f.pageNo })),
    pageFileUrls: temp.files.map((f) => f.fileUrl),
  };
};

type MatchResult = {
  savedTarget: "documents" | "receipts";
  finalDocumentId: string;
  category: UploadDocumentCategory;
  pageFileUrls?: string[];
  extractedFields?: UploadProcessItem["extractedFields"];
  memo: string;
};

const MATCH_CANDIDATE_LIMIT = 50;

const matchByFileUrl = async (
  fileUrl: string,
  categories: DocumentCategory[],
): Promise<MatchResult | null> => {
  try {
    // 목록 조회 응답에 document_files(파일별 file_url)가 이미 포함되어 있어서,
    // 문서마다 상세 조회를 따로 호출할 필요가 없다.
    const docs = await documentService.getDocuments({ limit: MATCH_CANDIDATE_LIMIT });
    const matchedDoc = docs.find((doc) =>
      doc.document_files.some((f) => f.file_url === fileUrl),
    );

    if (matchedDoc) {
      const cat = categories.find(
        (c) => c.category_id === matchedDoc.category_id,
      );
      return {
        savedTarget: "documents",
        finalDocumentId: matchedDoc.document_id,
        category: (cat?.name as UploadDocumentCategory) ?? "기타",
        pageFileUrls: matchedDoc.document_files.map((f) => f.file_url),
        memo: "AI 분석이 완료되어 디지털 캐비닛에 저장되었습니다.",
      };
    }
  } catch {
    // 문서 조회 실패 시 영수증으로 계속 시도
  }

  try {
    const res = await getReceipts({ size: MATCH_CANDIDATE_LIMIT, sort: "latest" });
    const matchedReceipt = res.receipts.find((r) => r.fileUrl === fileUrl);

    if (matchedReceipt) {
      const extractedFields = [
        { label: "가게명", value: matchedReceipt.storeName || "" },
        {
          label: "금액",
          value:
            matchedReceipt.totalAmount != null
              ? `${matchedReceipt.totalAmount.toLocaleString("ko-KR")}원`
              : "",
        },
        { label: "결제일", value: matchedReceipt.purchaseDate || "" },
        {
          label: "품목",
          value:
            typeof matchedReceipt.paymentItem === "string" &&
            !/^\s*\[/.test(matchedReceipt.paymentItem)
              ? matchedReceipt.paymentItem
              : "",
        },
      ].filter((f) => f.value.trim() !== "");

      return {
        savedTarget: "receipts",
        finalDocumentId: matchedReceipt.receiptId,
        category: "영수증",
        extractedFields,
        memo: "AI 분석이 완료되어 영수증 보드에 저장되었습니다.",
      };
    }
  } catch {
    // 영수증 조회 실패는 무시하고 매칭 실패로 처리
  }

  return null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// aiStatus가 DONE으로 확정된 직후엔 documents/receipts 쪽에 아직 반영이 안 됐을 수 있어서,
// 짧은 간격으로 몇 번 더 조회해본 뒤에야 매칭 실패로 확정한다.
const MATCH_RETRY_COUNT = 3;
const MATCH_RETRY_DELAY_MS = 1500;

const matchByFileUrlWithRetry = async (
  fileUrl: string,
  categories: DocumentCategory[],
): Promise<MatchResult | null> => {
  for (let attempt = 0; attempt < MATCH_RETRY_COUNT; attempt += 1) {
    const match = await matchByFileUrl(fileUrl, categories);
    if (match) return match;
    if (attempt < MATCH_RETRY_COUNT - 1) await sleep(MATCH_RETRY_DELAY_MS);
  }
  return null;
};

const resolveCompletedItem = async (
  temp: TempDocumentItem,
  categories: DocumentCategory[],
): Promise<UploadProcessItem> => {
  const base = buildItemFromTemp(temp);
  const primaryFileUrl = temp.files[0]?.fileUrl;

  if (!primaryFileUrl) {
    return {
      ...base,
      status: "matchFailed",
      progress: 0,
      errorMessage: "결과 파일 정보를 찾을 수 없어요.",
    };
  }

  const match = await matchByFileUrlWithRetry(primaryFileUrl, categories);

  if (!match) {
    return {
      ...base,
      status: "matchFailed",
      progress: 0,
      errorMessage: "완료된 문서를 찾지 못했어요. 다시 확인해 주세요.",
    };
  }

  return {
    ...base,
    status: "completed",
    progress: 100,
    savedTarget: match.savedTarget,
    finalDocumentId: match.finalDocumentId,
    category: match.category,
    pageFileUrls: match.pageFileUrls ?? base.pageFileUrls,
    extractedFields: match.extractedFields ?? base.extractedFields,
    memo: match.memo,
    errorMessage: undefined,
  };
};

export function ProcessingCenterPage() {
  const navigate = useNavigate();
  const categories = useCategories();
  const { showToast } = useToast();

  const [processItems, setProcessItems] = useState<UploadProcessItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProcessTab>("all");
  const [processQuery, setProcessQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const selectedItem =
    processItems.find((item) => item.id === selectedItemId) ??
    processItems[0] ??
    null;

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
    if (categories.length === 0) return;

    let cancelled = false;

    uploadService
      .getTempList()
      .then(async (list) => {
        const built = await Promise.all(
          list.map((temp) =>
            temp.aiStatus === "DONE"
              ? resolveCompletedItem(temp, categories)
              : Promise.resolve(buildItemFromTemp(temp)),
          ),
        );

        if (!cancelled) setProcessItems(built);
      })
      .catch(() => {
        if (!cancelled) setProcessItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categories]);

  useEffect(() => {
    const analyzingItems = processItems.filter(
      (item) => item.status === "analyzing" && item.savedRecordId,
    );

    if (analyzingItems.length === 0) return;

    const timer = window.setInterval(() => {
      analyzingItems.forEach((item) => {
        uploadService
          .getTempDocument(item.savedRecordId!)
          .then(async (temp) => {
            if (temp.aiStatus === "FAILED") {
              updateItem(item.id, {
                status: "failed",
                progress: 0,
                confidence: 0,
                errorMessage: "AI 분석에 실패했어요.",
              });
              return;
            }

            if (temp.aiStatus === "DONE") {
              const resolved = await resolveCompletedItem(temp, categories);
              updateItem(item.id, resolved);
            }
          })
          .catch((error) => {
            const status = (error as { response?: { status?: number } })
              ?.response?.status;

            if (status === 404) {
              updateItem(item.id, {
                status: "failed",
                progress: 0,
                confidence: 0,
                errorMessage: "분석 중 삭제됨 (3일 경과 자동 정리)",
              });
            }
            // 그 외 네트워크 오류는 다음 폴링에서 재시도
          });
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [processItems, categories]);

  const stats = useMemo(
    () => ({
      total: processItems.length,
      analyzing: processItems.filter((item) => item.status === "analyzing")
        .length,
      failed: processItems.filter(
        (item) => item.status === "failed" || item.status === "matchFailed",
      ).length,
      completed: processItems.filter((item) => item.status === "completed")
        .length,
    }),
    [processItems],
  );

  const filteredItems = useMemo(() => {
    const query = processQuery.trim().toLowerCase();

    return processItems
      .filter((item) => {
        const matchesTab =
          activeTab === "all" ||
          item.status === activeTab ||
          (activeTab === "failed" && item.status === "matchFailed");
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
        errorMessage:
          "재분석에 필요한 파일 정보가 없습니다. 다시 업로드해 주세요.",
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

  const refetchMatch = async (itemId: string) => {
    const item = processItems.find((i) => i.id === itemId);
    if (!item?.savedRecordId) return;

    updateItem(itemId, {
      status: "analyzing",
      errorMessage: undefined,
      memo: "결과를 다시 확인하고 있어요.",
    });

    try {
      const temp = await uploadService.getTempDocument(item.savedRecordId);
      const resolved = await resolveCompletedItem(temp, categories);
      updateItem(itemId, resolved);
    } catch {
      updateItem(itemId, {
        status: "matchFailed",
        errorMessage: "다시 확인하는 데 실패했어요.",
      });
    }
  };

  const deleteProcessItem = async (itemId: string) => {
    try {
      await uploadService.deleteTempDocument(itemId);
      setProcessItems((current) => current.filter((item) => item.id !== itemId));
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;

      if (status === 409) {
        showToast("분석 진행 중에는 삭제할 수 없어요.", "error");
        return;
      }

      showToast("삭제에 실패했어요. 다시 시도해 주세요.", "error");
    }
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
              페이지 수: {pageCount}장 · AI 결과:{" "}
              {selectedItem.status === "completed"
                ? selectedItem.category
                : selectedItem.status === "matchFailed"
                  ? "결과 확인 필요"
                  : "분석중"}{" "}
              · 업로드: {formatUploadedAt(selectedItem.uploadedAt)}
            </p>
          </div>
          <button type="button" aria-label="문서 즐겨찾기">
            ♡
          </button>
        </section>

        {selectedItem.status === "completed" && (
          <section className="process-preview-card">
            <div className="process-detail-section-title">
              <h3>페이지 미리보기</h3>
              <span>{pageCount}장</span>
            </div>
            <div
              className="process-preview-strip"
              aria-label="문서 페이지 미리보기"
            >
              {Array.from({ length: Math.min(pageCount, 4) }).map(
                (_, index) => {
                  const url = selectedItem.pageFileUrls?.[index];
                  const handleImgError = (
                    e: SyntheticEvent<HTMLImageElement>,
                  ) => {
                    const target = e.currentTarget;
                    target.style.display = "none";
                    const wrapper = target.closest(".process-page-thumbnail");
                    if (wrapper) {
                      wrapper.classList.add("is-deleted");
                      if (!wrapper.querySelector(".deleted-icon")) {
                        const icon = document.createElement("span");
                        icon.className = "deleted-icon";
                        icon.innerHTML =
                          '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
                        wrapper.insertBefore(icon, wrapper.firstChild);
                      }
                    }
                  };
                  return (
                    <figure key={index}>
                      <div className="process-page-thumbnail">
                        {url ? (
                          <img
                            src={url}
                            alt={`${index + 1}페이지`}
                            onError={handleImgError}
                          />
                        ) : (
                          <>
                            <i />
                            <i />
                            <i />
                          </>
                        )}
                      </div>
                      <figcaption>{index + 1}</figcaption>
                    </figure>
                  );
                },
              )}
              {pageCount > 4 && (
                <figure className="process-page-more">
                  <div>+{pageCount - 4}</div>
                  <figcaption>더 보기</figcaption>
                </figure>
              )}
            </div>
          </section>
        )}

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
            {selectedItem.status === "completed" && (
              <span>{selectedItem.category}</span>
            )}
          </div>
          <p className="process-analysis-description">
            {selectedItem.status === "failed"
              ? "분석에 실패했습니다. 재시도하거나 수기로 등록해 주세요."
              : selectedItem.status === "matchFailed"
                ? "AI 분석은 완료됐지만 저장된 결과를 찾지 못했어요. 재조회해 주세요."
                : selectedItem.status === "completed"
                  ? `${selectedItem.category} 문서의 주요 정보가 추출되었습니다.`
                  : "AI가 문서를 분석하고 있습니다."}
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
              <button
                type="button"
                className="process-text-button"
                onClick={() => deleteProcessItem(selectedItem.id)}
              >
                업로드 목록에서 삭제
              </button>
            </>
          ) : selectedItem.status === "matchFailed" ? (
            <>
              <button
                type="button"
                className="process-danger-button"
                onClick={() => refetchMatch(selectedItem.id)}
              >
                재조회
              </button>
              <button
                type="button"
                className="process-text-button"
                onClick={() => deleteProcessItem(selectedItem.id)}
              >
                업로드 목록에서 삭제
              </button>
            </>
          ) : selectedItem.status === "completed" ? (
            <>
              <button
                type="button"
                className="process-ghost-button"
                onClick={() => {
                  if (selectedItem.finalDocumentId) {
                    const path =
                      selectedItem.savedTarget === "receipts"
                        ? `/receipts/${selectedItem.finalDocumentId}`
                        : `/documents/${selectedItem.finalDocumentId}`;
                    navigate(path);
                  }
                }}
              >
                문서 상세 보기
              </button>
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
              <button
                type="button"
                className="process-text-button"
                onClick={() => deleteProcessItem(selectedItem.id)}
              >
                업로드 목록에서 삭제
              </button>
            </>
          ) : null}
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
          <p>
            분석 상태를 확인하고 완료된 문서를 디지털 캐비닛에서 확인하세요.
          </p>
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

      {isLoading ? (
        <section className="process-empty-card">
          <strong>업로드 현황을 불러오고 있어요...</strong>
        </section>
      ) : processItems.length === 0 ? (
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
                    <span>
                      {item.status === "analyzing" ? "" : item.category}
                    </span>
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
                      {item.status === "matchFailed" && (
                        <button
                          type="button"
                          className="is-danger"
                          onClick={() => refetchMatch(item.id)}
                        >
                          재조회
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
