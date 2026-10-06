import {
  Ban,
  CheckCircle2,
  Hourglass,
  ShieldCheck,
  ThumbsDown,
  TimerOff,
  UserCheck,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { formatarDataHora, primeiroNome } from "@/lib/formatadores";
import type { Solicitacao, StatusSolicitacao } from "@/services/solicitacoes";

/**
 * Espelho, no frontend, da máquina de estados da solicitação de troca (lib `shift-swap`).
 * É a fonte única de verdade da tela: rótulos, cores, quem pode fazer o quê e o que cada
 * ação muda. O backend continua sendo quem valida; aqui só decidimos o que mostrar.
 *
 *   pendente ──aceitar──► aguardando_aprovacao ──aprovar──► aprovada
 *      │                          │                └─rejeitar─► rejeitada
 *      ├──recusar──► recusada     │
 *      └──cancelar / expirar ◄────┘  (cancelada, expirada)
 */

export interface Usuario {
  id: string;
  role: string;
}

export type Acao = "aceitar" | "recusar" | "cancelar" | "aprovar" | "rejeitar";

export type Tom = "ambar" | "azul" | "verde" | "vermelho" | "rosa" | "cinza";

interface InfoEstado {
  rotulo: string;
  icone: LucideIcon;
  tom: Tom;
  /** Estados finais não têm mais nenhuma ação possível. */
  final: boolean;
}

export const ESTADOS: Record<StatusSolicitacao, InfoEstado> = {
  pendente: { rotulo: "Aguardando colega", icone: Hourglass, tom: "ambar", final: false },
  aguardando_aprovacao: { rotulo: "Aguardando aprovação", icone: ShieldCheck, tom: "azul", final: false },
  aprovada: { rotulo: "Aprovada", icone: CheckCircle2, tom: "verde", final: true },
  rejeitada: { rotulo: "Rejeitada", icone: ThumbsDown, tom: "vermelho", final: true },
  recusada: { rotulo: "Recusada", icone: UserX, tom: "rosa", final: true },
  cancelada: { rotulo: "Cancelada", icone: Ban, tom: "cinza", final: true },
  expirada: { rotulo: "Expirada", icone: TimerOff, tom: "cinza", final: true },
};

/** Ordem em que os estados aparecem em filtros e legendas. */
export const ORDEM_DOS_ESTADOS: StatusSolicitacao[] = [
  "pendente",
  "aguardando_aprovacao",
  "aprovada",
  "rejeitada",
  "recusada",
  "cancelada",
  "expirada",
];

// Classes completas (e não montadas por interpolação) para o Tailwind enxergá-las.
export const CLASSES_DO_TOM: Record<Tom, { badge: string; ponto: string; faixa: string }> = {
  ambar: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    ponto: "bg-amber-500",
    faixa: "bg-amber-400",
  },
  azul: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    ponto: "bg-blue-500",
    faixa: "bg-blue-500",
  },
  verde: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ponto: "bg-emerald-500",
    faixa: "bg-emerald-500",
  },
  vermelho: {
    badge: "bg-red-50 text-red-700 border-red-200",
    ponto: "bg-red-500",
    faixa: "bg-red-500",
  },
  rosa: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    ponto: "bg-rose-400",
    faixa: "bg-rose-400",
  },
  cinza: {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    ponto: "bg-slate-400",
    faixa: "bg-slate-300",
  },
};

// ── Transições ──────────────────────────────────────────────────────────────

export interface Transicao {
  /** Texto do botão. */
  rotulo: string;
  /** Estados em que a ação pode ser feita. */
  de: StatusSolicitacao[];
  /** Estado em que a solicitação fica. */
  para: StatusSolicitacao;
  /** Quem faz a ação, em palavras. */
  quem: string;
  /** Se a ação pede um motivo. */
  motivo: "obrigatorio" | "opcional" | null;
  variante: "primaria" | "perigo" | "neutra";
  icone: LucideIcon;
  /** Pergunta do diálogo de confirmação. */
  titulo: string;
  /** O que acontece com a troca, em uma frase. */
  efeito: string;
  /** Título do aviso exibido depois que a ação dá certo. */
  sucesso: string;
}

