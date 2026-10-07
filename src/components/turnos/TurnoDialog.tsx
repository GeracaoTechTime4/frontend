import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { mensagemDeErro } from "@/services/api";
import type { Turno } from "@/services/solicitacoes";
import { cadastrarTurno, editarTurno, type Funcionario } from "@/services/turnos";

interface TurnoDialogProps {
  funcionario: Funcionario;
  /** Sem turno = cadastro; com turno = edição do horário. */
  turno?: Turno;
  onClose: () => void;
  onSalvo: (turno: Turno, novo: boolean) => void;
}

const CAMPO =
  "h-12 w-full rounded-xl border border-transparent bg-[#eef3fb] px-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50";

export function TurnoDialog({ funcionario, turno, onClose, onSalvo }: TurnoDialogProps) {
  const [data, setData] = useState(turno?.data ?? "");
  const [horaInicio, setHoraInicio] = useState(turno?.horaInicio ?? "08:00");
  const [horaFim, setHoraFim] = useState(turno?.horaFim ?? "16:00");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const salvar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro(null);

    if (!data || !horaInicio || !horaFim) {
      setErro("Preencha a data e os horários.");
      return;
    }
    if (horaFim <= horaInicio) {
      setErro("A hora de fim deve ser depois da hora de início.");
      return;
    }

    setEnviando(true);
    try {
      const dados = { data, horaInicio, horaFim };
      const salvo = turno ? await editarTurno(turno.id, dados) : await cadastrarTurno(funcionario.id, dados);
      onSalvo(salvo, !turno);
    } catch (error) {
      setErro(mensagemDeErro(error));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo={turno ? "Editar turno" : "Novo turno"} onClose={enviando ? () => undefined : onClose}>
      <form onSubmit={salvar} className="space-y-4">
        <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
          Funcionário: <span className="font-semibold text-slate-900">{funcionario.name}</span>
        </p>

        <div>
          <label htmlFor="turno-data" className="mb-2 block text-xs font-semibold text-slate-800">
            Data
          </label>
          <input
            id="turno-data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className={CAMPO}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="turno-inicio" className="mb-2 block text-xs font-semibold text-slate-800">
              Início
            </label>
            <input
              id="turno-inicio"
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className={CAMPO}
              required
            />
          </div>
          <div>
            <label htmlFor="turno-fim" className="mb-2 block text-xs font-semibold text-slate-800">
              Fim
            </label>
            <input
              id="turno-fim"
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className={CAMPO}
              required
            />
          </div>
        </div>

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
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando && <Loader2 className="size-4 animate-spin" />}
            {turno ? "Salvar" : "Cadastrar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
