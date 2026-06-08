# BankSelect — 설계 문서

## 1. 서비스 개요

사용자의 재무 상황과 라이프스타일을 입력받아, 한국의 은행 상품 중 최적의 조합을 추천하는 알고리즘 기반 웹 서비스.

---

## 2. Input 설계

### 2-1. 재무 정보 (필수)

| 항목 | 설명 | 타입 |
|---|---|---|
| 보유 현금/자산 | 현재 보유 현금 (예: 1,000만원) | number (만원 단위) |
| 월 소득 | 세후 월 소득 | number |
| 월 고정 지출 | 월세, 보험료, 구독료 등 | number |
| 월 변동 지출 | 식비, 교통, 여가 등 | number |
| 비상금 유무 | 3~6개월치 생활비 확보 여부 | boolean |

### 2-2. 목표 정보 (필수)

| 항목 | 설명 | 타입 |
|---|---|---|
| 주 목표 | 저축 / 투자 / 대출 상환 / 내 집 마련 / 노후 준비 | enum |
| 목표 금액 | 달성하려는 금액 | number |
| 목표 기간 | 단기(1년 이내) / 중기(1~3년) / 장기(3년 이상) | enum |

### 2-3. 라이프스타일 정보 (선택)

| 항목 | 설명 | 타입 |
|---|---|---|
| 나이 | 만 나이 | number |
| 직업 유형 | 직장인 / 자영업 / 프리랜서 / 학생 / 주부 / 은퇴 | enum |
| 투자 성향 | 안정형 / 안정추구형 / 위험중립형 / 적극투자형 | enum |
| 청약 관심 | 주택청약 관심 여부 | boolean |
| 선호 채널 | 온라인/비대면 선호 / 오프라인(영업점) 선호 | enum |

### 2-4. 현재 거래 정보 (선택)

| 항목 | 설명 | 타입 |
|---|---|---|
| 현재 사용 은행 목록 | 주거래 은행 및 보조 거래 은행 | string[] |
| 현재 보유 상품 | 예금, 적금, 대출, 카드 등 | string[] |
| 대출 잔액 | 현재 대출 잔액 (있다면) | number |
| 대출 금리 | 현재 대출 금리 (있다면) | number |

---

## 3. Output 설계

### Top 3 추천 결과

각 추천 항목에 포함될 내용:

```
1. 추천 은행명
2. 추천 상품명 및 유형 (예금/적금/대출/청약)
3. 추천 이유 (사용자 조건과의 매칭 근거)
4. 주요 조건 요약 (금리, 기간, 한도)
5. 예상 이자/수익 (사용자 자산 기준 시뮬레이션)
6. 공식 링크
```

### 부가 출력

- 현재 거래 은행과의 비교 분석
- 우대금리 조건 충족 여부 체크리스트
- "이런 사람에게 추천해요" 요약 카드

---

## 4. 데이터 수집 전략 (크롤링)

### 4-1. 주요 데이터 소스

#### A. 금융감독원 금융상품통합비교공시 (finlife.fss.or.kr)

- **공식 Open API 제공** (가장 안정적, 법적 문제 없음)
- API 키 발급: https://finlife.fss.or.kr/dev/intro.do
- 제공 데이터:
  - 예금/적금 상품 목록 및 금리
  - 대출 상품 목록 및 금리
  - 은행별 상품 비교 데이터
- 갱신 주기: 은행이 변경 시 실시간 반영

```
API 엔드포인트 예시:
GET /finlifeApi/depositProductsSearch.json  (예금)
GET /finlifeApi/savingProductsSearch.json   (적금)
GET /finlifeApi/mortgageLoanProductsSearch.json (주택담보대출)
```

#### B. 은행 공식 웹사이트 크롤링 (보조)

FSS API에 없는 상세 정보 수집용:
- 우대금리 조건 상세
- 이벤트/한정 상품
- 카드 혜택 연계 정보

| 은행 | 도메인 | 주요 수집 경로 |
|---|---|---|
| KB국민은행 | kbstar.com | /fintech/deposit/list |
| 신한은행 | shinhan.com | /savings |
| 하나은행 | hanabank.com | /savings |
| 우리은행 | wooribank.com | /savings |
| NH농협은행 | nhbank.com | /savings |
| 카카오뱅크 | kakaobank.com | /savings |
| 토스뱅크 | tossbank.com | /savings |
| 케이뱅크 | kbank.co.kr | /savings |

