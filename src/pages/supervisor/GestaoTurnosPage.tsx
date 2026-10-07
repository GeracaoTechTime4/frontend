import { useMemo, useState } from "react";
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { CabecalhoDaPagina, Carregando, EstadoDeErro, EstadoVazio } from "@/components/shared/Estados";
import { ExcluirTurnoDialog } from "@/components/turnos/ExcluirTurnoDialog";
import { TurnoDialog } from "@/components/turnos/TurnoDialog";
import { useRequest } from "@/hooks/useRequest";
import { useToast } from "@/hooks/useToast";
import { dataDeHoje, formatarData, formatarHorario } from "@/lib/formatadores";
import { agruparPorFuncionario } from "@/lib/turnos-por-funcionario";
import type { Turno } from "@/services/solicitacoes";
import { listarFuncionarios, listarTodosOsTurnos, type Funcionario } from "@/services/turnos";

type Dialogo =
  | { tipo: "novo"; funcionario: Funcionario }
  | { tipo: "editar"; funcionario: Funcionario; turno: Turno }
  | { tipo: "excluir"; funcionario: Funcionario; turno: Turno };

// Os dois juntos: um grupo por funcionário, inclusive os que ainda não têm turno.
async function carregarTudo() {
  const [funcionarios, turnos] = await Promise.all([listarFuncionarios(), listarTodosOsTurnos()]);
  return { funcionarios, turnos };
}

export default function GestaoTurnosPage() {
  const { dados, erro, carregando, recarregar } = useRequest(carregarTudo);
  const { avisar } = useToast();
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const grupos = useMemo(
    () => (dados ? agruparPorFuncionario(dados.funcionarios, dados.turnos) : []),
    [dados],
  );
  const hoje = dataDeHoje();

  // Grupos recolhidos (por id do funcionário); todos começam expandidos.
  const [recolhido, setRecolhido] = useState<ReadonlySet<string>>(new Set());
  const alternar = (id: string) =>
    setRecolhido((atual) => {
      const proximo = new Set(atual);
      if (!proximo.delete(id)) proximo.add(id);
      return proximo;
    });
  const todosRecolhidos = grupos.length > 0 && recolhido.size >= grupos.length;
  const alternarTodos = () => setRecolhido(todosRecolhidos ? new Set() : new Set(grupos.map((g) => g.funcionario.id)));

  const fechar = () => setDialogo(null);

  const salvo = (turno: Turno, novo: boolean) => {
    fechar();
    avisar({
      tipo: "sucesso",
      titulo: novo ? "Turno cadastrado" : "Turno atualizado",
      detalhe: `${formatarData(turno.data)} · ${formatarHorario(turno.horaInicio, turno.horaFim)}`,
    });
    void recarregar();
  };

  const excluido = () => {
    fechar();
    avisar({ tipo: "sucesso", titulo: "Turno excluído" });
    void recarregar();
  };

  return (
    <>
      <CabecalhoDaPagina
        titulo="Turnos"
        subtitulo="Cadastre, edite e exclua os turnos de cada funcionário. Do mais recente ao mais distante."
        acoes={
          <>
            {grupos.length > 1 && (
              <button
                type="button"
                onClick={alternarTodos}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {todosRecolhidos ? (
                  <ChevronsUpDown className="size-4" aria-hidden="true" />
                ) : (
                  <ChevronsDownUp className="size-4" aria-hidden="true" />
                )}
                {todosRecolhidos ? "Expandir todos" : "Recolher todos"}
              </button>
            )}
          <button
            type="button"
            onClick={() => void recarregar()}
            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Atualizar
          </button>
          </>
        }
      />

      {carregando && !dados ? (
        <Carregando texto="Carregando turnos..." />
      ) : erro && !dados ? (
        <EstadoDeErro mensagem={erro} onTentarDeNovo={() => void recarregar()} />
      ) : grupos.length === 0 ? (
        <EstadoVazio titulo="Nenhum funcionário cadastrado" detalhe="Cadastre funcionários para poder criar turnos." />
      ) : (
        <div className="space-y-6">
          {grupos.map(({ funcionario, turnos }) => (
            <section key={funcionario.id} aria-labelledby={`func-${funcionario.id}`}>
              <div className={`flex flex-wrap items-center justify-between gap-3 ${recolhido.has(funcionario.id) ? "" : "mb-3"}`}>
                <h2 id={`func-${funcionario.id}`} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => alternar(funcionario.id)}
                    aria-expanded={!recolhido.has(funcionario.id)}
                    aria-controls={`turnos-${funcionario.id}`}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg py-1 pr-2 text-left transition-colors hover:bg-slate-100"
                  >
                    <ChevronDown
                      className={`size-5 shrink-0 text-slate-400 transition-transform ${
                        recolhido.has(funcionario.id) ? "-rotate-90" : ""
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-base font-bold tracking-tight text-slate-900">
                        {funcionario.name}
                      </span>
                      <span className="block text-xs font-normal text-slate-500">
                        {funcionario.email} · {turnos.length} {turnos.length === 1 ? "turno" : "turnos"}
                      </span>
                    </span>
                  </button>
                </h2>
                <button
                  type="button"
                  onClick={() => setDialogo({ tipo: "novo", funcionario })}
                  className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-[0.99]"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Novo turno
                </button>
              </div>

              {recolhido.has(funcionario.id) ? null : turnos.length === 0 ? (
                <p
                  id={`turnos-${funcionario.id}`}
                  className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-5 text-center text-sm text-slate-500"
                >
                  Nenhum turno cadastrado.
                </p>
              ) : (
                <ul id={`turnos-${funcionario.id}`} className="space-y-2">
                  {turnos.map((turno) => (
                    <li
                      key={turno.id}
                      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${
                        turno.data < hoje ? "opacity-60" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold tracking-tight text-slate-900">{formatarData(turno.data)}</p>
                        <p className="text-sm text-slate-500">{formatarHorario(turno.horaInicio, turno.horaFim)}</p>
                      </div>
                      {turno.data < hoje && <span className="text-xs font-medium text-slate-400">Já passou</span>}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDialogo({ tipo: "editar", funcionario, turno })}
                          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          aria-label={`Editar turno de ${formatarData(turno.data)}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDialogo({ tipo: "excluir", funcionario, turno })}
                          className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                          aria-label={`Excluir turno de ${formatarData(turno.data)}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {dialogo?.tipo === "novo" && <TurnoDialog funcionario={dialogo.funcionario} onClose={fechar} onSalvo={salvo} />}
      {dialogo?.tipo === "editar" && (
        <TurnoDialog funcionario={dialogo.funcionario} turno={dialogo.turno} onClose={fechar} onSalvo={salvo} />
      )}
      {dialogo?.tipo === "excluir" && (
        <ExcluirTurnoDialog
          funcionario={dialogo.funcionario}
          turno={dialogo.turno}
          onClose={fechar}
          onExcluido={excluido}
        />
      )}
    </>
  );
}
