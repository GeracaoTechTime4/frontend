import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { StatusBadge } from "@/components/solicitacoes/StatusBadge";
import { formatarData, formatarHorario } from "@/lib/formatadores";
import { TRANSICOES, type Acao } from "@/lib/solicitacao-estado";
import { ApiError, mensagemDeErro } from "@/services/api";
import { executarAcao } from "@/services/acoes-solicitacao";
import type { Solicitacao } from "@/services/solicitacoes";

interface AcaoDialogProps {
  solicitacao: Solicitacao;
  acao: Acao;
  onClose: () => void;
  /** Chamado com a solicitação já no novo estado. */
  onConcluida: (atualizada: Solicitacao) => void;
  /** O estado da solicitação mudou por outro caminho (409): a lista precisa ser recarregada. */
  onDesatualizada?: (mensagem: string) => void;
}

const BOTAO_CONFIRMAR = {
  primaria: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20",
  perigo: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20",
  neutra: "bg-slate-800 text-white hover:bg-slate-900",
} as const;

/** Confirmação de uma transição: mostra de qual estado para qual a solicitação vai. */
export function AcaoDialog({ solicitacao, acao, onClose, onConcluida, onDesatualizada }: AcaoDialogProps) {
  const transicao = TRANSICOES[acao];
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const motivoObrigatorio = transicao.motivo === "obrigatorio";
  const pedeMotivo = transicao.motivo !== null;

  const confirmar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro(null);

    if (motivoObrigatorio && !motivo.trim()) {
      setErro("Informe o motivo.");
      return;
    }

    setEnviando(true);
    try {
      const atualizada = await executarAcao(acao, solicitacao.id, motivo.trim() || undefined);
      onConcluida(atualizada);
    } catch (error) {
      const mensagem = mensagemDeErro(error);
      const desatualizada = error instanceof ApiError && error.status === 409;
      setErro(desatualizada ? `${mensagem}. A lista foi atualizada.` : mensagem);
      if (desatualizada) onDesatualizada?.(mensagem);
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={transicao.titulo} onClose={enviando ? () => undefined : onClose}>
      <form onSubmit={confirmar} className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {formatarData(solicitacao.turno.data)} · {formatarHorario(solicitacao.turno.horaInicio, solicitacao.turno.horaFim)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {solicitacao.solicitanteNome ?? "Quem pediu"} → {solicitacao.destinatarioNome ?? "Colega"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Mudança de estado">
            <StatusBadge status={solicitacao.status} />
            <ArrowRight className="size-4 text-slate-400" aria-hidden="true" />
            <StatusBadge status={transicao.para} />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">{transicao.efeito}</p>

        {pedeMotivo && (
          <div>
            <label htmlFor="motivo" className="mb-2 block text-xs font-semibold text-slate-800">
              Motivo {motivoObrigatorio ? "" : "(opcional)"}
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              rows={3}
              maxLength={300}
              required={motivoObrigatorio}
              className="w-full resize-none rounded-xl border border-transparent bg-[#eef3fb] px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              placeholder={motivoObrigatorio ? "Explique por que a troca não foi autorizada" : "Ex.: tenho consulta nesse dia"}
            />
          </div>
        )}

        {erro && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-medium text-red-600" role="alert">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
            <span>{erro}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="h-11 cursor-pointer rounded-xl px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${BOTAO_CONFIRMAR[transicao.variante]}`}
          >
            {enviando && <Loader2 className="size-4 animate-spin" />}
            {transicao.rotulo}
          </button>
        </div>
      </form>
    </Modal>
  );
}
