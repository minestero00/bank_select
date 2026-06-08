"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { UserProfile, JobType, RiskType, ChannelType } from "@/lib/types";

interface Props {
  profile: UserProfile;
  update: (p: Partial<UserProfile>) => void;
}

const JOBS: { value: JobType; label: string }[] = [
  { value: "employee", label: "직장인 (급여)" },
  { value: "self_employed", label: "자영업자" },
  { value: "freelancer", label: "프리랜서" },
  { value: "student", label: "학생·청년" },
  { value: "homemaker", label: "주부" },
  { value: "retired", label: "은퇴" },
];

const RISKS: { value: RiskType; label: string; sub: string }[] = [
  { value: "stable", label: "안정형", sub: "원금 손실 절대 불가" },
  { value: "stable_seeking", label: "안정추구형", sub: "낮은 위험 선호" },
  { value: "neutral", label: "위험중립형", sub: "적정 수익·위험 균형" },
  { value: "aggressive", label: "적극투자형", sub: "높은 수익을 위한 위험 감수" },
];

export function Step3Lifestyle({ profile, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1">라이프스타일을 알려주세요</h2>
        <p className="text-sm text-muted-foreground">선택하지 않아도 괜찮아요 — 입력할수록 더 정확해져요.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="age">나이 (만 나이, 선택)</Label>
          <Input
            id="age"
            type="number"
            min={1}
            max={100}
            placeholder="예: 28"
            value={profile.age ?? ""}
            onChange={(e) =>
              update({ age: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>직업 유형 (선택)</Label>
          <div className="grid grid-cols-2 gap-2">
            {JOBS.map((j) => (
              <button
                key={j.value}
                type="button"
                onClick={() =>
                  update({ jobType: profile.jobType === j.value ? null : j.value })
                }
                className={`p-3 rounded-xl border text-left text-sm transition-all ${
                  profile.jobType === j.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>투자 성향</Label>
          <div className="space-y-2">
            {RISKS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => update({ riskType: r.value })}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  profile.riskType === r.value
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                <div>
                  <p className="font-medium text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.sub}</p>
                </div>
                {profile.riskType === r.value && (
                  <span className="text-primary text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>선호 거래 방식</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "online", label: "온라인·앱", sub: "비대면 선호" },
                { value: "offline", label: "영업점 방문", sub: "대면 선호" },
              ] as { value: ChannelType; label: string; sub: string }[]
            ).map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => update({ channelPreference: c.value })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  profile.channelPreference === c.value
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-border hover:bg-secondary/20"
                }`}
              >
                <p className="font-semibold text-sm">{c.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
