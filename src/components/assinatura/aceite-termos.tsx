"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { BRAND } from "@/lib/brand";
import { CLAUSULAS_TERMOS, TERMOS_INTRO } from "@/lib/termos";

export function AceiteTermos({
  marcado,
  onChange,
  invalido = false,
}: {
  marcado: boolean;
  onChange: (marcado: boolean) => void;
  invalido?: boolean;
}) {
  const [aberto, setAberto] = React.useState(false);

  function abrirTermos(evento: React.MouseEvent) {
    evento.preventDefault();
    evento.stopPropagation();
    setAberto(true);
  }

  return (
    <>
      <label
        className={`flex min-h-11 cursor-pointer items-center gap-2.5 text-sm ${invalido ? "text-red-600" : ""}`}
      >
        <input
          id="aceite-termos"
          type="checkbox"
          checked={marcado}
          onChange={(evento) => onChange(evento.target.checked)}
          aria-invalid={invalido || undefined}
          className="size-5 shrink-0 accent-ja-teal"
        />
        <span className="text-ja-ink">
          Declaro que aceito os{" "}
          <button
            type="button"
            onClick={abrirTermos}
            className="font-semibold text-ja-teal underline underline-offset-2"
          >
            termos de uso
          </button>
        </span>
      </label>
      {aberto ? <ModalTermos onFechar={() => setAberto(false)} /> : null}
    </>
  );
}

function ModalTermos({ onFechar }: { onFechar: () => void }) {
  React.useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" aria-label="Fechar termos" onClick={onFechar} className="absolute inset-0 bg-slate-950/55" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-termos"
        className="relative flex max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-ja-line bg-ja-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ja-line px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">Termos de uso</p>
            <h2 id="titulo-termos" className="mt-1 font-display text-xl font-bold text-ja-ink">
              Termos de uso da {BRAND.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full p-2 text-ja-muted hover:bg-ja-surface hover:text-ja-ink"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-ja-muted">{TERMOS_INTRO}</p>
          <div className="mt-6 space-y-6">
            {CLAUSULAS_TERMOS.map((clausula, indice) => (
              <section key={clausula.titulo}>
                <h3 className="text-sm font-bold text-ja-ink">
                  {indice + 1}. {clausula.titulo}
                </h3>
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
        </div>
        <div className="border-t border-ja-line px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-ja-teal text-sm font-semibold text-white hover:bg-ja-teal-hover"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
