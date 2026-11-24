const PADRAO = /^(\d+)(?:-(\d+)|(\+))?/;

/**
 * Junta o começo da primeira faixa com o fim da última, em texto corrido.
 * ["13-17", "18-29"] com "anos" vira "13 a 29 anos"; ["16-30 dias", "31+ dias"] com "dias" vira "16 dias ou mais".
 * Se uma faixa não seguir o padrão (por exemplo "Mesmo dia"), devolve os rótulos como estão, separados por vírgula.
 */
export function textoDasFaixas(faixas: string[], unidade: string): string {
  const primeira = PADRAO.exec(faixas[0] ?? "");
  const ultima = PADRAO.exec(faixas[faixas.length - 1] ?? "");
  if (!primeira || !ultima) return faixas.join(", ");
  if (ultima[3] === "+") return `${primeira[1]} ${unidade} ou mais`;
  if (ultima[2] === undefined) return `${primeira[1]} ${unidade}`;
  return `${primeira[1]} a ${ultima[2]} ${unidade}`;
}
