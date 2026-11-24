import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Revelar, type Entrada } from "./Revelar";

describe("Revelar no HTML estático", () => {
  it("traz o conteúdo no HTML, no estado inicial (visível sem JavaScript), com a classe recebida", () => {
    const html = renderToStaticMarkup(<Revelar className="mt-12">Taxa de falta por faixa de espera</Revelar>);
    expect(html).toContain("Taxa de falta por faixa de espera");
    // "inicial" não tem regra no CSS: a página nunca depende do JavaScript para mostrar o conteúdo.
    expect(html).toContain('data-revelar="inicial"');
    expect(html).not.toContain("escondido");
    expect(html).toMatch(/<div[^>]*class="mt-12"/);
    // Nada que tire a seção da árvore de acessibilidade.
    expect(html).not.toContain("aria-hidden");
    expect(html).not.toContain("hidden");
  });

  it("com filho em forma de função, a função recebe que a seção ainda não surgiu nem anima", () => {
    const recebidas: Entrada[] = [];
    const html = renderToStaticMarkup(
      <Revelar>
        {(entrada) => {
          recebidas.push(entrada);
          return <p>gráfico</p>;
        }}
      </Revelar>,
    );
    expect(recebidas).toEqual([{ surgiu: false, animar: false }]);
    expect(html).toContain("<p>gráfico</p>");
  });
});
