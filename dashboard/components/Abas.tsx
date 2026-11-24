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

/** Abas no padrão WAI-ARIA: setas esquerda/direita (e Home/End) trocam de aba; só a ativa entra na ordem do Tab. */
export function Abas({ abas, ativa, onChange }: Props) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);

  function aoTeclar(e: KeyboardEvent<HTMLButtonElement>, posicao: number) {
    const n = abas.length;
    let alvo = -1;
    if (e.key === "ArrowRight") alvo = (posicao + 1) % n;
    else if (e.key === "ArrowLeft") alvo = (posicao - 1 + n) % n;
    else if (e.key === "Home") alvo = 0;
    else if (e.key === "End") alvo = n - 1;
    if (alvo === -1) return;
    e.preventDefault();
    onChange(abas[alvo].id);
    botoes.current[alvo]?.focus();
  }

  return (
    <div role="tablist" aria-label="Seções do painel" className="flex gap-6">
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
            className={
              // Foco em amarelo com `!`: o :focus-visible global (azul-marinho) some na barra escura e ganharia sem ele.
              "cursor-pointer border-b-[3px] py-2 text-corpo focus-visible:outline-marca! " +
              (selecionada
                ? "border-marca font-bold text-fundo"
                : "border-transparent text-fundo/70 hover:text-fundo")
            }
          >
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
