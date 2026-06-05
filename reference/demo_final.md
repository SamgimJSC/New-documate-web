# DocuMate Web 기본 세팅 요청서 FINAL

## 0. 작업 목적

이 문서는 `DocuMate` 웹 프론트엔드 기본 세팅을 위한 최종 작업 지시서입니다.

작업 참고 자료는 다음과 같습니다.

- `pjt DocuMate.pdf` : 프로젝트 기획서
- `DocuMate.pdf` : Figma/Wireframe 화면 설계 PDF
- `DocuMate_DB_Schema.xlsx` : 서버 DB 스키마 및 컬럼명 기준표

이번 프로젝트는 **React + TypeScript 기반 웹 프론트엔드**로 진행합니다.

이번 단계의 목표는 실제 백엔드 API 연동 전,  
**TypeScript 타입 정의, mock data, 라우팅, 공통 레이아웃, 주요 페이지 UI 뼈대**를 먼저 완성하는 것입니다.

---

## 1. 프로젝트 개요

### 프로젝트명

DocuMate

### 한 줄 소개

종이 서류를 사진으로 찍거나 PDF로 업로드하면 AI가 자동으로 정리하고,  
영수증 기반 소비 패턴까지 분석해주는 지능형 문서 관리 플랫폼입니다.

### 주요 타겟

종이 서류, 계약서, 보증서, 처방전, 영수증 등을 자주 보관해야 하는 개인 사용자입니다.

### 핵심 가치

- 종이 서류의 분실, 훼손, 만료일 누락 문제 해결
- AI 기반 문서 자동 분류
- OCR 기반 핵심 정보 추출
- 디지털 캐비닛을 통한 문서 보관 및 검색
- 영수증 기반 지출 관리 및 소비 리포트 제공

---

## 2. 기술 스택

이번 문서는 **프론트엔드 기본 세팅용**이므로 프론트엔드 기술만 반영합니다.

### Web Frontend

- React
- TypeScript
- Vite
- React Router
- Recharts
- CSS

### App Frontend

- React Native

단, 이번 작업 범위는 **Web Frontend**입니다.  
React Native 앱 화면은 이번 기본 세팅 범위에서 제외합니다.

### 제외

아래 기술은 서버, 배포, 인프라, AI 영역이므로 이번 프론트엔드 기본 세팅 문서에서는 구현 대상으로 다루지 않습니다.

- NestJS
- TypeORM
- PostgreSQL
- Redis
- AWS S3
- 카카오페이 API
- AWS EC2
- CloudFront
- Docker
- GitHub Actions
- Elasticsearch
- Cognito
- Python OCR / AI Worker

단, 위 기술들과 추후 연결될 수 있도록 **타입명, 변수명, 데이터 구조는 서버 DB 스키마 기준으로 작성**합니다.

---

## 3. 이번 작업 범위

### 포함

- React + TypeScript 프로젝트 기본 구조 정리
- Vite 기준 파일 구조 정리
- React Router 기반 라우팅 설정
- 공통 레이아웃 구성
- Header / Sidebar / Main Layout 구현
- 주요 페이지 UI 뼈대 구현
- 공통 컴포넌트 분리
- 모달 UI 구현
- Recharts 기반 통계 그래프 영역 구현
- mock data 기반 목록, 카드, 차트 표시
- 버튼 클릭 시 모달 열기/닫기 정도의 기본 인터랙션 구현
- DB 스키마 기준 TypeScript 타입 정의

### 제외

- 실제 로그인 인증
- 실제 API 연동
- 실제 DB 저장
- 실제 파일 업로드 처리
- 실제 OCR/AI 분석
- 실제 결제 연동
- 실제 검색 엔진 연동
- 실제 푸시 알림 연동

이번 단계에서는 실제 서버와 연결하지 않고, **mock data로 화면이 자연스럽게 보이도록 구현**합니다.

---

## 4. 변수명 / 타입 작성 규칙

## 4-1. 서버 DB 컬럼명 유지

서버 DB 스키마 컬럼명이 `snake_case`이므로,  
mock data와 API response type도 `snake_case` 기준으로 작성합니다.

좋은 예:

```ts
export interface Receipt {
  receipt_id: string;
  user_id: string;
  spend_category_id: number;
  input_method: "OCR" | "MANUAL";
  store_name: string;
  total_amount: number;
  purchase_date: string;
  payment_item?: string;
  memo?: string;
  created_at: string;
}
```

피해야 할 예:

