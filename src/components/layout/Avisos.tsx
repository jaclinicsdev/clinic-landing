"use client";

import { Toaster } from "sonner";

import { useTheme } from "@/components/theme/ThemeProvider";

/** Avisos rápidos (toast) do site: erros dos formulários e respostas da API, visíveis em qualquer ponto da página. */
export function Avisos() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      richColors
      closeButton
      toastOptions={{ duration: 7000, style: { fontFamily: "var(--font-sans)" } }}
    />
  );
}
