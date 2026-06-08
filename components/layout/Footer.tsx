export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>© 2026 BankSelect. 금융상품 추천 서비스</p>
        <p>
          데이터 출처:{" "}
          <a
            href="https://finlife.fss.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            금융감독원 금융상품통합비교공시
          </a>
        </p>
      </div>
    </footer>
  );
}
