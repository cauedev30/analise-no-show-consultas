import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ehAmostraPequena } from "./Dica";
import { GraficoColunas } from "./GraficoColunas";
import { GraficoLinha } from "./GraficoLinha";
import { MINIMO_NO_RECORTE, VisaoGeral } from "./VisaoGeral";
import { carregarPainel } from "@/lib/dados";
import { agrupar } from "@/lib/metricas";
import type { Filtros } from "@/lib/tipos";

const painel = carregarPainel();
const SEM_FILTROS: Filtros = { faixaEtaria: [], diaSemana: [], bairro: [], faixaEspera: [] };

/** O texto visível de um trecho de HTML (sem tags). */
function texto(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

function graficoDoDiaDaSemana() {
  const { ordem, totais } = painel;
  const resumos = agrupar(painel.contagens, "diaSemana", ordem.dia_semana.length);
  return renderToStaticMarkup(
    <GraficoColunas
      titulo="Por dia da semana"
      categorias={ordem.dia_semana}
      resumos={resumos}
      taxaGeral={totais.taxa}
      yMax={30}
      semConsultas={false}
      minimo={MINIMO_NO_RECORTE}
    />,
  );
}

describe("amostra pequena nas colunas", () => {
  it("a regra: tem consultas, mas menos que o mínimo", () => {
    expect(ehAmostraPequena(0, 100)).toBe(false);
    expect(ehAmostraPequena(1, 100)).toBe(true);
    expect(ehAmostraPequena(99, 100)).toBe(true);
    expect(ehAmostraPequena(100, 100)).toBe(false);
  });

  it("sem filtro, o sábado é amostra pequena e as outras categorias não", () => {
    const { ordem } = painel;
    const resumos = agrupar(painel.contagens, "diaSemana", ordem.dia_semana.length);
    const pequenas = ordem.dia_semana.filter((_, i) => ehAmostraPequena(resumos[i].consultas, MINIMO_NO_RECORTE));
    expect(pequenas).toHaveLength(1);
    expect(pequenas[0]).toMatch(/^S.bado$/);
    expect(resumos[ordem.dia_semana.indexOf(pequenas[0])].consultas).toBe(39);
  });

  it("o gráfico do dia da semana marca o sábado e mostra a nota com o mínimo vindo da prop", () => {
    const html = graficoDoDiaDaSemana();
    const t = texto(html);
    expect(t).toContain(`Coluna clara: menos de ${MINIMO_NO_RECORTE} consultas (amostra pequena)`);
    // A descrição para leitor de tela traz as consultas de cada coluna e a marca só no sábado.
    expect(html).toMatch(/S.bado 23,1%, 39 consultas, amostra pequena/);
    expect(html).toMatch(/Segunda [\d,]+%, [\d.]+ consultas[,.;]/);
    expect(html.match(/amostra pequena/g)).toHaveLength(2); // a nota e o sábado
  });

  it("sem coluna pequena, a nota não aparece", () => {
    const { ordem, totais } = painel;
    const resumos = agrupar(painel.contagens, "faixaEspera", ordem.faixa_espera.length);
    const html = renderToStaticMarkup(
      <GraficoColunas
        titulo="Por faixa de espera"
        categorias={ordem.faixa_espera}
        resumos={resumos}
        taxaGeral={totais.taxa}
        yMax={30}
        semConsultas={false}
        minimo={MINIMO_NO_RECORTE}
      />,
    );
    expect(texto(html)).not.toContain("Coluna clara");
    expect(html).not.toContain("amostra pequena");
  });

  it("na linha da espera, o ponto pequeno é marcado e a nota fala em ponto claro", () => {
    const { ordem, totais } = painel;
    // Um recorte inventado: a 2ª faixa com 40 consultas (pequena) e a 5ª sem nenhuma.
    const resumos = [
      { consultas: 500, faltas: 25, taxa: 5 },
      { consultas: 40, faltas: 10, taxa: 25 },
      { consultas: 300, faltas: 90, taxa: 30 },
      { consultas: 200, faltas: 64, taxa: 32 },
      { consultas: 0, faltas: 0, taxa: null },
    ];
    const html = renderToStaticMarkup(
      <GraficoLinha
        titulo="Taxa de falta por faixa de espera"
        categorias={ordem.faixa_espera}
        resumos={resumos}
        taxaGeral={totais.taxa}
        semConsultas={false}
        minimo={MINIMO_NO_RECORTE}
      />,
    );
    expect(texto(html)).toContain(`Ponto claro: menos de ${MINIMO_NO_RECORTE} consultas (amostra pequena)`);
    expect(html).toContain("1-7 dias 25,0%, 40 consultas, amostra pequena");
    expect(html).toContain("31+ dias sem consultas");
    expect(html.match(/amostra pequena/g)).toHaveLength(2); // a nota e o ponto pequeno
  });

  it("na linha da espera sem filtro não há ponto pequeno nem nota", () => {
    const { ordem, totais } = painel;
    const resumos = agrupar(painel.contagens, "faixaEspera", ordem.faixa_espera.length);
    const html = renderToStaticMarkup(
      <GraficoLinha
        titulo="Taxa de falta por faixa de espera"
        categorias={ordem.faixa_espera}
        resumos={resumos}
        taxaGeral={totais.taxa}
        semConsultas={false}
        minimo={MINIMO_NO_RECORTE}
      />,
    );
    expect(texto(html)).not.toContain("Ponto claro");
    expect(html).not.toContain("amostra pequena");
    expect(html).toContain("Mesmo dia 4,6%");
  });

  it("a aba Visão geral, sem filtro, mostra a nota uma vez (só no dia da semana)", () => {
    const html = renderToStaticMarkup(<VisaoGeral filtros={SEM_FILTROS} onChange={() => {}} />);
    expect(texto(html).match(/Coluna clara/g)).toHaveLength(1);
  });
});
