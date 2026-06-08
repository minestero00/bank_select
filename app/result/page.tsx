"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/result/ProductCard";
import { getTopRecommendations } from "@/lib/recommend";
import type { BankProduct, UserProfile } from "@/lib/types";

import depositData from "@/data/deposit.json";
import savingsData from "@/data/savings.json";
import mortgageData from "@/data/mortgage.json";
import rentData from "@/data/rent.json";
import eventsData from "@/data/events.json";
import parkingData from "@/data/parking.json";

const ALL_PRODUCTS = [
  ...(eventsData as BankProduct[]),  // 이벤트·특판 상품 우선
  ...(parkingData as BankProduct[]),
  ...(depositData as BankProduct[]),
  ...(savingsData as BankProduct[]),
  ...(mortgageData as BankProduct[]),
  ...(rentData as BankProduct[]),
];

const GOAL_LABEL: Record<string, string> = {
  savings: "저축·자산 증식",
  investment: "투자 수익",
  home: "내 집 마련",
  loan_repay: "대출 갈아타기",
  retirement: "노후 준비",
  emergency_fund: "비상금 굴리기",
};

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();

  const profile = useMemo<UserProfile | null>(() => {
    const raw = params.get("data");
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw)) as UserProfile;
    } catch {
      return null;
    }
  }, [params]);

  const recommendations = useMemo(() => {
    if (!profile) return [];
    return getTopRecommendations(ALL_PRODUCTS, profile, 3);
  }, [profile]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">설문 정보가 없습니다.</p>
        <Button onClick={() => router.push("/survey")}>설문 다시 시작</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
      {/* Summary */}
      <div className="mb-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">분석 완료</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          나에게 맞는 Top 3 상품이에요
        </h1>
        <p className="text-sm text-muted-foreground">
          목표:{" "}
          <span className="font-medium text-foreground">
            {GOAL_LABEL[profile.mainGoal]}
          </span>{" "}
          ·{" "}
          <span className="font-medium text-foreground">
            {profile.goalPeriod === "short" ? "단기" : profile.goalPeriod === "mid" ? "중기" : "장기"}
          </span>{" "}
          · 보유 자산{" "}
          <span className="font-medium text-foreground">
            {profile.cashAsset.toLocaleString()}만원
          </span>
        </p>
      </div>

      {/* Cards */}
      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map((r, i) => (
            <ProductCard key={r.product.id} result={r} rank={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">조건에 맞는 상품을 찾지 못했어요.</p>
          <Button variant="outline" onClick={() => router.push("/survey")}>
            조건 다시 입력
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button variant="outline" onClick={() => router.push("/survey")} className="flex-1">
          ← 조건 수정하기
        </Button>
        <Button onClick={() => router.push("/")} className="flex-1">
          처음으로
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        금리는 금융감독원 공시 기준이며 실제 적용 금리와 다를 수 있습니다. 가입 전 각 은행 공식 홈페이지에서 확인하세요.
      </p>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground animate-pulse">추천 결과를 계산 중...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
