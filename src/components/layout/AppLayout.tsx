import { CalendarDays, LogOut, Repeat2, ShieldCheck } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";

const ROTULO_DO_PAPEL: Record<string, string> = {
  SUPERVISOR: "Supervisor",
  EMPLOYEE: "Funcionário",
  ADMINISTRATOR: "Administrador",
};

const LINKS_POR_PAPEL = {
  EMPLOYEE: [
    { to: "/turnos", rotulo: "Meus turnos", icone: CalendarDays },
    { to: "/trocas", rotulo: "Trocas", icone: Repeat2 },
  ],
  SUPERVISOR: [
    { to: "/aprovacoes", rotulo: "Aprovações", icone: ShieldCheck },
    { to: "/gestao-turnos", rotulo: "Turnos", icone: CalendarDays },
  ],
} as const;

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const links = user.role === "SUPERVISOR" ? LINKS_POR_PAPEL.SUPERVISOR : LINKS_POR_PAPEL.EMPLOYEE;
  const inicial = (user.name || user.email).trim().charAt(0).toUpperCase();

  const sair = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Logo size="sm" />

          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto" aria-label="Principal">
            {links.map(({ to, rotulo, icone: Icone }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icone className="size-4" />
                {rotulo}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-slate-900">{user.name || user.email}</p>
              <p className="text-xs text-slate-500">{ROTULO_DO_PAPEL[user.role] ?? user.role}</p>
            </div>
            <div
              className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {inicial}
            </div>
            <button
              type="button"
              onClick={sair}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
