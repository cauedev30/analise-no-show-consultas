"use client";

import { useMemo } from "react";
import { Cartao } from "./Cartao";
import { Filtros } from "./Filtros";
import { GraficoBairros } from "./GraficoBairros";
import { GraficoDesvio } from "./GraficoDesvio";
import { GraficoLinha } from "./GraficoLinha";
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

/**
 * Aba 1: o recorte escolhido nos filtros, em três números (na barra fixa) e três seções, cada uma num cartão. Cada
 * seção tem a forma do seu achado: a espera é uma progressão (linha), a idade fica acima ou abaixo da média (desvio) e
 * os bairros são um ranking (pirulito). O dia da semana fica só como filtro: a taxa quase não muda entre os dias.
 */
export function VisaoGeral({ filtros, onChange }: Props) {
  const { ordem } = painel;

  const dados = useMemo(() => {
    const recorte = filtrar(painel.contagens, filtros);
    const resumo = somar(recorte);
    const porEspera = agrupar(recorte, "faixaEspera", ordem.faixa_espera.length);
    const porIdade = agrupar(recorte, "faixaEtaria", ordem.faixa_etaria.length);
    const ranking = rankingBairros(recorte, elegiveis, MINIMO_NO_RECORTE, BAIRROS_NO_RANKING).map((b) => ({
      nome: ordem.bairro[b.bairro],
      taxa: b.taxa,
      consultas: b.consultas,
      faltas: b.faltas,
    }));
    return { resumo, porEspera, porIdade, ranking };
  }, [filtros, ordem]);

  const { resumo } = dados;
  const semConsultas = resumo.consultas === 0;
  const amostraPequena = !semConsultas && resumo.consultas < MINIMO_NO_RECORTE;
  const taxaGeral = painel.totais.taxa;

  return (
    <div className="pb-24">
      {/* Barra fixa: acompanha a rolagem, para um filtro mudado lá embaixo mostrar o efeito na hora. Fica acima das
          seções no empilhamento, para os menus dos filtros abrirem por cima dos gráficos. Só presa a partir de 768 px:
          no celular ela quebra em várias linhas e cobriria metade da tela. */}
      <section
        data-barra-fixa
        aria-label="Filtros e números do recorte"
        className="relative z-30 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-grade bg-pagina px-6 py-3 md:sticky md:top-0 lg:px-8"
      >
        <Filtros ordem={ordem} filtros={filtros} onChange={onChange} />
        <div className="flex flex-wrap gap-3">
          <Cartao rotulo="Consultas" valor={formatarInteiro(resumo.consultas)} />
          <Cartao rotulo="Faltas" valor={formatarInteiro(resumo.faltas)} />
          <Cartao rotulo="Taxa de falta" valor={formatarPct(resumo.taxa)} destaque />
        </div>
        {/* Sempre montado, para o leitor de tela anunciar a troca de texto e o layout não pular. Ocupa o resto da linha
            dos números (e não uma linha só dele), para a barra não crescer no projetor. */}
        <p aria-live="polite" className="min-h-lh min-w-48 flex-1 text-rotulo font-bold">
          {amostraPequena ? `Amostra pequena: menos de ${MINIMO_NO_RECORTE} consultas, a taxa oscila muito.` : ""}
        </p>
      </section>

      {/* Uma seção por achado, na ordem da fala: o fator principal, o perfil e a pista. Cada uma num cartão do painel:
          a espera na largura toda; idade e bairros lado a lado a partir de 1280 px (com a lateral, abaixo disso o
          ranking dos bairros fica espremido). */}
      <div className="grid gap-6 px-6 pt-6 lg:px-8 xl:grid-cols-2">
        {/* A espera é uma progressão (quanto mais espera, mais falta): linha com pontos. */}
        <Revelar className="cartao max-sm:px-3 xl:col-span-2">
          {(entrada) => (
            <GraficoLinha
              className="h-[23rem]"
              titulo="Taxa de falta por faixa de espera"
              categorias={ordem.faixa_espera}
              resumos={dados.porEspera}
              taxaGeral={taxaGeral}
              semConsultas={semConsultas}
              minimo={MINIMO_NO_RECORTE}
              mostrarDados={entrada.surgiu}
              animarEntrada={entrada.animar}
            />
          )}
        </Revelar>

        {/* A idade mostra quem fica acima ou abaixo da média: barras de desvio da taxa geral. */}
        <Revelar className="cartao max-sm:px-3">
          {(entrada) => (
            <GraficoDesvio
              className="h-[18rem] xl:h-[30rem]"
              titulo="Por faixa de idade"
              categorias={ordem.faixa_etaria}
              resumos={dados.porIdade}
              taxaGeral={taxaGeral}
              semConsultas={semConsultas}
              minimo={MINIMO_NO_RECORTE}
              mostrarDados={entrada.surgiu}
              animarEntrada={entrada.animar}
            />
          )}
        </Revelar>

        {/* Os bairros são um ranking: pirulito (linha fina e um ponto no fim). */}
        <Revelar className="cartao max-sm:px-3">
          {(entrada) => (
            <GraficoBairros
              className="h-[30rem]"
              titulo="Bairros com maior taxa de falta"
              bairros={dados.ranking}
              minimoNaBase={painel.minimo_consultas_bairro}
              minimoNoRecorte={MINIMO_NO_RECORTE}
              semConsultas={semConsultas}
              mostrarDados={entrada.surgiu}
              animarEntrada={entrada.animar}
            />
          )}
        </Revelar>
      </div>
    </div>
  );
}
