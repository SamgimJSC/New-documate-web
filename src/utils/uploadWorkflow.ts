import { uploadCategoryGuide } from "../data/uploadCategories";
import type { UploadDocumentCategory } from "../types/upload";
import type { UploadExtractedField, UploadProcessStatus } from "../services/uploadLocalService";

export const MAX_UPLOAD_FILE_COUNT = 10;
export const MAX_UPLOAD_FILE_SIZE_MB = 10;
export const ACCEPTED_UPLOAD_TYPES = ["image/jpeg", "image/png"];
export const MANUAL_UPLOAD_DRAFT_KEY = "documate.manualUploadDraft";

export const PROCESS_STATUS_LABEL: Record<UploadProcessStatus, string> = {
  analyzing: "분석 중",
  waitingSave: "저장 대기",
  failed: "분석 실패",
  completed: "등록 완료",
};

export const PROCESS_STATUS_HELPER: Record<UploadProcessStatus, string> = {
  analyzing: "AI가 문서 내용을 읽고 있어요. 페이지를 벗어나도 처리 센터에서 다시 확인할 수 있습니다.",
  waitingSave: "분석이 완료되었습니다. 추출 정보를 확인하고 저장해 주세요.",
  failed: "이미지가 흐리거나 필수 정보를 읽지 못했어요. 재시도하거나 수기로 등록할 수 있습니다.",
  completed: "저장이 완료되었습니다. 저장 위치로 이동해 내용을 확인할 수 있어요.",
};

export const nowText = () =>
  new Date().toISOString().slice(0, 16).replace("T", " ");

export const todayText = () => new Date().toISOString().slice(0, 10);

export const formatUploadedAt = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

export const fileSizeMb = (file: File) =>
  Number((file.size / 1024 / 1024).toFixed(1));

export const inferUploadCategory = (fileName: string): UploadDocumentCategory => {
  const lower = fileName.toLowerCase();

  if (
    fileName.includes("영수증") ||
    fileName.includes("스타벅스") ||
    lower.includes("receipt")
  ) {
    return "영수증";
  }

  if (fileName.includes("계약") || fileName.includes("임대차")) {
    return "계약서";
  }

  if (
    fileName.includes("병원") ||
    fileName.includes("약국") ||
    fileName.includes("처방")
  ) {
    return "병원/약국";
  }

  if (
    fileName.includes("보증") ||
    lower.includes("a/s") ||
    lower.includes("as")
  ) {
    return "보증서/A·S";
  }

  return "기타";
};

export const getCategoryFieldLabels = (category: UploadDocumentCategory) =>
  uploadCategoryGuide.find((guide) => guide.category === category)?.extractedData.split(", ") ?? ["제목", "업로드일"];

export const makeExtractedFields = (
  category: UploadDocumentCategory,
  fileName: string,
  index = 0,
): UploadExtractedField[] => {
  const cleanName = fileName.replace(/\.[^/.]+$/, "");

  const values: Record<string, string> = {
    계약일: todayText(),
    만료일: "2028-06-16",
    갱신일: "2028-05-16",
    계약자: "조예진",
    날짜: todayText(),
    가게명: cleanName.includes("스타벅스") ? "스타벅스 강남점" : cleanName,
    금액: String((index + 1) * 6800),
    품목: "자동 추출 품목",
    병원명: cleanName,
    진료일: todayText(),
    약품명: "처방 약품",
    제품명: cleanName,
    구매일: todayText(),
    보증기간: "1년",
    수리일: "-",
    제목: cleanName,
    업로드일: todayText(),
  };

  return getCategoryFieldLabels(category).map((label) => ({
    label,
    value: values[label] ?? "AI 추출값",
  }));
};

export const getSaveTarget = (category: UploadDocumentCategory) =>
  category === "영수증" ? "receipts" : "documents";

export const getSaveRoute = (category: UploadDocumentCategory) =>
  category === "영수증" ? "/receipts" : "/documents";

export const getSaveLocationLabel = (category: UploadDocumentCategory) => {
  if (category === "영수증") return "영수증 보드";
  if (category === "병원/약국") return "디지털 캐비닛 > 의료 문서함";
  return `디지털 캐비닛 > ${category}`;
};

export const getMoveButtonLabel = (category: UploadDocumentCategory) =>
  category === "영수증" ? "영수증 보드로 이동" : "디지털 캐비닛으로 이동";
