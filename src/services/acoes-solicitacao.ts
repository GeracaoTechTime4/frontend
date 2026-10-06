import type { Acao } from "@/lib/solicitacao-estado";
import {
  aceitarTroca,
  aprovarTroca,
  cancelarTroca,
  recusarTroca,
  rejeitarTroca,
  type Solicitacao,
} from "@/services/solicitacoes";

/** Dispara no backend a transição de estado correspondente à ação. */
export function executarAcao(acao: Acao, id: string, motivo?: string): Promise<Solicitacao> {
  switch (acao) {
    case "aceitar":
      return aceitarTroca(id);
    case "recusar":
      return recusarTroca(id, motivo);
    case "cancelar":
      return cancelarTroca(id);
    case "aprovar":
      return aprovarTroca(id);
    case "rejeitar":
      return rejeitarTroca(id, motivo ?? "");
  }
}
