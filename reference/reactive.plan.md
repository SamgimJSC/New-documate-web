# 반응형(모바일 대응) 작업 계획 — DocuMate Web

> 목표: 데스크톱 전용으로 만들어진 모든 UI 페이지를 모바일/태블릿까지 대응하는 반응형으로 전환한다.
> 작성일: 2026-07-14

---

## 1. 현재 상태 진단

| 항목 | 현황 | 문제점 |
| --- | --- | --- |
| 레이아웃 | `MainLayout` = 고정 `Sidebar(220px)` + `Header` + `main` | 모바일에서 사이드바가 화면을 잠식. 햄버거/드로어 없음 |
| 네비게이션 | `Sidebar.tsx` sticky 220px 고정 | 좁은 화면 대응 로직 전무 |
| 헤더 | `Header.tsx` breadcrumb + actions + FAB | breadcrumb·brand가 모바일 폭에서 넘침 |
| 브레이크포인트 | 1024 / 980 / 900 / 720 / 640px 혼재 | 표준 없음, 페이지마다 제각각 |
| 스타일 구조 | 페이지별 CSS + `global.css`/`index.css`/`App.css`(내용 상당 부분 중복) + `variables.css` 토큰 | 중복 미디어쿼리, 유지보수 어려움 |
| 데이터 표시 | 테이블·그리드·recharts 차트 다수 | 가로 스크롤/오버플로 미대응 |
| 터치 타깃 | 26~36px 버튼 다수 | 모바일 최소 44px 미달 |

핵심 병목: **레이아웃/네비게이션의 모바일 패턴 부재**. 이걸 먼저 잡아야 페이지 단위 작업이 의미를 가진다.

---

## 2. 브레이크포인트 표준 (선행 확정)

`variables.css`에 토큰을 추가하고, 이후 모든 미디어쿼리는 이 기준만 사용한다.

```
--bp-sm: 480px;    /* 소형 모바일 */
--bp-md: 768px;    /* 태블릿 세로 / 모바일↔데스크톱 경계 (사이드바 드로어 전환점) */
--bp-lg: 1024px;   /* 태블릿 가로 / 소형 노트북 */
--bp-xl: 1280px;   /* 데스크톱 */
```

- 접근 방식: **데스크톱 우선(max-width)** 유지 — 기존 코드가 데스크톱 기준이므로 리라이트 리스크 최소화.
- 주 전환점은 **768px**(사이드바 → 드로어), 보조 전환점 **480px**(그리드 1열, 폰트/여백 축소).
- 기존의 900/980/720/640 미디어쿼리는 작업하면서 표준값으로 점진 수렴.

---

## 3. 작업 단계 (Phase)

### Phase 0 — 기반 정리 (0.5일)
- [ ] `variables.css`에 브레이크포인트 토큰 추가
- [ ] `<meta name="viewport">` 확인/설정 (`index.html`)
- [ ] `global.css`에 공통 반응형 유틸 추가: `img/table max-width:100%`, `overflow-x` 래퍼 클래스, `box-sizing` 전역 확인
- [ ] `global.css`/`index.css`/`App.css` 중복 미디어쿼리 현황 정리 (제거는 후속 단계에서)

### Phase 1 — 레이아웃 & 네비게이션 (핵심, 1.5~2일)
가장 중요. 여기서 모바일 셸을 완성한다.
- [ ] **Sidebar 모바일 드로어화**
  - `≤768px`: 사이드바를 `position: fixed` 오프캔버스 드로어로 전환 + 반투명 오버레이(backdrop)
  - `MainLayout`에 `isSidebarOpen` 상태 추가, 라우트 변경 시 자동 닫힘
  - 오버레이 클릭 / ESC / 링크 선택 시 닫힘, body 스크롤 잠금
- [ ] **Header 햄버거 버튼**
  - `≤768px`에서만 노출되는 햄버거 → 드로어 토글
  - breadcrumb: 모바일에서 축약(현재 항목만) 또는 뒤로가기 버튼으로 대체
  - `header__actions` 아이콘 버튼 44px 터치 타깃 확보
- [ ] **FAB** 위치가 모바일에서 콘텐츠/하단 네비와 겹치지 않도록 `bottom/right` 조정
- [ ] **MyPageLayout** 동일 패턴 적용
- [ ] (선택) `≤768px` 하단 탭바(Bottom Navigation) 도입 여부 결정 → 핵심 4메뉴 접근성 향상

