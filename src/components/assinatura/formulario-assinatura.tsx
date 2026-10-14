"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { CartaoMercadoPago, type CartaoDoFormulario } from "@/components/assinatura/cartao-mercado-pago";
import { ConfirmacaoBanco } from "@/components/assinatura/confirmacao-banco";
import { PixMercadoPago, type PixGerado } from "@/components/assinatura/pix-mercado-pago";
import { formatarCnpj, formatarTelefone } from "@/lib/mascara";
import { linkDoSistema, reais, urlApi } from "@/lib/planos-publicos";
import { campoDoErro, cnpjValido, MENSAGEM_CNPJ, MENSAGEM_TELEFONE, telefoneValido } from "@/lib/validacao";

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

type Meio = "cartao" | "pix";

/** Mensal: cartão ou Pix, pago todo mês. Anual: cartão em até 12x ou Pix à vista. */
function meios(anual: boolean): { valor: Meio; rotulo: string; detalhe: string }[] {
  return [
    {
      valor: "cartao",
      rotulo: "Cartão de crédito",
      detalhe: anual
        ? "À vista ou em até 12x."
        : "À vista. Você paga todo mês, e avisamos por e-mail antes do vencimento.",
    },
    {
      valor: "pix",
      rotulo: "Pix",
      detalhe: anual ? "À vista. O QR Code aparece aqui mesmo." : "Você paga todo mês. Avisamos por e-mail antes do vencimento.",
    },
  ];
}

/** Pix gerado e mostrado na página até ser pago. */
interface PixNaTela {
  pedidoId: string;
  pix: PixGerado;
}

type CampoConferido = "telefone" | "cnpj";

const CAMPO =
  "mt-1.5 w-full rounded-xl border bg-ja-surface px-3 py-2.5 text-sm text-ja-ink focus:border-transparent focus:outline-none focus:ring-2";

/** Falha de rede vira mensagem em português; erro da API já vem pronto para a tela. */
function mensagemDoErro(err: unknown, padrao: string) {
  if (err instanceof TypeError) return "Não foi possível falar com o servidor. Confira a internet e tente de novo.";
  return err instanceof Error && err.message ? err.message : padrao;
}

