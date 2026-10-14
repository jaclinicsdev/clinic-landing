"use client";

import * as React from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";

import { urlApi } from "@/lib/planos-publicos";

/** O que o formulário de cartão devolve. O número do cartão nunca passa pelo site. */
export interface CartaoDoFormulario {
  token: string;
  metodo: string;
  emissor: string | null;
  parcelas: number;
  documento: { tipo: string; numero: string } | null;
  /** Device ID do navegador (antifraude do Mercado Pago). */
  dispositivo: string | null;
}

interface CartaoMercadoPagoProps {
  /** Valor mostrado no formulário (a cobrança de verdade é feita pela API). */
  valor: number;
  /** E-mail do administrador: preenche o formulário, que então não pede e-mail. */
  email: string;
  /** Até quantas parcelas o formulário oferece. Padrão: à vista. */
  parcelasMaximas?: number;
  /** Recebe o cartão já tokenizado. Lança para o formulário voltar ao estado de edição. */
  onCartao: (cartao: CartaoDoFormulario) => Promise<void>;
}

let chaveIniciada: string | null = null;

/** Device ID que o script de segurança do Mercado Pago guarda no navegador (o antifraude recusa menos com ele). */
function dispositivo(): string | null {
  const valor = (window as unknown as { MP_DEVICE_SESSION_ID?: unknown }).MP_DEVICE_SESSION_ID;
  return typeof valor === "string" && valor ? valor : null;
}

/** Carrega o script de segurança uma vez, se o SDK ainda não deixou o Device ID. */
function carregarSeguranca() {
  if (dispositivo() || document.getElementById("mp-seguranca")) return;
  const script = document.createElement("script");
  script.id = "mp-seguranca";
  script.src = "https://www.mercadopago.com/v2/security.js";
  script.setAttribute("view", "checkout");
  script.async = true;
  document.body.appendChild(script);
}

/** Espera o script de segurança deixar o Device ID (no máximo alguns segundos): sem ele o antifraude recusa mais. */
async function esperarDispositivo(limiteMs = 4000): Promise<string | null> {
  const fim = Date.now() + limiteMs;
  while (!dispositivo() && Date.now() < fim) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return dispositivo();
}

/**
 * Formulário de cartão do próprio Mercado Pago (Card Payment Brick), dentro do site: o cartão vai direto
 * para o Mercado Pago, que devolve um token. Ninguém precisa entrar numa conta do Mercado Pago.
 */
export function CartaoMercadoPago({ valor, email, parcelasMaximas = 1, onCartao }: CartaoMercadoPagoProps) {
  const url = urlApi("/assinatura/mercadopago/config");
  // Sem o endereço da API, nem tenta: o formulário fica indisponível.
  const [chave, setChave] = React.useState<string | null | undefined>(url ? undefined : null);
  const [pronto, setPronto] = React.useState(false);

  // O script de segurança começa a rodar já na abertura, para o Device ID estar pronto no envio.
  React.useEffect(() => {
    carregarSeguranca();
  }, []);

  React.useEffect(() => {
    if (!url) return;
    let ativo = true;
    fetch(url)
      .then((resposta) => resposta.json() as Promise<{ publicKey?: string | null }>)
      .then(({ publicKey }) => {
        if (!ativo) return;
        if (publicKey && chaveIniciada !== publicKey) {
          initMercadoPago(publicKey, { locale: "pt-BR" });
          chaveIniciada = publicKey;
        }
        setChave(publicKey ?? null);
      })
      .catch(() => {
        if (ativo) setChave(null);
      });
    return () => {
      ativo = false;
    };
  }, [url]);

  if (chave === null) {
    return (
      <p className="text-sm text-ja-ink">
        O pagamento no cartão está indisponível agora. Escolha Pix ou tente de novo mais tarde.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {!pronto ? <p className="text-sm text-ja-muted">Carregando o formulário do cartão…</p> : null}
      {chave ? (
        <CardPayment
          initialization={{ amount: valor, payer: { email } }}
          customization={{
            paymentMethods: {
              minInstallments: 1,
              maxInstallments: parcelasMaximas,
              types: { excluded: ["debit_card", "prepaid_card"] },
            },
          }}
          locale="pt-BR"
          onReady={() => setPronto(true)}
          onError={(erro) => console.error("[mercadopago] formulário do cartão", erro)}
          onSubmit={async (dados) => {
            await onCartao({
              token: dados.token,
              metodo: dados.payment_method_id,
              emissor: dados.issuer_id ? String(dados.issuer_id) : null,
              parcelas: dados.installments || 1,
              documento: dados.payer?.identification?.number
                ? { tipo: dados.payer.identification.type, numero: dados.payer.identification.number }
                : null,
              dispositivo: await esperarDispositivo(),
            });
          }}
        />
      ) : null}
      <p className="text-xs text-ja-muted">
        O cartão é digitado no formulário seguro do Mercado Pago: os dados não passam pelo nosso site. Não precisa ter
        conta no Mercado Pago.
      </p>
    </div>
  );
}