```ts
export interface Receipt {
  receiptId: string;
  userId: string;
  storeName: string;
  totalAmount: number;
}
```

서버와 연결할 때 변수명 매핑을 줄이기 위해,  
**mock data 필드명은 서버 컬럼명과 최대한 동일하게 유지**합니다.

---

## 4-2. React 내부 네이밍

React 컴포넌트 내부 함수명과 state명은 `camelCase`를 사용해도 됩니다.

```ts
const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

const handleOpenUploadModal = () => {
  setIsUploadModalOpen(true);
};
```

단, 서버에서 받아오는 데이터 타입과 mock data 필드명은 `snake_case`를 유지합니다.

---

## 4-3. 파일명 / 컴포넌트명

컴포넌트 파일명은 `PascalCase`로 작성합니다.

```txt
ReceiptList.tsx
ReceiptUploadModal.tsx
ReceiptManualModal.tsx
DocumentCard.tsx
MainLayout.tsx
```

---

## 5. 권장 폴더 구조

```txt
src
├─ assets
│  ├─ images
│  └─ icons
├─ components
│  ├─ common
│  │  ├─ Button.tsx
│  │  ├─ Card.tsx
│  │  ├─ Input.tsx
│  │  ├─ Select.tsx
│  │  ├─ Badge.tsx
│  │  ├─ Modal.tsx
│  │  ├─ Toast.tsx
│  │  ├─ EmptyState.tsx
│  │  ├─ FilterChip.tsx
│  │  └─ Pagination.tsx
│  ├─ layout
│  │  ├─ Header.tsx
│  │  ├─ Sidebar.tsx
│  │  ├─ MainLayout.tsx
│  │  └─ MyPageLayout.tsx
│  ├─ modal
│  ├─ document
│  ├─ receipt
│  └─ chart
├─ data
│  ├─ mockUsers.ts
│  ├─ mockDocuments.ts
│  ├─ mockReceipts.ts
│  ├─ mockReports.ts
│  └─ mockPayments.ts
├─ pages
│  ├─ Login
│  ├─ Signup
│  ├─ Dashboard
│  ├─ Documents
│  ├─ DocumentDetail
│  ├─ Receipts
│  ├─ ReceiptDetail
│  ├─ Finance
│  └─ MyPage
├─ routes
│  └─ AppRouter.tsx
├─ styles
│  ├─ reset.css
│  ├─ variables.css
│  └─ global.css
├─ types
│  ├─ common.ts
│  ├─ user.ts
│  ├─ document.ts
│  ├─ receipt.ts
│  ├─ report.ts
│  └─ payment.ts
├─ utils
│  ├─ formatDate.ts
│  ├─ formatCurrency.ts
│  └─ filterUtils.ts
├─ App.tsx
└─ main.tsx
```

---

## 6. TypeScript 타입 정의

아래 타입들은 `src/types` 폴더에 분리해서 작성합니다.

---

## 6-1. common.ts

```ts
export type YnFlag = "Y" | "N";

export type AiStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";

export type ModalMode = "CREATE" | "EDIT" | "VIEW";
```

---

## 6-2. user.ts

```ts
import type { YnFlag } from "./common";

export type UserRole = "ADMIN" | "MEMBER";
export type UserPlan = "FREE" | "PRO";
export type VerificationPurpose = "SIGNUP" | "RESET_PW";
export type BiometricType = "FACE" | "FINGER";
export type ConsentType = "TERMS" | "PRIVACY" | "MARKETING" | "THIRD_PARTY";

export interface User {
  user_id: string;
  email: string;
  password?: string;
  nickname: string;
  real_name?: string;
  birth_date?: string;
  profile_img_url?: string;
  role: UserRole;
  plan: UserPlan;
  storage_used_bytes: number;
  storage_quota_bytes: number;
  is_email_verified: boolean;
  last_login_at?: string;
  withdrawal_reason?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: YnFlag;
}

export interface AuthToken {
  token_id: string;
  user_id: string;
  refresh_token: string;
  device_info?: string;
  expires_at: string;
  created_at: string;
}

export interface EmailVerification {
  verification_id: string;
  email: string;
  code: string;
  purpose: VerificationPurpose;
  is_used: boolean;
  expires_at: string;
  created_at: string;
}

export interface UserSecurity {
  security_id: string;
  user_id: string;
  pin_hash?: string;
  biometric_enabled: boolean;
  biometric_type?: BiometricType;
  pin_failed_count: number;
  pin_updated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  setting_id: string;
  user_id: string;
  push_enabled: boolean;
  email_noti_enabled: boolean;
  camera_auto_ocr: boolean;
  dark_mode: boolean;
  app_lock_enabled: boolean;
  updated_at: string;
}

export interface UserConsent {
  consent_id: string;
  user_id: string;
  consent_type: ConsentType;
  is_required: boolean;
  is_agreed: boolean;
  agreed_at?: string;
}
```

