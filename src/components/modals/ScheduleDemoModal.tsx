"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AceiteTermos } from "@/components/assinatura/aceite-termos";
import { BRAND } from "@/lib/brand";
import { PLANOS, type PlanoComercial } from "@/lib/planos";
import { formatarCnpj, formatarTelefone } from "@/lib/mascara";
import { linkDoSistema, urlApi } from "@/lib/planos-publicos";
import { campoDoErro, cnpjValido, MENSAGEM_CNPJ, MENSAGEM_TELEFONE, telefoneValido } from "@/lib/validacao";

interface ScheduleDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  planoInicial?: PlanoComercial["codigo"];
  iniciais?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

const CLINICA_VAZIA = {
  nomeFantasia: "",
  razaoSocial: "",
  cnpj: "",
  emailClinica: "",
  cidade: "",
  unidadeNome: "Matriz",
};

const CAMPO_BASE =
  "w-full rounded-xl border bg-ja-surface py-2.5 pl-10 pr-3 text-sm text-ja-ink placeholder:text-ja-muted/80 focus:border-transparent focus:outline-none focus:ring-2";
const CAMPO = `${CAMPO_BASE} border-ja-line focus:ring-ja-teal`;
const CAMPO_INVALIDO = `${CAMPO_BASE} border-red-500 focus:ring-red-500`;

type CampoConferido = "telefone" | "cnpj";

/** Falha de rede vira mensagem em português; erro da API já vem pronto para a tela. */
function mensagemDoErro(err: unknown, padrao: string) {
  if (err instanceof TypeError) return "Não foi possível falar com o servidor. Confira a internet e tente de novo.";
  return err instanceof Error && err.message ? err.message : padrao;
}

