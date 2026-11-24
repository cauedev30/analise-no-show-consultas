import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";

// Fonte embutida no build (sem pedir nada ao Google na hora da apresentação).
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "No-show em consultas: taxa de falta",
  description:
    "Painel da taxa de falta em consultas, com filtros por idade, dia da semana, bairro e dias de espera.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={atkinson.variable}>
      <body className="flex min-h-dvh flex-col">
        {/* Sem JavaScript o observador do Revelar nunca roda: as seções ficam visíveis. */}
        <noscript>
          <style>{"[data-revelar]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
