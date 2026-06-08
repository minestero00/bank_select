import type { BankProduct, UserProfile, RecommendationResult, GoalPeriod } from "./types";

function getGoalTermMonths(period: GoalPeriod): { min: number; max: number } {
  if (period === "short") return { min: 1, max: 12 };
  if (period === "mid") return { min: 13, max: 36 };
  return { min: 37, max: 120 };
}

function scoreRate(product: BankProduct, allProducts: BankProduct[]): number {
  const sameType = allProducts.filter((p) => p.productType === product.productType);
  if (sameType.length === 0) return 0;
  const maxRate = Math.max(...sameType.map((p) => p.maxRate));
  const minRate = Math.min(...sameType.map((p) => p.maxRate));
  if (maxRate === minRate) return 100;
  return ((product.maxRate - minRate) / (maxRate - minRate)) * 100;
}

function scoreTermMatch(product: BankProduct, profile: UserProfile): number {
  if (product.termMonths.length === 0) return 50;
  const { min, max } = getGoalTermMonths(profile.goalPeriod);
  const hasMatch = product.termMonths.some((t) => t >= min && t <= max);
  if (hasMatch) return 100;
  const closest = product.termMonths.reduce((prev, curr) => {
    const prevDiff = Math.min(Math.abs(prev - min), Math.abs(prev - max));
    const currDiff = Math.min(Math.abs(curr - min), Math.abs(curr - max));
    return currDiff < prevDiff ? curr : prev;
  });
  const diff = Math.min(Math.abs(closest - min), Math.abs(closest - max));
  return Math.max(0, 100 - diff * 3);
}

function scorePreferential(product: BankProduct, profile: UserProfile): number {
  const conditions = product.preferentialConditions;
  if (conditions.length === 0) return 50;

  const keywords: Record<string, string[]> = {
    employee: ["급여", "봉급", "직장"],
    student: ["학생", "청년"],
    homemaker: ["주부"],
    retired: ["은퇴", "노후"],
    online: ["인터넷", "온라인", "비대면", "앱", "모바일"],
  };

  let matched = 0;
  const checkList: string[] = [];

  if (profile.jobType && keywords[profile.jobType]) {
    for (const cond of conditions) {
      if (keywords[profile.jobType].some((k) => cond.includes(k))) {
        matched++;
        checkList.push(cond);
      }
    }
  }
  if (profile.channelPreference === "online") {
    for (const cond of conditions) {
      if (keywords.online.some((k) => cond.includes(k))) {
        matched++;
        checkList.push(cond);
      }
    }
  }

  return Math.min(100, (matched / Math.max(conditions.length, 1)) * 100 + matched * 20);
}

function scoreChannel(product: BankProduct, profile: UserProfile): number {
  if (profile.channelPreference === "online") {
    return product.joinMethod.includes("online") || product.joinMethod.includes("app") ? 100 : 30;
  }
  return product.joinMethod.includes("offline") ? 100 : 70;
}

function scoreTargetMatch(product: BankProduct, profile: UserProfile): number {
  let score = 50;

  if (profile.age !== null) {
    const isYoung = profile.age < 34;
    const isMiddle = profile.age >= 34 && profile.age < 55;
    const isSenior = profile.age >= 55;
    const name = product.productName;
    if (isYoung && (name.includes("청년") || name.includes("젊은"))) score += 30;
    if (isMiddle && name.includes("직장")) score += 20;
    if (isSenior && (name.includes("노후") || name.includes("시니어"))) score += 30;
  }

  if (profile.mainGoal === "home" && product.productType === "mortgage") score += 30;
  if (profile.mainGoal === "loan_repay" && (product.productType === "mortgage" || product.productType === "rent")) score += 20;
  if (profile.interestedInSubscription && product.productName.includes("청약")) score += 40;

  return Math.min(100, score);
}

