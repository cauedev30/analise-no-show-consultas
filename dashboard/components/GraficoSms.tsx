"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR } from "./cores";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import type { LinhaSms } from "@/lib/sms";

interface Props {
  linhas: LinhaSms[];
  /** Texto entre o título e o gráfico. */
  children?: React.ReactNode;
  className?: string;
}

interface PropsRotulo {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
}

const VALOR_MINIMO = 0.001;

type Serie = "sem" | "com";

const SERIES: { chave: Serie; nome: string; cor: string; campo: "taxaSem" | "taxaCom" }[] = [
  { chave: "sem", nome: "Sem SMS", cor: COR.azul, campo: "taxaSem" },
  { chave: "com", nome: "Com SMS", cor: COR.laranja, campo: "taxaCom" },
];

/** Descrição do gráfico para leitor de tela: os mesmos valores que aparecem escritos. */
function descrever(linhas: LinhaSms[]): string {
  const itens = linhas.map((l) => {
    const valor = (s: Serie) => (l[s].consultas === 0 ? "sem consultas" : formatarPct(l[s].taxa));
    return `${l.nome}: sem SMS ${valor("sem")}, com SMS ${valor("com")}`;
  });
  return `Taxa de falta por faixa de espera, com e sem SMS. ${itens.join("; ")}.`;
}

function Dica({ ativo, linha }: { ativo?: boolean; linha?: LinhaSms }) {
  if (!ativo || !linha) return null;
  return (
    <div className="rounded bg-texto px-3 py-2 text-rotulo text-fundo">
      <p className="font-bold">{linha.nome}</p>
      {SERIES.map((s) => {
        const g = linha[s.chave];
        return (
          <p key={s.chave} className="mt-1">
            <span className="font-bold">{s.nome}:</span> {g.consultas === 0 ? "sem consultas" : formatarPct(g.taxa)}
            {g.consultas > 0 && (
              <>
                <br />
                {formatarInteiro(g.consultas)} consultas, {formatarInteiro(g.faltas)} faltas
              </>
            )}
          </p>
        );
      })}
    </div>
  );
}

/** Colunas agrupadas por faixa de espera: sem SMS (azul) e com SMS (laranja). */
export function GraficoSms({ linhas, children, className = "" }: Props) {
  // A taxa de um grupo sem consultas é nula. O Recharts não chama o rótulo quando não há valor, então ela vira um
  // valor mínimo (altura invisível) e o rótulo escreve "sem consultas" no lugar da coluna.
  const dados = linhas.map((l) => ({
    ...l,
    taxaSem: l.sem.taxa ?? VALOR_MINIMO,
    taxaCom: l.com.taxa ?? VALOR_MINIMO,
  }));
  const yMax = Math.max(...dados.map((d) => Math.max(d.taxaSem, d.taxaCom))) * 1.12;

  const rotuloDoValor = (serie: Serie, { x = 0, y = 0, width = 0, index = 0 }: PropsRotulo) => {
    const grupo = dados[index][serie];
    const centro = x + width / 2;
    const estilo = {
      textAnchor: "middle" as const,
      fontSize: 14,
      stroke: COR.fundo,
      strokeWidth: 6,
      paintOrder: "stroke",
      strokeLinejoin: "round" as const,
    };
    if (grupo.consultas === 0) {
      // Sem coluna: o texto fica logo acima do eixo, em duas linhas para caber na largura da coluna.
      return (
        <text {...estilo} x={centro} y={y - 24} fill={COR.texto2}>
          <tspan x={centro}>sem</tspan>
          <tspan x={centro} dy="1.2em">
            consultas
          </tspan>
        </text>
      );
    }
    return (
      <text {...estilo} x={centro} y={y - 6} fontWeight={700} fill={COR.texto}>
        {formatarPct(grupo.taxa)}
      </text>
    );
  };

  return (
    <figure className={className}>
      <figcaption className="flex flex-wrap items-baseline gap-x-8">
        <h3 className="text-grafico font-bold">SMS: a comparação crua engana</h3>
        <ul className="flex items-center gap-5 text-rotulo" aria-label="Legenda">
          {SERIES.map((s) => (
            <li key={s.chave} className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-sm" style={{ backgroundColor: s.cor }} aria-hidden="true" />
              {s.nome}
            </li>
          ))}
        </ul>
      </figcaption>
      {children}

      <div className="relative mt-1 h-72" role="img" aria-label={descrever(linhas)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dados}
            margin={{ top: 28, right: 4, bottom: 0, left: 4 }}
            barCategoryGap="25%"
            barGap={8}
            accessibilityLayer={false}
          >
            <XAxis
              dataKey="nome"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: COR.eixo }}
              tick={{ fontSize: 14, fill: COR.texto2 }}
            />
            <YAxis hide domain={[0, yMax]} />
            <Tooltip
              cursor={{ fill: COR.neutro }}
              isAnimationActive={false}
              content={(p) => <Dica ativo={p.active} linha={p.payload?.[0]?.payload as LinhaSms | undefined} />}
            />
            {SERIES.map((s) => (
              <Bar
                key={s.chave}
                dataKey={s.campo}
                name={s.nome}
                fill={s.cor}
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
                isAnimationActive={false}
              >
                <LabelList dataKey={s.campo} content={(p) => rotuloDoValor(s.chave, p as unknown as PropsRotulo)} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
