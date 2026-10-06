/** "2026-10-08" → "qua, 08 out" (sem deslocar o dia por fuso horário). */
export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(ano, mes - 1, dia));

  return texto.replace(/\./g, "");
}

/** "08:00", "12:00" → "08:00 – 12:00" */
export function formatarHorario(horaInicio: string, horaFim: string): string {
  return `${horaInicio} – ${horaFim}`;
}

/** ISO 8601 → "08/10 às 14:32" */
export function formatarDataHora(iso: string): string {
  const data = new Date(iso);
  const dia = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(data);
  const hora = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(data);

  return `${dia} às ${hora}`;
}

export function primeiroNome(nome: string | null | undefined): string {
  return nome?.trim().split(/\s+/)[0] ?? "";
}

/** Hoje como "YYYY-MM-DD" no fuso local (mesmo formato dos turnos). */
export function dataDeHoje(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${agora.getFullYear()}-${mes}-${dia}`;
}
