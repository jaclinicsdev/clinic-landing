"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, CheckCircle2 } from "lucide-react";

export function TestimonialsSection() {
  const outcomes = [
    {
      role: "Gestão de clínica multiprofissional",
      text: "Lembretes por WhatsApp e e-mail no plano Ilimitado reduzem o no-show e liberam a recepção das ligações de confirmação.",
      focus: "Menos faltas",
    },
    {
      role: "Consultório com evolução clínica",
      text: "Histórico, notas e anexos ficam na ficha do paciente. O atendimento começa com contexto, sem caçar papel ou planilha.",
      focus: "Evolução organizada",
    },
    {
      role: "Clínica com convênio e particular",
      text: "No Profissional, lote, glosa e recebimento (PIX, cartão, dinheiro ou boleto) ficam no mesmo fluxo — sem planilha paralela.",
      focus: "Financeiro no sistema",
    },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-ja-surface text-ja-ink relative overflow-hidden border-t border-ja-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ja-card text-ja-teal border border-ja-line text-xs font-bold uppercase tracking-wider mb-3">
            No dia a dia
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ja-ink tracking-tight font-display">
            O que muda na operação
          </h2>
          <p className="mt-3 text-base sm:text-lg text-ja-muted">
            Resultados típicos quando a agenda, a evolução e o financeiro passam a rodar no mesmo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {outcomes.map((item, i) => (
            <motion.div
              key={item.focus}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-ja-card rounded-2xl p-7 border border-ja-line shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-ja-teal">
                    {item.focus}
                  </span>
                  <Quote className="w-6 h-6 text-ja-line" />
                </div>

                <p className="text-sm text-ja-ink/80 leading-relaxed">{item.text}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-ja-line flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ja-teal shrink-0" />
                <p className="text-[12px] font-semibold text-ja-ink">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
