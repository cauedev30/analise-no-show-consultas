"use client";

import { useState } from "react";

/**
 * A entrada dos dados de um gráfico quando a seção surge (etapas 3B e 3C), igual em todos os gráficos da aba 1: as
 * barras e os pirulitos crescem, a linha se desenha.
 *
 * O gráfico só monta a série (<Bar> ou <Line>) quando a seção surge (`mostrarDados`); o Recharts anima a série ao
 * montá-la, então ela entra já à vista. No fim da animação ela é desligada, e uma troca de filtro depois disso troca os
 * dados na hora.
 */
export function useEntradaDosDados(animarEntrada: boolean) {
  const [terminou, setTerminou] = useState(false);
  return {
    isAnimationActive: animarEntrada && !terminou,
    animationDuration: 700,
    animationEasing: "ease-out" as const,
    onAnimationEnd: () => setTerminou(true),
  };
}