export const TRANSICOES: Record<Acao, Transicao> = {
  aceitar: {
    rotulo: "Aceitar",
    de: ["pendente"],
    para: "aguardando_aprovacao",
    quem: "o colega que recebeu o pedido",
    motivo: null,
    variante: "primaria",
    icone: UserCheck,
    titulo: "Aceitar esta troca?",
    efeito: "O pedido segue para o supervisor autorizar. O turno só muda de dono se ele aprovar.",
    sucesso: "Troca aceita",
  },
  recusar: {
    rotulo: "Recusar",
    de: ["pendente"],
    para: "recusada",
    quem: "o colega que recebeu o pedido",
    motivo: "opcional",
    variante: "perigo",
    icone: UserX,
    titulo: "Recusar esta troca?",
    efeito: "O pedido é encerrado e o turno continua com quem pediu.",
    sucesso: "Troca recusada",
  },
  cancelar: {
    rotulo: "Cancelar pedido",
    de: ["pendente", "aguardando_aprovacao"],
    para: "cancelada",
    quem: "quem pediu a troca",
    motivo: null,
    variante: "neutra",
    icone: Ban,
    titulo: "Cancelar este pedido?",
    efeito: "O pedido é encerrado e o turno continua com você. Para trocar de novo, será preciso um novo pedido.",
    sucesso: "Pedido cancelado",
  },
  aprovar: {
    rotulo: "Aprovar",
    de: ["aguardando_aprovacao"],
    para: "aprovada",
    quem: "o supervisor",
    motivo: null,
    variante: "primaria",
    icone: CheckCircle2,
    titulo: "Aprovar esta troca?",
    efeito: "O turno passa imediatamente para o colega que aceitou. Essa decisão não pode ser desfeita.",
    sucesso: "Troca aprovada",
  },
  rejeitar: {
    rotulo: "Rejeitar",
    de: ["aguardando_aprovacao"],
    para: "rejeitada",
    quem: "o supervisor",
    motivo: "obrigatorio",
    variante: "perigo",
    icone: ThumbsDown,
    titulo: "Rejeitar esta troca?",
    efeito: "O turno continua com quem pediu. Informe o motivo para os dois funcionários saberem o porquê.",
    sucesso: "Troca rejeitada",
  },
};

/** "Aguardando colega → Aguardando aprovação" */
export function descreverTransicao(acao: Acao, de: StatusSolicitacao): string {
  return `${ESTADOS[de].rotulo} → ${ESTADOS[TRANSICOES[acao].para].rotulo}`;
}

// ── Quem é quem em cada solicitação ─────────────────────────────────────────

export type Perspectiva = "supervisor" | "solicitante" | "destinatario" | "outro";

export function perspectivaDe(solicitacao: Solicitacao, usuario: Usuario): Perspectiva {
  if (usuario.role === "SUPERVISOR") return "supervisor";
  if (usuario.id === solicitacao.solicitanteId) return "solicitante";
  if (usuario.id === solicitacao.destinatarioId) return "destinatario";
  return "outro";
}

/** Ações que o usuário pode fazer agora; reflete as regras que o backend vai conferir. */
export function acoesDisponiveis(solicitacao: Solicitacao, usuario: Usuario): Acao[] {
  const perspectiva = perspectivaDe(solicitacao, usuario);
  const { status } = solicitacao;

  if (perspectiva === "destinatario" && status === "pendente") return ["aceitar", "recusar"];
  if (perspectiva === "supervisor" && status === "aguardando_aprovacao") return ["aprovar", "rejeitar"];
  if (perspectiva === "solicitante" && (status === "pendente" || status === "aguardando_aprovacao")) {
    return ["cancelar"];
  }

  return [];
}

