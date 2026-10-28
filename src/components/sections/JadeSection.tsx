"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Bot, Send } from "lucide-react";

type Fala = { quem: "voce" | "jade"; texto: string };

const RODADAS = [
  {
    pergunta: "Jade, me resume o financeiro desta semana.",
    consulta: "Consultando o financeiro…",
    resposta:
      "Nesta semana a clínica recebeu R$ 18.400 em 42 atendimentos. Há R$ 2.150 em aberto, a maior parte de convênio.",
  },
  {
    pergunta: "E a agenda de amanhã?",
    consulta: "Consultando a agenda do dia…",
    resposta:
      "Amanhã há 27 consultas. Seis já estão confirmadas. A manhã da Dra. Helena está cheia a partir das 8h, e sobram 4 horários depois das 16h.",
  },
] as const;

function conversaCompleta(): Fala[] {
  return RODADAS.flatMap((item) => [
    { quem: "voce", texto: item.pergunta },
    { quem: "jade", texto: item.resposta },
  ]);
}

export function JadeSection() {
  const painel = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const enviar = useRef<HTMLButtonElement>(null);
  const [mensagens, setMensagens] = useState<Fala[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [consulta, setConsulta] = useState<string | null>(null);
  const [parcial, setParcial] = useState("");
  const [ativa, setAtiva] = useState(false);
  const [rodada, setRodada] = useState(0);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvo = painel.current;
    if (!alvo) return;
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setVisivel(true);
      },
      { threshold: 0.35 },
    );
    obs.observe(alvo);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visivel) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) {
      setMensagens(conversaCompleta());
      setRascunho("");
      setConsulta(null);
      setParcial("");
      setAtiva(false);
      return;
    }

    let vivo = true;
    const aplicar = (fn: () => void) => {
      if (vivo) fn();
    };

    aplicar(() => {
      setMensagens([]);
      setRascunho("");
      setConsulta(null);
      setParcial("");
      setAtiva(true);
    });

    const tl = gsap.timeline();
    const digitar = (texto: string, escrever: (trecho: string) => void, segundosPorLetra: number) => {
      const progresso = { i: 0 };
      tl.to(progresso, {
        i: texto.length,
        duration: Math.max(0.45, texto.length * segundosPorLetra),
        ease: "none",
        onUpdate: () => aplicar(() => escrever(texto.slice(0, Math.round(progresso.i)))),
      });
    };

    tl.to({}, { duration: 0.55 });

    RODADAS.forEach((item, indice) => {
      digitar(item.pergunta, (trecho) => setRascunho(trecho), 0.042);
      tl.to({}, { duration: 0.38 });
      if (enviar.current) {
        tl.to(enviar.current, { scale: 0.86, duration: 0.08, ease: "power1.in" });
        tl.to(enviar.current, { scale: 1, duration: 0.18, ease: "back.out(2)" });
      }
      tl.call(() => {
        aplicar(() => {
          setMensagens((atual) => [...atual, { quem: "voce", texto: item.pergunta }]);
          setRascunho("");
          setConsulta(item.consulta);
        });
      });
      tl.to({}, { duration: 1 });
      tl.call(() => aplicar(() => setConsulta(null)));
      digitar(item.resposta, (trecho) => setParcial(trecho), 0.018);
      tl.call(() => {
        aplicar(() => {
          setMensagens((atual) => [...atual, { quem: "jade", texto: item.resposta }]);
          setParcial("");
        });
      });
      if (indice < RODADAS.length - 1) tl.to({}, { duration: 0.75 });
    });

    tl.call(() => aplicar(() => setAtiva(false)));

    return () => {
      vivo = false;
      tl.kill();
      if (enviar.current) gsap.set(enviar.current, { clearProps: "transform" });
    };
  }, [visivel, rodada]);

  useEffect(() => {
    if (!consulta || !painel.current) return;
    const pontos = painel.current.querySelectorAll(".jade-ponto");
    if (pontos.length === 0) return;
    const anim = gsap.to(pontos, {
      y: -4,
      duration: 0.32,
      stagger: 0.1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
    return () => {
      anim.kill();
      gsap.set(pontos, { y: 0 });
    };
  }, [consulta]);

  useEffect(() => {
    const caixa = lista.current;
    if (!caixa) return;
    const ultima = mensagens[mensagens.length - 1];
    if (ultima?.quem === "voce" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const falas = caixa.querySelectorAll<HTMLElement>("[data-quem='voce']");
      const bolha = falas[falas.length - 1];
      if (bolha) {
        gsap.fromTo(
          bolha,
          { y: 22, opacity: 0, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.42, ease: "back.out(1.7)" },
        );
      }
    }
    caixa.scrollTop = caixa.scrollHeight;
  }, [mensagens]);

  useEffect(() => {
    const caixa = lista.current;
    if (caixa) caixa.scrollTop = caixa.scrollHeight;
  }, [parcial, consulta, rascunho]);

  const campoVazio = rascunho.length === 0;
  const ociosa = mensagens.length === 0 && campoVazio && !consulta && !parcial;

  return (
    <section id="jade" className="scroll-mt-20 border-t border-ja-line bg-ja-surface py-12 text-ja-ink md:py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-ja-line bg-ja-card px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-ja-teal">
            <Bot className="size-3.5" />
            Jade IA
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ja-ink sm:text-4xl lg:text-5xl">
            Ela conversa sobre a <span className="text-ja-teal">sua clínica</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ja-ink">
            Pergunte em português. A Jade olha o período e devolve o resumo: quanto entrou, o que está em aberto e como está a agenda.
          </p>
          <ul className="mt-6 flex max-w-xl flex-wrap gap-2">
            {["Resumo do financeiro", "Agenda do dia", "Praticidade"].map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-ja-line bg-ja-card px-3 py-1.5 text-sm font-semibold text-ja-ink"
              >
                {tag}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ja-muted">No plano Ilimitado, apenas para administrador e gestor. A demonstração ao lado usa números de exemplo.</p>
        </div>

        <div ref={painel} className="overflow-hidden rounded-3xl border border-ja-line bg-ja-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-ja-line px-5 py-4">
            <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-ja-teal text-white">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Jade IA</p>
              <p className="text-xs text-ja-muted">Demonstração</p>
            </div>
          </div>

          <div ref={lista} className="flex h-80 flex-col gap-3 overflow-y-auto px-5 py-5" aria-hidden>
            {ociosa ? (
              <p className="m-auto max-w-xs text-center text-sm leading-relaxed text-ja-muted">
                Eu sou a Jade IA. Pergunte sobre a agenda, o financeiro ou onde fica uma tela.
              </p>
            ) : null}
            {mensagens.map((fala) => (
              <p
                key={`${fala.quem}-${fala.texto}`}
                data-quem={fala.quem}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  fala.quem === "voce"
                    ? "self-end rounded-br-md bg-ja-teal text-white"
                    : "self-start rounded-bl-md bg-ja-surface text-ja-ink"
                }`}
              >
                {fala.texto}
              </p>
            ))}
            {consulta ? (
              <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-ja-surface px-3.5 py-2.5 text-sm text-ja-muted">
                <span className="flex items-end gap-1">
                  {[0, 1, 2].map((indice) => (
                    <span key={indice} className="jade-ponto inline-block size-1.5 rounded-full bg-ja-teal" />
                  ))}
                </span>
                {consulta}
              </div>
            ) : null}
            {parcial ? (
              <p className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-ja-surface px-3.5 py-2.5 text-sm leading-relaxed text-ja-ink">
                {parcial}
                <span className="ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-ja-ink align-middle" />
              </p>
            ) : null}
          </div>

          <div className="sr-only" aria-live="polite">
            {mensagens.map((fala) => fala.texto).join(" ")}
          </div>

          <div className="flex items-end gap-2 border-t border-ja-line px-4 py-3" aria-hidden>
            <div
              className={`flex min-h-10 flex-1 items-center rounded-xl border bg-ja-surface px-3 py-2 text-sm leading-relaxed ${
                ativa && !campoVazio ? "border-ja-teal" : "border-ja-line"
              }`}
            >
              {campoVazio ? (
                <span className="text-ja-muted">Escreva sua pergunta</span>
              ) : (
                <span>{rascunho}</span>
              )}
              {ativa ? <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-current" /> : null}
            </div>
            <button
              ref={enviar}
              type="button"
              tabIndex={-1}
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${
                campoVazio ? "bg-ja-surface text-ja-muted" : "bg-ja-teal text-white"
              }`}
            >
              <Send className="size-4" />
            </button>
          </div>

          <div className="border-t border-ja-line px-5 py-3">
            <button
              type="button"
              onClick={() => setRodada((atual) => atual + 1)}
              className="text-sm font-semibold text-ja-teal hover:text-ja-teal-hover"
            >
              Ver de novo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
