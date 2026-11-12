"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  ArrowRight,
} from "lucide-react";

export function ScrollJourneySection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      time: "08:00",
      tag: "Integrações e lembretes",
      title: "Lembretes no WhatsApp e no e-mail",
      desc: "O módulo de integração envia lembretes das consultas para pacientes e profissionais, via WhatsApp e e-mail, no horário configurado pela clínica.",
      icon: MessageSquare,
      accent: "text-ja-teal bg-ja-surface border-ja-line",
      uiTitle: "Lembretes de consulta",
      uiContent: (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-white/70 font-bold">WhatsApp · paciente · 24h antes</div>
            <p className="text-white/85 mt-1">
              &quot;Olá Marcos! Lembrete: consulta amanhã às 14h com Dra. Helena Vaz na Unidade Jardins.&quot;
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-white/70 font-bold">E-mail · profissional</div>
            <p className="text-white/85 mt-1">
              &quot;Dra. Helena, você tem 6 atendimentos amanhã. Primeiro horário: 08h00.&quot;
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-white/75 text-[11px]">
            <span>Canais:</span>
            <span className="font-bold text-white">WhatsApp e e-mail</span>
          </div>
        </div>
      ),
    },
    {
      time: "10:30",
      tag: "Agenda",
      title: "Recepção com a agenda do dia",
      desc: "A recepção vê o dia, a semana ou o mês por profissional e sala, com bloqueios e lista de espera. Confirmações e status ficam no mesmo fluxo.",
      icon: Calendar,
      accent: "text-ja-teal bg-ja-surface border-ja-line",
      uiTitle: "Agenda do dia",
      uiContent: (
        <div className="space-y-2 text-xs">
          {[
            { time: "10:30", name: "Marcos Castro", status: "Confirmado" },
            { time: "11:00", name: "Aline Silveira", status: "Em espera" },
            { time: "11:30", name: "Helena Vaz", status: "Confirmado" },
          ].map((row) => (
            <div
              key={row.time}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-[10px] text-white/60 font-mono">{row.time}</div>
                <div className="text-white/90 font-semibold truncate">{row.name}</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-ja-teal text-white shrink-0">
                {row.status}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      time: "14:00",
      tag: "Financeiro",
      title: "Lote de convênio, glosa e recebimento",
      desc: "A partir do plano Profissional, a clínica fecha o lote do convênio, lança a glosa e registra o valor recebido. O particular entra como PIX, dinheiro, cartão ou boleto.",
      icon: DollarSign,
      accent: "text-ja-teal bg-ja-surface border-ja-line",
      uiTitle: "Lote de convênio",
      uiContent: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-teal-950/70 border border-teal-700/50">
              <div className="text-[10px] text-teal-300">Lote Unimed · set/2026</div>
              <div className="text-lg font-black text-white mt-0.5">R$ 38.450</div>
              <div className="text-[10px] text-emerald-400 font-semibold">Valor apresentado</div>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-950/70 border border-teal-700/50">
              <div className="text-[10px] text-teal-300">Particular (PIX)</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">R$ 16.440</div>
              <div className="text-[10px] text-teal-300 font-semibold">Recebimento registrado</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px] flex items-center justify-between">
            <span>Glosa lançada no lote:</span>
            <span className="font-bold text-white">Valor recebido conferido</span>
          </div>
        </div>
      ),
    },
    {
      time: "18:00",
      tag: "Diretoria & Analytics",
      title: "DRE simplificado e comissões",
      desc: "No plano Profissional, o fechamento mostra o DRE simplificado e as comissões dos profissionais.",
      icon: TrendingUp,
      accent: "text-ja-teal bg-ja-surface border-ja-line",
      uiTitle: "DRE simplificado e comissões",
      uiContent: (
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-700/50">
            <div className="flex items-center justify-between text-teal-200 text-xs mb-1">
              <span>Lucro Operacional do Mês:</span>
              <span className="font-extrabold text-emerald-400 text-sm">R$ 48.920,00</span>
            </div>
            <div className="w-full bg-teal-900/60 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-400 h-2 rounded-full w-4/5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-teal-900/40 border border-teal-700/40 text-teal-200">
              <div className="text-[10px] text-teal-400">Repasses Médicos</div>
              <div className="font-bold text-white mt-0.5">100% calculados</div>
            </div>
            <div className="p-2 rounded-lg bg-teal-900/40 border border-teal-700/40 text-teal-200">
              <div className="text-[10px] text-teal-400">Taxa de Ocupação</div>
              <div className="font-bold text-emerald-400 mt-0.5">92% das salas</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-ja-surface text-ja-ink relative overflow-hidden border-t border-ja-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ja-card text-ja-teal border border-ja-line text-xs font-bold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            Um dia na sua clínica com J.A. Clinics
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ja-ink tracking-tight">
            A jornada completa da recepção ao fechamento
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ja-muted">
            Lembretes, agenda, financeiro e indicadores — o que a clínica usa de verdade no dia a dia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
          {/* Step Selector Column - Clean Light Cards */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <motion.div
                  key={step.title}
                  onClick={() => setActiveStep(index)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "bg-ja-card border-ja-teal ring-2 ring-ja-teal/20 shadow-xl scale-[1.02]"
                      : "bg-ja-card/70 border-ja-line hover:bg-ja-card hover:border-ja-teal/30 opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-extrabold text-ja-teal bg-ja-surface px-2.5 py-1 rounded-lg border border-ja-line">
                        {step.time}
                      </span>
                      <span className="text-xs font-bold text-ja-muted uppercase tracking-wider">
                        {step.tag}
                      </span>
                    </div>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${step.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-ja-ink mt-3 font-display">
                    {step.title}
                  </h3>
                  <p className="text-xs text-ja-muted mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Interactive Screen Preview Column - High-Impact Dark Cockpit Frame */}
          <div className="lg:col-span-6 lg:sticky lg:top-32">
            <div className="bg-ja-brand rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 mb-5 border-b border-teal-800/60">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-white font-display">
                    {steps[activeStep].uiTitle}
                  </h4>
                </div>
                <span className="text-[11px] text-teal-300 font-mono bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-800/40">
                  {steps[activeStep].time}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  {steps[activeStep].uiContent}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 pt-4 border-t border-teal-800/60 flex items-center justify-between text-xs text-teal-300">
                <span>Passo {activeStep + 1} de 4</span>
                <button
                  onClick={() => setActiveStep((activeStep + 1) % steps.length)}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Próxima Etapa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
