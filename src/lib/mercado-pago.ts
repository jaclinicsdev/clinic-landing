import { urlApi } from "@/lib/planos-publicos";

/** Onde o cartão da cobrança automática é cadastrado: no nosso formulário ou na página do Mercado Pago. */
export type ModoAssinaturaCartao = "formulario" | "pagina";

let modo: Promise<ModoAssinaturaCartao> | null = null;

/** Consultado uma vez por página. Sem resposta da API, a página do Mercado Pago (o padrão). */
export function modoAssinaturaCartao(): Promise<ModoAssinaturaCartao> {
  const url = urlApi("/assinatura/mercadopago/config");
  if (!url) return Promise.resolve("pagina");
  modo ??= fetch(url)
    .then((resposta) => resposta.json() as Promise<{ assinaturaCartao?: string }>)
    .then(({ assinaturaCartao }): ModoAssinaturaCartao => (assinaturaCartao === "formulario" ? "formulario" : "pagina"))
    .catch((): ModoAssinaturaCartao => {
      modo = null;
      return "pagina";
    });
  return modo;
}
