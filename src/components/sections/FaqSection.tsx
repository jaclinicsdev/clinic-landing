"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";
import { reais, type AdicionaisPrimeiraCobranca } from "@/lib/planos-publicos";

function textoAdicionais(adicionais: Partial<Record<"essencial" | "profissional", AdicionaisPrimeiraCobranca>>) {
  if (!adicionais?.essencial) {
    return "No Essencial, implantação e importação de pacientes são opcionais e entram só na primeira cobrança, pelo valor mostrado no plano. No Profissional e no Ilimitado, implantação e importação de cadastro e agenda já estão inclusas. Nos meses seguintes fica só o preço do plano.";
  }
  const essencial = adicionais.essencial;
  return `No Essencial, implantação custa ${reais(essencial.implantacao)} e a importação de pacientes custa ${reais(essencial.importacao)}. As duas são opcionais e entram só na primeira cobrança. No Profissional e no Ilimitado, implantação e importação de cadastro e agenda já estão inclusas. Nos meses seguintes fica só o preço do plano.`;
}

export function FaqSection({
  adicionais,
}: {
  adicionais: Partial<Record<"essencial" | "profissional", AdicionaisPrimeiraCobranca>>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Como funciona o período de teste grátis de 7 dias?",
      answer:
        "Na seção de planos, escolha Testar 7 dias grátis. Sem cartão. A senha do administrador chega por e-mail e o acesso vale 7 dias no plano escolhido.",
    },
    {
      question: "Vocês ajudam a migrar os dados do meu sistema antigo?",
      answer:
        "Sim! Nossa equipe de implantação realiza a importação completa do cadastro de pacientes, contatos e históricos de evolução a partir de planilhas Excel ou backups de outros softwares do mercado, sem custo adicional.",
    },
    {
      question: "É difícil treinar a recepção e os médicos da clínica?",
      answer:
        "O Clinic Manager foi desenvolvido com foco total em usabilidade intuitiva (Zero Curva de Aprendizado). Em menos de 20 minutos de treinamento guiado, secretárias e profissionais de saúde já dominam a agenda e o acompanhamento de evolução com total facilidade.",
    },
    {
      question: "Como funcionam os lembretes de consulta?",
      answer:
        "No plano Ilimitado, o módulo de integrações envia lembretes das consultas para pacientes e profissionais, via WhatsApp e e-mail, no horário configurado pela clínica.",
    },
    {
      question: "O faturamento de convênios gera XML TISS?",
      answer:
        "A partir do plano Profissional, a clínica fecha lotes de convênio, registra glosa e concilia o valor recebido. O sistema não gera XML nem guia no padrão TISS.",
    },
    {
      question: "Como faço para contratar?",
      answer:
        "Escolha Essencial, Profissional ou Ilimitado na página. Dá para testar 7 dias, pagar mês a mês (no cartão, com cobrança automática todo mês, ou no Pix) ou pagar o ano no Pix à vista ou no cartão em até 12x. O acesso do administrador chega por e-mail e a entrada é no sistema da clínica.",
      },
    {
      question: "O que a Jade IA faz?",
      answer:
        "Só administrador e gestor usam a Jade IA, e apenas no plano Ilimitado. Eles perguntam em português e ela resume a clínica: financeiro da semana, agenda do dia e onde fica cada tela.",
    },
    {
      question: "Como funcionam a implantação e a importação?",
      answer: textoAdicionais(adicionais),
    },
    {
      question: "O sistema tem tema claro e escuro?",
      answer:
        "Sim. Em Configurações > Estilização você escolhe o visual claro ou escuro. A preferência é salva na sua conta e vale em qualquer dispositivo — computador, tablet ou celular.",
    },
    {
      question: "Como funciona o suporte?",
      answer:
        "O atendimento é humanizado: você e sua equipe falam no WhatsApp com uma pessoa real da equipe, para tirar dúvidas e auxiliar na rotina.",
    },
  ];

  return (
    <section id="faq" className="py-12 md:py-16 lg:py-20 bg-ja-card text-ja-ink relative border-t border-ja-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ja-surface text-ja-teal border border-ja-line text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Tire Suas Dúvidas
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-ja-ink tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="mt-3 text-base text-ja-muted">
            Tudo o que você precisa saber para começar a usar a J.A. Clinics hoje mesmo.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-ja-line overflow-hidden bg-ja-surface transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full min-h-11 p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-ja-ink">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "bg-ja-teal text-white rotate-180" : "bg-ja-card text-ja-muted border border-ja-line"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-ja-muted leading-relaxed border-t border-ja-line">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* WhatsApp support callout */}
        <div className="mt-12 p-6 rounded-2xl bg-ja-surface border border-ja-line flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-sm font-bold text-ja-ink">Ainda tem alguma dúvida específica?</h4>
            <p className="text-xs text-ja-muted mt-0.5">
              WhatsApp {CONTACT_CONFIG.phoneFormatted} · {CONTACT_CONFIG.email}
            </p>
          </div>
          <a
            href={CONTACT_CONFIG.getWhatsAppUrl(
              "Olá, tenho uma dúvida sobre a J.A. Clinics",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 px-5 py-2.5 rounded-xl bg-ja-teal hover:bg-ja-dark text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
