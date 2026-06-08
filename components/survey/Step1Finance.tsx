"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/lib/types";

interface Props {
  profile: UserProfile;
  update: (p: Partial<UserProfile>) => void;
}

export function Step1Finance({ profile, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">재무 정보를 알려주세요</h2>
        <p className="text-sm text-muted-foreground">정확할수록 더 맞는 상품을 추천해드릴 수 있어요.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cashAsset">현재 보유 현금·자산 (만원)</Label>
          <Input
            id="cashAsset"
            type="number"
            min={0}
            placeholder="예: 1000"
            value={profile.cashAsset || ""}
            onChange={(e) => update({ cashAsset: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="monthlyIncome">월 소득 — 세후 (만원)</Label>
          <Input
            id="monthlyIncome"
            type="number"
            min={0}
            placeholder="예: 300"
            value={profile.monthlyIncome || ""}
            onChange={(e) => update({ monthlyIncome: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="fixedExpense">월 고정 지출 (만원)</Label>
            <Input
              id="fixedExpense"
              type="number"
              min={0}
              placeholder="예: 80"
              value={profile.monthlyFixedExpense || ""}
              onChange={(e) => update({ monthlyFixedExpense: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">월세, 보험, 구독료</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="varExpense">월 변동 지출 (만원)</Label>
            <Input
              id="varExpense"
              type="number"
              min={0}
              placeholder="예: 60"
              value={profile.monthlyVariableExpense || ""}
              onChange={(e) => update({ monthlyVariableExpense: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">식비, 교통, 여가</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-secondary/20">
          <input
            id="emergencyFund"
            type="checkbox"
            className="w-4 h-4 accent-primary"
            checked={profile.hasEmergencyFund}
            onChange={(e) => update({ hasEmergencyFund: e.target.checked })}
          />
          <div>
            <Label htmlFor="emergencyFund" className="cursor-pointer font-medium">
              비상금 확보 완료
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">3~6개월치 생활비가 별도로 마련되어 있음</p>
          </div>
        </div>
      </div>
    </div>
  );
}
