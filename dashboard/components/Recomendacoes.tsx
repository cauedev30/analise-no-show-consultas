import { formatarPct } from "@/lib/formato";
import { textoDasFaixas } from "@/lib/faixas";
import type { Painel } from "@/lib/tipos";

interface Props {
  painel: Painel;
  className?: string;
}

/** O bloco "O que recomendamos": os números que sustentam cada recomendação vêm todos do painel. */
export function Recomendacoes({ painel, className = "" }: Props) {
  const { grupo_risco: grupo, espera_longa: longa } = painel;
  const idadesDoGrupo = textoDasFaixas(grupo.faixas_etarias, "anos");
  const esperaDoGrupo = textoDasFaixas(grupo.faixas_espera, "dias");
  const esperaLonga = textoDasFaixas(longa.faixas_espera, "dias");

  return (
    <section aria-labelledby="titulo-recomendacoes" className={className}>
      <h2 id="titulo-recomendacoes" className="text-grafico font-bold">
        O que recomendamos
      </h2>

      <div className="mt-3 grid gap-y-6 md:grid-cols-2 md:divide-x md:divide-eixo">
        <div className="md:pr-8">
          <p className="text-numero font-bold">{formatarPct(grupo.taxa)}</p>
          <h3 className="mt-1 text-corpo font-bold">Lembrete reforçado para o grupo de maior risco</h3>
          <p className="mt-1 text-corpo">
            Quem tem {idadesDoGrupo} e espera {esperaDoGrupo} falta em {formatarPct(grupo.taxa)} das consultas. Reforçar
            o lembrete só para esse grupo (por exemplo, mais de um contato antes da consulta): ele soma{" "}
            {formatarPct(grupo.pct_consultas)} das consultas e {formatarPct(grupo.pct_faltas)} das faltas.
          </p>
        </div>
        <div className="md:pl-8">
          <p className="text-numero font-bold">{formatarPct(longa.taxa)}</p>
          <h3 className="mt-1 text-corpo font-bold">Overbooking controlado pelo tempo de espera</h3>
          <p className="mt-1 text-corpo">
            Consultas marcadas com {esperaLonga} de antecedência faltam em {formatarPct(longa.taxa)}: são{" "}
            {formatarPct(longa.pct_consultas)} das consultas e {formatarPct(longa.pct_faltas)} das faltas. Marcar um
            pouco acima da capacidade só nessas consultas para aproveitar os horários vagos. A base não tem o horário
            da consulta, por isso o critério é a espera.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-grade pt-4 text-rotulo text-texto-2">
        <p>
          <span className="font-bold text-texto">Ideia de aplicação (não construída):</span> uma calculadora de risco
          para a recepção. Ela recebe a idade e os dias de espera e mostra a taxa de falta do grupo e a ação recomendada.
        </p>
        <p>
          <span className="font-bold text-texto">Limites:</span> a análise é descritiva (mostra associação, não causa).
          Os dados indicam rede pública (Vitória, ES) e entram como aproximação para a clínica. Antes de aplicar, a
          clínica deve conferir com os próprios dados, e o overbooking precisa de um limite para não gerar fila.
        </p>
      </div>
    </section>
  );
}
