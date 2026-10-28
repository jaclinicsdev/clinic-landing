"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  Calendar,
  DollarSign,
  BarChart3,
  Boxes,
  MessageSquare,
  PieChart,
  BellRing,
  Bot,
  Palette,
} from "lucide-react";

export function ModulesBentoSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section id="modulos" className="py-12 md:py-16 lg:py-20 bg-ja-card text-ja-ink relative overflow-hidden border-t border-ja-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ja-surface text-ja-teal border border-ja-line text-xs font-bold uppercase tracking-wider mb-3">
            <Boxes className="w-3.5 h-3.5" />
            Arquitetura Modular Completa
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ja-ink tracking-tight">
            Tudo o que sua clínica precisa para{" "}
            <span className="text-ja-teal">
              operar no piloto profissional
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-ja-muted">
            Chega de sistemas lentos e planilhas desconexas. Conheça os módulos integrados que aceleram do agendamento ao fechamento.
          </p>
        </div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 (Large - 2 cols) : Núcleo Operacional */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 lg:col-span-2 bg-ja-surface rounded-2xl p-7 sm:p-8 border border-ja-line shadow-sm hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-ja-teal text-white flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-ja-card text-ja-teal border border-ja-line">
                Núcleo da clínica
              </span>
            </div>

            <h3 className="text-2xl font-bold text-ja-ink mt-5 font-display">
              Núcleo Operacional & Agenda Inteligente
            </h3>
            <p className="text-sm text-ja-muted mt-2 leading-relaxed">
              Grade do dia, da semana e do mês, com profissional, sala e status. Acompanhamento de evolução e histórico de consultas do paciente.
            </p>

            {/* Interactive mini-preview */}
            <div className="mt-6 p-4 rounded-2xl bg-ja-card border border-ja-line shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-ja-line">
                <span className="font-bold text-ja-ink">Agenda de Hoje · 8 Profissionais</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Sincronizada</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-ja-surface text-ja-teal font-semibold">
                  <div className="text-base font-bold text-ja-ink">24</div>
                  <div className="text-[10px] text-ja-muted">Agendados</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">19</div>
                  <div className="text-[10px] text-ja-muted">Confirmados</div>
                </div>
                <div className="p-2.5 rounded-xl bg-ja-surface text-ja-teal font-semibold">
                  <div className="text-base font-bold text-ja-ink">0</div>
                  <div className="text-[10px] text-ja-muted">Faltas</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-ja-muted">
              <span className="px-2.5 py-1 rounded-lg bg-ja-card border border-ja-line font-medium">✓ Bloqueio de horário</span>
              <span className="px-2.5 py-1 rounded-lg bg-ja-card border border-ja-line font-medium">✓ Lista de espera</span>
              <span className="px-2.5 py-1 rounded-lg bg-ja-card border border-ja-line font-medium">✓ Particular ou convênio</span>
            </div>
          </motion.div>

          {/* Card 2 (Large - 2 cols) : Financeiro & Lotes de Convênios */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-1 lg:col-span-2 bg-ja-card rounded-2xl p-7 sm:p-8 border border-ja-line shadow-sm hover:shadow-lg transition-all duration-300 relative group overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-ja-brand text-white flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-ja-surface text-ja-teal border border-ja-line">
                Financeiro
              </span>
            </div>

            <h3 className="text-2xl font-bold text-ja-ink mt-5 font-display">
              Financeiro e lotes de convênio
            </h3>
            <p className="text-sm text-ja-muted mt-2 leading-relaxed">
              Contas a pagar e a receber, fluxo de caixa, DRE simplificado e comissões. O lote do convênio registra glosa e o valor recebido.
            </p>

            {/* Financial Preview snippet */}
            <div className="mt-6 p-4 rounded-2xl bg-ja-brand text-white">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Fluxo de Caixa Mensal</span>
                <span className="text-emerald-400 font-bold">+18.4% de margem</span>
              </div>
              <div className="text-2xl font-black font-display text-white">R$ 148.920,00</div>
              <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Lotes de convênio e glosa</span>
                <span className="text-emerald-400 font-semibold">Comissões calculadas</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-ja-muted">
              <span className="px-2.5 py-1 rounded-lg bg-ja-surface border border-ja-line font-medium">✓ PIX, dinheiro, cartão e boleto</span>
              <span className="px-2.5 py-1 rounded-lg bg-ja-surface border border-ja-line font-medium">✓ Fluxo de caixa</span>
              <span className="px-2.5 py-1 rounded-lg bg-ja-surface border border-ja-line font-medium">✓ DRE simplificado</span>
            </div>
          </motion.div>

          {/* Card 3 (1 col) : Integrações e lembretes */}
          <motion.div
            variants={cardVariants}
            className="bg-ja-card rounded-2xl p-6 border border-ja-line shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-ja-surface text-ja-teal border border-ja-line flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-ja-ink font-display">
                Integrações e lembretes
              </h4>
              <p className="text-xs text-ja-muted mt-2 leading-relaxed">
                No plano Ilimitado, envio de lembretes das consultas para pacientes e profissionais, via WhatsApp e e-mail.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ja-line flex items-center gap-1.5 text-ja-teal font-bold text-xs">
              <span>WhatsApp e e-mail</span>
            </div>
          </motion.div>

          {/* Card 4 (1 col) : Estoque Clínico */}
          <motion.div
            variants={cardVariants}
            className="bg-ja-card rounded-2xl p-6 border border-ja-line shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-ja-surface text-ja-teal border border-ja-line flex items-center justify-center mb-4">
                <Boxes className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-ja-ink font-display">
                Estoque & Suprimentos
              </h4>
              <p className="text-xs text-ja-muted mt-2 leading-relaxed">
                Saldo, custo e estoque mínimo de insumos. O aviso aparece quando a quantidade fica abaixo do mínimo.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ja-line flex items-center gap-1.5 text-ja-teal font-bold text-xs">
              <BellRing className="w-4 h-4" />
              Alerta de mínimo inteligente
            </div>
          </motion.div>

          {/* Card 5 (1 col) : Relatórios & Analytics */}
          <motion.div
            variants={cardVariants}
            className="bg-ja-card rounded-2xl p-6 border border-ja-line shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-ja-surface text-ja-teal border border-ja-line flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-ja-ink font-display">
                Relatórios
              </h4>
              <p className="text-xs text-ja-muted mt-2 leading-relaxed">
                Faturamento, atendimentos, inadimplência, novos e recorrentes, produtividade e comissões. A exportação sai em CSV.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ja-line flex items-center gap-1.5 text-ja-muted font-bold text-xs">
              <PieChart className="w-4 h-4" />
              Power BI: em desenvolvimento
            </div>
          </motion.div>

          {/* Card 6 (1 col - Highlight) : Agente de IA */}
          <motion.div
            variants={cardVariants}
            className="bg-ja-brand rounded-2xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-ja-teal text-white flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white">
                Agente de IA
              </h4>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                No plano Ilimitado, administrador e gestor conversam com a Jade sobre a rotina da clínica. O chat não substitui o prontuário.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-white/80 font-bold text-xs">
              <span>Disponível no Ilimitado</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-ja-line bg-ja-surface px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-ja-teal text-white inline-flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold text-ja-ink">Tema claro e escuro</div>
              <p className="text-xs text-ja-muted">
                A preferência é salva na conta. Nesta página, alterne pelo ícone no topo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
