import { describe, expect, it } from "vitest";
import { formatarInteiro, formatarPct } from "./formato";

describe("formatarPct", () => {
  it("arredonda para 1 casa e usa vírgula", () => {
    expect(formatarPct(20.18982817745044)).toBe("20,2%");
  });

  it("mostra uma casa mesmo quando é exato", () => {
    expect(formatarPct(5)).toBe("5,0%");
  });

  it("devolve um traço quando não há taxa", () => {
    expect(formatarPct(null)).toBe("—");
  });
});

describe("formatarInteiro", () => {
  it("usa ponto de milhar", () => {
    expect(formatarInteiro(110521)).toBe("110.521");
  });

  it("não mexe nos números pequenos", () => {
    expect(formatarInteiro(532)).toBe("532");
    expect(formatarInteiro(0)).toBe("0");
  });
});