function getMetMatchedConditions(product: BankProduct, profile: UserProfile): string[] {
  const keywords: Record<string, string[]> = {
    employee: ["급여", "봉급", "직장"],
    student: ["학생", "청년"],
    homemaker: ["주부"],
    retired: ["은퇴", "노후"],
  };
  const matched: string[] = [];
  if (profile.jobType && keywords[profile.jobType]) {
    for (const cond of product.preferentialConditions) {
      if (keywords[profile.jobType].some((k) => cond.includes(k))) {
        matched.push(cond);
      }
    }
  }
  if (profile.channelPreference === "online") {
    for (const cond of product.preferentialConditions) {
      if (["인터넷", "온라인", "비대면", "앱", "모바일"].some((k) => cond.includes(k))) {
        matched.push(cond);
      }
    }
  }
  return [...new Set(matched)];
}

function buildReasons(product: BankProduct, profile: UserProfile, scores: number[]): string[] {
  const reasons: string[] = [];
  const [rateScore, termScore, prefScore, , targetScore] = scores;

  if (rateScore >= 80) reasons.push(`동일 유형 상품 중 최고 금리권 (최대 ${product.maxRate}%)`);
  if (termScore >= 80) {
    const { min, max } = getGoalTermMonths(profile.goalPeriod);
    reasons.push(`목표 기간(${min}~${max}개월)에 맞는 상품 기간 보유`);
  }
  if (prefScore >= 60) reasons.push("우대금리 조건 일부 충족 가능");
  if (targetScore >= 80) reasons.push("사용자 목표·상황과 높은 적합도");
  if (profile.channelPreference === "online" && (product.joinMethod.includes("online") || product.joinMethod.includes("app")))
    reasons.push("온라인/앱 가입 가능");

  if (reasons.length === 0) reasons.push("종합 조건 기준 추천 상품");
  return reasons;
}

function estimateReturn(product: BankProduct, profile: UserProfile): number | null {
  if (product.productType === "mortgage" || product.productType === "rent") return null;
  const { min, max } = getGoalTermMonths(profile.goalPeriod);
  const termMonths = product.termMonths.find((t) => t >= min && t <= max) ?? product.termMonths[0];
  if (!termMonths) return null;

  const principal = product.productType === "deposit" ? profile.cashAsset * 10000 : profile.monthlyIncome * 10000 * 0.2;
  const rate = product.maxRate / 100;
  const years = termMonths / 12;

  if (product.productType === "deposit") {
    return Math.round(principal * rate * years);
  } else {
    const monthly = principal;
    return Math.round(monthly * termMonths * rate * years * 0.5);
  }
}

export function getTopRecommendations(
  allProducts: BankProduct[],
  profile: UserProfile,
  n = 3
): RecommendationResult[] {
  const eligible = allProducts.filter((p) => {
    if (p.minAmount > profile.cashAsset * 10000) return false;
    if (profile.mainGoal === "savings" || profile.mainGoal === "investment") {
      return p.productType === "deposit" || p.productType === "savings";
    }
    if (profile.mainGoal === "home") {
      return p.productType === "mortgage" || p.productType === "deposit" || p.productType === "savings";
    }
    if (profile.mainGoal === "loan_repay") {
      return p.productType === "mortgage" || p.productType === "rent";
    }
    return true;
  });

  const scored = eligible.map((product) => {
    const scores = [
      scoreRate(product, allProducts),
      scoreTermMatch(product, profile),
      scorePreferential(product, profile),
      scoreChannel(product, profile),
      scoreTargetMatch(product, profile),
    ];
    const weights = [0.35, 0.25, 0.2, 0.1, 0.1];
    const total = scores.reduce((sum, s, i) => sum + s * weights[i], 0);

    return {
      product,
      score: Math.round(total),
      reasons: buildReasons(product, profile, scores),
      estimatedReturn: estimateReturn(product, profile),
      meetsPreferentialConditions: getMetMatchedConditions(product, profile),
    } satisfies RecommendationResult;
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, n);
}
