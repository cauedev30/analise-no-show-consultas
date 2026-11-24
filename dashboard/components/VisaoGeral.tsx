"use client";

import { useMemo } from "react";
import { Cartao } from "./Cartao";
import { Filtros } from "./Filtros";
import { GraficoBairros } from "./GraficoBairros";
import { GraficoColunas } from "./GraficoColunas";
import { carregarPainel, indicesDosBairrosElegiveis } from "@/lib/dados";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import { agrupar, filtrar, rankingBairros, somar } from "@/lib/metricas";
import type { Filtros as TipoFiltros } from "@/lib/tipos";

// Parâmetros da regra do ranking de bairros (o mínimo na base inteira vem do painel).
const MINIMO_NO_RECORTE = 100;
const BAIRROS_NO_RANKING = 10;

const painel = carregarPainel();
const elegiveis = indicesDosBairrosElegiveis(painel);

interface Props {
  filtros: TipoFiltros;
  onChange: (filtros: TipoFiltros) => void;
}

/** Aba 1: o recorte escolhido nos filtros, em três números e quatro gráficos. */
export function VisaoGeral({ filtros, onChange }: Props) {
  const { ordem } = painel;

  const dados = useMemo(() => {
    const recorte = filtrar(painel.contagens, filtros);
    const resumo = somar(recorte);
    const porEspera = agrupar(recorte, "faixaEspera", ordem.faixa_espera.length);
    const porIdade = agrupar(recorte, "faixaEtaria", ordem.faixa_etaria.length);
    const porDia = agrupar(recorte, "diaSemana", ordem.dia_semana.length);
    const ranking = rankingBairros(recorte, elegiveis, MINIMO_NO_RECORTE, BAIRROS_NO_RANKING).map((b) => ({
      nome: ordem.bairro[b.bairro],
      taxa: b.taxa,
      consultas: b.consultas,
      faltas: b.faltas,
    }));
    // Mesma escala nos três gráficos de colunas, com folga em cima para o valor escrito.
    const taxas = [...porEspera, ...porIdade, ...porDia].map((r) => r.taxa ?? 0);
    const yMax = Math.max(painel.totais.taxa, ...taxas) * 1.05;
    return { resumo, porEspera, porIdade, porDia, ranking, yMax };
  }, [filtros, ordem]);

  const { resumo } = dados;
  const semConsultas = resumo.consultas === 0;
  const amostraPequena = !semConsultas && resumo.consultas < MINIMO_NO_RECORTE;
  const taxaGeral = painel.totais.taxa;

  return (
    <div className="flex flex-1 flex-col gap-4 px-8 pb-4 pt-3">
      <section aria-label="Filtros e números do recorte" className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <Filtros ordem={ordem} filtros={filtros} onChange={onChange} />
        <div>
          <div className="flex divide-x divide-eixo">
            <Cartao rotulo="Consultas" valor={formatarInteiro(resumo.consultas)} />
            <Cartao rotulo="Faltas" valor={formatarInteiro(resumo.faltas)} />
            <Cartao rotulo="Taxa de falta" valor={formatarPct(resumo.taxa)} />
          </div>
          {amostraPequena && (
            <p role="status" className="mt-1 text-rotulo font-bold">
              Amostra pequena: menos de {MINIMO_NO_RECORTE} consultas, a taxa oscila muito.
            </p>
          )}
        </div>
      </section>

      <div className="grid flex-1 gap-x-10 lg:min-h-0 gap-y-8 lg:grid-cols-[58fr_42fr]">
        <div className="flex flex-col gap-5 lg:min-h-0">
          <GraficoColunas
            className="lg:flex-[5]"
            titulo="Taxa de falta por faixa de espera"
            categorias={ordem.faixa_espera}
            resumos={dados.porEspera}
            taxaGeral={taxaGeral}
            yMax={dados.yMax}
            semConsultas={semConsultas}
          />
          <div className="grid gap-x-8 lg:min-h-0 lg:flex-[4] gap-y-6 sm:grid-cols-2">
            <GraficoColunas
              titulo="Por faixa de idade"
              categorias={ordem.faixa_etaria}
              resumos={dados.porIdade}
              taxaGeral={taxaGeral}
              yMax={dados.yMax}
              semConsultas={semConsultas}
            />
            <GraficoColunas
              titulo="Por dia da semana"
              categorias={ordem.dia_semana}
              resumos={dados.porDia}
              taxaGeral={taxaGeral}
              yMax={dados.yMax}
              semConsultas={semConsultas}
            />
          </div>
        </div>

        <GraficoBairros
          titulo="Bairros com maior taxa de falta"
          bairros={dados.ranking}
          minimoNaBase={painel.minimo_consultas_bairro}
          minimoNoRecorte={MINIMO_NO_RECORTE}
          semConsultas={semConsultas}
        />
      </div>
    </div>
  );
}