---

## 6-3. document.ts

```ts
import type { AiStatus, YnFlag } from "./common";

export type DocumentFileType = "PDF" | "JPG" | "PNG";
export type DocumentActivityType = "UPLOAD" | "AI_ANALYZED" | "NOTI_SET" | "TAG_ADDED" | "EDITED";
export type AlertOffsetType = "M1" | "M3" | "M6" | "CUSTOM";

export interface DocumentCategory {
  category_id: number;
  code: string;
  name: string;
  default_notify_offset_days: number;
  is_secured: boolean;
  description?: string;
}

export interface Document {
  document_id: string;
  user_id: string;
  category_id: number;
  title: string;
  file_url: string;
  file_name: string;
  file_type: DocumentFileType;
  file_size_bytes: number;
  page_count?: number;
  ocr_text?: string;
  extracted_data?: Record<string, unknown>;
  ai_confidence?: number;
  issue_date?: string;
  expiry_date?: string;
  renewal_date?: string;
  is_masked: boolean;
  is_favorite: boolean;
  ai_status: AiStatus;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: YnFlag;
}

export interface DocumentActivity {
  activity_id: string;
  document_id: string;
  activity_type: DocumentActivityType;
  description?: string;
  created_at: string;
}

export interface Tag {
  tag_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface DocumentTag {
  document_id: string;
  tag_id: string;
}

export interface DocumentAlert {
  alert_id: string;
  document_id: string;
  user_id: string;
  offset_type: AlertOffsetType;
  notify_date: string;
  reason?: string;
  channel_email: boolean;
  channel_app_push: boolean;
  channel_web_push: boolean;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 6-4. receipt.ts

```ts
import type { AiStatus, YnFlag } from "./common";

export type ReceiptInputMethod = "OCR" | "MANUAL";

export interface SpendCategory {
  spend_category_id: number;
  name: string;
  icon?: string;
}

export interface Receipt {
  receipt_id: string;
  user_id: string;
  spend_category_id: number;
  input_method: ReceiptInputMethod;
  file_url?: string;
  store_name: string;
  store_address?: string;
  total_amount: number;
  purchase_date: string;
  payment_item?: string;
  memo?: string;
  ocr_text?: string;
  extracted_data?: Record<string, unknown>;
  ai_status: AiStatus;
  is_confirmed: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: YnFlag;
}

export interface ReceiptTag {
  receipt_id: string;
  tag_id: string;
}
```

---

## 6-5. report.ts

```ts
export interface MonthlyReport {
  report_id: string;
  user_id: string;
  report_year: number;
  report_month: number;
  total_spend: number;
  receipt_count: number;
  prev_month_diff_pct?: number;
  predicted_spend?: number;
  prediction_confidence?: number;
  category_breakdown?: Record<string, unknown>;
  ai_analysis?: string;
  created_at: string;
}

export interface Card {
  card_id: string;
  card_name: string;
  issuer?: string;
  benefits?: Record<string, unknown>;
  annual_fee?: number;
  img_url?: string;
  source_url?: string;
  crawled_at?: string;
}

export interface CardRecommendation {
  recommendation_id: string;
  user_id: string;
  card_id: string;
  reason?: string;
  match_score?: number;
  recommended_at: string;
}
```

---

## 6-6. payment.ts

```ts
export type PaymentMethodType = "KAKAOPAY" | "NAVERPAY" | "CARD";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "CANCELED" | "EXPIRED";
export type PaymentStatus = "READY" | "APPROVED" | "CANCELED" | "FAILED";

export interface PaymentMethod {
  method_id: string;
  user_id: string;
  method_type: PaymentMethodType;
  billing_key?: string;
  display_name?: string;
  is_default: boolean;
  created_at: string;
}

