"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { UserProfile, GoalType, GoalPeriod } from "@/lib/types";

interface Props {
  profile: UserProfile;
  update: (p: Partial<UserProfile>) => void;
}

const GOALS: { value: GoalType; label: string; emoji: string; desc?: string }[] = [
  { value: "savings", label: "저축·자산 증식", emoji: "💰" },
  { value: "investment", label: "투자 수익 실현", emoji: "📈" },
  { value: "home", label: "내 집 마련", emoji: "🏠" },
  { value: "loan_repay", label: "대출 상환·갈아타기", emoji: "💳" },
  { value: "retirement", label: "노후 준비", emoji: "🌅" },
  { value: "emergency_fund", label: "비상금 굴리기", emoji: "🏦", desc: "자유 입출금 파킹통장 추천" },
];

const PERIODS: { value: GoalPeriod; label: string; sub: string }[] = [
  { value: "short", label: "단기", sub: "1년 이내" },
  { value: "mid", label: "중기", sub: "1~3년" },
  { value: "long", label: "장기", sub: "3년 이상" },
];

export function Step2Goal({ profile, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">금융 목표를 설정해주세요</h2>
        <p className="text-sm text-muted-foreground">가장 중요한 목표 하나를 골라주세요.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>주요 목표</Label>
          <div className="grid grid-cols-1 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => update({ mainGoal: g.value })}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  profile.mainGoal === g.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="flex-1">
                  <span className="font-medium text-sm block">{g.label}</span>
                  {g.desc && <span className="text-xs text-muted-foreground">{g.desc}</span>}
                </span>
                {profile.mainGoal === g.value && (
                  <span className="ml-auto text-primary text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="targetAmount">목표 금액 (만원)</Label>
          <Input
            id="targetAmount"
            type="number"
            min={0}
            placeholder="예: 5000"
            value={profile.targetAmount || ""}
            onChange={(e) => update({ targetAmount: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>목표 기간</Label>
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => update({ goalPeriod: p.value })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  profile.goalPeriod === p.value
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                <p className="font-semibold text-sm">{p.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-secondary/20">
          <input
            id="subscription"
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={profile.interestedInSubscription}
            onChange={(e) => update({ interestedInSubscription: e.target.checked })}
          />
          <div>
            <Label htmlFor="subscription" className="cursor-pointer font-medium">
              주택청약 관심 있음
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">청약저축 상품도 함께 추천받고 싶어요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
