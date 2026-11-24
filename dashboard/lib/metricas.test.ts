import { describe, expect, it } from "vitest";
import { carregarPainel, indicesDosBairrosElegiveis } from "./dados";
import { formatarPct } from "./formato";
import { agrupar, filtrar, rankingBairros, somar } from "./metricas";
import type { Filtros } from "./tipos";

const painel = carregarPainel();
const semFiltro: Filtros = { faixaEtaria: [], diaSemana: [], bairro: [], faixaEspera: [] };
const indice = (lista: string[], nome: string) => lista.indexOf(nome);

describe("carregarPainel", () => {
  it("converte as contagens para objetos com nomes", () => {
    expect(painel.contagens).toHaveLength(9485);
    expect(Object.keys(painel.contagens[0]).sort()).toEqual(
      ["bairro", "consultas", "diaSemana", "faixaEspera", "faixaEtaria", "faltas"].sort(),
    );
  });
});

describe("somar", () => {
  it("sem filtro devolve os totais do painel", () => {
    const resumo = somar(filtrar(painel.contagens, semFiltro));
    expect(resumo.consultas).toBe(painel.totais.consultas);
    expect(resumo.faltas).toBe(painel.totais.faltas);
    expect(resumo.taxa).toBeCloseTo(painel.totais.taxa, 9);
  });

  it("com o filtro Mesmo dia dá 38.562 consultas e 1.792 faltas", () => {
    const filtros = { ...semFiltro, faixaEspera: [indice(painel.ordem.faixa_espera, "Mesmo dia")] };
    const resumo = somar(filtrar(painel.contagens, filtros));
    expect(resumo.consultas).toBe(38562);
    expect(resumo.faltas).toBe(1792);
  });

  it("com o filtro 13-17 a taxa arredonda para 26,6%", () => {
    const filtros = { ...semFiltro, faixaEtaria: [indice(painel.ordem.faixa_etaria, "13-17")] };
    const resumo = somar(filtrar(painel.contagens, filtros));
    expect(formatarPct(resumo.taxa)).toBe("26,6%");
  });

  it("sem consultas a taxa é nula", () => {
    expect(somar([])).toEqual({ consultas: 0, faltas: 0, taxa: null });
  });
});

describe("filtrar", () => {
  it("dois filtros juntos dão a mesma célula de idade_espera", () => {
    const filtros = {
      ...semFiltro,
      faixaEtaria: [indice(painel.ordem.faixa_etaria, "13-17")],
      faixaEspera: [indice(painel.ordem.faixa_espera, "31+ dias")],
    };
    const resumo = somar(filtrar(painel.contagens, filtros));
    const celula = painel.idade_espera.find(
      (c) => c.faixa_etaria === "13-17" && c.faixa_espera === "31+ dias",
    )!;
    expect(resumo.consultas).toBe(celula.consultas);
    expect(resumo.faltas).toBe(celula.faltas);
    expect(resumo.taxa).toBeCloseTo(celula.taxa!, 9);
  });

  it("vários valores na mesma dimensão se somam (ou)", () => {
    const um = somar(filtrar(painel.contagens, { ...semFiltro, diaSemana: [0] }));
    const outro = somar(filtrar(painel.contagens, { ...semFiltro, diaSemana: [1] }));
    const dois = somar(filtrar(painel.contagens, { ...semFiltro, diaSemana: [0, 1] }));
    expect(dois.consultas).toBe(um.consultas + outro.consultas);
  });
});

describe("agrupar", () => {
  it("por faixa de espera soma os totais e a primeira posição dá 4,6%", () => {
    const grupos = agrupar(painel.contagens, "faixaEspera", painel.ordem.faixa_espera.length);
    expect(grupos).toHaveLength(5);
    expect(grupos.reduce((s, g) => s + g.consultas, 0)).toBe(painel.totais.consultas);
    expect(grupos.reduce((s, g) => s + g.faltas, 0)).toBe(painel.totais.faltas);
    expect(grupos[0].taxa!.toFixed(1)).toBe("4.6");
  });

  it("categoria sem consultas vem com zero e taxa nula", () => {
    const grupos = agrupar([], "diaSemana", 6);
    expect(grupos).toHaveLength(6);
    expect(grupos[0]).toEqual({ consultas: 0, faltas: 0, taxa: null });
  });
});

describe("rankingBairros", () => {
  const elegiveis = indicesDosBairrosElegiveis(painel);

  it("converte os nomes elegíveis em índices (54)", () => {
    expect(elegiveis).toHaveLength(54);
    expect(elegiveis.every((i) => painel.ordem.bairro[i] !== undefined)).toBe(true);
  });

  it("sem filtro começa por SANTOS DUMONT com 28,9%", () => {
    const ranking = rankingBairros(painel.contagens, elegiveis, 100, 10);
    expect(ranking).toHaveLength(10);
    expect(painel.ordem.bairro[ranking[0].bairro]).toBe("SANTOS DUMONT");
    expect(ranking[0].taxa.toFixed(1)).toBe("28.9");
    expect(ranking[0].consultas).toBe(1276);
  });

  it("vem da maior taxa para a menor", () => {
    const ranking = rankingBairros(painel.contagens, elegiveis, 100, 54);
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].taxa).toBeGreaterThanOrEqual(ranking[i].taxa);
    }
  });

  it("deixa de fora bairros fora da lista de elegíveis e com poucas consultas no recorte", () => {
    const ranking = rankingBairros(painel.contagens, elegiveis, 100, 100);
    expect(ranking.every((r) => elegiveis.includes(r.bairro))).toBe(true);
    expect(ranking.every((r) => r.consultas >= 100)).toBe(true);

    const filtros = { ...semFiltro, faixaEspera: [indice(painel.ordem.faixa_espera, "31+ dias")] };
    const recorte = filtrar(painel.contagens, filtros);
    const rankingRecorte = rankingBairros(recorte, elegiveis, 100, 100);
    expect(rankingRecorte.length).toBeLessThan(ranking.length);
    expect(rankingRecorte.every((r) => r.consultas >= 100)).toBe(true);
  });

  it("no limite do mínimo: 100 consultas entram e 99 não", () => {
    const linha = (bairro: number, consultas: number) => ({
      faixaEtaria: 0,
      diaSemana: 0,
      bairro,
      faixaEspera: 0,
      consultas,
      faltas: 10,
    });
    // Bairro 0 com 100 consultas no recorte (somando duas linhas) e bairro 1 com 99.
    const sinteticas = [linha(0, 60), linha(0, 40), linha(1, 99)];
    const ranking = rankingBairros(sinteticas, [0, 1], 100, 10);
    expect(ranking.map((r) => r.bairro)).toEqual([0]);
    expect(ranking[0].consultas).toBe(100);
  });
});