export interface Subscription {
  subscription_id: string;
  user_id: string;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  started_at?: string;
  current_period_end?: string;
  is_canceled: boolean;
  canceled_at?: string;
  trial_end_at?: string;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  user_id: string;
  subscription_id?: string;
  method_id?: string;
  tid?: string;
  amount: number;
  status: PaymentStatus;
  fail_reason?: string;
  approved_at?: string;
  created_at: string;
}
```

---

## 7. 라우팅 기준

React Router 기준으로 아래 경로를 잡아 주세요.

```txt
/                       랜딩 페이지 또는 로그인 전 메인
/login                  로그인
/signup                 회원가입
/dashboard              대시보드
/documents              디지털 캐비닛
/documents/:document_id 문서 상세
/receipts               영수증 관리
/receipts/new/confirm   영수증 등록 확인
/receipts/:receipt_id   영수증 상세
/finance                가계부
/finance/report         소비 리포트
/mypage/profile         마이페이지 프로필
/mypage/settings        마이페이지 설정
/mypage/plan            요금제 관리
/mypage/logout          로그아웃
/mypage/withdraw        회원탈퇴
/subscription           구독/PRO 업그레이드
```

URL parameter 이름도 DB PK 기준으로 맞춰 주세요.

```ts
const { document_id } = useParams();
const { receipt_id } = useParams();
```

---

## 8. Mock Data 작성 기준

mock data도 서버 DB 컬럼명 기준 `snake_case`를 유지합니다.

---

## 8-1. mockUsers.ts

```ts
import type { User } from "../types/user";

export const mockUsers: User[] = [
  {
    user_id: "user-001",
    email: "jiyoung.kim@example.com",
    nickname: "김지영",
    real_name: "김지영",
    birth_date: "1999-05-11",
    profile_img_url: "",
    role: "MEMBER",
    plan: "PRO",
    storage_used_bytes: 1288490188,
    storage_quota_bytes: 53687091200,
    is_email_verified: true,
    last_login_at: "2026-05-27T10:00:00+09:00",
    created_at: "2025-05-11T10:00:00+09:00",
    updated_at: "2026-05-27T10:00:00+09:00",
    is_deleted: "N"
  }
];
```

---

## 8-2. mockDocuments.ts

```ts
import type { Document, DocumentCategory, Tag } from "../types/document";

export const mockDocumentCategories: DocumentCategory[] = [
  {
    category_id: 1,
    code: "LEASE",
    name: "임대차계약서",
    default_notify_offset_days: 180,
    is_secured: true,
    description: "집 계약서 및 임대차 관련 문서"
  },
  {
    category_id: 2,
    code: "PRESCRIPTION",
    name: "처방전",
    default_notify_offset_days: 30,
    is_secured: false,
    description: "병원 처방전 및 의료 문서"
  },
  {
    category_id: 3,
    code: "WARRANTY",
    name: "보증서",
    default_notify_offset_days: 30,
    is_secured: false,
    description: "제품 보증서"
  }
];

export const mockDocuments: Document[] = [
  {
    document_id: "doc-001",
    user_id: "user-001",
    category_id: 1,
    title: "임대차계약서_2024.pdf",
    file_url: "/mock/documents/lease_2024.pdf",
    file_name: "임대차계약서_2024.pdf",
    file_type: "PDF",
    file_size_bytes: 2300000,
    page_count: 2,
    ocr_text: "임대차계약서 계약 시작일 계약 만료일 월세",
    extracted_data: {
      document_type: "임대차계약서",
      contract_start_date: "2024-06-01",
      contract_end_date: "2026-05-31",
      rent_amount: 800000
    },
    ai_confidence: 98,
    issue_date: "2024-06-01",
    expiry_date: "2026-05-31",
    renewal_date: "2026-05-31",
    is_masked: false,
    is_favorite: true,
    ai_status: "DONE",
    is_confirmed: true,
    created_at: "2026-05-01T10:00:00+09:00",
    updated_at: "2026-05-01T10:00:00+09:00",
    is_deleted: "N"
  },
  {
    document_id: "doc-002",
    user_id: "user-001",
    category_id: 2,
    title: "처방전_당뇨_2025_11.pdf",
    file_url: "/mock/documents/prescription_2025_11.pdf",
    file_name: "처방전_당뇨_2025_11.pdf",
    file_type: "PDF",
    file_size_bytes: 1800000,
    page_count: 1,
    ocr_text: "처방전 신주쿠 종합병원 Metformin 500mg",
    extracted_data: {
      hospital_name: "신주쿠 종합병원",
      medicine_name: "Metformin 500mg",
      doctor_name: "Tanaka Hiroshi"
    },
    ai_confidence: 94,
    issue_date: "2025-11-11",
    expiry_date: "2026-12-11",
    is_masked: false,
    is_favorite: false,
    ai_status: "DONE",
    is_confirmed: true,
    created_at: "2025-11-15T14:23:00+09:00",
    updated_at: "2025-11-15T14:23:00+09:00",
    is_deleted: "N"
  }
];

