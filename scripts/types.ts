export interface BankProduct {
  id: string;
  bank: string;
  bankCode: string;
  productName: string;
  productType: "deposit" | "savings" | "mortgage" | "rent";
  baseRate: number;
  maxRate: number;
  preferentialConditions: string[];
  minAmount: number;
  maxAmount: number | null;
  termMonths: number[];
  joinMethod: ("online" | "offline" | "app")[];
  lastUpdated: string;
  sourceUrl: string;
}

export interface FssDepositProduct {
  fin_co_no: string;
  kor_co_nm: string;
  fin_prdt_cd: string;
  fin_prdt_nm: string;
  join_way: string;
  mtrt_int: string;
  spcl_cnd: string;
  join_deny: string;
  join_member: string;
  etc_note: string;
  max_limit: string | null;
}

export interface FssDepositOption {
  fin_co_no: string;
  fin_prdt_cd: string;
  intr_rate_type_nm: string;
  save_trm: string;
  intr_rate: number;
  intr_rate2: number;
}

export interface FssMortgageProduct {
  fin_co_no: string;
  kor_co_nm: string;
  fin_prdt_cd: string;
  fin_prdt_nm: string;
  join_way: string;
  loan_inci_expn: string;
  erly_rpay_fee: string;
  dly_rate: string;
  loan_lmt: string;
}

export interface FssMortgageOption {
  fin_co_no: string;
  fin_prdt_cd: string;
  mrtg_type_nm: string;
  rpay_type_nm: string;
  lend_rate_type_nm: string;
  lend_rate_min: number;
  lend_rate_max: number;
  lend_rate_avg: number | null;
}

export interface FssApiResponse<T> {
  result: {
    err_cd: string;
    err_msg: string;
    now_page_no: string;
    max_page_no: string;
    total_count: string;
    baseList: T[];
    optionList: unknown[];
  };
}
