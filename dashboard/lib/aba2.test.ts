import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { carregarPainel } from "./dados";
import { textoDasFaixas } from "./faixas";
import { formatarInteiro, formatarPct } from "./formato";
import {
  corDaEscala,
  corDoTexto,
  ladosDoContorno,
  montarMapa,
  RAMPA,
  TEXTO_CLARO,
  TEXTO_ESCURO,
  TEXTO_ESCURO_DO_MAPA,
} from "./mapaDeCalor";
import { montarLinhasSms } from "./sms";

const painel = carregarPainel();
const css = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf-8");

describe("cor da escala do mapa de calor", () => {
  it("a rampa em hex é a mesma dos tokens do CSS", () => {
    RAMPA.forEach((hex, i) => {
      expect(css).toContain(`--color-rampa-${i + 1}: ${hex};`);
    });
    expect(css).toContain(`--color-texto: ${TEXTO_ESCURO};`);
  });

  it("0% dá a cor mais clara e 45% ou mais dá a mais escura", () => {
    expect(corDaEscala(0)).toBe("#cde2fb");
    expect(corDaEscala(45)).toBe("#104281");
    expect(corDaEscala(60)).toBe("#104281");
  });

  it("um valor intermediário fica entre as duas cores", () => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(corDaEscala(20).slice(i, i + 2), 16));
    expect(r).toBeLessThan(0xcd);
    expect(r).toBeGreaterThan(0x10);
    expect(g).toBeLessThan(0xe2);
    expect(g).toBeGreaterThan(0x42);
    expect(b).toBeLessThan(0xfb);
    expect(b).toBeGreaterThan(0x81);
  });

  it("nos marcos da rampa devolve a própria cor (45/6 = 7,5% é a segunda)", () => {
    expect(corDaEscala(7.5)).toBe(RAMPA[1]);
    expect(corDaEscala(22.5)).toBe(RAMPA[3]);
  });
});

describe("cor do texto da célula", () => {
  it("fundo escuro dá branco", () => {
    expect(corDoTexto("#104281")).toBe(TEXTO_CLARO);
    expect(corDoTexto("#256abf")).toBe(TEXTO_CLARO);
  });

  it("fundo claro dá o texto escuro do mapa (preto)", () => {
    expect(corDoTexto("#cde2fb")).toBe(TEXTO_ESCURO_DO_MAPA);
    expect(corDoTexto("#9ec5f4")).toBe(TEXTO_ESCURO_DO_MAPA);
  });
});

describe("texto das faixas", () => {
  it("as faixas do grupo de maior risco dão 13 a 29 anos e 16 dias ou mais", () => {
    expect(textoDasFaixas(painel.grupo_risco.faixas_etarias, "anos")).toBe("13 a 29 anos");
    expect(textoDasFaixas(painel.grupo_risco.faixas_espera, "dias")).toBe("16 dias ou mais");
  });

  it("a espera longa também dá 16 dias ou mais", () => {
    expect(textoDasFaixas(painel.espera_longa.faixas_espera, "dias")).toBe("16 dias ou mais");
  });

  it("faixa aberta de idade e faixa fora do padrão", () => {
    expect(textoDasFaixas(["45-59", "60+"], "anos")).toBe("45 anos ou mais");
    expect(textoDasFaixas(["Mesmo dia", "1-7 dias"], "dias")).toBe("Mesmo dia, 1-7 dias");
  });
});

