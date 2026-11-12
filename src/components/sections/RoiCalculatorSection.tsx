"use client";

import React, { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RoiCalculatorSectionProps {
  onOpenDemo: () => void;
}

export function RoiCalculatorSection({ onOpenDemo }: RoiCalculatorSectionProps) {
  const [doctorsCount, setDoctorsCount] = useState<number>(4);
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<number>(10);
  const [averagePrice, setAveragePrice] = useState<number>(220);

  const totalMonthlyAppointments = doctorsCount * appointmentsPerDay * 22;
  const recoveredAppointments = Math.round(totalMonthlyAppointments * 0.16);
  const monthlyRevenueRecovered = recoveredAppointments * averagePrice;
  const monthlyHoursSaved = Math.round(totalMonthlyAppointments * (6 / 60));

  return (
    <section id="calculadora" className="py-12 md:py-16 lg:py-20 bg-ja-card text-ja-ink relative overflow-hidden border-t border-ja-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ja-surface text-ja-teal border border-ja-line text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Calculadora de Retorno (ROI)
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ja-ink tracking-tight">
            Quanto sua clínica deixa na mesa com faltas e processos manuais?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-ja-muted">
            Simule o impacto de reduzir faltas com lembretes automáticos para pacientes e profissionais, via WhatsApp e e-mail.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Sliders Side */}
          <div className="lg:col-span-7 bg-ja-surface p-6 sm:p-8 rounded-2xl border border-ja-line shadow-sm space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-ja-ink uppercase tracking-wider">
                  Número de Profissionais na Clínica
                </label>
                <span className="text-sm font-extrabold text-ja-teal bg-ja-card border border-ja-line px-3 py-0.5 rounded-full">
                  {doctorsCount} {doctorsCount === 1 ? "profissional" : "profissionais"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={doctorsCount}
                onChange={(e) => setDoctorsCount(Number(e.target.value))}
                aria-label="Número de profissionais na clínica"
                className="w-full h-2 bg-ja-line rounded-lg appearance-none cursor-pointer accent-ja-teal"
              />
              <div className="flex justify-between text-[11px] text-ja-muted mt-1">
                <span>1 consultório</span>
                <span>12 clínica média</span>
                <span>25+ rede</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-ja-ink uppercase tracking-wider">
                  Consultas por dia por profissional
                </label>
                <span className="text-sm font-extrabold text-ja-teal bg-ja-card border border-ja-line px-3 py-0.5 rounded-full">
                  {appointmentsPerDay} atendimentos/dia
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="25"
                step="1"
                value={appointmentsPerDay}
                onChange={(e) => setAppointmentsPerDay(Number(e.target.value))}
                aria-label="Consultas por dia por profissional"
                className="w-full h-2 bg-ja-line rounded-lg appearance-none cursor-pointer accent-ja-teal"
              />
              <div className="flex justify-between text-[11px] text-ja-muted mt-1">
                <span>4/dia</span>
                <span>15/dia</span>
                <span>25/dia</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-ja-ink uppercase tracking-wider">
                  Valor Médio por Atendimento / Sessão
                </label>
                <span className="text-sm font-extrabold text-ja-teal bg-ja-card border border-ja-line px-3 py-0.5 rounded-full">
                  {formatCurrency(averagePrice)}
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="600"
                step="10"
                value={averagePrice}
                onChange={(e) => setAveragePrice(Number(e.target.value))}
                aria-label="Valor médio por atendimento ou sessão"
                className="w-full h-2 bg-ja-line rounded-lg appearance-none cursor-pointer accent-ja-teal"
              />
              <div className="flex justify-between text-[11px] text-ja-muted mt-1">
                <span>R$ 80</span>
                <span>R$ 300</span>
                <span>R$ 600</span>
              </div>
            </div>
          </div>

          {/* Result Card Side */}
          <div className="lg:col-span-5 bg-ja-brand text-white p-7 sm:p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ja-teal text-white text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Economia Estimada por Mês
              </div>

              <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {formatCurrency(monthlyRevenueRecovered)}
              </div>
              <p className="text-xs text-white/65 mt-1">
                em consultas resgatadas que seriam perdidas por no-show
              </p>

              <div className="mt-6 pt-5 border-t border-white/10 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Consultas Salvas / Mês:
                  </span>
                  <span className="font-bold text-white text-sm">+{recoveredAppointments} pacientes</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Tempo Poupado na Recepção:
                  </span>
                  <span className="font-bold text-white text-sm">{monthlyHoursSaved} horas/mês</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={onOpenDemo}
                className="w-full min-h-11 py-3.5 px-5 rounded-xl bg-ja-teal hover:bg-ja-teal-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors group"
              >
                <span>Recuperar esse faturamento</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <div className="text-center text-[11px] text-white/50 mt-2">
                O sistema se paga logo nos primeiros dias de uso.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
