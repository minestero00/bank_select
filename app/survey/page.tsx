"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/survey/StepIndicator";
import { Step1Finance } from "@/components/survey/Step1Finance";
import { Step2Goal } from "@/components/survey/Step2Goal";
import { Step3Lifestyle } from "@/components/survey/Step3Lifestyle";
import { Step4Current } from "@/components/survey/Step4Current";
import type { UserProfile } from "@/lib/types";

const DEFAULT_PROFILE: UserProfile = {
  cashAsset: 1000,
  monthlyIncome: 300,
  monthlyFixedExpense: 80,
  monthlyVariableExpense: 60,
  hasEmergencyFund: false,
  mainGoal: "savings",
  targetAmount: 5000,
  goalPeriod: "mid",
  interestedInSubscription: false,
  age: null,
  jobType: null,
  riskType: "neutral",
  channelPreference: "online",
  currentBanks: [],
  currentProducts: [],
  currentLoanAmount: 0,
  currentLoanRate: null,
};

export default function SurveyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  function update(partial: Partial<UserProfile>) {
    setProfile((prev) => ({ ...prev, ...partial }));
  }

  function handleNext() {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      const encoded = encodeURIComponent(JSON.stringify(profile));
      router.push(`/result?data=${encoded}`);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
      <StepIndicator currentStep={step} />

      <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm">
        {step === 1 && <Step1Finance profile={profile} update={update} />}
        {step === 2 && <Step2Goal profile={profile} update={update} />}
        {step === 3 && <Step3Lifestyle profile={profile} update={update} />}
        {step === 4 && <Step4Current profile={profile} update={update} />}
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
          ← 이전
        </Button>
        <Button onClick={handleNext} size="lg">
          {step === 4 ? "추천 결과 보기 →" : "다음 →"}
        </Button>
      </div>
    </div>
  );
}
