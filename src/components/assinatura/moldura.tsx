"use client";

import Link from "next/link";

import { BrandMark } from "@/components/layout/BrandMark";

export function MolduraAssinatura({ children, larga = false }: { children: React.ReactNode; larga?: boolean }) {
  const largura = larga ? "max-w-5xl" : "max-w-3xl";
  return (
    <div className="min-h-screen bg-ja-surface text-ja-ink">
      <header className="bg-ja-brand text-white">
        <div className={`mx-auto flex items-center justify-between px-4 py-4 sm:px-6 ${largura}`}>
          <Link href="/" aria-label="J.A. Clinics — início">
            <BrandMark variant="onDark" size="nav" />
          </Link>
          <Link href="/#planos" className="text-sm font-medium text-white/80 hover:text-white">
            Planos
          </Link>
        </div>
      </header>
      <main className={`mx-auto px-4 py-8 sm:px-6 sm:py-10 ${largura}`}>{children}</main>
    </div>
  );
}
