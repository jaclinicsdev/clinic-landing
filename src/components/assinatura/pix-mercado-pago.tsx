"use client";

import * as React from "react";

import { reais, urlApi } from "@/lib/planos-publicos";

/** Pix gerado pela API para o pedido. */
export interface PixGerado {
  pagamentoId: string;
  /** Pix copia e cola. */
  qrCode: string;
  /** Imagem PNG do QR Code em base64. Pode vir vazia: a página mostra só o copia e cola. */
  qrCodeBase64: string;
  /** Página do Mercado Pago com o QR Code (reserva quando a imagem não vem). */
  ticketUrl: string | null;
  expiraEm: string;
}

interface PixMercadoPagoProps {
  pedidoId: string;
  pix: PixGerado;
  valor: number;
  /** Pagamento confirmado (ou que precisa de revisão): a tela segue para o retorno. */
  onConcluido: () => void;
  /** O Pix venceu ou a pessoa quer voltar e escolher outra forma. */
  onVoltar: () => void;
}

const CONSULTA_MS = 5000;

function restante(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

/** QR Code e Pix copia e cola na própria página. Espera o pagamento cair e segue sozinho. */
export function PixMercadoPago({ pedidoId, pix, valor, onConcluido, onVoltar }: PixMercadoPagoProps) {
  const expiraEm = React.useMemo(() => new Date(pix.expiraEm).getTime(), [pix.expiraEm]);
  const [agora, setAgora] = React.useState(() => Date.now());
  const [copiado, setCopiado] = React.useState(false);
  const vencido = agora >= expiraEm;
  const concluir = React.useRef(onConcluido);
  React.useEffect(() => {
    concluir.current = onConcluido;
  }, [onConcluido]);

  React.useEffect(() => {
    const relogio = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(relogio);
  }, []);

  React.useEffect(() => {
    const url = urlApi("/assinatura/pagamento/situacao");
    if (vencido || !url) return;
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const consultar = async () => {
      try {
        const resposta = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pedidoId }),
        });
        const json = (await resposta.json().catch(() => null)) as { status?: string } | null;
        if (!ativo) return;
        if (resposta.ok && json?.status && json.status !== "pendente") {
          concluir.current();
          return;
        }
      } catch {
        // Falha passageira: tenta de novo na próxima volta.
      }
      if (ativo) timer = setTimeout(() => void consultar(), CONSULTA_MS);
    };
    timer = setTimeout(() => void consultar(), CONSULTA_MS);
    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [pedidoId, vencido]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(pix.qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  if (vencido) {
    return (
      <div>
        <p className="text-sm font-semibold text-ja-ink">Este Pix venceu</p>
        <p className="mt-2 text-sm text-ja-muted">
          Nada foi cobrado. Se você pagou agora há pouco, a confirmação chega sozinha por e-mail; senão, gere outro Pix.
        </p>
        <button
          type="button"
          onClick={onVoltar}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-ja-line px-5 text-sm font-semibold text-ja-ink hover:bg-ja-surface"
        >
          Gerar outro Pix
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {pix.qrCodeBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagem em base64 vinda do Mercado Pago
          <img
            src={`data:image/png;base64,${pix.qrCodeBase64}`}
            alt="QR Code do Pix"
            className="size-48 shrink-0 rounded-xl border border-ja-line bg-white p-2"
          />
        ) : null}
        <div className="w-full min-w-0">
          <p className="text-sm font-semibold text-ja-ink">Pague {reais(valor)} com Pix</p>
          <p className="mt-2 text-sm text-ja-muted">
            Abra o app do banco, escolha Pix e leia o QR Code ou cole o código abaixo. Quando o pagamento cair, o
            acesso segue para o e-mail do administrador.
          </p>
          <p className="mt-3 break-all rounded-xl bg-ja-surface px-3 py-2 font-mono text-xs text-ja-ink">{pix.qrCode}</p>
          <button
            type="button"
            onClick={() => void copiar()}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-ja-teal px-5 text-sm font-semibold text-white hover:bg-ja-teal-hover sm:w-auto"
          >
            {copiado ? "Código copiado" : "Copiar código Pix"}
          </button>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 border-t border-ja-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ja-muted" aria-live="polite">
          Aguardando o pagamento · vence em {restante(expiraEm - agora)}
        </p>
        <button
          type="button"
          onClick={onVoltar}
          className="text-left text-xs font-medium text-ja-muted underline-offset-4 hover:text-ja-ink hover:underline"
        >
          Escolher outra forma de pagamento
        </button>
      </div>
    </div>
  );
}
