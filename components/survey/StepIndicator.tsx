"use client";

const STEPS = ["재무 정보", "목표 설정", "라이프스타일", "현재 거래"];

interface Props {
  currentStep: number;
}

export function StepIndicator({ currentStep }: Props) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const done = stepNum < currentStep;
          const active = stepNum === currentStep;
          return (
            <div key={label} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 bg-background ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {done ? "✓" : stepNum}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center mt-4 text-sm text-muted-foreground sm:hidden">
        {currentStep}단계: {STEPS[currentStep - 1]}
      </p>
    </div>
  );
}
