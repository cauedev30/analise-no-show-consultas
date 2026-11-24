"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR } from "./cores";
import { Dica, descreverLinhas, type LinhaDoGrafico } from "./Dica";
import { useEntradaDosDados } from "./entradaDosDados";
import { formatarInteiro, formatarPct } from "@/lib/formato";

// Raio do ponto do pirulito, em px.
const RAIO = 7;

interface Props {
  titulo: string;
  /** Já ordenado, do maior para o menor, e com os nomes dos bairros. */
  bairros: LinhaDoGrafico[];
  minimoNaBase: number;
  minimoNoRecorte: number;
  /** O recorte não tem nenhuma consulta. */
  semConsultas: boolean;
  /** Falso enquanto a seção não surgiu: o gráfico fica sem os pirulitos, que entram quando ela aparece. */
  mostrarDados?: boolean;
  /** Os pirulitos crescem ao entrar (uma vez). Depois, filtro não anima. */
  animarEntrada?: boolean;
  className?: string;
}

export function GraficoBairros({
  titulo,
  bairros,
  minimoNaBase,
  minimoNoRecorte,
  semConsultas,
  mostrarDados = true,
  animarEntrada = false,
  className = "",
}: Props) {
  const entrada = useEntradaDosDados(animarEntrada);
  const maxima = Math.max(0, ...bairros.map((b) => b.taxa));

  // Pirulito: uma linha fina do zero até a taxa e um ponto no fim (um ranking leve, sem barras grossas).
  const pirulito = ({ x = 0, y = 0, width = 0, height = 0 }: { x?: number; y?: number; width?: number; height?: number }) => {
    if (width < 0.5) return <g />;
    const meio = y + height / 2;
    return (
      <g>
        <line x1={x} y1={meio} x2={x + width - RAIO} y2={meio} stroke={COR.azul} strokeWidth={2} />
        <circle cx={x + width - RAIO} cy={meio} r={RAIO} fill={COR.azul} />
      </g>
    );
  };

  return (
    <figure className={`flex flex-col ${className}`}>
      <figcaption>
        <h2 className="text-grafico font-bold">{titulo}</h2>
        <p className="text-rotulo text-texto-2">
          Só bairros com {formatarInteiro(minimoNaBase)} consultas ou mais na base e {formatarInteiro(minimoNoRecorte)}{" "}
          ou mais no recorte
        </p>
      </figcaption>

      <div className="relative mt-1 min-h-72 flex-1">
        {semConsultas || bairros.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center text-center text-corpo text-texto-2">
            {semConsultas ? "sem consultas neste recorte" : "nenhum bairro atinge o mínimo neste recorte"}
          </p>
        ) : (
          <div className="absolute inset-0" role="img" aria-label={descreverLinhas(titulo, bairros)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bairros}
                layout="vertical"
                margin={{ top: 4, right: 52, bottom: 4, left: 0 }}
                accessibilityLayer={false}
              >
                <XAxis type="number" hide domain={[0, maxima * 1.05]} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  width={170}
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: COR.eixo }}
                  tick={{ fontSize: 14, fill: COR.texto2 }}
                />
                <Tooltip
                  cursor={{ fill: COR.neutro }}
                  isAnimationActive={false}
                  content={(p) => <Dica ativo={p.active} linha={p.payload?.[0]?.payload as LinhaDoGrafico | undefined} />}
                />
                {mostrarDados && (
                  <Bar dataKey="taxa" fill={COR.azul} barSize={RAIO * 2} shape={pirulito} {...entrada}>
                    <LabelList
                      dataKey="taxa"
                      position="right"
                      offset={6}
                      fontSize={14}
                      fontWeight={700}
                      fill={COR.texto}
                      formatter={(v: unknown) => formatarPct(Number(v))}
                    />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </figure>
  );
}
