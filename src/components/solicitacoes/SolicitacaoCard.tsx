import { useState } from "react";
import { ArrowRight, Clock, MessageSquareQuote } from "lucide-react";
import { AcaoDialog } from "@/components/solicitacoes/AcaoDialog";
import { StatusBadge } from "@/components/solicitacoes/StatusBadge";
import { StatusStepper } from "@/components/solicitacoes/StatusStepper";
import { formatarData, formatarHorario } from "@/lib/formatadores";
import {
  acoesDisponiveis,
  CLASSES_DO_TOM,
  descreverTransicao,
  descricaoDoEstado,
  ESTADOS,
  perspectivaDe,
  TRANSICOES,
  type Acao,
  type Usuario,
} from "@/lib/solicitacao-estado";
import { useToast } from "@/hooks/useToast";
import type { Solicitacao } from "@/services/solicitacoes";

interface SolicitacaoCardProps {
  solicitacao: Solicitacao;
  usuario: Usuario;
  /** Chamado depois de uma transição bem-sucedida, para a página recarregar a lista. */
  onMudou: () => void;
}

const BOTAO_DA_ACAO = {
  primaria: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20",
  perigo: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  neutra: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
} as const;

export function SolicitacaoCard({ solicitacao, usuario, onMudou }: SolicitacaoCardProps) {
  const { avisar } = useToast();
  const [acaoAberta, setAcaoAberta] = useState<Acao | null>(null);

  const { turno, status } = solicitacao;
  const acoes = acoesDisponiveis(solicitacao, usuario);
  const perspectiva = perspectivaDe(solicitacao, usuario);
  const precisaDeMim = acoes.some((acao) => acao !== "cancelar");
  const rotuloDoMotivo = status === "rejeitada" ? "Motivo da rejeição" : "Motivo da recusa";

  const concluida = (acao: Acao, estadoAnterior: Solicitacao["status"], atualizada: Solicitacao) => {
    setAcaoAberta(null);
    avisar({
      tipo: "sucesso",
      titulo: TRANSICOES[acao].sucesso,
      detalhe: `${descreverTransicao(acao, estadoAnterior)}${
        atualizada.status === "aprovada" ? ". O turno mudou de dono." : ""
      }`,
    });
    onMudou();
  };

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-shadow ${
        precisaDeMim ? "border-blue-300 ring-4 ring-blue-500/10" : "border-slate-100"
      }`}
    >
      <div className={`h-1 ${CLASSES_DO_TOM[ESTADOS[status].tom].faixa}`} aria-hidden="true" />

      <div className="space-y-4 p-5 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-bold tracking-tight text-slate-900">{formatarData(turno.data)}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatarHorario(turno.horaInicio, turno.horaFim)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            {precisaDeMim && (
              <span className="text-[11px] font-semibold text-blue-600">
                {perspectiva === "supervisor" ? "Precisa da sua decisão" : "Precisa da sua resposta"}
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="font-semibold text-slate-900">{solicitacao.solicitanteNome ?? "Quem pediu"}</span>
          <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{solicitacao.destinatarioNome ?? "Colega"}</span>
          <span className="text-xs text-slate-400">assume o turno</span>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{descricaoDoEstado(solicitacao, usuario)}</p>

        <StatusStepper solicitacao={solicitacao} />

        {solicitacao.motivo && (status === "rejeitada" || status === "recusada") && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50 p-3.5">
            <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="text-sm">
              <p className="text-xs font-semibold text-slate-500">{rotuloDoMotivo}</p>
              <p className="mt-0.5 text-slate-800">{solicitacao.motivo}</p>
            </div>
          </div>
        )}

        {acoes.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {acoes.map((acao) => {
              const transicao = TRANSICOES[acao];
              const Icone = transicao.icone;

              return (
                <button
                  key={acao}
                  type="button"
                  onClick={() => setAcaoAberta(acao)}
                  title={`${transicao.rotulo}: ${ESTADOS[status].rotulo} → ${ESTADOS[transicao.para].rotulo}`}
                  className={`flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all active:scale-[0.99] ${BOTAO_DA_ACAO[transicao.variante]}`}
                >
                  <Icone className="size-4" aria-hidden="true" />
                  {transicao.rotulo}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {acaoAberta && (
        <AcaoDialog
          solicitacao={solicitacao}
          acao={acaoAberta}
          onClose={() => setAcaoAberta(null)}
          onDesatualizada={(mensagem) => {
            // O cartão pode sair da lista com a atualização, então o aviso vai para o toast.
            avisar({ tipo: "erro", titulo: "Esta solicitação já mudou de estado", detalhe: mensagem });
            onMudou();
          }}
          onConcluida={(atualizada) => concluida(acaoAberta, status, atualizada)}
        />
      )}
    </article>
  );
}
