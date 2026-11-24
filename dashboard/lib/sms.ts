import type { CelulaSmsEspera, Painel } from "./tipos";

export interface LinhaSms {
  /** A faixa de espera. */
  nome: string;
  sem: Pick<CelulaSmsEspera, "consultas" | "faltas" | "taxa">;
  com: Pick<CelulaSmsEspera, "consultas" | "faltas" | "taxa">;
}

/** Uma linha por faixa de espera (na ordem do contrato), com os dois grupos: sem SMS e com SMS. */
export function montarLinhasSms(painel: Painel): LinhaSms[] {
  return painel.ordem.faixa_espera.map((nome) => {
    const achar = (sms: 0 | 1) => {
      const c = painel.sms_espera.find((x) => x.faixa_espera === nome && x.recebeu_sms === sms);
      if (!c) throw new Error(`Falta ${nome} (recebeu_sms=${sms}) em sms_espera do painel.json.`);
      return { consultas: c.consultas, faltas: c.faltas, taxa: c.taxa };
    };
    return { nome, sem: achar(0), com: achar(1) };
  });
}
