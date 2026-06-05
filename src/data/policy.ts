export const uploadPolicy = {
  acceptedExtensions: ["jpg", "jpeg", "png"],
  acceptedMimeTypes: ["image/jpeg", "image/png"],
  maxFileSizeMb: 10,
  maxFileCount: 10,
  allowPdfUpload: false,
  allowPdfDownload: true,
  mobileCameraUpload: true,
} as const;

export const planPolicy = {
  freePrice: 0,
  proPrice: 5900,
  currency: "KRW",
} as const;

export const receiptPolicy = {
  uploadEntry: "COMMON_UPLOAD",
  storage: "RECEIPTS_ONLY",
  documentCabinet: false,
  toastMessage: "영수증으로 분류된 문서가 있습니다.",
} as const;
