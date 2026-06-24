import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { uploadCategoryGuide } from "../../data/uploadCategories";
import { AnalysisStartModal } from "../../components/upload/AnalysisStartModal";
import { uploadLocalService } from "../../services/uploadLocalService";
import { uploadService } from "../../services/uploadService";
import { AnalysisStartedModal } from "../../components/upload/AnalysisStartedModal";
import {
  ACCEPTED_UPLOAD_TYPES,
  fileSizeMb,
  formatUploadedAt,
  MAX_UPLOAD_FILE_COUNT,
  MAX_UPLOAD_FILE_SIZE_MB,
  nowText,
} from "../../utils/uploadWorkflow";
import "./UploadPage.css";

type StudioView = "studio" | "uploaded";

type StudioFileStatus = "uploading" | "uploaded" | "failed";

type StudioFile = {
  id: string;
  fileName: string;
  sizeMb: number;
  fileSizeBytes: number;
  uploadedAt: string;
  file: File;
  uploadStatus: StudioFileStatus;
  uploadedFileId?: string;
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

type SortableFileRowProps = {
  file: StudioFile;
  index: number;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

function SortableFileRow({ file, index, onRemove, disabled = false }: SortableFileRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  };

  return (
    <article ref={setNodeRef} style={style} className="upload-file-row">
      <div
        className={`upload-file-row__drag-handle${disabled ? " upload-file-row__drag-handle--disabled" : ""}`}
        {...(!disabled ? attributes : {})}
        {...(!disabled ? listeners : {})}
        aria-label={disabled ? undefined : "드래그하여 순서 변경"}
      >
        <GripVertical size={16} />
      </div>
      <div className="upload-file-row__name">
        <b>{file.fileName}</b>
        <small>#{index + 1}</small>
      </div>
      <span>{file.sizeMb} MB</span>
      <span>{formatUploadedAt(file.uploadedAt)}</span>
      {file.uploadStatus === "uploading" && <em>업로드 중...</em>}
      {file.uploadStatus === "uploaded" && <em>업로드 완료</em>}
      {file.uploadStatus === "failed" && <em>업로드 실패</em>}
      <div className="upload-file-row__actions">
        <button type="button" onClick={() => onRemove(file.id)}>
          삭제
        </button>
      </div>
    </article>
  );
}

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
  const [isUploading, setIsUploading] = useState(false);
  const [tempDocumentId, setTempDocumentId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const allUploaded =
    studioFiles.length > 0 &&
    studioFiles.every((f) => f.uploadStatus === "uploaded");

  const totalSizeMb = useMemo(
    () => studioFiles.reduce((sum, file) => sum + file.sizeMb, 0),
    [studioFiles],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setStudioFiles((current) => {
        const oldIndex = current.findIndex((f) => f.id === active.id);
        const newIndex = current.findIndex((f) => f.id === over.id);
        return arrayMove(current, oldIndex, newIndex);
      });
    }
  };

  const addFiles = async (fileList: FileList | File[]) => {
    const errors: string[] = [];
    const currentCount = studioFiles.length;

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
          file,
          uploadStatus: "uploading",
        });

        return acc;
      },
      [],
    );

    const availableSlots = MAX_UPLOAD_FILE_COUNT - currentCount;
    if (availableSlots <= 0) {
      setUploadError("한 번에 최대 10장까지만 업로드할 수 있어요.");
      return;
    }

    const toAdd = validFiles.slice(0, availableSlots);
    if (validFiles.length > availableSlots) {
      errors.push("최대 10장까지만 추가되었어요.");
    }

    if (toAdd.length === 0) {
      setUploadError(errors[0] ?? "");
      return;
    }

    let currentTempId = tempDocumentId;
    if (!currentTempId) {
      try {
        currentTempId = await uploadService.startSession();
        setTempDocumentId(currentTempId);
      } catch {
        setUploadError("업로드 세션을 시작하지 못했어요. 다시 시도해 주세요.");
        return;
      }
    }

    setStudioFiles((current) => [...current, ...toAdd]);
    setView("uploaded");
    setUploadError(errors[0] ?? "");

    const finalTempId = currentTempId;
    for (let i = 0; i < toAdd.length; i++) {
      const studioFile = toAdd[i];
      const pageNo = currentCount + i + 1;
      try {
        const res = await uploadService.uploadPage(finalTempId, studioFile.file, pageNo);
        const uploadedFileId = res.files.find((f) => f.pageNo === pageNo)?.id;
        setStudioFiles((current) =>
          current.map((f) =>
            f.id === studioFile.id ? { ...f, uploadStatus: "uploaded", uploadedFileId } : f,
          ),
        );
      } catch {
        setStudioFiles((current) =>
          current.map((f) =>
            f.id === studioFile.id ? { ...f, uploadStatus: "failed" } : f,
          ),
        );
      }
    }
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
    setTempDocumentId(null);
    setUploadError("");
    setView("studio");
  };

  const openAnalysisModal = () => {
    if (studioFiles.length === 0) {
      setUploadError("분석할 파일을 먼저 업로드해 주세요.");
      return;
    }
    if (!allUploaded) {
      setUploadError("모든 파일 업로드가 완료된 후 분석을 시작할 수 있어요.");
      return;
    }
    setShowAnalysisModal(true);
  };

  const startAnalysis = async () => {
    setShowAnalysisModal(false);
    setIsUploading(true);

    try {
      if (!tempDocumentId) throw new Error("세션 없음");

      const uploadedFiles = studioFiles
        .filter((f) => f.uploadStatus === "uploaded" && f.uploadedFileId)
        .map((f, i) => ({ id: f.uploadedFileId!, pageNo: i + 1 }));

      const { tempDocumentId: confirmedId } = await uploadService.requestAi(
        tempDocumentId,
        uploadedFiles,
      );

      uploadLocalService.writeProcessItems([
        ...uploadLocalService.readProcessItems(),
        uploadLocalService.buildProcessDocument({
          fileName: studioFiles[0].fileName,
          sizeMb: studioFiles.reduce((sum, f) => sum + f.sizeMb, 0),
          fileSizeBytes: studioFiles.reduce((sum, f) => sum + f.fileSizeBytes, 0),
          pageCount: studioFiles.length,
          status: "analyzing",
          savedRecordId: confirmedId,
          uploadedFileIds: uploadedFiles,
        }),
      ]);

      setStartedFileCount(studioFiles.length);
      setStudioFiles([]);
      setTempDocumentId(null);
      setUploadError("");
      setToastMessage("");
      setShowStartedModal(true);
      setView("studio");
    } catch {
      setUploadError("AI 분석 요청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="upload-page">
      {(toastMessage || isUploading) && (
        <div className="upload-page__toast">
          {isUploading ? "서버에 업로드 중..." : toastMessage}
        </div>
      )}

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
                  <span>{allUploaded ? "✓" : "⋯"}</span>
                  <div>
                    <strong>{allUploaded ? "업로드가 완료되었습니다." : "업로드 중..."}</strong>
                    <p>{allUploaded ? "업로드된 파일을 확인한 뒤 AI 분석을 시작해 주세요." : "파일을 서버에 업로드하는 중입니다."}</p>
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
                    <span className="upload-file-list__head-handle" />
                    <span>파일명</span>
                    <span>크기</span>
                    <span>업로드 시간</span>
                    <span>상태</span>
                    <span>관리</span>
                  </div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={studioFiles.map((f) => f.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {studioFiles.map((file, index) => (
                        <SortableFileRow
                          key={file.id}
                          file={file}
                          index={index}
                          onRemove={removeFile}
                          disabled={isUploading}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="upload-ready-panel__actions">
                  <div>
                    <strong>
                      {studioFiles.length}개 파일이 분석 대기 중입니다.
                    </strong>
                    <span>
                      업로드된 파일을 확인한 뒤 AI 분석을 시작해 주세요.
                    </span>
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
                  <button
                    type="button"
                    onClick={openAnalysisModal}
                    disabled={!allUploaded}
                  >
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
