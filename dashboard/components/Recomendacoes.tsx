import { formatarInteiro, formatarPct } from "@/lib/formato";
import { textoDasFaixas } from "@/lib/faixas";
import type { Painel } from "@/lib/tipos";

interface Props {
  painel: Painel;
  className?: string;
}

/**
 * O bloco "O que recomendamos": o agente de disparo de lembretes (Classifica, Dispara, Libera).
 * A taxa, as faixas e as consultas a mais vêm todas do painel; o texto não cita o canal do disparo.
 */
export function Recomendacoes({ painel, className = "" }: Props) {
  const { grupo_risco: grupo } = painel;
  const idadesDoGrupo = textoDasFaixas(grupo.faixas_etarias, "anos");
  const esperaDoGrupo = textoDasFaixas(grupo.faixas_espera, "dias");
  const consultasAMais = formatarInteiro(Math.round(grupo.faltas_acima_da_media));

  return (
    <section aria-labelledby="titulo-recomendacoes" className={className}>
      <h2 id="titulo-recomendacoes" className="text-grafico font-bold">
        O que recomendamos
      </h2>
      <p className="mt-1 text-corpo">Um agente de disparo de lembretes para reduzir as faltas</p>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded border border-grade bg-folha p-4">
          <h3 className="text-corpo font-bold">Classifica</h3>
          <p className="mt-1 text-corpo">
            No agendamento, calcula o risco de falta pela espera e pela idade. De {idadesDoGrupo}, com {esperaDoGrupo} de
            espera, a falta é de {formatarPct(grupo.taxa)}.
          </p>
        </div>
        <div className="rounded border border-grade bg-folha p-4">
          <h3 className="text-corpo font-bold">Dispara</h3>
          <p className="mt-1 text-corpo">
            Para quem tem risco alto, manda mais de um lembrete antes da consulta e pede confirmação.
          </p>
        </div>
        <div className="rounded border border-grade bg-folha p-4">
          <h3 className="text-corpo font-bold">Libera</h3>
          <p className="mt-1 text-corpo">
            Se o paciente cancela ou não confirma, o horário é oferecido a quem está na lista de espera.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-texto bg-texto p-4">
          <p className="text-numero font-semibold text-marca">{formatarPct(grupo.taxa)}</p>
          <p className="mt-1 text-corpo text-fundo">
            é a taxa de falta do grupo de maior risco, que soma {formatarPct(grupo.pct_consultas)} das consultas e{" "}
            {formatarPct(grupo.pct_faltas)} das faltas.
          </p>
        </div>
        <div className="rounded border border-grade bg-folha p-4">
          <p className="text-numero font-semibold">{consultasAMais}</p>
          <p className="mt-1 text-corpo">consultas a mais em seis semanas, se o grupo de risco faltasse como a média.</p>
        </div>
      </div>

      <p className="mt-6 max-w-5xl text-corpo">
        Na base, dentro da mesma faixa de espera, o disparo aparece junto com menos falta, o que ainda é associação. Por isso o agente começa em teste:
        metade do grupo de risco recebe o reforço, e a outra metade não.
      </p>
    </section>
  );
}
