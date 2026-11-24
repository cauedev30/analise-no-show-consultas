import type { CelulaIdadeEspera, Painel } from "./tipos";

// A rampa do mapa de calor (a do notebook 03), do claro ao escuro. Os mesmos valores dos tokens
// --color-rampa-1..7 de app/globals.css (o teste confere); aqui ela existe em hex porque a cor de cada
// célula é calculada em JavaScript.
export const RAMPA = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#104281"] as const;

/** A cor de texto mais escura da paleta (o token --color-texto). */
export const TEXTO_ESCURO = "#16213a";
export const TEXTO_CLARO = "#ffffff";
/**
 * O texto escuro dentro das células do mapa é preto puro, não o token --color-texto: com #0b0b0b (o token antigo) o pior caso da
 * rampa dá 4,44:1 (abaixo do mínimo de 4,5:1 da WCAG); com #000000 passa. Vale só para o mapa.
 */
export const TEXTO_ESCURO_DO_MAPA = "#000000";

/**
 * Topo da escala de cor, em %. É o mesmo do notebook 03 (vmin=0, vmax=45): um parâmetro de desenho,
 * não um dado. Taxa acima disso usa a cor mais escura.
 */
export const TETO_DA_ESCALA = 45;

function canais(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

function paraHex(c: number[]): string {
  return "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** A cor da célula: interpola entre as cores da rampa, de 0% (primeira) ao teto da escala (última). */
export function corDaEscala(taxa: number, teto: number = TETO_DA_ESCALA): string {
  const t = Math.min(Math.max(taxa / teto, 0), 1) * (RAMPA.length - 1);
  const i = Math.min(Math.floor(t), RAMPA.length - 2);
  const frac = t - i;
  const a = canais(RAMPA[i]);
  const b = canais(RAMPA[i + 1]);
  return paraHex(a.map((v, k) => v + (b[k] - v) * frac));
}

function luminancia(hex: string): number {
  const [r, g, b] = canais(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contraste entre duas cores hex, de 1 a 21 (a razão de luminância relativa da WCAG). */
export function contraste(a: string, b: string): number {
  const [maior, menor] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (maior + 0.05) / (menor + 0.05);
}

/** Branco ou preto: o que tiver mais contraste com o fundo da célula do mapa. */
export function corDoTexto(fundo: string): string {
  return contraste(fundo, TEXTO_ESCURO_DO_MAPA) >= contraste(fundo, TEXTO_CLARO) ? TEXTO_ESCURO_DO_MAPA : TEXTO_CLARO;
}

export interface CelulaDoMapa extends CelulaIdadeEspera {
  /** A célula está no grupo de maior risco (lido de `grupo_risco` do painel). */
  noGrupo: boolean;
}

export interface Mapa {
  /** Faixas de idade (linhas) e de espera (colunas), na ordem do contrato. */
  linhas: string[];
  colunas: string[];
  celulas: CelulaDoMapa[][];
}

/** Monta a grade idade x espera a partir do painel e marca as células do grupo de maior risco. */
export function montarMapa(painel: Painel): Mapa {
  const linhas = painel.ordem.faixa_etaria;
  const colunas = painel.ordem.faixa_espera;
  const grupo = painel.grupo_risco;
  const celulas = linhas.map((idade) =>
    colunas.map((espera) => {
      const c = painel.idade_espera.find((x) => x.faixa_etaria === idade && x.faixa_espera === espera);
      if (!c) throw new Error(`Falta a célula ${idade} x ${espera} em idade_espera do painel.json.`);
      return { ...c, noGrupo: grupo.faixas_etarias.includes(idade) && grupo.faixas_espera.includes(espera) };
    }),
  );
  return { linhas, colunas, celulas };
}

/** Os lados da célula que ficam na borda do grupo (vizinho fora do grupo ou borda da tabela): onde vai o contorno. */
export function ladosDoContorno(mapa: Mapa, r: number, c: number) {
  const dentro = (rr: number, cc: number) => mapa.celulas[rr]?.[cc]?.noGrupo === true;
  if (!dentro(r, c)) return { topo: false, direita: false, baixo: false, esquerda: false };
  return {
    topo: !dentro(r - 1, c),
    direita: !dentro(r, c + 1),
    baixo: !dentro(r + 1, c),
    esquerda: !dentro(r, c - 1),
  };
}
