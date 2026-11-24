import { corDaEscala, corDoTexto, ladosDoContorno, montarMapa, TETO_DA_ESCALA } from "@/lib/mapaDeCalor";
import { formatarInteiro, formatarPct } from "@/lib/formato";
import type { Painel } from "@/lib/tipos";

// Os marcadores da legenda (parâmetros de desenho da escala, não dados): 4 marcas entre 0 e o teto.
const MARCAS_DA_LEGENDA = [0, 1, 2, 3].map((i) => (TETO_DA_ESCALA / 3) * i);

const ID_DO_TITULO = "titulo-mapa-de-calor";
const ESPESSURA_DO_CONTORNO = "3px";
const LINHA_ENTRE_CELULAS = "2px solid var(--color-fundo)";

interface Props {
  painel: Painel;
  className?: string;
}

/**
 * Mapa de calor idade x espera: uma tabela com a taxa de falta em cada célula (em destaque) e o número de
 * consultas embaixo. As células do grupo de maior risco (lidas do painel) ficam dentro de um contorno só.
 */
export function MapaDeCalor({ painel, className = "" }: Props) {
  const mapa = montarMapa(painel);
  const gradiente = `linear-gradient(to right, ${[1, 2, 3, 4, 5, 6, 7].map((i) => `var(--color-rampa-${i})`).join(", ")})`;

  return (
    <figure className={className}>
      <figcaption>
        <h3 id={ID_DO_TITULO} className="text-grafico font-bold">
          Taxa de falta por idade e espera
        </h3>
        <p className="text-rotulo text-texto-2">Cada célula mostra a taxa de falta e, embaixo, o número de consultas.</p>
      </figcaption>

      <table aria-labelledby={ID_DO_TITULO} className="mt-3 w-full table-fixed border-collapse text-center">
        <colgroup>
          <col className="w-24" />
        </colgroup>
        <colgroup span={mapa.colunas.length} />
        <thead>
          <tr>
            <th scope="col" rowSpan={2} className="pb-1 pr-3 text-right align-bottom text-rotulo font-normal text-texto-2">
              Idade
            </th>
            <th colSpan={mapa.colunas.length} scope="colgroup" className="pb-1 text-rotulo font-normal text-texto-2">
              Espera entre o agendamento e a consulta
            </th>
          </tr>
          <tr>
            {mapa.colunas.map((coluna) => (
              <th key={coluna} scope="col" className="pb-1 text-rotulo font-bold">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mapa.linhas.map((linha, r) => (
            <tr key={linha}>
              <th scope="row" className="pr-3 text-right text-rotulo font-bold">
                {linha}
              </th>
              {mapa.celulas[r].map((celula, c) => {
                const semConsultas = celula.consultas === 0 || celula.taxa === null;
                const fundo = semConsultas ? undefined : corDaEscala(celula.taxa as number);
                const lados = ladosDoContorno(mapa, r, c);
                const borda = (lado: boolean) => (lado ? `${ESPESSURA_DO_CONTORNO} solid var(--color-texto)` : LINHA_ENTRE_CELULAS);
                return (
                  <td
                    key={celula.faixa_espera}
                    className={`h-14 px-1 ${semConsultas ? "bg-neutro text-texto-2" : ""}`}
                    style={{
                      backgroundColor: fundo,
                      color: fundo ? corDoTexto(fundo) : undefined,
                      borderTop: borda(lados.topo),
                      borderRight: borda(lados.direita),
                      borderBottom: borda(lados.baixo),
                      borderLeft: borda(lados.esquerda),
                    }}
                  >
                    <span className="block text-corpo font-bold leading-tight">{formatarPct(celula.taxa)}</span>
                    <span className="block text-rotulo leading-tight">
                      {formatarInteiro(celula.consultas)}
                      <span className="sr-only"> consultas</span>
                    </span>
                    {celula.noGrupo && <span className="sr-only"> (grupo de maior risco)</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-rotulo text-texto-2">
        <div className="flex items-center gap-3">
          <span>Taxa de falta</span>
          <div>
            <div className="h-3 w-56" style={{ background: gradiente }} aria-hidden="true" />
            <div className="mt-0.5 flex w-56 justify-between" aria-hidden="true">
              {MARCAS_DA_LEGENDA.map((m) => (
                <span key={m}>{Math.round(m)}%</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block size-4 border-[3px] border-texto"
            aria-hidden="true"
          />
          Contorno: grupo de maior risco
        </div>
      </div>
    </figure>
  );
}
