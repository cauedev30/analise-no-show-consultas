"use client";

import { useState } from "react";
import { Abas, idDaAba, idDoPainel, type Aba } from "@/components/Abas";
import { SEM_FILTROS } from "@/components/Filtros";
import { Rodape } from "@/components/Rodape";
import { VisaoGeral } from "@/components/VisaoGeral";
import { carregarPainel } from "@/lib/dados";
import { formatarInteiro } from "@/lib/formato";

const ABAS: Aba[] = [
  { id: "visao-geral", rotulo: "Visão geral" },
  { id: "grupo-de-risco-e-sms", rotulo: "Grupo de risco e SMS" },
];

// Período das consultas da base tratada (conferido em dados/tratados/consultas_tratadas.csv: data_consulta
// de 2016-04-29 a 2016-06-08). O painel.json não traz as datas.
const PERIODO = "29/04/2016 a 08/06/2016";

const painel = carregarPainel();

export default function Home() {
  const [aba, setAba] = useState(ABAS[0].id);
  // Os filtros ficam aqui para não se perderem ao trocar de aba.
  const [filtros, setFiltros] = useState(SEM_FILTROS);

  return (
    <>
      <header className="px-8 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-x-8 border-b border-grade">
          <h1 className="pb-2 text-pagina font-bold">No-show em consultas: taxa de falta</h1>
          <div className="-mb-px">
            <Abas abas={ABAS} ativa={aba} onChange={setAba} />
          </div>
        </div>
        <p className="py-2 text-rotulo text-texto-2">
          Base: Medical Appointment No Shows (Kaggle), {formatarInteiro(painel.totais.consultas)} consultas de {PERIODO}
          , em {painel.ordem.bairro.length} bairros.
        </p>
      </header>

      <main className="flex flex-1 flex-col">
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
            {a.id === aba && a.id === "grupo-de-risco-e-sms" && (
              <div className="px-8 py-4">
                <h2 className="text-grafico font-bold">{a.rotulo}</h2>
              </div>
            )}
          </div>
        ))}
      </main>

      <Rodape />
    </>
  );
}
