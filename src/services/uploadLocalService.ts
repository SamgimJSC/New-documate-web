import type { Document, DocumentFileType } from "../types/document";
import type { Receipt } from "../types/receipt";
import type { UploadDocumentCategory } from "../types/upload";

export type UploadProcessStatus =
  | "analyzing"
  | "waitingSave"
  | "failed"
  | "completed";

export type UploadSaveTarget = "documents" | "receipts";

export type UploadExtractedField = {
  label: string;
  value: string;
};

export type UploadProcessItem = {
  id: string;
  fileName: string;
  displayName: string;
  fileType: DocumentFileType;
  fileSizeBytes: number;
  sizeMb: number;
  pageCount: number;
  uploadedAt: string;
  status: UploadProcessStatus;
  category: UploadDocumentCategory;
  extractedFields: UploadExtractedField[];
  confidence: number;
  progress: number;
  memo?: string;
  errorMessage?: string;
  savedTarget?: UploadSaveTarget;
  savedRecordId?: string;
  finalDocumentId?: string;
  uploadedFileIds?: Array<{ id: string; pageNo: number }>;
  pageFileUrls?: string[];
};

export type ManualRegistrationInput = {
  category: UploadDocumentCategory;
  title: string;
  issuer: string;
  documentDate: string;
  amount: string;
  memo: string;
  attachmentName: string;
};

const LOCAL_DOCUMENTS_KEY = "documate.localDocuments";
const LOCAL_RECEIPTS_KEY = "documate.localReceipts";
const LOCAL_UPLOAD_PROCESS_KEY = "documate.localUploadProcess";

const isBrowser = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

const safeRead = <T>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = <T>(key: string, value: T) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const today = () => new Date().toISOString().slice(0, 10);

const now = () => new Date().toISOString();

const onlyNumber = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(String(value).replace(/[^0-9]/g, "")) || 0;
};

const fieldsToObject = (fields: UploadExtractedField[]) => {
  return fields.reduce<Record<string, string>>((acc, field) => {
    if (field.label.trim()) {
      acc[field.label] = field.value;
    }

    return acc;
  }, {});
};

const findFieldValue = (fields: UploadExtractedField[], keywords: string[]) => {
  return (
    fields.find((field) =>
      keywords.some((keyword) => field.label.includes(keyword)),
    )?.value ?? ""
  );
};

const toDocumentCategoryId = (category: UploadDocumentCategory) => {
  if (category === "계약서") return 1;
  if (category === "병원/약국") return 2;
  if (category === "보증서/A·S") return 3;
  return 4;
};

const toSpendCategoryId = (categoryOrText: string) => {
  const text = categoryOrText.toLowerCase();

  if (
    text.includes("카페") ||
    text.includes("스타벅스") ||
    text.includes("coffee")
  ) {
    return 2;
  }

  if (
    text.includes("교통") ||
    text.includes("택시") ||
    text.includes("버스") ||
    text.includes("지하철")
  ) {
    return 3;
  }

  if (
    text.includes("쇼핑") ||
    text.includes("무신사") ||
    text.includes("올리브영")
  ) {
    return 4;
  }

  if (text.includes("병원") || text.includes("약국") || text.includes("의료")) {
    return 5;
  }

  if (
    text.includes("식") ||
    text.includes("마트") ||
    text.includes("편의점") ||
    text.includes("김밥")
  ) {
    return 1;
  }

  return 6;
};

const normalizeFileType = (fileName: string): DocumentFileType => {
  return fileName.toLowerCase().endsWith(".png") ? "PNG" : "JPG";
};

