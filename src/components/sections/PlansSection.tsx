"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock3, Layers } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";
import { PLANOS } from "@/lib/planos";
import { BRAND } from "@/lib/brand";
import { reais, type AdicionaisPrimeiraCobranca } from "@/lib/planos-publicos";

interface PlansSectionProps {
  precos: Record<string, number> | null;
  precosAnuais: Record<string, number> | null;
  adicionais: Partial<Record<"essencial" | "profissional", AdicionaisPrimeiraCobranca>>;
  onTestarGratis: (plano: "essencial" | "profissional" | "ilimitado") => void;
}

function textoDoItem(
  item: { texto: string; adicional?: "implantacao" | "importacao" },
  codigo: string,
  adicionais: Partial<Record<"essencial" | "profissional", AdicionaisPrimeiraCobranca>>,
) {
  if (item.adicional !== "implantacao" && item.adicional !== "importacao") return item.texto;
  if (codigo !== "essencial" && codigo !== "profissional") return item.texto;
  if (!adicionais) return item.texto;
  const preco = adicionais[codigo]?.[item.adicional];
  if (!preco) return item.texto;
  if (item.adicional === "implantacao") return `Implantação opcional por ${reais(preco)}, só na primeira cobrança`;
  if (codigo === "profissional") return `Importação de pacientes e agenda opcional por ${reais(preco)}, só na primeira cobrança`;
  return `Importação de pacientes opcional por ${reais(preco)}, só na primeira cobrança`;
}

