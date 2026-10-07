import { api } from "@/services/api";
import type { Turno } from "@/services/solicitacoes";

export interface Funcionario {
  id: string;
  name: string;
  email: string;
}

export interface DadosDoTurno {
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
}

// Rotas exclusivas do supervisor.

export const listarTodosOsTurnos = () => api<{ turnos: Turno[] }>("/turnos").then((r) => r.turnos);

export const listarFuncionarios = () =>
  api<{ funcionarios: Funcionario[] }>("/funcionarios").then((r) => r.funcionarios);

export const cadastrarTurno = (funcionarioId: string, dados: DadosDoTurno) =>
  api<{ turno: Turno }>("/turnos", { method: "POST", body: { funcionarioId, ...dados } }).then((r) => r.turno);

export const editarTurno = (id: string, dados: DadosDoTurno) =>
  api<{ turno: Turno }>(`/turnos/${id}`, { method: "PUT", body: dados }).then((r) => r.turno);

export const excluirTurno = (id: string) => api<null>(`/turnos/${id}`, { method: "DELETE" });
