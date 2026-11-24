"use client";

import { useState } from "react";
import { Abas, idDaAba, idDoPainel, type Aba } from "@/components/Abas";
import { SEM_FILTROS } from "@/components/Filtros";
import { GrupoDeRiscoESms } from "@/components/GrupoDeRiscoESms";
import { VisaoGeral } from "@/components/VisaoGeral";
import { carregarPainel } from "@/lib/dados";
import { formatarInteiro } from "@/lib/formato";

const ABAS: Aba[] = [
  { id: "visao-geral", rotulo: "Visão geral" },
  { id: "grupo-de-risco-e-sms", rotulo: "Grupo de risco e disparo" },
];

// Período das consultas da base tratada (conferido em dados/tratados/consultas_tratadas.csv: data_consulta
// de 2016-04-29 a 2016-06-08). O painel.json não traz as datas.
const PERIODO = "29/04/2016 a 08/06/2016";

const painel = carregarPainel();

export default function Home() {
  const [aba, setAba] = useState(ABAS[0].id);
  // Os filtros ficam aqui para não se perderem ao trocar de aba.
  const [filtros, setFiltros] = useState(SEM_FILTROS);

  const ativa = ABAS.find((a) => a.id === aba) ?? ABAS[0];

  return (
    <div className="md:flex">
      <aside className="bg-texto pb-3 text-white md:sticky md:top-0 md:h-dvh md:w-64 md:shrink-0 md:pb-6">
        <h1 className="px-6 pb-4 pt-5 text-grafico font-bold md:pb-6 md:pt-6">
          No-show em consultas: <span className="text-marca md:block">taxa de falta</span>
        </h1>
        <Abas abas={ABAS} ativa={aba} onChange={setAba} />
      </aside>

      <main className="min-w-0 flex-1">
        <div className="px-6 pt-6 lg:px-8">
          <h2 className="text-pagina font-bold">{ativa.rotulo}</h2>
          <p className="mt-1 text-rotulo text-texto-2">
            Base: Medical Appointment No Shows (Kaggle), {formatarInteiro(painel.totais.consultas)} consultas de {PERIODO}
            , em {painel.ordem.bairro.length} bairros.
          </p>
        </div>

        {ABAS.map((a) => (
          <div
            key={a.id}
            role="tabpanel"
            tabIndex={0}
            id={idDoPainel(a.id)}
            aria-labelledby={idDaAba(a.id)}
            className={a.id === aba ? "flex flex-1 flex-col" : "hidden"}
          >
            {a.id === aba && a.id === "visao-geral" && <VisaoGeral filtros={filtros} onChange={setFiltros} />}
            {a.id === aba && a.id === "grupo-de-risco-e-sms" && <GrupoDeRiscoESms />}
          </div>
        ))}
      </main>
    </div>
  );
}
