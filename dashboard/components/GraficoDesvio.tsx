"use client";

import { Bar, BarChart, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR } from "./cores";
import { Dica, descreverLinhas, ehAmostraPequena, type LinhaDoGrafico } from "./Dica";
import { useEntradaDosDados } from "./entradaDosDados";
import { desvio, escalaSimetrica } from "@/lib/desvio";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import type { Resumo } from "@/lib/tipos";

interface Props {
  titulo: string;
  /** Os rótulos das categorias, na ordem do contrato (de cima para baixo). */
  categorias: string[];
  /** Um resumo por categoria (mesma ordem). Categoria sem consultas vem com taxa nula. */
  resumos: Resumo[];
  /** A taxa da base inteira: a linha central. Não muda com o filtro. */
  taxaGeral: number;
  /** O recorte não tem nenhuma consulta. */
  semConsultas: boolean;
  /** Barras com menos consultas que isso (e mais que zero) saem em azul claro, como amostra pequena. */
  minimo: number;
  /** Falso enquanto a seção não surgiu: o gráfico fica sem as barras, que entram quando ela aparece. */
  mostrarDados?: boolean;
  /** As barras crescem do centro ao entrar (uma vez). Depois, filtro não anima. */
  animarEntrada?: boolean;
  className?: string;
}

// Folga da escala (espaço para o rótulo na ponta) e o mínimo dela, em pontos percentuais.
const FOLGA = 1.3;
const MINIMO_DA_ESCALA = 2;
const RAIO = 4;

interface PropsDaForma {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
}

/**
 * Barras de desvio: cada categoria sai da linha central (a taxa geral) para a direita, se fica acima dela, ou para a
 * esquerda, se fica abaixo. O comprimento é a diferença; o número escrito é a taxa da categoria.
 */
export function GraficoDesvio({
  titulo,
  categorias,
  resumos,
  taxaGeral,
  semConsultas,
  minimo,
  mostrarDados = true,
  animarEntrada = false,
  className = "",
}: Props) {
  const entrada = useEntradaDosDados(animarEntrada);
  const linhas: LinhaDoGrafico[] = categorias.map((nome, i) => ({
    nome,
    taxa: resumos[i].taxa ?? 0,
    consultas: resumos[i].consultas,
    faltas: resumos[i].faltas,
    pequena: ehAmostraPequena(resumos[i].consultas, minimo),
  }));
  const desvios = resumos.map((r) => desvio(r.taxa, taxaGeral));
  // Categoria sem consultas fica com comprimento zero: não aparece barra, só o "—" junto do centro.
  const barras = linhas.map((l, i) => ({ ...l, valor: desvios[i] ?? 0 }));
  const escala = escalaSimetrica(desvios, FOLGA, MINIMO_DA_ESCALA);
  const temAmostraPequena = linhas.some((l) => l.pequena);

  // A barra com a ponta de fora arredondada e a ponta do centro reta (para a esquerda ou para a direita).
  const forma = ({ x = 0, y = 0, width = 0, height = 0, index = 0 }: PropsDaForma) => {
    const esquerda = Math.min(x, x + width);
    const w = Math.abs(width);
    if (w < 0.5) return <g />;
    const r = Math.min(RAIO, w / 2, height / 2);
    const paraDireita = barras[index].valor >= 0;
    const d = paraDireita
      ? `M${esquerda},${y} H${esquerda + w - r} Q${esquerda + w},${y} ${esquerda + w},${y + r} V${y + height - r} Q${esquerda + w},${y + height} ${esquerda + w - r},${y + height} H${esquerda} Z`
      : `M${esquerda + w},${y} H${esquerda + r} Q${esquerda},${y} ${esquerda},${y + r} V${y + height - r} Q${esquerda},${y + height} ${esquerda + r},${y + height} H${esquerda + w} Z`;
    return <path d={d} fill={barras[index].pequena ? COR.azulClaro : COR.azul} />;
  };

  // O número na ponta de fora: a taxa da categoria (não a diferença), igual aos slides.
  const rotulo = (props: PropsDaForma) => {
    const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
    const b = barras[index];
    const paraDireita = b.valor >= 0;
    const ponta = paraDireita ? Math.max(x, x + width) + 6 : Math.min(x, x + width) - 6;
    return (
      <text
        x={ponta}
        y={y + height / 2}
        dominantBaseline="central"
        textAnchor={paraDireita ? "start" : "end"}
        fontSize={14}
        fontWeight={700}
        fill={COR.texto}
      >
        {b.consultas === 0 ? formatarPct(null) : formatarPct(b.taxa)}
      </text>
    );
  };

  return (
    <figure className={`flex flex-col ${className}`}>
      <figcaption>
        <h2 className="text-grafico font-bold">{titulo}</h2>
        <p className="flex items-center gap-2 text-rotulo text-texto-2">
          <svg width="4" height="16" aria-hidden="true">
            <line x1="2" y1="0" x2="2" y2="16" stroke={COR.texto2} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          Taxa geral {formatarPct(taxaGeral)}. Para a direita: acima dela. Para a esquerda: abaixo.
        </p>
      </figcaption>

      <div className="relative mt-1 min-h-52 flex-1">
        {semConsultas ? (
          <p className="absolute inset-0 flex items-center justify-center text-corpo text-texto-2">
            sem consultas neste recorte
          </p>
        ) : (
          <div className="absolute inset-0" role="img" aria-label={descreverLinhas(titulo, linhas)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barras}
                layout="vertical"
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
                accessibilityLayer={false}
              >
                <XAxis type="number" hide domain={escala} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={64}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 14, fill: COR.texto2 }}
                />
                <Tooltip
                  cursor={{ fill: COR.neutro }}
                  isAnimationActive={false}
                  content={(p) => <Dica ativo={p.active} linha={p.payload?.[0]?.payload as LinhaDoGrafico | undefined} />}
                />
                <ReferenceLine x={0} stroke={COR.texto2} strokeWidth={1.5} strokeDasharray="6 4" />
                {mostrarDados && (
                  <Bar dataKey="valor" barSize={24} shape={forma} {...entrada}>
                    <LabelList dataKey="valor" content={(p) => rotulo(p as PropsDaForma)} />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* Sempre montada: reserva a linha e só tem texto com amostra pequena. */}
      <p className="min-h-lh whitespace-nowrap text-rotulo text-texto-2">
        {!semConsultas && temAmostraPequena
          ? `Barra clara: menos de ${formatarInteiro(minimo)} consultas (amostra pequena)`
          : ""}
      </p>
    </figure>
  );
}
