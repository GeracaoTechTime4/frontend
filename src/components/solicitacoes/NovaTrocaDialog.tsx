import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { useRequest } from "@/hooks/useRequest";
import { formatarData, formatarHorario } from "@/lib/formatadores";
import { mensagemDeErro } from "@/services/api";
import { listarColegas, solicitarTroca, type Solicitacao, type Turno } from "@/services/solicitacoes";

interface NovaTrocaDialogProps {
  /** Turnos que ainda podem receber um pedido (sem pedido em aberto). */
  turnos: Turno[];
  turnoInicialId?: string;
  onClose: () => void;
  onCriada: (solicitacao: Solicitacao) => void;
}

const CAMPO =
  "h-12 w-full cursor-pointer rounded-xl border border-transparent bg-[#eef3fb] px-4 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50";

/** Cria o pedido: nasce `pendente`, aguardando o colega escolhido aceitar ou recusar. */
export function NovaTrocaDialog({ turnos, turnoInicialId, onClose, onCriada }: NovaTrocaDialogProps) {
  const { dados: colegas, erro: erroColegas, carregando } = useRequest(listarColegas);
  const [turnoId, setTurnoId] = useState(turnoInicialId ?? turnos[0]?.id ?? "");
  const [colegaId, setColegaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const colegaEscolhido = colegas?.find((colega) => colega.id === colegaId);

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro(null);

    if (!turnoId || !colegaId) {
      setErro("Escolha o turno e o colega.");
      return;
    }

    setEnviando(true);
    try {
      onCriada(await solicitarTroca(turnoId, colegaId));
    } catch (error) {
      setErro(mensagemDeErro(error));
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Pedir troca de turno" onClose={enviando ? () => undefined : onClose}>
      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="turno" className="mb-2 block text-xs font-semibold text-slate-800">
            Qual turno você quer passar?
          </label>
          <select id="turno" value={turnoId} onChange={(e) => setTurnoId(e.target.value)} className={CAMPO} required>
            {turnos.map((turno) => (
              <option key={turno.id} value={turno.id}>
                {formatarData(turno.data)} · {formatarHorario(turno.horaInicio, turno.horaFim)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="colega" className="mb-2 block text-xs font-semibold text-slate-800">
            Para quem?
          </label>
          <select
            id="colega"
            value={colegaId}
            onChange={(e) => setColegaId(e.target.value)}
            className={CAMPO}
            disabled={carregando || !!erroColegas}
            required
          >
            <option value="">{carregando ? "Carregando colegas..." : "Escolha um colega"}</option>
            {colegas?.map((colega) => (
              <option key={colega.id} value={colega.id}>
                {colega.name}
              </option>
            ))}
          </select>
          {erroColegas && <p className="mt-2 text-xs font-medium text-red-600">{erroColegas}</p>}
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          <p className="mb-1 text-xs font-semibold text-slate-800">O que acontece depois</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>
              {colegaEscolhido ? colegaEscolhido.name.split(" ")[0] : "O colega"} recebe o pedido e aceita ou recusa.
            </li>
            <li>Se aceitar, o supervisor autoriza ou não a troca.</li>
            <li>O turno só muda de dono quando o supervisor aprova.</li>
          </ol>
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
            disabled={enviando || carregando || !!erroColegas}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando && <Loader2 className="size-4 animate-spin" />}
            Enviar pedido
          </button>
        </div>
      </form>
    </Modal>
  );
}
