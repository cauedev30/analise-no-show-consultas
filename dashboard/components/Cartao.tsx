interface Props {
  rotulo: string;
  valor: string;
  /** Uma linha menor, abaixo do rótulo (por exemplo, a comparação com a base inteira). */
  complemento?: string;
  /** Os cartões estão um embaixo do outro (o fio entre eles é horizontal e vem do pai). */
  empilhado?: boolean;
}

/** Um número grande com o rótulo embaixo. Sem caixa e sem sombra: o fio entre os cartões vem do pai. */
export function Cartao({ rotulo, valor, complemento, empilhado = false }: Props) {
  return (
    <div className={empilhado ? "py-3 first:pt-0 last:pb-0" : "px-3 sm:px-5 first:pl-0 last:pr-0"}>
      <p className="text-3xl font-bold sm:text-numero">{valor}</p>
      <p className="mt-1 text-rotulo text-texto-2">{rotulo}</p>
      {complemento && <p className="text-rotulo text-texto-2">{complemento}</p>}
    </div>
  );
}
