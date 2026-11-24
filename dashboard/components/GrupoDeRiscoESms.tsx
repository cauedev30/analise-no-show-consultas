"use client";

import { CartoesDoGrupo } from "./CartoesDoGrupo";
import { FraseSms } from "./FraseSms";
import { GraficoSms } from "./GraficoSms";
import { MapaDeCalor } from "./MapaDeCalor";
import { Recomendacoes } from "./Recomendacoes";
import { Revelar } from "./Revelar";
import { carregarPainel } from "@/lib/dados";
import { montarLinhasSms } from "@/lib/sms";

const painel = carregarPainel();
const linhasSms = montarLinhasSms(painel);

/** Aba 2: a história de cima a baixo (o grupo de maior risco, o disparo de lembrete e as recomendações), sempre com a base inteira. */
export function GrupoDeRiscoESms() {
  return (
    <div className="flex flex-col gap-6 px-6 pb-6 pt-4 lg:px-8">
      <p className="text-rotulo text-texto-2">Esta aba mostra a base inteira; os filtros valem só na Visão geral.</p>

      {/* As três seções surgem ao entrar na tela (só o fade: na aba 2 nenhum gráfico cresce). */}
      <Revelar>
        <section aria-label="Grupo de maior risco" className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <MapaDeCalor painel={painel} className="cartao" />
          <CartoesDoGrupo painel={painel} />
        </section>
      </Revelar>

      <Revelar>
        <section aria-label="Disparo de lembrete" className="cartao">
          <GraficoSms linhas={linhasSms}>
            <FraseSms painel={painel} />
          </GraficoSms>
        </section>
      </Revelar>

      <Revelar>
        <Recomendacoes painel={painel} className="cartao" />
      </Revelar>
    </div>
  );
}
