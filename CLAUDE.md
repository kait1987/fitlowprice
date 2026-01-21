# FitLowPrice - 프로젝트 컨텍스트

> 이 파일은 Claude Code 에이전트가 프로젝트를 이해하기 위한 컨텍스트 문서입니다.
>
> **참고 리소스**:
>
> - [SkillsCokac](https://skills.cokac.com/) - Claude Code Skills 커뮤니티
> - [SkillsMP](https://skillsmp.com/) - Agent Skills 마켓플레이스

---

## 프로젝트 개요

**FitLowPrice**는 사용자가 쇼핑몰별 쿠폰/적립금을 고려한 **실제 최저가**를 한 눈에 비교할 수 있는 서비스입니다.

### 핵심 가치

- ❌ 단순 가격 비교 서비스가 아님
- ⭕ **"결정 피로 제거 서비스"** - 사용자가 "손해 보지 않았다"는 확신을 얻는 것이 목표

### 타겟 사용자

- 29세 직장인, 여러 쇼핑몰 계정 보유
- 쿠폰/적립금 관리가 귀찮음
- "대충 싼 것 같은 곳"에서 구매하는 습관

---

## 기술 스택

| 계층          | 기술                         |
| ------------- | ---------------------------- |
| **Framework** | Next.js 16 (App Router)      |
| **Language**  | TypeScript (Strict Mode)     |
| **Database**  | Turso (Cloud SQLite)         |
| **Styling**   | Tailwind CSS + shadcn/ui     |
| **State**     | Zustand (persist middleware) |
| **Deploy**    | Netlify                      |

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
├── CLAUDE.md                   # 이 파일
├── 개발TODO.md                 # 개발 태스크 체크리스트
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

## 지원 쇼핑몰

| Mall ID    | 이름       | 주요 할인 혜택            |
| ---------- | ---------- | ------------------------- |
| `coupang`  | 쿠팡       | 로켓와우, 첫 구매 쿠폰    |
| `naver`    | 네이버쇼핑 | 네이버페이, 플러스 멤버십 |
| `elevenst` | 11번가     | SK pay, 우주패스, 십일절  |

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

- 쇼핑몰 계정 자동 로그인/연동
- 실제 결제 처리
- 사용자 개인정보 수집

### ⚠️ 주의할 것

- 가격 수집 시 rate limiting 준수
- 캐싱으로 불필요한 요청 최소화
- 수집 실패 시 graceful degradation
- 외부 이미지는 `next.config.ts`의 `remotePatterns`에 도메인 추가 필요

---

## 관련 문서

- [개발TODO.md](./개발TODO.md) - 개발 태스크 체크리스트
- [PRD_FitLowPrice.md](file:///C:/Users/wntjd/.gemini/antigravity/brain/fb97589e-72c7-48a6-9888-8c3197b4b4d6/PRD_FitLowPrice.md) - 제품 요구사항 문서
- [walkthrough.md](file:///C:/Users/wntjd/.gemini/antigravity/brain/fb97589e-72c7-48a6-9888-8c3197b4b4d6/walkthrough.md) - MVP 구현 결과

---

## 현재 상태 (2026-01-21 업데이트)

### 완료됨 ✅

- [x] PRD 작성 완료
- [x] 개발TODO.md 작성 완료
- [x] CLAUDE.md 작성 완료
- [x] 프로젝트 초기화 (Next.js 16 + TypeScript + Tailwind)
- [x] shadcn/ui 컴포넌트 설치 (Button, Input, Card, Badge, Skeleton, Checkbox, Sonner)
- [x] Zustand 상태 관리 설정
- [x] 메인 페이지 (SearchSection) 구현
- [x] 가격 비교 페이지 (PriceCard) 구현
- [x] API 라우트 구현 (/products/search, /calculate)
- [x] Scraper 인터페이스 및 Mock 구현
- [x] 빌드 성공 (`npm run build` PASS)

### 진행 중 🚧

- [/] 실제 Scraper 로직 구현 (현재 Mock)
- [x] Turso (Cloud SQLite) + Prisma 연결 설정 완료
- [x] Netlify 배포 설정 완료 (netlify.toml)

### 다음 단계 📋

- [ ] Turso 계정 생성 및 DB 생성 (https://turso.tech)
- [ ] 실제 쇼핑몰 크롤링 로직 구현
- [ ] 검색 결과 캐싱 (Turso)
- [ ] 최근 검색 기록 (로컬 스토리지)
- [ ] Netlify 배포

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
