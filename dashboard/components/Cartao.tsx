interface Props {
  rotulo: string;
  valor: string;
  /** Uma linha menor, abaixo do rótulo (por exemplo, a comparação com a base inteira). */
  complemento?: string;
  /** O KPI principal: caixa escura (tinta do slide) com o número no amarelo do marca-texto. */
  destaque?: boolean;
}

/** Um KPI do painel: número grande e rótulo embaixo, dentro de uma caixa. */
export function Cartao({ rotulo, valor, complemento, destaque = false }: Props) {
  const secundario = destaque ? "text-fundo/80" : "text-texto-2";
  return (
    <div className={"rounded-lg border px-4 py-3 " + (destaque ? "border-texto bg-texto" : "border-grade bg-fundo")}>
      <p className={"text-3xl font-bold sm:text-numero " + (destaque ? "text-marca" : "text-texto")}>{valor}</p>
      <p className={"mt-1 text-rotulo " + secundario}>{rotulo}</p>
      {complemento && <p className={"text-rotulo " + secundario}>{complemento}</p>}
    </div>
  );
}
