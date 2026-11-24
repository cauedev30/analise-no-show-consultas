import { formatarPct } from "@/lib/formato";
import { montarLinhasSms } from "@/lib/sms";
import type { Painel } from "@/lib/tipos";

/** A faixa de espera que serve de exemplo na frase (a primeira da ordem do contrato). */
function mesmoDia(painel: Painel): string {
  return painel.ordem.faixa_espera[0];
}

/** A frase da comparação crua do disparo de lembrete; as taxas vêm do painel. */
export function FraseSms({ painel }: { painel: Painel }) {
  const sms = painel.sms_geral;
  const mesmoDiaSemSms = montarLinhasSms(painel).find((l) => l.nome === mesmoDia(painel))?.sem.taxa ?? null;

  return (
    <p className="mt-1 max-w-5xl text-corpo">
      Na base inteira, quem recebeu o disparo faltou mais: {formatarPct(sms.com.taxa)} contra {formatarPct(sms.sem.taxa)}.
      Mas o disparo só vai para quem espera 3 dias ou mais, e no mesmo dia quase ninguém falta (
      {formatarPct(mesmoDiaSemSms)}). Dentro de cada faixa de espera, quem recebeu o disparo faltou menos ou quase
      igual. É uma associação: não prova que o disparo reduz a falta. Na base, o disparo registrado é o SMS.
    </p>
  );
}
