import { formatarInteiro, formatarPct } from "@/lib/formato";

export interface LinhaDoGrafico {
  nome: string;
  /** Taxa em %; 0 quando a categoria não tem consultas (a coluna some e o rótulo vira "—"). */
  taxa: number;
  consultas: number;
  faltas: number;
}

/** Dica ao passar o mouse: a taxa e o número de consultas e de faltas da categoria. */
export function Dica({ ativo, linha }: { ativo?: boolean; linha?: LinhaDoGrafico }) {
  if (!ativo || !linha) return null;
  return (
    <div className="rounded bg-texto px-3 py-2 text-rotulo text-fundo">
      <p className="font-bold">{linha.nome}</p>
      <p>Taxa de falta: {linha.consultas === 0 ? "—" : formatarPct(linha.taxa)}</p>
      <p>{formatarInteiro(linha.consultas)} consultas</p>
      <p>{formatarInteiro(linha.faltas)} faltas</p>
    </div>
  );
}

/** Texto do aria-label do gráfico: os mesmos valores que aparecem escritos. */
export function descreverLinhas(titulo: string, linhas: LinhaDoGrafico[]): string {
  const itens = linhas.map((l) => `${l.nome} ${l.consultas === 0 ? "sem consultas" : formatarPct(l.taxa)}`);
  return `${titulo}: ${itens.join(", ")}.`;
}
