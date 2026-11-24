import { describe, expect, it } from "vitest";
import { deveAnimar, lerAmbiente } from "./revelar";

describe("regra do surgimento", () => {
  it("só anima com observador e sem movimento reduzido", () => {
    expect(deveAnimar({ temObservador: true, movimentoReduzido: false })).toBe(true);
    expect(deveAnimar({ temObservador: true, movimentoReduzido: true })).toBe(false);
    expect(deveAnimar({ temObservador: false, movimentoReduzido: false })).toBe(false);
    expect(deveAnimar({ temObservador: false, movimentoReduzido: true })).toBe(false);
  });

  it("fora do navegador o ambiente vem com os dois campos falsos, sem erro", () => {
    expect(lerAmbiente()).toEqual({ temObservador: false, movimentoReduzido: false });
  });
});
