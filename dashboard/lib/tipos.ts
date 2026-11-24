// Tipos do contrato do painel.json (gerado por scripts/gerar_dados_dashboard.py).
// A taxa e os pct_* vêm em %, sem arredondar; taxa é null quando não há consultas.

export type Dimensao = "faixaEtaria" | "diaSemana" | "bairro" | "faixaEspera";

/** Uma linha de `contagens`, com nomes. Os índices são posições nas listas de `ordem`. */
export interface Contagem {
  faixaEtaria: number;
  diaSemana: number;
  bairro: number;
  faixaEspera: number;
  consultas: number;
  faltas: number;
}

export interface Resumo {
  consultas: number;
  faltas: number;
  taxa: number | null;
}

/** Índices selecionados em cada dimensão. Lista vazia = sem filtro naquela dimensão. */
export type Filtros = Record<Dimensao, number[]>;

export interface BairroNoRanking {
  /** Índice do bairro na lista `ordem.bairro`. */
  bairro: number;
  consultas: number;
  faltas: number;
  taxa: number;
}

export interface Ordem {
  faixa_etaria: string[];
  faixa_espera: string[];
  dia_semana: string[];
  bairro: string[];
}

export interface CelulaIdadeEspera {
  faixa_etaria: string;
  faixa_espera: string;
  consultas: number;
  faltas: number;
  taxa: number | null;
}

export interface Recorte {
  faixas_etarias: string[];
  faixas_espera: string[];
  consultas: number;
  faltas: number;
  taxa: number;
  pct_consultas: number;
  pct_faltas: number;
  /** Faltas do recorte menos as que ele teria com a taxa geral (consultas × taxa geral ÷ 100), em consultas. */
  faltas_acima_da_media: number;
}

export interface GrupoSms {
  consultas: number;
  faltas: number;
  taxa: number | null;
}

export interface CelulaSmsEspera {
  faixa_espera: string;
  recebeu_sms: 0 | 1;
  consultas: number;
  faltas: number;
  taxa: number | null;
}

/** O JSON como está no arquivo. */
export interface PainelBruto {
  versao: number;
  fonte: { arquivo: string; sha256: string; linhas: number };
  ordem: Ordem;
  totais: { consultas: number; faltas: number; taxa: number };
  contagens: [number, number, number, number, number, number][];
  minimo_consultas_bairro: number;
  bairros_elegiveis: string[];
  idade_espera: CelulaIdadeEspera[];
  grupo_risco: Recorte;
  espera_longa: Recorte;
  sms_geral: { com: GrupoSms; sem: GrupoSms };
  sms_espera: CelulaSmsEspera[];
}

/** O painel pronto para a página: as `contagens` já viram objetos. */
export interface Painel extends Omit<PainelBruto, "contagens"> {
  contagens: Contagem[];
}
