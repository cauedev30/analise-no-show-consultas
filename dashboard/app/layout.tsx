import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "No-show em consultas: taxa de falta",
  description:
    "Painel da taxa de falta em consultas, com filtros por idade, dia da semana, bairro e dias de espera.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
