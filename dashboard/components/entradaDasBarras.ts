"use client";

import { useState } from "react";

/**
 * O crescimento das barras na entrada da seção (etapa 3B), igual nos gráficos de colunas e de bairros.
 *
 * O gráfico só monta o <Bar> quando a seção surge (`mostrarBarras`); o Recharts anima a barra ao montá-la, então ela
 * cresce do zero, já à vista. No fim da animação ela é desligada, e uma troca de filtro depois disso troca as barras na
 * hora.
 */
export function useEntradaDasBarras(animarEntrada: boolean) {
  const [terminou, setTerminou] = useState(false);
  return {
    isAnimationActive: animarEntrada && !terminou,
    animationDuration: 700,
    animationEasing: "ease-out" as const,
    onAnimationEnd: () => setTerminou(true),
  };
}
