import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { uploadCategoryGuide } from "../../data/uploadCategories";
import { AnalysisStartModal } from "../../components/upload/AnalysisStartModal";
import { AnalysisStartedModal } from "../../components/upload/AnalysisStartedModal";
import { uploadLocalService } from "../../services/uploadLocalService";
import {
  ACCEPTED_UPLOAD_TYPES,
  fileSizeMb,
  formatUploadedAt,
  inferUploadCategory,
  makeExtractedFields,
  MAX_UPLOAD_FILE_COUNT,
  MAX_UPLOAD_FILE_SIZE_MB,
  nowText,
} from "../../utils/uploadWorkflow";
import "./UploadPage.css";

type StudioView = "studio" | "uploaded";

type StudioFile = {
  id: string;
  fileName: string;
  sizeMb: number;
  fileSizeBytes: number;
  uploadedAt: string;
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

export function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [view, setView] = useState<StudioView>("studio");
  const [studioFiles, setStudioFiles] = useState<StudioFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showStartedModal, setShowStartedModal] = useState(false);
  const [startedFileCount, setStartedFileCount] = useState(0);
  const [toastMessage, setToastMessage] = useState("");

  const totalSizeMb = useMemo(
    () => studioFiles.reduce((sum, file) => sum + file.sizeMb, 0),
    [studioFiles],
  );

  const addFiles = (fileList: FileList | File[]) => {
    const errors: string[] = [];

    const validFiles = Array.from(fileList).reduce<StudioFile[]>(
      (acc, file) => {
        const mb = fileSizeMb(file);

        if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
          errors.push(`${file.name}은 JPG/PNG 파일이 아니에요.`);
          return acc;
        }

        if (mb > MAX_UPLOAD_FILE_SIZE_MB) {
          errors.push(`${file.name}은 10MB를 초과했어요.`);
          return acc;
        }

        acc.push({
          id: makeId(),
          fileName: file.name,
          sizeMb: mb,
          fileSizeBytes: file.size,
          uploadedAt: nowText(),
        });

        return acc;
      },
      [],
    );

    setStudioFiles((current) => {
      const availableSlots = MAX_UPLOAD_FILE_COUNT - current.length;

      if (availableSlots <= 0) {
        errors.push("한 번에 최대 10장까지만 업로드할 수 있어요.");
        return current;
      }

      const nextFiles = [...current, ...validFiles.slice(0, availableSlots)];

      if (validFiles.length > availableSlots) {
        errors.push("최대 10장까지만 추가되었어요.");
      }

      if (nextFiles.length > 0) {
        setView("uploaded");
      }

      return nextFiles;
    });

    setUploadError(errors[0] ?? "");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };


  const removeFile = (fileId: string) => {
    setStudioFiles((current) => {
      const next = current.filter((file) => file.id !== fileId);
      if (next.length === 0) setView("studio");
      return next;
    });
  };

  const clearFiles = () => {
    setStudioFiles([]);
    setUploadError("");
    setView("studio");
  };

  const openAnalysisModal = () => {
    if (studioFiles.length === 0) {
      setUploadError("분석할 파일을 먼저 업로드해 주세요.");
      return;
    }

    setShowAnalysisModal(true);
  };

  const startAnalysis = () => {
    const nextItems = studioFiles.map((file, index) => {
      const category = inferUploadCategory(file.fileName);

      return {
        ...uploadLocalService.buildProcessDocument({
          fileName: file.fileName,
          sizeMb: file.sizeMb,
          fileSizeBytes: file.fileSizeBytes,
          category,
          extractedFields: makeExtractedFields(category, file.fileName, index),
          status: "analyzing",
        }),
        progress: 20 + index * 8,
        confidence: 0,
      };
    });

    const currentItems = uploadLocalService.readProcessItems();
    uploadLocalService.writeProcessItems([...nextItems, ...currentItems]);

    setStartedFileCount(studioFiles.length);
    setStudioFiles([]);
    setUploadError("");
    setToastMessage("");
    setShowAnalysisModal(false);
    setShowStartedModal(true);
    setView("studio");
  };

  return (
    <section className="upload-page">
      {toastMessage && <div className="upload-page__toast">{toastMessage}</div>}

      <main className={`upload-studio-card upload-studio-card--${view}`}>
        <div className="upload-studio-card__title">
          <div>
            <p className="upload-page__kicker">1. 업로드 스튜디오 · 시작</p>
            <h1>
              {view === "uploaded"
                ? "업로드한 문서를 확인하세요"
                : "문서 이미지를 업로드하세요"}
            </h1>
            <p>
              문서 이미지를 업로드하거나 직접 등록하여 AI 분석을 시작하세요.
            </p>
          </div>
        </div>

        <div className="upload-studio-card__grid">
          <section className="upload-studio-card__main">
            {view === "studio" && (
              <div
                className={
                  dragActive
                    ? "upload-dropzone upload-dropzone--active"
                    : "upload-dropzone"
                }
                role="button"
                tabIndex={0}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") fileInputRef.current?.click();
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={handleFileChange}
                />
                <div className="upload-dropzone__icon">☁</div>
                <strong>문서 이미지를 업로드하세요</strong>
                <span>JPG / PNG · 최대 10MB · 최대 10장</span>
                <button type="button">파일 선택</button>
              </div>
            )}

            {view === "uploaded" && (
              <div className="upload-ready-panel">
                <div className="upload-ready-panel__notice">
                  <span>✓</span>
                  <div>
                    <strong>업로드가 완료되었습니다.</strong>
                    <p>업로드된 파일을 확인한 뒤 AI 분석을 시작해 주세요.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일 추가
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                <div className="upload-file-list" aria-label="업로드 파일 목록">
                  <div className="upload-file-list__head">
                    <span>파일명</span>
                    <span>크기</span>
                    <span>업로드 시간</span>
                    <span>상태</span>
                    <span>관리</span>
                  </div>

                  {studioFiles.map((file, index) => (
                    <article key={file.id} className="upload-file-row">
                      <div className="upload-file-row__name">
                        <b>{file.fileName}</b>
                        <small>#{index + 1}</small>
                      </div>
                      <span>{file.sizeMb} MB</span>
                      <span>{formatUploadedAt(file.uploadedAt)}</span>
                      <em>업로드 완료</em>
                      <div className="upload-file-row__actions">
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="upload-ready-panel__actions">
                  <div>
                    <strong>
                      {studioFiles.length}개 파일이 분석 대기 중입니다.
                    </strong>
                    <span>업로드된 파일을 확인한 뒤 AI 분석을 시작해 주세요.</span>
                  </div>
                  <div className="upload-ready-panel__action-buttons">
                    <button
                      type="button"
                      className="upload-ready-panel__clear"
                      onClick={clearFiles}
                    >
                      전체 삭제
                    </button>
                  </div>
                </div>
              </div>
            )}

            {uploadError && <p className="upload-page__error">{uploadError}</p>}
          </section>

          <aside className="upload-studio-side">
            <section className="upload-side-card">
              <div className="upload-side-card__title">
                <span>▣</span>
                <h2>업로드 가이드</h2>
              </div>
              <ul>
                <li>지원 형식: JPG, PNG</li>
                <li>최대 크기: 10MB</li>
                <li>권장 해상도: 300dpi 이상</li>
                <li>선명한 문서 이미지를 업로드해 주세요.</li>
              </ul>
            </section>

            <section className="upload-side-card">
              <div className="upload-side-card__title">
                <span>▣</span>
                <h2>분석 가능한 문서 예시</h2>
              </div>
              <div className="upload-category-pills">
                {uploadCategoryGuide.map((guide) => (
                  <span key={guide.category}>{guide.category}</span>
                ))}
              </div>
              <p className="upload-side-card__note">
                다양한 문서를 업로드하면 더 정확한 분석이 가능합니다.
              </p>
            </section>

            {studioFiles.length > 0 && (
              <>
                <section className="upload-side-card upload-summary-card">
                  <div className="upload-side-card__title">
                    <span>▣</span>
                    <h2>업로드 요약</h2>
                  </div>
                  <dl>
                    <div>
                      <dt>파일 수</dt>
                      <dd>{studioFiles.length}개</dd>
                    </div>
                    <div>
                      <dt>전체 크기</dt>
                      <dd>{totalSizeMb.toFixed(1)} MB</dd>
                    </div>
                    <div>
                      <dt>분석 가능</dt>
                      <dd>가능</dd>
                    </div>
                  </dl>
                  <button type="button" onClick={openAnalysisModal}>
                    AI 분석하기
                  </button>
                </section>
              </>
            )}
          </aside>
        </div>

        {view === "studio" && (
          <>
            <div className="upload-divider">
              <span>또는</span>
            </div>
            <section className="upload-manual-cta">
              <div className="upload-manual-cta__icon">✎</div>
              <div>
                <strong>수기 등록</strong>
                <p>
                  문서를 직접 입력하여 등록할 수 있습니다. AI 분석 없이 바로
                  저장됩니다.
                </p>
              </div>
              <button type="button" onClick={() => navigate("/upload/manual")}>
                수기로 등록하기
              </button>
            </section>
          </>
        )}

        <p className="upload-page__security">
          ♡ 업로드한 파일은 안전하게 보호되며, 분석 목적 외에는 사용되지
          않습니다.
        </p>
      </main>

      {showAnalysisModal && (
        <AnalysisStartModal
          fileCount={studioFiles.length}
          onCancel={() => setShowAnalysisModal(false)}
          onConfirm={startAnalysis}
        />
      )}

      {showStartedModal && (
        <AnalysisStartedModal
          fileCount={startedFileCount}
          onStay={() => setShowStartedModal(false)}
          onMoveCenter={() => navigate("/processing-center")}
        />
      )}
    </section>
  );
}