export const mockTags: Tag[] = [
  {
    tag_id: "tag-001",
    user_id: "user-001",
    name: "계약서",
    created_at: "2026-05-01T10:00:00+09:00"
  },
  {
    tag_id: "tag-002",
    user_id: "user-001",
    name: "의료",
    created_at: "2025-11-15T14:23:00+09:00"
  }
];
```

---

## 8-3. mockReceipts.ts

```ts
import type { Receipt, SpendCategory } from "../types/receipt";

export const mockSpendCategories: SpendCategory[] = [
  { spend_category_id: 1, name: "식비", icon: "utensils" },
  { spend_category_id: 2, name: "카페", icon: "coffee" },
  { spend_category_id: 3, name: "교통", icon: "train" },
  { spend_category_id: 4, name: "쇼핑", icon: "shopping-bag" },
  { spend_category_id: 5, name: "의료", icon: "hospital" },
  { spend_category_id: 6, name: "기타", icon: "more-horizontal" }
];

export const mockReceipts: Receipt[] = [
  {
    receipt_id: "receipt-001",
    user_id: "user-001",
    spend_category_id: 2,
    input_method: "OCR",
    file_url: "/mock/receipts/receipt_1118.jpg",
    store_name: "도토루 휴게점",
    store_address: "서울 종로구",
    total_amount: 520,
    purchase_date: "2026-11-18",
    payment_item: "커피",
    memo: "OO이랑 먹어서 엔빵함",
    ocr_text: "도토루 휴게점 커피 520원",
    extracted_data: {
      items: [{ name: "커피", price: 520 }]
    },
    ai_status: "DONE",
    is_confirmed: true,
    created_at: "2026-11-18T13:20:00+09:00",
    updated_at: "2026-11-18T13:20:00+09:00",
    is_deleted: "N"
  },
  {
    receipt_id: "receipt-002",
    user_id: "user-001",
    spend_category_id: 3,
    input_method: "MANUAL",
    store_name: "JR East 정기권 충전",
    total_amount: 12500,
    purchase_date: "2026-11-16",
    payment_item: "정기권",
    memo: "출퇴근 교통비",
    ai_status: "DONE",
    is_confirmed: true,
    created_at: "2026-11-16T09:00:00+09:00",
    updated_at: "2026-11-16T09:00:00+09:00",
    is_deleted: "N"
  }
];
```

---

## 8-4. mockReports.ts

```ts
import type { MonthlyReport } from "../types/report";

