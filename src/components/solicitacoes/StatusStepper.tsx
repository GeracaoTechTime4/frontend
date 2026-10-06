import { Ban, Check, ChevronRight, Minus, X } from "lucide-react";
import { passosDaSolicitacao, type SituacaoDoPasso } from "@/lib/solicitacao-estado";
import type { Solicitacao } from "@/services/solicitacoes";

const ESTILO_DO_PASSO: Record<SituacaoDoPasso, { circulo: string; titulo: string }> = {
  concluido: { circulo: "bg-emerald-500 text-white", titulo: "text-slate-900" },
  atual: { circulo: "bg-blue-600 text-white ring-4 ring-blue-100", titulo: "text-blue-700" },
  futuro: { circulo: "border border-slate-300 bg-white text-slate-300", titulo: "text-slate-400" },
  falhou: { circulo: "bg-red-500 text-white", titulo: "text-red-700" },
  interrompido: { circulo: "bg-slate-400 text-white", titulo: "text-slate-600" },
  dispensado: { circulo: "border border-dashed border-slate-300 bg-white text-slate-300", titulo: "text-slate-400" },
};

function IconeDoPasso({ situacao, numero }: { situacao: SituacaoDoPasso; numero: number }) {
  switch (situacao) {
    case "concluido":
      return <Check className="size-3.5" aria-hidden="true" />;
    case "falhou":
      return <X className="size-3.5" aria-hidden="true" />;
    case "interrompido":
      return <Ban className="size-3.5" aria-hidden="true" />;
    case "dispensado":
      return <Minus className="size-3.5" aria-hidden="true" />;
    default:
      return <span className="text-[11px] font-bold">{numero}</span>;
  }
}

/** Os três momentos da troca (pedido, resposta do colega, decisão) e onde ela está. */
export function StatusStepper({ solicitacao }: { solicitacao: Solicitacao }) {
  const passos = passosDaSolicitacao(solicitacao);

  return (
    <ol className="grid gap-3 sm:grid-cols-3 sm:gap-1" aria-label="Andamento da troca">
      {passos.map((passo, indice) => {
        const estilo = ESTILO_DO_PASSO[passo.situacao];

        return (
          <li
            key={passo.titulo}
            className="flex items-start gap-2.5"
            aria-current={passo.situacao === "atual" ? "step" : undefined}
          >
            <span
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${estilo.circulo}`}
            >
              <IconeDoPasso situacao={passo.situacao} numero={indice + 1} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold leading-tight ${estilo.titulo}`}>{passo.titulo}</p>
              <p className="mt-0.5 text-xs leading-snug text-slate-500">{passo.detalhe}</p>
            </div>
            {indice < passos.length - 1 && (
              <ChevronRight className="mt-1 hidden size-4 shrink-0 text-slate-300 sm:block" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
