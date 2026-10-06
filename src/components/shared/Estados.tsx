import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2, RefreshCw } from "lucide-react";

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-16 text-sm text-slate-500" role="status">
      <Loader2 className="size-5 animate-spin text-blue-600" aria-hidden="true" />
      {texto}
    </div>
  );
}

export function EstadoVazio({ titulo, detalhe }: { titulo: string; detalhe?: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
      <Inbox className="mb-3 size-8 text-slate-300" aria-hidden="true" />
      <p className="text-sm font-semibold text-slate-700">{titulo}</p>
      {detalhe && <p className="mt-1 max-w-sm text-sm text-slate-500">{detalhe}</p>}
    </div>
  );
}

export function EstadoDeErro({ mensagem, onTentarDeNovo }: { mensagem: string; onTentarDeNovo: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-red-100 bg-red-50 px-6 py-10 text-center" role="alert">
      <AlertCircle className="mb-2 size-7 text-red-400" aria-hidden="true" />
      <p className="max-w-md text-sm font-medium text-red-700">{mensagem}</p>
      <button
        type="button"
        onClick={onTentarDeNovo}
        className="mt-4 flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Tentar de novo
      </button>
    </div>
  );
}

export function CabecalhoDaPagina({
  titulo,
  subtitulo,
  acoes,
}: {
  titulo: string;
  subtitulo: string;
  acoes?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{titulo}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitulo}</p>
      </div>
      {acoes && <div className="flex items-center gap-2">{acoes}</div>}
    </div>
  );
}
