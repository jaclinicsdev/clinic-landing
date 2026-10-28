"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { AceiteTermos } from "@/components/assinatura/aceite-termos";
import { PixMercadoPago, type PixGerado } from "@/components/assinatura/pix-mercado-pago";
import { formatarCnpj, formatarTelefone } from "@/lib/mascara";
import { normalizarCodigoCupom, valorComDesconto } from "@/lib/cupom";
import { linkDoSistema, reais, urlApi, type PlanoPublico } from "@/lib/planos-publicos";
import { avisoDeEmail, campoDoErro, cnpjValido, MENSAGEM_CNPJ, MENSAGEM_TELEFONE, telefoneValido } from "@/lib/validacao";

interface FormularioAssinaturaProps {
  plano: string;
  nomePlano: string;
  preco: number;
  modo: "gratuito" | "pago";
  ciclo: "mensal" | "anual";
  implementacao?: number | null;
  planos?: PlanoPublico[];
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

/** Página do Mercado Pago (endereço https), onde o cartão é pago. */
function paginaDoMercadoPago(url: string) {
  try {
    const endereco = new URL(url);
    const host = endereco.hostname.toLowerCase();
    return (
      endereco.protocol === "https:" &&
      (host.includes("mercadopago") || host.includes("mercadolibre") || host.endsWith("mlstatic.com"))
    );
  } catch {
    return false;
  }
}

/** Mensal: cartão com cobrança automática ou Pix todo mês. Anual: cartão em até 12x ou Pix à vista. */
function meios(anual: boolean): { valor: Meio; rotulo: string; detalhe: string }[] {
  return [
    {
      valor: "cartao",
      rotulo: "Cartão de crédito",
      detalhe: anual
        ? "À vista ou em até 12x, na página do Mercado Pago."
        : "Cadastrado no Mercado Pago e cobrado todo mês. Dá para desligar quando quiser.",
    },
    {
      valor: "pix",
      rotulo: "Pix",
      detalhe: anual
        ? "À vista. O QR Code aparece nesta página."
        : "O QR Code aparece nesta página. Avisamos por e-mail antes do vencimento.",
    },
  ];
}

/** Pix gerado e mostrado na página até ser pago. */
interface PixNaTela {
  pedidoId: string;
  pix: PixGerado;
}

type CampoConferido = "telefone" | "cnpj" | "email";

const CAMPO =
  "mt-1.5 w-full rounded-xl border bg-ja-surface px-3 py-2.5 text-sm text-ja-ink focus:border-transparent focus:outline-none focus:ring-2";

/** Falha de rede vira mensagem em português; erro da API já vem pronto para a tela. */
function mensagemDoErro(err: unknown, padrao: string) {
  if (err instanceof TypeError) return "Não foi possível falar com o servidor. Confira a internet e tente de novo.";
  return err instanceof Error && err.message ? err.message : padrao;
}

export function FormularioAssinatura({ plano, nomePlano, preco, modo, ciclo, implementacao = null, planos = [], iniciais }: FormularioAssinaturaProps) {
  const router = useRouter();
  const [valores, setValores] = React.useState({
    ...VAZIO,
    telefone: formatarTelefone(iniciais?.telefone?.trim() || ""),
    adminNome: iniciais?.adminNome?.trim() || "",
    adminEmail: iniciais?.adminEmail?.trim() || "",
  });
  const [selecao, setSelecao] = React.useState({ codigo: plano, ciclo });
  const [invalido, setInvalido] = React.useState<CampoConferido | null>(null);
  const [aceitouTermos, setAceitouTermos] = React.useState(false);
  const [termosInvalidos, setTermosInvalidos] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [resultado, setResultado] = React.useState<Resultado | null>(null);
  const [etapa, setEtapa] = React.useState<1 | 2>(1);
  const [meio, setMeio] = React.useState<Meio>("cartao");
  const pago = modo === "pago";
  const [pix, setPix] = React.useState<PixNaTela | null>(null);
  const [cupomDigitado, setCupomDigitado] = React.useState("");
  const [cupom, setCupom] = React.useState<{ codigo: string; percentual: number } | null>(null);
  const [querCupom, setQuerCupom] = React.useState(false);
  const [querImplementacao, setQuerImplementacao] = React.useState(false);
  const [validandoCupom, setValidandoCupom] = React.useState(false);
  const pixRef = React.useRef<HTMLDivElement>(null);
  const login = linkDoSistema("/login");
  const catalogo = planos.filter((item) => item.precoMensal > 0);
  const planoEscolhido =
    catalogo.find((item) => item.codigo === selecao.codigo) ??
    ({
      codigo: plano,
      nome: nomePlano,
      precoMensal: ciclo === "anual" ? 0 : preco,
      precoAnual: ciclo === "anual" ? preco : 0,
    } satisfies PlanoPublico);
  const cicloEscolhido: "mensal" | "anual" =
    selecao.ciclo === "anual" && planoEscolhido.precoAnual > 0 ? "anual" : "mensal";
  const anual = pago && cicloEscolhido === "anual";
  const precoEscolhido = anual
    ? planoEscolhido.precoAnual
    : planoEscolhido.precoMensal > 0
      ? planoEscolhido.precoMensal
      : preco;
  const precoFinal = pago && cupom ? valorComDesconto(precoEscolhido, cupom.percentual) : precoEscolhido;
  const comImplementacao =
    pago && planoEscolhido.codigo === "essencial" && querImplementacao && implementacao != null && implementacao > 0;
  const total = precoFinal + (comImplementacao && implementacao ? implementacao : 0);
  // Mensal no cartão: cobrança automática. Anual no cartão: em até 12x. Pix: QR Code aqui mesmo.
  const escolheMeio = pago;
  // Cartão: pago na página do Mercado Pago. No anual, é o checkout dele, à vista ou em até 12x.
  const cartaoNoMercadoPago = escolheMeio && meio === "cartao";
  // Mensal no cartão: o cartão é cadastrado na página de assinatura do Mercado Pago, que cobra todo mês.
  const assinaturaNoMercadoPago = cartaoNoMercadoPago && !anual;

  function aoDigitarCupom(valor: string) {
    setCupomDigitado(valor);
    const normalizado = normalizarCodigoCupom(valor);
    setCupom((atual) => (atual && atual.codigo === normalizado ? atual : null));
  }

  async function aplicarCupom() {
    const codigo = normalizarCodigoCupom(cupomDigitado);
    if (!codigo) {
      setCupom(null);
      return;
    }
    setValidandoCupom(true);
    try {
      const base = urlApi("/assinatura/cupom");
      if (!base) throw new Error("O endereço da API não está configurado.");
      const resposta = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      const json = (await resposta.json().catch(() => null)) as { codigo?: string; percentual?: number; message?: string } | null;
      if (!resposta.ok || !json?.codigo || typeof json.percentual !== "number") {
        throw new Error(json?.message || "Cupom inválido ou inativo.");
      }
      if (valorComDesconto(precoEscolhido, json.percentual) < 1) {
        setCupom(null);
        toast.error("Este cupom deixa a assinatura abaixo de R$ 1,00.");
        return;
      }
      setCupom({ codigo: json.codigo, percentual: json.percentual });
      setCupomDigitado(json.codigo);
    } catch (err) {
      setCupom(null);
      toast.error(mensagemDoErro(err, "Cupom inválido ou inativo."));
    } finally {
      setValidandoCupom(false);
    }
  }

  React.useEffect(() => {
    setSelecao({ codigo: plano, ciclo });
  }, [plano, ciclo]);

  React.useEffect(() => {
    if (!cupom) return;
    if (valorComDesconto(precoEscolhido, cupom.percentual) >= 1) return;
    setCupom(null);
    toast.error("Este cupom deixa a assinatura abaixo de R$ 1,00 neste plano.");
  }, [cupom, precoEscolhido]);

  // Volta do Mercado Pago pelo botão do navegador: a página pode voltar da memória com o envio em andamento.
  React.useEffect(() => {
    function aoMostrar(evento: PageTransitionEvent) {
      if (evento.persisted) setEnviando(false);
    }
    window.addEventListener("pageshow", aoMostrar);
    return () => window.removeEventListener("pageshow", aoMostrar);
  }, []);

  function escolher(codigo: string, novoCiclo: "mensal" | "anual") {
    const destino = catalogo.find((item) => item.codigo === codigo);
    if (!destino) return;
    const cicloFinal = novoCiclo === "anual" && destino.precoAnual > 0 ? "anual" : "mensal";
    setSelecao({ codigo, ciclo: cicloFinal });
    setPix(null);
    const params = new URLSearchParams(window.location.search);
    params.set("plano", codigo);
    params.set("modo", modo);
    params.set("ciclo", cicloFinal);
    window.history.replaceState(null, "", `/assinar?${params.toString()}`);
  }

  function alternarCupom(marcado: boolean) {
    setQuerCupom(marcado);
    if (!marcado) {
      setCupom(null);
      setCupomDigitado("");
    }
  }

  function alterar(campo: keyof typeof VAZIO, valor: string) {
    const formatado =
      campo === "telefone" ? formatarTelefone(valor) : campo === "cnpj" ? formatarCnpj(valor) : valor;
    setValores((atual) => ({ ...atual, [campo]: formatado }));
    if (campo === invalido || (campo === "adminEmail" && invalido === "email")) setInvalido(null);
  }

  /** Marca o campo, avisa no toast e leva o cursor até ele. */
  function apontar(campo: CampoConferido, mensagem: string) {
    setInvalido(campo);
    toast.error(mensagem);
    const foco = campo === "email" ? "e-mail-do-administrador" : campo;
    window.setTimeout(() => document.getElementById(foco)?.focus(), 0);
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
      if (campo === "email") {
        const aviso = avisoDeEmail(valores.adminEmail);
        if (aviso) {
          apontar("email", aviso);
          return false;
        }
      }
    }
    return true;
  }

