import { Cartao } from "./Cartao";
import { textoDasFaixas } from "@/lib/faixas";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import type { Painel } from "@/lib/tipos";

/** O título e os três cartões do grupo de maior risco; todos os números vêm do painel. */
export function CartoesDoGrupo({ painel }: { painel: Painel }) {
  const { grupo_risco: grupo, totais } = painel;
  const idades = textoDasFaixas(grupo.faixas_etarias, "anos");
  const espera = textoDasFaixas(grupo.faixas_espera, "dias");

  return (
    <div>
      <h2 className="text-grafico font-bold">
        Grupo de maior risco: {idades}, com {espera} de espera
      </h2>
      <div className="mt-4 divide-y divide-eixo">
        <Cartao
          rotulo="Consultas"
          valor={formatarInteiro(grupo.consultas)}
          complemento={`${formatarPct(grupo.pct_consultas)} das consultas`}
        />
        <Cartao
          rotulo="Taxa de falta"
          valor={formatarPct(grupo.taxa)}
          complemento={`contra ${formatarPct(totais.taxa)} na base inteira`}
        />
        <Cartao
          rotulo="Das faltas"
          valor={formatarPct(grupo.pct_faltas)}
          complemento={`${formatarInteiro(grupo.faltas)} de ${formatarInteiro(totais.faltas)} faltas`}
        />
      </div>
    </div>
  );
}
