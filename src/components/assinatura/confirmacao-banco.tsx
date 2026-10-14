"use client";

import * as React from "react";

interface ConfirmacaoBancoProps {
  /** Página do banco (3DS) onde quem paga confirma a compra. */
  url: string;
  /** A confirmação terminou (aprovada ou não): a página segue para o resultado. */
  onConcluida: () => void;
}

/**
 * Confirmação da compra pelo banco (3DS), por cima da página. O Mercado Pago avisa pela mensagem
 * `{ status: "COMPLETE" }` quando acaba; o resultado em si é conferido na página de retorno.
 */
export function ConfirmacaoBanco({ url, onConcluida }: ConfirmacaoBancoProps) {
  const concluir = React.useRef(onConcluida);
  React.useEffect(() => {
    concluir.current = onConcluida;
  }, [onConcluida]);

  React.useEffect(() => {
    const ouvir = (evento: MessageEvent) => {
      const dados = evento.data as { status?: unknown } | null;
      if (dados && typeof dados === "object" && dados.status === "COMPLETE") concluir.current();
    };
    window.addEventListener("message", ouvir);
    return () => window.removeEventListener("message", ouvir);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="flex h-[min(640px,90vh)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-ja-card shadow-xl">
        <div className="border-b border-ja-line px-5 py-4">
          <p className="text-sm font-semibold text-ja-ink">Confirme a compra com o seu banco</p>
          <p className="mt-0.5 text-xs text-ja-muted">Por segurança, o banco pediu uma confirmação. Nada é cobrado antes disso.</p>
        </div>
        <iframe src={url} title="Confirmação do banco" className="w-full flex-1 bg-white" />
        <div className="flex justify-end border-t border-ja-line px-5 py-3">
          <button
            type="button"
            onClick={() => concluir.current()}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-ja-line px-4 text-sm font-semibold text-ja-ink hover:bg-ja-surface"
          >
            Já confirmei
          </button>
        </div>
      </div>
    </div>
  );
}
