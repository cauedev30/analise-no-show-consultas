"use client";

import { Cartao } from "./Cartao";
import { GraficoSms } from "./GraficoSms";
import { MapaDeCalor } from "./MapaDeCalor";
import { Recomendacoes } from "./Recomendacoes";
import { carregarPainel } from "@/lib/dados";
import { textoDasFaixas } from "@/lib/faixas";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import { montarLinhasSms } from "@/lib/sms";

const painel = carregarPainel();
const linhasSms = montarLinhasSms(painel);

// A faixa de espera que serve de exemplo na frase do SMS (a primeira da ordem do contrato).
const MESMO_DIA = painel.ordem.faixa_espera[0];

/** Aba 2: a história de cima a baixo (o grupo de maior risco, o SMS e as recomendações), sempre com a base inteira. */
export function GrupoDeRiscoESms() {
  const { grupo_risco: grupo, totais, sms_geral: sms } = painel;
  const idades = textoDasFaixas(grupo.faixas_etarias, "anos");
  const espera = textoDasFaixas(grupo.faixas_espera, "dias");
  const mesmoDiaSemSms = linhasSms.find((l) => l.nome === MESMO_DIA)?.sem.taxa ?? null;

  return (
    <div className="flex flex-col gap-6 px-8 pb-6 pt-1">
      <p className="text-rotulo text-texto-2">Esta aba mostra a base inteira; os filtros valem só na Visão geral.</p>

      <section aria-label="Grupo de maior risco" className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <MapaDeCalor painel={painel} />
        <div>
          <h3 className="text-grafico font-bold">
            Grupo de maior risco: {idades}, com {espera} de espera
          </h3>
          <div className="mt-4 divide-y divide-eixo">
            <Cartao
              empilhado
              rotulo="Consultas"
              valor={formatarInteiro(grupo.consultas)}
              complemento={`${formatarPct(grupo.pct_consultas)} das consultas`}
            />
            <Cartao
              empilhado
              rotulo="Taxa de falta"
              valor={formatarPct(grupo.taxa)}
              complemento={`contra ${formatarPct(totais.taxa)} na base inteira`}
            />
            <Cartao
              empilhado
              rotulo="Das faltas"
              valor={formatarPct(grupo.pct_faltas)}
              complemento={`${formatarInteiro(grupo.faltas)} de ${formatarInteiro(totais.faltas)} faltas`}
            />
          </div>
        </div>
      </section>

      <section aria-label="SMS">
        <GraficoSms linhas={linhasSms}>
          <p className="mt-1 max-w-5xl text-corpo">
            Na base inteira, quem recebeu SMS faltou mais: {formatarPct(sms.com.taxa)} contra {formatarPct(sms.sem.taxa)}.
            Mas nenhuma consulta do mesmo dia recebeu SMS, e é nelas que quase ninguém falta ({formatarPct(mesmoDiaSemSms)}).
            Dentro de cada faixa de espera, quem recebeu SMS faltou menos ou quase igual. É uma associação: não prova que o
            SMS reduz a falta.
          </p>
        </GraficoSms>
      </section>

      <Recomendacoes painel={painel} />
    </div>
  );
}
