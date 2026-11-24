"use client";

import { LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COR } from "./cores";
import { Dica, descreverLinhas, ehAmostraPequena, type LinhaDoGrafico } from "./Dica";
import { useEntradaDosDados } from "./entradaDosDados";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import type { Resumo } from "@/lib/tipos";

interface Props {
  titulo: string;
  /** Os rótulos das categorias, na ordem do contrato (uma progressão: a linha liga uma à outra). */
  categorias: string[];
  /** Um resumo por categoria (mesma ordem). Categoria sem consultas vem com taxa nula. */
  resumos: Resumo[];
  /** A taxa da base inteira: não muda com o filtro. */
  taxaGeral: number;
  /** O recorte não tem nenhuma consulta. */
  semConsultas: boolean;
  /** Pontos com menos consultas que isso (e mais que zero) saem em azul claro, como amostra pequena. */
  minimo: number;
  /** Falso enquanto a seção não surgiu: o gráfico fica sem a linha, que entra quando ela aparece. */
  mostrarDados?: boolean;
  /** A linha se desenha ao entrar (uma vez). Depois, filtro não anima. */
  animarEntrada?: boolean;
  className?: string;
}

// Raio do ponto, em px (o contorno da cor do fundo separa o ponto da linha).
const RAIO = 7;

/** Uma linha com um ponto por categoria: para mostrar uma progressão (a espera). */
export function GraficoLinha({
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
  // Categoria sem consultas não tem ponto: a linha se interrompe ali.
  const pontos = linhas.map((l) => ({ ...l, valor: l.consultas === 0 ? null : l.taxa }));
  const temAmostraPequena = linhas.some((l) => l.pequena);
  // O eixo começa no 0 (4,6% contra 33% não pode parecer menor do que é), com folga em cima para o valor escrito.
  const topo = Math.max(taxaGeral, ...linhas.map((l) => l.taxa)) * 1.18;
  const vazias = new Set(linhas.filter((l) => l.consultas === 0).map((l) => l.nome));

  const ponto = (props: { cx?: number; cy?: number; index?: number }, ativo: boolean) => {
    const { cx, cy, index = 0 } = props;
    if (cx === undefined || cy === undefined || pontos[index].valor === null) return <g key={`p${index}`} />;
    return (
      <circle
        key={`p${index}`}
        cx={cx}
        cy={cy}
        r={ativo ? RAIO + 2 : RAIO}
        fill={pontos[index].pequena ? COR.azulClaro : COR.azul}
        stroke={COR.fundo}
        strokeWidth={2}
      />
    );
  };

  const rotuloDoValor = (props: { x?: number | string; y?: number | string; index?: number }) => {
    const index = props.index ?? 0;
    if (pontos[index].valor === null) return null;
    return (
      <text
        x={Number(props.x ?? 0)}
        y={Number(props.y ?? 0) - RAIO - 8}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill={COR.texto}
        stroke={COR.fundo}
        strokeWidth={6}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {formatarPct(pontos[index].taxa)}
      </text>
    );
  };

  // O rótulo da categoria no eixo; categoria sem consultas ganha o "—" logo acima do eixo, onde o ponto ficaria.
  const rotuloDoEixo = (props: { x?: number | string; y?: number | string; payload?: { value?: unknown } }) => {
    const x = Number(props.x ?? 0);
    const y = Number(props.y ?? 0);
    const nome = String(props.payload?.value ?? "");
    return (
      <g>
        <text x={x} y={y} dy="0.71em" textAnchor="middle" fontSize={14} fill={COR.texto2}>
          {nome}
        </text>
        {vazias.has(nome) && (
          <text x={x} y={y - 12} textAnchor="middle" fontSize={14} fontWeight={700} fill={COR.texto}>
            {formatarPct(null)}
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
              <LineChart data={pontos} margin={{ top: 32, right: 4, bottom: 0, left: 4 }} accessibilityLayer={false}>
                <XAxis
                  dataKey="nome"
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: COR.eixo }}
                  tick={rotuloDoEixo}
                  padding={{ left: 32, right: 32 }}
                />
                <YAxis hide domain={[0, topo]} />
                <Tooltip
                  cursor={{ stroke: COR.eixo, strokeWidth: 1 }}
                  isAnimationActive={false}
                  content={(p) => <Dica ativo={p.active} linha={p.payload?.[0]?.payload as LinhaDoGrafico | undefined} />}
                />
                <ReferenceLine y={taxaGeral} stroke={COR.texto2} strokeWidth={1.5} strokeDasharray="6 4" />
                {mostrarDados && (
                  <Line
                    type="linear"
                    dataKey="valor"
                    stroke={COR.azul}
                    strokeWidth={2}
                    connectNulls={false}
                    dot={(p) => ponto(p, false)}
                    activeDot={(p: { cx?: number; cy?: number; index?: number }) => ponto(p, true)}
                    {...entrada}
                  >
                    <LabelList dataKey="valor" content={(p) => rotuloDoValor(p as { x?: number; y?: number; index?: number })} />
                  </Line>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {/* Sempre montada: reserva a linha e só tem texto com amostra pequena. */}
      <p className="min-h-lh whitespace-nowrap text-rotulo text-texto-2">
        {!semConsultas && temAmostraPequena
          ? `Ponto claro: menos de ${formatarInteiro(minimo)} consultas (amostra pequena)`
          : ""}
      </p>
    </figure>
  );
}
