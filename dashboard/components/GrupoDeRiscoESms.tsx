"use client";

import { CartoesDoGrupo } from "./CartoesDoGrupo";
import { FraseSms } from "./FraseSms";
import { GraficoSms } from "./GraficoSms";
import { MapaDeCalor } from "./MapaDeCalor";
import { Recomendacoes } from "./Recomendacoes";
import { carregarPainel } from "@/lib/dados";
import { montarLinhasSms } from "@/lib/sms";

const painel = carregarPainel();
const linhasSms = montarLinhasSms(painel);

/** Aba 2: a história de cima a baixo (o grupo de maior risco, o SMS e as recomendações), sempre com a base inteira. */
export function GrupoDeRiscoESms() {
  return (
    <div className="flex flex-col gap-6 px-8 pb-6 pt-1">
      <p className="text-rotulo text-texto-2">Esta aba mostra a base inteira; os filtros valem só na Visão geral.</p>

      <section aria-label="Grupo de maior risco" className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <MapaDeCalor painel={painel} />
        <CartoesDoGrupo painel={painel} />
      </section>

      <section aria-label="SMS">
        <GraficoSms linhas={linhasSms}>
          <FraseSms painel={painel} />
        </GraficoSms>
      </section>

      <Recomendacoes painel={painel} />
    </div>
  );
}
