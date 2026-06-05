import type { UploadAnalysisResult, UploadDocumentCategory, UploadFileItem } from '../types/upload';

export const uploadCategoryGuide: Array<{
  category: UploadDocumentCategory;
  examples: string;
  extractedData: string;
}> = [
  {
    category: '계약서',
    examples: '임대차계약서, 근로계약서, 통신계약서',
    extractedData: '계약일, 만료일, 갱신일, 계약자',
  },
  {
    category: '영수증',
    examples: '카드 영수증, 현금영수증, 결제내역',
    extractedData: '날짜, 가게명, 금액, 품목',
  },
  {
    category: '병원/약국',
    examples: '처방전, 진료비 영수증, 약국 영수증',
    extractedData: '병원명, 진료일, 금액, 약품명',
  },
  {
    category: '보증서/A·S',
    examples: '제품 보증서, 수리 접수증, A/S 내역서',
    extractedData: '제품명, 구매일, 보증기간, 수리일',
  },
  {
    category: '기타',
    examples: '분류 불가 문서, 일반 안내문, 메모',
    extractedData: '제목, 업로드일',
  },
];

const inferCategory = (fileName: string): UploadDocumentCategory => {
  const lower = fileName.toLowerCase();

  if (lower.includes('receipt') || fileName.includes('영수증') || fileName.includes('스타벅스')) {
    return '영수증';
  }

  if (fileName.includes('계약') || fileName.includes('임대차')) {
    return '계약서';
  }

  if (fileName.includes('병원') || fileName.includes('약국') || fileName.includes('처방')) {
    return '병원/약국';
  }

  if (fileName.includes('보증') || lower.includes('as') || lower.includes('a/s')) {
    return '보증서/A·S';
  }

  return '기타';
};

const fieldsByCategory: Record<UploadDocumentCategory, Array<{ label: string; value: string }>> = {
  계약서: [
    { label: '계약일', value: '2026-05-28' },
    { label: '만료일', value: '2028-05-27' },
    { label: '갱신일', value: '2028-04-27' },
    { label: '계약자', value: '김지영' },
  ],
  영수증: [
    { label: '날짜', value: '2026-05-28' },
    { label: '가게명', value: '스타벅스 강남점' },
    { label: '금액', value: '6,800원' },
    { label: '품목', value: '아메리카노 외 1' },
  ],
  '병원/약국': [
    { label: '병원명', value: '신주쿠 중앙병원' },
    { label: '진료일', value: '2026-05-28' },
    { label: '금액', value: '4,200원' },
    { label: '약품명', value: 'Metformin 500mg' },
  ],
  '보증서/A·S': [
    { label: '제품명', value: '노트북' },
    { label: '구매일', value: '2026-05-28' },
    { label: '보증기간', value: '1년' },
    { label: '수리일', value: '-' },
  ],
  기타: [
    { label: '제목', value: '일반 문서' },
    { label: '업로드일', value: '2026-05-28' },
  ],
};

export const createMockUploadFiles = (fileNames: string[]): UploadFileItem[] => {
  return fileNames.map((fileName, index) => ({
    id: index + 1,
    fileName,
    sizeMb: index === 0 ? 1.2 : index === 1 ? 3.4 : 2.1,
    status: index === 2 ? '분석중' : '완료',
    progress: index === 2 ? 68 : 100,
    category: inferCategory(fileName),
  }));
};

export const createMockAnalysisResults = (files: UploadFileItem[]): UploadAnalysisResult[] => {
  return files.map((file) => {
    const category = file.category ?? inferCategory(file.fileName);

    return {
      id: file.id,
      fileName: file.fileName,
      category,
      fields: fieldsByCategory[category],
      isReceipt: category === '영수증',
    };
  });
};
