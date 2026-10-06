import { ArrowRight, ChevronDown, Info } from "lucide-react";
import { StatusBadge } from "@/components/solicitacoes/StatusBadge";
import { ESTADOS, ORDEM_DOS_ESTADOS, TRANSICOES, type Acao } from "@/lib/solicitacao-estado";

const ACOES_EM_ORDEM: Acao[] = ["aceitar", "recusar", "aprovar", "rejeitar", "cancelar"];

const SIGNIFICADO: Record<(typeof ORDEM_DOS_ESTADOS)[number], string> = {
  pendente: "O colega indicado ainda não respondeu.",
  aguardando_aprovacao: "O colega aceitou; o supervisor decide.",
  aprovada: "Troca autorizada: o turno mudou de dono.",
  rejeitada: "O supervisor não autorizou; o turno fica com quem pediu.",
  recusada: "O colega não aceitou; o turno fica com quem pediu.",
  cancelada: "Quem pediu desistiu antes do desfecho.",
  expirada: "O turno começou sem a troca ser concluída.",
};

/** Explica os estados e quem pode mudar cada um. Gerado a partir do mesmo mapa que governa as ações. */
export function FluxoLegenda() {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-700 select-none [&::-webkit-details-marker]:hidden">
        <Info className="size-4 text-blue-600" aria-hidden="true" />
        Como funciona uma troca
        <ChevronDown className="ml-auto size-4 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="space-y-5 border-t border-slate-100 px-4 py-4">
        <p className="text-sm leading-relaxed text-slate-600">
          A troca é um acordo em duas etapas: primeiro o colega indicado aceita ou recusa; só depois do aceite o
          supervisor autoriza ou não. O turno só muda de dono quando o supervisor aprova.
        </p>

        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Estados</h3>
          <ul className="space-y-2">
            {ORDEM_DOS_ESTADOS.map((status) => (
              <li key={status} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StatusBadge status={status} className="min-w-[10.5rem] justify-start" />
                <span className="text-sm text-slate-600">{SIGNIFICADO[status]}</span>
                {ESTADOS[status].final && <span className="text-[11px] font-medium text-slate-400">final</span>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">Quem faz o quê</h3>
          <ul className="space-y-2.5">
            {ACOES_EM_ORDEM.map((acao) => {
              const transicao = TRANSICOES[acao];

              return (
                <li key={acao} className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{transicao.rotulo}</span>
                  <span className="text-slate-400"> — {transicao.quem}</span>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {transicao.de.map((origem) => (
                      <StatusBadge key={origem} status={origem} />
                    ))}
                    <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
                    <StatusBadge status={transicao.para} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            O sistema também expira sozinho os pedidos em aberto quando o turno começa.
          </p>
        </div>
      </div>
    </details>
  );
}
