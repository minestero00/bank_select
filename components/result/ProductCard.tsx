"use client";

import { Badge } from "@/components/ui/badge";
import type { RecommendationResult } from "@/lib/types";

interface Props {
  result: RecommendationResult;
  rank: number;
}

const TYPE_LABEL: Record<string, string> = {
  deposit: "정기예금",
  savings: "정기적금",
  mortgage: "주택담보대출",
  rent: "전세자금대출",
};

const TYPE_COLOR: Record<string, string> = {
  deposit: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  savings: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  mortgage: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  rent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const RANK_STYLE = [
  "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10",
  "border-slate-400 bg-slate-50/50 dark:bg-slate-900/10",
  "border-amber-600 bg-amber-50/50 dark:bg-amber-900/10",
];

const RANK_LABEL = ["🥇 1위", "🥈 2위", "🥉 3위"];

export function ProductCard({ result, rank }: Props) {
  const { product, score, reasons, estimatedReturn, meetsPreferentialConditions } = result;
  const isLoan = product.productType === "mortgage" || product.productType === "rent";

  return (
    <div
      className={`rounded-2xl border-2 p-5 md:p-6 transition-shadow hover:shadow-md ${RANK_STYLE[rank]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-sm">{RANK_LABEL[rank]}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[product.productType]}`}
            >
              {TYPE_LABEL[product.productType]}
            </span>
          </div>
          <h3 className="font-bold text-lg leading-tight">{product.productName}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{product.bank}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-primary">
            {isLoan ? product.baseRate.toFixed(1) : product.maxRate.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">
            {isLoan ? "최저 금리" : "최고 금리"}
          </p>
        </div>
      </div>

      {/* Rate detail */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-background/60 border border-border/40">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">기본 금리</p>
          <p className="font-semibold">{product.baseRate.toFixed(1)}%</p>
        </div>
        <div className="text-center border-x border-border/40">
          <p className="text-xs text-muted-foreground">최고 금리</p>
          <p className="font-semibold text-primary">{product.maxRate.toFixed(1)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">추천 점수</p>
          <p className="font-semibold">{score}점</p>
        </div>
      </div>

      {/* 가입 기간 */}
      {product.termMonths.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mb-3">
          <span className="text-xs text-muted-foreground self-center">기간</span>
          {product.termMonths.map((m) => (
            <Badge key={m} variant="outline" className="text-xs">
              {m}개월
            </Badge>
          ))}
        </div>
      )}

      {/* 예상 이자 */}
      {estimatedReturn !== null && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 mb-4">
          <p className="text-xs text-muted-foreground mb-0.5">예상 이자 수익 (세전)</p>
          <p className="font-bold text-primary">
            약 {estimatedReturn.toLocaleString()}원
          </p>
        </div>
      )}

      {/* 추천 이유 */}
      <div className="space-y-1.5 mb-3">
        {reasons.map((r, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="text-primary shrink-0">✓</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* 우대조건 충족 */}
      {meetsPreferentialConditions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-1.5">충족 가능한 우대 조건</p>
          <div className="flex flex-wrap gap-1.5">
            {meetsPreferentialConditions.map((c, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 가입 방법 */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">가입 방법</span>
        {product.joinMethod.map((m) => (
          <Badge key={m} variant="secondary" className="text-xs">
            {m === "online" ? "인터넷" : m === "app" ? "앱" : "영업점"}
          </Badge>
        ))}
      </div>
    </div>
  );
}
