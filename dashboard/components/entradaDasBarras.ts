"use client";

import { useState } from "react";

/**
 * O crescimento das barras na entrada da seção (etapa 3B), igual nos gráficos de colunas e de bairros.
 *
 * O Recharts só anima quando a barra é montada (ou quando os dados mudam com a animação ligada), não quando a prop
 * muda. Por isso, quando `animarEntrada` vira verdadeiro, a `chave` do <Bar> muda: ele é montado de novo, já à vista,
 * e cresce do zero. No fim da animação ela é desligada, e uma troca de filtro depois disso troca as barras na hora.
 */
export function useEntradaDasBarras(animarEntrada: boolean) {
  const [terminou, setTerminou] = useState(false);
  return {
    chave: animarEntrada ? "entrada" : "parado",
    props: {
      isAnimationActive: animarEntrada && !terminou,
      animationDuration: 700,
      animationEasing: "ease-out" as const,
      onAnimationEnd: () => setTerminou(true),
    },
  };
}
