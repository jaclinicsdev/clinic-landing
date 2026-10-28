"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { CONTACT_CONFIG } from "@/lib/constants";

interface NavbarProps {
  onOpenDemo: () => void;
}

export function Navbar({ onOpenDemo }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fechar o menu no mesmo toque remove o link antes de o celular seguir o href.
  // A rolagem vai na mão, depois que o menu sai, descontando a barra fixa.
  function irParaSecao(href: string) {
    const destino = document.getElementById(href.slice(1));
    setMobileMenuOpen(false);
    if (!destino) return;
    // Espera o menu fechar. A animação de altura cancela a rolagem se ela começa no mesmo toque.
    window.setTimeout(() => {
      destino.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Funcionalidades", href: "#modulos" },
    { label: "Jade IA", href: "#jade" },
    { label: "Planos", href: "#planos" },
    { label: "Preview", href: "#preview" },
    { label: "ROI", href: "#calculadora" },
    { label: "Segurança", href: "#seguranca" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 bg-ja-brand text-white transition-shadow duration-300 ${
        scrolled ? "shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2.5">
          <a href="#" className="shrink-0" aria-label="J.A. Clinics — início">
            <BrandMark variant="onDark" size="nav" />
          </a>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2.5 min-h-11 inline-flex items-center text-[13px] font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onOpenDemo}
              className="min-h-11 px-5 rounded-xl bg-ja-teal hover:bg-ja-teal-hover text-white text-[13px] font-semibold inline-flex items-center justify-center transition-colors"
            >
              Agendar demonstração
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
            <button
              onClick={onOpenDemo}
              className="sm:hidden min-h-11 px-3.5 rounded-xl bg-ja-teal text-white text-[13px] font-semibold"
            >
              Demonstração
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-11 min-w-11 rounded-xl text-white/90 hover:bg-white/10 inline-flex items-center justify-center transition-colors"
              aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-ja-brand border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(event) => {
                    event.preventDefault();
                    irParaSecao(link.href);
                  }}
                  className="min-h-11 py-3 text-sm font-medium text-white/80 hover:text-white border-b border-white/8 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDemo();
                }}
                className="mt-3 min-h-11 w-full rounded-xl bg-ja-teal text-white font-semibold text-sm"
              >
                Agendar demonstração
              </button>
              <a
                href={CONTACT_CONFIG.getWhatsAppUrl(
                  "Olá, estou no site da J.A. Clinics e gostaria de saber mais.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  event.preventDefault();
                  const url = event.currentTarget.href;
                  setMobileMenuOpen(false);
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
                className="min-h-11 w-full rounded-xl border border-white/20 text-white/85 font-medium text-sm inline-flex items-center justify-center"
              >
                WhatsApp {CONTACT_CONFIG.phoneFormatted}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
