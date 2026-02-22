# FitLowPrice - 프로젝트 컨텍스트

> 이 파일은 Claude Code 에이전트가 프로젝트를 이해하기 위한 컨텍스트 문서입니다.
>
> **참고 리소스**:
>
> - [SkillsCokac](https://skills.cokac.com/) - Claude Code Skills 커뮤니티
> - [SkillsMP](https://skillsmp.com/) - Agent Skills 마켓플레이스

---

## 프로젝트 개요

**FitLowPrice**는 네이버, 쿠팡, 11번가 로그인 정보를 기반으로 나의 포인트, 쿠폰, 멤버십 혜택이 모두 적용된 **'진짜 최종 결제 금액'**을 한눈에 비교하는 도구입니다.

### 핵심 가치

- ❌ 단순 가격 비교 서비스가 아님
- ⭕ **"결정 피로 제거 및 쇼핑 시간 단축"** - 일반 최저가가 아닌 '나에게만 해당하는 최저가'를 확인하여 "손해 보지 않았다"는 확신을 제공합니다.

### 타겟 사용자

- 29세 직장인, 여러 쇼핑몰 계정 보유
- 쿠폰/적립금 관리가 귀찮음
- "대충 싼 것 같은 곳"에서 구매하는 습관

---

## 기술 스택

| 계층          | 기술                                |
| ------------- | ----------------------------------- |
| **Framework** | Next.js 16 (App Router)             |
| **Language**  | TypeScript (Strict Mode)            |
| **Database**  | Turso (Cloud SQLite)                |
| **Styling**   | Tailwind CSS + shadcn/ui            |
| **State**     | Zustand (persist middleware)        |
| **Deploy**    | Netlify                             |
| **Scraping**  | Python (Selenium 등 세션 공유 기반) |

---

## 프로젝트 구조

```
fitlowprice/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 메인 페이지 (검색)
│   │   ├── not-found.tsx       # 404 페이지
│   │   ├── compare/[productId]/ # 가격 비교 페이지
│   │   └── api/                # API Routes
│   │       ├── products/search/ # 상품 검색
│   │       └── calculate/       # 최종가 계산
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 컴포넌트
│   │   ├── layout/             # Header, Footer
│   │   └── features/           # SearchSection, PriceCard
│   ├── lib/
│   │   ├── prisma.ts           # Prisma 클라이언트 (DB)
│   │   ├── scrapers/           # 가격 수집 모듈 (Strategy Pattern)
│   │   │   ├── types.ts        # MallScraper 인터페이스
│   │   │   ├── coupang.ts
│   │   │   ├── naver.ts
│   │   │   └── elevenst.ts
│   │   └── utils.ts            # cn() 등 유틸리티
│   ├── types/                  # TypeScript 타입 정의
│   └── store/                  # Zustand 스토어
├── prisma/
│   └── schema.prisma           # DB 스키마 정의
├── netlify.toml                # Netlify 배포 설정
├── public/images/malls/        # 쇼핑몰 로고
├── next.config.ts              # Next.js 설정 (이미지 도메인 등)
├── CLAUDE.md                   # 프로젝트 컨텍스트 (개발 로드맵 포함)
└── package.json
```

---

## 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드 (프로덕션)
npm run build

# 린트
npm run lint

# 타입 체크
npx tsc --noEmit

# shadcn/ui 컴포넌트 추가
npx shadcn@latest add <component-name>

# Prisma DB 스키마 적용 (로컬)
npx prisma db push

# DB 데이터 확인 (Prisma Studio)
npx prisma studio
```

---

## 코딩 컨벤션

### 파일/폴더 명명

- 컴포넌트: `PascalCase.tsx` (예: `PriceCard.tsx`)
- 유틸/헬퍼: `kebab-case.ts` (예: `price-calculator.ts`)
- API 라우트: `route.ts` (Next.js App Router 표준)

### 코드 스타일

```typescript
// ✅ 컴포넌트는 named export 또는 default export 사용
export function PriceCard({ mall, price }: PriceCardProps) {
  // ...
}

// ✅ 인터페이스는 Props 접미사 사용
interface PriceCardProps {
  mall: MallID;
  price: MallPrice;
  isCheapest: boolean;
}

// ✅ API 응답 타입은 Response 접미사
interface SearchResponse {
  product: Product;
  prices: MallPrice[];
}

// ✅ 서버 액션/API는 async 함수
export async function POST(request: Request) {
  // ...
}

// ✅ 미사용 변수는 _prefix 또는 eslint-disable 사용
async search(_keyword: string): Promise<ScraperResult[]> {
  return [];
}
```

### 에러 처리

```typescript
// API에서 일관된 에러 응답 형식 사용
return NextResponse.json(
  { error: "상품을 찾을 수 없습니다.", code: "PRODUCT_NOT_FOUND" },
  { status: 404 },
);

// catch 블록에서 미사용 error 변수는 생략
} catch {
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
```

---

## 핵심 도메인 용어

| 용어           | 설명                               |
| -------------- | ---------------------------------- | ------- | ---------- |
| `basePrice`    | 쇼핑몰 표시 판매가 (할인 전)       |
| `shippingFee`  | 배송비                             |
| `finalPrice`   | 모든 할인 적용 후 최종 결제 예상액 |
| `discountRule` | 쿠폰, 적립금, 멤버십 등 할인 규칙  |
| `mall`         | 쇼핑몰 (coupang, naver, elevenst)  |
| `MallID`       | 타입: 'coupang'                    | 'naver' | 'elevenst' |

---

## 지원 쇼핑몰 및 확인 항목

| Mall ID    | 이름       | 주요 확인 데이터 (할인/적립 혜택)                              |
| ---------- | ---------- | -------------------------------------------------------------- |
| `coupang`  | 쿠팡       | 와우 회원 전용가, 카드사 즉시 할인 혜택, 쿠페이 머니 적립      |
| `naver`    | 네이버쇼핑 | 네이버 플러스 멤버십 적립률, 보유 포인트, 스토어별 쿠폰        |
| `elevenst` | 11번가     | T멤버십 할인/적립, 우주패스 혜택, SK pay 포인트, 장바구니 쿠폰 |

### 데이터 수집 전략 (API vs Scraping)

| 쇼핑몰 | 권장 방법 | 필요 조건 | 비고 |
|--------|----------|----------|-----|
| **네이버** | [공식 검색 API](https://developers.naver.com/) | Client ID/Secret | **구현 완료**. 가장 안정적이고 빠름. |
| **쿠팡** | [쿠팡 파트너스 API](https://partners.coupang.com/) | 파트너스 가입 | **추천**. 셀러 등록 불필요. 개인 가입 가능. |
| **11번가** | [11번가 OpenAPI](https://openapi.11st.co.kr/) | 개발자(셀러) 등록 | 구매자 ID로 승인 어려움. 셀러 권장. 대안으로 Puppeteer 고려. |

---

## 가격 계산 로직

```typescript
function calculateFinalPrice(
  basePrice: number,
  shippingFee: number,
  discounts: AppliedDiscount[],
): number {
  let total = basePrice + shippingFee;

  for (const discount of discounts) {
    if (discount.type === "percent") {
      const amount = Math.min(
        total * (discount.value / 100),
        discount.maxDiscount ?? Infinity,
      );
      total -= amount;
    } else if (discount.type === "fixed") {
      total -= discount.value;
    }
  }

  return Math.max(total, 0);
}
```

---

## UX 원칙 (Nielsen's 10 Heuristics 기반)

> 참고: [SkillsCokac - ux-improve](https://skills.cokac.com/)

1. **가시성**: 현재 최저가 쇼핑몰이 명확히 표시됨 (🏆 뱃지)
2. **일관성**: 모든 PriceCard가 동일한 구조
3. **피드백**: 체크박스 선택 시 즉시 가격 재계산
4. **에러 방지**: URL 유효성 검사로 잘못된 입력 방지
5. **간결성**: 핵심 정보만 표시, 세부 정보는 접힘

---

## 주의사항

### ❌ 하지 않는 것

- 쇼핑몰 계정 자동 로그인 연동 (아이디/비밀번호 노출 최소화를 위해 직접적인 자동 로그인 대신 브라우저 세션 공유 방식 활용)
- 실제 결제 처리
- 사용자 개인정보 수집

### ⚠️ 주의할 것

- 가격 수집 시 rate limiting 준수
- 캐싱으로 불필요한 요청 최소화
- 수집 실패 시 graceful degradation
- 외부 이미지는 `next.config.ts`의 `remotePatterns`에 도메인 추가 필요

---

## 관련 문서

- [PRD_FitLowPrice.md](file:///C:/Users/wntjd/.gemini/antigravity/brain/fb97589e-72c7-48a6-9888-8c3197b4b46/PRD_FitLowPrice.md) - 제품 요구사항 문서
- [walkthrough.md](file:///C:/Users/wntjd/.gemini/antigravity/brain/fb97589e-72c7-48a6-9888-8c3197b4b46/walkthrough.md) - MVP 구현 결과

---

## 개발 로드맵 및 체크리스트

> **예상 기간**: 4주
> **버전**: MVP 1.0
> **최종 업데이트**: 2026-02-21

### 진행 상태 범례

| 표시  | 상태                        |
| :---: | --------------------------- |
| `[ ]` | 대기 (To Do)                |
| `[/]` | 진행 중 (In Progress)       |
| `[x]` | 완료 (Done)                 |
| `[-]` | 보류/제외 (Blocked/Skipped) |

---

### 🗓️ Phase 1: 기획 및 설계 (Week 1)

#### 1.1 프로젝트 초기 설정

- [x] 프로젝트 디렉토리 구조 생성
  - [x] Next.js 프로젝트 초기화 (`npx create-next-app@latest`)
  - [x] TypeScript 설정 확인
  - [x] ESLint + Prettier 설정
  - [ ] `.gitignore` 구성
- [x] CLAUDE.md 파일 생성 (프로젝트 컨텍스트)
- [x] package.json 의존성 정의
  - [x] 핵심 라이브러리: React, Next.js, TypeScript
  - [x] UI 라이브러리 (shadcn/ui)
  - [x] 상태 관리 (Zustand)
  - [x] HTTP 클라이언트 (fetch)

#### 1.2 데이터베이스 설계

- [ ] Turso 프로젝트 생성
- [x] 테이블 스키마 설계
  - [x] `products` - 상품 정보
  - [x] `mall_prices` - 쇼핑몰별 가격
  - [x] `discount_rules` - 할인 규칙
  - [x] `search_logs` - 검색 기록 (선택적)
- [x] Prisma 스키마 작성 완료
- [ ] 초기 할인 규칙 데이터 시딩
  - [ ] 쿠팡 할인 규칙
  - [ ] 네이버 할인 규칙
  - [ ] 11번가 할인 규칙

#### 1.3 API 설계

- [x] API 엔드포인트 명세 작성
  - [x] `POST /api/products/search` - 상품 검색
  - [ ] `GET /api/products/[id]/prices` - 가격 비교
  - [x] `POST /api/calculate` - 최종가 계산
  - [ ] `GET /api/malls` - 쇼핑몰 목록
  - [ ] `GET /api/malls/[id]/discounts` - 쇼핑몰별 할인 규칙

#### 1.4 UI/UX 설계

- [x] 와이어프레임 작성
  - [x] 메인 페이지 (검색 입력)
  - [x] 결과 페이지 (가격 비교)
  - [x] 혜택 선택 인터페이스
- [x] 디자인 시스템 정의
  - [x] 컬러 팔레트 (Primary, Secondary, Status)
  - [x] 타이포그래피 (Font Family, Sizes)
  - [x] 스페이싱 규칙
  - [x] 컴포넌트 스타일 가이드

---

### 🖥️ Phase 2: 프론트엔드 개발 (Week 2)

#### 2.1 공통 컴포넌트

- [x] Layout 컴포넌트
  - [x] `Header` - 로고, 네비게이션
  - [x] `Footer` - 푸터 정보
  - [x] `Container` - 반응형 컨테이너
- [x] UI 컴포넌트
  - [x] `Button` - 기본, 아웃라인, 아이콘 버전
  - [x] `Input` - 텍스트 입력
  - [x] `Checkbox` - 체크박스
  - [x] `Card` - 카드 레이아웃
  - [x] `Badge` - 상태 뱃지 (최저가, 가격차이)
  - [x] `Skeleton` - 로딩 스켈레톤
  - [x] `Toast` - 알림 메시지 (Sonner)

#### 2.2 메인 페이지 (`/`)

- [x] 검색 섹션 구현
  - [x] URL 입력 필드
  - [x] 상품명 직접 입력 옵션
  - [x] 검색 버튼
  - [x] URL 유효성 검사 (쿠팡/네이버/11번가)
- [ ] 최근 검색 기록 표시 (로컬 스토리지)
- [x] 서비스 소개 섹션
  - [x] 사용 방법 3단계 안내
  - [x] 지원 쇼핑몰 로고

#### 2.3 가격 비교 페이지 (`/compare/[productId]`)

- [x] 상품 정보 헤더
  - [x] 상품 이미지
  - [x] 상품명
- [x] 쇼핑몰별 가격 카드
  - [x] 쇼핑몰 로고 + 이름
  - [x] 기본가
  - [x] 배송비
  - [x] 쿠폰/적립금 체크박스 목록
  - [x] 최종가 표시
  - [x] 가격차이 뱃지 ("최저가!" / "+3,200원")
  - [x] "구매하기" 버튼 (외부 링크)
- [x] 가격 정렬 (최종가 기준 자동)
- [x] 로딩 상태 처리
- [x] 에러 상태 처리

#### 2.4 반응형 디자인

- [x] 모바일 레이아웃 (320px ~ 767px)
- [x] 태블릿 레이아웃 (768px ~ 1023px)
- [x] 데스크톱 레이아웃 (1024px ~)

#### 2.5 상태 관리

- [x] 검색 상태 (검색어, 로딩, 에러)
- [x] 가격 데이터 상태
- [x] 선택된 혜택 상태 (쇼핑몰별)
- [x] 계산된 최종가 상태

---

### ⚙️ Phase 3: 백엔드 개발 및 수집 모듈 (Week 3)

#### 3.1 가격 수집 모듈 (Python 브라우저 세션 공유 방식)

- [x] 구현을 위한 파이썬(Python) 등 기초 환경 세팅 가이드 작성
  - [x] `scraper_engine/` 디렉토리 구조 생성
  - [x] `README.md` 작성 (상세 문서)
  - [x] `SETUP_GUIDE.md` 작성 (빠른 시작)
  - [x] `requirements.txt` 작성
  - [x] `.env` 환경변수 템플릿 생성
- [x] Python FastAPI 서버 구축
  - [x] `main.py` - FastAPI 엔트리포인트
  - [x] `config.py` - 환경 설정
  - [x] `models/schemas.py` - Pydantic 모델
  - [x] `driver/manager.py` - Selenium 드라이버 싱글톤
  - [x] `scrapers/base.py` - 추상 클래스
  - [x] `setup_profile.py` - 로그인 설정 스크립트
- [x] 쿠팡 가격 수집
  - [x] `scrapers/coupang.py` 구현
  - [x] 검색 URL 생성 및 페이지 로딩
  - [x] BeautifulSoup HTML 파싱
  - [x] 상품명, 가격, 이미지, URL 추출
  - [x] 기본 상품 정보 및 배송비 파싱
  - [ ] 와우 회원 전용가, 카드사 즉시 할인 파싱 (차후 개선)
- [x] 네이버 가격 수집
  - [x] `scrapers/naver.py` 구현
  - [x] 네이버 쇼핑 검색 페이지 로딩
  - [x] HTML 파싱 및 데이터 추출
  - [ ] 네이버 플러스 멤버십 적립률 파싱 (차후 개선)
- [x] 11번가 가격 수집
  - [x] `scrapers/elevenst.py` 구현
  - [x] 11번가 검색 페이지 로딩
  - [x] HTML 파싱 및 데이터 추출
  - [ ] T멤버십 할인/적립 파싱 (차후 개선)
- [x] TypeScript 클라이언트 구현
  - [x] `src/lib/scrapers/python-client.ts` 작성
  - [x] 헬스체크 함수
  - [x] 쿠팡/네이버/11번가 검색 함수
- [x] 기존 스크래퍼 수정
  - [x] `coupang.ts` - Python 서버 우선 호출
  - [x] `naver.ts` - Python 서버 우선 호출
  - [x] `elevenst.ts` - Python 서버 우선 호출
  - [x] Fallback 로직 구현 (Mock 데이터)
- [ ] 수집 결과 캐싱 (1시간 TTL) - 차후 개선

#### 3.2 상품 검색 API

- [x] `POST /api/products/search` 구현
  - [x] URL 파싱 → 쇼핑몰 식별
  - [x] 상품 정보 수집 (Mock)
  - [x] 타 쇼핑몰 동일 상품 매칭 (Mock)
  - [x] 응답 포맷 정의

#### 3.3 가격 계산 API

- [x] `POST /api/calculate` 구현
  - [x] 요청 파라미터 정의
  - [x] 할인 규칙 적용 로직
    - [x] 퍼센트 할인 계산
    - [x] 정액 할인 계산
    - [x] 최대 할인 한도 적용
    - [x] 복수 할인 중첩 처리
  - [x] 최종가 계산 및 정렬
  - [ ] 응답 포맷 최종 검증

#### 3.4 할인 규칙 API

- [ ] `GET /api/malls` - 쇼핑몰 목록 반환
- [ ] `GET /api/malls/[id]/discounts` - 할인 규칙 반환
- [ ] 할인 규칙 데이터 구조 확정

#### 3.5 에러 핸들링 & 로깅

- [ ] API 에러 응답 표준화
- [ ] 가격 수집 실패 시 fallback 처리
- [ ] 로깅 미들웨어 구현 (선택적)

---

### 🧪 Phase 4: 테스트 및 배포 (Week 4)

#### 4.1 테스트

- [ ] 단위 테스트
  - [ ] 가격 계산 로직 테스트
  - [ ] URL 파싱 테스트
  - [ ] 할인 규칙 적용 테스트
- [ ] 통합 테스트
  - [ ] API 엔드포인트 테스트
  - [ ] 가격 수집 → 계산 플로우 테스트
- [ ] E2E 테스트 (선택적)
  - [ ] 전체 사용자 플로우 테스트
- [ ] 수동 테스트
  - [ ] 실제 쇼핑몰 URL로 테스트
  - [ ] 다양한 상품 테스트 (가전, 의류, 식품 등)

#### 4.2 성능 최적화

- [ ] 이미지 최적화 (Next.js Image)
- [ ] API 응답 캐싱
- [ ] 코드 스플리팅
- [ ] Lighthouse 점수 확인 (목표: 90+)

#### 4.3 배포

- [x] Netlify 배포 설정 (netlify.toml)
- [ ] 환경 변수 설정
  - [ ] `TURSO_DATABASE_URL`
  - [ ] `TURSO_AUTH_TOKEN`
  - [ ] 기타 API 키 (필요시)
- [ ] 도메인 설정 (선택적)
- [ ] 프로덕션 배포
- [ ] 배포 후 스모크 테스트

#### 4.4 사용자 테스트

- [ ] 테스트 사용자 5~10명 모집
- [ ] 테스트 시나리오 작성
  1. 쿠팡 URL 입력 → 가격 비교
  2. 쿠폰 선택 → 최종가 확인
  3. 최저가 쇼핑몰로 이동
- [ ] 피드백 수집
- [ ] 주요 이슈 수정

---

## 📊 성공 지표

### 정량 지표

- [ ] 검색 → 쇼핑몰 이동 전환율 50% 이상
- [ ] API 응답 시간 3초 이내
- [ ] 에러율 5% 미만

### 정성 지표

- [ ] "여기서 보고 가면 마음이 편하다" 피드백 확인
- [ ] "귀찮은 거 한 번 줄었다" 피드백 확인

---

## 🚨 리스크 관리

### 기술적 리스크

- [ ] 쇼핑몰 가격 수집 차단 대응책 마련
  - [ ] 캐싱 전략 적용
  - [ ] 수집 주기 조정 (rate limiting)
- [ ] 동일 상품 매칭 실패 대응책 마련
  - [ ] 수동 매핑 fallback
  - [ ] 사용자에게 "매칭 불가" 안내

### 법적 리스크

- [ ] 법적 리스크 검토
  - [ ] 공개 정보만 활용 확인
  - [ ] 로봇 배제 표준 준수 확인

---

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000 접속
```

### 테스트 시나리오

1. 메인 페이지에서 아무 텍스트 입력 → 검색
2. /compare 페이지에서 할인 체크박스 토글 → 가격 변동 확인
3. "최저가" 쇼핑몰 확인 → 외부 링크 클릭
