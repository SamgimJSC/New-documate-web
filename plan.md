# DocuMate Web 프론트엔드 작업 계획서

> React + TypeScript 기반 웹 프론트엔드 기본 세팅 계획  
> 실제 API 연동 없이 mock data 기반으로 UI 뼈대를 완성한다.  
> 타입·변수명은 DB 스키마 snake_case 기준으로 유지한다.

---

## 최신 확정 정책 반영

아래 내용은 최종 기획 정리 후 스타트 파일에 반영된 기준이다.

- 업로드는 JPG / PNG 이미지 파일만 지원한다.
- PDF는 업로드 대상에서 제외한다.
- PDF는 내려받기 및 PDF 병합 다운로드 기능에서만 사용한다.
- 파일 용량은 장당 최대 10MB로 제한한다.
- 한 번에 최대 10장까지 업로드한다.
- 모바일 앱 환경에서는 카메라를 직접 실행해 촬영한 사진 파일을 사용한다.
- 영수증은 일반 문서와 업로드 입구는 같지만, AI 분석 결과 영수증으로 분류되면 영수증 관리 페이지에서 별도로 관리한다.
- 일반 문서는 documents, 영수증은 receipts 기준으로 분리 관리한다.
- 검색 페이지는 만들지 않고 디지털 캐비닛 내부 검색으로 처리한다.
- Pro 플랜 가격은 월 5,900원으로 한다.
- Cognito는 지금 확정하지 않고, 추후 활용 가능성으로 남긴다.

---

## 0. 현재 프로젝트 상태

```
src/
├── App.tsx          # Router만 호출
├── router.tsx       # /home, /about 라우트만 존재 (교체 필요)
├── main.tsx
├── App.css          # 삭제 예정 → styles/ 로 이동
├── index.css        # 삭제 예정 → styles/ 로 이동
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
└── pages/
    ├── Home.tsx     # 임시 페이지 (삭제 예정)
    └── About.tsx    # 임시 페이지 (삭제 예정)
```

기존 임시 파일은 삭제하지 않고, 새 구조를 추가한 뒤 라우터를 교체하는 방식으로 진행한다.

---

## 1. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | React + TypeScript |
| 번들러 | Vite |
| 라우팅 | React Router |
| 차트 | Recharts |
| 스타일 | CSS 파일 분리 (TailwindCSS 사용 안 함) |
| 아이콘 | lucide-react |

---

## 2. 목표 폴더 구조

