import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ehAmostraPequena } from "./Dica";
import { GraficoDesvio } from "./GraficoDesvio";
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

describe("amostra pequena nos gráficos", () => {
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

  it("no desvio da idade, a linha de leitura usa a taxa geral recebida e a nota fala em barra clara", () => {
    const { ordem } = painel;
    const resumos = [
      { consultas: 500, faltas: 100, taxa: 20 },
      { consultas: 60, faltas: 18, taxa: 30 },
      { consultas: 400, faltas: 100, taxa: 25 },
      { consultas: 400, faltas: 80, taxa: 20 },
      { consultas: 400, faltas: 60, taxa: 15 },
      { consultas: 0, faltas: 0, taxa: null },
    ];
    const html = renderToStaticMarkup(
      <GraficoDesvio
        titulo="Por faixa de idade"
        categorias={ordem.faixa_etaria}
        resumos={resumos}
        taxaGeral={33.3}
        semConsultas={false}
        minimo={MINIMO_NO_RECORTE}
      />,
    );
    const t = texto(html);
    // A taxa geral vem da prop (sentinela 33,3%), não está digitada.
    expect(t).toContain("Taxa geral 33,3%. Para a direita: acima dela. Para a esquerda: abaixo.");
    expect(t).not.toContain("20,2%");
    expect(t).toContain(`Barra clara: menos de ${MINIMO_NO_RECORTE} consultas (amostra pequena)`);
    // A descrição traz as 6 faixas com a taxa (não a diferença).
    expect(html).toContain("13-17 30,0%, 60 consultas, amostra pequena");
    expect(html).toContain("60+ sem consultas");
    expect(html.match(/consultas/g)!.length).toBeGreaterThanOrEqual(6);
  });

  it("no desvio da idade sem filtro não há barra clara", () => {
    const { ordem, totais } = painel;
    const resumos = agrupar(painel.contagens, "faixaEtaria", ordem.faixa_etaria.length);
    const html = renderToStaticMarkup(
      <GraficoDesvio
        titulo="Por faixa de idade"
        categorias={ordem.faixa_etaria}
        resumos={resumos}
        taxaGeral={totais.taxa}
        semConsultas={false}
        minimo={MINIMO_NO_RECORTE}
      />,
    );
    expect(texto(html)).not.toContain("Barra clara");
    expect(html).toContain("13-17 26,6%");
    expect(html).toContain("60+ 15,3%");
  });

  it("a aba Visão geral, sem filtro, não tem nota de amostra pequena (o sábado era o único caso)", () => {
    const html = renderToStaticMarkup(<VisaoGeral filtros={SEM_FILTROS} onChange={() => {}} />);
    expect(texto(html)).not.toMatch(/Ponto claro|Barra clara|Amostra pequena/);
  });

  it("filtrando o sábado (39 consultas), as notas e o aviso da barra aparecem", () => {
    const sabado = painel.ordem.dia_semana.findIndex((d) => /^S.bado$/.test(d));
    const html = renderToStaticMarkup(
      <VisaoGeral filtros={{ ...SEM_FILTROS, diaSemana: [sabado] }} onChange={() => {}} />,
    );
    const t = texto(html);
    expect(t).toContain("Ponto claro");
    expect(t).toContain("Barra clara");
    expect(t).toContain(`Amostra pequena: menos de ${MINIMO_NO_RECORTE} consultas`);
  });
});
