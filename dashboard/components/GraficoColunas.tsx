"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR } from "./cores";
import { Dica, descreverLinhas, ehAmostraPequena, type LinhaDoGrafico, type PropsRotulo } from "./Dica";
import { useEntradaDosDados } from "./entradaDosDados";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import type { Resumo } from "@/lib/tipos";

interface Props {
  titulo: string;
  /** Os rótulos das categorias, na ordem do contrato. */
  categorias: string[];
  /** Um resumo por categoria (mesma ordem). Categoria sem consultas vem com taxa nula. */
  resumos: Resumo[];
  /** A taxa da base inteira: não muda com o filtro. */
  taxaGeral: number;
  /** Topo da escala (a mesma nos gráficos de colunas, para as alturas serem comparáveis). */
  yMax: number;
  /** O recorte não tem nenhuma consulta. */
  semConsultas: boolean;
  /** Colunas com menos consultas que isso (e mais que zero) saem em azul claro, como amostra pequena. */
  minimo: number;
  /** Falso enquanto a seção não surgiu: o gráfico fica sem as colunas, que entram quando ela aparece. */
  mostrarBarras?: boolean;
  /** As colunas crescem ao entrar (uma vez). Depois, filtro não anima. */
  animarEntrada?: boolean;
  className?: string;
}

export function GraficoColunas({
  titulo,
  categorias,
  resumos,
  taxaGeral,
  yMax,
  semConsultas,
  minimo,
  mostrarBarras = true,
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
  const temAmostraPequena = linhas.some((l) => l.pequena);

  // O valor escrito em cima de cada coluna (taxa zero não tem coluna: o valor sai pelo rótulo do eixo).
  const rotuloDoValor = ({ x = 0, y = 0, width = 0, index = 0 }: PropsRotulo) =>
    linhas[index].taxa === 0 ? null : (
      <text
        x={x + width / 2}
        y={y - 6}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={COR.texto}
        stroke={COR.fundo}
        strokeWidth={6}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {formatarPct(linhas[index].taxa)}
      </text>
    );

  // O rótulo da categoria no eixo. Quando não há coluna visível, o valor vai logo acima do eixo, onde ele ficaria:
  // "—" para categoria sem consultas e "0,0%" para categoria com consultas e nenhuma falta.
  const valorSemColuna = new Map(
    linhas.filter((l) => l.taxa === 0).map((l) => [l.nome, l.consultas === 0 ? formatarPct(null) : formatarPct(0)]),
  );
  const rotuloDoEixo = (props: { x?: number | string; y?: number | string; payload?: { value?: unknown } }) => {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const nome = String(props.payload?.value ?? "");
    const valor = valorSemColuna.get(nome);
    return (
      <g>
        <text x={x} y={y} dy="0.71em" textAnchor="middle" fontSize={14} fill={COR.texto2}>
          {nome}
        </text>
        {valor !== undefined && (
          <text x={x} y={y - 12} textAnchor="middle" fontSize={14} fontWeight={700} fill={COR.texto}>
            {valor}
          </text>
        )}
      </g>
    );
  };

  return (
    <figure className={`flex flex-col ${className}`}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 className="text-grafico font-bold">{titulo}</h2>
        <span className="flex items-center gap-2 text-rotulo text-texto-2">
          <svg width="28" height="4" aria-hidden="true">
            <line x1="0" y1="2" x2="28" y2="2" stroke={COR.texto2} strokeWidth="2" strokeDasharray="6 4" />
          </svg>
          Taxa geral {formatarPct(taxaGeral)}
        </span>
      </figcaption>

      <div className="relative mt-1 min-h-52 flex-1">
        {semConsultas ? (
          <p className="absolute inset-0 flex items-center justify-center text-corpo text-texto-2">
            sem consultas neste recorte
          </p>
        ) : (
          <div className="absolute inset-0" role="img" aria-label={descreverLinhas(titulo, linhas)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linhas} margin={{ top: 24, right: 4, bottom: 0, left: 4 }} accessibilityLayer={false}>
                <XAxis
                  dataKey="nome"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: COR.eixo }}
                  tick={rotuloDoEixo}
                />
                <YAxis hide domain={[0, yMax]} />
                <Tooltip
                  cursor={{ fill: COR.neutro }}
                  isAnimationActive={false}
                  content={(p) => <Dica ativo={p.active} linha={p.payload?.[0]?.payload as LinhaDoGrafico | undefined} />}
                />
                <ReferenceLine y={taxaGeral} stroke={COR.texto2} strokeWidth={1.5} strokeDasharray="6 4" />
                {mostrarBarras && (
                  <Bar dataKey="taxa" fill={COR.azul} radius={[4, 4, 0, 0]} maxBarSize={88} {...entrada}>
                    {linhas.map((l) => (
                      <Cell key={l.nome} fill={l.pequena ? COR.azulClaro : COR.azul} />
                    ))}
                    <LabelList dataKey="taxa" content={(p) => rotuloDoValor(p as unknown as PropsRotulo)} />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* Sempre montada: reserva a linha nos três gráficos (as alturas não diferem) e só tem texto com amostra pequena. */}
      <p className="min-h-lh whitespace-nowrap text-rotulo text-texto-2">
        {!semConsultas && temAmostraPequena
          ? `Coluna clara: menos de ${formatarInteiro(minimo)} consultas (amostra pequena)`
          : ""}
      </p>
    </figure>
  );
}
