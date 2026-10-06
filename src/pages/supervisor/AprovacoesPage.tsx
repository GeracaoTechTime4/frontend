import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { CabecalhoDaPagina, Carregando, EstadoDeErro, EstadoVazio } from "@/components/shared/Estados";
import { FluxoLegenda } from "@/components/solicitacoes/FluxoLegenda";
import { SolicitacaoCard } from "@/components/solicitacoes/SolicitacaoCard";
import { useAuth } from "@/hooks/useAuth";
import { useRequest } from "@/hooks/useRequest";
import { CLASSES_DO_TOM, ESTADOS, ORDEM_DOS_ESTADOS } from "@/lib/solicitacao-estado";
import { listarTodas, type StatusSolicitacao } from "@/services/solicitacoes";

type Filtro = StatusSolicitacao | "todas";

const TEXTO_VAZIO: Partial<Record<Filtro, string>> = {
  aguardando_aprovacao: "Nenhuma troca aguardando a sua decisão.",
  pendente: "Nenhum pedido esperando a resposta de um colega.",
};

export default function AprovacoesPage() {
  const { user } = useAuth();
  const todas = useRequest(listarTodas);
  const [filtro, setFiltro] = useState<Filtro>("aguardando_aprovacao");

  if (!user) return null;

  const solicitacoes = todas.dados ?? [];
  const contagem = (status: Filtro) =>
    status === "todas" ? solicitacoes.length : solicitacoes.filter((s) => s.status === status).length;
  const visiveis = filtro === "todas" ? solicitacoes : solicitacoes.filter((s) => s.status === filtro);
  const aguardandoDecisao = contagem("aguardando_aprovacao");

  const filtros: Filtro[] = ["aguardando_aprovacao", ...ORDEM_DOS_ESTADOS.filter((s) => s !== "aguardando_aprovacao"), "todas"];

  return (
    <>
      <CabecalhoDaPagina
        titulo="Aprovações"
        subtitulo={
          aguardandoDecisao > 0
            ? `${aguardandoDecisao} ${aguardandoDecisao === 1 ? "troca espera" : "trocas esperam"} a sua decisão.`
            : "Nenhuma troca espera a sua decisão agora."
        }
        acoes={
          <button
            type="button"
            onClick={() => void todas.recarregar()}
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

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por estado">
        {filtros.map((item) => {
          const ativo = filtro === item;
          const tom = item === "todas" ? null : CLASSES_DO_TOM[ESTADOS[item].tom];

          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setFiltro(item)}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                ativo
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tom && <span className={`size-2 rounded-full ${tom.ponto}`} aria-hidden="true" />}
              {item === "todas" ? "Todas" : ESTADOS[item].rotulo}
              <span className={`text-xs font-bold ${ativo ? "text-white/70" : "text-slate-400"}`}>{contagem(item)}</span>
            </button>
          );
        })}
      </div>

      {todas.carregando && !todas.dados ? (
        <Carregando texto="Carregando solicitações..." />
      ) : todas.erro && !todas.dados ? (
        <EstadoDeErro mensagem={todas.erro} onTentarDeNovo={() => void todas.recarregar()} />
      ) : visiveis.length === 0 ? (
        <EstadoVazio titulo={TEXTO_VAZIO[filtro] ?? "Nenhuma solicitação neste estado."} />
      ) : (
        <div className="space-y-4">
          {visiveis.map((solicitacao) => (
            <SolicitacaoCard
              key={solicitacao.id}
              solicitacao={solicitacao}
              usuario={user}
              onMudou={() => void todas.recarregar()}
            />
          ))}
        </div>
      )}
    </>
  );
}