describe("mapa de calor (idade x espera)", () => {
  const mapa = montarMapa(painel);
  const todas = mapa.celulas.flat();

  it("tem 6 faixas de idade x 5 de espera, na ordem do contrato", () => {
    expect(mapa.linhas).toEqual(["0-12", "13-17", "18-29", "30-44", "45-59", "60+"]);
    expect(mapa.colunas).toEqual(["Mesmo dia", "1-7 dias", "8-15 dias", "16-30 dias", "31+ dias"]);
    expect(todas).toHaveLength(30);
  });

  it("a maior célula é 42,5% (13-17, 31+ dias) e a menor é 3,1% (60+, Mesmo dia)", () => {
    const comTaxa = todas.filter((c) => c.taxa !== null);
    const maior = comTaxa.reduce((a, b) => ((a.taxa as number) >= (b.taxa as number) ? a : b));
    const menor = comTaxa.reduce((a, b) => ((a.taxa as number) <= (b.taxa as number) ? a : b));
    expect([maior.faixa_etaria, maior.faixa_espera, formatarPct(maior.taxa)]).toEqual(["13-17", "31+ dias", "42,5%"]);
    expect([menor.faixa_etaria, menor.faixa_espera, formatarPct(menor.taxa)]).toEqual(["60+", "Mesmo dia", "3,1%"]);
  });

  it("as 4 maiores células são as do grupo de maior risco", () => {
    const maiores = [...todas].sort((a, b) => (b.taxa ?? 0) - (a.taxa ?? 0)).slice(0, 4);
    expect(maiores.every((c) => c.noGrupo)).toBe(true);
    expect(todas.filter((c) => c.noGrupo)).toHaveLength(4);
  });

  it("o contorno do grupo é um bloco só: cada lado de fora aparece uma vez", () => {
    const lados = mapa.celulas.flatMap((linha, r) => linha.map((_, c) => ladosDoContorno(mapa, r, c)));
    const conta = (k: "topo" | "direita" | "baixo" | "esquerda") => lados.filter((l) => l[k]).length;
    // bloco 2x2: 2 células em cada lado de fora
    expect([conta("topo"), conta("direita"), conta("baixo"), conta("esquerda")]).toEqual([2, 2, 2, 2]);
  });

  it("nenhuma célula tem menos de 532 consultas", () => {
    expect(Math.min(...todas.map((c) => c.consultas))).toBe(532);
  });
});

describe("grupo de maior risco e espera longa", () => {
  it("grupo: 5.422 consultas, 40,2%, 4,9% das consultas e 9,8% das faltas", () => {
    const g = painel.grupo_risco;
    expect(formatarInteiro(g.consultas)).toBe("5.422");
    expect(formatarPct(g.taxa)).toBe("40,2%");
    expect(formatarPct(g.pct_consultas)).toBe("4,9%");
    expect(formatarPct(g.pct_faltas)).toBe("9,8%");
  });

  it("espera longa: 26.246 consultas, 32,7%, 23,7% das consultas e 38,5% das faltas", () => {
    const e = painel.espera_longa;
    expect(formatarInteiro(e.consultas)).toBe("26.246");
    expect(formatarPct(e.taxa)).toBe("32,7%");
    expect(formatarPct(e.pct_consultas)).toBe("23,7%");
    expect(formatarPct(e.pct_faltas)).toBe("38,5%");
  });

  it("o grupo é o mesmo que a soma das 4 células do mapa", () => {
    const celulas = montarMapa(painel).celulas.flat().filter((c) => c.noGrupo);
    expect(celulas.reduce((s, c) => s + c.consultas, 0)).toBe(painel.grupo_risco.consultas);
    expect(celulas.reduce((s, c) => s + c.faltas, 0)).toBe(painel.grupo_risco.faltas);
  });
});

describe("SMS", () => {
  const linhas = montarLinhasSms(painel);
  const taxas = (nome: string) => {
    const l = linhas.find((x) => x.nome === nome)!;
    return [formatarPct(l.sem.taxa), formatarPct(l.com.taxa)];
  };

  it("as taxas por faixa de espera batem com o docs/processo.md (sem SMS x com SMS)", () => {
    expect(taxas("1-7 dias")).toEqual(["24,4%", "23,8%"]);
    expect(taxas("8-15 dias")).toEqual(["34,1%", "28,4%"]);
    expect(taxas("16-30 dias")).toEqual(["36,8%", "29,7%"]);
    expect(taxas("31+ dias")).toEqual(["37,5%", "30,2%"]);
  });

  it("a comparação crua: 27,6% com SMS contra 16,7% sem SMS", () => {
    expect(formatarPct(painel.sms_geral.com.taxa)).toBe("27,6%");
    expect(formatarPct(painel.sms_geral.sem.taxa)).toBe("16,7%");
  });

  it("no mesmo dia ninguém recebeu SMS, e quem não recebeu falta 4,6%", () => {
    const l = linhas.find((x) => x.nome === "Mesmo dia")!;
    expect(l.com.consultas).toBe(0);
    expect(l.com.taxa).toBeNull();
    expect(formatarPct(l.sem.taxa)).toBe("4,6%");
  });

  it("em cada faixa com os dois grupos, quem recebeu o disparo (SMS na base) faltou menos ou quase igual (a frase da página)", () => {
    for (const l of linhas.filter((x) => x.com.consultas > 0)) {
      expect(l.com.taxa as number).toBeLessThanOrEqual((l.sem.taxa as number) + 0.1);
    }
  });
});
