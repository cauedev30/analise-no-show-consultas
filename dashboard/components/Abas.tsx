"use client";

import { useRef, type KeyboardEvent } from "react";

export interface Aba {
  id: string;
  rotulo: string;
}

export const idDaAba = (id: string) => `aba-${id}`;
export const idDoPainel = (id: string) => `painel-${id}`;

interface Props {
  abas: Aba[];
  ativa: string;
  onChange: (id: string) => void;
}

/** Abas no padrão WAI-ARIA, na vertical: setas (cima/baixo e esquerda/direita) e Home/End trocam de aba; só a ativa
 * entra na ordem do Tab. */
export function Abas({ abas, ativa, onChange }: Props) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);

  function aoTeclar(e: KeyboardEvent<HTMLButtonElement>, posicao: number) {
    const n = abas.length;
    let alvo = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") alvo = (posicao + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") alvo = (posicao - 1 + n) % n;
    else if (e.key === "Home") alvo = 0;
    else if (e.key === "End") alvo = n - 1;
    if (alvo === -1) return;
    e.preventDefault();
    onChange(abas[alvo].id);
    botoes.current[alvo]?.focus();
  }

  return (
    <div role="tablist" aria-label="Seções do painel" aria-orientation="vertical" className="flex flex-col gap-1">
      {abas.map((aba, i) => {
        const selecionada = aba.id === ativa;
        return (
          <button
            key={aba.id}
            ref={(el) => {
              botoes.current[i] = el;
            }}
            type="button"
            role="tab"
            id={idDaAba(aba.id)}
            aria-selected={selecionada}
            aria-controls={idDoPainel(aba.id)}
            tabIndex={selecionada ? 0 : -1}
            onClick={() => onChange(aba.id)}
            onKeyDown={(e) => aoTeclar(e, i)}
            // O contorno global de foco é azul-marinho e some na lateral: aqui ele vai em amarelo, por dentro do botão.
            // O `!` é preciso porque a regra global de :focus-visible fica fora das camadas do Tailwind.
            className={
              "cursor-pointer border-l-4 px-6 py-3 text-left text-corpo focus-visible:outline-marca! focus-visible:-outline-offset-3! " +
              (selecionada
                ? "border-marca bg-white/10 font-bold text-white"
                : "border-transparent text-white/70 hover:bg-white/5 hover:text-white")
            }
          >
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
