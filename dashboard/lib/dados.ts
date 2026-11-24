import painelBruto from "@/public/dados/painel.json";
import type { Contagem, Painel, PainelBruto } from "./tipos";

// O JSON entra no código na hora do build: a página não faz requisição para ler os dados.
const bruto = painelBruto as unknown as PainelBruto;

// A conversão roda uma vez, na carga do módulo: carregarPainel() devolve sempre o mesmo objeto.
const contagens: Contagem[] = bruto.contagens.map(
  ([faixaEtaria, diaSemana, bairro, faixaEspera, consultas, faltas]) => ({
    faixaEtaria,
    diaSemana,
    bairro,
    faixaEspera,
    consultas,
    faltas,
  }),
);
const painel: Painel = { ...bruto, contagens };

export function carregarPainel(): Painel {
  return painel;
}

/** Os nomes de `bairros_elegiveis` viram posições na lista `ordem.bairro`. */
export function indicesDosBairrosElegiveis(painel: Painel): number[] {
  return painel.bairros_elegiveis.map((nome) => {
    const indice = painel.ordem.bairro.indexOf(nome);
    if (indice === -1) {
      throw new Error(`Bairro elegível "${nome}" não existe na lista ordem.bairro do painel.json.`);
    }
    return indice;
  });
}
