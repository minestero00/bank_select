"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/lib/types";

interface Props {
  profile: UserProfile;
  update: (p: Partial<UserProfile>) => void;
}

const BANKS = [
  "KB국민은행", "신한은행", "하나은행", "우리은행", "NH농협은행",
  "IBK기업은행", "카카오뱅크", "토스뱅크", "케이뱅크",
];

const PRODUCTS = ["정기예금", "정기적금", "주택청약", "주택담보대출", "전세자금대출", "신용대출"];

export function Step4Current({ profile, update }: Props) {
  function toggleBank(bank: string) {
    const next = profile.currentBanks.includes(bank)
      ? profile.currentBanks.filter((b) => b !== bank)
      : [...profile.currentBanks, bank];
    update({ currentBanks: next });
  }

  function toggleProduct(product: string) {
    const next = profile.currentProducts.includes(product)
      ? profile.currentProducts.filter((p) => p !== product)
      : [...profile.currentProducts, product];
    update({ currentProducts: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">현재 거래 정보 (선택)</h2>
        <p className="text-sm text-muted-foreground">입력하면 현재 상품과의 비교도 보여드려요.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>현재 사용 중인 은행 (복수 선택)</Label>
          <div className="flex flex-wrap gap-2">
            {BANKS.map((bank) => (
              <button
                key={bank}
                type="button"
                onClick={() => toggleBank(bank)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  profile.currentBanks.includes(bank)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {bank}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>현재 보유 중인 상품 (복수 선택)</Label>
          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map((product) => (
              <button
                key={product}
                type="button"
                onClick={() => toggleProduct(product)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                  profile.currentProducts.includes(product)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {product}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-secondary/20 space-y-3">
          <p className="text-sm font-medium">대출이 있다면</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loanAmount" className="text-xs">
                대출 잔액 (만원)
              </Label>
              <Input
                id="loanAmount"
                type="number"
                min={0}
                placeholder="예: 15000"
                value={profile.currentLoanAmount || ""}
                onChange={(e) => update({ currentLoanAmount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loanRate" className="text-xs">
                현재 금리 (%)
              </Label>
              <Input
                id="loanRate"
                type="number"
                min={0}
                step={0.1}
                placeholder="예: 4.5"
                value={profile.currentLoanRate ?? ""}
                onChange={(e) =>
                  update({
                    currentLoanRate: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
