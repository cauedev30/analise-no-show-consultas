"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR } from "./cores";
import { Dica, descreverLinhas, type LinhaDoGrafico } from "./Dica";
import { formatarInteiro, formatarPct } from "@/lib/formato";

interface Props {
  titulo: string;
  /** Já ordenado, do maior para o menor, e com os nomes dos bairros. */
  bairros: LinhaDoGrafico[];
  minimoNaBase: number;
  minimoNoRecorte: number;
  /** O recorte não tem nenhuma consulta. */
  semConsultas: boolean;
  className?: string;
}

export function GraficoBairros({ titulo, bairros, minimoNaBase, minimoNoRecorte, semConsultas, className = "" }: Props) {
  const maxima = Math.max(0, ...bairros.map((b) => b.taxa));

  return (
    <figure className={`flex flex-col lg:min-h-0 ${className}`}>
      <figcaption>
        <h2 className="text-grafico font-bold">{titulo}</h2>
        <p className="text-rotulo text-texto-2">
          Só bairros com {formatarInteiro(minimoNaBase)} consultas ou mais na base e {formatarInteiro(minimoNoRecorte)}{" "}
          ou mais no recorte
        </p>
      </figcaption>

      <div className="relative mt-1 min-h-96 flex-1 lg:min-h-64">
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
                <Bar dataKey="taxa" fill={COR.azul} radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </figure>
  );
}
