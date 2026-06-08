export type ProductType = "deposit" | "savings" | "mortgage" | "rent";
export type GoalType = "savings" | "investment" | "loan_repay" | "home" | "retirement";
export type GoalPeriod = "short" | "mid" | "long";
export type JobType = "employee" | "self_employed" | "freelancer" | "student" | "homemaker" | "retired";
export type RiskType = "stable" | "stable_seeking" | "neutral" | "aggressive";
export type ChannelType = "online" | "offline";

export interface UserProfile {
  // 재무 정보
  cashAsset: number;
  monthlyIncome: number;
  monthlyFixedExpense: number;
  monthlyVariableExpense: number;
  hasEmergencyFund: boolean;

  // 목표 정보
  mainGoal: GoalType;
  targetAmount: number;
  goalPeriod: GoalPeriod;
  interestedInSubscription: boolean;

  // 라이프스타일
  age: number | null;
  jobType: JobType | null;
  riskType: RiskType;
  channelPreference: ChannelType;

  // 현재 거래 정보
  currentBanks: string[];
  currentProducts: string[];
  currentLoanAmount: number;
  currentLoanRate: number | null;
}

export interface BankProduct {
  id: string;
  bank: string;
  bankCode: string;
  productName: string;
  productType: ProductType;
  baseRate: number;
  maxRate: number;
  preferentialConditions: string[];
  minAmount: number;
  maxAmount: number | null;
  termMonths: number[];
  joinMethod: ("online" | "offline" | "app")[];
  lastUpdated: string;
  sourceUrl: string;
  isEvent?: boolean;
  eventPeriod?: string;
  highlight?: string;
}

export interface RecommendationResult {
  product: BankProduct;
  score: number;
  reasons: string[];
  estimatedReturn: number | null;
  meetsPreferentialConditions: string[];
}
