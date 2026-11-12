"use client";

import React from "react";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { BRAND } from "@/lib/brand";
import { CONTACT_CONFIG } from "@/lib/constants";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-ja-brand text-white/65 text-sm border-t border-white/8 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-2 space-y-4">
            <a href="#" aria-label={`${BRAND.name} — início`}>
              <BrandMark variant="onDark" size="footer" />
            </a>

            <p className="text-white/60 leading-relaxed max-w-sm text-[13px]">
              Gestão clínica para consultórios e clínicas. Agenda, pacientes, financeiro, estoque, relatórios e lembretes por WhatsApp e e-mail.
            </p>

            <p className="text-[11px] tracking-wide text-white/40">
              {BRAND.poweredBy}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-[0.14em]">
              Módulos do Sistema
            </h4>
            <ul className="space-y-2 text-[13px] text-white/60">
              <li><a href="#planos" className="hover:text-white transition-colors">Planos e preços</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Agenda</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Pacientes e evolução</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Financeiro e convênios</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Estoque</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Lembretes WhatsApp e e-mail</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-[0.14em]">
              Navegação
            </h4>
            <ul className="space-y-2 text-[13px] text-white/60">
              <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#jade" className="hover:text-white transition-colors">Jade IA</a></li>
              <li><a href="#preview" className="hover:text-white transition-colors">Preview Interativo</a></li>
              <li><a href="#calculadora" className="hover:text-white transition-colors">Calculadora de ROI</a></li>
              <li><a href="#seguranca" className="hover:text-white transition-colors">Segurança & LGPD</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Perguntas Frequentes</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-[0.14em]">
              Atendimento & Suporte
            </h4>
            <ul className="space-y-2.5 text-[13px] text-white/60">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-white/50" />
                <a
                  href={CONTACT_CONFIG.getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  {CONTACT_CONFIG.phone} (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-white/50 mt-0.5 shrink-0" />
                <a href={`mailto:${CONTACT_CONFIG.email}`} className="hover:text-white break-all">
                  {CONTACT_CONFIG.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/45">
                <MapPin className="w-3.5 h-3.5" />
                <span>Atendimento em todo o Brasil</span>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[12px] text-white/70">
                Suporte de segunda a sábado pelo WhatsApp e e-mail.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-white/40">
          <div>
            © {new Date().getFullYear()} {BRAND.name} — Todos os direitos reservados.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href={`mailto:${CONTACT_CONFIG.email}`} className="hover:text-white/70 transition-colors">
              Contato
            </a>
            <a href="/termos" className="hover:text-white/70 transition-colors">
              Termos de uso
            </a>
            <button
              onClick={scrollToTop}
              className="min-h-11 min-w-11 px-3 rounded-xl bg-white/8 hover:bg-white/14 text-white/80 transition-colors inline-flex items-center justify-center gap-1.5"
              aria-label="Voltar ao topo"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Topo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