### Phase 2 — 공통 컴포넌트 (1~1.5일)
페이지 전에 재사용 컴포넌트를 반응형으로 만들면 하위 페이지가 자동 개선된다.
- [ ] `Modal` — 모바일 풀스크린/바텀시트 전환, 최대 높이 + 내부 스크롤
- [ ] `Input`/`Select`/`SearchBar` — 폭 100%, 폰트 16px↑(iOS 확대 방지), 터치 높이 44px
- [ ] `Button` — 최소 터치 높이, 그룹 시 wrap
- [ ] `Pagination` — 모바일 축약 표시
- [ ] `Card` — 패딩/그리드 축소 토큰화
- [ ] 차트 래퍼(`recharts`) — `ResponsiveContainer` 적용 확인, 최소 높이 지정
- [ ] 테이블 공통 패턴 확정: **`≤768px`에서 행 → 카드 변환** 또는 `overflow-x` 스크롤 컨테이너 (페이지별 택1)

### Phase 3 — 페이지별 대응 (3~4일)
우선순위 = 사용 빈도 × 현재 깨짐 정도.

**우선순위 A (데이터 밀집·핵심 동선)**
- [ ] `Dashboard` — summary-grid 3열→1열, 차트/카드 스택
- [ ] `Documents` (디지털 캐비닛) — 목록/필터/테이블
- [ ] `DocumentDetail` — 2단 레이아웃 → 스택
- [ ] `Receipts` / `ReceiptDetail` — 목록·필터·상세
- [ ] `Finance` / `FinanceReport`(+ tabs: Monthly/AnnualPattern/CardRecommend) — 차트·탭·표

**우선순위 B (폼·업로드 플로우)**
- [ ] `UploadPage` / `ManualRegisterPage` / `ProcessingCenterPage`
- [ ] `Cards`
- [ ] `MyPage*` (Home/Profile/Settings/Plan/Withdraw/PaymentResult)

**우선순위 C (인증·랜딩)**
- [ ] `Login` / `Signup` / `ResetPassword` — 카드 폭·여백
- [ ] `LandingPage` — 히어로/섹션 반응형

각 페이지 공통 체크: 그리드 열 수, 좌우 패딩, 폰트 스케일, 가로 오버플로, 고정폭(px) → 상대단위/토큰화.

### Phase 4 — 모달 개별 점검 (0.5~1일)
`components/modal/*`, `components/upload/*` 모달들 개별 확인 (DocumentUpload, Receipt*, Pin*, CategoryEdit, Alert 등) — Phase 2 공통 Modal 위에서 예외만 손질.

### Phase 5 — 검증 & 마무리 (1일)
- [ ] Playwright(설치됨)로 뷰포트별 스모크: 375 / 768 / 1024 / 1440px 주요 페이지 스크린샷
- [ ] 실기기/DevTools에서 스크롤·터치·드로어 동작 확인
- [ ] 가로 스크롤 발생 페이지 0 확인
- [ ] 중복 미디어쿼리 정리 및 브레이크포인트 표준으로 수렴
- [ ] 접근성: 포커스 트랩(드로어/모달), aria 속성, 키보드 동작

---

## 4. 페이지별 대응 체크리스트 (요약)

| 페이지 | 주요 반응형 이슈 | 처리 방향 |
| --- | --- | --- |
| Dashboard | 3열 summary grid, 차트 | grid→1열, 차트 ResponsiveContainer |
| Documents | 필터바 + 테이블 | 필터 wrap, 행→카드 |
| DocumentDetail | 2단 레이아웃 | 스택 전환 |
| Receipts / Detail | 목록·필터·기간 드롭다운 | wrap, 카드화 |
| Finance / Report | 탭 + 차트 + 표 | 탭 스크롤, 차트/표 대응 |
| Upload 계열 | 폼·단계 UI | 폭 100%, 스텝 세로 |
| MyPage 계열 | 설정 폼·요금제 카드 | 1열, 카드 스택 |
| Login/Signup/Reset | 카드 폭 | 모바일 여백/폭 조정 |
| LandingPage | 히어로·섹션 | 섹션별 반응형 |

---

## 5. 공통 규칙 (작업 시 준수)

1. 새 미디어쿼리는 **Phase 2 브레이크포인트 표준값만** 사용.
2. 고정 `px` 폭 → `%` / `minmax()` / `clamp()` / spacing 토큰으로 교체.
3. 그리드는 `repeat(auto-fit, minmax())` 또는 브레이크포인트별 열 수 축소.
4. 터치 타깃 최소 44×44px, 입력 폰트 ≥16px(iOS 줌 방지).
5. 가로 오버플로 위험 요소(표·코드·차트)는 반드시 `overflow-x:auto` 컨테이너로 감싼다.
6. 기존 디자인 토큰(`variables.css`) 최대한 재사용, 새 색·간격 하드코딩 지양.
7. 페이지 CSS 우선 수정, 전역 CSS(`global/index/App`) 변경은 영향 범위 확인 후.

---

## 6. 예상 일정

| Phase | 내용 | 예상 |
| --- | --- | --- |
| 0 | 기반 정리 | 0.5일 |
| 1 | 레이아웃/네비 | 1.5~2일 |
| 2 | 공통 컴포넌트 | 1~1.5일 |
| 3 | 페이지별 | 3~4일 |
| 4 | 모달 | 0.5~1일 |
| 5 | 검증 | 1일 |
| **합계** | | **약 7.5~10일** |

