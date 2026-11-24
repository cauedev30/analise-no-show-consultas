const REPOSITORIO = "https://github.com/cauedev30/analise-no-show-consultas";

export function Rodape() {
  return (
    <footer className="border-t border-grade px-8 py-3 text-rotulo text-texto-2">
      <p>
        Dados: Medical Appointment No Shows (Kaggle, Joni Hoppen), licença CC BY-NC-SA 4.0. Números calculados em
        Python a partir da base tratada.
      </p>
      <p>
        Código e documentação:{" "}
        <a href={REPOSITORIO} className="text-texto underline underline-offset-2">
          github.com/cauedev30/analise-no-show-consultas
        </a>
      </p>
    </footer>
  );
}
