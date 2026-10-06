import { useMemo, useState } from "react";
import { ArrowRight, Repeat2 } from "lucide-react";
import { Link } from "react-router-dom";
import { CabecalhoDaPagina, Carregando, EstadoDeErro, EstadoVazio } from "@/components/shared/Estados";
import { NovaTrocaDialog } from "@/components/solicitacoes/NovaTrocaDialog";
import { StatusBadge } from "@/components/solicitacoes/StatusBadge";
import { useRequest } from "@/hooks/useRequest";
import { useToast } from "@/hooks/useToast";
import { dataDeHoje, formatarData, formatarHorario, primeiroNome } from "@/lib/formatadores";
import { listarEnviadas, listarMeusTurnos, type Solicitacao } from "@/services/solicitacoes";

export default function MeusTurnosPage() {
  const turnos = useRequest(listarMeusTurnos);
  const enviadas = useRequest(listarEnviadas);
  const { avisar } = useToast();
  const [dialogo, setDialogo] = useState<{ turnoId?: string } | null>(null);

  const hoje = dataDeHoje();

  // Um turno com pedido em aberto (pendente ou aguardando aprovação) não aceita outro pedido.
  const pedidoEmAberto = useMemo(() => {
    const porTurno = new Map<string, Solicitacao>();
    for (const solicitacao of enviadas.dados ?? []) {
      if (solicitacao.status === "pendente" || solicitacao.status === "aguardando_aprovacao") {
        porTurno.set(solicitacao.turno.id, solicitacao);
      }
    }
    return porTurno;
  }, [enviadas.dados]);

  const turnosLivres = (turnos.dados ?? []).filter((turno) => turno.data >= hoje && !pedidoEmAberto.has(turno.id));

  const recarregar = () => {
    void turnos.recarregar();
    void enviadas.recarregar();
  };

  const pedidoCriado = (solicitacao: Solicitacao) => {
    setDialogo(null);
    avisar({
      tipo: "sucesso",
      titulo: "Pedido enviado",
      detalhe: `${primeiroNome(solicitacao.destinatarioNome)} precisa aceitar ou recusar. Estado: Aguardando colega.`,
    });
    recarregar();
  };

  const carregando = turnos.carregando || enviadas.carregando;
  const erro = turnos.erro ?? enviadas.erro;

  return (
    <>
      <CabecalhoDaPagina
        titulo="Meus turnos"
        subtitulo="Escolha um turno para pedir a troca a um colega."
        acoes={
          <button
            type="button"
            onClick={() => setDialogo({})}
            disabled={turnosLivres.length === 0}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Repeat2 className="size-4" aria-hidden="true" />
            Pedir troca
          </button>
        }
      />

      {carregando && !turnos.dados ? (
        <Carregando texto="Carregando seus turnos..." />
      ) : erro && !turnos.dados ? (
        <EstadoDeErro mensagem={erro} onTentarDeNovo={recarregar} />
      ) : turnos.dados?.length === 0 ? (
        <EstadoVazio titulo="Você não tem turnos" detalhe="Quando o supervisor cadastrar turnos para você, eles aparecem aqui." />
      ) : (
        <ul className="space-y-3">
          {turnos.dados?.map((turno) => {
            const pedido = pedidoEmAberto.get(turno.id);
            const passou = turno.data < hoje;

            return (
              <li
                key={turno.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${
                  passou ? "opacity-60" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold tracking-tight text-slate-900">{formatarData(turno.data)}</p>
                  <p className="text-sm text-slate-500">{formatarHorario(turno.horaInicio, turno.horaFim)}</p>
                </div>

                {pedido ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Pedido para {primeiroNome(pedido.destinatarioNome)}
                    </span>
                    <StatusBadge status={pedido.status} />
                    <Link
                      to="/trocas"
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Acompanhar <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                ) : passou ? (
                  <span className="text-xs font-medium text-slate-400">Já passou</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDialogo({ turnoId: turno.id })}
                    className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Repeat2 className="size-4" aria-hidden="true" />
                    Pedir troca
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {dialogo && (
        <NovaTrocaDialog
          turnos={turnosLivres}
          turnoInicialId={dialogo.turnoId}
          onClose={() => setDialogo(null)}
          onCriada={pedidoCriado}
        />
      )}
    </>
  );
}
