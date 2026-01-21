# FitLowPrice 개발 TODO

> **프로젝트**: FitLowPrice - 결정 피로 제거 서비스  
> **버전**: MVP 1.0  
> **예상 기간**: 4주  
> **최종 수정**: 2026-01-20

---

## 📋 개요

이 문서는 FitLowPrice MVP 개발을 위한 상세 태스크 체크리스트입니다.
PRD 기반으로 작성되었으며, Claude Code 에이전트와 협업 시 참조됩니다.

### 진행 상태 범례

| 표시  | 상태                        |
| :---: | --------------------------- |
| `[ ]` | 대기 (To Do)                |
| `[/]` | 진행 중 (In Progress)       |
| `[x]` | 완료 (Done)                 |
| `[-]` | 보류/제외 (Blocked/Skipped) |

---

## 🗓️ Phase 1: 기획 및 설계 (Week 1)

### 1.1 프로젝트 초기 설정

- [x] 프로젝트 디렉토리 구조 생성
  - [x] Next.js 프로젝트 초기화 (`npx create-next-app@latest`)
  - [x] TypeScript 설정 확인
  - [x] ESLint + Prettier 설정
  - [ ] `.gitignore` 구성
- [x] CLAUDE.md 파일 생성 (프로젝트 컨텍스트)
- [x] package.json 의존성 정의
  - [x] 핵심 라이브러리: React, Next.js, TypeScript
  - [x] UI 라이브러리 선정 (예: shadcn/ui, Radix)
  - [x] 상태 관리 (Zustand 또는 Jotai)
  - [x] HTTP 클라이언트 (axios 또는 fetch)

### 1.2 데이터베이스 설계

- [ ] Supabase 프로젝트 생성
- [x] 테이블 스키마 설계
  - [x] `products` - 상품 정보
    ```sql
    id, name, image_url, category, created_at
    ```
  - [x] `mall_prices` - 쇼핑몰별 가격
    ```sql
    id, product_id, mall_name, base_price, shipping_fee, product_url, fetched_at
    ```
  - [x] `discount_rules` - 할인 규칙
    ```sql
    id, mall_name, rule_type, rule_name, discount_type, discount_value, max_discount, conditions
    ```
  - [x] `search_logs` - 검색 기록 (선택적)
    ```sql
    id, session_id, product_name, searched_at
    ```
- [x] Row Level Security (RLS) 정책 설정
- [x] 초기 할인 규칙 데이터 시딩
  - [x] 쿠팡 할인 규칙
  - [x] 네이버 할인 규칙
  - [x] 11번가 할인 규칙

### 1.3 API 설계

- [x] API 엔드포인트 명세 작성
  - [x] `POST /api/products/search` - 상품 검색
  - [ ] `GET /api/products/[id]/prices` - 가격 비교
  - [x] `POST /api/calculate` - 최종가 계산
  - [ ] `GET /api/malls` - 쇼핑몰 목록
  - [ ] `GET /api/malls/[id]/discounts` - 쇼핑몰별 할인 규칙

### 1.4 UI/UX 설계

- [x] 와이어프레임 작성
  - [x] 메인 페이지 (검색 입력)
  - [x] 결과 페이지 (가격 비교)
  - [x] 혜택 선택 모달
- [x] 디자인 시스템 정의
  - [x] 컬러 팔레트 (Primary, Secondary, Status)
  - [x] 타이포그래피 (Font Family, Sizes)
  - [x] 스페이싱 규칙
  - [x] 컴포넌트 스타일 가이드

---

## 🖥️ Phase 2: 프론트엔드 개발 (Week 2)

### 2.1 공통 컴포넌트

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
  - [x] `Toast` - 알림 메시지

### 2.2 메인 페이지 (`/`)

- [x] 검색 섹션 구현
  - [x] URL 입력 필드
  - [x] 상품명 직접 입력 옵션
  - [x] 검색 버튼
  - [x] URL 유효성 검사 (쿠팡/네이버/11번가)
- [ ] 최근 검색 기록 표시 (로컬 스토리지)
- [x] 서비스 소개 섹션
  - [x] 사용 방법 3단계 안내
  - [x] 지원 쇼핑몰 로고

### 2.3 가격 비교 페이지 (`/compare/[productId]`)

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

### 2.4 반응형 디자인

- [x] 모바일 레이아웃 (320px ~ 767px)
- [x] 태블릿 레이아웃 (768px ~ 1023px)
- [x] 데스크톱 레이아웃 (1024px ~)

### 2.5 상태 관리

- [x] 검색 상태 (검색어, 로딩, 에러)
- [x] 가격 데이터 상태
- [x] 선택된 혜택 상태 (쇼핑몰별)
- [x] 계산된 최종가 상태

---

## ⚙️ Phase 3: 백엔드 개발 (Week 3)

### 3.1 가격 수집 모듈

- [/] 쿠팡 가격 수집
  - [ ] URL에서 상품 ID 추출
  - [x] 상품 정보 파싱 (이름, 가격, 이미지) (Mock)
  - [x] 배송비 정보 파싱 (Mock)
  - [ ] 에러 핸들링 (rate limit, 차단)
- [/] 네이버 가격 수집
  - [ ] 네이버 쇼핑 검색 API 활용
  - [ ] 상품 매칭 로직
  - [x] 가격 정보 추출 (Mock)
- [/] 11번가 가격 수집
  - [ ] URL에서 상품 ID 추출
  - [x] 상품 정보 파싱 (Mock)
  - [x] 가격 정보 추출 (Mock)
- [ ] 수집 결과 캐싱 (1시간 TTL)

### 3.2 상품 검색 API

