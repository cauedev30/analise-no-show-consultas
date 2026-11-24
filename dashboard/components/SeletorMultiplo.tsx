"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent } from "react";

interface Props {
  rotulo: string;
  /** Os rótulos, na ordem do contrato. O valor de cada opção é a sua posição. */
  opcoes: string[];
  selecionados: number[];
  onChange: (selecionados: number[]) => void;
  /** Mostra um campo para filtrar a lista (usado no bairro, que tem 81 opções). */
  comBusca?: boolean;
  /** Texto do campo de busca (só com `comBusca`). */
  textoBusca?: string;
  /** Mensagem quando a busca não acha nenhuma opção (só com `comBusca`). */
  textoSemResultado?: string;
}

const semAcento = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Botão que abre uma lista de caixas de seleção. Fecha com Esc, com clique fora e ao sair com o Tab. */
export function SeletorMultiplo({ rotulo, opcoes, selecionados, onChange, comBusca = false, textoBusca = "", textoSemResultado = "" }: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const raiz = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);
  const campoBusca = useRef<HTMLInputElement>(null);
  const idLista = useId();

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };
    // Esc fecha mesmo quando o foco não está dentro da lista (por exemplo, depois de um clique no mouse).
    const esc = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setAberto(false);
      setBusca("");
      botao.current?.focus();
    };
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  useEffect(() => {
    if (aberto && comBusca) campoBusca.current?.focus();
  }, [aberto, comBusca]);

  function fechar(devolverFoco: boolean) {
    setAberto(false);
    setBusca("");
    if (devolverFoco) botao.current?.focus();
  }

  // Só fecha quando o foco vai para um elemento fora do seletor (Tab para fora). Um clique no texto ou no
  // espaço da lista tira o foco sem destino (relatedTarget nulo) e não deve fechar; o clique fora é do pointerdown.
  function aoPerderFoco(e: FocusEvent<HTMLDivElement>) {
    const destino = e.relatedTarget as Node | null;
    if (aberto && destino !== null && !raiz.current?.contains(destino)) fechar(false);
  }

  // Clicar na lista não tira o foco de onde ele está; só o campo de busca recebe o foco do clique.
  function aoApertarNaLista(e: MouseEvent<HTMLDivElement>) {
    if (!(e.target instanceof HTMLInputElement && e.target.type === "search")) e.preventDefault();
  }

  function alternar(posicao: number) {
    const proximos = selecionados.includes(posicao)
      ? selecionados.filter((p) => p !== posicao)
      : [...selecionados, posicao].sort((a, b) => a - b);
    onChange(proximos);
  }

  const termo = semAcento(busca.trim());
  const visiveis = opcoes
    .map((nome, posicao) => ({ nome, posicao }))
    .filter(({ nome }) => termo === "" || semAcento(nome).includes(termo));

  const resumo =
    selecionados.length === 0
      ? "Sem filtro"
      : selecionados.length === 1
        ? opcoes[selecionados[0]]
        : `${selecionados.length} de ${opcoes.length}`;

  return (
    <div ref={raiz} className="relative" onBlur={aoPerderFoco}>
      <button
        ref={botao}
        type="button"
        aria-expanded={aberto}
        aria-controls={aberto ? idLista : undefined}
        onClick={() => (aberto ? fechar(false) : setAberto(true))}
        className={
          "flex min-w-36 max-w-60 cursor-pointer flex-col rounded border bg-fundo px-3 py-1.5 text-left hover:bg-neutro " +
          (selecionados.length > 0 ? "border-texto" : "border-grade")
        }
      >
        <span className="text-rotulo text-texto-2">{rotulo}</span>
        <span className="truncate text-corpo font-bold">{resumo}</span>
      </button>

      {aberto && (
        <div
          id={idLista}
          role="group"
          aria-label={rotulo}
          onMouseDown={aoApertarNaLista}
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded border border-eixo bg-fundo p-2 shadow-md"
        >
          {comBusca && (
            <input
              ref={campoBusca}
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={textoBusca}
              aria-label={`Buscar em ${rotulo.toLowerCase()}`}
              className="mb-2 w-full rounded border border-eixo bg-fundo px-2 py-1.5 text-corpo"
            />
          )}
          <ul className="max-h-72 overflow-y-auto">
            {visiveis.map(({ nome, posicao }) => (
              <li key={posicao}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-corpo hover:bg-neutro">
                  <input
                    type="checkbox"
                    checked={selecionados.includes(posicao)}
                    onChange={() => alternar(posicao)}
                    className="size-4 accent-texto"
                  />
                  {nome}
                </label>
              </li>
            ))}
            {visiveis.length === 0 && <li className="px-2 py-1.5 text-rotulo text-texto-2">{textoSemResultado}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
