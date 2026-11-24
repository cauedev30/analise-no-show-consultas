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

  return (
    <>
      {/* Barra de topo escura, como num painel de BI: título à esquerda, as duas páginas em botões à direita. */}
      <header className="bg-texto px-6 py-4 text-fundo lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <div>
            <h1 className="text-pagina font-bold">
              No-show em consultas: <span className="text-marca">taxa de falta</span>
            </h1>
            <p className="mt-1 text-rotulo text-fundo/75">
              Base: Medical Appointment No Shows (Kaggle), {formatarInteiro(painel.totais.consultas)} consultas de{" "}
              {PERIODO}, em {painel.ordem.bairro.length} bairros.
            </p>
          </div>
          <Abas abas={ABAS} ativa={aba} onChange={setAba} />
        </div>
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
            {a.id === aba && a.id === "grupo-de-risco-e-sms" && <GrupoDeRiscoESms />}
          </div>
        ))}
      </main>
    </>
  );
}
