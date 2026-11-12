import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AtSign, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      const destino = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(destino, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ocorreu um erro ao tentar entrar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Quem já está logado não precisa ver o formulário.
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#f8fafc] relative overflow-hidden select-none">
      {/* Glow radial sutil de fundo para destacar o card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] bg-cyan-100/40 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Header com a Marca ScaleOps */}
      <div className="mb-7">
        <Logo size="md" />
      </div>

      {/* Card de Login */}
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] border border-slate-100/80 transition-all">
        {/* Título e Subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
            Acesse sua conta
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-normal leading-relaxed">
            Gerencie equipes, escalas e horários em um só lugar
          </p>
        </div>

        {/* Mensagem de Erro (se houver) */}
        {errorMessage && (
          <div role="alert" className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5 text-red-600 text-xs font-medium animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo E-mail */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-800 mb-2"
            >
              E-mail profissional
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.com.br"
              startIcon={<AtSign className="size-4" />}
              autoComplete="email"
              required
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-800 mb-2"
            >
              Senha corporativa
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              startIcon={<Lock className="size-4" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
              autoComplete="current-password"
              required
            />

            {/* Link Esqueceu a Senha */}
            <div className="text-right mt-2.5">
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Recurso de recuperação de senha será implementado na próxima etapa!");
                }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Esqueceu a senha?
              </a>
            </div>
          </div>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium rounded-xl text-sm transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Rodapé: Link para Cadastre-se */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Não tem uma conta?{" "}
            <Link
              to="/cadastro"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
