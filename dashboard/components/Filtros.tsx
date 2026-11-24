"use client";

import { SeletorMultiplo } from "./SeletorMultiplo";
import type { Dimensao, Filtros as TipoFiltros, Ordem } from "@/lib/tipos";

interface Props {
  ordem: Ordem;
  filtros: TipoFiltros;
  onChange: (filtros: TipoFiltros) => void;
}

export const SEM_FILTROS: TipoFiltros = { faixaEtaria: [], diaSemana: [], bairro: [], faixaEspera: [] };

/** Os quatro filtros e o botão que limpa todos. */
export function Filtros({ ordem, filtros, onChange }: Props) {
  const definir = (dimensao: Dimensao) => (selecionados: number[]) => onChange({ ...filtros, [dimensao]: selecionados });
  const algumAtivo = Object.values(filtros).some((lista) => lista.length > 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SeletorMultiplo rotulo="Faixa de idade" opcoes={ordem.faixa_etaria} selecionados={filtros.faixaEtaria} onChange={definir("faixaEtaria")} />
      <SeletorMultiplo rotulo="Dia da semana" opcoes={ordem.dia_semana} selecionados={filtros.diaSemana} onChange={definir("diaSemana")} />
      <SeletorMultiplo
        rotulo="Bairro"
        opcoes={ordem.bairro} selecionados={filtros.bairro} onChange={definir("bairro")}
        comBusca
        textoBusca="Buscar bairro"
        textoSemResultado="Nenhum bairro encontrado"
      />
      <SeletorMultiplo rotulo="Dias de espera" opcoes={ordem.faixa_espera} selecionados={filtros.faixaEspera} onChange={definir("faixaEspera")} />
      <button
        type="button"
        onClick={() => onChange(SEM_FILTROS)}
        disabled={!algumAtivo}
        className="cursor-pointer px-3 py-2 text-corpo underline underline-offset-4 enabled:hover:bg-neutro disabled:cursor-default disabled:text-texto-2 disabled:no-underline"
      >
        Limpar filtros
      </button>
    </div>
  );
}