export const mockMonthlyReports: MonthlyReport[] = [
  {
    report_id: "report-001",
    user_id: "user-001",
    report_year: 2026,
    report_month: 11,
    total_spend: 142500,
    receipt_count: 58,
    prev_month_diff_pct: 12.3,
    predicted_spend: 158200,
    prediction_confidence: 78,
    category_breakdown: {
      식비: 42,
      교통: 24,
      의료: 18,
      기타: 16
    },
    ai_analysis: "식비 지출이 전월 대비 증가했습니다. 카페 지출을 주 2회로 줄여보세요.",
    created_at: "2026-11-30T23:59:00+09:00"
  }
];
```

---

## 9. 주요 페이지 구현 지시

---

## 9-1. 로그인 페이지

### 경로

```txt
/login
```

### 구현 내용

- 이메일 입력
- 비밀번호 입력
- 로그인 상태 유지 체크박스
- 로그인 버튼
- 회원가입 링크
- 비밀번호 찾기 링크
- 입력값이 없을 경우 로그인 버튼 비활성화
- 로그인 실패 메시지 영역

### 실패 메시지 예시

```txt
아이디 혹은 비밀번호가 잘못되었습니다.
```

---

## 9-2. 회원가입 페이지

### 경로

```txt
/signup
```

### 구현 내용

- 이메일 입력
- 인증번호 전송 버튼
- 인증번호 확인 입력
- 비밀번호 입력
- 비밀번호 확인 입력
- 닉네임 입력
- PIN 번호 6자리 입력
- 회원가입 버튼

### 기본 동작

- 필수 입력값이 모두 입력되기 전까지 버튼 비활성화
- 비밀번호와 비밀번호 확인이 다를 경우 에러 메시지 표시
- PIN은 6자리 기준으로 구성

---

## 9-3. 대시보드 페이지

### 경로

```txt
/dashboard
```

### 구현 내용

- 사용자 환영 문구
- 총 문서 수 카드
- 다가오는 만기 카드
- 저장 공간 사용량 카드
- 빠른 업로드 영역
- 최근 업로드 문서 목록
- 즐겨찾기 탭
- 이번 달 지출 요약
- 월별 소비 리포트 PRO 영역
- AI 소비패턴 인사이트 PRO 영역

### 사용 mock data

- `mockUsers`
- `mockDocuments`
- `mockReceipts`
- `mockMonthlyReports`

---

## 9-4. 디지털 캐비닛 / 문서 목록 페이지

### 경로

```txt
/documents
```

### 구현 내용

- 전체 문서 개수 표시
- 검색창
- 추천 검색어 드롭다운 영역
- 카테고리 필터
- 정렬 버튼
- 카드형 / 리스트형 보기 전환 버튼
- 문서 목록
- 문서 카드 클릭 시 `/documents/:document_id` 이동
- `+ 업로드` 버튼
- 업로드 버튼 클릭 시 `DocumentUploadModal` 표시

### 검색 대상

- `documents.title`
- `documents.file_name`
- `documents.ocr_text`
- `tags.name`
- `document_categories.name`

---

## 9-5. 문서 상세 페이지

### 경로

```txt
/documents/:document_id
```

### 구현 내용

- 전체 문서로 돌아가기 버튼
- 문서 미리보기 영역
- 문서명
- 문서 종류
- 파일 정보
- 태그
- AI 추출 정보 영역
- 알림 설정 영역
- 즐겨찾기 버튼
- 다운로드 버튼
- 공유 버튼
- 삭제 버튼

---

## 9-6. 영수증 관리 페이지

### 경로

```txt
/receipts
```

### 구현 내용

- 월별 지출 합계 카드
- 영수증 수 카드
- 최다 카테고리 카드
- 검색창
- 날짜 기간 필터
- 카테고리 필터
- 정렬 버튼
- 영수증 목록
- 페이지네이션
- 영수증 업로드 버튼

### 검색 대상

- `receipts.store_name`
- `receipts.memo`
- `receipts.payment_item`
- `spend_categories.name`
- `receipts.ocr_text`

### 날짜 필터 기준

- `receipts.purchase_date`

### 목록 표시 항목

- 결제일: `purchase_date`
- 가맹점명: `store_name`
- 카테고리: `spend_category_id`와 연결된 `spend_categories.name`
- 금액: `total_amount`
- 등록일: `created_at`

### 정렬 기준

- 최신 등록순: `created_at`
- 결제일순: `purchase_date`
- 금액순: `total_amount`

---

## 9-7. 영수증 파일 업로드 모달

### 컴포넌트

```txt
ReceiptUploadModal.tsx
```

### 구현 내용

- 파일 업로드 / 수기 작성 탭
- 드래그 앤 드롭 영역
- 파일 선택 버튼
- 지원 형식 안내
- 선택한 파일명 표시
- 분석 시작 버튼
- 분석 중 로딩 상태
- 분석 실패 시 재업로드 또는 수기 작성 안내
- 닫기 버튼

### 문구 예시

```txt
영수증 이미지 파일을 업로드해주세요.
JPG, PNG, PDF 파일을 지원합니다.
```

```txt
영수증 정보를 분석 중입니다. 잠시만 기다려주세요.
```

### 관련 컬럼

- `receipts.input_method = "OCR"`
- `receipts.file_url`
- `receipts.ocr_text`
- `receipts.extracted_data`
- `receipts.ai_status`
- `receipts.is_confirmed`

---

## 9-8. 영수증 수기 작성 모달

### 컴포넌트

```txt
ReceiptManualModal.tsx
```

### 구현 내용

- 결제일 입력
- 가맹점명 입력
- 결제 금액 입력
- 카테고리 선택
- 결제 항목 입력
- 메모 입력
- 저장 버튼
- 취소 버튼

### 필수값

- 결제일
- 가맹점명
- 결제 금액
- 카테고리

### 저장 시 mock data 형태

```ts
const newReceipt: Receipt = {
  receipt_id: crypto.randomUUID(),
  user_id: "user-001",
  spend_category_id: selectedSpendCategoryId,
  input_method: "MANUAL",
  store_name,
  total_amount,
  purchase_date,
  payment_item,
  memo,
  ai_status: "DONE",
  is_confirmed: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_deleted: "N"
};
```

---

## 9-9. 영수증 상세 / 확인 페이지

### 경로

```txt
/receipts/new/confirm
/receipts/:receipt_id
```

### 구현 내용

- 영수증 이미지 또는 기본 카드 UI
- 결제일
- 가맹점명
- 결제 금액
- 카테고리
- 결제 항목
- 메모
- 수정 버튼
- 저장 버튼
- 삭제 버튼
- 목록으로 버튼

### 삭제 확인 모달 문구

```txt
정말 이 영수증을 삭제하시겠습니까?
삭제된 영수증은 복구할 수 없습니다.
```

### 삭제 처리

mock 상태에서는 실제 배열에서 완전 삭제하지 않고 아래 값 변경으로 처리해도 됩니다.

```ts
is_deleted: "Y"
```

---

## 9-10. 가계부 / 소비 리포트 페이지

### 경로

```txt
/finance
/finance/report
```

### 구현 내용

- 월 선택 버튼
- 월별 소비 요약
- 총 지출
- 영수증 건수
- 일자별 지출 추이 그래프
- 카테고리별 분포 차트
- 최근 영수증 목록
- PRO 예상 지출 영역
- AI 인사이트 영역
- 카드 추천 보기 버튼

### 차트 기준

- Recharts 사용
- 기본값은 최신 결제일 기준 데이터 표시
- 그래프의 날짜 클릭 시 선택 날짜 상태 변경
- 선택 날짜 기준으로 아래 정보 갱신
  - 영수증 목록
  - 카테고리 차트
  - 영수증 건수
  - 총 지출 금액

---

## 9-11. 마이페이지

### 경로

```txt
/mypage/profile
/mypage/settings
/mypage/plan
/mypage/logout
/mypage/withdraw
```

### 공통 구조

- 좌측 사이드바
- 우측 컨텐츠 영역
- 현재 메뉴 활성화 표시

### 사이드바 메뉴

- 프로필
- 설정
- 요금제 관리
- 로그아웃
- 회원탈퇴

### 프로필 페이지

- 프로필 사진
- 닉네임
- 이메일
- PRO 멤버 여부
- 가입일
- 닉네임 수정
- 비밀번호 변경
- 스토리지 사용량
- 결제 수단

### 설정 페이지

- 푸시 알림 토글
- 이메일 알림 토글
- 서비스 이용약관 동의
- 개인정보 수집 및 이용 동의
- 마케팅 정보 수신 동의
- 제3자 정보 제공 동의
- 캐비닛 PIN 재설정

### 요금제 관리 페이지

- 현재 플랜 카드
- Free / Pro 플랜 비교
- Pro 업그레이드 버튼
- 플랜 해지 버튼
- 결제 실패 모달

### 로그아웃 페이지

- 로그아웃 확인 문구
- 로그아웃 버튼
- 취소 버튼

### 회원탈퇴 페이지

- 삭제될 데이터 안내
- 탈퇴 사유 선택
- 확인 입력
- 탈퇴하기 버튼
- 최종 확인 모달

---

## 10. 공통 모달 목록

아래 모달을 컴포넌트로 분리해 주세요.

```txt
components/modal
├─ DocumentUploadModal.tsx
├─ DocumentAnalyzingModal.tsx
├─ DocumentAnalyzeResultModal.tsx
├─ CategoryEditModal.tsx
├─ ReceiptBranchModal.tsx
├─ ReceiptUploadModal.tsx
├─ ReceiptManualModal.tsx
├─ ReceiptDeleteConfirmModal.tsx
├─ AlertSettingModal.tsx
├─ ProfilePhotoModal.tsx
├─ PinResetModal.tsx
├─ PaymentMethodModal.tsx
├─ PlanCancelModal.tsx
├─ PaymentFailModal.tsx
└─ WithdrawConfirmModal.tsx
```

이번 기본 세팅 단계에서 우선순위는 다음과 같습니다.

1. `DocumentUploadModal`
2. `ReceiptUploadModal`
3. `ReceiptManualModal`
4. `ReceiptDeleteConfirmModal`
5. `AlertSettingModal`
6. 요금제 관련 모달
7. 마이페이지 관련 모달

---

## 11. CSS 스타일 기준

TailwindCSS는 사용하지 않습니다.  
기본 CSS 파일을 분리해서 작성합니다.

### 권장 CSS 파일

```txt
src/styles
├─ reset.css
├─ variables.css
└─ global.css
```

### variables.css 예시

```css
:root {
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #111827;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --radius-md: 12px;
  --radius-lg: 18px;
  --shadow-card: 0 8px 24px rgba(15, 23, 42, 0.08);
}
```

### 전체 톤

- 깔끔한 문서 관리 서비스 느낌
- 흰색 배경 중심
- 파란색 또는 보라색 계열 포인트 컬러
- 카드형 UI
- 충분한 여백
- 둥근 모서리
- 부드러운 그림자

### 공통 컴포넌트 스타일

- Button
- Card
- Input
- Select
- Badge
- Modal
- Toast
- EmptyState
- FilterChip
- Pagination

### 상태 표현

- 성공: 체크 아이콘 또는 초록 계열
- 에러: 빨간색 텍스트
- PRO 기능: PRO 배지 표시
- 비활성화: opacity 처리
- 선택된 필터: 배경색 강조

---

## 12. 인터랙션 기준

### 공통

- 버튼 클릭 시 기능이 아직 없더라도 console.log 또는 mock 동작을 넣어 주세요.
- 실제 API 요청 대신 mock data를 사용해 화면 상태가 바뀌는 느낌만 구현합니다.

### 업로드 버튼

- 문서 페이지의 `+ 업로드` 클릭 시 `DocumentUploadModal` 열기
- 영수증 페이지의 `영수증 업로드` 클릭 시 `ReceiptUploadModal` 열기

### 필터

- 검색어 입력 시 mock data 필터링
- 카테고리 클릭 시 목록 필터링
- 날짜 기간 선택 시 영수증 결제일 기준 필터링

### 차트

- Recharts로 기본 그래프 표시
- 그래프 데이터 클릭 시 선택 날짜 상태 변경
- 선택 날짜에 해당하는 영수증 목록 표시

### 토스트

아래 상황에서 mock toast를 표시해 주세요.

- 저장 완료
- 수정 완료
- 삭제 완료
- 업로드 완료
- 네트워크 오류 mock

---

## 13. 작업 우선순위

1. React + TypeScript 프로젝트 구조 정리
2. CSS 기본 파일 구성
3. `src/types` 작성
4. mock data 작성
5. React Router 구성
6. 공통 레이아웃 구성
7. 공통 컴포넌트 생성
8. 대시보드 페이지
9. 디지털 캐비닛 페이지
10. 영수증 관리 페이지
11. 영수증 업로드 / 수기 작성 모달
12. 가계부 / 소비 리포트 페이지
13. 마이페이지
14. 세부 모달 및 토스트 정리

---

## 14. 완료 기준

아래 조건을 만족하면 기본 세팅 완료로 봅니다.

- `npm run dev` 실행 시 에러 없이 화면이 표시됨
- TypeScript 에러가 없음
- 주요 페이지 라우팅이 가능함
- Header / Sidebar / Main Layout이 적용됨
- `src/types`에 DB 스키마 기준 타입이 분리되어 있음
- mock data가 DB 컬럼명 기준 `snake_case`로 작성되어 있음
- 문서 목록과 영수증 목록이 mock data로 표시됨
- 검색, 카테고리 필터, 날짜 필터가 기본 동작함
- 영수증 업로드 모달과 수기 작성 모달이 열림
- 소비 리포트 페이지에 Recharts 그래프와 차트 영역이 표시됨
- PRO 기능 영역은 배지 또는 잠금 UI로 구분됨
- CSS가 `styles` 폴더 기준으로 분리되어 있음
- 코드가 역할별로 컴포넌트 분리되어 있음

---

## 15. 작업 시 주의사항

- TailwindCSS는 사용하지 않습니다.
- 기존 파일이 있다면 무작정 삭제하지 말고 유지하면서 필요한 파일만 추가해 주세요.
- 컴포넌트명과 파일명은 직관적으로 작성해 주세요.
- TypeScript 타입을 `any`로 대충 처리하지 말고, 가능한 한 `src/types`의 인터페이스를 사용해 주세요.
- API response와 mock data는 서버 DB 컬럼명 기준 `snake_case`를 유지해 주세요.
- React 내부 함수명과 state명은 `camelCase`를 사용해도 됩니다.
- 실제 API 연동 코드는 작성하지 말고 mock data를 사용해 주세요.
- 추후 서버 API 연결이 가능하도록 데이터 필드명을 명확히 유지해 주세요.
- Figma/Wireframe PDF의 화면 구성과 기획서의 기능 우선순위를 함께 반영해 주세요.
- UI가 완벽하지 않아도 되지만, 화면 흐름과 페이지 구조는 명확해야 합니다.
