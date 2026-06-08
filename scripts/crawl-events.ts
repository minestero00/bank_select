/**
 * 이벤트·특판 금리 크롤러
 *
 * 대상: vyomakesa.com (매일 갱신되는 은행별 정기예금 비교표)
 * 목적: FSS API에 없는 특판·이벤트 상품 보완 수집
 * 실행: node --env-file=.env.local --import=tsx scripts/crawl-events.ts
 */

import fs from "fs";
import path from "path";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const DELAY_MS = 2000;

interface EventProduct {
  id: string;
  bank: string;
  bankCode: string;
  productName: string;
  productType: "deposit" | "savings";
  baseRate: number;
  maxRate: number;
  preferentialConditions: string[];
  minAmount: number;
  maxAmount: number | null;
  termMonths: number[];
  joinMethod: ("online" | "offline" | "app")[];
  isEvent: boolean;
  eventPeriod?: string;
  highlight?: string;
  lastUpdated: string;
  sourceUrl: string;
}

async function fetchWithHeaders(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "ko-KR,ko;q=0.9",
      "Referer": "https://www.google.com",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function parseRate(text: string): number {
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

function slugify(bank: string, product: string): string {
  return `crawled_${bank.replace(/[^가-힣a-zA-Z0-9]/g, "")}_${Date.now()}`;
}

/**
 * vyomakesa.com에서 정기예금 비교표 파싱
 * 페이지 구조: 은행명 | 상품명 | 기본금리 | 최고금리 | 우대조건 테이블
 */
async function crawlVyomakesa(): Promise<EventProduct[]> {
  const url = "https://vyomakesa.com/%EA%B8%88%EC%9C%B5%EA%B8%B0%EA%B4%80%EB%B3%84-%EC%A0%95%EA%B8%B0%EC%98%88%EA%B8%88-best-10/";
  console.log(`  vyomakesa.com 크롤링 중...`);

  try {
    const html = await fetchWithHeaders(url);
    const products: EventProduct[] = [];

    // 테이블 행 파싱 (정규식 기반 — Playwright 없이 서버리스 환경용)
    const tableRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").trim();

    let rowMatch;
    while ((rowMatch = tableRowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[1];
      const cells: string[] = [];
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        cells.push(stripTags(cellMatch[1]));
      }

      if (cells.length >= 4) {
        const bank = cells[0];
        const product = cells[1];
        const baseRate = parseRate(cells[2]);
        const maxRate = parseRate(cells[3]);
        const conditions = cells[4] ? cells[4].split(/[,·]/).map((s) => s.trim()).filter(Boolean) : [];

        if (bank && product && maxRate > 0 && maxRate > 3.5) {
          products.push({
            id: slugify(bank, product),
            bank,
            bankCode: "CRAWLED",
            productName: product,
            productType: "deposit",
            baseRate,
            maxRate,
            preferentialConditions: conditions,
            minAmount: 0,
            maxAmount: null,
            termMonths: [12],
            joinMethod: ["online", "offline", "app"],
            isEvent: true,
            highlight: `vyomakesa.com 수집 — 가입 전 은행 공식 사이트 확인 필요`,
            lastUpdated: new Date().toISOString(),
            sourceUrl: url,
          });
        }
      }
    }

    console.log(`  vyomakesa.com: ${products.length}개 상품 수집`);
    return products;
  } catch (err) {
    console.warn(`  vyomakesa.com 크롤링 실패:`, err);
    return [];
  }
}

/**
 * 금융결제원 청년미래적금 정보 (정적 — 모집 기간 종료 시 제거)
 */
function getYouthSavingsProduct(): EventProduct {
  return {
    id: "gov_youth_2026",
    bank: "15개 은행 참여",
    bankCode: "GOV",
    productName: "청년미래적금",
    productType: "savings",
    baseRate: 5.00,
    maxRate: 8.00,
    preferentialConditions: [
      "만 19~34세 (군필자 최대 만 40세)",
      "총급여 7,500만원 이하",
      "정부기여금 6~12% 별도 지급",
      "이자소득세 전액 면제",
    ],
    minAmount: 0,
    maxAmount: 500000,
    termMonths: [36],
    joinMethod: ["app"],
    isEvent: true,
    eventPeriod: "2026-06-22 ~ 2026-07-03 (1차)",
    highlight: "정부지원 + 비과세 — 청년 최고 혜택 상품",
    lastUpdated: new Date().toISOString(),
    sourceUrl: "https://www.tossbank.com/articles/youth-grow-up-account",
  };
}

async function main() {
  console.log("이벤트·특판 데이터 수집 시작...\n");

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  // 기존 events.json 읽기 (수동 등록 항목 보존)
  const eventsPath = path.join(dataDir, "events.json");
  let existingManual: EventProduct[] = [];
  if (fs.existsSync(eventsPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(eventsPath, "utf-8")) as EventProduct[];
      // bankCode가 GOV 또는 수동 등록 항목만 유지
      existingManual = existing.filter(
        (p) => p.bankCode === "GOV" || !p.id.startsWith("crawled_")
      );
    } catch {
      existingManual = [];
    }
  }

  await new Promise((r) => setTimeout(r, DELAY_MS));
  const crawled = await crawlVyomakesa();

  // 중복 제거: 같은 은행+상품명 기준
  const seen = new Set(existingManual.map((p) => `${p.bank}_${p.productName}`));
  const fresh = crawled.filter((p) => !seen.has(`${p.bank}_${p.productName}`));

  const merged = [getYouthSavingsProduct(), ...existingManual.filter((p) => p.id !== "gov_youth_2026"), ...fresh];

  fs.writeFileSync(eventsPath, JSON.stringify(merged, null, 2));
  console.log(`\n이벤트 상품 저장 완료: ${merged.length}개`);
  console.log(`  - 고정 등록: ${existingManual.length}개`);
  console.log(`  - 크롤링 신규: ${fresh.length}개`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
