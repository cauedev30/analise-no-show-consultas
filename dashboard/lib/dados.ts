import painelBruto from "@/public/dados/painel.json";
import type { Contagem, Painel, PainelBruto } from "./tipos";

// O JSON entra no código na hora do build: a página não faz requisição para ler os dados.
const bruto = painelBruto as unknown as PainelBruto;

export function carregarPainel(): Painel {
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
  return { ...bruto, contagens };
}

/** Os nomes de `bairros_elegiveis` viram posições na lista `ordem.bairro`. */
export function indicesDosBairrosElegiveis(painel: Painel): number[] {
  return painel.bairros_elegiveis.map((nome) => painel.ordem.bairro.indexOf(nome));
}
