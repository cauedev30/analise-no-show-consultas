import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CartoesDoGrupo } from "./CartoesDoGrupo";
import { FraseSms } from "./FraseSms";
import { GrupoDeRiscoESms } from "./GrupoDeRiscoESms";
import { MapaDeCalor } from "./MapaDeCalor";
import { Recomendacoes } from "./Recomendacoes";
import Home from "@/app/page";
import { carregarPainel } from "@/lib/dados";
import { contraste } from "@/lib/mapaDeCalor";
import type { Painel } from "@/lib/tipos";

const oficial = carregarPainel();

/** Uma cópia do painel em que todo número que aparece no texto da aba 2 vira um valor inventado (sentinela). */
function painelComSentinelas(): Painel {
  const p = structuredClone(oficial);
  p.totais.taxa = 33.3;
  p.totais.faltas = 9999;
  p.grupo_risco.consultas = 1234;
  p.grupo_risco.faltas = 777;
  p.grupo_risco.taxa = 12.3;
  p.grupo_risco.pct_consultas = 8.8;
  p.grupo_risco.pct_faltas = 45.6;
  p.espera_longa.taxa = 67.8;
  p.espera_longa.pct_consultas = 11.1;
  p.espera_longa.pct_faltas = 66.6;
  p.sms_geral.com.taxa = 55.5;
  p.sms_geral.sem.taxa = 22.2;
  const mesmoDiaSemSms = p.sms_espera.find((c) => c.faixa_espera === p.ordem.faixa_espera[0] && c.recebeu_sms === 0)!;
  mesmoDiaSemSms.taxa = 7.7;
  return p;
}

const sentinela = painelComSentinelas();

// Os números oficiais do projeto: nenhum deles pode estar digitado nos componentes.
const OFICIAIS = ["40,2%", "9,8%", "32,7%", "23,7%", "27,6%", "16,7%", "38,5%", "4,9%", "4,6%", "20,2%", "5.422", "26.246"];

function confere(html: string, deve: string[]) {
  const texto = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const v of deve) expect(texto, `devia aparecer ${v}`).toContain(v);
  for (const v of OFICIAIS) expect(texto, `não devia aparecer ${v}`).not.toContain(v);
}

describe("nenhum número digitado: os textos da aba 2 vêm do painel", () => {
  it("as recomendações mostram os valores do painel de teste", () => {
    confere(renderToStaticMarkup(<Recomendacoes painel={sentinela} />), ["12,3%", "45,6%", "67,8%", "11,1%", "66,6%", "8,8%"]);
  });

  it("os cartões do grupo de maior risco mostram os valores do painel de teste", () => {
    confere(renderToStaticMarkup(<CartoesDoGrupo painel={sentinela} />), [
      "12,3%",
      "45,6%",
      "8,8%",
      "33,3%",
      "1.234",
      "777",
      "9.999",
    ]);
  });

  it("a frase do SMS mostra os valores do painel de teste", () => {
    confere(renderToStaticMarkup(<FraseSms painel={sentinela} />), ["55,5%", "22,2%", "7,7%"]);
  });

  it("com o painel oficial os mesmos textos mostram os números oficiais", () => {
    const html = [
      renderToStaticMarkup(<Recomendacoes painel={oficial} />),
      renderToStaticMarkup(<CartoesDoGrupo painel={oficial} />),
      renderToStaticMarkup(<FraseSms painel={oficial} />),
    ].join(" ");
    for (const v of ["40,2%", "9,8%", "32,7%", "23,7%", "27,6%", "16,7%", "38,5%", "4,9%", "4,6%", "20,2%", "5.422"]) {
      expect(html).toContain(v);
    }
  });
});

describe("o que saiu na etapa 3B (rodapé e bloco de ideia e limites)", () => {
  it("as recomendações não têm mais a ideia de aplicação nem os limites, e mantêm as duas recomendações", () => {
    const html = renderToStaticMarkup(<Recomendacoes painel={oficial} />);
    expect(html).not.toContain("Ideia de aplicação");
    expect(html).not.toContain("Limites");
    expect(html).toContain("Lembrete reforçado para o grupo de maior risco");
    expect(html).toContain("Overbooking controlado pelo tempo de espera");
  });

  it("a página não tem o rodapé e mantém a linha da base no topo", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).not.toContain("Código e documentação");
    expect(html).not.toContain("CC BY-NC-SA");
    expect(html).not.toContain("<footer");
    expect(html).toContain("Base: Medical Appointment No Shows (Kaggle)");
  });
});

describe("aba 2 com o surgimento (etapa 3B)", () => {
  it("as 3 seções surgem sozinhas e mantêm os títulos; a nota dos filtros fica fora", () => {
    const html = renderToStaticMarkup(<GrupoDeRiscoESms />);
    expect(html.match(/data-revelar=/g)).toHaveLength(3);
    const posicoes = ["Taxa de falta por idade e espera", "SMS: a comparação crua engana", "O que recomendamos"].map((t) =>
      html.indexOf(t),
    );
    expect(posicoes.every((i) => i > -1)).toBe(true);
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
    expect(html.indexOf("os filtros valem só na Visão geral")).toBeLessThan(html.indexOf("data-revelar="));
  });
});

describe("mapa de calor renderizado", () => {
  const html = renderToStaticMarkup(<MapaDeCalor painel={oficial} />);
  const celulas = [...html.matchAll(/<td[^>]*style="([^"]*)"[^>]*>/g)].map((m) => m[1]);

  it("contraste do texto de cada uma das 30 células com o fundo é de pelo menos 4,5:1", () => {
    expect(celulas).toHaveLength(30);
    const piores: number[] = [];
    for (const estilo of celulas) {
      const fundo = /background-color:(#[0-9a-f]{6})/.exec(estilo)?.[1];
      const texto = /(?:^|;)color:(#[0-9a-f]{6})/.exec(estilo)?.[1];
      expect(fundo, estilo).toBeDefined();
      expect(texto, estilo).toBeDefined();
      piores.push(contraste(fundo!, texto!));
    }
    expect(Math.min(...piores)).toBeGreaterThanOrEqual(4.5);
  });

  it("a tabela tem nome e as 4 células do grupo avisam o leitor de tela", () => {
    expect(html).toContain('aria-labelledby="titulo-mapa-de-calor"');
    expect(html).toContain('id="titulo-mapa-de-calor"');
    expect(html.match(/\(grupo de maior risco\)/g)).toHaveLength(4);
  });

  it("a coluna de idade e o grupo de colunas têm cabeçalho", () => {
    expect(html).toContain("<colgroup");
    expect(html).toMatch(/<th[^>]*scope="col"[^>]*>Idade<\/th>/);
    expect(html).toMatch(/<th[^>]*scope="colgroup"/);
    expect(html).not.toContain("<td/>");
  });
});
