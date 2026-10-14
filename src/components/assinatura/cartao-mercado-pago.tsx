"use client";

import * as React from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";

import { urlApi } from "@/lib/planos-publicos";

interface CartaoMercadoPagoProps {
  /** Valor mostrado no formulário (a cobrança de verdade é a da assinatura, feita pela API). */
  valor: number;
  /** E-mail do administrador: preenche o formulário, que então não pede e-mail. */
  email: string;
  /** Recebe o token do cartão. Lança para o formulário voltar ao estado de edição. */
  onToken: (token: string) => Promise<void>;
}

let chaveIniciada: string | null = null;

/**
 * Formulário de cartão do próprio Mercado Pago (Card Payment Brick), dentro do site: o cartão vai direto
 * para o Mercado Pago, que devolve um token. Ninguém precisa entrar numa conta do Mercado Pago.
 */
export function CartaoMercadoPago({ valor, email, onToken }: CartaoMercadoPagoProps) {
  const url = urlApi("/assinatura/mercadopago/config");
  // Sem o endereço da API, nem tenta: o formulário fica indisponível.
  const [chave, setChave] = React.useState<string | null | undefined>(url ? undefined : null);
  const [pronto, setPronto] = React.useState(false);

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
            paymentMethods: { minInstallments: 1, maxInstallments: 1, types: { excluded: ["debit_card", "prepaid_card"] } },
          }}
          locale="pt-BR"
          onReady={() => setPronto(true)}
          onError={(erro) => console.error("[mercadopago] formulário do cartão", erro)}
          onSubmit={async (dados) => {
            await onToken(dados.token);
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
