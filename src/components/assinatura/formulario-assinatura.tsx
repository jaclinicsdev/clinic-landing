"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { formatarCnpj, formatarTelefone } from "@/lib/mascara";
import { linkDoSistema, reais, urlApi } from "@/lib/planos-publicos";

interface FormularioAssinaturaProps {
  plano: string;
  nomePlano: string;
  preco: number;
  modo: "gratuito" | "pago";
  ciclo: "mensal" | "anual";
  iniciais?: {
    adminNome?: string;
    adminEmail?: string;
    telefone?: string;
  };
}

interface Resultado {
  mensagem: string;
  email: string;
  senhaTemporaria?: string;
}

const VAZIO = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  telefone: "",
  emailClinica: "",
  unidadeNome: "Matriz",
  cidade: "",
  adminNome: "",
  adminEmail: "",
};

const MEIOS = [
  {
    valor: "cartao",
    rotulo: "Cartão de crédito",
    detalhe: "Cobrado agora e depois todo mês, automaticamente. Dá para desligar quando quiser.",
  },
  { valor: "pix", rotulo: "Pix", detalhe: "Você paga todo mês. Avisamos por e-mail antes do vencimento." },
] as const;

type Meio = (typeof MEIOS)[number]["valor"];

const CAMPO =
  "mt-1.5 w-full rounded-xl border border-ja-line bg-ja-surface px-3 py-2.5 text-sm text-ja-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ja-teal";

