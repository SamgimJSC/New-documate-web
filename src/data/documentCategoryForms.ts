import type { UploadDocumentCategory } from "../types/upload";

export type DocumentCategoryFormKey =
  | "title"
  | "issuer"
  | "documentDate"
  | "amount"
  | "contractDate"
  | "expiryDate"
  | "renewalDate"
  | "contractor"
  | "items"
  | "medicineName"
  | "productName"
  | "warrantyPeriod"
  | "repairDate";

export type DocumentCategoryFormField = {
  key: DocumentCategoryFormKey;
  label: string;
  placeholder: string;
  storageKey: string;
  aliases: string[];
  required?: boolean;
  type?: "text" | "date" | "amount";
};

export type DocumentCategoryFormConfig = {
  category: UploadDocumentCategory;
  examples: string;
  extractedData: string;
  saveHint: string;
  fields: DocumentCategoryFormField[];
  tip: string;
};

const field = (
  config: Omit<DocumentCategoryFormField, "aliases"> & { aliases?: string[] },
): DocumentCategoryFormField => ({
  ...config,
  aliases: [config.storageKey, config.label, config.key, ...(config.aliases ?? [])],
});

export const DOCUMENT_CATEGORY_FORM_CONFIGS: DocumentCategoryFormConfig[] = [
  {
    category: "계약서",
    examples: "임대차계약서, 근로계약서, 통신계약서",
    extractedData: "계약일, 만료일, 갱신일, 계약자",
    saveHint: "디지털 캐비닛 > 계약서",
    tip: "만료일이나 갱신일을 입력하면 나중에 기한 관리가 쉬워요.",
    fields: [
      field({
        key: "title",
        storageKey: "제목",
        label: "문서 이름",
        placeholder: "예: 임대차계약서_202606",
        required: true,
      }),
      field({
        key: "contractor",
        storageKey: "계약자",
        label: "계약자",
        placeholder: "예: 김민준 / ○○부동산",
        required: true,
        aliases: ["contractor", "contractor_name"],
      }),
      field({
        key: "issuer",
        storageKey: "발행처",
        label: "거래처 / 발행처",
        placeholder: "예: ○○부동산",
        aliases: ["issuer", "company_name"],
      }),
      field({
        key: "contractDate",
        storageKey: "계약일",
        label: "계약일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
        aliases: ["contract_date"],
      }),
      field({
        key: "expiryDate",
        storageKey: "만료일",
        label: "만료일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
        aliases: ["expiry_date", "expiration_date"],
      }),
      field({
        key: "renewalDate",
        storageKey: "갱신일",
        label: "갱신일",
        placeholder: "연도-월-일",
        type: "date",
        aliases: ["renewal_date"],
      }),
      field({
        key: "amount",
        storageKey: "금액",
        label: "계약 금액",
        placeholder: "예: 500000",
        type: "amount",
        aliases: ["amount", "contract_amount", "total_amount"],
      }),
    ],
  },
  {
    category: "영수증",
    examples: "카드 영수증, 현금영수증, 결제내역",
    extractedData: "날짜, 가게명, 금액, 품목",
    saveHint: "영수증 보드",
    tip: "가맹점명, 결제일, 금액을 정확히 입력하면 소비 리포트에 바로 반영하기 좋아요.",
    fields: [
      field({
        key: "title",
        storageKey: "제목",
        label: "문서 이름",
        placeholder: "예: 2026년 6월 생활비 영수증",
        required: true,
      }),
      field({
        key: "issuer",
        storageKey: "가게명",
        label: "가게명",
        placeholder: "예: 스타벅스 코리아",
        required: true,
        aliases: ["store_name", "merchant_name", "shop_name", "issuer"],
      }),
      field({
        key: "documentDate",
        storageKey: "날짜",
        label: "날짜",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
        aliases: ["payment_date", "receipt_date", "purchase_date", "date"],
      }),
      field({
        key: "amount",
        storageKey: "금액",
        label: "금액",
        placeholder: "예: 25000",
        required: true,
        type: "amount",
        aliases: ["amount", "total_amount", "price"],
      }),
      field({
        key: "items",
        storageKey: "품목",
        label: "품목",
        placeholder: "예: 아메리카노, 샌드위치",
        aliases: ["items", "item_name", "product_name"],
      }),
    ],
  },
  {
    category: "병원/약국",
    examples: "처방전, 진료비 영수증, 약국 영수증",
    extractedData: "병원명, 진료일, 금액, 약품명",
    saveHint: "디지털 캐비닛 > 의료 문서",
    tip: "진료일과 약품명을 적어두면 나중에 의료 기록을 찾기 쉬워요.",
    fields: [
      field({
        key: "title",
        storageKey: "제목",
        label: "문서 이름",
        placeholder: "예: 감기 진료비 영수증",
        required: true,
      }),
      field({
        key: "issuer",
        storageKey: "병원명 / 약국명",
        label: "병원명 / 약국명",
        placeholder: "예: 세브란스병원",
        required: true,
        aliases: ["hospital_name", "pharmacy_name", "medical_institution", "issuer"],
      }),
      field({
        key: "documentDate",
        storageKey: "진료일",
        label: "진료일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
        aliases: ["visit_date", "treatment_date", "prescription_date", "issue_date"],
      }),
      field({
        key: "amount",
        storageKey: "금액",
        label: "금액",
        placeholder: "예: 12800",
        required: true,
        type: "amount",
        aliases: ["amount", "total_amount", "medical_fee", "price"],
      }),
      field({
        key: "medicineName",
        storageKey: "약품명 / 진료 내용",
        label: "약품명 / 진료 내용",
        placeholder: "예: 감기약, 내과 진료",
        aliases: ["drug_name", "medicine_name", "medication"],
      }),
    ],
  },
  {
    category: "보증서/A·S",
    examples: "제품 보증서, 수리 접수증, A/S 내역서",
    extractedData: "제품명, 구매일, 보증기간, 수리일",
    saveHint: "디지털 캐비닛 > 보증서/A·S",
    tip: "구매일과 보증기간을 입력하면 보증 만료 전에 확인하기 좋아요.",
    fields: [
      field({
        key: "title",
        storageKey: "제목",
        label: "문서 이름",
        placeholder: "예: 노트북 보증서",
        required: true,
      }),
      field({
        key: "productName",
        storageKey: "제품명",
        label: "제품명",
        placeholder: "예: LG gram 16",
        required: true,
        aliases: ["product_name", "model_name"],
      }),
      field({
        key: "issuer",
        storageKey: "발행처",
        label: "구매처 / 서비스센터",
        placeholder: "예: 하이마트 강남점",
        aliases: ["issuer", "store_name", "service_center"],
      }),
      field({
        key: "documentDate",
        storageKey: "구매일",
        label: "구매일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
        aliases: ["purchase_date", "buy_date"],
      }),
      field({
        key: "warrantyPeriod",
        storageKey: "보증기간",
        label: "보증기간",
        placeholder: "예: 2년 / 2028-06-18까지",
        required: true,
        aliases: ["warranty_period"],
      }),
      field({
        key: "repairDate",
        storageKey: "수리일",
        label: "수리일",
        placeholder: "연도-월-일",
        type: "date",
        aliases: ["repair_date", "service_date"],
      }),
    ],
  },
  {
    category: "기타",
    examples: "분류 불가 문서, 일반 안내문, 메모",
    extractedData: "제목, 업로드일",
    saveHint: "디지털 캐비닛 > 기타",
    tip: "나중에 찾기 쉽도록 제목과 발행처를 구체적으로 적어두면 좋아요.",
    fields: [
      field({
        key: "title",
        storageKey: "제목",
        label: "제목",
        placeholder: "예: 학교 안내문",
        required: true,
      }),
      field({
        key: "issuer",
        storageKey: "발행처",
        label: "발행처",
        placeholder: "예: 관리사무소",
        aliases: ["issuer"],
      }),
      field({
        key: "documentDate",
        storageKey: "업로드일",
        label: "업로드일",
        placeholder: "연도-월-일",
        required: true,
        type: "date",
        aliases: ["upload_date", "created_at", "createdAt"],
      }),
    ],
  },
];

export const getDocumentCategoryFormConfig = (categoryName?: string) => {
  const normalizedName =
    categoryName === "보증서/A/S" ? "보증서/A·S" : categoryName;

  return (
    DOCUMENT_CATEGORY_FORM_CONFIGS.find(
      (config) => config.category === normalizedName,
    ) ?? DOCUMENT_CATEGORY_FORM_CONFIGS[DOCUMENT_CATEGORY_FORM_CONFIGS.length - 1]
  );
};
