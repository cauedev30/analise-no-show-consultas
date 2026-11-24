import { describe, expect, it } from "vitest";
import { desvio, escalaSimetrica } from "./desvio";
import { carregarPainel } from "./dados";
import { formatarPct } from "./formato";
import { agrupar } from "./metricas";

const painel = carregarPainel();

describe("desvio da taxa geral", () => {
  it("sem filtro, cada faixa de idade fica a taxa oficial menos a taxa geral", () => {
    const { ordem, totais } = painel;
    const resumos = agrupar(painel.contagens, "faixaEtaria", ordem.faixa_etaria.length);
    const porFaixa = Object.fromEntries(ordem.faixa_etaria.map((f, i) => [f, resumos[i].taxa]));
    expect(formatarPct(totais.taxa)).toBe("20,2%");
    expect(formatarPct(porFaixa["13-17"])).toBe("26,6%");
    expect(formatarPct(porFaixa["60+"])).toBe("15,3%");
    expect(desvio(porFaixa["13-17"], totais.taxa)).toBeCloseTo(porFaixa["13-17"]! - totais.taxa, 10);
    expect(desvio(porFaixa["13-17"], totais.taxa)!).toBeGreaterThan(6);
    expect(desvio(porFaixa["60+"], totais.taxa)!).toBeLessThan(-4);
  });

  it("faixa sem consultas não tem desvio", () => {
    expect(desvio(null, 20.2)).toBeNull();
  });
});

describe("escala simétrica", () => {
  it("é simétrica e cobre o maior desvio com folga", () => {
    expect(escalaSimetrica([6.4, -4.9, 0.3, null], 1.3, 2)).toEqual([-6.4 * 1.3, 6.4 * 1.3]);
    expect(escalaSimetrica([-8, 3], 1.3, 2)).toEqual([-8 * 1.3, 8 * 1.3]);
  });

  it("respeita o mínimo quando todos os desvios são pequenos ou não existem", () => {
    expect(escalaSimetrica([0.5, -0.2], 1.3, 2)).toEqual([-2, 2]);
    expect(escalaSimetrica([null, null], 1.3, 2)).toEqual([-2, 2]);
  });
});
