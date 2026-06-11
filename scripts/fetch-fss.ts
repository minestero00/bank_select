import fs from "fs";
import path from "path";
import type {
  BankProduct,
  FssDepositProduct,
  FssDepositOption,
  FssMortgageProduct,
  FssMortgageOption,
  FssApiResponse,
} from "./types";

const API_KEY = process.env.FINLIFE_API_KEY;
const BASE_URL = "https://finlife.fss.or.kr/finlifeApi";
const FIN_GRP_NO = "020000"; // 은행

if (!API_KEY) {
  console.error("FINLIFE_API_KEY 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}

function parseJoinMethod(joinWay: string): ("online" | "offline" | "app")[] {
  const methods: ("online" | "offline" | "app")[] = [];
  if (joinWay.includes("인터넷")) methods.push("online");
  if (joinWay.includes("영업점") || joinWay.includes("방문")) methods.push("offline");
  if (joinWay.includes("스마트폰") || joinWay.includes("앱") || joinWay.includes("모바일")) methods.push("app");
  if (methods.length === 0) methods.push("offline");
  return methods;
}

function parsePreferentialConditions(spcl_cnd: string): string[] {
  if (!spcl_cnd || spcl_cnd.trim() === "") return [];
  return spcl_cnd
    .split(/[,·\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 100);
}

async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let pageNo = 1;
  let maxPage = 1;

  do {
    const url = `${BASE_URL}/${endpoint}?auth=${API_KEY}&topFinGrpNo=${FIN_GRP_NO}&pageNo=${pageNo}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BankSelect/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${endpoint}`);

    const text = await res.text();
    if (!text.trim().startsWith("{")) {
      throw new Error(`Non-JSON response from ${endpoint}: ${text.slice(0, 300)}`);
    }
    const json = JSON.parse(text) as FssApiResponse<T>;
    const result = json.result;

    if (result.err_cd !== "000") {
      console.warn(`API 오류: ${result.err_msg}`);
      break;
    }

    results.push(...result.baseList);
    maxPage = parseInt(result.max_page_no, 10);
    pageNo++;

    if (pageNo <= maxPage) await new Promise((r) => setTimeout(r, 500));
  } while (pageNo <= maxPage);

  return results;
}

async function fetchDepositProducts(type: "deposit" | "savings"): Promise<BankProduct[]> {
  const endpoint =
    type === "deposit" ? "depositProductsSearch.json" : "savingProductsSearch.json";

  console.log(`  ${type === "deposit" ? "예금" : "적금"} 수집 중...`);
  const baseList = await fetchAllPages<FssDepositProduct>(endpoint);

  const optionRes = await fetch(
    `${BASE_URL}/${endpoint}?auth=${API_KEY}&topFinGrpNo=${FIN_GRP_NO}&pageNo=1`
  );
  const optionJson = (await optionRes.json()) as { result: { optionList: FssDepositOption[] } };
  const optionList: FssDepositOption[] = optionJson.result.optionList ?? [];

  const products: BankProduct[] = [];

  for (const item of baseList) {
    const options = optionList.filter(
      (o) => o.fin_co_no === item.fin_co_no && o.fin_prdt_cd === item.fin_prdt_cd
    );

    if (options.length === 0) continue;

    const baseRate = Math.min(...options.map((o) => o.intr_rate ?? 0));
    const maxRate = Math.max(...options.map((o) => o.intr_rate2 ?? o.intr_rate ?? 0));
    const termMonths = [...new Set(options.map((o) => parseInt(o.save_trm, 10)))].sort(
      (a, b) => a - b
    );

    products.push({
      id: `${item.fin_co_no}_${item.fin_prdt_cd}`,
      bank: item.kor_co_nm,
      bankCode: item.fin_co_no,
      productName: item.fin_prdt_nm,
      productType: type,
      baseRate,
      maxRate,
      preferentialConditions: parsePreferentialConditions(item.spcl_cnd),
      minAmount: 0,
      maxAmount: item.max_limit ? parseInt(item.max_limit.replace(/[^0-9]/g, ""), 10) || null : null,
      termMonths,
      joinMethod: parseJoinMethod(item.join_way),
      lastUpdated: new Date().toISOString(),
      sourceUrl: `https://finlife.fss.or.kr/finlife/svc/finPrdtList/view.do`,
    });
  }

  return products;
}

async function fetchMortgageProducts(type: "mortgage" | "rent"): Promise<BankProduct[]> {
  const endpoint =
    type === "mortgage"
      ? "mortgageLoanProductsSearch.json"
      : "rentHouseLoanProductsSearch.json";

  console.log(`  ${type === "mortgage" ? "주택담보대출" : "전세자금대출"} 수집 중...`);
  const baseList = await fetchAllPages<FssMortgageProduct>(endpoint);

  const optionRes = await fetch(
    `${BASE_URL}/${endpoint}?auth=${API_KEY}&topFinGrpNo=${FIN_GRP_NO}&pageNo=1`
  );
  const optionJson = (await optionRes.json()) as { result: { optionList: FssMortgageOption[] } };
  const optionList: FssMortgageOption[] = optionJson.result.optionList ?? [];

  const products: BankProduct[] = [];

  for (const item of baseList) {
    const options = optionList.filter(
      (o) => o.fin_co_no === item.fin_co_no && o.fin_prdt_cd === item.fin_prdt_cd
    );

    if (options.length === 0) continue;

    const baseRate = Math.min(...options.map((o) => o.lend_rate_min ?? 0));
    const maxRate = Math.max(...options.map((o) => o.lend_rate_max ?? 0));

    products.push({
      id: `${item.fin_co_no}_${item.fin_prdt_cd}`,
      bank: item.kor_co_nm,
      bankCode: item.fin_co_no,
      productName: item.fin_prdt_nm,
      productType: type,
      baseRate,
      maxRate,
      preferentialConditions: [],
      minAmount: 0,
      maxAmount: null,
      termMonths: [],
      joinMethod: parseJoinMethod(item.join_way),
      lastUpdated: new Date().toISOString(),
      sourceUrl: `https://finlife.fss.or.kr/finlife/svc/finPrdtList/view.do`,
    });
  }

  return products;
}

async function main() {
  console.log("FSS 금융상품 데이터 수집 시작...\n");

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  try {
    const [deposits, savings, mortgages, rents] = await Promise.all([
      fetchDepositProducts("deposit"),
      fetchDepositProducts("savings"),
      fetchMortgageProducts("mortgage"),
      fetchMortgageProducts("rent"),
    ]);

    fs.writeFileSync(path.join(dataDir, "deposit.json"), JSON.stringify(deposits, null, 2));
    fs.writeFileSync(path.join(dataDir, "savings.json"), JSON.stringify(savings, null, 2));
    fs.writeFileSync(path.join(dataDir, "mortgage.json"), JSON.stringify(mortgages, null, 2));
    fs.writeFileSync(path.join(dataDir, "rent.json"), JSON.stringify(rents, null, 2));

    const meta = {
      lastUpdated: new Date().toISOString(),
      counts: {
        deposit: deposits.length,
        savings: savings.length,
        mortgage: mortgages.length,
        rent: rents.length,
      },
    };
    fs.writeFileSync(path.join(dataDir, "meta.json"), JSON.stringify(meta, null, 2));

    console.log("\n수집 완료:");
    console.log(`  예금: ${deposits.length}개`);
    console.log(`  적금: ${savings.length}개`);
    console.log(`  주택담보대출: ${mortgages.length}개`);
    console.log(`  전세자금대출: ${rents.length}개`);
    console.log(`\ndata/ 에 저장되었습니다.`);
  } catch (err) {
    console.error("수집 중 오류:", err);
    process.exit(1);
  }
}

main();
