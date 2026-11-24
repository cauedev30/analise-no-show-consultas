const INTEIRO = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const UMA_CASA = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 110521 vira "110.521". */
export function formatarInteiro(n: number): string {
  return INTEIRO.format(n);
}

/** 20.18 vira "20,2%"; sem taxa (null) vira "—". */
export function formatarPct(taxa: number | null): string {
  return taxa === null ? "—" : `${UMA_CASA.format(taxa)}%`;
}
