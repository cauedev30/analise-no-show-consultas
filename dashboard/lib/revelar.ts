/**
 * A regra do surgimento das seções ao rolar (etapa 3B), separada do navegador para poder ser testada.
 * As seções só animam quando o navegador sabe dizer quando elas entram na tela (IntersectionObserver) e a pessoa não
 * pediu menos movimento. Em qualquer outro caso, tudo aparece de uma vez.
 */

export interface Ambiente {
  /** O navegador tem `IntersectionObserver`. */
  temObservador: boolean;
  /** A pessoa pediu menos movimento (`prefers-reduced-motion: reduce`). */
  movimentoReduzido: boolean;
}

/** Verdadeiro só com observador e sem movimento reduzido. */
export function deveAnimar(ambiente: Ambiente): boolean {
  return ambiente.temObservador && !ambiente.movimentoReduzido;
}

/** Lê o ambiente do navegador. Fora dele (Node, geração estática) devolve os dois campos falsos, sem lançar erro. */
export function lerAmbiente(): Ambiente {
  if (typeof window === "undefined") return { temObservador: false, movimentoReduzido: false };
  return {
    temObservador: typeof window.IntersectionObserver === "function",
    movimentoReduzido:
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}
