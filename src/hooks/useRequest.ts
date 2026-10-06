import { useCallback, useEffect, useState } from "react";
import { mensagemDeErro } from "@/services/api";

interface EstadoDaRequisicao<T> {
  dados: T | null;
  erro: string | null;
  carregando: boolean;
}

/**
 * Carrega dados ao montar e permite recarregar. `carregar` precisa ser estável (uma função
 * de módulo, como as de `services/`), senão a requisição se repete a cada render.
 */
export function useRequest<T>(carregar: () => Promise<T>) {
  const [estado, setEstado] = useState<EstadoDaRequisicao<T>>({ dados: null, erro: null, carregando: true });

  const recarregar = useCallback(async () => {
    try {
      const dados = await carregar();
      setEstado({ dados, erro: null, carregando: false });
    } catch (error) {
      setEstado((atual) => ({ dados: atual.dados, erro: mensagemDeErro(error), carregando: false }));
    }
  }, [carregar]);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { ...estado, recarregar };
}
