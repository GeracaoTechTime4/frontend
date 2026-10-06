import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import MeusTurnosPage from "@/pages/employee/MeusTurnosPage";
import TrocasPage from "@/pages/employee/TrocasPage";
import AprovacoesPage from "@/pages/supervisor/AprovacoesPage";

/** Cada papel começa na tela em que mais age. */
function Inicio() {
  const { user } = useAuth();

  return <Navigate to={user?.role === "SUPERVISOR" ? "/aprovacoes" : "/trocas"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/register" element={<Navigate to="/cadastro" replace />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Inicio />} />

            <Route element={<ProtectedRoute roles={["EMPLOYEE"]} />}>
              <Route path="/turnos" element={<MeusTurnosPage />} />
              <Route path="/trocas" element={<TrocasPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["SUPERVISOR"]} />}>
              <Route path="/aprovacoes" element={<AprovacoesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