export const uploadLocalService = {
  readProcessItems() {
    return safeRead<UploadProcessItem[]>(LOCAL_UPLOAD_PROCESS_KEY, []);
  },

  writeProcessItems(items: UploadProcessItem[]) {
    safeWrite(LOCAL_UPLOAD_PROCESS_KEY, items);
  },

  readDocuments() {
    return safeRead<Document[]>(LOCAL_DOCUMENTS_KEY, []);
  },

  readReceipts() {
    return safeRead<Receipt[]>(LOCAL_RECEIPTS_KEY, []);
  },

  saveDocument(document: Document) {
    const documents = this.readDocuments();

    const nextDocuments = [
      document,
      ...documents.filter((item) => item.document_id !== document.document_id),
    ];

    safeWrite(LOCAL_DOCUMENTS_KEY, nextDocuments);

    return document;
  },

  saveReceipt(receipt: Receipt) {
    const receipts = this.readReceipts();

    const nextReceipts = [
      receipt,
      ...receipts.filter((item) => item.receipt_id !== receipt.receipt_id),
    ];

    safeWrite(LOCAL_RECEIPTS_KEY, nextReceipts);

    return receipt;
  },

  deleteDocument(documentId: string) {
    const documents = this.readDocuments().filter(
      (item) => item.document_id !== documentId,
    );

    safeWrite(LOCAL_DOCUMENTS_KEY, documents);
  },

  deleteReceipt(receiptId: string) {
    const receipts = this.readReceipts().filter(
      (item) => item.receipt_id !== receiptId,
    );

    safeWrite(LOCAL_RECEIPTS_KEY, receipts);
  },

  buildProcessDocument(input: {
    fileName: string;
    sizeMb: number;
    fileSizeBytes: number;
    pageCount?: number;
    category?: UploadDocumentCategory;
    extractedFields?: UploadExtractedField[];
    status?: UploadProcessStatus;
    savedRecordId?: string;
    uploadedFileIds?: Array<{ id: string; pageNo: number }>;
  }): UploadProcessItem {
    const fileType = normalizeFileType(input.fileName);

    return {
      id: createId("process"),
      fileName: input.fileName,
      displayName: input.fileName.replace(/\.(jpg|jpeg|png)$/i, ""),
      fileType,
      fileSizeBytes: input.fileSizeBytes,
      sizeMb: input.sizeMb,
      pageCount: input.pageCount ?? 1,
      uploadedAt: now(),
      status: input.status ?? "waitingSave",
      category: input.category ?? "기타",
      extractedFields: input.extractedFields ?? [],
      confidence: input.status === "failed" ? 0 : 0.88,
      progress: input.status === "failed" ? 0 : 100,
      savedRecordId: input.savedRecordId,
      uploadedFileIds: input.uploadedFileIds,
      errorMessage:
        input.status === "failed"
          ? "이미지가 흐리거나 필수 정보를 읽지 못했어요."
          : undefined,
    };
  },

  toDocument(
    item: UploadProcessItem,
    options?: {
      title?: string;
      category?: UploadDocumentCategory;
    },
  ): Document {
    const category = options?.category ?? item.category;
    const title = (options?.title || item.displayName || item.fileName).trim();

    const issueDate =
      findFieldValue(item.extractedFields, [
        "계약일",
        "발급일",
        "구입일",
        "진료일",
        "처방일",
        "결제일",
      ]) || today();

    const expiryDate = findFieldValue(item.extractedFields, [
      "만료일",
      "갱신일",
      "보증기간",
    ]);

    return {
      document_id: createId("doc-local"),
      user_id: "user-001",
      category_id: toDocumentCategoryId(category),
      title,
      file_url: "",
      file_name: item.fileName,
      file_type: item.fileType,
      file_size_bytes: item.fileSizeBytes,
      ocr_text: `${title} OCR 추출 텍스트`,
      extracted_data: fieldsToObject(item.extractedFields),
      ai_confidence: item.confidence,
      issue_date: issueDate,
      expiry_date: expiryDate || undefined,
      is_masked: false,
      is_favorite: false,
      ai_status: "DONE",
      is_confirmed: true,
      created_at: now(),
      updated_at: now(),
      is_deleted: "N",
    };
  },

  toReceipt(
    item: UploadProcessItem,
    options?: {
      title?: string;
    },
  ): Receipt {
    const storeName =
      findFieldValue(item.extractedFields, [
        "상호",
        "가맹점",
        "병원",
        "약국",
      ]) ||
      options?.title ||
      item.displayName;

    const amount = onlyNumber(
      findFieldValue(item.extractedFields, ["금액", "합계", "총액"]),
    );

    const purchaseDate =
      findFieldValue(item.extractedFields, ["결제일", "구입일", "발급일"]) ||
      today();

    const paymentItem = findFieldValue(item.extractedFields, [
      "품목",
      "항목",
      "상품",
    ]);

    return {
      receipt_id: createId("rec-local"),
      user_id: "user-001",
      spend_category_id: toSpendCategoryId(`${storeName} ${paymentItem}`),
      input_method: "OCR",
      file_url: "",
      store_name: storeName,
      total_amount: amount || 0,
      purchase_date: purchaseDate,
      payment_item: paymentItem || item.displayName,
      memo: item.memo,
      ocr_text: `${storeName} OCR 추출 텍스트`,
      extracted_data: fieldsToObject(item.extractedFields),
      ai_status: "DONE",
      is_confirmed: true,
      created_at: now(),
      updated_at: now(),
      is_deleted: "N",
    };
  },

  manualToDocument(form: ManualRegistrationInput): Document {
    const title = form.title.trim();

    return {
      document_id: createId("doc-local"),
      user_id: "user-001",
      category_id: toDocumentCategoryId(form.category),
      title,
      file_url: "",
      file_name: form.attachmentName || `${title}.jpg`,
      file_type: normalizeFileType(form.attachmentName || "manual.jpg"),
      file_size_bytes: 0,
      ocr_text: form.memo,
      extracted_data: {
        발급처: form.issuer,
        금액: form.amount,
        메모: form.memo,
      },
      ai_confidence: 1,
      issue_date: form.documentDate || today(),
      is_masked: false,
      is_favorite: false,
      ai_status: "DONE",
      is_confirmed: true,
      created_at: now(),
      updated_at: now(),
      is_deleted: "N",
    };
  },

  manualToReceipt(form: ManualRegistrationInput): Receipt {
    return {
      receipt_id: createId("rec-local"),
      user_id: "user-001",
      spend_category_id: toSpendCategoryId(
        `${form.issuer} ${form.title} ${form.memo}`,
      ),
      input_method: "MANUAL",
      file_url: "",
      store_name: form.issuer || form.title,
      total_amount: onlyNumber(form.amount),
      purchase_date: form.documentDate || today(),
      payment_item: form.title,
      memo: form.memo,
      ai_status: "DONE",
      is_confirmed: true,
      created_at: now(),
      updated_at: now(),
      is_deleted: "N",
    };
  },
};
