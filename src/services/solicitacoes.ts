import { api } from "@/services/api";

export type StatusSolicitacao =
  | "pendente"
  | "aguardando_aprovacao"
  | "aprovada"
  | "rejeitada"
  | "recusada"
  | "cancelada"
  | "expirada";

export interface Turno {
  id: string;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  funcionarioId: string;
}

export interface Colega {
  id: string;
  name: string;
}

export interface Solicitacao {
  id: string;
  status: StatusSolicitacao;
  solicitanteId: string;
  solicitanteNome: string | null;
  destinatarioId: string;
  destinatarioNome: string | null;
  turno: Turno;
  respondidaEm: string | null;
  decididoPorId: string | null;
  decididoEm: string | null;
  motivo: string | null;
}

type ComSolicitacao = { solicitacao: Solicitacao };
type ComSolicitacoes = { solicitacoes: Solicitacao[] };

const BASE = "/solicitacoes-troca";

// ── Leituras ────────────────────────────────────────────────────────────────

export const listarMeusTurnos = () =>
  api<{ turnos: Turno[] }>("/turnos/meus").then((r) => r.turnos);

export const listarColegas = () =>
  api<{ colegas: Colega[] }>("/funcionarios/colegas").then((r) => r.colegas);

/** Pedidos que outros colegas fizeram a mim e que ainda esperam minha resposta. */
export const listarRecebidas = () =>
  api<ComSolicitacoes>(`${BASE}/recebidas`).then((r) => r.solicitacoes);

/** Pedidos que eu fiz, em qualquer status. */
export const listarEnviadas = () =>
  api<ComSolicitacoes>(`${BASE}/enviadas`).then((r) => r.solicitacoes);

/** Supervisor: todas as solicitações. */
export const listarTodas = () => api<ComSolicitacoes>(BASE).then((r) => r.solicitacoes);

// ── Transições de estado ────────────────────────────────────────────────────

/** (nada) → pendente */
export const solicitarTroca = (turnoId: string, destinatarioId: string) =>
  api<ComSolicitacao>(BASE, { method: "POST", body: { turnoId, destinatarioId } }).then(
    (r) => r.solicitacao,
  );

/** pendente → aguardando_aprovacao (destinatário) */
export const aceitarTroca = (id: string) =>
  api<ComSolicitacao>(`${BASE}/${id}/aceitar`, { method: "POST" }).then((r) => r.solicitacao);

/** pendente → recusada (destinatário, motivo opcional) */
export const recusarTroca = (id: string, motivo?: string) =>
  api<ComSolicitacao>(`${BASE}/${id}/recusar`, { method: "POST", body: { motivo } }).then(
    (r) => r.solicitacao,
  );

/** pendente | aguardando_aprovacao → cancelada (solicitante) */
export const cancelarTroca = (id: string) =>
  api<ComSolicitacao>(`${BASE}/${id}/cancelar`, { method: "POST" }).then((r) => r.solicitacao);

/** aguardando_aprovacao → aprovada (supervisor) */
export const aprovarTroca = (id: string) =>
  api<ComSolicitacao>(`${BASE}/${id}/aprovar`, { method: "POST" }).then((r) => r.solicitacao);

/** aguardando_aprovacao → rejeitada (supervisor, motivo obrigatório) */
export const rejeitarTroca = (id: string, motivo: string) =>
  api<ComSolicitacao>(`${BASE}/${id}/rejeitar`, { method: "POST", body: { motivo } }).then(
    (r) => r.solicitacao,
  );