export function PlansSection({ precos, precosAnuais, adicionais, onTestarGratis }: PlansSectionProps) {
  return (
    <section id="planos" className="py-12 md:py-16 lg:py-20 bg-ja-surface text-ja-ink relative border-t border-ja-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ja-card text-ja-teal border border-ja-line text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            Planos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ja-ink tracking-tight">
            Escolha o plano pelo que a clínica usa hoje
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ja-muted">
            Compare os módulos, teste 7 dias ou assine agora. O acesso chega por e-mail.
          </p>
        </div>

        {precos === null ? (
          <p className="mb-6 rounded-2xl border border-ja-line bg-ja-card px-5 py-4 text-center text-sm text-ja-muted">
            Não foi possível carregar os preços agora. Atualize a página em instantes para testar ou assinar.
          </p>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PLANOS.map((plano, index) => {
            const preco = precos?.[plano.codigo];
            const precoAnual = precosAnuais?.[plano.codigo];
            const aVenda = preco != null && preco > 0;
            const anualAVenda = precoAnual != null && precoAnual > 0;
            return (
            <motion.article
              key={plano.codigo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                plano.destaque
                  ? "bg-ja-brand text-white border-ja-brand shadow-lg lg:-translate-y-2"
                  : "bg-ja-card text-ja-ink border-ja-line shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold font-display">{plano.nome}</h3>
                {plano.destaque && (
                  <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-ja-teal text-white">
                    Mais escolhido
                  </span>
                )}
              </div>

              <p className={`mt-2 text-sm leading-relaxed ${plano.destaque ? "text-white/75" : "text-ja-muted"}`}>
                {plano.resumo}
              </p>

              <div className={`mt-5 rounded-xl border px-4 py-3 ${
                plano.destaque ? "border-white/15 bg-white/8" : "border-ja-line bg-ja-surface"
              }`}>
                {aVenda ? (
                  <>
                    <p className={`text-3xl font-bold tracking-tight ${plano.destaque ? "text-white" : "text-ja-ink"}`}>
                      {reais(preco)}
                      <span className={`text-sm font-semibold ${plano.destaque ? "text-white/70" : "text-ja-muted"}`}> /mês</span>
                    </p>
                    <p className={`mt-0.5 text-xs ${plano.destaque ? "text-white/65" : "text-ja-muted"}`}>
                      {anualAVenda ? `${reais(precoAnual)} por ano: Pix à vista ou cartão em até 12x.` : "7 dias grátis ou assinatura mensal."}
                    </p>
                  </>
                ) : (
                  <p className={`text-sm font-semibold ${plano.destaque ? "text-white" : "text-ja-ink"}`}>
                    Preço indisponível no momento.
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {plano.limites.map((limite) => (
                  <span
                    key={limite}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                      plano.destaque
                        ? "border-white/15 bg-white/8 text-white/85"
                        : "border-ja-line bg-ja-surface text-ja-ink"
                    }`}
                  >
                    {limite}
                  </span>
                ))}
              </div>

              <ul className={`mt-6 space-y-3 text-sm flex-1 border-t pt-5 ${plano.destaque ? "border-white/10" : "border-ja-line"}`}>
                {plano.itens.map((item) => {
                  const emDesenvolvimento = item.status === "desenvolvimento";
                  return (
                    <li key={item.texto} className="flex items-start gap-2.5">
                      {emDesenvolvimento ? (
                        <Clock3 className={`w-4 h-4 shrink-0 mt-0.5 ${plano.destaque ? "text-white/70" : "text-ja-muted"}`} />
                      ) : (
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plano.destaque ? "text-white" : "text-ja-teal"}`} />
                      )}
                      <span className={plano.destaque ? "text-white/85" : "text-ja-ink"}>
                        {textoDoItem(item, plano.codigo, adicionais)}
                        {item.demonstracao ? (
                          <a
                            href={item.demonstracao}
                            className={`ml-2 inline-flex align-middle items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${
                              plano.destaque
                                ? "bg-white text-ja-brand hover:bg-white/90"
                                : "bg-ja-teal text-white hover:bg-ja-teal-hover"
                            }`}
                          >
                            Ver demonstração
                            <ArrowRight className="size-3" />
                          </a>
                        ) : null}
                        {emDesenvolvimento && (
                          <span
                            className={`ml-2 inline-flex align-middle text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${
                              plano.destaque
                                ? "bg-white/10 text-white"
                                : "bg-ja-surface text-ja-muted border border-ja-line"
                            }`}
                          >
                            Em desenvolvimento
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {aVenda ? (
                <div className="mt-7 grid gap-2">
                  <button
                    type="button"
                    onClick={() => onTestarGratis(plano.codigo)}
                    className={`min-h-11 w-full rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                      plano.destaque
                        ? "bg-ja-teal hover:bg-ja-teal-hover text-white"
                        : "bg-ja-brand hover:bg-ja-dark text-white"
                    }`}
                  >
                    Testar 7 dias grátis
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/assinar?plano=${plano.codigo}&modo=pago&ciclo=mensal`}
                    className={`min-h-11 w-full rounded-xl border font-semibold text-sm inline-flex items-center justify-center transition-colors ${
                      plano.destaque
                        ? "border-white/25 text-white hover:bg-white/10"
                        : "border-ja-line text-ja-ink hover:bg-ja-surface"
                    }`}
                  >
                    Assinar mensal
                  </Link>
                  {anualAVenda ? (
                    <Link
                      href={`/assinar?plano=${plano.codigo}&modo=pago&ciclo=anual`}
                      className={`min-h-11 w-full rounded-xl border font-semibold text-sm inline-flex items-center justify-center transition-colors ${
                        plano.destaque
                          ? "border-white/25 text-white hover:bg-white/10"
                          : "border-ja-line text-ja-ink hover:bg-ja-surface"
                      }`}
                    >
                      Assinar anual
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl(
                  `Olá! Gostaria de tirar uma dúvida sobre o plano ${plano.nome} da ${BRAND.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 text-center text-xs underline-offset-2 hover:underline ${
                  plano.destaque ? "text-white/65" : "text-ja-muted"
                }`}
              >
                Dúvidas no WhatsApp {CONTACT_CONFIG.phoneFormatted}
              </a>
            </motion.article>
          );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-ja-muted max-w-2xl mx-auto">
          Implantação e importação no Essencial, quando marcadas na assinatura, entram só na primeira cobrança. Nos meses seguintes fica o preço do plano. No Profissional e no Ilimitado, as duas já estão inclusas. Prontuário, financeiro, fotos e uma segunda base ficam sob consulta. A Jade IA já responde no plano Ilimitado, só para administrador e gestor.
        </p>
      </div>
    </section>
  );
}
