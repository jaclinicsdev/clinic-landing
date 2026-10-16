"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { MolduraAssinatura } from "@/components/assinatura/moldura";
import { linkDoSistema, urlApi } from "@/lib/planos-publicos";

function RetornoPagamento() {
  const params = useSearchParams();
  const pedido = params.get("pedido") ?? "";
  const resultado = params.get("resultado");
  const veioDoBanco = params.get("origem") === "banco";
  const [estado, setEstado] = React.useState<"aguardando" | "pago" | "pendente" | "erro">("aguardando");
  const [mensagem, setMensagem] = React.useState("Confirmando o pagamento…");
  const [email, setEmail] = React.useState("");
  const [acessoEnviado, setAcessoEnviado] = React.useState(true);
  const login = linkDoSistema("/login");

  const url = urlApi("/assinatura/sincronizar");
  // Casos que não precisam consultar a API.
  const fixo: { estado: "pendente" | "erro"; mensagem: string } | null =
    resultado === "recusado"
      ? { estado: "erro", mensagem: "O pagamento não foi concluído." }
      : !pedido
        ? { estado: "pendente", mensagem: "Não encontramos este pedido." }
        : !url
          ? { estado: "erro", mensagem: "O endereço da API não está configurado." }
          : null;
  const temFixo = fixo !== null;

  React.useEffect(() => {
    if (temFixo || !url) return;

    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Pix pode levar alguns segundos para compensar: consulta de novo enquanto estiver pendente.
    const consultar = async (tentativa: number) => {
      try {
        const resposta = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pedidoId: pedido }),
        });
        const json = (await resposta.json().catch(() => null)) as {
          message?: string;
          mensagem?: string;
          email?: string;
          status?: string;
          acessoEnviado?: boolean;
        } | null;
        if (!ativo) return;
        if (!resposta.ok) {
          setEstado("erro");
          setMensagem(json?.message || "Não foi possível confirmar o pagamento.");
          return;
        }
        setMensagem(json?.mensagem || "Pagamento recebido.");
        setEmail(json?.email || "");
        setAcessoEnviado(json?.acessoEnviado !== false);
        const status = json?.status;
        setEstado(
          status === "pago"
            ? "pago"
            : status === "revisao" || status === "estornado" || status === "recusado"
              ? "erro"
              : "pendente",
        );
        if (status === "pendente" && tentativa < 6) {
          timer = setTimeout(() => void consultar(tentativa + 1), 5000);
        }
      } catch {
        if (!ativo) return;
        setEstado("erro");
        setMensagem("Não foi possível confirmar o pagamento.");
      }
    };
    void consultar(1);

    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
    };
  }, [pedido, url, temFixo]);

  const estadoTela = fixo?.estado ?? estado;
  const mensagemTela = fixo?.mensagem ?? mensagem;

  return (
    <MolduraAssinatura>
      <div className="rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">{mensagemTela}</h1>
        {estadoTela === "pago" && email && acessoEnviado ? (
          <p className="mt-3 text-sm text-ja-muted">O acesso foi enviado para {email}.</p>
        ) : null}
        {estadoTela === "pendente" && (resultado === "pendente" || !resultado) ? (
          <p className="mt-3 text-sm text-ja-muted">
            {veioDoBanco
              ? "Se você já confirmou com o banco, o acesso chega no e-mail do administrador em alguns minutos. Nada é cobrado antes dessa confirmação. Você pode fechar esta página."
              : "Assim que o Mercado Pago confirmar, o acesso chega no e-mail do administrador. Você pode fechar esta página."}
          </p>
        ) : null}
        <div className="mt-6">
          {estadoTela === "pago" && login ? (
            <a
              href={login}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ja-teal px-5 text-sm font-semibold text-white hover:bg-ja-teal-hover"
            >
              Ir para o sistema
            </a>
          ) : (
            <Link
              href="/#planos"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ja-line px-5 text-sm font-semibold text-ja-ink hover:bg-ja-surface"
            >
              Voltar aos planos
            </Link>
          )}
        </div>
      </div>
    </MolduraAssinatura>
  );
}

export default function RetornoPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-sm text-ja-muted">Confirmando o pagamento…</p>}>
      <RetornoPagamento />
    </Suspense>
  );
}
