"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { deveAnimar, lerAmbiente } from "@/lib/revelar";

/** O que a seção conta aos filhos. */
export interface Entrada {
  /** A seção já entrou na tela (ou o ambiente não anima, e ela aparece direto). */
  surgiu: boolean;
  /** A seção surgiu com animação: o sinal para as barras crescerem. */
  animar: boolean;
}

interface Props {
  children: ReactNode | ((entrada: Entrada) => ReactNode);
  className?: string;
}

// Quanto da seção precisa estar na tela para ela surgir (15%).
const LIMIAR = 0.15;

// O ambiente é lido uma vez no navegador e não muda depois; por isso não há o que assinar.
const semAssinatura = () => () => {};
const lerNoNavegador = () => deveAnimar(lerAmbiente());
// No HTML estático e na hidratação o ambiente é desconhecido: a seção começa escondida, igual dos dois lados.
const lerNoServidor = () => null;

/**
 * Envolve uma seção e a faz surgir uma vez, quando ela entra na tela (o fade e a subida estão no globals.css).
 * Com movimento reduzido ou sem IntersectionObserver, a seção aparece direto. Não volta a esconder ao rolar de volta.
 * Só opacidade e deslocamento: a seção escondida continua na árvore de acessibilidade e na ordem de tabulação.
 */
export function Revelar({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const anima = useSyncExternalStore<boolean | null>(semAssinatura, lerNoNavegador, lerNoServidor);
  const [entrou, setEntrou] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (anima !== true || elemento === null) return;
    const observador = new IntersectionObserver(
      (registros) => {
        if (registros.some((r) => r.isIntersecting)) {
          setEntrou(true);
          observador.disconnect();
        }
      },
      { threshold: LIMIAR },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [anima]);

  const surgiu = anima === false || entrou;
  const entrada: Entrada = { surgiu, animar: surgiu && anima === true };

  return (
    <div ref={ref} data-revelar={surgiu ? "visivel" : "escondido"} className={className}>
      {typeof children === "function" ? children(entrada) : children}
    </div>
  );
}
