"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { deveAnimar, lerAmbiente } from "@/lib/revelar";

/** O que a seção conta aos filhos. */
export interface Entrada {
  /** A seção já está à vista para valer (ou o ambiente não anima): é a hora de mostrar as barras. */
  surgiu: boolean;
  /** A seção surgiu com animação: o sinal para as barras crescerem. */
  animar: boolean;
}

interface Props {
  children: ReactNode | ((entrada: Entrada) => ReactNode);
  className?: string;
}

/**
 * "inicial": o HTML estático e o tempo até o observador responder. A seção fica visível, para a página nunca depender
 * do JavaScript para mostrar o conteúdo (na primeira visita ao site ele pode levar segundos para carregar).
 * "escondido": a seção estava fora da tela quando o observador respondeu; espera entrar para surgir.
 * "visivel": surgiu, e não volta a esconder.
 */
type Estado = "inicial" | "escondido" | "visivel";

// Quanto da seção precisa estar na tela para ela surgir ao rolar (15%).
const LIMIAR = 0.15;

// O ambiente é lido uma vez no navegador e não muda depois; por isso não há o que assinar.
const semAssinatura = () => () => {};
const lerNoNavegador = () => deveAnimar(lerAmbiente());
// No HTML estático e na hidratação o ambiente é desconhecido (igual dos dois lados).
const lerNoServidor = () => null;

/**
 * Envolve uma seção e a faz surgir uma vez, quando ela entra na tela (o fade e a subida estão no globals.css).
 * O que já está na tela quando a página carrega fica onde está (só as barras crescem); o que está fora é escondido e
 * surge ao rolar. Com movimento reduzido ou sem IntersectionObserver, tudo aparece direto.
 * Só opacidade e deslocamento: a seção escondida continua na árvore de acessibilidade e na ordem de tabulação.
 */
export function Revelar({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const anima = useSyncExternalStore<boolean | null>(semAssinatura, lerNoNavegador, lerNoServidor);
  const [estado, setEstado] = useState<Estado>("inicial");

  useEffect(() => {
    const elemento = ref.current;
    // Visível é para sempre: o observador sai (a limpeza do efeito anterior o desliga).
    if (anima !== true || elemento === null || estado === "visivel") return;
    const observador = new IntersectionObserver(
      (registros) => {
        const proporcao = Math.max(...registros.map((r) => r.intersectionRatio));
        setEstado((anterior) => {
          if (anterior === "visivel") return anterior;
          // A primeira resposta diz onde a seção está ao carregar: na tela (qualquer parte) fica; fora, esconde.
          if (anterior === "inicial") return proporcao > 0 ? "visivel" : "escondido";
          return proporcao >= LIMIAR ? "visivel" : anterior;
        });
      },
      { threshold: [0, LIMIAR] },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [anima, estado]);

  const surgiu = anima === false || estado === "visivel";
  const entrada: Entrada = { surgiu, animar: surgiu && anima === true };

  return (
    <div ref={ref} data-revelar={anima === false ? "visivel" : estado} className={className}>
      {typeof children === "function" ? children(entrada) : children}
    </div>
  );
}
