import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { ToastContext, type Aviso } from "@/contexts/toast-context";

interface AvisoNaTela extends Aviso {
  id: number;
}

const DURACAO_MS = 7000;

/** Avisos curtos no canto da tela, usados para confirmar cada mudança de estado. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<AvisoNaTela[]>([]);
  const proximoId = useRef(0);

  const fechar = useCallback((id: number) => {
    setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
  }, []);

  const avisar = useCallback(
    (aviso: Aviso) => {
      const id = proximoId.current++;
      setAvisos((atuais) => [...atuais, { ...aviso, id }]);
      setTimeout(() => fechar(id), DURACAO_MS);
    },
    [fechar],
  );

  const value = useMemo(() => ({ avisar }), [avisar]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-[4.75rem] right-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
              aviso.tipo === "sucesso" ? "border-emerald-200" : "border-red-200"
            }`}
          >
            {aviso.tipo === "sucesso" ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{aviso.titulo}</p>
              {aviso.detalhe && <p className="mt-0.5 text-xs text-slate-500">{aviso.detalhe}</p>}
            </div>
            <button
              type="button"
              onClick={() => fechar(aviso.id)}
              className="cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600"
              aria-label="Fechar aviso"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
