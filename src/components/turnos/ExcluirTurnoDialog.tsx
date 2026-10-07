import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { formatarData, formatarHorario } from "@/lib/formatadores";
import { mensagemDeErro } from "@/services/api";
import type { Turno } from "@/services/solicitacoes";
import { excluirTurno, type Funcionario } from "@/services/turnos";

interface ExcluirTurnoDialogProps {
  funcionario: Funcionario;
  turno: Turno;
  onClose: () => void;
  onExcluido: () => void;
}

export function ExcluirTurnoDialog({ funcionario, turno, onClose, onExcluido }: ExcluirTurnoDialogProps) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const excluir = async () => {
    setErro(null);
    setEnviando(true);
    try {
      await excluirTurno(turno.id);
      onExcluido();
    } catch (error) {
      setErro(mensagemDeErro(error));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Excluir turno" onClose={enviando ? () => undefined : onClose}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            {formatarData(turno.data)} · {formatarHorario(turno.horaInicio, turno.horaFim)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{funcionario.name}</p>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          O turno será removido da agenda de {funcionario.name.split(" ")[0]}. Essa ação não pode ser desfeita.
        </p>

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
            type="button"
            onClick={() => void excluir()}
            disabled={enviando}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-medium text-white shadow-md shadow-red-500/20 transition-all hover:bg-red-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Excluir
          </button>
        </div>
      </div>
    </Modal>
  );
}