```
src/
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── common/
│   │   ├── Button.tsx / Button.css
│   │   ├── Card.tsx / Card.css
│   │   ├── Input.tsx / Input.css
│   │   ├── Select.tsx / Select.css
│   │   ├── Badge.tsx / Badge.css
│   │   ├── Modal.tsx / Modal.css
│   │   ├── Toast.tsx / Toast.css
│   │   ├── EmptyState.tsx / EmptyState.css
│   │   ├── FilterChip.tsx / FilterChip.css
│   │   └── Pagination.tsx / Pagination.css
│   ├── layout/
│   │   ├── Header.tsx / Header.css
│   │   ├── Sidebar.tsx / Sidebar.css
│   │   ├── MainLayout.tsx / MainLayout.css
│   │   └── MyPageLayout.tsx / MyPageLayout.css
│   ├── modal/
│   │   ├── UploadPage.tsx
│   │   ├── DocumentAnalyzingModal.tsx
│   │   ├── DocumentAnalyzeResultModal.tsx
│   │   ├── CategoryEditModal.tsx
│   │   ├── ReceiptBranchModal.tsx
│   │   ├── ReceiptUploadModal.tsx
│   │   ├── ReceiptManualModal.tsx
│   │   ├── ReceiptDeleteConfirmModal.tsx
│   │   ├── AlertSettingModal.tsx
│   │   ├── ProfilePhotoModal.tsx
│   │   ├── PinResetModal.tsx
│   │   ├── PaymentMethodModal.tsx
│   │   ├── PlanCancelModal.tsx
│   │   ├── PaymentFailModal.tsx
│   │   └── WithdrawConfirmModal.tsx
│   ├── document/
│   │   ├── DocumentCard.tsx / DocumentCard.css
│   │   └── DocumentList.tsx / DocumentList.css
│   ├── receipt/
│   │   ├── ReceiptCard.tsx / ReceiptCard.css
│   │   └── ReceiptList.tsx / ReceiptList.css
│   └── chart/
│       ├── SpendBarChart.tsx
│       ├── CategoryPieChart.tsx
│       └── MonthlyLineChart.tsx
├── data/
│   ├── mockUsers.ts
│   ├── mockDocuments.ts
│   ├── mockReceipts.ts
│   ├── mockReports.ts
│   └── mockPayments.ts
├── pages/
│   ├── Login/
│   │   ├── Login.tsx
│   │   └── Login.css
│   ├── Signup/
│   │   ├── Signup.tsx
│   │   └── Signup.css
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.css
│   ├── Documents/
│   │   ├── Documents.tsx
│   │   └── Documents.css
│   ├── DocumentDetail/
│   │   ├── DocumentDetail.tsx
│   │   └── DocumentDetail.css
│   ├── Receipts/
│   │   ├── Receipts.tsx
│   │   └── Receipts.css
│   ├── ReceiptDetail/
│   │   ├── ReceiptDetail.tsx
│   │   └── ReceiptDetail.css
│   ├── Finance/
│   │   ├── Finance.tsx
│   │   └── Finance.css
│   ├── FinanceReport/
│   │   ├── FinanceReport.tsx
│   │   └── FinanceReport.css
│   └── MyPage/
│       ├── MyPageProfile.tsx
│       ├── MyPageSettings.tsx
│       ├── MyPagePlan.tsx
│       ├── MyPageLogout.tsx
│       ├── MyPageWithdraw.tsx
│       └── MyPage.css
├── routes/
│   └── AppRouter.tsx
├── styles/
│   ├── reset.css
│   ├── variables.css
│   └── global.css
├── types/
│   ├── common.ts
│   ├── user.ts
│   ├── document.ts
│   ├── receipt.ts
│   ├── report.ts
│   └── payment.ts
├── utils/
│   ├── formatDate.ts
│   ├── formatCurrency.ts
│   └── filterUtils.ts
├── App.tsx
└── main.tsx
```

---

## 3. 라우팅 구조

`src/routes/AppRouter.tsx`에서 관리한다.  
인증 여부와 무관하게 mock 상태에서는 모든 경로에 접근 가능하도록 구성한다.

```
경로                          컴포넌트                비고
/                             → /login 리다이렉트
/login                        Login                  로그인
/signup                       Signup                 회원가입
/dashboard                    Dashboard              대시보드 (MainLayout)
/documents                    Documents              디지털 캐비닛 (MainLayout)
/documents/:document_id       DocumentDetail         문서 상세 (MainLayout)
/receipts                     Receipts               영수증 관리 (MainLayout)
/receipts/new/confirm         ReceiptDetail          OCR 후 확인 페이지 (MainLayout)
/receipts/:receipt_id         ReceiptDetail          영수증 상세 (MainLayout)
/finance                      Finance                가계부 (MainLayout)
/finance/report               FinanceReport          소비 리포트 (MainLayout)
/mypage/profile               MyPageProfile          (MyPageLayout)
/mypage/settings              MyPageSettings         (MyPageLayout)
/mypage/plan                  MyPagePlan             (MyPageLayout)
/mypage/logout                MyPageLogout           (MyPageLayout)
/mypage/withdraw              MyPageWithdraw         (MyPageLayout)
/subscription                 MyPagePlan             PRO 업그레이드 (MyPageLayout)
```

URL 파라미터는 DB PK 기준 snake_case 사용:
```ts
const { document_id } = useParams();
const { receipt_id } = useParams();
```

---

## 4. CSS 설계

### 4-1. CSS 변수 (`src/styles/variables.css`)

