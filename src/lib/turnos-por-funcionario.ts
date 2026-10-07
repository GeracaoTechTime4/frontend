import type { Turno } from "@/services/solicitacoes";
import type { Funcionario } from "@/services/turnos";

export interface GrupoDeTurnos {
  funcionario: Funcionario;
  turnos: Turno[];
}

/** Mais recente primeiro: data e, no mesmo dia, hora de início, em ordem decrescente. */
export function maisRecentePrimeiro(a: Turno, b: Turno): number {
  return `${b.data}T${b.horaInicio}`.localeCompare(`${a.data}T${a.horaInicio}`);
}

/**
 * Um grupo por funcionário (em ordem alfabética), mesmo os que ainda não têm turno, para o
 * supervisor poder cadastrar o primeiro. Dentro de cada grupo, do mais recente ao mais distante.
 */
export function agruparPorFuncionario(funcionarios: Funcionario[], turnos: Turno[]): GrupoDeTurnos[] {
  const porFuncionario = new Map<string, Turno[]>();

  for (const turno of turnos) {
    porFuncionario.set(turno.funcionarioId, [...(porFuncionario.get(turno.funcionarioId) ?? []), turno]);
  }

  return [...funcionarios]
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
    .map((funcionario) => ({
      funcionario,
      turnos: (porFuncionario.get(funcionario.id) ?? []).sort(maisRecentePrimeiro),
    }));
}
