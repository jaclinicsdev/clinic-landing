"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  FileText,
  DollarSign,
  Boxes,
  Maximize2,
  X,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Eye,
} from "lucide-react";

type ModuleId =
  | "dashboard"
  | "agenda"
  | "pacientes"
  | "financeiro"
  | "estoque"
  | "relatorios";

export function InteractiveDemoSection() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: TrendingUp,
      tag: "Visão 360° da Clínica",
      title: "Painel Executivo & Indicadores em Tempo Real",
      desc: "Acompanhe os atendimentos do dia e a ocupação. Com o módulo financeiro no plano, o painel também mostra o faturamento.",
      screenshot: "/screenshots/dashboard.png",
      badge: "Produção",
      highlights: [
        "Atendimentos do dia e taxa de ocupação",
        "Faturamento quando o plano inclui o financeiro",
        "Atalho para os relatórios da clínica",
      ],
    },
    {
      id: "agenda",
      name: "Agenda",
      icon: Calendar,
      tag: "Recepção Ágil",
      title: "Agenda Inteligente",
      desc: "Visualização por dia, semana ou mês com filtros por profissional e sala. Lembretes de consulta saem pelo módulo de integração, via WhatsApp e e-mail.",
      screenshot: "/screenshots/agenda.png",
      badge: "Produção",
      highlights: [
        "Visualização multi-profissional e por salas",
        "Lembretes para pacientes e profissionais",
        "WhatsApp e e-mail no mesmo módulo",
      ],
    },
    {
      id: "pacientes",
      name: "Pacientes & Evolução",
      icon: FileText,
      tag: "Segurança LGPD",
      title: "Acompanhamento de evolução",
      desc: "Cadastro de pacientes com histórico de atendimentos, notas de evolução, anexos e controle financeiro por paciente — em conformidade com a LGPD.",
      screenshot: "/screenshots/pacientes.png",
      badge: "Produção",
      highlights: [
        "Acompanhamento de evolução por paciente",
        "Histórico de consultas e anexos de exames",
        "Notas de evolução e controle de procedimentos",
      ],
    },
    {
      id: "financeiro",
      name: "Financeiro",
      icon: DollarSign,
      tag: "A partir do Profissional",
      title: "Caixa, lotes de convênio e comissões",
      desc: "Contas a pagar e a receber, fluxo de caixa e DRE simplificado. A baixa aceita PIX, dinheiro, cartão ou boleto. O lote do convênio registra glosa e o valor recebido.",
      screenshot: "/screenshots/financeiro.png",
      badge: "Produção",
      highlights: [
        "Contas a receber, a pagar e fluxo de caixa",
        "DRE simplificado",
        "Lotes de convênio, glosa e comissões",
      ],
    },
    {
      id: "estoque",
      name: "Estoque",
      icon: Boxes,
      tag: "Zero Desperdício",
      title: "Controle de Insumos & Alerta de Mínimo",
      desc: "Cadastro de insumos com saldo, custo e estoque mínimo. O aviso aparece quando a quantidade fica abaixo do mínimo.",
      screenshot: "/screenshots/estoque.png",
      badge: "Produção",
      highlights: [
        "Alerta quando o saldo fica abaixo do mínimo",
        "Entradas e saídas, com motivo",
        "Valor em estoque pelo custo unitário",
      ],
    },
    {
      id: "relatorios",
      name: "Relatórios",
      icon: BarChart3,
      tag: "Inteligência de Dados",
      title: "Relatórios de Produtividade & Lucratividade",
      desc: "Filtros avançados por período para analisar faturamento, inadimplência, pacientes novos vs. recorrentes e produtividade de cada profissional.",
      screenshot: "/screenshots/relatorios.png",
      badge: "Produção",
      highlights: [
        "Exportação CSV",
        "Ticket médio, inadimplência e produtividade",
        "Novos pacientes e comissões do período",
      ],
    },
  ];

  const currentMod = modules.find((m) => m.id === activeModule) || modules[0];

  return (
    <section id="preview" className="py-12 md:py-16 lg:py-20 bg-ja-brand text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/8 text-white/80 border border-white/12 text-xs font-bold uppercase tracking-wider mb-3">
            <Eye className="w-3.5 h-3.5" />
            Telas Reais em Produção
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Conheça o sistema por dentro
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70">
            Veja as telas reais em funcionamento. Clique nos módulos para navegar e ampliar.
          </p>

          {/* Module Selector Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-1.5 rounded-2xl bg-teal-950/80 border border-teal-800/60 backdrop-blur-md max-w-3xl mx-auto">
            {modules.map((m) => {
              const Icon = m.icon;
              const isActive = activeModule === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveModule(m.id as ModuleId)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-ja-teal text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showcase Container */}
        <div className="bg-[#0a2f36] rounded-2xl border border-white/10 p-5 sm:p-8 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Description & Features Column */}
            <div className="lg:col-span-4 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ja-teal text-white text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {currentMod.tag}
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white font-display">
                {currentMod.title}
              </h3>

              <p className="text-sm text-white/70 leading-relaxed">
                {currentMod.desc}
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-bold text-white/55 uppercase tracking-wider">
                  Destaques deste módulo:
                </div>
                {currentMod.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-2.5 text-xs text-white/75">
                    <CheckCircle2 className="w-4 h-4 text-white/60 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setLightboxImage(currentMod.screenshot)}
                  className="min-h-11 px-4 py-2.5 rounded-xl bg-ja-teal hover:bg-ja-teal-hover text-white text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Ampliar Tela em Tela Cheia</span>
                </button>
              </div>
            </div>

            {/* Real Screenshot Preview Column */}
            <div className="lg:col-span-8">
              <div
                onClick={() => setLightboxImage(currentMod.screenshot)}
                className="relative rounded-2xl overflow-hidden border border-teal-700/60 shadow-2xl group cursor-pointer bg-slate-950"
              >
                {/* Real Screenshot Image (Full uncropped screen) */}
                <div className="relative aspect-[1920/929] w-full bg-slate-950">
                  <Image
                    src={currentMod.screenshot}
                    alt={`Captura real do módulo ${currentMod.name}`}
                    fill
                    className="object-contain object-left-top transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                </div>

                {/* Hover Overlay with Zoom Button */}
                <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs pointer-events-none">
                      <div className="px-5 py-2.5 rounded-xl bg-ja-teal text-white text-xs font-bold flex items-center gap-2 scale-95 group-hover:scale-100 transition-transform">
                    <Maximize2 className="w-4 h-4" />
                    <span>Clique para Ampliar em Tela Cheia (100% Nítido)</span>
                  </div>
                </div>

                {/* Top bar chip */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/85 text-teal-200 border border-teal-800/60 text-[11px] font-mono backdrop-blur-md flex items-center gap-2 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>app.clinicmanager.com.br/{currentMod.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full bg-slate-900 rounded-3xl border border-teal-700/80 overflow-hidden shadow-2xl"
            >
              <div className="p-4 bg-slate-950 border-b border-teal-900 flex items-center justify-between text-white">
                <span className="text-xs font-mono text-teal-300">
                  Captura Real em Alta Definição · {currentMod.name}
                </span>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-teal-950 text-teal-300 hover:text-white hover:bg-teal-900 transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative aspect-[16/10] w-full bg-slate-950 max-h-[80vh]">
                <Image
                  src={lightboxImage}
                  alt="Captura em tela cheia do sistema"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