```css
:root {
  /* 컬러 */
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-primary-light: #eff6ff;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-text: #111827;
  --color-text-sub: #374151;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-danger: #ef4444;
  --color-danger-light: #fef2f2;
  --color-success: #22c55e;
  --color-success-light: #f0fdf4;
  --color-warning: #f59e0b;
  --color-pro: #7c3aed;
  --color-pro-light: #f5f3ff;

  /* 레이아웃 */
  --sidebar-width: 220px;
  --header-height: 60px;

  /* 형태 */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-full: 9999px;

  /* 그림자 */
  --shadow-card: 0 2px 8px rgba(15, 23, 42, 0.06);
  --shadow-modal: 0 8px 32px rgba(15, 23, 42, 0.16);
  --shadow-dropdown: 0 4px 16px rgba(15, 23, 42, 0.10);

  /* 타이포그래피 */
  --font-base: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-base: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;

  /* 간격 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

### 4-2. 컴포넌트별 CSS 분리 원칙

- 각 컴포넌트는 동일한 폴더에 `ComponentName.css`를 둔다.
- 전역 스타일은 `src/styles/global.css`에만 작성한다.
- 클래스명 충돌을 막기 위해 BEM 스타일 네이밍을 권장한다.  
  예: `.document-card`, `.document-card__title`, `.document-card--favorite`

---

## 5. TypeScript 타입 정의

> 전체 타입은 `src/types/`에 분리한다.  
> DB 스키마의 snake_case 컬럼명을 그대로 사용한다.

### 5-1. `common.ts`

```ts
export type YnFlag = "Y" | "N";
export type AiStatus = "PENDING" | "PROCESSING" | "DONE" | "FAILED";
export type ModalMode = "CREATE" | "EDIT" | "VIEW";
```

### 5-2. `user.ts`

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

### 5-3. `document.ts`

```ts
import type { AiStatus, YnFlag } from "./common";

export type DocumentFileType = "JPG" | "PNG";
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

### 5-4. `receipt.ts`

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
```

### 5-5. `report.ts`

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
  category_breakdown?: Record<string, number>;
  ai_analysis?: string;
  created_at: string;
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

### 5-6. `payment.ts`

```ts
export type PaymentMethodType = "KAKAOPAY" | "NAVERPAY" | "CARD";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "CANCELED" | "EXPIRED";
export type PaymentStatus = "READY" | "APPROVED" | "CANCELED" | "FAILED";

export interface Subscription {
  subscription_id: string;
  user_id: string;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  started_at?: string;
  current_period_end?: string;
  is_canceled: boolean;
  canceled_at?: string;
  created_at: string;
}

export interface Payment {
  payment_id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  status: PaymentStatus;
  fail_reason?: string;
  approved_at?: string;
  created_at: string;
}
```

---

## 6. Mock Data 설계

> `src/data/`에 위치. 필드명은 DB 컬럼명 기준 snake_case.

### 6-1. `mockUsers.ts`

- `mockUsers: User[]` — 1명 (PRO 플랜)
- `mockCurrentUser: User` — 현재 로그인한 사용자 (mockUsers[0])
- `mockUserSettings: UserSettings`
- `mockUserConsents: UserConsent[]`

### 6-2. `mockDocuments.ts`

- `mockDocumentCategories: DocumentCategory[]` — 임대차계약서, 처방전, 보증서, 기타
- `mockDocuments: Document[]` — 최소 6건 (카테고리 혼합, is_favorite 포함, 만료 임박 포함)
- `mockTags: Tag[]` — 계약서, 의료, 보증, 중요 등
- `mockDocumentTags: DocumentTag[]`
- `mockDocumentAlerts: DocumentAlert[]`

### 6-3. `mockReceipts.ts`

- `mockSpendCategories: SpendCategory[]` — 식비, 카페, 교통, 쇼핑, 의료, 기타
- `mockReceipts: Receipt[]` — 최소 12건 (OCR/MANUAL 혼합, 날짜 분산)

### 6-4. `mockReports.ts`

- `mockMonthlyReports: MonthlyReport[]` — 6개월치
- `mockDailySpends` — 특정 월의 일별 지출 배열 (차트용)

### 6-5. `mockPayments.ts`

- `mockSubscription: Subscription`
- `mockPayments: Payment[]`

---

## 7. 유틸리티 함수

### `src/utils/formatDate.ts`

```ts
// "2026-05-27T10:00:00+09:00" → "2026.05.27"
export const formatDate = (isoString: string): string

// "2026-05-27T10:00:00+09:00" → "2026.05.27 10:00"
export const formatDateTime = (isoString: string): string

// D-day 계산: expiry_date 기준
export const getDday = (dateString: string): string
```

### `src/utils/formatCurrency.ts`

```ts
// 12500 → "12,500원" (일본 엔화 표기도 고려)
export const formatKRW = (amount: number): string
export const formatJPY = (amount: number): string
```

### `src/utils/filterUtils.ts`

```ts
// 문서 목록 필터 (검색어, 카테고리)
export const filterDocuments = (documents: Document[], query: string, categoryId?: number): Document[]