/** Frase que explica onde a solicitação está, do ponto de vista de quem está olhando. */
export function descricaoDoEstado(solicitacao: Solicitacao, usuario: Usuario): string {
  const perspectiva = perspectivaDe(solicitacao, usuario);
  const solicitante = primeiroNome(solicitacao.solicitanteNome) || "Quem pediu";
  const destinatario = primeiroNome(solicitacao.destinatarioNome) || "o colega";

  switch (solicitacao.status) {
    case "pendente":
      if (perspectiva === "destinatario") return `${solicitante} pediu para você assumir este turno. Aceite ou recuse.`;
      if (perspectiva === "supervisor") return `Aguardando ${destinatario} responder. Ainda não precisa da sua decisão.`;
      return `Aguardando ${destinatario} aceitar ou recusar o pedido.`;
    case "aguardando_aprovacao":
      if (perspectiva === "supervisor") return `${solicitante} e ${destinatario} combinaram a troca. Aprove ou rejeite.`;
      if (perspectiva === "destinatario") return "Você aceitou. Falta o supervisor autorizar a troca.";
      return `${destinatario} aceitou. Falta o supervisor autorizar a troca.`;
    case "aprovada":
      return `Troca autorizada: o turno agora é de ${destinatario}.`;
    case "rejeitada":
      return "O supervisor não autorizou a troca. O turno continua com quem pediu.";
    case "recusada":
      return `${destinatario} recusou o pedido. O turno continua com ${solicitante}.`;
    case "cancelada":
      return `${solicitante} cancelou o pedido.`;
    case "expirada":
      return "O turno começou antes de a troca ser concluída, então o pedido expirou.";
  }
}

// ── Linha do tempo ──────────────────────────────────────────────────────────

export type SituacaoDoPasso = "concluido" | "atual" | "futuro" | "falhou" | "interrompido" | "dispensado";

export interface Passo {
  titulo: string;
  detalhe: string;
  situacao: SituacaoDoPasso;
}

/**
 * Os três momentos de uma troca — pedido, resposta do colega, decisão do supervisor — e em
 * qual deles a solicitação está, parou ou nem chegou.
 */
export function passosDaSolicitacao(solicitacao: Solicitacao): Passo[] {
  const solicitante = primeiroNome(solicitacao.solicitanteNome) || "Quem pediu";
  const destinatario = primeiroNome(solicitacao.destinatarioNome) || "O colega";
  const { status, respondidaEm, decididoEm } = solicitacao;
  const aceitou = respondidaEm !== null && status !== "recusada";
  const encerradaSemDesfecho = status === "cancelada" || status === "expirada";
  const motivoDoFim = status === "cancelada" ? `Cancelado por ${solicitante}` : "Expirou: o turno começou";
  const quando = (iso: string | null) => (iso ? formatarDataHora(iso) : "");

  const pedido: Passo = { titulo: "Pedido enviado", detalhe: `${solicitante} → ${destinatario}`, situacao: "concluido" };

  let resposta: Passo;
  if (status === "pendente") {
    resposta = { titulo: `Resposta de ${destinatario}`, detalhe: "Aguardando aceitar ou recusar", situacao: "atual" };
  } else if (status === "recusada") {
    resposta = { titulo: `Resposta de ${destinatario}`, detalhe: `Recusou ${quando(respondidaEm)}`.trim(), situacao: "falhou" };
  } else if (aceitou) {
    resposta = { titulo: `Resposta de ${destinatario}`, detalhe: `Aceitou ${quando(respondidaEm)}`.trim(), situacao: "concluido" };
  } else {
    resposta = { titulo: `Resposta de ${destinatario}`, detalhe: motivoDoFim, situacao: "interrompido" };
  }

  let decisao: Passo;
  if (status === "aguardando_aprovacao") {
    decisao = { titulo: "Decisão do supervisor", detalhe: "Aguardando aprovar ou rejeitar", situacao: "atual" };
  } else if (status === "aprovada") {
    decisao = { titulo: "Decisão do supervisor", detalhe: `Aprovou ${quando(decididoEm)}`.trim(), situacao: "concluido" };
  } else if (status === "rejeitada") {
    decisao = { titulo: "Decisão do supervisor", detalhe: `Rejeitou ${quando(decididoEm)}`.trim(), situacao: "falhou" };
  } else if (encerradaSemDesfecho && aceitou) {
    decisao = { titulo: "Decisão do supervisor", detalhe: motivoDoFim, situacao: "interrompido" };
  } else if (status === "pendente") {
    decisao = { titulo: "Decisão do supervisor", detalhe: "Depois do aceite", situacao: "futuro" };
  } else {
    decisao = { titulo: "Decisão do supervisor", detalhe: "Não chegou a esta etapa", situacao: "dispensado" };
  }

  return [pedido, resposta, decisao];
}
