import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
}

/** Diálogo simples: fecha com Esc ou clicando fora, e trava a rolagem da página. */
export function Modal({ titulo, onClose, children }: ModalProps) {
  const tituloId = useId();

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onClose();
    };
    const overflowAnterior = document.body.style.overflow;

    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-[2px] sm:items-center animate-in fade-in duration-150"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={tituloId} className="text-lg font-bold tracking-tight text-slate-900">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
