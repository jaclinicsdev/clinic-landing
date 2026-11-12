"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";

interface HeroSectionProps {
  onOpenDemo: () => void;
}

function HeroDashboardMockup() {
  return (
    <div className="relative w-full">
      <div className="rounded-2xl bg-ja-card border border-ja-line shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-ja-surface border-b border-ja-line">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ja-line" />
            <span className="w-2 h-2 rounded-full bg-ja-line" />
            <span className="w-2 h-2 rounded-full bg-ja-line" />
          </div>
          <span className="text-[11px] font-medium text-ja-muted tracking-wide">
            app · agenda de hoje
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: "Atendimentos", value: "12" },
              { label: "Ocupação", value: "87%" },
              { label: "Faltas", value: "3,2%" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-ja-line bg-ja-surface px-3 py-2.5"
              >
                <div className="text-[10px] font-medium text-ja-muted tracking-wide">
                  {kpi.label}
                </div>
                <div className="mt-0.5 text-lg font-bold text-ja-ink tabular-nums">
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {[
              { time: "14:00", name: "Marcos Castro", tag: "Unimed · retorno" },
              { time: "15:00", name: "Aline Silveira", tag: "Particular · PIX" },
              { time: "16:00", name: "Helena Vaz", tag: "Sala 01 · terapia" },
            ].map((row) => (
              <div
                key={row.time}
                className="flex items-center gap-3 rounded-xl border border-ja-line px-3 py-2.5"
              >
                <span className="text-[12px] font-semibold text-ja-teal tabular-nums w-11 shrink-0">
                  {row.time}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-ja-ink truncate">
                    {row.name}
                  </div>
                  <div className="text-[11px] text-ja-muted truncate">{row.tag}</div>
                </div>
                <span className="h-6 px-2 rounded-full bg-ja-teal text-white text-[10px] font-semibold inline-flex items-center shrink-0">
                  Confirmado
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({ onOpenDemo }: HeroSectionProps) {
  return (
    <section className="relative bg-ja-brand text-white pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <BrandMark size="hero" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mt-7 text-[13px] sm:text-sm font-medium text-white/70 tracking-wide"
            >
              J.A. Clinics · Gestão de consultório e clínica
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 text-[1.85rem] sm:text-4xl lg:text-[2.65rem] font-bold font-display tracking-tight leading-[1.18] text-white max-w-xl"
            >
              Gestão clínica completa. Menos faltas. Mais controle.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-5 text-[15px] sm:text-base text-white/72 leading-relaxed max-w-md"
            >
              Agenda, pacientes, financeiro e lembretes no WhatsApp — em um só sistema para o consultório e a clínica.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            >
              <button
                onClick={onOpenDemo}
                className="min-h-11 px-6 rounded-xl bg-ja-teal hover:bg-ja-teal-hover text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Agendar demonstração</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#planos"
                className="min-h-11 px-6 rounded-xl border border-white/30 hover:border-white/55 text-white font-semibold text-sm inline-flex items-center justify-center transition-colors"
              >
                Ver planos
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6 text-[12px] font-medium tracking-[0.14em] uppercase text-white/65"
            >
              7 dias grátis, sem cartão · ou assine na hora
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="w-full max-w-lg mx-auto lg:max-w-none"
          >
            <HeroDashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
