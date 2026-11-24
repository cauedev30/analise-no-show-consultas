import type { NextConfig } from "next";

// O site é publicado no GitHub Pages em /analise-no-show-consultas.
// O caminho base só vale no build de produção; em desenvolvimento a página abre na raiz.
const emProducao = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: emProducao ? "/analise-no-show-consultas" : "",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