- [x] `POST /api/products/search` 구현
  - [x] URL 파싱 → 쇼핑몰 식별
  - [x] 상품 정보 수집 (Mock)
  - [x] 타 쇼핑몰 동일 상품 매칭 (Mock)
  - [x] 응답 포맷 정의
    ```json
    {
      "product": { "id", "name", "image" },
      "prices": [
        { "mall", "basePrice", "shippingFee", "url" }
      ]
    }
    ```

### 3.3 가격 계산 API

- [x] `POST /api/calculate` 구현
  - [x] 요청 파라미터 정의
    ```json
    {
      "productId": "string",
      "discounts": [
        { "mall": "coupang", "rules": ["wow_member", "first_purchase"] }
      ]
    }
    ```
  - [x] 할인 규칙 적용 로직
    - [x] 퍼센트 할인 계산
    - [x] 정액 할인 계산
    - [x] 최대 할인 한도 적용
    - [x] 복수 할인 중첩 처리
  - [x] 최종가 계산 및 정렬
  - [ ] 응답 포맷 정의
    ```json
    {
      "results": [
        {
          "mall": "naver",
          "finalPrice": 323000,
          "savings": 5000,
          "breakdown": { ... }
        }
      ],
      "cheapest": "naver"
    }
    ```

### 3.4 할인 규칙 API

- [ ] `GET /api/malls` - 쇼핑몰 목록 반환
- [ ] `GET /api/malls/[id]/discounts` - 할인 규칙 반환
- [ ] 할인 규칙 데이터 구조
  ```typescript
  interface DiscountRule {
    id: string;
    mallName: string;
    ruleType: "coupon" | "point" | "membership";
    ruleName: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    maxDiscount?: number;
    conditions?: string;
  }
  ```

### 3.5 에러 핸들링 & 로깅

- [ ] API 에러 응답 표준화
- [ ] 가격 수집 실패 시 fallback 처리
- [ ] 로깅 미들웨어 구현 (선택적)

---

## 🧪 Phase 4: 테스트 및 배포 (Week 4)

### 4.1 테스트

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

### 4.2 성능 최적화

- [ ] 이미지 최적화 (Next.js Image)
- [ ] API 응답 캐싱
- [ ] 코드 스플리팅
- [ ] Lighthouse 점수 확인 (목표: 90+)

### 4.3 배포

- [ ] Vercel 프로젝트 연결
- [ ] 환경 변수 설정
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] 기타 API 키 (필요시)
- [ ] 도메인 설정 (선택적)
- [ ] 프로덕션 배포
- [ ] 배포 후 스모크 테스트

### 4.4 사용자 테스트

- [ ] 테스트 사용자 5~10명 모집
- [ ] 테스트 시나리오 작성
  1. 쿠팡 URL 입력 → 가격 비교
  2. 쿠폰 선택 → 최종가 확인
  3. 최저가 쇼핑몰로 이동
- [ ] 피드백 수집
- [ ] 주요 이슈 수정

---

## 📊 성공 지표 체크리스트

### 정량 지표

- [ ] 검색 → 쇼핑몰 이동 전환율 50% 이상
- [ ] API 응답 시간 3초 이내
- [ ] 에러율 5% 미만

### 정성 지표

- [ ] "여기서 보고 가면 마음이 편하다" 피드백 확인
- [ ] "귀찮은 거 한 번 줄었다" 피드백 확인

---

## 🚨 리스크 체크리스트

- [ ] 쇼핑몰 가격 수집 차단 대응책 마련
  - [ ] 캐싱 전략 적용
  - [ ] 수집 주기 조정 (rate limiting)
- [ ] 동일 상품 매칭 실패 대응책 마련
  - [ ] 수동 매핑 fallback
  - [ ] 사용자에게 "매칭 불가" 안내
- [ ] 법적 리스크 검토
  - [ ] 공개 정보만 활용 확인

---

## 📁 프로젝트 구조 (예상)

```
fitlowprice/
├── .claude/
│   └── CLAUDE.md          # Claude 에이전트 컨텍스트
├── src/
│   ├── app/
│   │   ├── page.tsx       # 메인 페이지
│   │   ├── compare/
│   │   │   └── [productId]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── products/
│   │       │   └── search/
│   │       │       └── route.ts
│   │       ├── calculate/
│   │       │   └── route.ts
│   │       └── malls/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/            # 기본 UI 컴포넌트
│   │   ├── layout/        # 레이아웃 컴포넌트
│   │   └── features/      # 기능별 컴포넌트
│   ├── lib/
│   │   ├── supabase.ts    # Supabase 클라이언트
│   │   ├── scrapers/      # 가격 수집 모듈
│   │   │   ├── coupang.ts
│   │   │   ├── naver.ts
│   │   │   └── elevenst.ts
│   │   └── calculator.ts  # 가격 계산 로직
│   ├── types/
│   │   └── index.ts       # 타입 정의
│   └── store/
│       └── index.ts       # 상태 관리
├── public/
│   └── images/
│       └── malls/         # 쇼핑몰 로고
├── package.json
├── tsconfig.json
├── 개발TODO.md            # 이 파일
└── README.md
```

---

## 📝 참고 문서

- [PRD_FitLowPrice.md](file:///C:/Users/wntjd/.gemini/antigravity/brain/fb97589e-72c7-48a6-9888-8c3197b4b4d6/PRD_FitLowPrice.md) - 제품 요구사항 문서
- [Claude Code Memory Best Practices](https://docs.anthropic.com/en/docs/claude-code/memory) - CLAUDE.md 작성 가이드

---

## 변경 이력

|    날짜    | 변경 내용 |
| :--------: | --------- |
| 2026-01-20 | 초안 작성 |
