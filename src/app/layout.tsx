import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Avisos } from "@/components/layout/Avisos";
import { CONTACT_CONFIG } from "@/lib/constants";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-ja-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-ja-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

const themeInitScript = `(function(){try{var t=localStorage.getItem('ja-theme');if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}}catch(e){}})();`;

export const metadata: Metadata = {
  title: `${BRAND.name} | Gestão clínica completa. Menos faltas. Mais controle.`,
  description:
    "Gestão clínica com agenda, pacientes, financeiro, estoque, relatórios e lembretes por WhatsApp e e-mail. Planos Essencial, Profissional e Ilimitado. Agende uma demonstração e teste por 7 dias.",
  keywords: [
    "J.A. Clinics",
    "gestão de clínicas",
    "software médico",
    "acompanhamento de evolução",
    "agenda médica online",
    "sistema para consultório",
    "Clinic Manager",
  ],
  authors: [{ name: BRAND.name }],
  icons: {
    icon: "/brand/marca-ja-clinics.png",
    apple: "/brand/marca-ja-clinics.png",
  },
  openGraph: {
    title: `${BRAND.name} | Gestão clínica completa`,
    description:
      "Menos faltas. Mais controle. Agenda, pacientes, financeiro e lembretes por WhatsApp e e-mail.",
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.name,
  },
  other: {
    "contact:email": CONTACT_CONFIG.email,
    "contact:phone_number": CONTACT_CONFIG.phone,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakarta.variable} ${sourceSerif.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-ja-surface text-ja-ink antialiased selection:bg-ja-teal selection:text-white flex flex-col font-sans">
        <Script id="ja-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          {children}
          <Avisos />
        </ThemeProvider>
      </body>
    </html>
  );
}