  function exigirTermos() {
    if (aceitouTermos) return true;
    setTermosInvalidos(true);
    toast.error("Marque “Declaro que aceito os termos de uso” para continuar.");
    window.setTimeout(() => document.getElementById("aceite-termos")?.focus(), 0);
    return false;
  }

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!pago && etapa === 1) {
      if (!conferir(["email", "telefone"])) return;
      if (!exigirTermos()) return;
      setValores((atual) => ({
        ...atual,
        emailClinica: atual.emailClinica.trim() || atual.adminEmail.trim(),
      }));
      setEtapa(2);
      return;
    }
    if (!conferir(["email", "cnpj", "telefone"])) return;
    if (!exigirTermos()) return;
    void concluir();
  }

  function rolarAtePagamento() {
    window.setTimeout(() => pixRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  async function concluir() {
    setEnviando(true);
    // Indo para o Mercado Pago: o botão segue carregando até a página trocar.
    let saindo = false;

    const base = urlApi(`/assinatura/${pago ? "checkout" : "gratuito"}`);
    const corpo = {
      plano: planoEscolhido.codigo,
      ciclo: pago ? cicloEscolhido : "mensal",
      ...(escolheMeio ? { meio } : {}),
      ...(pago && cupom ? { cupom: cupom.codigo } : {}),
      ...(comImplementacao ? { implementacao: true } : {}),
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
            message?: string;
          })
        | null;
      if (!resposta.ok) {
        throw new Error(json?.message || "Não foi possível concluir a assinatura.");
      }
      if (pago && json?.pix && json.pedidoId) {
        setPix({ pedidoId: json.pedidoId, pix: json.pix });
        rolarAtePagamento();
        return;
      }
      if (pago && json?.checkoutUrl) {
        // Cartão: pago na página do Mercado Pago, que depois volta para o retorno.
        if (cartaoNoMercadoPago && paginaDoMercadoPago(json.checkoutUrl)) {
          saindo = true;
          window.location.assign(json.checkoutUrl);
          return;
        }
        // Sem o Mercado Pago configurado (desenvolvimento), a confirmação é aqui no site.
        if (json.checkoutUrl.startsWith("/") && !json.checkoutUrl.startsWith("//")) {
          router.push(json.checkoutUrl);
          return;
        }
        toast.error("Não foi possível abrir a página de pagamento. Tente de novo.");
        return;
      }
      setResultado({
        mensagem: json?.mensagem || "Enviamos o acesso para o e-mail do administrador.",
        email: json?.email || valores.adminEmail,
        senhaTemporaria: json?.senhaTemporaria,
      });
    } catch (err) {
      const mensagem = mensagemDoErro(err, "Não foi possível concluir a assinatura.");
      const campo = campoDoErro(mensagem);
      if (campo) apontar(campo, mensagem);
      else toast.error(mensagem);
    } finally {
      if (!saindo) setEnviando(false);
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
    <form onSubmit={aoEnviar} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <aside className="rounded-2xl border border-ja-line bg-ja-card p-5 sm:p-6 lg:sticky lg:top-6 lg:order-2">
        <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">
          {pago ? "Assinatura" : "Acesso gratuito"}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">{planoEscolhido.nome}</h1>
        {pago && catalogo.length > 1 ? (
          <div className="mt-4 grid gap-2" role="group" aria-label="Plano">
            {catalogo.map((item) => {
              const ativo = item.codigo === planoEscolhido.codigo;
              return (
                <button
                  key={item.codigo}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => escolher(item.codigo, cicloEscolhido)}
                  className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                    ativo ? "border-ja-teal bg-ja-surface text-ja-ink" : "border-ja-line text-ja-muted hover:bg-ja-surface hover:text-ja-ink"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.nome}</span>
                  <span className={`mt-0.5 block text-xs font-medium ${ativo ? "text-ja-teal" : "text-ja-muted"}`}>
                    {cicloEscolhido === "anual" && item.precoAnual > 0
                      ? `${reais(item.precoAnual)} por ano`
                      : `${reais(item.precoMensal)} /mês`}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
        {pago && planoEscolhido.precoAnual > 0 ? (
          <div className="mt-4 grid grid-cols-2 rounded-xl border border-ja-line p-1" role="group" aria-label="Ciclo">
            {(["mensal", "anual"] as const).map((item) => {
              const ativo = item === cicloEscolhido;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => escolher(planoEscolhido.codigo, item)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${ativo ? "bg-ja-teal text-white" : "text-ja-muted hover:text-ja-ink"}`}
                >
                  {item === "mensal" ? "Mensal" : "Anual"}
                </button>
              );
            })}
          </div>
        ) : null}
        <div className="mt-5 border-t border-ja-line pt-5">
          {cupom ? (
            <p className="text-sm font-semibold text-ja-muted line-through">
              {reais(precoEscolhido)}
              {anual ? " por ano" : " /mês"}
            </p>
          ) : null}
          <p className="font-display text-4xl font-bold tracking-tight text-ja-ink">
            {pago ? reais(comImplementacao ? total : precoFinal) : "Grátis"}
          </p>
          <p className="mt-1 text-sm text-ja-muted">
            {comImplementacao
              ? `nesta cobrança · depois ${reais(precoFinal)}${anual ? " por ano" : " /mês"}`
              : pago
                ? anual
                  ? "pelo ano"
                  : "por mês"
                : "7 dias no plano escolhido"}
            {cupom ? ` · ${cupom.codigo} (${cupom.percentual}%)` : ""}
          </p>
        </div>
        {pago ? (
          <div className="mt-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ja-ink">
              <input
                type="checkbox"
                checked={querCupom}
                onChange={(evento) => alternarCupom(evento.target.checked)}
                className="size-4 accent-ja-teal"
              />
              Tenho um cupom
            </label>
            {querCupom ? (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input
                    id="cupom"
                    value={cupomDigitado}
                    onChange={(evento) => aoDigitarCupom(evento.target.value)}
                    placeholder="Código"
                    autoCapitalize="characters"
                    className="w-full rounded-xl border border-ja-line bg-ja-surface px-3 py-2.5 text-sm text-ja-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ja-teal"
                  />
                  <button
                    type="button"
                    onClick={() => void aplicarCupom()}
                    disabled={validandoCupom}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-ja-line px-3 text-sm font-semibold text-ja-ink hover:bg-ja-surface disabled:opacity-60"
                  >
                    {validandoCupom ? "…" : "Aplicar"}
                  </button>
                </div>
                {cupom ? (
                  <p className="mt-2 text-sm font-medium text-ja-teal">Desconto aplicado neste plano.</p>
                ) : cupomDigitado.trim() ? (
                  <p className="mt-2 text-xs text-ja-muted">Toque em Aplicar para atualizar o preço.</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        {pago && planoEscolhido.codigo === "essencial" && implementacao != null && implementacao > 0 ? (
          <div className="mt-4">
            <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-ja-ink">
              <input
                type="checkbox"
                checked={querImplementacao}
                onChange={(evento) => setQuerImplementacao(evento.target.checked)}
                className="mt-0.5 size-4 accent-ja-teal"
              />
              Quero implementação ({reais(implementacao)})
            </label>
            <p className="mt-1 pl-6 text-xs text-ja-muted">Entra só nesta cobrança. As seguintes ficam no preço do plano.</p>
          </div>
        ) : null}
        <Link href="/#planos" className="mt-5 inline-block text-sm font-medium text-ja-muted hover:text-ja-ink">
          Ver o que cada plano inclui
        </Link>
      </aside>

      <div className="rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
      <p className="text-sm text-ja-muted">
        {anual
          ? "Pague o ano no Pix à vista ou no cartão em até 12x. O acesso chega no e-mail do administrador."
          : pago
            ? "Preencha a clínica e escolha como pagar. O acesso chega no e-mail do administrador."
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

      {(pago || etapa === 2) ? <p className="mt-6 text-xs font-bold uppercase tracking-wider text-ja-ink">Clínica</p> : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <Campo largo rotulo="Nome da unidade" valor={valores.unidadeNome} onChange={(valor) => alterar("unidadeNome", valor)} />
          </>
        )}
        {(pago || etapa === 1) && (
          <>
            <p className="text-xs font-bold uppercase tracking-wider text-ja-ink sm:col-span-2">Administrador</p>
            <Campo largo rotulo="Nome do administrador" valor={valores.adminNome} onChange={(valor) => alterar("adminNome", valor)} />
            <div className="sm:col-span-2">
              <Campo
                rotulo="E-mail do administrador"
                tipo="email"
                valor={valores.adminEmail}
                invalido={invalido === "email"}
                onChange={(valor) => alterar("adminEmail", valor)}
              />
              <p className="mt-1 text-xs text-ja-muted">O acesso é enviado para este e-mail.</p>
            </div>
          </>
        )}
        {!pago && etapa === 1 ? (
          <Campo
            largo
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {meios(anual).map((item) => {
              const ativo = item.valor === meio;
              return (
                <label
                  key={item.valor}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
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
                    }}
                    className="mt-1 size-4 accent-ja-teal"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ja-ink">{item.rotulo}</span>
                    <span className="mt-0.5 block text-xs text-ja-muted">{item.detalhe}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {assinaturaNoMercadoPago ? (
            <p className="mt-3 text-sm text-ja-muted">
              O cartão é cadastrado na página do Mercado Pago. Entre lá com o e-mail do administrador
              {valores.adminEmail.trim() ? ` (${valores.adminEmail.trim()})` : ""}: a assinatura só é aceita com ele.
              A primeira mensalidade sai no cadastro do cartão e as seguintes, todo mês.
            </p>
          ) : null}
        </fieldset>
      ) : null}

      {pago || etapa === 1 ? (
        <div className="mt-6">
          <AceiteTermos
            marcado={aceitouTermos}
            invalido={termosInvalidos}
            onChange={(marcado) => {
              setAceitouTermos(marcado);
              if (marcado) setTermosInvalidos(false);
            }}
          />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
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
        {pix ? null : (
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ja-teal px-5 text-sm font-semibold text-white hover:bg-ja-teal-hover disabled:opacity-60"
          >
            {enviando
              ? "Enviando…"
              : !pago && etapa === 1
                ? "Continuar"
                : assinaturaNoMercadoPago
                  ? "Continuar no Mercado Pago"
                  : cartaoNoMercadoPago
                    ? `Continuar no Mercado Pago · ${reais(precoFinal)}`
                    : pago
                      ? `Gerar Pix · ${reais(precoFinal)}`
                      : "Começar 7 dias grátis"}
          </button>
        )}
      </div>
      </div>
    </form>
    {pix ? (
      <div ref={pixRef} className="mt-4 scroll-mt-6 rounded-2xl border border-ja-line bg-ja-card p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-ja-teal">Pix</p>
        <div className="mt-4">
          <PixMercadoPago
            pedidoId={pix.pedidoId}
            pix={pix.pix}
            valor={precoFinal}
            onConcluido={() => router.push(`/assinatura/retorno?pedido=${pix.pedidoId}`)}
            onVoltar={() => setPix(null)}
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
  largo = false,
}: {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: string;
  invalido?: boolean;
  /** Ocupa as duas colunas quando o campo ficaria sozinho na linha. */
  largo?: boolean;
}) {
  const id = rotulo.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className={`block text-sm ${largo ? "sm:col-span-2" : ""}`} htmlFor={id}>
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