export function FormularioAssinatura({ plano, nomePlano, preco, modo, ciclo, iniciais }: FormularioAssinaturaProps) {
  const router = useRouter();
  const [valores, setValores] = React.useState({
    ...VAZIO,
    telefone: formatarTelefone(iniciais?.telefone?.trim() || ""),
    adminNome: iniciais?.adminNome?.trim() || "",
    adminEmail: iniciais?.adminEmail?.trim() || "",
  });
  const [erro, setErro] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);
  const [resultado, setResultado] = React.useState<Resultado | null>(null);
  const [etapa, setEtapa] = React.useState<1 | 2>(1);
  const [meio, setMeio] = React.useState<Meio>("cartao");
  const pago = modo === "pago";
  const anual = pago && ciclo === "anual";
  // Mensal pago: no cartão já vira cobrança automática; no Pix, pagamento avulso todo mês.
  const escolheMeio = pago && !anual;
  const login = linkDoSistema("/login");

  function alterar(campo: keyof typeof VAZIO, valor: string) {
    const formatado =
      campo === "telefone" ? formatarTelefone(valor) : campo === "cnpj" ? formatarCnpj(valor) : valor;
    setValores((atual) => ({ ...atual, [campo]: formatado }));
  }

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!pago && etapa === 1) {
      setErro("");
      setValores((atual) => ({
        ...atual,
        emailClinica: atual.emailClinica.trim() || atual.adminEmail.trim(),
      }));
      setEtapa(2);
      return;
    }
    void concluir();
  }

  async function concluir() {
    setErro("");
    setEnviando(true);

    const base = urlApi(`/assinatura/${pago ? "checkout" : "gratuito"}`);
    const corpo = {
      plano,
      ciclo: pago ? ciclo : "mensal",
      ...(escolheMeio ? { meio } : {}),
      clinica: {
        nomeFantasia: valores.nomeFantasia,
        razaoSocial: valores.razaoSocial,
        cnpj: valores.cnpj,
        telefone: valores.telefone,
        email: valores.emailClinica,
      },
      unidade: { nome: valores.unidadeNome, cidade: valores.cidade },
      usuario: { nome: valores.adminNome, email: valores.adminEmail },
    };

    try {
      if (!base) throw new Error("O endereço da API não está configurado.");
      const resposta = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const json = (await resposta.json().catch(() => null)) as
        | (Resultado & { checkoutUrl?: string; message?: string })
        | null;
      if (!resposta.ok) {
        throw new Error(json?.message || "Não foi possível concluir a assinatura.");
      }
      if (pago && json?.checkoutUrl) {
        if (json.checkoutUrl.startsWith("http")) {
          window.location.assign(json.checkoutUrl);
          return;
        }
        router.push(json.checkoutUrl);
        return;
      }
      setResultado({
        mensagem: json?.mensagem || "Enviamos o acesso para o e-mail do administrador.",
        email: json?.email || valores.adminEmail,
        senhaTemporaria: json?.senhaTemporaria,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível concluir a assinatura.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">Acesso</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{resultado.mensagem}</h1>
        <p className="mt-3 text-sm leading-relaxed text-ja-muted">
          O login de administrador foi enviado para {resultado.email}. Entre no sistema com esse e-mail.
        </p>
        {resultado.senhaTemporaria ? (
          <p className="mt-4 rounded-xl bg-ja-surface px-3 py-2 text-sm text-ja-ink">
            Senha temporária deste ambiente: <span className="font-semibold">{resultado.senhaTemporaria}</span>
          </p>
        ) : null}
        {login ? (
          <a
            href={login}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-ja-teal px-5 text-sm font-semibold text-white hover:bg-ja-teal-hover"
          >
            Ir para o sistema
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={aoEnviar} className="rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">
        {pago ? "Assinatura" : "Acesso gratuito"}
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        {nomePlano}
        <span className="ml-2 text-base font-semibold text-ja-muted">
          {reais(preco)}
          {anual ? " por ano" : "/mês"}
        </span>
      </h1>
      <p className="mt-2 text-sm text-ja-muted">
        {anual
          ? "No Mercado Pago, pague o ano no Pix à vista ou no cartão em até 12x. Depois do pagamento, o acesso chega no e-mail do administrador."
          : pago
            ? "Escolha como pagar a mensalidade. Depois do primeiro pagamento, o acesso chega no e-mail do administrador."
            : etapa === 1
              ? "Primeiro, quem vai administrar a clínica. A senha temporária chega nesse e-mail."
              : "Agora os dados da clínica. São 7 dias no plano escolhido, sem cartão."}
      </p>
      {!pago ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden>
            <span className="h-1 flex-1 rounded-full bg-ja-teal" />
            <span className={`h-1 flex-1 rounded-full ${etapa === 2 ? "bg-ja-teal" : "bg-ja-line"}`} />
          </div>
          <p className="text-xs font-semibold text-ja-muted">Etapa {etapa} de 2</p>
        </div>
      ) : null}

      {erro ? (
        <p role="alert" className="mt-4 rounded-xl border border-ja-line bg-ja-surface px-3 py-2 text-sm text-ja-ink">
          {erro}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(pago || etapa === 2) && (
          <>
            <Campo rotulo="Nome fantasia" valor={valores.nomeFantasia} onChange={(valor) => alterar("nomeFantasia", valor)} />
            <Campo rotulo="Razão social" valor={valores.razaoSocial} onChange={(valor) => alterar("razaoSocial", valor)} />
            <Campo rotulo="CNPJ" valor={valores.cnpj} onChange={(valor) => alterar("cnpj", valor)} />
            <Campo rotulo="Telefone" valor={valores.telefone} onChange={(valor) => alterar("telefone", valor)} />
            <Campo rotulo="E-mail da clínica" tipo="email" valor={valores.emailClinica} onChange={(valor) => alterar("emailClinica", valor)} />
            <Campo rotulo="Cidade da unidade" valor={valores.cidade} onChange={(valor) => alterar("cidade", valor)} />
            <Campo rotulo="Nome da unidade" valor={valores.unidadeNome} onChange={(valor) => alterar("unidadeNome", valor)} />
          </>
        )}
        {(pago || etapa === 1) && (
          <>
            <Campo rotulo="Nome do administrador" valor={valores.adminNome} onChange={(valor) => alterar("adminNome", valor)} />
            <div className="sm:col-span-2">
              <Campo
                rotulo="E-mail do administrador"
                tipo="email"
                valor={valores.adminEmail}
                onChange={(valor) => alterar("adminEmail", valor)}
              />
              <p className="mt-1 text-xs text-ja-muted">O acesso é enviado para este e-mail.</p>
            </div>
          </>
        )}
        {!pago && etapa === 1 ? (
          <Campo rotulo="Telefone" valor={valores.telefone} onChange={(valor) => alterar("telefone", valor)} />
        ) : null}
      </div>

      {escolheMeio ? (
        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-wider text-ja-ink">Como pagar</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {MEIOS.map((item) => {
              const ativo = item.valor === meio;
              return (
                <label
                  key={item.valor}
                  className={`flex cursor-pointer flex-col rounded-xl border p-3 transition-colors ${
                    ativo ? "border-ja-teal bg-ja-surface" : "border-ja-line hover:bg-ja-surface"
                  }`}
                >
                  <input
                    type="radio"
                    name="meio"
                    value={item.valor}
                    checked={ativo}
                    onChange={() => setMeio(item.valor)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-ja-ink">{item.rotulo}</span>
                  <span className="mt-0.5 text-xs text-ja-muted">{item.detalhe}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!pago && etapa === 2 ? (
          <button
            type="button"
            onClick={() => {
              setErro("");
              setEtapa(1);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ja-line px-5 text-sm font-semibold text-ja-ink hover:bg-ja-surface"
          >
            Voltar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ja-teal px-5 text-sm font-semibold text-white hover:bg-ja-teal-hover disabled:opacity-60"
        >
          {enviando
            ? "Enviando…"
            : !pago && etapa === 1
              ? "Continuar"
              : anual
                ? "Ir para o pagamento anual"
                : pago
                  ? "Ir para o pagamento"
                  : "Começar 7 dias grátis"}
        </button>
        <Link href="/#planos" className="text-sm font-medium text-ja-muted hover:text-ja-ink">
          Trocar plano
        </Link>
      </div>
    </form>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  tipo = "text",
}: {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: string;
}) {
  const id = rotulo.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wider text-ja-ink">{rotulo}</span>
      <input id={id} required type={tipo} value={valor} onChange={(evento) => onChange(evento.target.value)} className={CAMPO} />
    </label>
  );
}
