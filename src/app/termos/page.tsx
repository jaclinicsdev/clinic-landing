import type { Metadata } from "next";

import { MolduraAssinatura } from "@/components/assinatura/moldura";
import { BRAND } from "@/lib/brand";
import { CLAUSULAS_TERMOS, TERMOS_INTRO } from "@/lib/termos";

export const metadata: Metadata = {
  title: `Termos de uso | ${BRAND.name}`,
  description: `Termos de uso da plataforma ${BRAND.product}, da ${BRAND.name}.`,
};

export default function TermosPage() {
  return (
    <MolduraAssinatura>
      <article className="rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">Termos de uso</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ja-ink">
          Termos de uso da {BRAND.name}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ja-muted">{TERMOS_INTRO}</p>
        <div className="mt-8 space-y-7">
          {CLAUSULAS_TERMOS.map((clausula, indice) => (
            <section key={clausula.titulo}>
              <h2 className="text-base font-bold text-ja-ink">
                {indice + 1}. {clausula.titulo}
              </h2>
              <div className="mt-2 space-y-3">
                {clausula.paragrafos.map((paragrafo) => (
                  <p key={paragrafo} className="text-sm leading-relaxed text-ja-muted">
                    {paragrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </MolduraAssinatura>
  );
}
