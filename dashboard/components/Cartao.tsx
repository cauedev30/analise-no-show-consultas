interface Props {
  rotulo: string;
  valor: string;
  /** Uma linha menor, abaixo do rótulo (por exemplo, a comparação com a base inteira). */
  complemento?: string;
  /** O KPI principal: bloco cheio no azul Klein (o único acento do painel) com o número em branco. */
  destaque?: boolean;
}

/** Um KPI do painel: número grande e rótulo embaixo, dentro de uma caixa. */
export function Cartao({ rotulo, valor, complemento, destaque = false }: Props) {
  const secundario = destaque ? "text-fundo/80" : "text-texto-2";
  return (
    <div className={"border px-4 py-3 " + (destaque ? "border-azul bg-azul" : "border-grade bg-fundo")}>
      <p className={"text-2xl font-bold sm:text-numero " + (destaque ? "text-fundo" : "text-texto")}>{valor}</p>
      <p className={"mt-1 text-rotulo " + secundario}>{rotulo}</p>
      {complemento && <p className={"text-rotulo " + secundario}>{complemento}</p>}
    </div>
  );
}
