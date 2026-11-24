import type { BairroNoRanking, Contagem, Dimensao, Filtros, Resumo } from "./tipos";

const DIMENSOES: Dimensao[] = ["faixaEtaria", "diaSemana", "bairro", "faixaEspera"];

function taxaDe(consultas: number, faltas: number): number | null {
  return consultas === 0 ? null : (faltas / consultas) * 100;
}

/** Mantém as linhas que passam em todos os filtros. Lista vazia = sem filtro naquela dimensão. */
export function filtrar(contagens: Contagem[], filtros: Filtros): Contagem[] {
  const ativos = DIMENSOES.filter((d) => filtros[d].length > 0);
  if (ativos.length === 0) return contagens;
  return contagens.filter((c) => ativos.every((d) => filtros[d].includes(c[d])));
}

export function somar(contagens: Contagem[]): Resumo {
  let consultas = 0;
  let faltas = 0;
  for (const c of contagens) {
    consultas += c.consultas;
    faltas += c.faltas;
  }
  return { consultas, faltas, taxa: taxaDe(consultas, faltas) };
}

/** Um resumo por posição de `dimensao` (0 a tamanho-1); categoria sem consultas vem com 0 e taxa nula. */
export function agrupar(contagens: Contagem[], dimensao: Dimensao, tamanho: number): Resumo[] {
  const consultas = new Array<number>(tamanho).fill(0);
  const faltas = new Array<number>(tamanho).fill(0);
  for (const c of contagens) {
    consultas[c[dimensao]] += c.consultas;
    faltas[c[dimensao]] += c.faltas;
  }
  return consultas.map((n, i) => ({ consultas: n, faltas: faltas[i], taxa: taxaDe(n, faltas[i]) }));
}

/**
 * Ranking de bairros pela taxa de falta no recorte, da maior para a menor.
 * Só entram bairros elegíveis (índices) com `minimoNoRecorte` consultas ou mais no recorte.
 * O campo `bairro` é o índice na lista `ordem.bairro`.
 */
export function rankingBairros(
  contagens: Contagem[],
  elegiveis: number[],
  minimoNoRecorte: number,
  limite: number,
): BairroNoRanking[] {
  const permitidos = new Set(elegiveis);
  const porBairro = new Map<number, { consultas: number; faltas: number }>();
  for (const c of contagens) {
    if (!permitidos.has(c.bairro)) continue;
    const atual = porBairro.get(c.bairro) ?? { consultas: 0, faltas: 0 };
    atual.consultas += c.consultas;
    atual.faltas += c.faltas;
    porBairro.set(c.bairro, atual);
  }
  const ranking: BairroNoRanking[] = [];
  for (const [bairro, { consultas, faltas }] of porBairro) {
    if (consultas < minimoNoRecorte) continue;
    ranking.push({ bairro, consultas, faltas, taxa: (faltas / consultas) * 100 });
  }
  // Desempate fixo: taxa maior, depois mais consultas, depois o menor índice de bairro.
  ranking.sort((a, b) => b.taxa - a.taxa || b.consultas - a.consultas || a.bairro - b.bairro);
  return ranking.slice(0, limite);
}