// 영수증 목록 필터 (검색어, 카테고리, 날짜 범위)
export const filterReceipts = (receipts: Receipt[], query: string, categoryId?: number, from?: string, to?: string): Receipt[]

// 월별 영수증 집계
export const groupReceiptsByMonth = (receipts: Receipt[]): Record<string, Receipt[]>

// 카테고리별 합계
export const sumByCategory = (receipts: Receipt[], categories: SpendCategory[]): { name: string; value: number }[]
```

---

## 8. 공통 레이아웃

### MainLayout

사이드바 + 헤더 + 메인 콘텐츠로 구성.  
`/dashboard`, `/documents`, `/receipts`, `/finance`, `/subscription` 에서 사용.

```
┌─────────────────────────────────────────┐
│  Header (60px)                          │
│  로고 | 페이지명         알림 | 아바타   │
├──────────┬──────────────────────────────┤
│ Sidebar  │  Main Content               │
│ (220px)  │                             │
│          │                             │
│ 대시보드 │                             │
│ 캐비닛   │                             │
│ 영수증   │                             │
│ 소비리포트│                            │
└──────────┴──────────────────────────────┘
```

**Sidebar 메뉴 항목:**
- 대시보드 (`/dashboard`)
- 디지털 캐비닛 (`/documents`)
- 영수증 관리 (`/receipts`)
- 소비 리포트 (`/finance/report`) — PRO 배지 표시, FREE 사용자는 업그레이드 유도

**Header:**
- 좌측: 현재 페이지명
- 우측: 알림 아이콘 + 사용자 아바타 (클릭 시 `/mypage/profile` 이동)
- 모든 화면 우측 하단에 `+` FAB 버튼 (업로드 페이지 오픈)

### MyPageLayout

좌측 서브 사이드바 + 우측 콘텐츠.  
`/mypage/*` 경로에서 사용.

**서브 사이드바:**
- 프로필
- 설정
- 요금제 관리
- 로그아웃
- 회원탈퇴

---

## 9. 페이지별 구현 명세

### 9-1. 로그인 (`/login`)

**구성 요소:**
- 로고 + 서비스명
- 이메일 Input
- 비밀번호 Input (토글 표시/숨기기)
- 로그인 상태 유지 체크박스
- 로그인 버튼 (이메일·비밀번호 미입력 시 비활성화)
- 에러 메시지 영역: "아이디 혹은 비밀번호가 잘못되었습니다."
- 회원가입 링크 `/signup`
- 비밀번호 찾기 링크

**mock 동작:**
- 로그인 버튼 클릭 시 `/dashboard`로 이동

---

### 9-2. 회원가입 (`/signup`)

**구성 요소:**
- 이메일 Input + 인증번호 전송 버튼
- 인증번호 입력 + 확인 버튼
- 비밀번호 Input + 비밀번호 확인 Input (불일치 에러 표시)
- 닉네임 Input
- PIN 6자리 입력 (dot UI)
- 회원가입 버튼 (전체 필수값 미입력 시 비활성화)
- 로그인 링크

**mock 동작:**
- 인증번호 전송: Toast "인증번호가 전송되었습니다."
- 회원가입 완료 시 `/login`으로 이동

---

### 9-3. 대시보드 (`/dashboard`)

**구성 요소:**

| 영역 | 내용 |
|------|------|
| 상단 환영 카드 | "안녕하세요, {nickname}님" + 날짜 |
| 요약 카드 3종 | 총 문서 수 / 만료 임박 문서 수 / 스토리지 사용량 |
| 빠른 업로드 | 드래그 앤 드롭 영역 (클릭 시 UploadPage 오픈) |
| 문서 목록 탭 | 최근 업로드 / 즐겨찾기 탭 전환 — mockDocuments 사용 |
| 이번달 지출 | 총액 + 영수증 건수 — mockReceipts 합산 |
| PRO 영역 | 소비 리포트 미리보기 + AI 인사이트 (FREE면 잠금 배지 표시) |

**사용 mock data:** `mockUsers`, `mockDocuments`, `mockReceipts`, `mockMonthlyReports`

---

### 9-4. 디지털 캐비닛 (`/documents`)

**구성 요소:**

| 영역 | 내용 |
|------|------|
| 상단 바 | 전체 문서 수 + 검색창 + `+ 업로드` 버튼 |
| 필터 | 카테고리 FilterChip (전체/임대차계약서/처방전/보증서/기타) |
| 정렬 / 보기 | 최신순·이름순 Select + 카드형·리스트형 Toggle |
| 문서 목록 | DocumentCard (카드형) 또는 테이블 행 (리스트형) |
| 빈 상태 | 문서가 없을 때 EmptyState 컴포넌트 |

**DocumentCard 표시 항목:**
- 파일 타입 아이콘 (JPG/PNG)
- `document.title`
- `document_categories.name`
- `document.expiry_date` + D-day 뱃지
- `document.is_favorite` 별표 버튼
- `document.ai_status` 상태 Badge

**상호작용:**
- 카드 클릭 → `/documents/:document_id`
- 검색어 입력 → `filterDocuments()` 실시간 필터링
- 카테고리 클릭 → 해당 카테고리만 표시
- `+ 업로드` → `UploadPage` 오픈

---

### 9-5. 문서 상세 (`/documents/:document_id`)

**구성 요소:**

| 영역 | 내용 |
|------|------|
| 상단 | `← 전체 문서` 뒤로가기 버튼 |
| 좌측 | 문서 미리보기 영역 (이미지 미리보기) |
| 우측 | 문서 메타 정보 패널 |
| 메타 패널 | 문서명 / 종류 / 파일정보 / 태그 / 발급일 / 만료일 / AI 신뢰도 |
| AI 추출 | `extracted_data` JSON 렌더링 (key-value 목록) |
| 알림 설정 | `document_alerts` 목록 + `+ 알림 추가` → AlertSettingModal |
| 액션 버튼 | 즐겨찾기 / 다운로드 (mock) / 삭제 (is_deleted: "Y" 처리) |

---

### 9-6. 영수증 관리 (`/receipts`)

**구성 요소:**

| 영역 | 내용 |
|------|------|
| 요약 카드 3종 | 이번달 총지출 / 영수증 건수 / 최다 지출 카테고리 |
| 필터 바 | 검색창 + 날짜 기간 Input (from~to) + 카테고리 FilterChip |
| 정렬 | 최신 등록순 / 결제일순 / 금액순 Select |
| 영수증 목록 | ReceiptCard (결제일 / 가맹점명 / 카테고리명 / 금액) |
| 페이지네이션 | Pagination 컴포넌트 (페이지당 10건) |
| 업로드 버튼 | `영수증 업로드` → ReceiptBranchModal (OCR/수기 분기) |

**검색 대상:** `store_name`, `memo`, `payment_item`, `spend_categories.name`  
**날짜 필터 기준:** `purchase_date`

---

### 9-7. 영수증 상세 (`/receipts/:receipt_id`, `/receipts/new/confirm`)

**구성 요소:**
- 영수증 이미지 (file_url 있으면 표시, 없으면 기본 카드 UI)
- 결제일 / 가맹점명 / 금액 / 카테고리 / 결제항목 / 메모
- 수정 버튼 → ReceiptManualModal (EDIT 모드)
- 저장 버튼 → Toast "저장되었습니다."
- 삭제 버튼 → ReceiptDeleteConfirmModal 오픈
- `← 영수증 목록` 뒤로가기

---

### 9-8. 가계부 (`/finance`)

**구성 요소:**

| 영역 | 내용 |
|------|------|
| 월 선택 | `< 2026년 11월 >` 좌우 버튼 |
| 요약 | 총 지출 / 영수증 건수 / 전월 대비 변화 |
| 일별 지출 차트 | Recharts BarChart — x축: 날짜, y축: 금액 / 날짜 클릭 시 하단 목록 갱신 |
| 카테고리 차트 | Recharts PieChart — category_breakdown 기준 |
| 영수증 목록 | 선택 날짜 기준 필터링 |
| PRO 예상 지출 | `predicted_spend` + `prediction_confidence` (FREE면 잠금 UI) |
| AI 인사이트 | `ai_analysis` 텍스트 (FREE면 잠금 UI) |
| 카드 추천 | PRO 전용 버튼 |

---

### 9-9. 소비 리포트 (`/finance/report`)

> PRO 전용 페이지. FREE 사용자는 업그레이드 유도 화면 표시.

**구성 요소:**
- 월 선택
- 6개월 지출 추이 Recharts LineChart
- 카테고리별 지출 Recharts BarChart (수평)
- AI 소비패턴 분석 텍스트
- 카드 추천 섹션

---

### 9-10. 마이페이지

#### 프로필 (`/mypage/profile`)
- 프로필 사진 + 변경 버튼 → ProfilePhotoModal
- 닉네임 / 이메일 / 플랜 뱃지 / 가입일
- 닉네임 수정 인라인 폼
- 비밀번호 변경 링크
- 스토리지 사용량 Progress Bar  
  (`storage_used_bytes` / `storage_quota_bytes`)
- 결제 수단 카드 → PaymentMethodModal

#### 설정 (`/mypage/settings`)
- 푸시 알림 토글 (`push_enabled`)
- 이메일 알림 토글 (`email_noti_enabled`)
- 동의 항목 (TERMS / PRIVACY / MARKETING / THIRD_PARTY) 토글
- 캐비닛 PIN 재설정 버튼 → PinResetModal

#### 요금제 관리 (`/mypage/plan`)
- 현재 플랜 카드 (FREE / PRO)
- FREE vs PRO 기능 비교표
- PRO 업그레이드 버튼 → 결제 플로우 mock (Toast "결제가 완료되었습니다.")
- 플랜 해지 버튼 → PlanCancelModal

#### 로그아웃 (`/mypage/logout`)
- 확인 문구 + 로그아웃 버튼 (클릭 시 `/login` 이동) + 취소 버튼

#### 회원탈퇴 (`/mypage/withdraw`)
- 삭제 데이터 안내
- 탈퇴 사유 Select
- 확인 입력 (닉네임 직접 타이핑)
- 탈퇴하기 버튼 → WithdrawConfirmModal

---

## 10. 모달 명세

| 컴포넌트 | 트리거 | 주요 내용 |
|----------|--------|-----------|
| `UploadPage` | 캐비닛 `+ 업로드` | 드래그앤드롭 / 파일 선택 / 분석 시작 버튼 |
| `DocumentAnalyzingModal` | 업로드 후 자동 | AI 분석 중 로딩 애니메이션 |
| `DocumentAnalyzeResultModal` | 분석 완료 후 | 추출 결과 확인 + 수정 + 저장 |
| `CategoryEditModal` | 문서 상세 카테고리 수정 | 카테고리 선택 |
| `ReceiptBranchModal` | 영수증 업로드 버튼 | OCR 업로드 / 수기 작성 탭 선택 |
| `ReceiptUploadModal` | ReceiptBranchModal에서 OCR 선택 | 드래그앤드롭 / 분석 중 / 실패 처리 |
| `ReceiptManualModal` | 수기 작성 탭 또는 영수증 상세 수정 | 결제일·가맹점명·금액·카테고리 폼 |
| `ReceiptDeleteConfirmModal` | 영수증 삭제 버튼 | "삭제하시겠습니까?" + 확인/취소 |
| `AlertSettingModal` | 문서 상세 `+ 알림 추가` | 날짜 선택 / 알림 사유 / 채널 토글 |
| `ProfilePhotoModal` | 프로필 사진 변경 | 이미지 선택 / 미리보기 / 삭제 |
| `PinResetModal` | 설정 PIN 재설정 | 현재 PIN / 새 PIN 입력 |
| `PaymentMethodModal` | 프로필 결제 수단 | 카카오페이 / 카드 선택 mock |
| `PlanCancelModal` | 요금제 해지 버튼 | 해지 확인 / 회유 문구 |
| `PaymentFailModal` | 결제 실패 시 | 실패 사유 + 재시도 버튼 |
| `WithdrawConfirmModal` | 회원탈퇴 최종 확인 | 최종 경고 + 탈퇴 처리 |

### 공통 Modal 구현 원칙

- `Modal.tsx` 기본 래퍼: dim 배경 + ESC 닫기 + 외부 클릭 닫기
- `isOpen` / `onClose` props 기본 인터페이스
- `ModalMode` 타입으로 CREATE / EDIT / VIEW 모드 분기

---

## 11. 공통 컴포넌트 명세

### Button

```ts
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Badge

```ts
interface BadgeProps {
  variant?: "default" | "primary" | "success" | "danger" | "warning" | "pro";
  children: React.ReactNode;
}
```

PRO 기능 배지: `<Badge variant="pro">PRO</Badge>`

### Toast

- `useToast` 훅으로 전역 관리
- 타입: `success` / `error` / `info`
- 자동 3초 후 사라짐

### EmptyState

```ts
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

### FilterChip

```ts
interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}
```

### Pagination

```ts
interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}
```

---

## 12. 차트 구현 가이드

### Recharts 공통 설정

```ts
const CHART_COLORS = [
  "#2563eb", // 식비
  "#7c3aed", // 카페
  "#0891b2", // 교통
  "#d97706", // 쇼핑
  "#16a34a", // 의료
  "#6b7280", // 기타
];
```

### SpendBarChart (일별 지출)

- `BarChart` + `XAxis(날짜)` + `YAxis(금액)` + `Tooltip`
- 날짜 클릭 시 `onDateClick(date: string)` 콜백

### CategoryPieChart (카테고리 비중)

- `PieChart` + `Cell` (CHART_COLORS)
- `Legend` 하단 표시

### MonthlyLineChart (6개월 추이)

- `LineChart` + `XAxis(월)` + `YAxis(금액)` + `Tooltip`

---

## 13. API 연동 준비 구조

실제 API 연동 전이지만, 나중에 교체하기 쉽도록 데이터 접근 레이어를 분리한다.

```
src/
└── services/    (추후 추가 예정)
    ├── documentService.ts   # getDocuments(), getDocumentById() 등
    ├── receiptService.ts    # getReceipts(), createReceipt() 등
    └── userService.ts       # getCurrentUser() 등
```

현재는 mock data를 직접 import하되, 추후 서비스 레이어 교체만으로 API 연동이 가능한 구조를 염두에 두고 컴포넌트에서 데이터를 분리한다.

**상태 관리:** 이번 단계에서는 `useState` + props drilling으로 충분.  
Context API는 Toast, 현재 사용자 정보 등 전역 상태에만 사용.

---

## 14. 작업 우선순위 및 체크리스트

### Phase 1 — 기반 세팅

- [ ] `src/styles/` CSS 파일 구성 (reset, variables, global)
- [ ] `src/types/` 타입 정의 (6개 파일)
- [ ] `src/data/` mock data 작성 (5개 파일)
- [ ] `src/utils/` 유틸 함수 작성
- [ ] `src/routes/AppRouter.tsx` 라우팅 재구성
- [ ] 기존 임시 파일 정리 (Home.tsx, About.tsx, App.css, index.css)

### Phase 2 — 레이아웃 및 공통 컴포넌트

- [ ] `Header.tsx` + `Header.css`
- [ ] `Sidebar.tsx` + `Sidebar.css`
- [ ] `MainLayout.tsx` + `MainLayout.css`
- [ ] `MyPageLayout.tsx` + `MyPageLayout.css`
- [ ] `Button.tsx` / `Card.tsx` / `Input.tsx` / `Select.tsx`
- [ ] `Badge.tsx` / `Modal.tsx` / `Toast.tsx`
- [ ] `EmptyState.tsx` / `FilterChip.tsx` / `Pagination.tsx`
- [ ] FAB `+` 버튼 (전체 레이아웃 우측 하단 고정)

### Phase 3 — 핵심 페이지

- [ ] 로그인 페이지
- [ ] 회원가입 페이지
- [ ] 대시보드 페이지
- [ ] 디지털 캐비닛 페이지 (목록 + 필터 + 검색)
- [ ] 문서 상세 페이지

### Phase 4 — 영수증

- [ ] 영수증 관리 페이지 (목록 + 필터)
- [ ] 영수증 상세 / 확인 페이지
- [ ] `ReceiptBranchModal`
- [ ] `ReceiptUploadModal`
- [ ] `ReceiptManualModal`
- [ ] `ReceiptDeleteConfirmModal`

### Phase 5 — 차트 및 리포트

- [ ] 가계부 페이지 (BarChart + PieChart)
- [ ] 소비 리포트 페이지 (LineChart + PRO 잠금 UI)
- [ ] `AlertSettingModal`

### Phase 6 — 마이페이지 및 나머지 모달

- [ ] 마이페이지 프로필
- [ ] 마이페이지 설정
- [ ] 요금제 관리
- [ ] 로그아웃 / 회원탈퇴
- [ ] 나머지 모달 (`ProfilePhotoModal`, `PinResetModal`, `PlanCancelModal` 등)

---

## 15. 완료 기준

- [ ] `npm run dev` 실행 시 에러 없이 화면 표시
- [ ] TypeScript 에러 없음
- [ ] 주요 페이지 라우팅 정상 동작
- [ ] Header / Sidebar / MainLayout 적용
- [ ] `src/types/` DB 스키마 기준 타입 정의 완료
- [ ] mock data가 snake_case 필드명으로 작성됨
- [ ] 문서 목록 / 영수증 목록 mock data로 표시
- [ ] 검색 / 카테고리 필터 / 날짜 필터 기본 동작
- [ ] 업로드 페이지 (문서, 영수증) 열리고 닫힘
- [ ] 소비 리포트 페이지에 Recharts 그래프 표시
- [ ] PRO 기능 영역 잠금 배지 또는 업그레이드 유도 UI 표시
- [ ] CSS가 `styles/` 폴더 기준으로 분리됨
- [ ] 역할별 컴포넌트 분리 완료

---

## 16. 주의사항

- TailwindCSS 사용 금지. CSS 파일 분리 방식 유지.
- `any` 타입 사용 금지. `src/types/` 인터페이스 활용.
- mock data 필드명은 서버 DB 컬럼명 기준 snake_case 유지.
- React 내부 state / 함수명은 camelCase 사용 가능.
- 컴포넌트 파일명은 PascalCase.
- 실제 API 연동 코드 작성 금지. 추후 서비스 레이어 교체로 연결 가능한 구조 유지.
- URL 파라미터명은 DB PK 기준 snake_case 사용 (`document_id`, `receipt_id`).
- 기존 파일 삭제 전 역할 확인 후 교체 방식으로 진행.


## 업로드 페이지 정책

- 업로드는 모달이 아니라 `/upload` 별도 페이지에서 처리합니다.
- 1단계: JPG / PNG 이미지 업로드 또는 모바일 카메라 촬영 이미지 선택
- 2단계: AI 추출 정보 확인·수정·등록
- 일반 문서는 디지털 캐비닛에 저장합니다.
- 영수증은 디지털 캐비닛이 아닌 영수증 관리 페이지에서 별도로 관리합니다.
- PDF는 업로드하지 않으며, PDF 내려받기 기능만 제공합니다.

## 업로드 이동 정책

- 사이드바에는 업로드 메뉴를 두지 않습니다.
- 디지털 캐비닛의 `+ 업로드` 버튼을 클릭하면 `/upload` 문서 업로드 페이지로 이동합니다.
- 업로드는 모달이 아니라 별도 페이지에서 2단계로 진행합니다.

## 랜딩페이지 정책

- `/` 첫 화면은 로그인 페이지가 아니라 서비스 소개 랜딩페이지로 진입합니다.
- 로그인은 `/login`에서 별도로 제공합니다.
- 랜딩페이지에는 서비스 소개, 주요 기능, 이용 흐름, Free/Pro 요금제, CTA 버튼을 포함합니다.
- `무료로 시작하기`는 `/signup`, `로그인`은 `/login`, 서비스 이용 후 대시보드는 `/dashboard`로 이동합니다.

## UI 브랜드 통일 정책

- 전체 화면 색감은 랜딩페이지 기준의 아이보리 배경, 민트 포인트, 딥네이비 텍스트로 통일합니다.
- 로그인, 대시보드, 디지털 캐비닛, 업로드, 영수증 관리, 소비 리포트, 마이페이지 모두 동일한 카드형 UI와 버튼 톤을 사용합니다.
- 랜딩페이지는 화면 중앙에 좁게 고정하지 않고, 대시보드처럼 넓은 화면을 적극적으로 활용합니다.

## UI 정리 사항

- 전체 배경은 아이보리보다 화이트/라이트그레이 톤으로 정리합니다.
- 로고와 주요 포인트 컬러는 파란색이 아닌 민트 계열로 통일합니다.
- 카드 그림자는 과하지 않게 줄이고, 얇은 보더 중심의 깔끔한 UI로 맞춥니다.
- 로그인/회원가입 입력창의 기본 파란 포커스와 이중 테두리 느낌을 제거합니다.

## 랜딩페이지 최종 폭 조정

- 기존 브랜드 색감과 버튼 스타일은 유지합니다.
- 랜딩페이지 헤더, 히어로, 기능, 요금제 섹션은 화면 전체 너비를 적극적으로 사용하도록 확장합니다.
- 대시보드/디지털 캐비닛처럼 넓은 화면에서도 좌우 여백이 과하게 좁아 보이지 않도록 조정합니다.
