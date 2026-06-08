"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto flex h-14 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-primary">💰</span>
          <span>BankSelect</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link
            href="/survey"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            상품 추천받기
          </Link>
        </nav>
      </div>
    </header>
  );
}
