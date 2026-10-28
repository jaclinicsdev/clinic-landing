"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollProgressBar } from "@/components/layout/ScrollProgressBar";
import { HeroSection } from "@/components/sections/HeroSection";
import { InteractiveDemoSection } from "@/components/sections/InteractiveDemoSection";
import { ScrollJourneySection } from "@/components/sections/ScrollJourneySection";
import { ModulesBentoSection } from "@/components/sections/ModulesBentoSection";
import { PlansSection } from "@/components/sections/PlansSection";
import { RoiCalculatorSection } from "@/components/sections/RoiCalculatorSection";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaBannerSection } from "@/components/sections/CtaBannerSection";
import { ScheduleDemoModal } from "@/components/modals/ScheduleDemoModal";
import type { PlanoComercial } from "@/lib/planos";
import { MessageCircle } from "lucide-react";
import { CONTACT_CONFIG } from "@/lib/constants";

interface HomeClientProps {
  precos: Record<string, number> | null;
  precosAnuais: Record<string, number> | null;
  implementacao: number | null;
  testeInicial?: string;
  nomeInicial?: string;
  emailInicial?: string;
  telefoneInicial?: string;
}

function planoValido(valor?: string): valor is PlanoComercial["codigo"] {
  return valor === "essencial" || valor === "profissional" || valor === "ilimitado";
}

export function HomeClient({ precos, precosAnuais, implementacao, testeInicial, nomeInicial, emailInicial, telefoneInicial }: HomeClientProps) {
  const [demoModalOpen, setDemoModalOpen] = useState(() => planoValido(testeInicial));
  const [planoTeste, setPlanoTeste] = useState<PlanoComercial["codigo"] | undefined>(
    planoValido(testeInicial) ? testeInicial : undefined,
  );
  const openDemo = () => {
    setPlanoTeste(undefined);
    setDemoModalOpen(true);
  };
  const abrirTeste = (plano: PlanoComercial["codigo"]) => {
    setPlanoTeste(plano);
    setDemoModalOpen(true);
  };

  return (
    <main className="min-h-screen relative flex flex-col bg-ja-surface text-ja-ink selection:bg-ja-teal selection:text-white">
      <ScrollProgressBar />

      <Navbar onOpenDemo={openDemo} />

      <HeroSection onOpenDemo={openDemo} />
      <InteractiveDemoSection />
      <ScrollJourneySection />
      <ModulesBentoSection />
      <PlansSection precos={precos} precosAnuais={precosAnuais} implementacao={implementacao} onTestarGratis={abrirTeste} />
      <RoiCalculatorSection onOpenDemo={openDemo} />
      <SecuritySection />
      <TestimonialsSection />
      <FaqSection implementacao={implementacao} />
      <CtaBannerSection />

      <Footer />

      <a
        href={CONTACT_CONFIG.getWhatsAppUrl(
          "Olá, estou no site da J.A. Clinics e gostaria de tirar uma dúvida",
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-30 w-12 h-12 min-h-11 min-w-11 bg-ja-teal hover:bg-ja-dark text-white rounded-full flex items-center justify-center shadow-lg transition-colors group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-14 bg-ja-brand text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Fale com um especialista
        </span>
      </a>

      <ScheduleDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        planoInicial={planoTeste}
        iniciais={{ nome: nomeInicial, email: emailInicial, telefone: telefoneInicial }}
      />
    </main>
  );
}