export function ScheduleDemoModal({ isOpen, onClose, planoInicial, iniciais }: ScheduleDemoModalProps) {
  const [plano, setPlano] = useState<PlanoComercial["codigo"]>(planoInicial ?? "profissional");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [invalido, setInvalido] = useState<CampoConferido | null>(null);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [termosInvalidos, setTermosInvalidos] = useState(false);
  const [resultado, setResultado] = useState<{ mensagem: string; email: string; acessoEnviado: boolean } | null>(null);
  const [contato, setContato] = useState({
    nome: iniciais?.nome?.trim() || "",
    email: iniciais?.email?.trim() || "",
    telefone: formatarTelefone(iniciais?.telefone?.trim() || ""),
  });
  const [clinica, setClinica] = useState(CLINICA_VAZIA);
  const estavaAberto = useRef(false);
  const login = linkDoSistema("/login");
  const planoAtual = PLANOS.find((item) => item.codigo === plano);

  useEffect(() => {
    if (!isOpen) {
      estavaAberto.current = false;
      return;
    }
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!estavaAberto.current) {
      setEtapa(1);
      setInvalido(null);
      setAceitouTermos(false);
      setTermosInvalidos(false);
      setResultado(null);
      setPlano(planoInicial ?? "profissional");
    }
    estavaAberto.current = true;
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [isOpen, planoInicial]);

  function fechar() {
    onClose();
  }

  function alterarContato(campo: keyof typeof contato, valor: string) {
    const formatado = campo === "telefone" ? formatarTelefone(valor) : valor;
    setContato((atual) => ({ ...atual, [campo]: formatado }));
    if (campo === invalido) setInvalido(null);
  }

  function alterarClinica(campo: keyof typeof CLINICA_VAZIA, valor: string) {
    const formatado = campo === "cnpj" ? formatarCnpj(valor) : valor;
    setClinica((atual) => ({ ...atual, [campo]: formatado }));
    if (campo === invalido) setInvalido(null);
  }

  /** Marca o campo, avisa no toast e leva o cursor até ele (o telefone fica na primeira etapa). */
  function apontar(campo: CampoConferido, mensagem: string) {
    setInvalido(campo);
    if (campo === "telefone") setEtapa(1);
    toast.error(mensagem);
    window.setTimeout(() => document.getElementById(`demo-${campo}`)?.focus(), 50);
  }

  function avancar(evento: React.FormEvent) {
    evento.preventDefault();
    if (etapa === 1) {
      if (!telefoneValido(contato.telefone)) {
        apontar("telefone", MENSAGEM_TELEFONE);
        return;
      }
      if (!aceitouTermos) {
        setTermosInvalidos(true);
        toast.error("Marque “Declaro que aceito os termos de uso” para continuar.");
        return;
      }
      setClinica((atual) => ({
        ...atual,
        emailClinica: atual.emailClinica.trim() || contato.email.trim(),
        nomeFantasia: atual.nomeFantasia.trim(),
      }));
      setEtapa(2);
      return;
    }
    if (!cnpjValido(clinica.cnpj)) {
      apontar("cnpj", MENSAGEM_CNPJ);
      return;
    }
    void concluir();
  }

  async function concluir() {
    setEnviando(true);
    const base = urlApi("/assinatura/gratuito");
    try {
      if (!base) throw new Error("O endereço da API não está configurado.");
      const resposta = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano,
          ciclo: "mensal",
          clinica: {
            nomeFantasia: clinica.nomeFantasia,
            razaoSocial: clinica.razaoSocial,
            cnpj: clinica.cnpj,
            telefone: contato.telefone,
            email: clinica.emailClinica || contato.email,
          },
          unidade: { nome: clinica.unidadeNome, cidade: clinica.cidade },
          usuario: { nome: contato.nome, email: contato.email },
        }),
      });
      const json = (await resposta.json().catch(() => null)) as {
        mensagem?: string;
        email?: string;
        message?: string;
        acessoEnviado?: boolean;
      } | null;
      if (!resposta.ok) throw new Error(json?.message || "Não foi possível começar o teste.");
      setResultado({
        mensagem: json?.mensagem || "Enviamos o acesso para o e-mail do administrador.",
        acessoEnviado: json?.acessoEnviado !== false,
        email: json?.email || contato.email,
      });
    } catch (err) {
      const mensagem = mensagemDoErro(err, "Não foi possível começar o teste.");
      const campo = campoDoErro(mensagem);
      if (campo) apontar(campo, mensagem);
      else toast.error(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fechar}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
          />

          <div className="relative z-10 flex min-h-full items-center justify-center p-4 sm:p-6">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-teste"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", duration: 0.45, bounce: 0.18 }}
            className="w-full max-w-xl"
          >
            <div className="overflow-hidden rounded-3xl border border-ja-line bg-ja-card shadow-2xl">
            <div className="relative bg-ja-brand px-5 pb-5 pt-5 text-white sm:px-7">
              <button
                type="button"
                onClick={fechar}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/90 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                7 dias grátis · sem cartão
              </div>
              <h3 id="titulo-teste" className="mt-3 pr-10 font-display text-2xl font-bold text-white">
                {resultado ? "Teste liberado" : etapa === 1 ? `Comece na ${BRAND.name}` : "Dados da clínica"}
              </h3>
              <p className="mt-1 max-w-md text-sm text-white/70">
                {resultado
                  ? resultado.acessoEnviado
                    ? "O acesso de 7 dias já está pronto."
                    : "A clínica foi aberta, mas o e-mail não saiu."
                  : etapa === 1
                    ? "Quem vai administrar a clínica. A senha chega neste e-mail."
                    : `Plano ${planoAtual?.nome ?? "escolhido"}. Falta só o cadastro da clínica.`}
              </p>

              {!resultado ? (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Passo numero="1" rotulo="Seus dados" ativo={etapa === 1} concluido={etapa === 2} />
                  <Passo numero="2" rotulo="A clínica" ativo={etapa === 2} concluido={false} />
                </div>
              ) : null}
            </div>

            {resultado ? (
              <div className="px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ja-teal text-white">
                    <Check className="h-5 w-5" />
                  </span>
                  <p className="pt-2 text-sm leading-relaxed text-ja-ink">{resultado.mensagem}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-ja-line bg-ja-surface px-4 py-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ja-muted">E-mail de acesso</p>
                  <p className="mt-1 flex items-center gap-2 break-all text-sm font-semibold text-ja-ink">
                    <Mail className="h-4 w-4 shrink-0 text-ja-teal" />
                    {resultado.email}
                  </p>
                  <p className="mt-2 text-xs text-ja-muted">
                    Plano {planoAtual?.nome ?? "escolhido"} · 7 dias · senha no e-mail
                  </p>
                </div>

                {login ? (
                  <a
                    href={login}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-ja-teal text-sm font-semibold text-white transition-colors hover:bg-ja-teal-hover"
                  >
                    Ir para o sistema
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : null}
                {resultado.acessoEnviado ? (
                  <p className="mt-3 text-center text-xs text-ja-muted">
                    Se o e-mail demorar, confira também a caixa de spam.
                  </p>
                ) : null}
              </div>
            ) : (
              <form onSubmit={avancar}>
                <div className="space-y-4 px-5 py-5 sm:px-7">
                  {etapa === 1 ? (
                    <>
                      <CampoIcone icone={User} rotulo="Nome completo">
                        <input
                          required
                          minLength={3}
                          autoComplete="name"
                          value={contato.nome}
                          onChange={(evento) => alterarContato("nome", evento.target.value)}
                          placeholder="Ex: Dra. Juliana Santos"
                          className={CAMPO}
                        />
                      </CampoIcone>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoIcone icone={Mail} rotulo="E-mail">
                          <input
                            required
                            type="email"
                            autoComplete="email"
                            value={contato.email}
                            onChange={(evento) => alterarContato("email", evento.target.value)}
                            placeholder="juliana@clinica.com.br"
                            className={CAMPO}
                          />
                        </CampoIcone>
                        <CampoIcone icone={Phone} rotulo="WhatsApp">
                          <input
                            id="demo-telefone"
                            required
                            type="tel"
                            autoComplete="tel"
                            value={contato.telefone}
                            aria-invalid={invalido === "telefone" || undefined}
                            onChange={(evento) => alterarContato("telefone", evento.target.value)}
                            placeholder="(16) 99999-9999"
                            className={invalido === "telefone" ? CAMPO_INVALIDO : CAMPO}
                          />
                        </CampoIcone>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ja-ink">Plano do teste</p>
                        <div className="grid grid-cols-3 gap-2">
                          {PLANOS.map((item) => {
                            const escolhido = item.codigo === plano;
                            return (
                              <button
                                key={item.codigo}
                                type="button"
                                onClick={() => setPlano(item.codigo)}
                                aria-pressed={escolhido}
                                className={`min-h-11 rounded-xl border px-2 text-sm font-semibold transition-colors ${
                                  escolhido
                                    ? "border-ja-teal bg-ja-teal text-white"
                                    : "border-ja-line bg-ja-surface text-ja-ink hover:border-ja-teal/50"
                                }`}
                              >
                                {item.nome}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <CampoIcone icone={Building2} rotulo="Nome fantasia">
                        <input
                          required
                          minLength={3}
                          value={clinica.nomeFantasia}
                          onChange={(evento) => alterarClinica("nomeFantasia", evento.target.value)}
                          placeholder="Clínica Jardins"
                          className={CAMPO}
                        />
                      </CampoIcone>
                      <CampoIcone icone={Building2} rotulo="Razão social">
                        <input
                          required
                          minLength={3}
                          value={clinica.razaoSocial}
                          onChange={(evento) => alterarClinica("razaoSocial", evento.target.value)}
                          placeholder="Jardins Saúde Ltda"
                          className={CAMPO}
                        />
                      </CampoIcone>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoIcone icone={Building2} rotulo="CNPJ">
                          <input
                            id="demo-cnpj"
                            required
                            inputMode="numeric"
                            value={clinica.cnpj}
                            aria-invalid={invalido === "cnpj" || undefined}
                            onChange={(evento) => alterarClinica("cnpj", evento.target.value)}
                            placeholder="00.000.000/0001-00"
                            className={invalido === "cnpj" ? CAMPO_INVALIDO : CAMPO}
                          />
                        </CampoIcone>
                        <CampoIcone icone={MapPin} rotulo="Cidade">
                          <input
                            required
                            minLength={2}
                            value={clinica.cidade}
                            onChange={(evento) => alterarClinica("cidade", evento.target.value)}
                            placeholder="Ribeirão Preto"
                            className={CAMPO}
                          />
                        </CampoIcone>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <CampoIcone icone={Mail} rotulo="E-mail da clínica">
                          <input
                            required
                            type="email"
                            value={clinica.emailClinica}
                            onChange={(evento) => alterarClinica("emailClinica", evento.target.value)}
                            placeholder="contato@clinica.com.br"
                            className={CAMPO}
                          />
                        </CampoIcone>
                        <CampoIcone icone={Building2} rotulo="Unidade">
                          <input
                            required
                            minLength={3}
                            value={clinica.unidadeNome}
                            onChange={(evento) => alterarClinica("unidadeNome", evento.target.value)}
                            placeholder="Matriz"
                            className={CAMPO}
                          />
                        </CampoIcone>
                      </div>
                    </>
                  )}
                </div>

                <div className="shrink-0 space-y-3 border-t border-ja-line bg-ja-card px-5 py-4 sm:px-7">
                  {etapa === 1 ? (
                    <AceiteTermos
                      marcado={aceitouTermos}
                      invalido={termosInvalidos}
                      onChange={(marcado) => {
                        setAceitouTermos(marcado);
                        if (marcado) setTermosInvalidos(false);
                      }}
                    />
                  ) : null}
                  <div className="flex items-center gap-3">
                  {etapa === 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setInvalido(null);
                        setEtapa(1);
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ja-line px-4 text-sm font-semibold text-ja-ink transition-colors hover:bg-ja-surface"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={enviando}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ja-teal text-sm font-semibold text-white transition-colors hover:bg-ja-teal-hover disabled:opacity-60"
                  >
                    {enviando ? "Enviando…" : etapa === 1 ? "Continuar" : "Começar 7 dias grátis"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  </div>
                </div>
              </form>
            )}
            </div>
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Passo({
  numero,
  rotulo,
  ativo,
  concluido,
}: {
  numero: string;
  rotulo: string;
  ativo: boolean;
  concluido: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
        ativo || concluido ? "bg-white/12 text-white" : "bg-white/5 text-white/55"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          ativo ? "bg-ja-teal text-white" : concluido ? "bg-white text-ja-brand" : "bg-white/10 text-white/70"
        }`}
      >
        {concluido ? <Check className="h-3.5 w-3.5" /> : numero}
      </span>
      <span className="font-semibold">{rotulo}</span>
    </div>
  );
}

function CampoIcone({
  icone: Icone,
  rotulo,
  children,
}: {
  icone: React.ComponentType<{ className?: string }>;
  rotulo: string;
  children: React.ReactElement<{ className?: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ja-ink">{rotulo}</span>
      <span className="relative block">
        <Icone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ja-muted" />
        {children}
      </span>
    </label>
  );
}
