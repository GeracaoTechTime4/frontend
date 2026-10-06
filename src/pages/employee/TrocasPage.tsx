import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CabecalhoDaPagina, Carregando, EstadoDeErro, EstadoVazio } from "@/components/shared/Estados";
import { FluxoLegenda } from "@/components/solicitacoes/FluxoLegenda";
import { SolicitacaoCard } from "@/components/solicitacoes/SolicitacaoCard";
import { useAuth } from "@/hooks/useAuth";
import { useRequest } from "@/hooks/useRequest";
import { ESTADOS } from "@/lib/solicitacao-estado";
import { listarEnviadas, listarRecebidas, type Solicitacao } from "@/services/solicitacoes";

type Aba = "recebidas" | "enviadas";

// Pedidos ainda sem desfecho primeiro; os encerrados vão para o fim.
const porAndamento = (a: Solicitacao, b: Solicitacao) => Number(ESTADOS[a.status].final) - Number(ESTADOS[b.status].final);

export default function TrocasPage() {
  const { user } = useAuth();
  const recebidas = useRequest(listarRecebidas);
  const enviadas = useRequest(listarEnviadas);
  const [aba, setAba] = useState<Aba>("recebidas");

  if (!user) return null;

  const recarregar = () => {
    void recebidas.recarregar();
    void enviadas.recarregar();
  };

  const lista = aba === "recebidas" ? recebidas : enviadas;
  const solicitacoes = [...(lista.dados ?? [])].sort(porAndamento);
  const totalParaResponder = recebidas.dados?.length ?? 0;

  const abas: { id: Aba; rotulo: string; contagem?: number }[] = [
    { id: "recebidas", rotulo: "Para eu responder", contagem: totalParaResponder },
    { id: "enviadas", rotulo: "Meus pedidos" },
  ];

  return (
    <>
      <CabecalhoDaPagina
        titulo="Trocas de turno"
        subtitulo="Responda aos pedidos que recebeu e acompanhe os que você fez."
        acoes={
          <button
            type="button"
            onClick={recarregar}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Atualizar
          </button>
        }
      />

      <div className="mb-5">
        <FluxoLegenda />
      </div>

      <div className="mb-5 flex gap-1 rounded-2xl bg-slate-100 p-1" role="tablist">
        {abas.map(({ id, rotulo, contagem }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              aba === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {rotulo}
            {contagem !== undefined && contagem > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white">{contagem}</span>
            )}
          </button>
        ))}
      </div>

      {lista.carregando && !lista.dados ? (
        <Carregando texto="Carregando solicitações..." />
      ) : lista.erro && !lista.dados ? (
        <EstadoDeErro mensagem={lista.erro} onTentarDeNovo={recarregar} />
      ) : solicitacoes.length === 0 ? (
        aba === "recebidas" ? (
          <EstadoVazio titulo="Nenhum pedido esperando sua resposta" detalhe="Quando um colega pedir para você assumir um turno, o pedido aparece aqui." />
        ) : (
          <EstadoVazio titulo="Você ainda não pediu nenhuma troca" detalhe="Vá em Meus turnos e escolha o turno que quer passar para um colega." />
        )
      ) : (
        <div className="space-y-4">
          {solicitacoes.map((solicitacao) => (
            <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} usuario={user} onMudou={recarregar} />
          ))}
        </div>
      )}
    </>
  );
}
