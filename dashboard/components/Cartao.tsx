interface Props {
  rotulo: string;
  valor: string;
}

/** Um número grande com o rótulo embaixo. Sem caixa e sem sombra: o fio vertical entre os cartões vem do pai. */
export function Cartao({ rotulo, valor }: Props) {
  return (
    <div className="px-3 sm:px-5 first:pl-0 last:pr-0">
      <p className="text-3xl font-bold sm:text-numero">{valor}</p>
      <p className="mt-1 text-rotulo text-texto-2">{rotulo}</p>
    </div>
  );
}