export function FormularioAssinatura({ plano, nomePlano, preco, modo, ciclo, iniciais }: FormularioAssinaturaProps) {
  const router = useRouter();
  const [valores, setValores] = React.useState({
    ...VAZIO,
    telefone: formatarTelefone(iniciais?.telefone?.trim() || ""),
    adminNome: iniciais?.adminNome?.trim() || "",
    adminEmail: iniciais?.adminEmail?.trim() || "",
  });
  const [invalido, setInvalido] = React.useState<CampoConferido | null>(null);
  const [enviando, setEnviando] = React.useState(false);
  const [resultado, setResultado] = React.useState<Resultado | null>(null);
  const [etapa, setEtapa] = React.useState<1 | 2>(1);
  const [meio, setMeio] = React.useState<Meio>("cartao");
  const pago = modo === "pago";
  const anual = pago && ciclo === "anual";
  // Mensal no cartão: à vista. Anual no cartão: em até 12x. Pix: QR Code aqui mesmo.
  const escolheMeio = pago;
  // Cartão: digitado aqui no formulário do Mercado Pago, sem login em conta nenhuma.
  const pedeCartao = escolheMeio && meio === "cartao";
  const [cartaoAberto, setCartaoAberto] = React.useState(false);
  const [pix, setPix] = React.useState<PixNaTela | null>(null);
  /** Cartão com 3DS: o banco pediu confirmação antes do resultado. */
  const [desafio, setDesafio] = React.useState<{ url: string; retorno: string } | null>(null);
  const cartaoRef = React.useRef<HTMLDivElement>(null);
  const login = linkDoSistema("/login");

  function alterar(campo: keyof typeof VAZIO, valor: string) {
    const formatado =
      campo === "telefone" ? formatarTelefone(valor) : campo === "cnpj" ? formatarCnpj(valor) : valor;
    setValores((atual) => ({ ...atual, [campo]: formatado }));
    if (campo === invalido) setInvalido(null);
  }

  /** Marca o campo, avisa no toast e leva o cursor até ele. */
  function apontar(campo: CampoConferido, mensagem: string) {
    setInvalido(campo);
    toast.error(mensagem);
    window.setTimeout(() => document.getElementById(campo)?.focus(), 0);
  }

  /** Confere telefone e CNPJ antes de enviar (na ordem em que aparecem na tela). */
  function conferir(campos: CampoConferido[]) {
    for (const campo of campos) {
      if (campo === "cnpj" && !cnpjValido(valores.cnpj)) {
        apontar("cnpj", MENSAGEM_CNPJ);
        return false;
      }
      if (campo === "telefone" && !telefoneValido(valores.telefone)) {
        apontar("telefone", MENSAGEM_TELEFONE);
        return false;
      }
    }
    return true;
  }

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!pago && etapa === 1) {
      if (!conferir(["telefone"])) return;
      setValores((atual) => ({
        ...atual,
        emailClinica: atual.emailClinica.trim() || atual.adminEmail.trim(),
      }));
      setEtapa(2);
      return;
    }
    if (!conferir(["cnpj", "telefone"])) return;
    if (pedeCartao) {
      setCartaoAberto(true);
      rolarAtePagamento();
      return;
    }
    void concluir();
  }

  function rolarAtePagamento() {
    window.setTimeout(() => cartaoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  /** Cartão do formulário: confere os dados de novo (podem ter mudado) e envia. Lança para o cartão aceitar outra tentativa. */
  async function pagarComCartao(cartao: CartaoDoFormulario) {
    if (!conferir(["cnpj", "telefone"])) throw new Error("Confira os dados da clínica.");
    const ok = await concluir(cartao);
    if (!ok) throw new Error("Pagamento não concluído.");
  }

  async function concluir(cartao?: CartaoDoFormulario): Promise<boolean> {
    setEnviando(true);

    const base = urlApi(`/assinatura/${pago ? "checkout" : "gratuito"}`);
    const corpo = {
      plano,
      ciclo: pago ? ciclo : "mensal",
      ...(escolheMeio ? { meio } : {}),
      ...(cartao ? { cartao } : {}),
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
        | (Resultado & {
            checkoutUrl?: string | null;
            pedidoId?: string | null;
            pix?: PixGerado | null;
            desafio?: string | null;
            message?: string;
          })
        | null;
      if (!resposta.ok) {
        throw new Error(json?.message || "Não foi possível concluir a assinatura.");
      }
      if (pago && json?.pix && json.pedidoId) {
        setPix({ pedidoId: json.pedidoId, pix: json.pix });
        rolarAtePagamento();
        return true;
      }
      if (pago && json?.desafio && json.checkoutUrl) {
        setDesafio({ url: json.desafio, retorno: json.checkoutUrl });
        return true;
      }
      if (pago && json?.checkoutUrl) {
        if (json.checkoutUrl.startsWith("http")) {
          window.location.assign(json.checkoutUrl);
          return true;
        }
        router.push(json.checkoutUrl);
        return true;
      }
      setResultado({
        mensagem: json?.mensagem || "Enviamos o acesso para o e-mail do administrador.",
        email: json?.email || valores.adminEmail,
        senhaTemporaria: json?.senhaTemporaria,
      });
      return true;
    } catch (err) {
      const mensagem = mensagemDoErro(err, "Não foi possível concluir a assinatura.");
      const campo = campoDoErro(mensagem);
      if (campo) apontar(campo, mensagem);
      else toast.error(mensagem);
      return false;
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
    <>
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
          ? "Pague o ano no Pix à vista ou no cartão em até 12x, aqui mesmo. Depois do pagamento, o acesso chega no e-mail do administrador."
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(pago || etapa === 2) && (
          <>
            <Campo rotulo="Nome fantasia" valor={valores.nomeFantasia} onChange={(valor) => alterar("nomeFantasia", valor)} />
            <Campo rotulo="Razão social" valor={valores.razaoSocial} onChange={(valor) => alterar("razaoSocial", valor)} />
            <Campo
              rotulo="CNPJ"
              valor={valores.cnpj}
              invalido={invalido === "cnpj"}
              onChange={(valor) => alterar("cnpj", valor)}
            />
            <Campo
              rotulo="Telefone"
              tipo="tel"
              valor={valores.telefone}
              invalido={invalido === "telefone"}
              onChange={(valor) => alterar("telefone", valor)}
            />
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
          <Campo
            rotulo="Telefone"
            tipo="tel"
            valor={valores.telefone}
            invalido={invalido === "telefone"}
            onChange={(valor) => alterar("telefone", valor)}
          />
        ) : null}
      </div>

      {escolheMeio ? (
        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-wider text-ja-ink">Como pagar</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {meios(anual).map((item) => {
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
                    onChange={() => {
                      setMeio(item.valor);
                      setPix(null);
                      if (item.valor !== "cartao") setCartaoAberto(false);
                    }}
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
              setInvalido(null);
              setEtapa(1);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-ja-line px-5 text-sm font-semibold text-ja-ink hover:bg-ja-surface"
          >
            Voltar
          </button>
        ) : null}
        {(pedeCartao && cartaoAberto) || pix ? null : (
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ja-teal px-5 text-sm font-semibold text-white hover:bg-ja-teal-hover disabled:opacity-60"
          >
            {enviando
              ? "Enviando…"
              : !pago && etapa === 1
                ? "Continuar"
                : pedeCartao
                  ? "Continuar para o cartão"
                  : pago
                    ? "Gerar Pix"
                    : "Começar 7 dias grátis"}
          </button>
        )}
        <Link href="/#planos" className="text-sm font-medium text-ja-muted hover:text-ja-ink">
          Trocar plano
        </Link>
      </div>
    </form>
    {desafio ? (
      <ConfirmacaoBanco url={desafio.url} onConcluida={() => router.push(desafio.retorno)} />
    ) : null}
    {pix ? (
      <div ref={cartaoRef} className="mt-4 scroll-mt-6 rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">Pix</p>
        <div className="mt-4">
          <PixMercadoPago
            pedidoId={pix.pedidoId}
            pix={pix.pix}
            valor={preco}
            onConcluido={() => router.push(`/assinatura/retorno?pedido=${pix.pedidoId}`)}
            onVoltar={() => setPix(null)}
          />
        </div>
      </div>
    ) : pedeCartao && cartaoAberto ? (
      <div ref={cartaoRef} className="mt-4 scroll-mt-6 rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">Cartão de crédito</p>
        <p className="mt-2 text-sm text-ja-muted">
          {anual
            ? `${reais(preco)} pelo ano, à vista ou em até 12x no cartão.`
            : `${reais(preco)} à vista, referente ao primeiro mês. Os próximos meses são pagos pelo sistema, no cartão ou no Pix.`}
        </p>
        <div className="mt-4">
          <CartaoMercadoPago
            valor={preco}
            email={valores.adminEmail.trim()}
            parcelasMaximas={anual ? 12 : 1}
            onCartao={pagarComCartao}
          />
        </div>
      </div>
    ) : null}
    </>
  );
}

function Campo({
  rotulo,
  valor,
  onChange,
  tipo = "text",
  invalido = false,
}: {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: string;
  invalido?: boolean;
}) {
  const id = rotulo.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="text-xs font-semibold uppercase tracking-wider text-ja-ink">{rotulo}</span>
      <input
        id={id}
        required
        type={tipo}
        value={valor}
        aria-invalid={invalido || undefined}
        onChange={(evento) => onChange(evento.target.value)}
        className={`${CAMPO} ${invalido ? "border-red-500 focus:ring-red-500" : "border-ja-line focus:ring-ja-teal"}`}
      />
    </label>
  );
}
