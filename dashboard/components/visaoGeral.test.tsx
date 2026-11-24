import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VisaoGeral } from "./VisaoGeral";
import type { Filtros } from "@/lib/tipos";

const SEM_FILTROS: Filtros = { faixaEtaria: [], diaSemana: [], bairro: [], faixaEspera: [] };
const html = renderToStaticMarkup(<VisaoGeral filtros={SEM_FILTROS} onChange={() => {}} />);

/** O texto visível de um trecho de HTML (sem tags). */
function texto(trecho: string): string {
  return trecho.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

const inicioDasSecoes = html.indexOf("data-revelar=");

describe("aba Visão geral em seções (etapas 3B e 3C)", () => {
  it("a barra fixa traz os 4 filtros (inclusive o dia da semana), o Limpar filtros e os 3 números da base inteira", () => {
    const inicio = html.indexOf("data-barra-fixa");
    expect(inicio).toBeGreaterThan(-1);
    const barra = texto(html.slice(inicio, html.indexOf("</section>", inicio)));
    for (const v of ["Faixa de idade", "Dia da semana", "Bairro", "Dias de espera", "Limpar filtros"]) {
      expect(barra).toContain(v);
    }
    for (const v of ["110.521", "22.314", "20,2%"]) expect(barra).toContain(v);
  });

  it("as três seções saem na ordem da fala: espera, idade, bairros", () => {
    const titulos = ["Taxa de falta por faixa de espera", "Por faixa de idade", "Bairros com maior taxa de falta"].map(
      (t) => html.indexOf(t),
    );
    expect(titulos.every((i) => i > -1)).toBe(true);
    expect([...titulos].sort((a, b) => a - b)).toEqual(titulos);
  });

  it("o dia da semana não tem mais seção: fica só como filtro", () => {
    expect(html.slice(inicioDasSecoes)).not.toContain("Por dia da semana");
    expect(html.slice(inicioDasSecoes)).not.toContain("Segunda");
  });

  it("cada uma das 3 seções surge sozinha, e a barra fixa não", () => {
    expect(html.match(/data-revelar=/g)).toHaveLength(3);
    expect(html.indexOf("data-barra-fixa")).toBeLessThan(inicioDasSecoes);
  });
});