#### C. 금융위원회 공공데이터 (data.fss.or.kr)

- 은행 기본 정보 (지점, 인가 현황 등)
- 금융회사 목록

### 4-2. 크롤링 기술 스택

```
1. 1차 수집 (정형 데이터): FSS Open API → JSON 파싱
2. 2차 수집 (비정형/JS 렌더링): Playwright (Node.js)
   - 은행 웹사이트 대부분이 SPA/React 기반 → headless browser 필요
3. 파싱: Cheerio (정적 HTML), Playwright (동적)
4. 스케줄링: node-cron (매일 새벽 2시 자동 실행)
5. 저장: JSON 파일 → 추후 DB 전환 가능
```

### 4-3. 크롤링 파이프라인

```
[스케줄러 실행 (매일 02:00)]
        ↓
[FSS API 호출] → [예금/적금/대출 전체 목록 수집]
        ↓
[은행별 웹사이트 크롤링] → [우대금리 조건, 특이사항 수집]
        ↓
[데이터 정규화] → [은행명/상품명/금리/조건 표준화]
        ↓
[중복 제거 + 변경 감지]
        ↓
[JSON/DB 저장]
        ↓
[추천 엔진 데이터 갱신]
```

### 4-4. 데이터 스키마 (정규화 후)

```typescript
interface BankProduct {
  id: string;
  bank: string;           // "KB국민은행"
  bankCode: string;       // "0001"
  productName: string;    // "KB Star 정기예금"
  productType: "deposit" | "savings" | "loan" | "subscription";
  baseRate: number;       // 기본금리 (%)
  maxRate: number;        // 최고금리 (우대 포함)
  preferentialConditions: string[]; // 우대금리 조건 목록
  minAmount: number;      // 최소 가입금액
  maxAmount: number | null;
  termMonths: number[];   // 가입 가능 기간 (개월)
  targetAudience: string[]; // "직장인", "학생" 등
  joinMethod: ("online" | "offline" | "app")[];
  lastUpdated: string;    // ISO date
  sourceUrl: string;
}
```

### 4-5. 크롤링 시 주의사항

- **robots.txt 확인** 필수 — 허용된 경로만 크롤링
- **요청 간격 최소 2~3초** 유지 (서버 부하 방지)
- User-Agent에 서비스 정보 명시
- FSS API는 일일 호출 횟수 제한 있음 (키 발급 후 확인)
- 은행 웹사이트는 로그인 필요 상품 제외 (공개 정보만)

---

## 5. 추천 알고리즘 개요

### 점수 계산 방식 (가중치 기반)

```
총점 = Σ(항목 점수 × 가중치)

항목별 가중치:
- 금리 우위           : 35%
- 목표 기간 매칭      : 25%
- 우대조건 충족 여부  : 20%
- 가입 채널 선호도    : 10%
- 나이/직업 타겟 매칭 : 10%
```

### 필터 조건

1. 사용자 최소 가입 금액 충족 여부
2. 목표 기간과 상품 만기 일치 여부
3. 온/오프라인 채널 필터
4. 청약 관심 있을 경우 청약 상품 우선 포함

---

## 6. 개발 로드맵

| 단계 | 내용 | 예상 기간 |
|---|---|---|
| Phase 1 | FSS API 연동 + 데이터 수집 파이프라인 | 1주 |
| Phase 2 | 데이터 정규화 + JSON 스토어 구축 | 3일 |
| Phase 3 | 추천 알고리즘 구현 | 1주 |
| Phase 4 | 프론트엔드 (입력 폼 + 결과 페이지) | 1주 |
| Phase 5 | GitHub Pages 배포 + 자동 데이터 갱신 (Actions) | 3일 |

---

## 7. 기술 스택 제안

- **프론트엔드**: Next.js (App Router) + Tailwind CSS
- **데이터 수집**: Node.js + Playwright + node-cron
- **데이터 저장**: JSON 파일 (정적) 또는 Supabase (동적)
- **배포**: GitHub Pages (정적) 또는 Vercel (동적 추천 API 포함)
- **자동화**: GitHub Actions (데이터 크롤링 스케줄 실행)
