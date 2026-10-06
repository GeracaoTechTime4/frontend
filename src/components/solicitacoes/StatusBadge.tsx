import { CLASSES_DO_TOM, ESTADOS } from "@/lib/solicitacao-estado";
import type { StatusSolicitacao } from "@/services/solicitacoes";

interface StatusBadgeProps {
  status: StatusSolicitacao;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { rotulo, icone: Icone, tom } = ESTADOS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${CLASSES_DO_TOM[tom].badge} ${className}`}
    >
      <Icone className="size-3.5" aria-hidden="true" />
      {rotulo}
    </span>
  );
}