---

## 7. 리스크 & 메모

- `global.css`/`index.css`/`App.css`에 유사 내용이 중복 존재 → 한 곳 수정이 다른 곳에 안 먹히거나 충돌 가능. 작업 초반에 실제 로드 경로(어떤 파일이 실제 적용되는지) 확인 필요.
- `main-layout__main > *`에 `!important` 폭 강제 규칙 존재 → 페이지 반응형 조정 시 이 규칙과 충돌 주의.
- 사이드바 드로어 전환이 전체 셸에 영향 → Phase 1을 반드시 먼저 안정화 후 페이지 작업.
- Playwright는 이미 devDependency로 존재 → 시각 회귀 검증에 활용.

---

## 8. 구현 결과 (2026-07-14 작업)

### 확인된 사실
- `App.css`, `index.css`는 **어디서도 import되지 않는 죽은 파일** → 실제 로드되는 전역 CSS는 `styles/global.css`(→ `reset.css`, `variables.css`)뿐. 중복 리스크는 실질적으로 없었음.
- `<meta name="viewport">`는 이미 올바르게 설정됨.
- `reset.css`에 `box-sizing: border-box`, `img max-width:100%` 이미 존재.
- **페이지 대부분이 이미 반응형 미디어쿼리를 보유**하고 있었음(Dashboard·DocumentDetail·ReceiptDetail·Receipts·FinanceReport·Cards·MyPage·Upload 계열·Login·Signup 등). 실제 핵심 결손은 **모바일 네비게이션 셸**이었음.

### Phase 0 — 기반
- `variables.css`: `--bp-sm/md/lg/xl` 토큰 추가(참고용).
- `global.css`: `.scroll-x` 유틸, `html/body { max-width:100%; overflow-x:hidden }`, `table { max-width:100% }` 추가.

### Phase 1 — 레이아웃/네비게이션 (핵심)
- `MainLayout.tsx`: `isSidebarOpen` 상태, 라우트 변경 시 자동 닫힘, body 스크롤 잠금, ESC 닫힘, 오버레이(`main-layout__overlay`).
- `Sidebar.tsx`: `isOpen`/`onClose` props, `sidebar--open` 클래스.
- `Sidebar.css`: `≤768px`에서 오프캔버스 드로어(`translateX(-100%)` → 열림 시 0).
- `Header.tsx`: 햄버거 버튼(`onMenuClick` 있을 때만, 모바일에서만 표시).
- `Header.css`: 햄버거 노출/숨김, 터치 타깃 44px, breadcrumb 모바일 축약(현재 항목만), FAB 위치 조정.
- `MainLayout.css`: 오버레이 + `768/480px` 본문 패딩 축소.

### Phase 2 — 공통 컴포넌트
- `Modal.css`: `≤480px` 하단 바텀시트 전환(풀폭, 상단 라운드, 슬라이드업).
- `Input.css`/`Select.css`/`SearchBar.css`: `≤768px` 입력 폰트 16px(iOS 줌 방지) + 터치 높이 44px, 검색 입력/드롭다운 폭 100%.
- `Pagination.css`: `flex-wrap: wrap`.
- 차트: 모든 recharts가 이미 `ResponsiveContainer width="100%"` 사용 → 변경 불필요.

### Phase 3 — 페이지 (결손 보강)
- `Documents.css`: 검색 입력 모바일 풀폭, 리스트 뷰 5열 그리드를 `overflow-x` + `min-width:640px`로 가로 스크롤 보존.
- `Finance.css`: `≤900px` 차트 1열, `≤600px` 요약 1열 + 영수증 행 컬럼 축소(날짜 숨김).
- 그 외 페이지는 기존 미디어쿼리로 이미 대응됨(변경 없음).

### Phase 4 — 모달
- 공통 `Modal` 바텀시트화로 대부분 커버. 개별 모달 CSS는 기존 미디어쿼리 보유.

### Phase 5 — 검증
- Vite dev(5199)에서 Login/Signup/Landing **375px 스크린샷 확인, 가로 오버플로 0**.
- 수정한 `MainLayout/Sidebar/Header` 모듈 Vite 트랜스폼 200(컴파일 정상).
- 참고: 인증이 필요한 페이지(대시보드 등)는 백엔드 미가동으로 브라우저 실사용 검증 불가 → 코드 리뷰 + 모듈 컴파일로 확인. 백엔드 연동 환경에서 375/768px 실제 확인 권장.
- 참고: 프로젝트에 **기존 타입 에러**(mockDocuments/services/Finance 등)가 있어 `tsc -b` 게이트는 원래 실패 상태(이번 작업과 무관). 개발은 `vite dev` 기준.
