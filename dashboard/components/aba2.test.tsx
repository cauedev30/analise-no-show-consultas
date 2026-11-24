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
  p.grupo_risco.faltas_acima_da_media = 4321.6;
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
const OFICIAIS = [
  "40,2%",
  "9,8%",
  "32,7%",
  "23,7%",
  "27,6%",
  "16,7%",
  "38,5%",
  "4,9%",
  "4,6%",
  "20,2%",
  "5.422",
  "26.246",
  "1.083",
];

function confere(html: string, deve: string[]) {
  const texto = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  for (const v of deve) expect(texto, `devia aparecer ${v}`).toContain(v);
  for (const v of OFICIAIS) expect(texto, `não devia aparecer ${v}`).not.toContain(v);
}

describe("nenhum número digitado: os textos da aba 2 vêm do painel", () => {
  it("as recomendações mostram os valores do painel de teste", () => {
    confere(renderToStaticMarkup(<Recomendacoes painel={sentinela} />), ["12,3%", "45,6%", "8,8%", "4.322"]);
  });

  it("as faixas do agente vêm do painel, não do texto", () => {
    const p = structuredClone(sentinela);
    p.grupo_risco.faixas_etarias = ["0-12", "13-17"];
    p.grupo_risco.faixas_espera = ["8-15 dias", "16-30 dias"];
    const html = renderToStaticMarkup(<Recomendacoes painel={p} />).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(html).toContain("De 0 a 17 anos, com 8 a 30 dias de espera");
    expect(html).not.toContain("13 a 29 anos");
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

  it("a frase do disparo mostra os valores do painel de teste", () => {
    confere(renderToStaticMarkup(<FraseSms painel={sentinela} />), ["55,5%", "22,2%", "7,7%"]);
  });

  it("com o painel oficial os mesmos textos mostram os números oficiais", () => {
    const html = [
      renderToStaticMarkup(<Recomendacoes painel={oficial} />),
      renderToStaticMarkup(<CartoesDoGrupo painel={oficial} />),
      renderToStaticMarkup(<FraseSms painel={oficial} />),
    ].join(" ");
    // 32,7%, 23,7% e 38,5% (espera longa) saíram da tela com o overbooking, na etapa 3D.
    for (const v of ["40,2%", "9,8%", "27,6%", "16,7%", "4,9%", "4,6%", "20,2%", "5.422", "1.083"]) {
      expect(html).toContain(v);
    }
  });

  it("o bloco do agente com o painel oficial mostra 40,2%, 1.083 e a frase do slide", () => {
    const texto = renderToStaticMarkup(<Recomendacoes painel={oficial} />).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(texto).toContain("De 13 a 29 anos, com 16 dias ou mais de espera, a falta é de 40,2%.");
    expect(texto).toContain("1.083 consultas a mais em seis semanas, se o grupo de risco faltasse como a média.");
    expect(texto).toContain("4,9% das consultas");
    expect(texto).toContain("9,8% das faltas");
  });
});

describe("o que saiu na etapa 3B (rodapé e bloco de ideia e limites)", () => {
  it("as recomendações não têm mais a ideia de aplicação nem os limites", () => {
    const html = renderToStaticMarkup(<Recomendacoes painel={oficial} />);
    expect(html).not.toContain("Ideia de aplicação");
    expect(html).not.toContain("Limites");
  });

  it("a página não tem o rodapé e mantém a linha da base no topo", () => {
    const html = renderToStaticMarkup(<Home />);
    expect(html).not.toContain("Código e documentação");
    expect(html).not.toContain("CC BY-NC-SA");
    expect(html).not.toContain("<footer");
    expect(html).toContain("Base: Medical Appointment No Shows (Kaggle)");
  });
});

describe("o agente de disparo no lugar das duas recomendações (etapa 3D)", () => {
  const html = renderToStaticMarkup(<Recomendacoes painel={oficial} />);
  const texto = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  it("traz o título, o subtítulo e os três passos", () => {
    expect(texto).toContain("O que recomendamos");
    expect(texto).toContain("Um agente de disparo de lembretes para reduzir as faltas");
    for (const passo of ["Classifica", "Dispara", "Libera"]) expect(html).toContain(`>${passo}</h3>`);
    expect(texto).toContain("Para quem tem risco alto, manda mais de um lembrete antes da consulta e pede confirmação.");
    expect(texto).toContain("o horário é oferecido a quem está na lista de espera.");
  });

  it("traz o limite (associação, começa em teste) e não cita o canal", () => {
    expect(texto).toContain("dentro da mesma faixa de espera, o disparo aparece junto com menos falta");
    expect(texto).toContain("o que ainda é associação");
    expect(texto).toContain("metade do grupo de risco recebe o reforço, e a outra metade não");
    expect(texto).not.toMatch(/SMS|WhatsApp/i);
  });

  it("não traz mais o overbooking nem o lembrete reforçado", () => {
    expect(texto).not.toMatch(/overbooking/i);
    expect(texto).not.toContain("Lembrete reforçado");
    expect(texto).not.toContain("23,7%");
    expect(texto).not.toContain("38,5%");
  });
});

describe("o SMS vira disparo de lembrete na tela (etapa 3D)", () => {
  const html = renderToStaticMarkup(<GrupoDeRiscoESms />);
  const texto = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  it("traz o título, a legenda e a descrição do gráfico com \"disparo\"", () => {
    expect(texto).toContain("Disparo de lembrete: a comparação crua engana");
    expect(texto).toContain("Com disparo");
    expect(texto).toContain("Sem disparo");
    expect(html).toContain('aria-label="Disparo de lembrete"');
    expect(html).toContain("com e sem disparo de lembrete");
  });

  it("a palavra SMS aparece uma vez, na frase da ponte com a base", () => {
    expect(texto.match(/SMS/g)).toHaveLength(1);
    expect(texto).toContain("Na base, o disparo registrado é o SMS.");
    expect(html.match(/SMS/g)).toHaveLength(1);
  });

  it("não traz overbooking em lugar nenhum da aba 2", () => {
    expect(html).not.toMatch(/overbooking/i);
  });

  it("o rótulo da aba é Grupo de risco e disparo", () => {
    const pagina = renderToStaticMarkup(<Home />);
    expect(pagina).toContain("Grupo de risco e disparo");
    expect(pagina).not.toContain("Grupo de risco e SMS");
  });
});

describe("aba 2 com o surgimento (etapa 3B)", () => {
  it("as 3 seções surgem sozinhas e mantêm os títulos; a nota dos filtros fica fora", () => {
    const html = renderToStaticMarkup(<GrupoDeRiscoESms />);
    expect(html.match(/data-revelar=/g)).toHaveLength(3);
    const posicoes = ["Taxa de falta por idade e espera", "Disparo de lembrete: a comparação crua engana", "O que recomendamos"].map((t) =>
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
