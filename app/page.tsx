import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: "🏦",
    title: "실시간 금융 데이터",
    desc: "금융감독원 공시 기반 예금·적금·대출 상품을 매일 갱신합니다.",
  },
  {
    icon: "🎯",
    title: "맞춤형 추천 알고리즘",
    desc: "소득·목표·투자성향을 분석해 Top 3 상품을 선별합니다.",
  },
  {
    icon: "📊",
    title: "이자 시뮬레이션",
    desc: "내 자산 기준 예상 이자 수익을 바로 계산해드립니다.",
  },
];

const PRODUCT_TYPES = ["정기예금", "정기적금", "주택담보대출", "전세자금대출"];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10 py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {PRODUCT_TYPES.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            내 상황에 딱 맞는
            <br />
            <span className="text-primary">은행 상품</span>을 찾아드려요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            소득, 자산, 목표를 알려주시면 수십 개의 은행 상품 중
            <br className="hidden md:block" />
            나에게 가장 유리한 Top 3를 5분 만에 추천해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/survey" className={buttonVariants({ size: "lg", className: "text-base px-8" })}>
              지금 추천받기 →
            </Link>
            <Link href="#features" className={buttonVariants({ variant: "outline", size: "lg", className: "text-base px-8" })}>
              서비스 알아보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            왜 BankSelect인가요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/60 bg-card hover:shadow-md transition-shadow"
              >
                <span className="text-4xl mb-4">{f.icon}</span>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">이렇게 이용해요</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {[
              { step: "01", label: "재무 정보 입력", desc: "자산·소득·지출" },
              { step: "02", label: "목표 설정", desc: "저축·내집마련·대출" },
              { step: "03", label: "라이프스타일", desc: "나이·직업·성향" },
              { step: "04", label: "Top 3 추천", desc: "즉시 결과 확인" },
            ].map((item, i) => (
              <div key={item.step} className="flex md:flex-row flex-col items-center">
                <div className="flex flex-col items-center text-center w-40">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-3">
                    {item.step}
                  </div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="text-muted-foreground text-2xl mx-2 rotate-90 md:rotate-0 my-2 md:my-0">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/survey" className={buttonVariants({ size: "lg", className: "text-base px-10" })}>
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
