/**
 * A conta do gráfico de desvio da idade (etapa 3C): quanto cada faixa fica acima ou abaixo da taxa geral, em pontos
 * percentuais, e uma escala simétrica para a taxa geral ficar no meio.
 */

/** A taxa da faixa menos a taxa geral, em pontos percentuais. Faixa sem consultas (taxa nula) não tem desvio. */
export function desvio(taxa: number | null, taxaGeral: number): number | null {
  return taxa === null ? null : taxa - taxaGeral;
}

/**
 * A escala `[-m, m]`: `m` é o maior desvio em módulo vezes `folga` (espaço para os rótulos), nunca menor que `minimo`
 * (num recorte em que todas as faixas ficam perto da taxa geral, a escala não exagera diferenças pequenas).
 */
export function escalaSimetrica(desvios: (number | null)[], folga: number, minimo: number): [number, number] {
  const maior = Math.max(0, ...desvios.filter((d): d is number => d !== null).map(Math.abs));
  const m = Math.max(maior * folga, minimo);
  return [-m, m];
}
