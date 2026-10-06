import { createContext } from "react";

export interface Aviso {
  tipo: "sucesso" | "erro";
  titulo: string;
  detalhe?: string;
}

export interface ToastContextValue {
  avisar: (aviso: Aviso) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
