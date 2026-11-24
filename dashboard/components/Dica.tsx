import { formatarInteiro, formatarPct } from "@/lib/formato";

export interface LinhaDoGrafico {
  nome: string;
  /** Taxa em %; 0 quando a categoria não tem consultas (a coluna some e o rótulo vira "—"). */
  taxa: number;
  consultas: number;
  faltas: number;
  /** A categoria tem poucas consultas (veja `ehAmostraPequena`): a taxa oscila muito. */
  pequena?: boolean;
}

/** Os parâmetros que o Recharts passa ao rótulo de valor de cada coluna. */
export interface PropsRotulo {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
}

/** Amostra pequena: tem consultas, mas menos que o mínimo. Categoria sem consultas não conta (ela some do gráfico). */
export function ehAmostraPequena(consultas: number, minimo: number): boolean {
  return consultas > 0 && consultas < minimo;
}

/** A caixa escura das dicas dos gráficos (a aparência é a mesma em todos). */
export function CaixaDeDica({ children }: { children: React.ReactNode }) {
  return <div className="rounded bg-texto px-3 py-2 text-rotulo text-fundo">{children}</div>;
}

/** Dica ao passar o mouse: a taxa e o número de consultas e de faltas da categoria. */
export function Dica({ ativo, linha }: { ativo?: boolean; linha?: LinhaDoGrafico }) {
  if (!ativo || !linha) return null;
  return (
    <CaixaDeDica>
      <p className="font-bold">{linha.nome}</p>
      <p>Taxa de falta: {linha.consultas === 0 ? "—" : formatarPct(linha.taxa)}</p>
      <p>{formatarInteiro(linha.consultas)} consultas</p>
      <p>{formatarInteiro(linha.faltas)} faltas</p>
      {linha.pequena && <p className="font-bold">amostra pequena</p>}
    </CaixaDeDica>
  );
}

/** Texto do aria-label do gráfico: os mesmos valores que aparecem escritos. */
export function descreverLinhas(titulo: string, linhas: LinhaDoGrafico[]): string {
  const itens = linhas.map((l) =>
    l.consultas === 0
      ? `${l.nome} sem consultas`
      : `${l.nome} ${formatarPct(l.taxa)}, ${formatarInteiro(l.consultas)} consultas${l.pequena ? ", amostra pequena" : ""}`,
  );
  return `${titulo}: ${itens.join(", ")}.`;
}
