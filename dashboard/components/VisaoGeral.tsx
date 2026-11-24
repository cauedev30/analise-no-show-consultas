"use client";

import { useMemo } from "react";
import { Cartao } from "./Cartao";
import { Filtros } from "./Filtros";
import { GraficoBairros } from "./GraficoBairros";
import { GraficoColunas } from "./GraficoColunas";
import { Revelar } from "./Revelar";
import { carregarPainel, indicesDosBairrosElegiveis } from "@/lib/dados";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import { agrupar, filtrar, rankingBairros, somar } from "@/lib/metricas";
import type { Filtros as TipoFiltros } from "@/lib/tipos";

// Parâmetros da regra do ranking de bairros (o mínimo na base inteira vem do painel).
export const MINIMO_NO_RECORTE = 100;
const BAIRROS_NO_RANKING = 10;

const painel = carregarPainel();
const elegiveis = indicesDosBairrosElegiveis(painel);

interface Props {
  filtros: TipoFiltros;
  onChange: (filtros: TipoFiltros) => void;
}

/** Aba 1: o recorte escolhido nos filtros, em três números (na barra fixa) e quatro seções, uma embaixo da outra. */
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

  // As três colunas na mesma altura: com o `yMax` comum, a altura de uma coluna se compara entre os gráficos.
  const colunas = [
    { titulo: "Taxa de falta por faixa de espera", categorias: ordem.faixa_espera, resumos: dados.porEspera },
    { titulo: "Por faixa de idade", categorias: ordem.faixa_etaria, resumos: dados.porIdade },
    { titulo: "Por dia da semana", categorias: ordem.dia_semana, resumos: dados.porDia },
  ];

  return (
    <div className="pb-24">
      {/* Barra fixa: acompanha a rolagem, para um filtro mudado lá embaixo mostrar o efeito na hora. Fica acima das
          seções no empilhamento, para os menus dos filtros abrirem por cima dos gráficos. Só presa a partir de 768 px:
          no celular ela quebra em várias linhas e cobriria metade da tela. */}
      <section
        data-barra-fixa
        aria-label="Filtros e números do recorte"
        className="relative z-30 md:sticky md:top-0 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-grade bg-fundo px-8 pb-1 pt-3"
      >
        <Filtros ordem={ordem} filtros={filtros} onChange={onChange} />
        <div>
          <div className="flex divide-x divide-eixo">
            <Cartao rotulo="Consultas" valor={formatarInteiro(resumo.consultas)} />
            <Cartao rotulo="Faltas" valor={formatarInteiro(resumo.faltas)} />
            <Cartao rotulo="Taxa de falta" valor={formatarPct(resumo.taxa)} />
          </div>
          {/* Sempre montado, para o leitor de tela anunciar a troca de texto e o layout não pular. */}
          <p aria-live="polite" className="mt-1 min-h-lh text-rotulo font-bold">
            {amostraPequena ? `Amostra pequena: menos de ${MINIMO_NO_RECORTE} consultas, a taxa oscila muito.` : ""}
          </p>
        </div>
      </section>

      {/* Uma seção por achado, na ordem da fala: o fator principal, o perfil, o que não pesa e a pista. */}
      <div className="flex flex-col gap-20 px-8 pt-6">
        {colunas.map((c) => (
          <Revelar key={c.titulo}>
            {(entrada) => (
              <GraficoColunas
                className="h-[23rem]"
                titulo={c.titulo}
                categorias={c.categorias}
                resumos={c.resumos}
                taxaGeral={taxaGeral}
                yMax={dados.yMax}
                semConsultas={semConsultas}
                minimo={MINIMO_NO_RECORTE}
                animarEntrada={entrada.animar}
              />
            )}
          </Revelar>
        ))}

        <Revelar>
          {(entrada) => (
            <GraficoBairros
              className="h-[30rem]"
              titulo="Bairros com maior taxa de falta"
              bairros={dados.ranking}
              minimoNaBase={painel.minimo_consultas_bairro}
              minimoNoRecorte={MINIMO_NO_RECORTE}
              semConsultas={semConsultas}
              animarEntrada={entrada.animar}
            />
          )}
        </Revelar>
      </div>
    </div>
  );
}
